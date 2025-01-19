import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';

// Your IOUMint factory address
const IOUMintAddress = '0xF721090A0048B0265ce758ab57074d778DB68AAd';

const IOUMintABI = [
  'function deployLoan(address, address, uint256, uint256, uint256, address, string, string) external returns (address)',
  'function getAllLoans() external view returns (address[])',
  'function getUserLoans(address) external view returns (address[])',
  'function getUserIOUs(address) external view returns (address[])',
  'function getSpotInfo(address[] memory, address) external view returns ( \
    tuple( \
      address loanAddress, \
      address borrower, \
      uint256 loanGoal, \
      uint256 totalFunded, \
      uint256 totalDrawnDown, \
      uint256 accruedInterest, \
      uint256 annualInterestRate, \
      uint256 platformFeeRate, \
      address feeAddress, \
      uint256 totalSupply, \
      string iouName, \
      string iouSymbol, \
      address underlying, \
      string underlyingName, \
      string underlyingSymbol, \
      uint8 underlyingDecimals, \
      uint256 updatedInterest, \
      uint256 updatedTotalOwed, \
      uint256 myIOUs, \
      uint256 repayments, \
      uint256 interestrepayments, \
    )[] memory)'
];

const SpotIOULoanABI = [
  'function fundLoan(uint256) external',
  'function drawDown(uint256) external',
  'function repayLoan(uint256) external',
  'function redeemIOUs(uint256) external',
  'function loanToken() external view returns (address)',
  'function borrower() external view returns (address)',
  'function loanGoal() external view returns (uint256)',
  'function totalFunded() external view returns (uint256)',
  'function annualInterestRate() external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
];

