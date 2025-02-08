import React, { useEffect, useState } from 'react';
import { ethers, N } from 'ethers';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Toaster, toast } from 'react-hot-toast';

// If you have your own custom hooks for provider/signer:
import { useEthersProvider, useEthersSigner } from './tl';

// ------------------------------
// 1) DAO Manager Contract
// ------------------------------
const DAOLoanManagerAddress = '0xD967d67a7493a819c5F4baAc81D259F68B3dc392';

const DAOLoanManagerABI = [
  // Loan enumeration
  "function loans(uint256) external view returns (address,uint256,uint256,bool,uint256,bool,uint256,uint256,uint256,uint256)",

  // Manager-level state
  "function allLoansFullyRepaid() external view returns (bool)",
  "function ethFromMint() external view returns (uint256)",

  // Because contract inherits ERC20 (DAO token)
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",

  // Additional getters
  "function ioUMint() external view returns (address)",
  "function usdcToken() external view returns (address)",
  "function swapRouter() external view returns (address)",
  "function wethAddress() external view returns (address)",
  "function priceFeed() external view returns (address)",
  "function getLatestPrice() external view returns (int256)",

  // Manager-level writes
  "function startLoan(uint256,uint256,uint256,address,uint256) external",
  "function drawDownLoan(uint256,uint256) external",
  "function buyETH(uint256,uint256) external",
  "function repayLoan(uint256,uint256) external",
  "function swapIOUForMintTokens(uint256,uint256) external",
  "function setIOUConversionRate(uint256,uint256) external",
  "function redeemHeldIOUsAndSwapToETH(uint256) external",
  "function burnDAOForETH(uint256) external"
];

// ------------------------------
// 2) IOUMint (factory) Contract
// ------------------------------
const IOUMintAddress = '0x08fd060b06975A8C78817E3B64199d10564b63fc';

const IOUMintABI = [
  "function getSpotInfo(address[] memory, address) external view returns ("
    + "tuple("
    + "  address loanAddress,"
    + "  address borrower,"
    + "  uint256 loanGoal,"
    + "  uint256 totalFunded,"
    + "  uint256 totalDrawnDown,"
    + "  uint256 accruedInterest,"
    + "  uint256 annualInterestRate,"
    + "  uint256 platformFeeRate,"
    + "  address feeAddress,"
    + "  uint256 totalSupply,"
    + "  string iouName,"
    + "  string iouSymbol,"
    + "  address underlying,"
    + "  string underlyingName,"
    + "  string underlyingSymbol,"
    + "  uint8 underlyingDecimals,"
    + "  uint256 updatedInterest,"
    + "  uint256 updatedTotalOwed,"
    + "  uint256 myIOUs,"
    + "  uint256 repayments,"
    + "  uint256 interestrepayments,"
    + "  uint256 interestClaimable,"
    + "  uint256 underlyingBalance,"
    + "  uint256 redeemed"
    + ")[]"
    + ")"
];

// ------------------------------
// 3) Individual Loan ABI
// ------------------------------
const SpotIOULoanABI = [
  "function fundLoan(uint256) external",
  "function unfundLoan(uint256) external",
  "function redeemIOUs(uint256) external",
  "function claimInterest(address) external",

  // Additional
  "function drawDown(uint256) external",
  "function repayLoan(uint256) external",
  "function loanToken() external view returns (address)",
  "function borrower() external view returns (address)",
  "function decimals() external view returns (uint8)"
];

// Minimal ERC20 for approvals
const ERC20ABI = [
  "function decimals() view returns (uint8)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)"
];

// ------------------------------
// Main UI Component
// ------------------------------
function DAOLoanManagerUI() {
  // Wagmi/Provider context
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address: userAddress } = useAccount();

  // Contracts in React.useMemo
  const managerContract = React.useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(DAOLoanManagerAddress, DAOLoanManagerABI, provider);
  }, [provider]);

  const IOUMintContract = React.useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(IOUMintAddress, IOUMintABI, provider);
  }, [provider]);

  // Global states from manager
  const [allRepaid, setAllRepaid] = useState(false);
  const [ethFromMint, setEthFromMint] = useState('0');
  const [daoEthBalance, setDaoEthBalance] = useState('0');

  const [daoName, setDaoName] = useState('');
  const [daoSymbol, setDaoSymbol] = useState('');
  const [daoDecimals, setDaoDecimals] = useState(18);
  const [daoSupply, setDaoSupply] = useState('0');
  const [myDaoBalance, setMyDaoBalance] = useState('0');

  const [ioUMint, setIoUMint] = useState('');
  const [usdcToken, setUsdcToken] = useState('');
  const [swapRouter, setSwapRouter] = useState('');
  const [wethAddress, setWethAddress] = useState('');
  const [priceFeed, setPriceFeed] = useState('');
  const [latestPrice, setLatestPrice] = useState('');

  // The enumerated loans array
  const [loans, setLoans] = useState([]);

  // Manager-level write inputs
  const [startLoanGoal, setStartLoanGoal] = useState('');
  const [annualInterest, setAnnualInterest] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [feeAddress, setFeeAddress] = useState('');
  const [loanIOUConversionRate, setLoanIOUConversionRate] = useState('1.0');

  const [drawLoanIndex, setDrawLoanIndex] = useState('');
  const [drawAmount, setDrawAmount] = useState('');

  const [buyLoanIndex, setBuyLoanIndex] = useState('');
  const [buyUsdcAmount, setBuyUsdcAmount] = useState('');

  const [repayLoanIndex, setRepayLoanIndex] = useState('');
  const [repayUsdcAmount, setRepayUsdcAmount] = useState('');

  const [swapIndex, setSwapIndex] = useState(0);
  const [swapIOUAmount, setSwapIOUAmount] = useState('');

  const [setIndex, setSetIndex] = useState('');
  const [newRate, setNewRate] = useState('');

  const [redeemLoanIndex, setRedeemLoanIndex] = useState('');
  const [burnAmount, setBurnAmount] = useState('');

  // Per-loan user input (fund, etc.)
  const [fundInput, setFundInput] = useState('');

  // ------------------------------
  // 1) fetchManagerData
  // ------------------------------
  async function fetchManagerData() {
    if (!managerContract) return;

    try {
      // Basic manager info
      const [
        _allRepaid,
        _ethFromMint,
        _daoName,
        _daoSymbol,
        _daoDecimals,
        _daoSupply
      ] = await Promise.all([
        managerContract.allLoansFullyRepaid(),
        managerContract.ethFromMint(),
        managerContract.name(),
        managerContract.symbol(),
        managerContract.decimals(),
        managerContract.totalSupply()
      ]);

      const [
        _ioUMint,
        _usdcToken,
        _swapRouter,
        _wethAddress,
        _priceFeed,
        _latestPrice
      ] = await Promise.all([
        managerContract.ioUMint(),
        managerContract.usdcToken(),
        managerContract.swapRouter(),
        managerContract.wethAddress(),
        managerContract.priceFeed(),
        managerContract.getLatestPrice()
      ]);

      let myDaoBal = 0n;
      if (userAddress) {
        myDaoBal = await managerContract.balanceOf(userAddress);
      }

      // Manager contract's own ETH balance
      const contractEthBal = await provider.getBalance(DAOLoanManagerAddress);

      // Set states
      setAllRepaid(_allRepaid);
      setEthFromMint(ethers.formatEther(_ethFromMint));
      setDaoName(_daoName);
      setDaoSymbol(_daoSymbol);
      setDaoDecimals(_daoDecimals);
      setDaoSupply(ethers.formatUnits(_daoSupply, _daoDecimals));
      setMyDaoBalance(ethers.formatUnits(myDaoBal, _daoDecimals));
      setIoUMint(_ioUMint);
      setUsdcToken(_usdcToken);
      setSwapRouter(_swapRouter);
      setWethAddress(_wethAddress);
      setPriceFeed(_priceFeed);

      const formatted = ethers.formatUnits(_latestPrice, 8);
      setLatestPrice(formatted);
      setDaoEthBalance(ethers.formatEther(contractEthBal));

      // Enumerate loans
      const discovered = await fetchLoans();
      setLoans(discovered);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching manager data');
    }
  }

  // ------------------------------
  // 2) fetchLoans
  // ------------------------------
  async function fetchLoans() {
    if (!managerContract) return [];
    const MAX_LOANS = 50;
    const results = [];

    for (let i = 0; i < MAX_LOANS; i++) {
      try {
        const ln = await managerContract.loans(i);
        results.push({
          index: i,
          loanAddress: ln[0],
          loanGoal: ethers.formatUnits(ln[1], 6),
          totalDrawnDown: ethers.formatUnits(ln[2], 6),
          loanDrawn: ln[3],
          loanDrawnTime: ln[4].toString(),
          fullyRepaid: ln[5],
          iouConversionRate: ethers.formatUnits(ln[6], 18),
          totalBuyETH: ethers.formatEther(ln[7]),
          soldETH: ethers.formatEther(ln[8]),
          profitETH: ethers.formatEther(ln[9])
        });
      } catch (err) {
        break; // we assume no more loans
      }
    }

    // Now call IOUMint.getSpotInfo to get borrower, iouName, userIOUBalance, etc.
    if (!IOUMintContract || !userAddress || results.length === 0) {
      return results;
    }

    const addresses = results.map((r) => r.loanAddress);
    try {
      const infoArray = await IOUMintContract.getSpotInfo(addresses, userAddress);
      infoArray.forEach((info, i) => {
        const {
          borrower,
          iouName,
          iouSymbol,
          annualInterestRate,
          myIOUs,
          interestClaimable,
          underlyingSymbol,
          underlyingDecimals,
          totalFunded,
          underlyingBalance,
          interestrepayments,
          repayments
        } = info;

        results[i].borrower = borrower;
        results[i].iouName = iouName;
        results[i].iouSymbol = iouSymbol;
        results[i].annualInterestRate = Number(annualInterestRate);
        results[i].userIOUBalance = ethers.formatUnits(myIOUs, 18);
        results[i].claimableInterest = ethers.formatUnits(interestClaimable, underlyingDecimals);
        results[i].underlyingSymbol = underlyingSymbol;
        results[i].totalFunded = ethers.formatUnits(totalFunded, 6);
        results[i].underlyingBalance = ethers.formatUnits(underlyingBalance, underlyingDecimals);
        results[i].interestrepayments = ethers.formatUnits(interestrepayments, underlyingDecimals);
        results[i].repayments = ethers.formatUnits(totalFunded, 6);
      });
    } catch (err) {
      console.error("IOUMint getSpotInfo error:", err);
    }

    return results;
  }

  // ------------------------------
  // 3) Manager-level writes
  // ------------------------------
  function getMgr() {
    if (!signer) {
      toast.error('Connect wallet first');
      return null;
    }
    return managerContract.connect(signer);
  }

  const handleStartLoan = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const _goal = ethers.parseUnits(startLoanGoal || '0', 6);
      const _annual = annualInterest ? BigInt(annualInterest) : 0n;
      const _platform = platformFee ? BigInt(platformFee) : 0n;
      const feeAddr = feeAddress || ethers.ZeroAddress;
      const iouRate = ethers.parseUnits(loanIOUConversionRate || '1.0', 18);

      const tx = await mgr.startLoan(_goal, _annual, _platform, feeAddr, iouRate);
      await tx.wait();

      toast.success("startLoan successful!");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("startLoan failed");
    }
  };

  const handleDrawDownLoan = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(drawLoanIndex) || 0;
      const amt = ethers.parseUnits(drawAmount || '0', 6);

      const tx = await mgr.drawDownLoan(idx, amt);
      await tx.wait();
      toast.success("drawDownLoan successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("drawDownLoan failed");
    }
  };

  const handleBuyETH = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(buyLoanIndex) || 0;
      const amt = ethers.parseUnits(buyUsdcAmount || '0', 6);

      const tx = await mgr.buyETH(idx, amt);
      await tx.wait();
      toast.success("buyETH successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("buyETH failed");
    }
  };

  const handleRepayLoan = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(repayLoanIndex) || 0;
      const amt = ethers.parseUnits(repayUsdcAmount || '0', 6);

      const tx = await mgr.repayLoan(idx, amt);
      await tx.wait();
      toast.success("repayLoan successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("repayLoan failed");
    }
  };

  const handleSwapIOU = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(swapIndex, 10) || 0;
      const amt = ethers.parseUnits(swapIOUAmount || '0', 18);

      // Approve the IOU token
      const ln = await managerContract.loans(idx);
      const iouAddr = ln[0];
      const iouToken = new ethers.Contract(iouAddr, ERC20ABI, signer);

      const allowance = await iouToken.allowance(userAddress, DAOLoanManagerAddress);
      if (allowance < amt) {
        const approveTx = await iouToken.approve(DAOLoanManagerAddress, amt);
        await approveTx.wait();
        toast.success(`Approved IOU for loan #${idx}`);
      }

      const tx = await mgr.swapIOUForMintTokens(idx, amt);
      await tx.wait();
      toast.success("swapIOUForMintTokens successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("swapIOUForMintTokens failed");
    }
  };

  const handleSetIOURate = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(setIndex) || 0;
      const parsed = ethers.parseUnits(newRate || '1.0', 18);

      const tx = await mgr.setIOUConversionRate(idx, parsed);
      await tx.wait();
      toast.success("setIOUConversionRate successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("setIOUConversionRate failed");
    }
  };

  const handleRedeemIOUs = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(redeemLoanIndex) || 0;

      const tx = await mgr.redeemHeldIOUsAndSwapToETH(idx);
      await tx.wait();
      toast.success("redeemHeldIOUsAndSwapToETH successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("redeemHeldIOUsAndSwapToETH failed");
    }
  };

  const handleBurnDAOForETH = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const parsed = ethers.parseUnits(burnAmount || '0', daoDecimals);

      const tx = await mgr.burnDAOForETH(parsed);
      await tx.wait();
      toast.success("burnDAOForETH successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("burnDAOForETH failed");
    }
  };

  // ------------------------------
  // 4) Per-loan user actions
  // ------------------------------
  function getSpotIOULoanContract(loanAddr) {
    if (!loanAddr || !signer) return null;
    return new ethers.Contract(loanAddr, SpotIOULoanABI, signer);
  }

  async function fundLoan(loanAddr, amount) {
    if (!signer) {
      toast.error("Connect wallet first");
      return;
    }
    try {
      const loan = getSpotIOULoanContract(loanAddr);
      if (!loan) return toast.error("No loan contract or signer");

      const tokenAddr = await loan.loanToken();
      if (tokenAddr === ethers.ZeroAddress) {
        toast.error("Native-asset funding not supported in snippet");
        return;
      }
      // Approve + fund
      const token = new ethers.Contract(tokenAddr, ERC20ABI, signer);
      const decimals = await token.decimals();
      const parsed = ethers.parseUnits(amount || '0', decimals);

      const allowance = await token.allowance(userAddress, loanAddr);
      if (allowance < parsed) {
        const txA = await token.approve(loanAddr, parsed);
        await txA.wait();
      }

      const tx = await loan.fundLoan(parsed);
      await tx.wait();
      toast.success("Funded loan");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("Error funding loan");
    }
  }

  async function redeemIOUs(loanAddr, iouAmt) {
    if (!signer) {
      toast.error("Connect wallet first");
      return;
    }
    try {
      const loan = getSpotIOULoanContract(loanAddr);
      if (!loan) return;
      const decimals = await loan.decimals();
      const parsed = ethers.parseUnits(iouAmt || '0', decimals);

      const tx = await loan.redeemIOUs(parsed);
      await tx.wait();
      toast.success("Redeemed IOUs");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("Error redeeming IOUs");
    }
  }

  async function claimInterest(loanAddr) {
    if (!signer) {
      toast.error("Connect wallet first");
      return;
    }
    try {
      const loan = getSpotIOULoanContract(loanAddr);
      if (!loan) return;
      const tx = await loan.claimInterest(userAddress);
      await tx.wait();
      toast.success("Claimed interest");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("Error claiming interest");
    }
  }

  async function unfundLoan(loanAddr, amount) {
    if (!signer) {
      toast.error("Connect wallet first");
      return;
    }
    try {
      const loan = getSpotIOULoanContract(loanAddr);
      if (!loan) return;
      const tokenAddr = await loan.loanToken();
      const token = new ethers.Contract(tokenAddr, ERC20ABI, signer);
      const decimals = await token.decimals();
      const parsed = ethers.parseUnits(amount || '0', decimals);

      const tx = await loan.unfundLoan(parsed);
      await tx.wait();
      toast.success("Unfunded loan");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("Error unfunding loan");
    }
  }// Pseudocode in your main component:

// Additional state for showing user’s potential “Burn → ETH” share
const [burnPreview, setBurnPreview] = useState('0');

// Re-compute whenever burnAmount, loans, or other related values change
useEffect(() => {
  if (!burnAmount || parseFloat(burnAmount) <= 0 || parseFloat(daoSupply) <= 0) {
    setBurnPreview('0');
    return;
  }

  // 1) sum up all profitETH from your enumerated loans
  let totalProfit = 0;
  for (const ln of loans) {
    totalProfit += parseFloat(ln.profitETH) || 0;
  }

  // 2) totalDistribution = totalProfit + ethFromMint
  const totalDistribution = totalProfit + parseFloat(ethFromMint || '0');

  // 3) fraction = burnAmount / daoSupply
  const fraction = parseFloat(burnAmount) / parseFloat(daoSupply);

  // 4) approximate userShare
  const userShare = fraction * totalDistribution;

  setBurnPreview(userShare.toFixed(18));
}, [burnAmount, loans, ethFromMint, daoSupply]);


  // ------------------------------
  // On mount or user change
  // ------------------------------
  useEffect(() => {
    if (managerContract) {
      fetchManagerData();
    }
  }, [managerContract, userAddress]);

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-pink-50 to-rose-100 text-gray-800 px-4 py-6">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-center">
        <div className="absolute top-0 right-0 p-4">
        <ConnectButton />
        </div>
      </header>
      
        <h1 className="text-5xl font-extrabold text-pink-600 tracking-tight text-center mx-auto mt-4 mb-4">
            ✨ GigaStrat ✨
          </h1>
          <h2 className="text-3xl font-semibold bg-pink-300 text-white p-2 rounded-full text-center mx-auto w-[400px]">
          {Number(daoEthBalance).toFixed(4)} ETH HODLD
        </h2>
        <h2 className="text-xl font-semibold bg-pink-300 text-white p-2 rounded-full text-center mx-auto w-[200px] mt-1">
          {Number(myDaoBalance).toFixed(4)} GG
        </h2>

        {/* swapIOUForMintTokens */}
        <div className="">
        <div className="max-w-6xl mx-auto mt-6 text-center">
          <div className='bg-white/70 backdrop-blur-sm rounded-[50px] p-4 w-[400px]  mx-auto'>
          <h3 className="text-lg font-semibold text-green-600 mb-3">
            🌱 Swap IOU → DAO
          </h3>
            <select
              className="w-full px-3 py-2 bg-green-100 rounded-full border border-green-100 mb-2 text-green-500 font-semibold"
              placeholder="Loan index"
              value={swapIndex}
              onChange={(e) => setSwapIndex(e.target.value)}
            >
              {loans.map((ln) => (
                <option key={ln.index} value={ln.index}>
                  #{ln.index} - {ln.userIOUBalance} {ln.iouName} @ {ln.iouConversionRate}
                </option>
              ))}
              </select>
            <input
              className="w-full px-3 py-2 bg-green-200 rounded-full border border-green-100 mb-2"
              placeholder="IOU amount"
              value={swapIOUAmount}
              onChange={(e) => setSwapIOUAmount(e.target.value)}
            />
            <p className="text-green-500 font-semibold">
              {swapIOUAmount} IOU → {Number(swapIOUAmount) * Number(loans[swapIndex]?.iouConversionRate)} GG
            </p>
            <button
              onClick={handleSwapIOU}
              className="w-full py-2 bg-green-200 rounded-full font-medium hover:bg-green-300 text-green-500 transition-colors"
            >
              Mint DAO
            </button>
            <h3 className="text-lg font-semibold text-pink-600 m-3">
            🔥 Burn DAO for ETH
          </h3>
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-pink-100"
              placeholder="Amount of DAO"
              value={burnAmount}
              onChange={(e) => setBurnAmount(e.target.value)}
            />
            {burnAmount && parseFloat(burnAmount) > 0 && (
              <p className="text-pink-600 font-semibold">
                {burnAmount} GG → {burnPreview} ETH
              </p>
            )}
            <button
              onClick={handleBurnDAOForETH}
              className="w-full py-2 bg-pink-200 rounded-full font-medium hover:bg-pink-300 text-pink-500 transition-colors mt-2"
            >
              Burn DAO
            </button>
          </div>
          </div>
        </div>


      {/* 5) Loan List + Per-Loan Actions */}
      <div className="max-w-7xl mx-auto mt-8 p-2">
        <h2 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400">
          DAO Loans 
        </h2>

        {loans.length === 0 ? (
          <p className="text-pink-600 text-center font-medium">
            No loans found or none discovered so far.
          </p>
        ) : (
          <div className="space-y-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((ln) => (
              <div
                key={ln.index}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 shadow-md ring-1 ring-pink-200 relative text-center max-w-3xl mx-auto w-3xl"
              >
                  <div className="mt-1 mx-auto">
                    {ln.fullyRepaid ? (
                      <span className="inline-block px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded-full">
                        Fully Repaid
                        <span className="text-xs text-gray-500"> - 
                          Drawn on:{" "}
                          {new Date(parseInt(ln.loanDrawnTime, 10) * 1000).toLocaleDateString()}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded-full">
                        Not Repaid - 
                        <span className="text-xs text-gray-500">
                          Drawn on:{" "}
                          {new Date(parseInt(ln.loanDrawnTime, 10) * 1000).toLocaleDateString()}
                        </span>
                      </span>
                    )}
                  </div>
                  <p className="text-lg font-semibold text-pink-600 mt-2">
                  <span className="text-white bg-blue-300 rounded-full px-2 py-1 w-1/2 mx-auto font-semibold mt-4">
                      {ln.iouName}
                    </span><span className="text-white bg-blue-200 rounded-full px-2 py-1 w-1/2 mx-auto font-semibold ml-1 mt-4">
                      {ln.iouSymbol}
                    </span>
                    </p>
                {/* Loan Info */}
                <div className="text-sm text-gray-700 mb-3 md:mb-0 text-center justify-center align-middle grid grid-cols-2 gap-2">
                  <p className="absolute top-2 left-2 mb-1 font-bold bg-pink-200 text-white rounded-full px-2 py-1 w-9 text-xl">
                    {ln.index}
                  </p>
                  <div className="">
                  <p className="text-pink-600 font-semibold text-lg mt-2">
                    Loan Goal
                  </p>
                  <p className="text-xl font-semibold text-white text-center bg-pink-200 rounded-full px-2 py-1 pr-0">
                    {ln.loanGoal} USDC @ <span className="bg-yellow-300 text-white rounded-full px-2 py-1 font-semibold text-xl">{ln.annualInterestRate/100}%</span>
                  </p>
                  </div>
                  <div className="">
                    <p className="text-pink-600 font-semibold text-lg mt-2">
                      Bought
                    </p>
                  <p className="bg-pink-300 text-white rounded-full px-2 py-1 font-semibold text-xl">
                  {Number(ln.totalBuyETH).toFixed(4)} ETH
                  </p>
                  </div>
                  
                  <div className="grid-2">
                    <p className="text-pink-600 font-semibold text-lg">
                    Filled
                    </p>
                  <p className="bg-pink-300 text-white rounded-full px-2 py-1 font-semibold text-xl">
                  {Number(ln.totalFunded).toFixed(4)} USDC
                  </p>
                  </div>
                  <div className="">
                    <p className="text-pink-600 font-semibold text-lg">
                      Drawn
                    </p>
                  <p className="bg-orange-300 text-white rounded-full px-2 py-1 font-semibold text-xl">
                  {Number(ln.totalDrawnDown).toFixed(4)} USDC
                  </p>
                  </div>
                  <div className="">
                    <p className="text-pink-600 font-semibold text-lg w-full">
                      My IOUs
                    </p>
                    <p className="bg-blue-300 text-white rounded-full px-2 py-1 w-1/2 mx-auto font-semibold text-xl w-full">
                      {ln.userIOUBalance} {ln.iouSymbol}
                    </p>
                    </div>
                    <div>
                    <p className="text-yellow-600 font-semibold text-lg w-full">
                      Repaid
                    </p>
                    <p className="bg-yellow-300 text-white rounded-full px-2 py-1 w-1/2 mx-auto font-semibold text-xl w-full">
                      {ln.repayments-ln.interestrepayments} {ln.underlyingSymbol}
                    </p>
                    </div>
                    <div>
                    <p className="text-green-600 font-semibold text-lg">
                      Claimable Interest
                    </p>
                    <p className="bg-green-300 text-white rounded-full px-2 py-1 font-semibold text-xl">
                      {ln.claimableInterest} {ln.underlyingSymbol}
                    </p>
                    </div>
                    <div>
                    <p className="text-pink-600 font-semibold text-lg">
                      My {ln.underlyingSymbol}
                    </p>
                    <p className="bg-pink-300 text-white rounded-full px-2 py-1 font-semibold text-xl">
                      {Number(ln.underlyingBalance).toFixed(4)} {ln.underlyingSymbol}
                    </p>
                    </div>
                </div>

                {/* Fund input + actions */}
                <input
                  type="text"
                  placeholder="Amount"
                  className="w-full px-3 py-2 bg-pink-100 rounded-full border border-pink-200 m-2"
                  value={fundInput}
                  onChange={(e) => setFundInput(e.target.value)}
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fundLoan(ln.loanAddress, fundInput)}
                    className="bg-pink-200 hover:bg-pink-300 text-white font-semibold px-4 py-1 rounded-full transition-colors"
                  >
                    Fund
                  </button>
                  <button
                    onClick={() => redeemIOUs(ln.loanAddress, fundInput)}
                    className="bg-blue-200 hover:bg-blue-300 text-white font-semibold px-4 py-1 rounded-full transition-colors"
                  >
                    Redeem
                  </button>
                  <button
                    onClick={() => claimInterest(ln.loanAddress)}
                    className="bg-green-200 hover:bg-green-300 text-white font-semibold px-4 py-1 rounded-full transition-colors"
                  >
                    Claim
                  </button>
                  <button
                    onClick={() => unfundLoan(ln.loanAddress, fundInput)}
                    className="bg-red-200 hover:bg-red-300 text-white font-semibold px-4 py-1 rounded-full transition-colors"
                  >
                    Unfund
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Manager summary */}
      {userAddress=='0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5' && (<>
      <div className="max-w-6xl mx-auto mb-6 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
        <h2 className="text-lg font-semibold text-pink-600">
          Global Status 🌸
        </h2>
        <div className="text-sm space-y-2 mt-2">
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <p><span className="font-semibold text-rose-600">DAO Name/Symbol:</span> {daoName} ({daoSymbol})</p>
              <p><span className="font-semibold text-rose-600">Decimals:</span> {daoDecimals}</p>
              <p><span className="font-semibold text-rose-600">DAO Supply:</span> {daoSupply}</p>
              <p><span className="font-semibold text-rose-600">My DAO Balance:</span> {myDaoBalance}</p>
            </div>
            <div>
              <p>
                <span className="font-semibold text-rose-600">All Loans Repaid?:</span>
                {allRepaid ? <span className="text-green-600 ml-1">Yes</span> : <span className="text-red-500 ml-1">No</span>}
              </p>
              <p><span className="font-semibold text-rose-600">ethFromMint:</span> {ethFromMint}</p>
              <p><span className="font-semibold text-rose-600">DAO’s ETH:</span> {daoEthBalance} ETH</p>
            </div>
          </div>

          <hr className="border-rose-200 my-2"/>
          <div className="grid md:grid-cols-2 gap-2">
            <div>
              <p><span className="font-semibold text-rose-600">Price Feed:</span> {priceFeed}</p>
              <p><span className="font-semibold text-rose-600">Latest Price:</span> {latestPrice}</p>
            </div>
            <div>
              <p><span className="font-semibold text-rose-600">ioUMint:</span> {ioUMint}</p>
              <p><span className="font-semibold text-rose-600">USDC Token:</span> {usdcToken}</p>
              <p><span className="font-semibold text-rose-600">Swap Router:</span> {swapRouter}</p>
              <p><span className="font-semibold text-rose-600">WETH Address:</span> {wethAddress}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Manager-level calls */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
        {/* startLoan */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
          <h3 className="text-lg font-semibold text-pink-600 mb-3">💖 Start a New Loan</h3>
          <div className="space-y-2 text-sm">
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
              placeholder="Loan Goal (USDC, 6 decimals)"
              value={startLoanGoal}
              onChange={(e) => setStartLoanGoal(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
              placeholder="Annual Interest Rate (bps)"
              value={annualInterest}
              onChange={(e) => setAnnualInterest(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
              placeholder="Platform Fee Rate (bps)"
              value={platformFee}
              onChange={(e) => setPlatformFee(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
              placeholder="Fee Address"
              value={feeAddress}
              onChange={(e) => setFeeAddress(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
              placeholder="IOU→DAO rate (e.g. 1.0 => 1e18)"
              value={loanIOUConversionRate}
              onChange={(e) => setLoanIOUConversionRate(e.target.value)}
            />
            <button
              onClick={handleStartLoan}
              className="w-full py-2 bg-pink-200 rounded-full font-medium hover:bg-pink-300 text-pink-800 transition-colors"
            >
              startLoan
            </button>
          </div>
        </div>

        {/* buyETH */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
          <h3 className="text-lg font-semibold text-yellow-600 mb-3">🌻 Buy ETH</h3>
          <div className="space-y-2 text-sm">
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-yellow-100"
              placeholder="Loan Index"
              value={buyLoanIndex}
              onChange={(e) => setBuyLoanIndex(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-yellow-100"
              placeholder="USDC Amount"
              value={buyUsdcAmount}
              onChange={(e) => setBuyUsdcAmount(e.target.value)}
            />
            <button
              onClick={handleBuyETH}
              className="w-full py-2 bg-yellow-200 rounded-full font-medium hover:bg-yellow-300 text-yellow-800 transition-colors"
            >
              buyETH
            </button>
          </div>
        </div>
      </div>

      {/* Next row of manager calls */}
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 mt-6">
        {/* redeemHeldIOUsAndSwapToETH */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
          <h3 className="text-lg font-semibold text-orange-600 mb-3">
            🪄 Redeem IOUs &amp; Swap
          </h3>
          <div className="space-y-2 text-sm">
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-orange-100"
              placeholder="Loan Index"
              value={redeemLoanIndex}
              onChange={(e) => setRedeemLoanIndex(e.target.value)}
            />
            <button
              onClick={handleRedeemIOUs}
              className="w-full py-2 bg-orange-200 rounded-full font-medium hover:bg-orange-300 text-orange-800 transition-colors"
            >
              redeemHeldIOUsAndSwapToETH
            </button>
          </div>
        </div>


        {/* drawDownLoan */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
          <h3 className="text-lg font-semibold text-purple-600 mb-3">
            🚰 Draw Down Loan
          </h3>
          <div className="space-y-2 text-sm">
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-purple-100"
              placeholder="Loan index"
              value={drawLoanIndex}
              onChange={(e) => setDrawLoanIndex(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-purple-100"
              placeholder="Amount in USDC"
              value={drawAmount}
              onChange={(e) => setDrawAmount(e.target.value)}
            />
            <button
              onClick={handleDrawDownLoan}
              className="w-full py-2 bg-purple-200 rounded-full font-medium hover:bg-purple-300 text-purple-800 transition-colors"
            >
              drawDownLoan
            </button>
          </div>
        </div>

        {/* repayLoan */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
          <h3 className="text-lg font-semibold text-red-600 mb-3">
            💵 Repay Loan
          </h3>
          <div className="space-y-2 text-sm">
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-red-100"
              placeholder="Loan index"
              value={repayLoanIndex}
              onChange={(e) => setRepayLoanIndex(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-red-100"
              placeholder="Amount in USDC"
              value={repayUsdcAmount}
              onChange={(e) => setRepayUsdcAmount(e.target.value)}
            />
            <button
              onClick={handleRepayLoan}
              className="w-full py-2 bg-red-200 rounded-full font-medium hover:bg-red-300 text-red-800 transition-colors"
            >
              repayLoan
            </button>
          </div>
        </div>


        {/* setIOUConversionRate */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
          <h3 className="text-lg font-semibold text-blue-600 mb-3">
            ⚙️ Update IOU Rate
          </h3>
          <div className="space-y-2 text-sm">
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-blue-100"
              placeholder="Loan index"
              value={setIndex}
              onChange={(e) => setSetIndex(e.target.value)}
            />
            <input
              className="w-full px-3 py-2 bg-white rounded-full border border-blue-100"
              placeholder="New rate in 1e18"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
            />
            <button
              onClick={handleSetIOURate}
              className="w-full py-2 bg-blue-200 rounded-full font-medium hover:bg-blue-300 text-blue-800 transition-colors"
            >
              setIOUConversionRate
            </button>
          </div>
        </div>
      </div>
      </>)}
    </div>
  );
}

export default DAOLoanManagerUI;
