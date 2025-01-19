import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';

// Optional MUI imports if you want Table/Paper styling:
// import {
//   TableContainer,
//   Table,
//   TableHead,
//   TableBody,
//   TableRow,
//   TableCell,
//   Paper,
//   Typography,
// } from '@mui/material';

/**
 * IOUMint (factory) contract details
 */
const IOUMintAddress = '0x97A20D3a77121e37518AA8a2c19e27a77b78c2C4';
const IOUMintABI = [
  'function deployLoan(address _loanToken, address _borrower, uint256 _loanGoal, uint256 _annualInterestRate, uint256 _platformFeeRate, address _feeAddress, string memory _name, string memory _symbol) external returns (address)',
  'function getAllLoans() external view returns (address[] memory)',
  'function getSpotInfo(address[] memory loans) external view returns ( (address loanAddress, address borrower, uint256 loanGoal, uint256 totalFunded, uint256 totalDrawnDown, uint256 accruedInterest, uint256 annualInterestRate, uint256 platformFeeRate, address feeAddress, string iouName, string iouSymbol, address underlying, string underlyingName, string underlyingSymbol, uint8 underlyingDecimals, uint256 updatedInterest, uint256 updatedTotalOwed)[] memory )',
'function getUserLoans(address user) external view returns (address[] memory)',
'function getUserIOUs(address user) external view returns (address[] memory)',
];

/**
 * Each deployed SpotIOULoan clone
 */
const SpotIOULoanABI = [
  'function fundLoan(uint256 amount) external',
  'function drawDown(uint256 amount) external',
  'function repayLoan(uint256 amount) external',
  'function redeemIOUs(uint256 iouAmount) external',
  'function loanToken() external view returns (address)',
  'function borrower() external view returns (address)',
  'function loanGoal() external view returns (uint256)',
  'function totalFunded() external view returns (uint256)',
  'function annualInterestRate() external view returns (uint256)',
  'function decimals() external view returns (uint8)',
];

/**
 * Standard ERC20
 */
const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
];

const SpotIOUFactory = () => {
  // ------------------------------
  // 1) Hooks & state
  // ------------------------------
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address: userAddress } = useAccount();
  const chainId = useChainId();

  // For listing all existing loans
  const [allLoans, setAllLoans] = useState([]);
  const [loanInfo, setLoanInfo] = useState([]);
