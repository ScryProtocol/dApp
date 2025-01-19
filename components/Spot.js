import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';

const IOUMintAddress = '0x5100062BC5cB67F7A7d59b265827ABC78E3bDb29';

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
      uint256 interestrepayments \
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

  // Deployment fields
  const [loanToken, setLoanToken] = useState('');
  const [borrower, setBorrower] = useState('');
  const [loanGoal, setLoanGoal] = useState('');
  const [annualInterestRate, setAnnualInterestRate] = useState('');
  const [platformFeeRate, setPlatformFeeRate] = useState('');
  const [feeAddress, setFeeAddress] = useState('');
  const [iouName, setIouName] = useState('');
  const [iouSymbol, setIouSymbol] = useState('');

  // Single input for fund/repay/redeem
  const [actionAmount, setActionAmount] = useState('');

  // Contract
  const IOUMintContract = new ethers.Contract(IOUMintAddress, IOUMintABI, provider);

  useEffect(() => {
    if (!provider || !userAddress) return;
    fetchAllData();
  }, [provider, userAddress]);

  // Fetch arrays & info
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
          : '0'
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
          console.log('Error fetching decimals, defaulting to 18');
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

  // Actions
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
        toast.error('Native asset not handled.');
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

        const allowance = await tok.allowance(userAddress, loanAddress);
        if (allowance < parsed) {
          const approveTx = await tok.approve(loanAddress, parsed);
          await approveTx.wait();
        }

        const tx = await loan.repayLoan(parsed);
        await tx.wait();

        toast.success('Repayment successful!');
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
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-100 via-cyan-300 to-green-200 text-gray-800 font-sans flex flex-col items-center pb-10">
      <Toaster />

      {/* Deploy New IOU */}
      <div className="max-w-xl w-11/12 mt-12 p-6 md:p-8 bg-white rounded-3xl shadow-xl text-center flex flex-col transition-transform duration-300 hover:scale-105">
        <h1 className="text-pink-500 text-2xl md:text-3xl font-bold mt-2 mb-4">
          Mint an IOU
        </h1>
        <div className="w-full space-y-4 text-left">
          {/* ERC20 Token */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              🪙 ERC20 Token Address:
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              value={loanToken}
              onChange={(e) => setLoanToken(e.target.value)}
            />
          </div>

          {/* Borrower */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              🤝 Borrower Address / ENS:
            </label>
            <input
              type="text"
              placeholder="0x... or user.eth"
              className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
            />
          </div>

          {/* Loan Goal */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              🎯 Loan Goal:
            </label>
            <input
              type="text"
              placeholder="1000"
              className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              value={loanGoal}
              onChange={(e) => setLoanGoal(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                📊 Annual Interest Rate (bps):
              </label>
              <input
                type="text"
                placeholder="500 = 5%"
                className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                💹 Platform Fee (bps):
              </label>
              <input
                type="text"
                placeholder="50 = 0.5%"
                className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                value={platformFeeRate}
                onChange={(e) => setPlatformFeeRate(e.target.value)}
              />
            </div>
          </div>

          {/* IOU Name, Symbol */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                🏷 IOU Name:
              </label>
              <input
                type="text"
                placeholder="SpotIOU"
                className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                value={iouName}
                onChange={(e) => setIouName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                🔖 IOU Symbol:
              </label>
              <input
                type="text"
                placeholder="IOU"
                className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                value={iouSymbol}
                onChange={(e) => setIouSymbol(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={deployNewLoan}
            className="w-full py-2 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition"
          >
            Deploy Loan
          </button>
        </div>

        <div className="mt-4">
          <ConnectButton />
        </div>
      </div>

      {/* My Loans (Borrower) */}
      <div className="max-w-2xl w-11/12 mt-8 p-6 bg-white rounded-3xl shadow-xl text-center flex flex-col transition-transform duration-300 hover:scale-105">
        <h1 className="text-pink-500 text-2xl font-bold mb-4">🌟 My Loans</h1>
        {myLoans.length === 0 && <p className="text-gray-600">No loans found.</p>}

        {myLoans.map((info) => {
          const isBorrower =
            userAddress?.toLowerCase() === info.borrower.toLowerCase();
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
              className="max-w-xl w-full mx-auto bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-200 p-6 rounded-3xl shadow-lg mt-8"
            >
              <h2 className="text-center text-pink-600 text-xl font-bold mb-3">
                {info.borrower.substring(0, 6)}...
                {info.borrower.substring(info.borrower.length - 4)}
              </h2>

              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 flex flex-col items-center">
                <div className="text-center mb-2 flex flex-wrap justify-center gap-2">
                  <h2 className="text-white text-xl font-bold bg-pink-500 py-1 px-2 rounded-full">
                    {info.iouName || 'SpotIOU'}
                  </h2>
                  <h2 className="text-white text-xl font-bold bg-pink-400 py-1 px-2 rounded-full">
                    {info.iouSymbol || 'IOU'}
                  </h2>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-600">🪙 Loan Token:</p>
                  <p className="text-pink-500 text-lg font-semibold">
                    {info.underlyingSymbol || 'TOKEN'}
                  </p>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-500">🎯 Loan Goal:</p>
                  <p className="bg-green-50 px-3 py-1 rounded-full text-green-600 font-bold">
                    {info.loanGoal}
                  </p>
                </div>

                <div className="m-2 text-center">
                  <p className="text-gray-500 text-sm mb-1">💰 Total Funded:</p>
                  <p className="bg-blue-50 px-3 py-1 rounded-full text-blue-600 font-bold">
                    {info.totalFunded}
                  </p>
                </div>

                <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-pink-400"
                    style={{ width: `${progressPercent.toFixed(2)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">🤝 Borrowed:</p>
                    <p className="bg-yellow-50 px-3 py-1 rounded-full text-yellow-600 font-bold">
                      {info.totalDrawnDown || '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">💎 Owed:</p>
                    <p className="bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-bold">
                      {info.updatedTotalOwed || '0'}
                    </p>
                  </div>
                </div>

                <div className="text-center mb-2 mt-2">
                  <p className="text-gray-500 text-sm">📊 Annual Interest:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Accrued: {info.updatedInterest || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-500 text-sm">Repayments:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Total: {info.repayments || '0'}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Interest: {info.interestrepayments || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-500 text-sm">👛 Your IOUs:</p>
                  <p className="bg-gray-50 px-3 py-1 rounded-full text-gray-600 font-bold">
                    {info.myIOUs || '0'}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full mb-3 px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />

                <div className="w-full flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => fundLoan(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition text-sm"
                  >
                    Fund
                  </button>

                  {isBorrower && (
                    <>
                      <button
                        onClick={() => drawDown(info.loanAddress, actionAmount)}
                        className="flex-1 p-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm bg-yellow-500"
                      >
                        Draw Down
                      </button>
                      <button
                        onClick={() => repayLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm bg-red-500"
                      >
                        Repay
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm"
                    style={{ backgroundColor: '#4A90E2' }}
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
      <div className="max-w-2xl w-11/12 mt-8 p-6 bg-white rounded-3xl shadow-xl text-center flex flex-col transition-transform duration-300 hover:scale-105">
        <h1 className="text-pink-500 text-2xl font-bold mb-4">👛 My IOUs</h1>
        {myIOUs.length === 0 && <p className="text-gray-600">No IOUs found.</p>}

        {myIOUs.map((info) => {
          const isBorrower =
            userAddress?.toLowerCase() === info.borrower.toLowerCase();
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
              className="max-w-xl w-full mx-auto bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-200 p-6 rounded-3xl shadow-lg mt-8"
            >
              <h2 className="text-center text-pink-600 text-xl font-bold mb-3">
                {info.borrower.substring(0, 6)}...
                {info.borrower.substring(info.borrower.length - 4)}
              </h2>

              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 flex flex-col items-center">
                {/* IOU name / symbol */}
                <div className="text-center mb-2 flex flex-wrap justify-center gap-2">
                  <h2 className="text-white text-xl font-bold bg-pink-500 py-1 px-2 rounded-full">
                    {info.iouName || 'SpotIOU'}
                  </h2>
                  <h2 className="text-white text-xl font-bold bg-pink-400 py-1 px-2 rounded-full">
                    {info.iouSymbol || 'IOU'}
                  </h2>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-600">🪙 Loan Token:</p>
                  <p className="text-pink-500 text-lg font-semibold">
                    {info.underlyingSymbol || 'TOKEN'}
                  </p>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-500">🎯 Loan Goal:</p>
                  <p className="bg-green-50 px-3 py-1 rounded-full text-green-600 font-bold">
                    {info.loanGoal}
                  </p>
                </div>

                <div className="m-2 text-center">
                  <p className="text-gray-500 text-sm mb-1">💰 Total Funded:</p>
                  <p className="bg-blue-50 px-3 py-1 rounded-full text-blue-600 font-bold">
                    {info.totalFunded}
                  </p>
                </div>

                <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-pink-400"
                    style={{ width: `${progressPercent.toFixed(2)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">🤝 Borrowed:</p>
                    <p className="bg-yellow-50 px-3 py-1 rounded-full text-yellow-600 font-bold">
                      {info.totalDrawnDown || '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">💎 Owed:</p>
                    <p className="bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-bold">
                      {info.updatedTotalOwed || '0'}
                    </p>
                  </div>
                </div>

                <div className="text-center mb-2 mt-2">
                  <p className="text-gray-500 text-sm">📊 Annual Interest:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Accrued: {info.updatedInterest || '0'}
                    </span>
                  </div>
                </div>

                {/* Repayments row (similar to My Loans) */}
                <div className="text-center mb-2">
                  <p className="text-gray-500 text-sm">Repayments:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Total: {info.repayments || '0'}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Interest: {info.interestrepayments || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-500 text-sm">👛 Your IOUs:</p>
                  <p className="bg-gray-50 px-3 py-1 rounded-full text-gray-600 font-bold">
                    {info.myIOUs || '0'}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full mb-3 px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />

                <div className="w-full flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => fundLoan(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition text-sm"
                  >
                    Fund
                  </button>

                  {isBorrower && (
                    <>
                      <button
                        onClick={() => drawDown(info.loanAddress, actionAmount)}
                        className="flex-1 p-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm bg-yellow-500"
                      >
                        Draw Down
                      </button>
                      <button
                        onClick={() => repayLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm bg-red-500"
                      >
                        Repay
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm"
                    style={{ backgroundColor: '#4A90E2' }}
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
      <div className="max-w-2xl w-11/12 mt-8 p-6 bg-white rounded-3xl shadow-xl text-center flex flex-col transition-transform duration-300 hover:scale-105">
        <h1 className="text-pink-500 text-2xl font-bold mb-4">All Loans</h1>
        {allLoans.length === 0 && <p className="text-gray-600">No loans found.</p>}

        {allLoans.map((info) => {
          const isBorrower =
            userAddress?.toLowerCase() === info.borrower.toLowerCase();
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
              className="max-w-xl w-full mx-auto bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-200 p-6 rounded-3xl shadow-lg mt-8"
            >
              <h2 className="text-center text-pink-600 text-xl font-bold mb-3">
                {info.borrower.substring(0, 6)}...
                {info.borrower.substring(info.borrower.length - 4)}
              </h2>

              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 flex flex-col items-center">
                <div className="text-center mb-2 flex flex-wrap justify-center gap-2">
                  <h2 className="text-white text-xl font-bold bg-pink-500 py-1 px-2 rounded-full">
                    {info.iouName || 'SpotIOU'}
                  </h2>
                  <h2 className="text-white text-xl font-bold bg-pink-400 py-1 px-2 rounded-full">
                    {info.iouSymbol || 'IOU'}
                  </h2>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-600">🪙 Loan Token:</p>
                  <p className="text-pink-500 text-lg font-semibold">
                    {info.underlyingSymbol || 'TOKEN'}
                  </p>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-500">🎯 Loan Goal:</p>
                  <p className="bg-green-50 px-3 py-1 rounded-full text-green-600 font-bold">
                    {info.loanGoal}
                  </p>
                </div>

                <div className="m-2 text-center">
                  <p className="text-gray-500 text-sm mb-1">💰 Total Funded:</p>
                  <p className="bg-blue-50 px-3 py-1 rounded-full text-blue-600 font-bold">
                    {info.totalFunded}
                  </p>
                </div>

                <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-pink-400"
                    style={{ width: `${progressPercent.toFixed(2)}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">🤝 Borrowed:</p>
                    <p className="bg-yellow-50 px-3 py-1 rounded-full text-yellow-600 font-bold">
                      {info.totalDrawnDown || '0'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">💎 Owed:</p>
                    <p className="bg-orange-50 px-3 py-1 rounded-full text-orange-600 font-bold">
                      {info.updatedTotalOwed || '0'}
                    </p>
                  </div>
                </div>

                <div className="text-center mb-2 mt-2">
                  <p className="text-gray-500 text-sm">📊 Annual Interest:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Accrued: {info.updatedInterest || '0'}
                    </span>
                  </div>
                </div>

                {/* Repayments row (optional) */}
                <div className="text-center mb-2">
                  <p className="text-gray-500 text-sm">Repayments:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Total: {info.repayments || '0'}
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      Interest: {info.interestrepayments || '0'}
                    </span>
                  </div>
                </div>

                <div className="text-center mb-2">
                  <p className="text-gray-500 text-sm">👛 Your IOUs:</p>
                  <p className="bg-gray-50 px-3 py-1 rounded-full text-gray-600 font-bold">
                    {info.myIOUs || '0'}
                  </p>
                </div>

                <input
                  type="text"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full mb-3 px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />

                <div className="w-full flex flex-wrap justify-center gap-3">
                  <button
                    onClick={() => fundLoan(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition text-sm"
                  >
                    Fund
                  </button>

                  {isBorrower && (
                    <>
                      <button
                        onClick={() => drawDown(info.loanAddress, actionAmount)}
                        className="flex-1 p-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm bg-yellow-500"
                      >
                        Draw Down
                      </button>
                      <button
                        onClick={() => repayLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm bg-red-500"
                      >
                        Repay
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 text-white font-semibold rounded-full hover:opacity-90 transition text-sm"
                    style={{ backgroundColor: '#4A90E2' }}
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
