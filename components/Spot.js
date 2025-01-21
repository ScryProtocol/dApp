import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';

const IOUMintAddress = '0xDc9ff13BB245caCA6E546894ecc53a430392515A';

const IOUMintABI = [
  'function deployLoan(address, address, uint256, uint256, uint256, address, string, string) external returns (address)',
  'function getAllLoans() external view returns (address[])',
  'function getUserLoans(address) external view returns (address[])',
  'function getUserIOUs(address) external view returns (address[])',
  'function getLoans(uint256[] memory) external view returns (address[])',
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
      uint256 interestClaimable \
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
  'function unfundLoan(uint256) external',
  'function claimInterest(address) external',
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

  // Search
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Single input for user actions
  const [actionAmount, setActionAmount] = useState('');

  const IOUMintContract = new ethers.Contract(IOUMintAddress, IOUMintABI, provider);

  // Accordion expansions
  const [expandedRowsSearch, setExpandedRowsSearch] = useState({});
  const [expandedRowsMyLoans, setExpandedRowsMyLoans] = useState({});
  const [expandedRowsMyIOUs, setExpandedRowsMyIOUs] = useState({});
  const [expandedRows, setExpandedRows] = useState({});

  // Toggle handlers
  const toggleExpandSearch = (index) => {
    setExpandedRowsSearch((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleExpandMyLoans = (index) => {
    setExpandedRowsMyLoans((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleExpandMyIOUs = (index) => {
    setExpandedRowsMyIOUs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const toggleExpand = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Fetch data on mount or user change
  useEffect(() => {
    if (!provider || !userAddress) return;
    fetchAllData();
  }, [provider, userAddress]);

  const fetchAllData = async () => {
    try {
      const [...myLoansArr] = await IOUMintContract.getUserLoans(userAddress);
      const [...myIOUsArr] = await IOUMintContract.getUserIOUs(userAddress);
      const [...allLoansArr] = await IOUMintContract.getAllLoans();

      // Reverse them if you like the "newest first" approach
      let myLoansArr2 = [];
      let myIOUsArr2 = [];
      let allLoansArr2 = [];
      for (let i = allLoansArr.length - 1; i >= 0; i--) {
        myLoansArr2.push(allLoansArr[i]);
      }
      for (let i = myLoansArr.length - 1; i >= 0; i--) {
        myIOUsArr2.push(myLoansArr[i]);
      }
      for (let i = myIOUsArr.length - 1; i >= 0; i--) {
        allLoansArr2.push(myIOUsArr[i]);
      }

      const myLoansInfo = await fetchLoanInfo(myLoansArr2);
      const myIOUsInfo = await fetchLoanInfo(myIOUsArr2);
      const allLoansInfo = await fetchLoanInfo(allLoansArr2);

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
        totalSupply: ethers.formatUnits(info.totalSupply, 18),
        interestClaimable: ethers.formatUnits(info.interestClaimable, info.underlyingDecimals),
      }));
    } catch (err) {
      console.error(err);
      toast.error('Error fetching loan details');
      return [];
    }
  };

  // Deploy new IOU-based Loan
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

      // Borrower ENS resolution
      let finalBorrower = borrower;
      if (!ethers.isAddress(borrower)) {
        const resolved = await provider.resolveName(borrower);
        if (!resolved) throw new Error('Could not resolve borrower ENS');
        finalBorrower = resolved;
      }

      let finalFeeAddr = feeAddress || '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5';
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

      const parsed =
        amount && Number(amount) > 0
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

        // check allowance
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
  const claimInterest = async (loanAddress) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const tx = await loan.claimInterest(userAddress);
      await tx.wait();
      toast.success('Interest claimed successfully');
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error claiming interest.');
    }
  }

  const unfundLoan = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Unfund amount must be > 0');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const token = new ethers.Contract(await loan.loanToken(), tokenABI, signer);
      const decimals = await token.decimals();
      const parsed = ethers.parseUnits(amount, decimals);

      const tx = await loan.unfundLoan(parsed);
      await tx.wait();
      toast.success('Unfunded loan successfully');
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error unfunding loan.');
    }
  };

  // Searching
  useEffect(() => {
    if (!searchAddress) return;
    async function fetchLoan() {
      try {
        // If not a 0x, treat as loan ID
        if (!searchAddress.startsWith('0x')) {
          let [...loans] = await IOUMintContract.getLoans([searchAddress]);
          let results = await fetchLoanInfo(loans);
          setSearchResults(results);
          return;
        }
        // Otherwise treat as user address
        try {
          let results = await fetchLoanInfo([searchAddress]);
          setSearchResults(results);
        } catch (error) {
          const [...loans] = await IOUMintContract.getUserIOUs(searchAddress);
          const results = await fetchLoanInfo(loans);
          setSearchResults(results);
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching search results');
      }
    }
    fetchLoan();
  }, [searchAddress]);
  useEffect(() => {
    let location = window.location.href;
    let url = new URL(location);
    let loan = url.searchParams.get('loan');
    if (loan) {
      setSearchAddress(loan);
    }
  }
  , []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200 flex flex-col items-center pb-10 px-4">
      <Toaster />

      {/* Deploy a new IOU */}
      <div
        className="max-w-xl w-full mt-10 p-6 md:p-8 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                   ring-1 ring-[#36444c] hover:scale-105 transform transition duration-300"
      >
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

<div className="grid md:grid-cols-2 gap-4">
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

      {/* FIND A LOAN */}
      <div className="max-w-lg w-full mt-8 p-6 text-center flex flex-col">
        <h2 className="text-blue-400 text-2xl font-bold mb-4 uppercase mt-4">
          Find a Loan
        </h2>
        <input
          type="text"
          placeholder="Search by borrower address or loan address"
          value={searchAddress}
          className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          onChange={(e) => setSearchAddress(e.target.value)}
        />
      </div>

      {/* SEARCH RESULTS */}
      {searchResults.length > 0 && (
        <div
          className="max-w-4xl w-full mt-8 p-6 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                     ring-1 ring-[#36444c] transition-transform duration-300 hover:scale-105"
        >
          <h1 className="text-blue-400 text-2xl font-bold mb-4 uppercase">🔍 IOUs</h1>
          <button
            onClick={() => {
              setSearchResults([]);
              setSearchAddress('');
            }}
            className="w-40 py-2 bg-blue-400 hover:bg-[#356195] text-white font-semibold rounded-full transition
                       focus:outline-none focus:ring-2 focus:ring-blue-400 mx-auto"
          >
            Close
          </button>

          {searchResults.length === 0 && (
            <p className="text-gray-400">No loans found.</p>
          )}

          {searchResults.length <= 2 ? (
            /*  CARD STYLE if 2 or fewer  */
            <>
              {searchResults.map((info) => {
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
                    className="max-w-xl w-full mx-auto bg-blue-300/20 p-6 rounded-3xl shadow-md mt-4
                               hover:scale-[1.02] transform transition border border-blue-300/20"
                  >
                    <h2 className="text-center text-[#B4C8CF] text-xl font-bold mb-3">
                      <button onClick={() => {navigator.clipboard.writeText(window.location.origin + '?loan=' + info.loanAddress);toast.success('Copied to clipboard!')}} className="bg-gray-600 px-1 py-1 rounded-full mx-2"
                      >🔗</button>{info.borrower.substring(0, 6)}...
                      {info.borrower.substring(info.borrower.length - 4)}
                    </h2>

                    <div
                      className="bg-gray-800 rounded-2xl p-4 md:p-6 flex flex-col 
                                 items-center border border-gray-700"
                    >
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
                            Redeemable:{' '}
                            {(
                              ((parseFloat(info.myIOUs) || 0) /
                                (parseFloat(info.totalSupply) || 1)) *
                              (parseFloat(info.repayments) || 0)
                            ).toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Amount"
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="w-full mb-3 px-4 py-2 bg-blue-300/20 
                                   text-gray-200 rounded-full placeholder-gray-400
                                   focus:outline-none focus:ring-2 
                                   focus:ring-blue-400 transition"
                      />

                      <div className="w-full flex flex-wrap justify-center gap-3">
                        <button
                          onClick={() => fundLoan(info.loanAddress, actionAmount)}
                          className="flex-1 py-2 bg-blue-400 hover:bg-[#356195] text-white 
                                     font-semibold rounded-full 
                                     transition focus:outline-none text-sm"
                        >
                          Fund
                        </button>

                        {isBorrower && (
                          <>
                            <button
                              onClick={() => drawDown(info.loanAddress, actionAmount)}
                              className="flex-1 py-2 text-white font-semibold 
                                         rounded-full hover:scale-105 
                                         transition text-sm bg-[#E3B23C]"
                            >
                              Draw Down
                            </button>
                            <button
                              onClick={() => repayLoan(info.loanAddress, actionAmount)}
                              className="flex-1 py-2 text-white font-semibold 
                                         rounded-full hover:scale-105 
                                         transition text-sm bg-[#E85A4F]"
                            >
                              Repay
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                          className="flex-1 py-2 bg-[#206a5d] hover:scale-105 text-white 
                                     font-semibold rounded-full 
                                     transition text-sm"
                        >
                          Redeem
                        </button>
                        <button
                          onClick={() => claimInterest(info.loanAddress)}
                          className="flex-1 py-2 bg-[#206a5d] hover:scale-105 text-white 
                                     font-semibold rounded-full 
                                     transition text-sm"
                        >
                          Claim Interest
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            /* TABLE/ACCORDION STYLE for SEARCH RESULTS */
            <div className="space-y-2 w-full mt-4">
              {searchResults.map((info, i) => {
                const isBorrower =
                  userAddress?.toLowerCase() === info.borrower.toLowerCase();

                return (
                  <div key={info.loanAddress} className="bg-gray-700 rounded-3xl shadow-md">
                    <button
                      onClick={() => toggleExpandSearch(i)}
                      className="flex items-center justify-between px-4 py-3 w-full 
                                 cursor-pointer hover:bg-gray-600 transition"
                    >
                      <div className="flex items-center grid grid-cols-5 w-full">
                        <span className="text-sm text-gray-300">
                          
                      <button onClick={() => {navigator.clipboard.writeText(window.location.origin+ '?loan=' + info.loanAddress);toast.success('Copied to clipboard!')}} className="bg-gray-600 px-1 py-1 rounded-full"
                      >🔗</button>
                        🧑‍💼 {info.borrower.slice(0, 6)}...
                          {info.borrower.slice(-4)}
                        </span>
                        <span className="text-sm text-blue-300">
                          {info.underlyingSymbol || 'TOKEN'}
                        </span>
                        <span className="text-sm text-purple-300">
                          Goal: {info.loanGoal}
                        </span>
                        <span className="text-sm text-green-300">
                          APR: {(info.annualInterestRate / 100).toFixed(2)}%
                        </span>
                        <span className="text-sm text-pink-300">
                          Owed: {info.updatedTotalOwed}
                        </span>
                      </div>
                      <div className="text-gray-400">
                        {expandedRowsSearch[i] ? '▼' : '▶'}
                      </div>
                    </button>

                    {expandedRowsSearch[i] && (
                      <div className="px-4 py-4 border-t border-gray-600">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-400 text-xs">IOU Name:</p>
                            <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                              {info.iouName} ({info.iouSymbol})
                            </p>
                            <p className="text-gray-400 text-xs">Loan Goal:</p>
                            <p className="text-purple-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                              {info.loanGoal}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs">Total Funded:</p>
                            <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                              {info.totalFunded}
                            </p>
                            <p className="text-gray-400 text-xs">My IOUs:</p>
                            <p className="text-pink-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                              {info.myIOUs}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs">Repayments / Interest:</p>
                            <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                              {info.repayments} / {info.interestrepayments}
                            </p>
                            <p className="text-gray-400 text-xs">Total Drawn Down:</p>
                            <p className="text-yellow-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                              {info.totalDrawnDown}
                            </p>
                          </div>

                          <div>
                            <p className="text-gray-400 text-xs">Redeemable:</p>
                            <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                              {(
                                ((parseFloat(info.myIOUs) || 0) /
                                  (parseFloat(info.totalSupply) || 1)) *
                                (parseFloat(info.repayments) || 0)
                              ).toFixed(4)}
                            </p>
                            <p className="text-gray-400 text-xs">Borrower:</p>
                            <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-hidden">
                              {info.borrower}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center space-x-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <input
                              type="text"
                              placeholder="Amount"
                              value={actionAmount}
                              onChange={(e) => setActionAmount(e.target.value)}
                              className="flex-1 px-4 py-2 bg-gray-800 text-gray-100 
                                         rounded-full placeholder-gray-500
                                         focus:outline-none focus:ring-2 
                                         focus:ring-pink-400 transition w-full"
                            />
                          </div>
                          <div className="flex justify-between gap-2">
                            <button
                              onClick={() => fundLoan(info.loanAddress, actionAmount)}
                              className="bg-pink-500 hover:bg-pink-600 text-white font-semibold 
                                         px-3 py-2 rounded-full text-sm w-full"
                            >
                              Fund
                            </button>
                            {isBorrower && (
                              <>
                                <button
                                  onClick={() => drawDown(info.loanAddress, actionAmount)}
                                  className="bg-yellow-500 hover:bg-yellow-600 text-white 
                                             font-semibold px-3 py-2 rounded-full text-sm w-full"
                                >
                                  Draw
                                </button>
                                <button
                                  onClick={() => repayLoan(info.loanAddress, actionAmount)}
                                  className="bg-red-500 hover:bg-red-600 text-white 
                                             font-semibold px-3 py-2 rounded-full text-sm w-full"
                                >
                                  Repay
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                              className="bg-blue-600 hover:bg-blue-700 text-white 
                                         font-semibold px-3 py-2 rounded-full text-sm w-full"
                            >
                              Redeem
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MY LOANS */}
      <div
        className="max-w-4xl w-full mt-8 p-6 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                   ring-1 ring-[#36444c] transition-transform duration-300 hover:scale-105"
      >
        <h1 className="text-blue-400 text-2xl font-bold mb-4 uppercase">🌟 My Loans</h1>
        {myLoans.length === 0 && <p className="text-gray-400">No loans found.</p>}

        {myLoans.length <= 2 ? (
          /* --------------------- CARD STYLE --------------------- */
          <>
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
                  className="max-w-xl w-full mx-auto bg-blue-300/20 p-6 rounded-3xl shadow-md mt-8
                             hover:scale-[1.02] transform transition border border-blue-300/20"
                >
                  <h2 className="text-center text-[#B4C8CF] text-xl font-bold mb-3">
                    <button onClick={() => {navigator.clipboard.writeText(window.location.origin+ '?loan=' + info.loanAddress);toast.success('Copied to clipboard!')}} className="bg-gray-600 px-1 py-1 rounded-full mx-2"
                      >🔗</button>{info.borrower.substring(0, 6)}...
                    {info.borrower.substring(info.borrower.length - 4)}
                  </h2>

                  <div
                    className="bg-gray-800 rounded-2xl p-4 md:p-6 flex flex-col 
                               items-center border border-gray-700"
                  >
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
                      <div className="flex items-center gap-2">
                        <p className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-bold">
                          {info.myIOUs || '0'} {info.iouSymbol}
                        </p>
                        <p className="bg-orange-300/50 px-3 py-1 rounded-full text-gray-200 font-bold">
                          Redeemable:{' '}
                          {(
                            ((parseFloat(info.myIOUs) || 0) /
                              (parseFloat(info.totalSupply) || 1)) *
                            (parseFloat(info.repayments) || 0)
                          ).toFixed(4)}
                        </p>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Amount"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      className="w-full mb-3 px-4 py-2 bg-blue-300/20
                                 text-gray-200 rounded-full placeholder-gray-400
                                 focus:outline-none focus:ring-2 
                                 focus:ring-blue-400 transition"
                    />

                    <div className="w-full flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => fundLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 bg-blue-400 hover:bg-[#356195] 
                                   text-white font-semibold rounded-full 
                                   transition focus:outline-none text-sm"
                      >
                        Fund
                      </button>

                      {isBorrower && (
                        <>
                          <button
                            onClick={() => drawDown(info.loanAddress, actionAmount)}
                            className="flex-1 py-2 text-white font-semibold rounded-full 
                                       hover:scale-105 transition text-sm bg-[#E3B23C]"
                          >
                            Draw Down
                          </button>
                          <button
                            onClick={() => repayLoan(info.loanAddress, actionAmount)}
                            className="flex-1 py-2 text-white font-semibold rounded-full 
                                       hover:scale-105 transition text-sm bg-[#E85A4F]"
                          >
                            Repay
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 bg-[#206a5d] hover:scale-105 
                                   text-white font-semibold rounded-full transition text-sm"
                      >
                        Redeem
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          /* --------------------- TABLE/ACCORDION STYLE --------------------- */
          <div className="space-y-2 w-full mt-4">
            {myLoans.map((info, i) => {
              const isBorrower =
                userAddress?.toLowerCase() === info.borrower.toLowerCase();
              return (
                <div key={info.loanAddress} className="bg-gray-700 rounded-3xl shadow-md">
                  {/* Summary row */}
                  <button
                    onClick={() => toggleExpandMyLoans(i)}
                    className="flex items-center justify-between px-4 py-3 w-full 
                               cursor-pointer hover:bg-gray-600 transition"
                  >
                    <div className="flex items-center grid grid-cols-5 w-full">
                      <span className="text-sm text-gray-300">
                      <button onClick={() => {navigator.clipboard.writeText(window.location.origin+ '?loan=' + info.loanAddress);toast.success('Copied to clipboard!')}} className="bg-gray-600 px-1 py-1 rounded-full"
                      >🔗</button>
                        🧑‍💼 {info.borrower.slice(0, 6)}...
                        {info.borrower.slice(-4)}
                      </span>
                      <span className="text-sm text-blue-300">
                        {info.underlyingSymbol || 'TOKEN'}
                      </span>
                      <span className="text-sm text-purple-300">
                        Goal: {info.loanGoal}
                      </span>
                      <span className="text-sm text-green-300">
                        APR: {(info.annualInterestRate / 100).toFixed(2)}%
                      </span>
                      <span className="text-sm text-pink-300">
                        Owed: {info.updatedTotalOwed}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      {expandedRowsMyLoans[i] ? '▼' : '▶'}
                    </div>
                  </button>

                  {expandedRowsMyLoans[i] && (
                    <div className="px-4 py-4 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs">IOU Name:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.iouName} ({info.iouSymbol})
                          </p>
                          <p className="text-gray-400 text-xs">Loan Goal:</p>
                          <p className="text-purple-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.loanGoal}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Total Funded:</p>
                          <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.totalFunded}
                          </p>
                          <p className="text-gray-400 text-xs">Interest:</p>
                          <p className="text-pink-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.updatedInterest}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Repayments / Interest:</p>
                          <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.repayments} / {info.interestrepayments}
                          </p>
                          <p className="text-gray-400 text-xs">Total Drawn Down:</p>
                          <p className="text-yellow-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.totalDrawnDown}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Loan:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {(
                              parseFloat(info.updatedTotalOwed || '0') -
                              parseFloat(info.updatedInterest || '0')
                            ).toFixed(2)}
                          </p>
                          <p className="text-gray-400 text-xs">Owed:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-hidden">
                            {info.updatedTotalOwed}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Amount"
                            value={actionAmount}
                            onChange={(e) => setActionAmount(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-800 text-gray-100 
                                       rounded-full placeholder-gray-500
                                       focus:outline-none focus:ring-2 
                                       focus:ring-pink-400 transition w-full"
                          />
                        </div>
                        <div className="flex justify-between gap-2">
                          <button
                            onClick={() => fundLoan(info.loanAddress, actionAmount)}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold 
                                       px-3 py-2 rounded-full text-sm w-full"
                          >
                            Fund
                          </button>
                          {isBorrower && (
                            <>
                              <button
                                onClick={() => drawDown(info.loanAddress, actionAmount)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white 
                                           font-semibold px-3 py-2 rounded-full text-sm w-full"
                              >
                                Draw
                              </button>
                              <button
                                onClick={() => repayLoan(info.loanAddress, actionAmount)}
                                className="bg-red-500 hover:bg-red-600 text-white 
                                           font-semibold px-3 py-2 rounded-full text-sm w-full"
                              >
                                Repay
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                            className="bg-blue-600 hover:bg-blue-700 text-white 
                                       font-semibold px-3 py-2 rounded-full text-sm w-full"
                          >
                            Redeem
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MY IOUs */}
      <div
        className="max-w-4xl w-full mt-8 p-6 bg-gray-800 rounded-3xl shadow-lg text-center 
                   flex flex-col ring-1 ring-[#36444c] transition-transform 
                   duration-300 hover:scale-105"
      >
        <h1 className="text-blue-400 text-2xl font-bold mb-4 uppercase">👛 IOUs</h1>
        {myIOUs.length === 0 && <p className="text-gray-400">No IOUs found.</p>}

        {myIOUs.length <= 2 ? (
          /* --------------------- CARD STYLE for MY IOUs --------------------- */
          <>
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
                  className="max-w-xl w-full mx-auto bg-blue-300/20 p-6 rounded-3xl shadow-md mt-8
                             hover:scale-[1.02] transform transition border border-blue-300/20"
                >
                  {/* Borrower heading */}
                  <h2 className="text-center text-[#B4C8CF] text-xl font-bold mb-3">
                 <button onClick={() => {navigator.clipboard.writeText(window.location.origin+ '?loan=' + info.loanAddress);toast.success('Copied to clipboard!')}} className="bg-gray-600 px-1 py-1 rounded-full mx-2"
                      >🔗</button>{info.borrower.substring(0, 6)}...
                    {info.borrower.slice(-4)}
                  </h2>

                  <div
                    className="bg-gray-800 rounded-2xl p-4 md:p-6 flex flex-col 
                               items-center border border-gray-700"
                  >
                    <div className="text-center mb-2 flex flex-wrap justify-center gap-2">
                      <h2 className="text-white text-xl font-bold bg-blue-400 py-1 px-2 rounded-full">
                        {info.iouName || 'SpotIOU'}
                      </h2>
                      <h2 className="text-white text-xl font-bold bg-blue-300/20 py-1 px-2 rounded-full">
                        {info.iouSymbol || 'IOU'}
                      </h2>
                    </div>

                    {/* Borrower (overflow-hidden) */}
                    <div className="text-center mb-2">
                      <p className="text-gray-400">Borrower:</p>
                      <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-hidden">
                        {info.borrower}
                      </p>
                    </div>

                    {/* Loan token */}
                    <div className="text-center mb-2">
                      <p className="text-gray-400">🪙 Loan Token:</p>
                      <p className="text-[#A5CAE1] text-lg font-semibold">
                        {info.underlyingSymbol || 'TOKEN'}
                      </p>
                    </div>

                    {/* Loan Goal */}
                    <div className="text-center mb-2">
                      <p className="text-gray-400">🎯 Loan Goal:</p>
                      <p className="bg-gray-700 px-3 py-1 rounded-full text-[#94C7DA] font-bold">
                        {info.loanGoal}
                      </p>
                    </div>

                    {/* Total Funded */}
                    <div className="m-2 text-center">
                      <p className="text-gray-400 text-sm mb-1">💰 Total Funded:</p>
                      <p className="bg-gray-700 px-3 py-1 rounded-full text-[#78ADC3] font-bold">
                        {info.totalFunded}
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="relative w-full h-3 rounded-full bg-blue-300/20 overflow-hidden mb-2">
                      <div
                        className="absolute left-0 top-0 h-full bg-blue-400"
                        style={{ width: `${progressPercent.toFixed(2)}%` }}
                      />
                    </div>

                    {/* Borrowed/Owed */}
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

                    {/* Annual Interest */}
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

                    {/* Repayments */}
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

                    {/* My IOUs + Redeemable */}
                    <div className="text-center mb-4">
                      <p className="text-gray-400 text-sm">👛 Your IOUs:</p>
                      <div className="flex items-center gap-2">
                        <p className="bg-gray-700 px-3 py-1 rounded-full text-gray-200 font-bold">
                          {info.myIOUs || '0'} {info.iouSymbol}
                        </p>
                        <p className="bg-orange-300/50 px-3 py-1 rounded-full text-gray-200 font-bold">
                          Redeemable:{' '}
                          {(
                            ((parseFloat(info.myIOUs) || 0) /
                              (parseFloat(info.totalSupply) || 1)) *
                            (parseFloat(info.repayments) || 0)
                          ).toFixed(4)}
                        </p>
                        <p className="bg-green-300/50 px-3 py-1 rounded-full text-gray-200 font-bold">
                        Claimable:{' '}
                        {info.interestClaimable}
                      </p>
                      </div>
                    </div>

                    {/* Action input */}
                    <input
                      type="text"
                      placeholder="Amount"
                      value={actionAmount}
                      onChange={(e) => setActionAmount(e.target.value)}
                      className="w-full mb-3 px-4 py-2 bg-blue-300/20 text-gray-200
                                 rounded-full placeholder-gray-400
                                 focus:outline-none focus:ring-2 
                                 focus:ring-blue-400 transition"
                    />

                    {/* Buttons (including Unfund) */}
                    <div className="w-full flex flex-wrap justify-center gap-3">
                      <button
                        onClick={() => fundLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 bg-blue-400 hover:bg-[#356195] 
                                   text-white font-semibold rounded-full
                                   transition focus:outline-none text-sm"
                      >
                        Fund
                      </button>

                      {isBorrower && (
                        <>
                          <button
                            onClick={() => drawDown(info.loanAddress, actionAmount)}
                            className="flex-1 py-2 text-white font-semibold rounded-full 
                                       hover:scale-105 transition text-sm bg-[#E3B23C]"
                          >
                            Draw Down
                          </button>
                          <button
                            onClick={() => repayLoan(info.loanAddress, actionAmount)}
                            className="flex-1 py-2 text-white font-semibold rounded-full 
                                       hover:scale-105 transition text-sm bg-[#E85A4F]"
                          >
                            Repay
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 bg-[#206a5d] hover:scale-105 
                                   text-white font-semibold rounded-full 
                                   transition text-sm"
                      >
                        Redeem
                      </button>
                      <button
                        onClick={() => unfundLoan(info.loanAddress, actionAmount)}
                        className="flex-1 py-2 bg-red-400 hover:bg-red-600
                                    text-white font-semibold rounded-full
                                    transition text-sm"
                      >
                        Unfund
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          /* --------------------- TABLE/ACCORDION STYLE for MY IOUs --------------------- */
          <div className="space-y-2 w-full mt-4">
            {myIOUs.map((info, i) => {
              const isBorrower =
                userAddress?.toLowerCase() === info.borrower.toLowerCase();
              return (
                <div key={info.loanAddress} className="bg-gray-700 rounded-3xl shadow-md">
                  {/* Summary row */}
                  <button
                    onClick={() => toggleExpandMyIOUs(i)}
                    className="flex items-center justify-between px-4 py-3 w-full
                               cursor-pointer hover:bg-gray-600 transition"
                  >
                    <div className="flex items-center grid grid-cols-5 w-full">
                      <span className="text-sm text-gray-300">
                        
                      <button onClick={() => {navigator.clipboard.writeText(window.location.origin+ '?loan=' + info.loanAddress);toast.success('Copied to clipboard!')}} className="bg-gray-600 px-1 py-1 rounded-full"
                      >🔗</button>
                        🧑‍💼 {info.borrower.slice(0, 6)}...
                        {info.borrower.slice(-4)}
                      </span>
                      <span className="text-sm text-blue-300">
                        {info.underlyingSymbol || 'TOKEN'}
                      </span>
                      <span className="text-sm text-purple-300">
                        Goal: {info.loanGoal}
                      </span>
                      <span className="text-sm text-green-300">
                        APR: {(info.annualInterestRate / 100).toFixed(2)}%
                      </span>
                      <span className="text-sm text-pink-300">
                        Owed: {info.updatedTotalOwed}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      {expandedRowsMyIOUs[i] ? '▼' : '▶'}
                    </div>
                  </button>

                  {expandedRowsMyIOUs[i] && (
                    <div className="px-4 py-4 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs">IOU Name:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.iouName} ({info.iouSymbol})
                          </p>
                          <p className="text-gray-400 text-xs">Loan Goal:</p>
                          <p className="text-purple-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.loanGoal}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Total Funded:</p>
                          <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.totalFunded}
                          </p>
                          <p className="text-gray-400 text-xs">My IOUs:</p>
                          <p className="text-pink-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.myIOUs}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Repayments / Interest:</p>
                          <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.repayments} / {info.interestrepayments}
                          </p>
                          <p className="text-gray-400 text-xs">Unfundable:</p>
                          <p className="text-yellow-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {parseFloat(info.totalFunded) -
                              parseFloat(info.totalDrawnDown) || '0'}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Borrower:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-hidden">
                            {info.borrower}
                          </p>
                          <p className="text-gray-400 text-xs">Redeemable:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {(
                              ((parseFloat(info.myIOUs) || 0) /
                                (parseFloat(info.totalSupply) || 1)) *
                              (parseFloat(info.repayments) || 0)
                            ).toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Amount"
                            value={actionAmount}
                            onChange={(e) => setActionAmount(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-800 text-gray-100 
                                       rounded-full placeholder-gray-500
                                       focus:outline-none focus:ring-2 
                                       focus:ring-pink-400 transition w-full"
                          />
                        </div>
                        <div className="flex justify-between gap-2">
                          <button
                            onClick={() => fundLoan(info.loanAddress, actionAmount)}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold 
                                       px-3 py-2 rounded-full text-sm w-full"
                          >
                            Fund
                          </button>
                          {isBorrower && (
                            <>
                              <button
                                onClick={() => drawDown(info.loanAddress, actionAmount)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white 
                                           font-semibold px-3 py-2 rounded-full text-sm w-full"
                              >
                                Draw
                              </button>
                              <button
                                onClick={() => repayLoan(info.loanAddress, actionAmount)}
                                className="bg-red-500 hover:bg-red-600 text-white 
                                           font-semibold px-3 py-2 rounded-full text-sm w-full"
                              >
                                Repay
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                            className="bg-blue-600 hover:bg-blue-700 text-white 
                                       font-semibold px-3 py-2 rounded-full text-sm w-full"
                          >
                            Redeem
                          </button>
                          {/* UNFUND button */}
                          <button
                            onClick={() => unfundLoan(info.loanAddress, actionAmount)}
                            className="bg-red-400 hover:bg-red-600 text-white 
                                       font-semibold px-3 py-2 rounded-full text-sm w-full"
                          >
                            Unfund
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ALL LOANS */}
      <div
        className="max-w-4xl w-full mt-8 p-6 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                   ring-1 ring-[#36444c] transition-transform duration-300 hover:scale-105"
      >
        <h1 className="text-blue-400 text-2xl font-bold mb-4 uppercase">All Loans</h1>
        {allLoans.length === 0 ? (
          <p className="text-gray-400">No loans found.</p>
        ) : (
          <div className="space-y-2">
            {allLoans.map((info, i) => {
              const isBorrower =
                userAddress?.toLowerCase() === info.borrower.toLowerCase();

              return (
                <div key={info.loanAddress} className="bg-gray-700 rounded-3xl shadow-md">
                  {/* SUMMARY ROW */}
                  <button
                    onClick={() => toggleExpand(i)}
                    className="flex items-center justify-between px-4 py-3 w-full 
                               cursor-pointer hover:bg-gray-600 transition"
                  >
                    <p className="text-sm text-gray-500 font-bold bg-gray-600/70 px-2 py-1 rounded-full">
                      #{allLoans.length - i - 1}
                    </p>
                    <div className="flex items-center grid grid-cols-5 w-full">
                      <span className="text-sm text-gray-300">
                        
                      <button onClick={() => {navigator.clipboard.writeText(window.location.origin+ '?loan=' + info.loanAddress);toast.success('Copied to clipboard!')}} className="bg-gray-600 px-1 py-1 rounded-full"
                      >🔗</button>
                        🧑‍💼 {info.borrower.slice(0, 6)}...
                        {info.borrower.slice(-4)}
                      </span>
                      <span className="text-sm text-blue-300">
                        {info.underlyingSymbol || 'TOKEN'}
                      </span>
                      <span className="text-sm text-purple-300">
                        Goal: {info.loanGoal}
                      </span>
                      <span className="text-sm text-green-300">
                        APR: {(info.annualInterestRate / 100).toFixed(2)}%
                      </span>
                      <span className="text-sm text-pink-300">
                        Owed: {info.updatedTotalOwed}
                      </span>
                    </div>
                    <div className="text-gray-400">
                      {expandedRows[i] ? '▼' : '▶'}
                    </div>
                  </button>

                  {/* EXPANDED CONTENT */}
                  {expandedRows[i] && (
                    <div className="px-4 py-4 border-t border-gray-600">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs">IOU Name:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.iouName} ({info.iouSymbol})
                          </p>
                          <p className="text-gray-400 text-xs">Loan Goal:</p>
                          <p className="text-purple-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.loanGoal}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Total Funded:</p>
                          <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.totalFunded}
                          </p>
                          <p className="text-gray-400 text-xs">My IOUs:</p>
                          <p className="text-pink-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.myIOUs}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Repayments / Interest:</p>
                          <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.repayments} / {info.interestrepayments}
                          </p>
                          <p className="text-gray-400 text-xs">Total Drawn Down:</p>
                          <p className="text-yellow-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {info.totalDrawnDown}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Borrower:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-hidden">
                            {info.borrower}
                          </p>
                          <p className="text-gray-400 text-xs">Redeemable:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full">
                            {(
                              ((parseFloat(info.myIOUs) || 0) /
                                (parseFloat(info.totalSupply) || 1)) *
                              (parseFloat(info.repayments) || 0)
                            ).toFixed(4)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center space-x-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div>
                          <input
                            type="text"
                            placeholder="Amount"
                            value={actionAmount}
                            onChange={(e) => setActionAmount(e.target.value)}
                            className="flex-1 px-4 py-2 bg-gray-800 text-gray-100 
                                       rounded-full placeholder-gray-500
                                       focus:outline-none focus:ring-2 
                                       focus:ring-pink-400 transition w-full"
                          />
                        </div>
                        <div className="flex justify-between gap-2">
                          <button
                            onClick={() => fundLoan(info.loanAddress, actionAmount)}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold 
                                       px-3 py-2 rounded-full text-sm w-full"
                          >
                            Fund
                          </button>
                          {isBorrower && (
                            <>
                              <button
                                onClick={() => drawDown(info.loanAddress, actionAmount)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white 
                                           font-semibold px-3 py-2 rounded-full text-sm w-full"
                              >
                                Draw
                              </button>
                              <button
                                onClick={() => repayLoan(info.loanAddress, actionAmount)}
                                className="bg-red-500 hover:bg-red-600 text-white 
                                           font-semibold px-3 py-2 rounded-full text-sm w-full"
                              >
                                Repay
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                            className="bg-blue-600 hover:bg-blue-700 text-white 
                                       font-semibold px-3 py-2 rounded-full text-sm w-full"
                          >
                            Redeem
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotIOUFactory;