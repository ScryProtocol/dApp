import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Toaster, toast } from 'react-hot-toast';

// If you have your own custom hooks for provider/signer:
import { useEthersProvider, useEthersSigner } from './tl';

// ------------------------------
// 1) GG Manager Contract
// ------------------------------
const GGLoanManagerAddress = '0x67961F3F6aE5b9b251bCCAEd54e7c0Db7b9d5265';

// Updated ABI to match the new contract
const GGLoanManagerABI = [
  "function loans(uint256) external view returns (address loanAddress, uint256 loanGoal, uint256 totalDrawnDown, bool loanDrawn, uint256 loanDrawnTime, bool fullyRepaid, uint256 iouConversionRate, uint256 totalBuyETH, uint256 soldETH, uint256 profitETH)",
  "function ethFromMint() external view returns (uint256)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function getLatestPrice() external view returns (int256)",
  "function ioUMint() external view returns (address)",
  "function usdcToken() external view returns (address)",
  "function swapRouter() external view returns (address)",
  "function wethAddress() external view returns (address)",
  "function priceFeed() external view returns (address)",

  // Manager-level writes
  "function setRole(address _address, uint256 _role) external",
  "function startLoan(uint256 _loanGoal, address _token, uint256 _annualInterestRate, uint256 _platformFeeRate, address _feeAddress, uint256 _loanIOUConversionRate) external",
  "function openLoan() external",

  // Combined "quick" calls
  "function drawDownAndBuyETH(uint256 loanIndex) external",
  "function repayLoan(uint256 loanIndex) external",

  // Older/manual calls
  "function drawDownLoan(uint256 loanIndex, uint256 amount) external",
  "function buyETH(uint256 loanIndex, uint256 usdcAmount) external",
  "function repayLoanUSDC(uint256 loanIndex, uint256 usdcAmount) external",
  "function redeemHeldIOUsAndSwapToETH(uint256 loanIndex) external",
  "function swapIOUForMintTokens(uint256 loanIndex, uint256 iouAmount) external",
  "function burnDAOForETH(uint256 GGTokenAmount) external"
];

// ------------------------------
// 2) IOUMint (factory) Contract
// ------------------------------
const IOUMintAddress = '0x08fd060b06975A8C78817E3B64199d10564b63fc';
const IOUMintABI = [
  "function getSpotInfo(address[] memory, address) external view returns (" +
    "tuple(" +
    "  address loanAddress," +
    "  address borrower," +
    "  uint256 loanGoal," +
    "  uint256 totalFunded," +
    "  uint256 totalDrawnDown," +
    "  uint256 accruedInterest," +
    "  uint256 annualInterestRate," +
    "  uint256 platformFeeRate," +
    "  address feeAddress," +
    "  uint256 totalSupply," +
    "  string iouName," +
    "  string iouSymbol," +
    "  address underlying," +
    "  string underlyingName," +
    "  string underlyingSymbol," +
    "  uint8 underlyingDecimals," +
    "  uint256 updatedInterest," +
    "  uint256 updatedTotalOwed," +
    "  uint256 myIOUs," +
    "  uint256 repayments," +
    "  uint256 interestrepayments," +
    "  uint256 interestClaimable," +
    "  uint256 underlyingBalance," +
    "  uint256 redeemed" +
    ")[]"
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

const ERC20ABI = [
  "function decimals() view returns (uint8)",
  "function allowance(address,address) view returns (uint256)",
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)" 
];