const [myLoans, setMyLoans] = useState([]);
const [myIOUs, setMyIOUs] = useState([]);
  // For deploying a new loan
  const [loanToken, setLoanToken] = useState('');
  const [borrower, setBorrower] = useState('');
  const [loanGoal, setLoanGoal] = useState('');
  const [annualInterestRate, setAnnualInterestRate] = useState('');
  const [platformFeeRate, setPlatformFeeRate] = useState('');
  const [feeAddress, setFeeAddress] = useState('');
  const [iouName, setIouName] = useState('');
  const [iouSymbol, setIouSymbol] = useState('');

  // For user actions (fund, repay, etc.)
  const [actionAmount, setActionAmount] = useState('');

  // ------------------------------
  // 2) Contract references
  // ------------------------------
  const IOUMintContract = new ethers.Contract(IOUMintAddress, IOUMintABI, provider);

  // ------------------------------
  // 3) On page load, fetch all loans
  // ------------------------------
  useEffect(() => {
    if (!provider) return;
    fetchAllLoans();
  }, [provider, userAddress]);

  const fetchAllLoans = async () => {
    try {
      const [...myLoans] = await IOUMintContract.getUserLoans(userAddress);
      const [...myIOUs] = await IOUMintContract.getUserIOUs(userAddress);
      const [...loans] = await IOUMintContract.getAllLoans();
      setMyLoans(await fetchLoanInfo(myLoans));
      setMyIOUs(await fetchLoanInfo(myIOUs));
      setLoanInfo(await fetchLoanInfo(loans));
    } catch (e) {
      console.error(e);
      toast.error('Could not fetch loans');
    }
  };

  const fetchLoanInfo = async (loans) => {
    if (!loans || loans.length === 0) {
      setLoanInfo([]);
      return;
    }
    try {
      const result = await IOUMintContract.getSpotInfo(loans);
      // parse data
      const mapped = result.map((info) => ({
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
      }));
return mapped;
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch loan details');
    }
  };

  // ------------------------------
  // 4) Deploy a new SpotIOULoan
  // ------------------------------
  const deployNewLoan = async () => {
    if (!signer) {
      toast.error('Connect your wallet first.');
      return;
    }
    if (!loanToken || !borrower || !loanGoal) {
      toast.error('Please fill in the required fields.');
      return;
    }
    try {
      const factoryWithSigner = IOUMintContract.connect(signer);

      // parse loanGoal (assume 18 decimals or fetch from the token if needed)
      const _loanGoal = ethers.parseUnits(loanGoal, 18);
      const _annual = parseInt(annualInterestRate) || 0;
      const _platform = parseInt(platformFeeRate) || 0;

      // If borrower is an ENS name
      let finalBorrower = borrower;
      if (!ethers.isAddress(borrower)) {
        const resolved = await provider.resolveName(borrower);
        if (!resolved) throw new Error('Could not resolve borrower ENS');
        finalBorrower = resolved;
      }

      // If feeAddress is an ENS name
      let finalFeeAddr = '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5'

      const tx = await factoryWithSigner.deployLoan(
        loanToken,
        finalBorrower,
        _loanGoal,
        _annual,
        _platform,
        finalFeeAddr || ethers.ZeroAddress,
        iouName || 'SpotIOU',
        iouSymbol || 'IOU'
      );
      await tx.wait();
      toast.success('Loan deployed! Refreshing...');
      setTimeout(fetchAllLoans, 4000);
    } catch (err) {
      console.error(err);
      toast.error('Error deploying new loan');
    }
  };

  // ------------------------------
  // 5) Actions on an existing loan
  // ------------------------------
  const getLoanContract = (loanAddress) =>
    new ethers.Contract(loanAddress, SpotIOULoanABI, signer || provider);

  const fundLoan = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect your wallet first.');
      return;
    }
    try {
      if (!amount || Number(amount) <= 0) {
        toast.error('Fund amount must be > 0');
        return;
      }
      const loan = getLoanContract(loanAddress);

      const underlying = await loan.loanToken();
      let decimals = 18;

      if (underlying !== ethers.ZeroAddress) {
        const tok = new ethers.Contract(underlying, tokenABI, provider);
        decimals = await tok.decimals();
        // Check allowance
        const parsed = ethers.parseUnits(amount, decimals);
        const tokSigner = tok.connect(signer);

        const currentAllowance = await tokSigner.allowance(userAddress, loanAddress);
        if (currentAllowance < parsed) {
          const approveTx = await tokSigner.approve(loanAddress, parsed);
          await approveTx.wait();
        }
        // fund
        const tx = await loan.connect(signer).fundLoan(parsed);
        await tx.wait();
      } else {
        // If it's native chain bridging, not handled here
        toast.error('This example uses ERC20 only.');
        return;
      }
      toast.success('Loan funded!');
      fetchAllLoans();
    } catch (err) {
      console.error(err);
      toast.error('Error funding loan.');
    }
  };

  const drawDown = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect your wallet first');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const parsed =
        amount && Number(amount) > 0 ? ethers.parseUnits(amount, 18) : 0n;

      const tx = await loan.connect(signer).drawDown(parsed);
      await tx.wait();

      toast.success('Drawdown successful!');
      fetchAllLoans();
    } catch (err) {
      console.error(err);
      toast.error('Error drawing down.');
    }
  };

  const repayLoan = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect your wallet first');
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

        // Approve if needed
        const allowance = await tok.allowance(userAddress, loanAddress);
        if (allowance < parsed) {
          const approveTx = await tok.approve(loanAddress, parsed);
          await approveTx.wait();
        }

        const tx = await loan.connect(signer).repayLoan(parsed);
        await tx.wait();

        toast.success('Repayment successful!');
        fetchAllLoans();
      } else {
        toast.error('Native asset flow not handled in this example.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error repaying loan.');
    }
  };

  const redeemIOUs = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect your wallet first');
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

      const tx = await loan.connect(signer).redeemIOUs(parsed);
      await tx.wait();

      toast.success('IOU redemption successful!');
      fetchAllLoans();
    } catch (err) {
      console.error(err);
      toast.error('Error redeeming IOUs.');
    }
  };

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-100 via-cyan-300 to-green-200 text-gray-800 font-sans flex flex-col items-center pb-10">
      <Toaster />

      {/* 1) Deploy a new SpotIOULoan */}
      <div className="max-w-xl w-11/12 mt-12 p-6 md:p-8 bg-white rounded-3xl shadow-xl text-center flex flex-col transition-transform duration-300 hover:scale-105">
        

        {/* Title */}
        <h1 className="text-pink-500 text-2xl md:text-3xl font-bold mt-2 mb-4">
          Mint an IOU
        </h1>

        <div className="w-full space-y-4 text-left">
          {/* ERC20 Token Address */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              🪙 ERC20 Token Address:
            </label>
            <input
              type="text"
              placeholder="0x..."
              className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300
                         focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              value={loanToken}
              onChange={(e) => setLoanToken(e.target.value)}
            />
          </div>

          {/* Borrower / ENS */}
          <div>
            <label className="block font-semibold text-gray-700 mb-1">
              🤝 Borrower Address / ENS:
            </label>
            <input
              type="text"
              placeholder="0x... or myfriend.eth"
              className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300
                         focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
            />
          </div>

<div>
  <label className="block font-semibold text-gray-700 mb-1">
    🎯 Loan Goal:
  </label>
  <input
    type="text"
    placeholder="1000"
    className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300
               focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
    value={loanGoal}
    onChange={(e) => setLoanGoal(e.target.value)}
  />
</div>
          {/* Grid for short fields */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Loan Goal 
            {/* Annual Interest Rate */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                📊 Annual Interest Rate (bps):
              </label>
              <input
                type="text"
                placeholder="500 = 5%"
                className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300
                           focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(e.target.value)}
              />
            </div>

            {/* Platform Fee Rate */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                💹 Platform Fee (bps):
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300
                           focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                value={platformFeeRate}
                onChange={(e) => setPlatformFeeRate(e.target.value)}
              />
            </div>


            {/* IOU Name */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                🏷 IOU Name:
              </label>
              <input
                type="text"
                placeholder="SpotIOU"
                className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300
                           focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                value={iouName}
                onChange={(e) => setIouName(e.target.value)}
              />
            </div>

            {/* IOU Symbol */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                🔖 IOU Symbol:
              </label>
              <input
                type="text"
                placeholder="IOU"
                className="w-full px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300
                           focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                value={iouSymbol}
                onChange={(e) => setIouSymbol(e.target.value)}
              />
            </div>
          </div>

          {/* Deploy Button */}
          <button
            onClick={deployNewLoan}
            className="w-full py-2 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition"
          >
            Deploy Loan
          </button>
        </div>
        {/* Connect */}
        <div className="mt-2">
          <ConnectButton />
        </div>
      </div>

      {/* 2) All Loans */}
      <div className="max-w-xl w-11/12 mt-8 p-6 bg-white rounded-3xl shadow-xl text-center flex flex-col transition-transform duration-300 hover:scale-105">
        <h1 className="text-pink-500 text-2xl font-bold mb-4">All Loans</h1>

        {loanInfo.length === 0 && (
          <p className="text-gray-600">No loans found.</p>
        )}

        {/* Updated Loan Card Layout */}
        {loanInfo.map((info) => {
          // Decide if the current user is the borrower
          const isBorrower =
            userAddress?.toLowerCase() === info.borrower.toLowerCase();

          // Calculate progress for the progress bar (funded / goal)
          let progressPercent = 0;
          try {
            const goal = parseFloat(info.loanGoal || '0');
            const funded = parseFloat(info.totalFunded || '0');
            if (goal > 0) {
              progressPercent = (funded / goal) * 100;
            }
          } catch (err) {
            // fallback
          }

          return (
            <div
              key={info.loanAddress}
              className="max-w-md w-full mx-auto bg-gradient-to-br from-yellow-100 via-orange-100 to-pink-200 p-6 rounded-3xl shadow-lg mt-8"
            >
              {/* Title: borrower ENS or iouName, your choice */}
              <h2 className="text-center text-pink-600 text-xl font-bold mb-3">
{info.borrower.substring(0, 6)}...{info.borrower.substring(info.borrower.length - 4, info.borrower.length)}
              </h2>

              {/* Inner white card */}
              <div className="bg-white rounded-2xl shadow-md p-4 md:p-6 flex flex-col items-center">
                {/* Token row */}
                <div className="text-center mb-2">
                  <p className="text-gray-600">Loan Token:</p>
                  <p className="text-pink-500 text-lg font-semibold">
                    {info.underlyingSymbol || 'TOKEN'}
                  </p>
                </div>

                {/* Limit / Owed row */}
                <div className="text-center">
                    <p className="text-gray-500 ">🎯 Loan Goal:</p>
                    <p className="bg-green-50 px-3 py-1 rounded-full text-green-600 font-bold">
                      {info.loanGoal}
                    </p>
                  </div>
                  
                {/* Volume Borrowed (totalFunded) */}
                <div className="m-2 text-center">
                  <p className="text-gray-500 text-sm mb-1">💰 Total Funded:</p>
                  <p className="bg-blue-50 px-3 py-1 rounded-full text-blue-600 font-bold">
                    {info.totalFunded}
                  </p>
                </div>
                {/* Progress bar for funded/goal */}
                <div className="relative w-full h-3 rounded-full bg-gray-200 overflow-hidden mb-2">
                  <div
                    className="absolute left-0 top-0 h-full bg-pink-400"
                    style={{ width: `${progressPercent.toFixed(2)}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">💰 Borrowed:</p>
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


                {/* Interest Rate & Fee */}
                <div className="text-center mb-4">
                  <p className="text-gray-500 text-sm mb-1">🏦 Interest Rate:</p>
                  <div className="inline-flex items-center gap-2">
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      {info.annualInterestRate/100}%
                    </span>
                    <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-semibold">
                      {info.updatedInterest || 0}
                    </span>
                  </div>
                </div>


                {/* Action input (Amount) */}
                <input
                  type="text"
                  placeholder="Amount"
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  className="w-full mb-3 px-4 py-2 bg-pink-100 rounded-full placeholder-pink-300
                             focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
                />

                {/* Action buttons */}
                <div className="w-full flex flex-wrap justify-center gap-3">
                  {/* Fund (for everyone) */}
                  <button
                    onClick={() => fundLoan(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 bg-pink-500 text-white font-semibold rounded-full 
                               hover:bg-pink-600 transition text-sm"
                  >
                    Fund
                  </button>

                  {/* Borrower-only actions */}
                  {isBorrower && (
                    <>
                      <button
                        onClick={() => drawDown(info.loanAddress, actionAmount)}
                        className="flex-1 p-2 text-white font-semibold rounded-full hover:opacity-90 
                                   transition text-sm bg-yellow-500"
                      >
                        Draw Down
                      </button>
                      <button
                        onClick={() => repayLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 text-white font-semibold rounded-full hover:opacity-90 
                                   transition text-sm bg-red-500"
                      >
                        Repay
                      </button>
                    </>
                  )}

                  {/* Redeem IOUs */}
                  <button
                    onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                    className="flex-1 py-2 text-white font-semibold rounded-full hover:opacity-90 
                               transition text-sm"
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