const SpotIOUFactory = () => {
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address: userAddress } = useAccount();
  const chainId = useChainId();

  const [myLoans, setMyLoans] = useState([]);
  const [myIOUs, setMyIOUs] = useState([]);
  const [allLoans, setAllLoans] = useState([]);

  // Deploy fields
  const [loanToken, setLoanToken] = useState('');
  const [borrower, setBorrower] = useState('');
  const [loanGoal, setLoanGoal] = useState('');
  const [annualInterestRate, setAnnualInterestRate] = useState('');
  const [platformFeeRate, setPlatformFeeRate] = useState('');
  const [feeAddress, setFeeAddress] = useState('');
  const [iouName, setIouName] = useState('');
  const [iouSymbol, setIouSymbol] = useState('');

  // Single input for user actions
  const [actionAmount, setActionAmount] = useState('');

  const IOUMintContract = new ethers.Contract(IOUMintAddress, IOUMintABI, provider);

  useEffect(() => {
    if (!provider || !userAddress) return;
    fetchAllData();
  }, [provider, userAddress]);

  // Grab arrays & map details
  const fetchAllData = async () => {
    try {
      const [...myLoansArr] = await IOUMintContract.getUserLoans(userAddress);
      const [...myIOUsArr] = await IOUMintContract.getUserIOUs(userAddress);
      const [...allLoansArr] = await IOUMintContract.getAllLoans();

      const myLoansInfo = await fetchLoanInfo(myLoansArr);
      const myIOUsInfo = await fetchLoanInfo(myIOUsArr);
      const allLoansInfo = await fetchLoanInfo(allLoansArr);

      setMyLoans(myLoansInfo);
      setMyIOUs(myIOUsInfo);
      setAllLoans(allLoansInfo);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch loans');
    }
  };

  const fetchLoanInfo = async (loans) => {
    if (!loans || loans.length === 0) return [];
    try {
      const data = await IOUMintContract.getSpotInfo(loans, userAddress);
      return data.map((info) => ({
        loanAddress: info.loanAddress,
        borrower: info.borrower,
        loanGoal: ethers.formatUnits(info.loanGoal, info.underlyingDecimals),
        totalFunded: ethers.formatUnits(info.totalFunded, info.underlyingDecimals),
        totalDrawnDown: ethers.formatUnits(info.totalDrawnDown, info.underlyingDecimals),
        accruedInterest: ethers.formatUnits(info.accruedInterest, info.underlyingDecimals),
        annualInterestRate: Number(info.annualInterestRate),
        platformFeeRate: Number(info.platformFeeRate),
        feeAddress: info.feeAddress,
        iouName: info.iouName,
        iouSymbol: info.iouSymbol,
        underlying: info.underlying,
        underlyingName: info.underlyingName,
        underlyingSymbol: info.underlyingSymbol,
        underlyingDecimals: info.underlyingDecimals,
        updatedInterest: ethers.formatUnits(info.updatedInterest, info.underlyingDecimals),
        updatedTotalOwed: ethers.formatUnits(info.updatedTotalOwed, info.underlyingDecimals),
        myIOUs: ethers.formatUnits(info.myIOUs, 18),
        repayments: info.repayments
          ? ethers.formatUnits(info.repayments, info.underlyingDecimals)
          : '0',
        interestrepayments: info.interestrepayments
          ? ethers.formatUnits(info.interestrepayments, info.underlyingDecimals)
          : '0',
          totalSupply: ethers.formatUnits(info.totalSupply, 18)
      }));
    } catch (err) {
      console.error(err);
      toast.error('Error fetching loan details');
      return [];
    }
  };

  // Deploy new
  const deployNewLoan = async () => {
    if (!signer) {
      toast.error('Connect wallet first.');
      return;
    }
    if (!loanToken || !borrower || !loanGoal) {
      toast.error('Please fill in the required fields.');
      return;
    }

    try {
      const factoryWithSigner = IOUMintContract.connect(signer);

      // Resolve borrower if ENS
      let finalBorrower = borrower;
      if (!ethers.isAddress(borrower)) {
        const resolved = await provider.resolveName(borrower);
        if (!resolved) throw new Error('Could not resolve borrower ENS');
        finalBorrower = resolved;
      }

      let finalFeeAddr = feeAddress;
      if (!finalFeeAddr) {
        finalFeeAddr = '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5';
      }
      if (!ethers.isAddress(finalFeeAddr)) {
        const resolvedFee = await provider.resolveName(finalFeeAddr);
        if (!resolvedFee) throw new Error('Could not resolve fee ENS');
        finalFeeAddr = resolvedFee;
      }

      let decimals = 18;
      if (ethers.isAddress(loanToken) && loanToken !== ethers.ZeroAddress) {
        try {
          const token = new ethers.Contract(loanToken, tokenABI, provider);
          decimals = await token.decimals();
        } catch {
          console.log('Default 18 decimals');
        }
      }

      const _loanGoal = ethers.parseUnits(loanGoal, decimals);
      const _annual = parseInt(annualInterestRate) || 0;
      const _platform = parseInt(platformFeeRate) || 0;

      const tx = await factoryWithSigner.deployLoan(
        loanToken,
        finalBorrower,
        _loanGoal,
        _annual,
        _platform,
        finalFeeAddr,
        iouName || 'SpotIOU',
        iouSymbol || 'IOU'
      );
      await tx.wait();

      toast.success('Loan deployed! Refreshing...');
      setTimeout(fetchAllData, 3000);
    } catch (err) {
      console.error(err);
      toast.error('Error deploying new loan');
    }
  };

  // SpotIOULoan interactions
  const getLoanContract = (loanAddress) =>
    new ethers.Contract(loanAddress, SpotIOULoanABI, signer || provider);

  const fundLoan = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Fund amount must be > 0');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const underlying = await loan.loanToken();

      if (underlying !== ethers.ZeroAddress) {
        const tok = new ethers.Contract(underlying, tokenABI, signer);
        const decimals = await tok.decimals();
        const parsed = ethers.parseUnits(amount, decimals);

        // check allowance
        const allowance = await tok.allowance(userAddress, loanAddress);
        if (allowance < parsed) {
          const approveTx = await tok.approve(loanAddress, parsed);
          await approveTx.wait();
        }

        const tx = await loan.fundLoan(parsed);
        await tx.wait();

        toast.success('Funded loan successfully');
        fetchAllData();
      } else {
        toast.error('Native asset not handled in this snippet.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error funding loan.');
    }
  };

  const drawDown = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const underlying = await loan.loanToken();

      let decimals = 18;
      if (underlying !== ethers.ZeroAddress) {
        const tok = new ethers.Contract(underlying, tokenABI, provider);
        decimals = await tok.decimals();
      }

      const parsed = amount && Number(amount) > 0
        ? ethers.parseUnits(amount, decimals)
        : 0n;

      const tx = await loan.drawDown(parsed);
      await tx.wait();

      toast.success('Drawdown successful');
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error drawing down.');
    }
  };

  const repayLoan = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Repay amount must be > 0');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const underlying = await loan.loanToken();

      if (underlying !== ethers.ZeroAddress) {
        const tok = new ethers.Contract(underlying, tokenABI, signer);
        const decimals = await tok.decimals();
        const parsed = ethers.parseUnits(amount, decimals);

        // approve if needed
        const allowance = await tok.allowance(userAddress, loanAddress);
        if (allowance < parsed) {
          const approveTx = await tok.approve(loanAddress, parsed);
          await approveTx.wait();
        }

        const tx = await loan.repayLoan(parsed);
        await tx.wait();

        toast.success('Repayment successful');
        fetchAllData();
      } else {
        toast.error('Native asset flow not handled.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error repaying loan.');
    }
  };

  const redeemIOUs = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Redeem amount must be > 0');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const decimals = await loan.decimals();
      const parsed = ethers.parseUnits(amount, decimals);

      const tx = await loan.redeemIOUs(parsed);
      await tx.wait();

      toast.success('IOUs redeemed successfully');
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error redeeming IOUs.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200 flex flex-col items-center pb-10 px-4">
      <Toaster />

      {/* Deploy a new IOU */}
      <div className="max-w-xl w-full mt-10 p-6 md:p-8 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                      ring-1 ring-[#36444c] hover:scale-105 transform transition duration-300">
        <h1 className="text-blue-400 text-3xl font-bold mt-2 mb-4 uppercase tracking-wide">
          Mint an IOU
        </h1>

        <div className="w-full space-y-4 text-left">
          {/* Loan Token */}
          <div>
            <label className="block font-semibold text-gray-200 mb-1">
              🪙 ERC20 Token Address:
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={loanToken}
              onChange={(e) => setLoanToken(e.target.value)}
            />
          </div>

          {/* Borrower */}
          <div>
            <label className="block font-semibold text-gray-200 mb-1">
              🤝 Borrower Address / ENS:
            </label>
            <input
              type="text"
              placeholder="0x... or user.eth"
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
            />
          </div>

          {/* Loan Goal */}
          <div>
            <label className="block font-semibold text-gray-200 mb-1">
              🎯 Loan Goal:
            </label>
            <input
              type="text"
              placeholder="1000"
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={loanGoal}
              onChange={(e) => setLoanGoal(e.target.value)}
            />
          </div>

          {/* Annual + Fee */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                📊 Annual Interest Rate (bps):
              </label>
              <input
                type="text"
                placeholder="500 = 5%"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                💹 Platform Fee (bps):
              </label>
              <input
                type="text"
                placeholder="50 = 0.5%"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={platformFeeRate}
                onChange={(e) => setPlatformFeeRate(e.target.value)}
              />
            </div>
          </div>

          {/* IOU name/symbol */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                🏷 IOU Name:
              </label>
              <input
                type="text"
                placeholder="SpotIOU"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={iouName}
                onChange={(e) => setIouName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                🔖 IOU Symbol:
              </label>
              <input
                type="text"
                placeholder="IOU"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={iouSymbol}
                onChange={(e) => setIouSymbol(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={deployNewLoan}
            className="w-full py-2 bg-blue-400 hover:bg-[#356195] text-white font-semibold rounded-full transition
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Deploy Loan
          </button>
        </div>

        <div className="mt-4">
          <ConnectButton />
        </div>
      </div>

      {/* My Loans */}
      <div className="max-w-2xl w-full mt-8 p-6 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                     ring-1 ring-[#36444c] transition-transform duration-300 hover:scale-105">
        <h1 className="text-blue-400 text-2xl font-bold mb-4 uppercase">🌟 My Loans</h1>
        {myLoans.length === 0 && <p className="text-gray-400">No loans found.</p>}

        {myLoans.map((info) => {
          const isBorrower = userAddress?.toLowerCase() === info.borrower.toLowerCase();
          let progressPercent = 0;
          try {
            const goal = parseFloat(info.loanGoal || '0');
            const funded = parseFloat(info.totalFunded || '0');
            if (goal > 0) {
              progressPercent = (funded / goal) * 100;
            }
          } catch {}

          return (
            <div
              key={info.loanAddress}
              className="max-w-xl w-full mx-auto bg-blue-300/20 p-6 rounded-3xl shadow-md mt-8
                         hover:scale-[1.02] transform transition border border-blue-300/20"
            >
              <h2 className="text-center text-[#B4C8CF] text-xl font-bold mb-3">
                {info.borrower.substring(0, 6)}...
                {info.borrower.substring(info.borrower.length - 4)}
              </h2>

              <div className="bg-gray-800 rounded-2xl p-4 md:p-6 flex flex-col items-center border border-gray-700">
                {/* IOU name/symbol */}
                <div className="text-center mb-2 flex flex-wrap justify-center gap-2">
                  <h2 className="text-white text-xl font-bold bg-blue-400 py-1 px-2 rounded-full">
                    {info.iouName || 'SpotIOU'}
                  </h2>
                  <h2 className="text-white text-xl font-bold bg-blue-300/20 py-1 px-2 rounded-full">
                    {info.iouSymbol || 'IOU'}
                  </h2>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400">🪙 Loan Token:</p>
                  <p className="text-[#A5CAE1] text-lg font-semibold">
                    {info.underlyingSymbol || 'TOKEN'}
                  </p>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400">🎯 Loan Goal:</p>
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-[#94C7DA] font-bold">
                    {info.loanGoal}
                  </p>
                </div>

                <div className="m-2 text-center">
                  <p className="text-gray-400 text-sm mb-1">💰 Total Funded:</p>
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-[#78ADC3] font-bold">
                    {info.totalFunded}
                  </p>
                </div>

                {/* progress bar */}
                <div className="relative w-full h-3 rounded-full bg-blue-300/20 overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-400"
                    style={{ width: `${progressPercent.toFixed(2)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">🤝 Borrowed:</p>
                    <p className="bg-gray-700 px-3 py-1 rounded-full text-[#C7D3DB] font-bold">
                      {info.totalDrawnDown || '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">💎 Owed:</p>
                    <p className="bg-gray-700 px-3 py-1 rounded-full text-[#E1CBA5] font-bold">
                      {info.updatedTotalOwed || '0'}
                    </p>
                  </div>
                </div>

                <div className="text-center mb-2 mt-2">
                  <p className="text-gray-400 text-sm">📊 Annual Interest:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Accrued: {info.updatedInterest || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400 text-sm">Repayments:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Total: {info.repayments || '0'}
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Interest: {info.interestrepayments || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-gray-400 text-sm">👛 Your IOUs:</p>
                  <div className="flex items-center gap-2">
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-bold">
                    {info.myIOUs || '0'} {info.iouSymbol}
                  </p>
                  <p className="bg-orange-300/50 px-3 py-1 rounded-full text-gray-200 font-bold">
                    Redeemable: {info.myIOUs/info.totalSupply*info.repayments}
                  </p>
                  </div>
                </div>

                {/* Action input */}
                <input
                  type="text"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full mb-3 px-4 py-2 bg-blue-300/20 blue-300/20gray-200 rounded-full placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />

                {/* Buttons */}
                <div className="w-full flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => fundLoan(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-blue-400 hover:bg-[#356195] blue-300/20white font-semibold rounded-full 
                               transition focus:outline-none text-sm"
                  >
                    Fund
                  </button>

                  {isBorrower && (
                    <>
                      <button
                        onClick={() => drawDown(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:scale-105 
                                   transition text-sm bg-[#E3B23C]"
                      >
                        Draw Down
                      </button>
                      <button
                        onClick={() => repayLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:scale-105 
                                   transition text-sm bg-[#E85A4F]"
                      >
                        Repay
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-[#206a5d] hover:scale-105 text-white font-semibold 
                               rounded-full transition text-sm"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* My IOUs */}
      <div className="max-w-2xl w-full mt-8 p-6 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                     ring-1 ring-[#36444c] transition-transform duration-300 hover:scale-105">
        <h1 className="text-blue-400 text-2xl font-bold mb-4 uppercase">👛 My IOUs</h1>
        {myIOUs.length === 0 && <p className="text-gray-400">No IOUs found.</p>}

        {myIOUs.map((info) => {
          const isBorrower = userAddress?.toLowerCase() === info.borrower.toLowerCase();
          let progressPercent = 0;
          try {
            const goal = parseFloat(info.loanGoal || '0');
            const funded = parseFloat(info.totalFunded || '0');
            if (goal > 0) {
              progressPercent = (funded / goal) * 100;
            }
          } catch {}

          return (
            <div
              key={info.loanAddress}
              className="max-w-xl w-full mx-auto bg-blue-300/20 p-6 rounded-3xl shadow-md mt-8
                         hover:scale-[1.02] transform transition border border-blue-300/20"
            >
              <h2 className="text-center text-[#B4C8CF] text-xl font-bold mb-3">
                {info.borrower.substring(0, 6)}...
                {info.borrower.substring(info.borrower.length - 4)}
              </h2>

              <div className="bg-gray-800 rounded-2xl p-4 md:p-6 flex flex-col items-center border border-gray-700">
                <div className="text-center mb-2 flex flex-wrap justify-center gap-2">
                  <h2 className="text-white text-xl font-bold bg-blue-400 py-1 px-2 rounded-full">
                    {info.iouName || 'SpotIOU'}
                  </h2>
                  <h2 className="text-white text-xl font-bold bg-blue-300/20 py-1 px-2 rounded-full">
                    {info.iouSymbol || 'IOU'}
                  </h2>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400">🪙 Loan Token:</p>
                  <p className="text-[#A5CAE1] text-lg font-semibold">
                    {info.underlyingSymbol || 'TOKEN'}
                  </p>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400">🎯 Loan Goal:</p>
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-[#94C7DA] font-bold">
                    {info.loanGoal}
                  </p>
                </div>

                <div className="m-2 text-center">
                  <p className="text-gray-400 text-sm mb-1">💰 Total Funded:</p>
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-[#78ADC3] font-bold">
                    {info.totalFunded}
                  </p>
                </div>

                <div className="relative w-full h-3 rounded-full bg-blue-300/20 overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-400"
                    style={{ width: `${progressPercent.toFixed(2)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">🤝 Borrowed:</p>
                    <p className="bg-gray-700 px-3 py-1 rounded-full text-[#C7D3DB] font-bold">
                      {info.totalDrawnDown || '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">💎 Owed:</p>
                    <p className="bg-gray-700 px-3 py-1 rounded-full text-[#E1CBA5] font-bold">
                      {info.updatedTotalOwed || '0'}
                    </p>
                  </div>
                </div>

                <div className="text-center mb-2 mt-2">
                  <p className="text-gray-400 text-sm">📊 Annual Interest:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Accrued: {info.updatedInterest || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400 text-sm">Repayments:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Total: {info.repayments || '0'}
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Interest: {info.interestrepayments || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-gray-400 text-sm">👛 Your IOUs:</p>
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-bold">
                    {info.myIOUs || '0'}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full mb-3 px-4 py-2 bg-blue-300/20 text-gray-200 rounded-full placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />

                <div className="w-full flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => fundLoan(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-blue-400 hover:bg-[#356195] text-white font-semibold rounded-full
                               transition focus:outline-none text-sm"
                  >
                    Fund
                  </button>

                  {isBorrower && (
                    <>
                      <button
                        onClick={() => drawDown(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:scale-105 
                                   transition text-sm bg-[#E3B23C]"
                      >
                        Draw Down
                      </button>
                      <button
                        onClick={() => repayLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:scale-105 
                                   transition text-sm bg-[#E85A4F]"
                      >
                        Repay
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-[#206a5d] hover:scale-105 text-white font-semibold 
                               rounded-full transition text-sm"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* All Loans */}
      <div className="max-w-2xl w-full mt-8 p-6 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                     ring-1 ring-[#36444c] transition-transform duration-300 hover:scale-105">
        <h1 className="text-blue-400 text-2xl font-bold mb-4 uppercase">All Loans</h1>
        {allLoans.length === 0 && <p className="text-gray-400">No loans found.</p>}

        {allLoans.map((info) => {
          const isBorrower = userAddress?.toLowerCase() === info.borrower.toLowerCase();
          let progressPercent = 0;
          try {
            const goal = parseFloat(info.loanGoal || '0');
            const funded = parseFloat(info.totalFunded || '0');
            if (goal > 0) {
              progressPercent = (funded / goal) * 100;
            }
          } catch {}

          return (
            <div
              key={info.loanAddress}
              className="max-w-xl w-full mx-auto bg-blue-300/20 p-6 rounded-3xl shadow-md mt-8
                         hover:scale-[1.02] transform transition border border-blue-300/20"
            >
              <h2 className="text-center text-[#B4C8CF] text-xl font-bold mb-3">
                {info.borrower.substring(0, 6)}...
                {info.borrower.substring(info.borrower.length - 4)}
              </h2>

              <div className="bg-gray-800 rounded-2xl p-4 md:p-6 flex flex-col items-center border border-gray-700">
                <div className="text-center mb-2 flex flex-wrap justify-center gap-2">
                  <h2 className="text-white text-xl font-bold bg-blue-400 py-1 px-2 rounded-full">
                    {info.iouName || 'SpotIOU'}
                  </h2>
                  <h2 className="text-white text-xl font-bold bg-blue-300/20 py-1 px-2 rounded-full">
                    {info.iouSymbol || 'IOU'}
                  </h2>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400">🪙 Loan Token:</p>
                  <p className="text-[#A5CAE1] text-lg font-semibold">
                    {info.underlyingSymbol || 'TOKEN'}
                  </p>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400">🎯 Loan Goal:</p>
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-[#94C7DA] font-bold">
                    {info.loanGoal}
                  </p>
                </div>

                <div className="m-2 text-center">
                  <p className="text-gray-400 text-sm mb-1">💰 Total Funded:</p>
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-[#78ADC3] font-bold">
                    {info.totalFunded}
                  </p>
                </div>

                <div className="relative w-full h-3 rounded-full bg-blue-300/20 overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-blue-400"
                    style={{ width: `${progressPercent.toFixed(2)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">🤝 Borrowed:</p>
                    <p className="bg-gray-700 px-3 py-1 rounded-full text-[#C7D3DB] font-bold">
                      {info.totalDrawnDown || '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-sm">💎 Owed:</p>
                    <p className="bg-gray-700 px-3 py-1 rounded-full text-[#E1CBA5] font-bold">
                      {info.updatedTotalOwed || '0'}
                    </p>
                  </div>
                </div>

                <div className="text-center mb-2 mt-2">
                  <p className="text-gray-400 text-sm">📊 Annual Interest:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Accrued: {info.updatedInterest || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-400 text-sm">Repayments:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Total: {info.repayments || '0'}
                    </span>
                    <span className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-semibold">
                      Interest: {info.interestrepayments || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <p className="text-gray-400 text-sm">👛 Your IOUs:</p>
                  <p className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-bold">
                    {info.myIOUs || '0'}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full mb-3 px-4 py-2 bg-blue-300/20 text-gray-200 rounded-full placeholder-gray-400
                             focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                />

                <div className="w-full flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => fundLoan(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-blue-400 hover:bg-[#356195] text-white font-semibold rounded-full
                               transition focus:outline-none text-sm"
                  >
                    Fund
                  </button>

                  {isBorrower && (
                    <>
                      <button
                        onClick={() => drawDown(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:scale-105 
                                   transition text-sm bg-[#E3B23C]"
                      >
                        Draw Down
                      </button>
                      <button
                        onClick={() => repayLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:scale-105 
                                   transition text-sm bg-[#E85A4F]"
                      >
                        Repay
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-[#206a5d] hover:scale-105 text-white font-semibold 
                               rounded-full transition text-sm"
                  >
                    Redeem
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SpotIOUFactory;