// ------------------------------
// Main UI Component
// ------------------------------
function GGLoanManagerUI() {
  // Wagmi/Provider context
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address: userAddress } = useAccount();

  // Contracts in React.useMemo
  const managerContract = React.useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(GGLoanManagerAddress, GGLoanManagerABI, provider);
  }, [provider]);

  const IOUMintContract = React.useMemo(() => {
    if (!provider) return null;
    return new ethers.Contract(IOUMintAddress, IOUMintABI, provider);
  }, [provider]);

  // Global states from manager
  const [ethFromMint, setEthFromMint] = useState('0');
  const [GGEthBalance, setGGEthBalance] = useState('0');

  const [GGName, setGGName] = useState('');
  const [GGSymbol, setGGSymbol] = useState('');
  const [GGDecimals, setGGDecimals] = useState(18);
  const [GGSupply, setGGSupply] = useState('0');
  const [myGGBalance, setMyGGBalance] = useState('0');

  const [ioUMint, setIoUMint] = useState('');
  const [usdcToken, setUsdcToken] = useState('');
  const [swapRouter, setSwapRouter] = useState('');
  const [wethAddress, setWethAddress] = useState('');
  const [priceFeed, setPriceFeed] = useState('');
  const [latestPrice, setLatestPrice] = useState('');

  // Whether we can call `openLoan()`
  const [canOpenLoan, setCanOpenLoan] = useState(false);

  // The enumerated loans array
  const [loans, setLoans] = useState([]);

  // Manager-level write inputs
  const [startLoanGoal, setStartLoanGoal] = useState('');
  const [startLoanToken, setStartLoanToken] = useState(usdcToken);
  const [annualInterest, setAnnualInterest] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [feeAddress, setFeeAddress] = useState('');
  const [loanIOUConversionRate, setLoanIOUConversionRate] = useState('1.0');

  // For the older draw/buy calls
  const [drawLoanIndex, setDrawLoanIndex] = useState('');
  const [drawAmount, setDrawAmount] = useState('');
  const [buyLoanIndex, setBuyLoanIndex] = useState('');
  const [buyUsdcAmount, setBuyUsdcAmount] = useState('');

  // "repayLoan(loanIndex)" input
  const [repayLoanIndex, setRepayLoanIndex] = useState('');

  // repayLoanUSDC(loanIndex, usdcAmount)
  const [repayLoanIndexUSDC, setRepayLoanIndexUSDC] = useState('');
  const [repayUsdcAmount, setRepayUsdcAmount] = useState('');

  // For swapping IOU -> GG
  const [swapIndex, setSwapIndex] = useState(0);
  const [swapIOUAmount, setSwapIOUAmount] = useState('');

  // For setting the IOU conversion rate (example stub)
  const [setIndex, setSetIndex] = useState('');
  const [newRate, setNewRate] = useState('');

  // For redeeming IOUs -> ETH
  const [redeemLoanIndex, setRedeemLoanIndex] = useState('');

  // For burning GG -> ETH
  const [burnAmount, setBurnAmount] = useState('');

  // Per-loan user input (fund, etc.)
  const [fundInput, setFundInput] = useState('');

  // For previewing burn → ETH
  const [burnPreview, setBurnPreview] = useState('0');

  // -------------------------------------------------------------------
  // 1) fetchManagerData
  // -------------------------------------------------------------------
  async function fetchManagerData() {
    if (!managerContract) return;

    try {
      const [
        _ethFromMint,
        _GGName,
        _GGSymbol,
        _GGDecimals,
        _GGSupply
      ] = await Promise.all([
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

      let myGGBal = 0n;
      if (userAddress) {
        myGGBal = await managerContract.balanceOf(userAddress);
      }

      // Manager contract's own ETH balance
      const contractEthBal = await provider.getBalance(GGLoanManagerAddress);

      setEthFromMint(ethers.formatEther(_ethFromMint));
      setGGName(_GGName);
      setGGSymbol(_GGSymbol);
      setGGDecimals(Number(_GGDecimals));
      setGGSupply(ethers.formatUnits(_GGSupply, _GGDecimals));
      setMyGGBalance(ethers.formatUnits(myGGBal, _GGDecimals));
      setIoUMint(_ioUMint);
      setUsdcToken(_usdcToken);
      setSwapRouter(_swapRouter);
      setWethAddress(_wethAddress);
      setPriceFeed(_priceFeed);

      const formattedPrice = ethers.formatUnits(_latestPrice, 8);
      setLatestPrice(formattedPrice);
      setGGEthBalance(ethers.formatEther(contractEthBal));

      // Enumerate loans
      const discovered = await fetchLoans();
      setLoans(discovered);
      setCanOpenLoan(discovered[discovered.length - 1]?.loanGoal ==discovered[discovered.length - 1]?.totalFunded);
    } catch (err) {
      console.error(err);
      toast.error('Error fetching manager data');
    }
  }

  // -------------------------------------------------------------------
  // 2) fetchLoans
  // -------------------------------------------------------------------
  async function fetchLoans() {
    if (!managerContract) return [];
    const MAX_LOANS = 50;
    const results = [];

    for (let i = 0; i < MAX_LOANS; i++) {
      try {
        const ln = await managerContract.loans(i);
        results.push({
          index: i,
          loanAddress: ln.loanAddress,
          loanGoal: ethers.formatUnits(ln.loanGoal, 6),
          totalDrawnDown: ethers.formatUnits(ln.totalDrawnDown, 6),
          loanDrawn: ln.loanDrawn,
          loanDrawnTime: ln.loanDrawnTime.toString(),
          fullyRepaid: ln.fullyRepaid,
          iouConversionRate: ethers.formatUnits(ln.iouConversionRate, 18),
          totalBuyETH: ethers.formatEther(ln.totalBuyETH),
          soldETH: ethers.formatEther(ln.soldETH),
          profitETH: ethers.formatEther(ln.profitETH)
        });
      } catch (err) {
        // no more loans
        break;
      }
    }

    // If we have none or no user, skip the IOUMint extras
    if (!IOUMintContract || !userAddress || results.length === 0) {
      return results;
    }

    const addresses = results.map((r) => r.loanAddress);
    try {
      // 1) Retrieve user-lens info from IOUMint
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
          repayments,
          updatedTotalOwed,
          totalSupply,
          redeemed
        } = info;

        results[i].borrower = borrower;
        results[i].iouName = iouName;
        results[i].iouSymbol = iouSymbol;
        results[i].annualInterestRate = Number(annualInterestRate);
        results[i].userIOUBalance = ethers.formatUnits(myIOUs, 18);
        results[i].claimableInterest = ethers.formatUnits(interestClaimable, underlyingDecimals);
        results[i].underlyingSymbol = underlyingSymbol;
        results[i].underlyingDecimals = underlyingDecimals;
        results[i].totalFunded = ethers.formatUnits(totalFunded, 6);
        results[i].underlyingBalance = ethers.formatUnits(underlyingBalance, underlyingDecimals);
        results[i].interestrepayments = ethers.formatUnits(interestrepayments, underlyingDecimals);
        results[i].repayments = ethers.formatUnits(repayments, underlyingDecimals);
        results[i].updatedTotalOwed = ethers.formatUnits(updatedTotalOwed, underlyingDecimals);

        // approximate share for "redeemable" display:
        const numericRepayments = parseFloat(results[i].repayments || '0');
        const numericInterestRepayments = parseFloat(results[i].interestrepayments || '0');
        const numericRedeemed = parseFloat(ethers.formatUnits(redeemed, underlyingDecimals));

        // total principal repaid - interest portion
        const principalRepaid = numericRepayments - numericInterestRepayments;
        const numericTotalSupply = parseFloat(ethers.formatUnits(totalSupply, 18)) || 1;
        const redeemedSoFar = numericRedeemed;
        const rawShare = principalRepaid - redeemedSoFar;
        const perIOU = rawShare / numericTotalSupply;

        results[i].redeemable = perIOU;
      });

      // 2) Fetch manager contract’s IOU balance for each loan
      const managerIOUBalances = await Promise.all(
        addresses.map(async (loanAddr) => {
          const iouToken = new ethers.Contract(loanAddr, ERC20ABI, provider);
          const bal = await iouToken.balanceOf(GGLoanManagerAddress);
          return bal;
        })
      );
      managerIOUBalances.forEach((bal, i) => {
        // Assuming IOU tokens have 18 decimals:
        results[i].managerIOUBalance = ethers.formatUnits(bal, 18);
      });
    } catch (err) {
      console.error("IOUMint getSpotInfo error:", err);
    }

    return results;
  }

  // -------------------------------------------------------------------
  // 3) Manager-level writes
  // -------------------------------------------------------------------
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
      const goal = ethers.parseUnits(startLoanGoal || '0', 6);
      const annual = annualInterest ? BigInt(annualInterest) : 0n;
      const pFee = platformFee ? BigInt(platformFee) : 0n;
      const feeAddr = feeAddress || ethers.ZeroAddress;
      const iouRate = ethers.parseUnits(loanIOUConversionRate || '1.0', 18);

      const tx = await mgr.startLoan(goal, startLoanToken, annual, pFee, feeAddr, iouRate);
      await tx.wait();
      toast.success("startLoan successful!");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("startLoan failed");
    }
  };

  const handleOpenLoan = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;

      const tx = await mgr.openLoan();
      await tx.wait();
      toast.success("openLoan successful!");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("openLoan failed");
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

  // aggregator repayLoan(loanIndex)
  const handleRepayLoan = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(repayLoanIndex) || 0;

      const tx = await mgr.repayLoan(idx);
      await tx.wait();
      toast.success("repayLoan successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("repayLoan failed");
    }
  };

  // repayLoanUSDC(loanIndex, usdcAmount)
  const handleRepayLoanUSDC = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(repayLoanIndexUSDC) || 0;
      const amt = ethers.parseUnits(repayUsdcAmount || '0', 6);

      const tx = await mgr.repayLoanUSDC(idx, amt);
      await tx.wait();
      toast.success("repayLoanUSDC successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("repayLoanUSDC failed");
    }
  };

  // swapIOUForMintTokens
  const handleSwapIOU = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(swapIndex, 10) || 0;
      const amt = ethers.parseUnits(swapIOUAmount || '0', 18);

      // Approve the IOU token first
      const ln = await managerContract.loans(idx);
      const iouAddr = ln.loanAddress;
      const iouToken = new ethers.Contract(iouAddr, ERC20ABI, signer);

      const allowance = await iouToken.allowance(userAddress, GGLoanManagerAddress);
      if (allowance < amt) {
        const approveTx = await iouToken.approve(GGLoanManagerAddress, amt);
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

  // Example placeholder if you had a setIOUConversionRate function
  const handleSetIOURate = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const idx = parseInt(setIndex) || 0;
      const parsed = ethers.parseUnits(newRate || '1.0', 18);

      // Placeholder: adapt if you have an actual setter function on your contract
      // e.g. `mgr.setIOUConversionRate(idx, parsed)`
      const tx = await mgr.startLoan(idx, parsed); 
      await tx.wait();

      toast.success("IOU Conversion Rate updated!");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("setIOUConversionRate failed");
    }
  };

  // aggregator redeemHeldIOUsAndSwapToETH
  const handleRedeemIOUs = async (loanIndex) => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const tx = await mgr.redeemHeldIOUsAndSwapToETH(loanIndex);
      await tx.wait();
      toast.success(`redeemHeldIOUsAndSwapToETH successful for loan #${loanIndex}`);
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("redeemHeldIOUsAndSwapToETH failed");
    }
  };

  // burnDAOForETH
  const handleBurnDAOForETH = async () => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const parsed = ethers.parseUnits(burnAmount || '0', GGDecimals);

      const tx = await mgr.burnDAOForETH(parsed);
      await tx.wait();
      toast.success("burnDAOForETH successful");
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error("burnDAOForETH failed");
    }
  };

  // -------------------------------------------------------------------
  // 4) Per-loan user actions (fund, redeem, claim, unfund)
  // -------------------------------------------------------------------
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
        toast.error("Native-asset funding not implemented in this snippet");
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
  }

  // -------------------------------------------------------------------
  // 5) Quick “drawDownAndBuyETH” + “repayLoan”
  // -------------------------------------------------------------------
  const handleDrawDownAndBuy = async (loanIndex) => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const tx = await mgr.drawDownAndBuyETH(loanIndex);
      await tx.wait();
      toast.success(`drawDownAndBuyETH on loan #${loanIndex} complete`);
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error(`drawDownAndBuyETH failed for loan #${loanIndex}`);
    }
  };

  const handleQuickRepay = async (loanIndex) => {
    try {
      const mgr = getMgr();
      if (!mgr) return;
      const tx = await mgr.repayLoan(loanIndex);
      await tx.wait();
      toast.success(`repayLoan on loan #${loanIndex} complete`);
      fetchManagerData();
    } catch (err) {
      console.error(err);
      toast.error(`repayLoan failed for loan #${loanIndex}`);
    }
  };

  // -------------------------------------------------------------------
  // 6) burnPreview calculation whenever burnAmount changes
  // -------------------------------------------------------------------
  useEffect(() => {
    if (!burnAmount || parseFloat(burnAmount) <= 0 || parseFloat(GGSupply) <= 0) {
      setBurnPreview('0');
      return;
    }

    let totalProfit = 0;
    for (const ln of loans) {
      totalProfit += parseFloat(ln.profitETH) || 0;
    }

    const totalDistribution = totalProfit + parseFloat(ethFromMint || '0');
    const fraction = parseFloat(burnAmount) / parseFloat(GGSupply);
    const userShare = fraction * totalDistribution;

    setBurnPreview(userShare.toFixed(6));
  }, [burnAmount, loans, ethFromMint, GGSupply]);

  // -------------------------------------------------------------------
  // On mount or user change
  // -------------------------------------------------------------------
  useEffect(() => {
    if (managerContract) {
      fetchManagerData();
    }
    // eslint-disable-next-line
  }, [managerContract, userAddress]);

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
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

      <h2 className="text-3xl font-semibold bg-pink-300 text-white p-2 rounded-full text-center mx-auto md:w-[400px]">
        {Number(GGEthBalance).toFixed(4)} ETH HODLD
      </h2>
      <h2 className="text-xl font-semibold bg-pink-300 text-white p-2 rounded-full text-center mx-auto w-[200px] mt-1">
        {Number(myGGBalance).toFixed(4)} {GGSymbol || 'GG'}
      </h2>

      {/* Swap IOU → GG & Burn GG → ETH */}
      <div className="max-w-6xl mx-auto mt-6 text-center">
        <div className="bg-white/70 backdrop-blur-sm rounded-[50px] p-4 md:w-[400px] mx-auto">
          <h3 className="text-lg font-semibold text-green-600 mb-3">
            🌱 Swap IOU → GG
          </h3>
          <select
            className="w-full px-3 py-2 bg-green-100 rounded-full border border-green-100 mb-2 text-green-500 font-semibold"
            value={swapIndex}
            onChange={(e) => setSwapIndex(e.target.value)}
            title="Select which loan's IOU you want to swap for GG tokens."
          >
            {loans.map((ln) => (
              <option key={ln.index} value={ln.index}>
                #{ln.index} - {ln.userIOUBalance} {ln.iouSymbol} @ rate {ln.iouConversionRate}
              </option>
            ))}
          </select>
          <div className="flex w-full bg-green-200 rounded-full border border-green-100 mb-2 px-3 py-1">
          <input
            className="bg-green-200 flex-grow outline-none"
            placeholder="IOU amount"
            value={swapIOUAmount}
            onChange={(e) => setSwapIOUAmount(e.target.value)}
            title="Enter how many IOU tokens you want to swap for GG tokens."
          />
            <button
              onClick={() => setSwapIOUAmount(loans[swapIndex].userIOUBalance)}
              className="text-white bg-pink-400 rounded-full px-2 py-1 font-semibold"
              title="Swap all your IOU tokens for GG tokens."
            >
              Max
            </button>
          </div>
          <p className="text-green-500 font-semibold">
            {swapIOUAmount || 0} IOU →{" "}
            {loans[swapIndex]
              ? (
                  Number(swapIOUAmount || 0) /
                  Number(loans[swapIndex].iouConversionRate || 1)
                ).toFixed(4)
              : 0}{" "}
            {GGSymbol}
          </p>
          <button
            onClick={handleSwapIOU}
            className="w-full py-2 bg-green-200 rounded-full font-medium hover:bg-green-300 text-green-500 transition-colors"
            title="Swap your IOU tokens to mint new GG tokens."
          >
            Mint GG
          </button>

          <h3 className="text-lg font-semibold text-pink-600 mt-6 mb-3">
            🔥 Burn GG for ETH
          </h3>
          <input
            className="w-full px-3 py-2 bg-white rounded-full border border-pink-100"
            placeholder={`Amount of ${GGSymbol}`}
            value={burnAmount}
            onChange={(e) => setBurnAmount(e.target.value)}
            title="How many GG tokens you want to burn in exchange for ETH."
          />
          {burnAmount && parseFloat(burnAmount) > 0 && (
            <p className="text-pink-600 font-semibold">
              {burnAmount} {GGSymbol} → ~{burnPreview} ETH
            </p>
          )}
          <button
            onClick={handleBurnDAOForETH}
            className="w-full py-2 bg-pink-200 rounded-full font-medium hover:bg-pink-300 text-pink-500 transition-colors mt-2"
            title="Burn the specified amount of GG tokens for your share of the treasury ETH."
          >
            Burn GG
          </button>
        </div>
      </div>

      {/* Loans list */}
      <div className="max-w-7xl mx-auto mt-8 p-2">
        <h2 className="text-3xl font-bold mb-2 text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-pink-400">
          GG Loans
        </h2>

        {loans.length === 0 ? (
          <p className="text-pink-600 text-center font-medium">
            No loans found or none discovered so far.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loans.map((ln) => (
              <div
                key={ln.index}
                className="bg-white/70 backdrop-blur-sm rounded-3xl p-4 shadow-md ring-1 ring-pink-200 relative text-center max-w-3xl mx-auto"
              >
                {/* Repaid or not */}
                <div className="mt-1 mx-auto">
                  {ln.fullyRepaid ? (
                    <span
                      className="inline-block px-2 py-1 text-xs font-bold text-green-600 bg-green-100 rounded-full"
                      title="This loan has been fully repaid."
                    >
                      Fully Repaid
                    </span>
                  ) : (
                    <span
                      className="inline-block px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded-full"
                      title="This loan is not fully repaid yet."
                    >
                      Not Repaid
                    </span>
                  )}
                  {ln.loanDrawnTime !== '0' && (
                    <span className="text-xs text-gray-500 ml-1">
                      (drawn on{" "}
                      {new Date(
                        parseInt(ln.loanDrawnTime, 10) * 1000
                      ).toLocaleDateString()}
                      )
                    </span>
                  )}
                </div>

                <p className="text-lg font-semibold text-pink-600 mt-2">
                  <span
                    className="text-white bg-blue-300 rounded-full px-2 py-1 font-semibold"
                    title="IOU token name"
                  >
                    {ln.iouName}
                  </span>{" "}
                  <span
                    className="text-white bg-blue-200 rounded-full px-2 py-1 ml-1 font-semibold"
                    title="IOU token symbol"
                  >
                    {ln.iouSymbol}
                  </span>
                </p>
                <p
                  className="text-lg font-semibold bg-green-300 text-white rounded-full px-2 py-1 w-3/4 mx-auto font-semibold text-xl mt-2 mb-0"
                  title="The rate of IOU tokens per 1 GG token."
                >
                  {ln.iouConversionRate} IOU per {GGSymbol}
                </p>

                <div className="text-sm text-gray-700 mb-3 text-center grid grid-cols-2 gap-2 mt-2">
                  <p className="absolute top-2 left-2 mb-1 font-bold bg-pink-200 text-white rounded-full px-2 py-1 w-9 text-xl">
                    {ln.index}
                  </p>
                  <div>
                    <p className="text-pink-600 font-semibold text-lg">Goal</p>
                    <p
                      className="text-xl font-semibold text-white bg-pink-200 rounded-full px-1 py-1"
                      title="The total principal goal (in USDC)."
                    >
                      {ln.loanGoal} USDC
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-600 font-semibold text-lg">Bought</p>
                    <p
                      className="bg-pink-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="Total ETH the manager purchased for this loan."
                    >
                      {Number(ln.totalBuyETH).toFixed(4)} ETH
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-600 font-semibold text-lg">Funded</p>
                    <p
                      className="bg-pink-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="Total USDC currently funded by backers (not necessarily drawn)."
                    >
                      {Number(ln.totalFunded || '0').toFixed(4)} USDC
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-600 font-semibold text-lg">Drawn</p>
                    <p
                      className="bg-orange-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="Amount of USDC that has actually been drawn by the borrower."
                    >
                      {Number(ln.totalDrawnDown).toFixed(4)} USDC
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-600 font-semibold text-lg">My IOUs</p>
                    <p
                      className="bg-blue-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="Your personal IOU balance in this loan."
                    >
                      {ln.userIOUBalance} {ln.iouSymbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-yellow-600 font-semibold text-lg">
                      Repaid
                    </p>
                    <p
                      className="bg-yellow-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="How much has been repaid so far (principal + interest)."
                    >
                      {Number(ln.repayments || '0').toFixed(4)}{" "}
                      {ln.underlyingSymbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-green-600 font-semibold text-lg">
                      Interest
                    </p>
                    <p
                      className="bg-green-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="Interest available for you to claim."
                    >
                      {ln.claimableInterest} {ln.underlyingSymbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-600 font-semibold text-lg">
                      Balance
                    </p>
                    <p
                      className="bg-pink-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="Your current balance of the underlying asset."
                    >
                      {Number(ln.underlyingBalance || '0').toFixed(4)}{" "}
                      {ln.underlyingSymbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-pink-600 font-semibold text-lg">Owed</p>
                    <p
                      className="bg-pink-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="Total owed = principal + accrued interest so far."
                    >
                      {Number(ln.updatedTotalOwed || '0').toFixed(4)}{" "}
                      {ln.underlyingSymbol}
                    </p>
                  </div>
                  <div>
                    <p className="text-orange-600 font-semibold text-lg">
                      Redeemable
                    </p>
                    <p
                      className="bg-orange-300 text-white rounded-full px-2 py-1 font-semibold text-xl"
                      title="Estimated principal returned per IOU (approx share)."
                    >
                      {ln.redeemable ? ln.redeemable.toFixed(4) : '0'}{" "}
                      {ln.underlyingSymbol}/IOU
                    </p>
                  </div>
                </div>

                {/* The quick combo calls with new emojis */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  {/* Draw Down & Buy -> 💰 */}
                  {!ln.fullyRepaid && (
                    <button
                      onClick={() => handleDrawDownAndBuy(ln.index)}
                      className="bg-green-200 hover:bg-green-300 text-green-600 px-2 py-1 rounded-full font-bold"
                      title="Draw down 1/10 of the total funded USDC and immediately buy ETH with it."
                    >
                      💰
                    </button>
                  )}
                  {/* Repay Loan -> 💵 */}
                  {!ln.fullyRepaid && (
                    <button
                      onClick={() => handleQuickRepay(ln.index)}
                      className="bg-orange-200 hover:bg-orange-300 text-orange-600 px-2 py-1 rounded-full font-bold"
                      title="Repay 1% of the total owed USDC by selling the required ETH."
                    >
                      💵
                    </button>
                  )}
                  {/* Redeem IOUs & Swap -> 💱, only if managerIOUBalance > 0 */}
                  {parseFloat(ln.managerIOUBalance || "0") > 0 && (
                    <button
                      onClick={() => handleRedeemIOUs(ln.index)}
                      className="bg-purple-200 hover:bg-purple-300 text-purple-600 px-2 py-1 rounded-full font-bold"
                      title="Redeem any IOUs still held by the manager contract and swap to ETH."
                    >
                      💱
                    </button>
                  )}
                </div>

                {/* Fund input + actions */}
                <input
                  type="text"
                  placeholder="Amount"
                  className="w-full px-3 py-2 bg-pink-100 rounded-full border border-pink-200 m-2"
                  value={fundInput}
                  onChange={(e) => setFundInput(e.target.value)}
                  title="Amount for Fund/Redeem/Unfund calls."
                />
                <div className="flex items-center gap-1 justify-center">
                  <button
                    onClick={() => fundLoan(ln.loanAddress, fundInput)}
                    className="bg-pink-200 hover:bg-pink-300 text-white font-semibold px-4 py-1 rounded-full transition-colors"
                    title="Fund the loan with this USDC amount."
                  >
                    Fund
                  </button>
                  <button
                    onClick={() => redeemIOUs(ln.loanAddress, fundInput)}
                    className="bg-blue-200 hover:bg-blue-300 text-white font-semibold px-4 py-1 rounded-full transition-colors"
                    title="Redeem this many IOUs, receiving principal from the repaid portion."
                  >
                    Redeem
                  </button>
                  <button
                    onClick={() => claimInterest(ln.loanAddress)}
                    className="bg-green-200 hover:bg-green-300 text-white font-semibold px-4 py-1 rounded-full transition-colors"
                    title="Claim your accrued interest for this loan."
                  >
                    Claim
                  </button>
                  <button
                    onClick={() => unfundLoan(ln.loanAddress, fundInput)}
                    className="bg-red-200 hover:bg-red-300 text-white font-semibold px-4 py-1 rounded-full transition-colors"
                    title="Unfund (withdraw) your yet-undrawn principal from this loan."
                  >
                    Unfund
                  </button>
                </div>
              </div>
            ))}

            {/* "Open Loan" if canCreateLoan is true, else a placeholder */}
            <div 
              className="bg-green-100 backdrop-blur-sm rounded-3xl p-4 shadow-md ring-1 ring-pink-200 
                        text-center flex items-center justify-center"
            >
              {canOpenLoan ? (
                <button
                  onClick={handleOpenLoan}
                  className="text-3xl font-semibold text-white bg-pink-400 rounded-full p-4 hover:bg-pink-500"
                  title="Create a new loan contract once all existing ones are fully funded."
                >
                  🌱 Open Next Loan
                </button>
              ) : (
                <h3
                  className="text-3xl font-semibold text-white bg-gray-300 rounded-full p-4"
                  title="You must ensure all existing loans are fully funded before creating a new one."
                >
                  Fill all loans to create more.
                </h3>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Manager summary only if the user is the special address */}
      {userAddress?.toLowerCase() === '0x9d31e30003f253563ff108bc60b16fdf2c93abb5'.toLowerCase() && (
        <>
          <div className="max-w-6xl mx-auto mb-6 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
            <h2 className="text-lg font-semibold text-pink-600">
              Global Status 🌸
            </h2>
            <div className="text-sm space-y-2 mt-2">
              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <p>
                    <span className="font-semibold text-rose-600">GG Name/Symbol:</span> {GGName} ({GGSymbol})
                  </p>
                  <p>
                    <span className="font-semibold text-rose-600">Decimals:</span> {GGDecimals}
                  </p>
                  <p>
                    <span className="font-semibold text-rose-600">GG Supply:</span> {GGSupply}
                  </p>
                  <p>
                    <span className="font-semibold text-rose-600">My GG Balance:</span> {myGGBalance}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold text-rose-600">ethFromMint:</span> {ethFromMint}
                  </p>
                  <p>
                    <span className="font-semibold text-rose-600">GG’s ETH:</span> {GGEthBalance} ETH
                  </p>
                </div>
              </div>

              <hr className="border-rose-200 my-2"/>
              <div className="grid md:grid-cols-2 gap-2">
                <div>
                  <p>
                    <span className="font-semibold text-rose-600">Price Feed:</span> {priceFeed}
                  </p>
                  <p>
                    <span className="font-semibold text-rose-600">Latest Price:</span> {latestPrice}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-semibold text-rose-600">ioUMint:</span> {ioUMint}
                  </p>
                  <p>
                    <span className="font-semibold text-rose-600">USDC Token:</span> {usdcToken}
                  </p>
                  <p>
                    <span className="font-semibold text-rose-600">Swap Router:</span> {swapRouter}
                  </p>
                  <p>
                    <span className="font-semibold text-rose-600">WETH Address:</span> {wethAddress}
                  </p>
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
                  title="The total principal goal for the new loan (in USDC)."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
                  placeholder="Underlying token address"
                  value={startLoanToken}
                  onChange={(e) => setStartLoanToken(e.target.value)}
                  title="Address of the ERC20 token to be borrowed (e.g., USDC)."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
                  placeholder="Annual Interest Rate (bps)"
                  value={annualInterest}
                  onChange={(e) => setAnnualInterest(e.target.value)}
                  title="Annual interest rate in basis points, e.g., 100 = 1% APR."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
                  placeholder="Platform Fee Rate (bps)"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  title="Platform fee in basis points (bps)."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
                  placeholder="Fee Address"
                  value={feeAddress}
                  onChange={(e) => setFeeAddress(e.target.value)}
                  title="Where platform fees should be sent."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-rose-100"
                  placeholder="IOU→GG rate (e.g. 1.0 => 1e18)"
                  value={loanIOUConversionRate}
                  onChange={(e) => setLoanIOUConversionRate(e.target.value)}
                  title="How many IOUs per 1 GG token (in 1e18 scale)."
                />
                <button
                  onClick={handleStartLoan}
                  className="w-full py-2 bg-pink-200 rounded-full font-medium hover:bg-pink-300 text-pink-800 transition-colors"
                  title="Deploy a new Spot IOU Loan via the IOUMint factory."
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
                  title="Which loan (by index) to buy ETH for."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-yellow-100"
                  placeholder="USDC Amount"
                  value={buyUsdcAmount}
                  onChange={(e) => setBuyUsdcAmount(e.target.value)}
                  title="How many USDC to sell for ETH."
                />
                <button
                  onClick={handleBuyETH}
                  className="w-full py-2 bg-yellow-200 rounded-full font-medium hover:bg-yellow-300 text-yellow-800 transition-colors"
                  title="Swaps USDC for ETH on Uniswap (manager-level function)."
                >
                  buyETH
                </button>
              </div>
            </div>
          </div>

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
                  title="The index of the loan from which you want to redeem IOUs & swap to ETH."
                />
                <button
                  onClick={() => handleRedeemIOUs(parseInt(redeemLoanIndex || '0', 10))}
                  className="w-full py-2 bg-orange-200 rounded-full font-medium hover:bg-orange-300 text-orange-800 transition-colors"
                  title="Redeems any IOUs this manager contract is still holding, then swaps USDC→ETH."
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
                  title="Which loan index to draw from."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-purple-100"
                  placeholder="Amount in USDC"
                  value={drawAmount}
                  onChange={(e) => setDrawAmount(e.target.value)}
                  title="How many USDC to draw for that loan."
                />
                <button
                  onClick={handleDrawDownLoan}
                  className="w-full py-2 bg-purple-200 rounded-full font-medium hover:bg-purple-300 text-purple-800 transition-colors"
                  title="Borrower function: draws these USDC from the funded portion."
                >
                  drawDownLoan
                </button>
              </div>
            </div>

            {/* repayLoan (aggregator) */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
              <h3 className="text-lg font-semibold text-red-600 mb-3">
                💵 Repay Loan (Aggregator)
              </h3>
              <div className="space-y-2 text-sm">
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-red-100"
                  placeholder="Loan index"
                  value={repayLoanIndex}
                  onChange={(e) => setRepayLoanIndex(e.target.value)}
                  title="Index of the loan to repay using the aggregator function."
                />
                <button
                  onClick={handleRepayLoan}
                  className="w-full py-2 bg-red-200 rounded-full font-medium hover:bg-red-300 text-red-800 transition-colors"
                  title="Calls repayLoan(loanIndex) which repays 1% of the total owed USDC."
                >
                  repayLoan
                </button>
              </div>
            </div>

            {/* repayLoanUSDC (manual) */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200">
              <h3 className="text-lg font-semibold text-red-600 mb-3">
                💵 Repay Loan (USDC)
              </h3>
              <div className="space-y-2 text-sm">
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-red-100"
                  placeholder="Loan index"
                  value={repayLoanIndexUSDC}
                  onChange={(e) => setRepayLoanIndexUSDC(e.target.value)}
                  title="Which loan index to repay."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-red-100"
                  placeholder="USDC amount"
                  value={repayUsdcAmount}
                  onChange={(e) => setRepayUsdcAmount(e.target.value)}
                  title="How many USDC to repay for that loan."
                />
                <button
                  onClick={handleRepayLoanUSDC}
                  className="w-full py-2 bg-red-200 rounded-full font-medium hover:bg-red-300 text-red-800 transition-colors"
                  title="Manually repay the loan with a specific USDC amount."
                >
                  repayLoanUSDC
                </button>
              </div>
            </div>

            {/* setIOUConversionRate (if needed) */}
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
                  title="Which loan index to modify the rate for."
                />
                <input
                  className="w-full px-3 py-2 bg-white rounded-full border border-blue-100"
                  placeholder="New rate in 1e18"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  title="Enter the new IOU→GG conversion rate in 1e18 scale."
                />
                <button
                  onClick={handleSetIOURate}
                  className="w-full py-2 bg-blue-200 rounded-full font-medium hover:bg-blue-300 text-blue-800 transition-colors"
                  title="(Example) Update IOU conversion rate for a given loan."
                >
                  setIOUConversionRate
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default GGLoanManagerUI;
