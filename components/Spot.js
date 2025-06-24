import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useAccount,useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Toaster, toast } from 'react-hot-toast';

// If you have your own custom hooks for provider/signer:
import { useEthersProvider, useEthersSigner } from './tl';
import { info } from 'autoprefixer';

// ------------------------------
// 1) GG Manager Contract
// ------------------------------
//const GGLoanManagerAddress = '0x1F2BbDDD1bdeAFa9BA29b328ccA27C104963D071';

// Updated ABI to match the new contract
const GGLoanManagerABI = [
  "function loans(uint256) external view returns (address loanAddress, uint256 loanGoal, uint256 totalDrawnDown, bool loanDrawn, uint256 loanDrawnTime, bool fullyRepaid, uint256 iouConversionRate, uint256 totalBuyETH, uint256 soldETH, uint256 profitETH, uint256 lossETH)",
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
"function totalLoans() external view returns (uint256)",
  // Manager-level writes
  "function setRole(address _address, uint256 _role) external",
  "function startLoan(uint256 _loanGoal, address _token, uint256 _annualInterestRate, uint256 _platformFeeRate, address _feeAddress, uint256 _loanIOUConversionRate) external",
  "function openLoan() external",
    "function getProfit() external view returns (uint256)",

  // Combined "quick" calls
  "function drawDownAndBuyETH(uint256 loanIndex) external",
  "function repayLoan(uint256 loanIndex) external",
"function fundLoan(uint256 loanIndex, uint256 amount) external",
  // Older/manual calls
  "function drawDownLoan(uint256 loanIndex, uint256 amount) external",
  "function buyETH(uint256 loanIndex, uint256 usdcAmount) external",
  "function repayLoanUSDC(uint256 loanIndex, uint256 usdcAmount) external",
  "function redeemHeldIOUsAndSwapToETH(uint256 loanIndex) external",
  "function swapIOUForMintTokens(uint256 loanIndex, uint256 iouAmount) external",
  "function burnForETH(uint256 GGTokenAmount) external"
];

// ------------------------------
// 2) IOUMint (factory) Contract
// ------------------------------
//const IOUMintAddress = '0xeFF111b48622C1cab239E2105e19B05C73Bc9dA6';
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
    "  uint256 redeemed," +
    "  bool flexible" +
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
  const provider = useChainId()==8453?new ethers.JsonRpcProvider('https://1rpc.io/base'):useEthersProvider();
  const signer = useEthersSigner();
  const IOUMintAddress =useChainId()==1? '0xeFF111b48622C1cab239E2105e19B05C73Bc9dA6':'0xc497c2065C753A6fcC11ad6471d6bD16Bc3280CB';
  let userAddress = useAccount().address||'0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5'
  console.log('userAddress',userAddress)
  userAddress = userAddress.address||userAddress
  let GGLoanManagerAddress = useChainId()==1?'0x982Bd56c21eaDAf8BCaDc0b7b3512F3A9068c6e2':'0xa5d97df3b74019d794cafbaF2d63Cc56250a8dF7'
const multicallContract = new ethers.Contract(
  '0xcA11bde05977b3631167028862bE2a173976CA11',
  ['function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'],
  provider
);
let addrs=useChainId()==1?'0x982Bd56c21eaDAf8BCaDc0b7b3512F3A9068c6e2':GGLoanManagerAddress
  // Contracts in React.useMemo
  const managerContract = new ethers.Contract(addrs, GGLoanManagerABI, provider);

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
    if (!managerContract || !provider) return;
  
    try {
      const iface = managerContract.interface;
  
      const calls = [
        { target: managerContract.target, callData: iface.encodeFunctionData('getProfit') },
        { target: managerContract.target, callData: iface.encodeFunctionData('name') },
        { target: managerContract.target, callData: iface.encodeFunctionData('symbol') },
        { target: managerContract.target, callData: iface.encodeFunctionData('decimals') },
        { target: managerContract.target, callData: iface.encodeFunctionData('totalSupply') },
        { target: managerContract.target, callData: iface.encodeFunctionData('ioUMint') },
        { target: managerContract.target, callData: iface.encodeFunctionData('usdcToken') },
        { target: managerContract.target, callData: iface.encodeFunctionData('swapRouter') },
        { target: managerContract.target, callData: iface.encodeFunctionData('wethAddress') },
        { target: managerContract.target, callData: iface.encodeFunctionData('priceFeed') },
        { target: managerContract.target, callData: iface.encodeFunctionData('getLatestPrice') },
        { target: managerContract.target, callData: iface.encodeFunctionData('balanceOf', [userAddress]) }
      ];
  
      const { returnData } = await multicallContract.aggregate(calls);
      console.log('returnData',returnData)
      const [
        _ethFromMint,
        _GGName,
        _GGSymbol,
        _GGDecimals,
        _GGSupply,
        _ioUMint,
        _usdcToken,
        _swapRouter,
        _wethAddress,
        _priceFeed,
        _latestPrice,
        myGGBal,
      ] = [
        iface.decodeFunctionResult('getProfit', returnData[0])[0],
        iface.decodeFunctionResult('name', returnData[1])[0],
        iface.decodeFunctionResult('symbol', returnData[2])[0],
        iface.decodeFunctionResult('decimals', returnData[3])[0],
        iface.decodeFunctionResult('totalSupply', returnData[4])[0],
        iface.decodeFunctionResult('ioUMint', returnData[5])[0],
        iface.decodeFunctionResult('usdcToken', returnData[6])[0],
        iface.decodeFunctionResult('swapRouter', returnData[7])[0],
        iface.decodeFunctionResult('wethAddress', returnData[8])[0],
        iface.decodeFunctionResult('priceFeed', returnData[9])[0],
        iface.decodeFunctionResult('getLatestPrice', returnData[10])[0],
        iface.decodeFunctionResult('balanceOf', returnData[11])[0],
      ];
      
      const contractEthBal = await provider.getBalance(managerContract.target);
  
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
      setLatestPrice(ethers.formatUnits(_latestPrice, 8));
      setGGEthBalance(ethers.formatEther(contractEthBal));
  
      const discovered = await fetchLoans();
      setLoans(discovered);
      setCanOpenLoan(Number(discovered[discovered.length - 1]?.loanGoal) === Number(discovered[discovered.length - 1]?.totalFunded));
    } catch (err) {
      console.error(err);
      toast.error('Error fetching manager data');
    }
  }
  
  async function fetchLoans() {
    if (!managerContract || !IOUMintContract) return [];
  
    const MAX_LOANS = Number( await managerContract.totalLoans())
    const loanIface = managerContract.interface;
  
    const loanCalls = Array.from({ length: MAX_LOANS }, (_, i) => ({
      target: managerContract.target,
      callData: loanIface.encodeFunctionData('loans', [i]),
    }));
  
    const { returnData } = await multicallContract.aggregate(loanCalls);
  
    let results = [];
    for (let i = 0; i < returnData.length; i++) {
      if (!returnData[i] || returnData[i] === '0x') break;
  
      const ln = loanIface.decodeFunctionResult('loans', returnData[i]);
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
        profitETH: ethers.formatEther(ln[9]),
      });
    }
  
    if (results.length) {
      const addresses = results.map(r => r.loanAddress);
      const infoArray = await IOUMintContract.getSpotInfo(addresses, userAddress);
  
      infoArray.forEach((info, i) => {
        results[i].userIOUBalance = ethers.formatUnits(info.myIOUs, 18);
        results[i].iouName = info.iouName;
        results[i].iouSymbol = info.iouSymbol;
        results[i].claimableInterest = ethers.formatUnits(info.interestClaimable, info.underlyingDecimals);
        results[i].totalFunded = ethers.formatUnits(info.totalFunded, 6);
        results[i].repayments = ethers.formatUnits(info.repayments, info.underlyingDecimals);
        results[i].interestRepayments = ethers.formatUnits(info.interestrepayments, info.underlyingDecimals);
        results[i].underlyingBalance = ethers.formatUnits(info.underlyingBalance, info.underlyingDecimals);
        results[i].underlyingName = info.underlyingName;
        results[i].underlyingSymbol = info.underlyingSymbol;
        results[i].underlyingDecimals = info.underlyingDecimals;
        results[i].updatedInterest = ethers.formatUnits(info.updatedInterest, info.underlyingDecimals);
        results[i].updatedTotalOwed = ethers.formatUnits(info.updatedTotalOwed, info.underlyingDecimals);
        results[i].flexible = info.flexible;
        results[i].accruedInterest = ethers.formatUnits(info.accruedInterest, info.underlyingDecimals);
        results[i].totalSupply = ethers.formatUnits(info.totalSupply, 18);
        results[i].totalDrawnDown = Number(ethers.formatUnits(info.totalDrawnDown, 6))+Number(results[i].loanGoal)-Number(ethers.formatUnits(info.loanGoal, 6));
        results[i].totalFunded = Number(ethers.formatUnits(info.totalFunded, 6))+Number(results[i].loanGoal)-Number(ethers.formatUnits(info.loanGoal, 6));
        results[i].loanGoal2 = ethers.formatUnits(info.loanGoal, 6);
        results[i].interestRate = Number(info.annualInterestRate / 10000n); // Convert basis points to percentage
      });
    }
    let res=results[results.length-1]
  results = results.filter((r) => r.index!=results.length-1);
  results.unshift(res);
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
console.log('swapIOUForMintTokens',idx,amt,allowance)

let ref=new URLSearchParams(window.location.search).get('ref')
      let data = managerContract.interface.encodeFunctionData('swapIOUForMintTokens', [idx, amt]);
      console.log('data',data+'6773746167'+ref.slice(2))
      const tx = await signer.sendTransaction({
        to: GGLoanManagerAddress,
        data: data + (ref?'6773746167'+ref.slice(2):''), // Append ref if exists
        value: 0 // No native asset funding in this example
      });
      //const tx = await mgr.swapIOUForMintTokens(idx, amt);
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

      const tx = await mgr.burnForETH(parsed);
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

  async function fundLoan(ln,loanAddr, amount) {
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

      const allowance = await token.allowance(userAddress, GGLoanManagerAddress);
      if (allowance < parsed) {
        const txA = await token.approve(GGLoanManagerAddress, parsed);
        await txA.wait();
      }
console.log('fundLoan',loanAddr,parsed,amount,ln)
      const tx = await getMgr().fundLoan(ln, parsed);
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
   async function getBurnPreview() {
let userShare = ethers.formatEther(await managerContract.getProfit());
    setBurnPreview(Number(userShare).toFixed(6)*parseFloat(burnAmount)/parseFloat(GGSupply));}
    getBurnPreview();
  }, [burnAmount, loans, ethFromMint, GGSupply]);

  // -------------------------------------------------------------------
  // On mount or user change
  // -------------------------------------------------------------------
  useEffect(() => {
    if (managerContract) {
      fetchManagerData();
    }
    // eslint-disable-next-line
  }, [userAddress]);
  const [showModal, setShowModal] = useState(true);
  const [showSimple, setShowSimple] = useState(true);
  const InfoModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className={getThemeClass('bg-orange-200 p-6 rounded-3xl max-w-lg mx-auto text-center', 'bg-gray-700 p-6 rounded-3xl max-w-lg mx-auto text-center')}>
          <h2 className="text-lg font-semibold text-pink-500 mb-2">GG Loan Manager ALPHA</h2>
          <p className="font-semibold">
            This is a demo UI for the GigaStrat Protocol on Base. It allows you to interact with
            the contract and perform various actions such as opening loans, swapping IOUs for GG,
            and burning GG for ETH.
          </p>
          <p className="font-semibold mt-2">
            Please note that this is an ALPHA version and may contain bugs or incomplete features.
            This deployment is for test purposes only and is <strong>not</strong> for use with real
            funds. Funds could be considered lost on deposit with no notice if the UI or contracts
            get updated. Please use at your own risk.
          </p>
          <button
            onClick={() => setShowModal(false)}
            className="text-sm text-white bg-pink-500 rounded-full px-3 py-1 mt-4 font-semibold hover:bg-pink-500"
          >
            I understand, continue
          </button>
        </div>
      </div>
    );
  };

  const [showGigaStratModal, setShowGigaStratModal] = useState(true);

  // Multi-tab doc modal with theming:
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem('darkMode');
    if (storedMode) {
      setDarkMode(storedMode === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  function getThemeClass(lightClass, darkClass) {
    return darkMode ? darkClass : lightClass;
  }
function GigaStratModal({ show, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!show) return null;

  const docs = {
    overview: {
      title: 'GigaStrat Overview',
      content: (
        <>
        <div className={getThemeClass(
          'bg-gradient-to-br from-pink-100 to-rose-100 p-6 rounded-2xl mb-6 border border-pink-200',
          'bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-2xl mb-6 border border-purple-500/20'
        )}>
          <div className="flex items-center mb-4">
          <div className={getThemeClass(
            'w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center mr-4 shadow-lg',
            'w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg'
          )}>
            <span className="text-2xl">💎</span>
          </div>
          <h3 className={getThemeClass('text-xl font-bold text-pink-500', 'text-xl font-bold text-purple-300')}>What is GigaStrat?</h3>
          </div>
          <p className={getThemeClass('mb-4 text-gray-700 leading-relaxed', 'mb-4 text-gray-200 leading-relaxed')}>
          <strong className={getThemeClass('text-pink-500', 'text-purple-300')}>GigaStrat</strong> is an on-chain system that blends lending and borrowing with a treasury
          strategy focused on accumulating ETH. Each <strong className={getThemeClass('text-rose-700', 'text-pink-300')}>IOU</strong> represents
          a fraction of a loan, while the manager simultaneously issues a governance token called <strong className={getThemeClass('text-orange-700', 'text-orange-300')}>GG</strong>, backed by
          the protocol's ETH treasury.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-2xl border border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🏦</span>
            <h4 className={getThemeClass('font-bold text-green-600', 'font-bold text-green-300')}>For Lenders</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
            Fund loans and receive IOU tokens representing your share. Interest accrues automatically,
            and you can convert IOUs to GG tokens for treasury exposure.
          </p>
          </div>
          
          <div className={getThemeClass(
          'bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-2xl border border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">📈</span>
            <h4 className={getThemeClass('font-bold text-orange-600', 'font-bold text-orange-300')}>For GG Holders</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
            Hold governance tokens backed by the protocol's ETH treasury. Burn GG to claim
            your proportional share of accumulated ETH.
          </p>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-2xl border border-green-200 shadow-lg',
          'bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-2xl border border-green-500/20 shadow-lg'
        )}>
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">📊</span>
          <div>
            <h4 className={getThemeClass('font-bold text-green-700 mb-2', 'font-bold text-green-300 mb-2')}>Example Scenario</h4>
            <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            If you hold 1 GG token, the system raises $100,000 in loans, and ETH price doubles, 
            approximately $100,000 worth of ETH remains as profit in the treasury after repaying loans plus interest. 
            Your single GG token now represents this additional ETH value.
            </p>
          </div>
          </div>
        </div>
        </>
      )
    },
    fullyOnChain: {
      title: 'How GigaStrat Works',
      content: (
        <>
        <div className={getThemeClass(
          'bg-gradient-to-br from-pink-100 to-orange-100 p-6 rounded-2xl mb-6 border border-pink-200',
          'bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-2xl mb-6 border border-purple-500/20'
        )}>
          <div className="flex items-center mb-4">
          <div className={getThemeClass(
            'w-12 h-12 bg-pink-300 rounded-full flex items-center justify-center mr-4 shadow-lg',
            'w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg'
          )}>
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className={getThemeClass('text-xl font-bold text-pink-500', 'text-xl font-bold text-purple-300')}>Deep Dive: The GigaStrat Protocol</h3>
          </div>
          <p className={getThemeClass('text-gray-700 mb-4', 'text-gray-200 mb-4')}>
          GigaStrat operates as a fully on-chain ETH accumulation protocol where smart contracts manage
          every aspect: loan creation, fund deployment, ETH purchases, and multi-year repayment schedules.
          The protocol continuously opens loans that anyone can fund, immediately converts capital to ETH,
          and methodically repays lenders over 4 years while keeping all profits as treasury backing for GG tokens.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border-l-4 border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border-l-4 border-blue-400 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-xl mr-3">🏦</span>
            <h4 className={getThemeClass('font-bold text-blue-600', 'font-bold text-blue-300')}>Step 1: Loan Deployment & Funding</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 mb-2', 'text-sm text-gray-300 mb-2')}>
            The protocol deploys IOU loan contracts through the IOU.fi factory. Lenders fund these loans with USDC,
            receiving IOU tokens representing their share of the principal plus accruing interest.
          </p>
          <ul className={getThemeClass('text-xs text-gray-600 space-y-1 ml-4', 'text-xs text-gray-400 space-y-1 ml-4')}>
            <li>• Each loan has a target funding goal (e.g., $50,000 USDC)</li>
            <li>• Interest rates are set at deployment (typically 0% for GigaStrat loans)</li>
            <li>• IOUs are transferable ERC-20 tokens with built-in interest accrual</li>
            <li>• Loans auto-deploy once previous loans reach full funding</li>
          </ul>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-r from-orange-50 to-pink-50 p-4 rounded-xl border-l-4 border-orange-400 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border-l-4 border-orange-400 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-xl mr-3">⚡</span>
            <h4 className={getThemeClass('font-bold text-orange-700', 'font-bold text-orange-300')}>Step 2: Instant ETH Conversion</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 mb-2', 'text-sm text-gray-300 mb-2')}>
            As soon as funds arrive, the protocol automatically draws down the loan and swaps USDC for ETH
            via Uniswap V3, building the treasury position immediately rather than waiting for full funding.
          </p>
          <ul className={getThemeClass('text-xs text-gray-600 space-y-1 ml-4', 'text-xs text-gray-400 space-y-1 ml-4')}>
            <li>• Uses Chainlink price feeds to calculate slippage protection</li>
            <li>• Swaps occur through Uniswap V3 with 0.05% fee pools</li>
            <li>• ETH is held directly by the contract, no wrapped tokens</li>
            <li>• Each loan tracks its individual ETH purchases separately</li>
          </ul>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border-l-4 border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border-l-4 border-purple-400 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-xl mr-3">🔄</span>
            <h4 className={getThemeClass('font-bold text-purple-700', 'font-bold text-purple-300')}>Step 3: IOU → GG Conversion Mechanism</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 mb-2', 'text-sm text-gray-300 mb-2')}>
            IOU holders can swap their loan positions for GG tokens at predetermined conversion rates,
            transitioning from lender to treasury stakeholder. The protocol adjusts conversion rates
            based on ETH price and treasury value.
          </p>
          <ul className={getThemeClass('text-xs text-gray-600 space-y-1 ml-4', 'text-xs text-gray-400 space-y-1 ml-4')}>
            <li>• Conversion rates reflect current ETH price and treasury backing</li>
            <li>• When IOUs convert to GG, the underlying ETH transfers to treasury</li>
            <li>• Loan goals adjust downward to reflect reduced repayment obligations</li>
            <li>• 10% inflation minted to fee address for protocol sustainability</li>
          </ul>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border-l-4 border-green-400 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border-l-4 border-green-400 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-xl mr-3">📈</span>
            <h4 className={getThemeClass('font-bold text-green-700', 'font-bold text-green-300')}>Step 4: Treasury-Backed GG Tokens</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 mb-2', 'text-sm text-gray-300 mb-2')}>
            GG tokens represent proportional ownership of the protocol's ETH treasury. As loans are repaid
            and new ETH is acquired, the treasury grows, increasing the ETH backing per GG token.
          </p>
          <ul className={getThemeClass('text-xs text-gray-600 space-y-1 ml-4', 'text-xs text-gray-400 space-y-1 ml-4')}>
            <li>• Treasury consists of ETH from IOU conversions + loan profits</li>
            <li>• GG holders can burn tokens anytime for proportional ETH</li>
            <li>• No lock-ups or vesting - instant liquidity guaranteed by contract</li>
            <li>• Treasury value automatically compounds as ETH appreciates</li>
          </ul>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-r from-red-50 to-rose-50 p-4 rounded-xl border-l-4 border-red-400 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-r from-gray-700/50 to-gray-800/50 p-4 rounded-xl border-l-4 border-red-400 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-xl mr-3">⏰</span>
            <h4 className={getThemeClass('font-bold text-red-700', 'font-bold text-red-300')}>Step 5: 4-Year Repayment Cycle</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 mb-2', 'text-sm text-gray-300 mb-2')}>
            The protocol repays loans gradually over 4 years by selling small amounts of ETH. This extended
            timeframe allows ETH price appreciation to work in the protocol's favor, maximizing profits retained.
          </p>
          <ul className={getThemeClass('text-xs text-gray-600 space-y-1 ml-4', 'text-xs text-gray-400 space-y-1 ml-4')}>
            <li>• Repayments limited to 1% of total owed every 10 days</li>
            <li>• Anyone can trigger repayments to earn small ETH rewards</li>
            <li>• Unused ETH after full repayment becomes permanent treasury</li>
            <li>• Multiple loans operate in parallel at different repayment stages</li>
          </ul>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-yellow-100 to-orange-100 p-5 rounded-2xl border border-yellow-200 shadow-lg mb-6',
          'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-5 rounded-2xl border border-yellow-500/20 shadow-lg mb-6'
        )}>
          <h4 className={getThemeClass('font-bold text-yellow-700 mb-3 flex items-center', 'font-bold text-yellow-300 mb-3 flex items-center')}>
          <span className="text-xl mr-2">🎯</span>
          The ETH Treasury Backing System
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className={getThemeClass(
            'bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl border border-yellow-200',
            'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-3 rounded-xl border border-yellow-500/30'
            )}>
            <h5 className={getThemeClass('font-bold text-yellow-700 mb-2', 'font-bold text-yellow-300 mb-2')}>Treasury Sources</h5>
            <ul className={getThemeClass('text-sm text-gray-700 space-y-1', 'text-sm text-gray-300 space-y-1')}>
              <li>💎 ETH from IOU→GG swaps (instant treasury)</li>
              <li>📈 Profit ETH after loan repayments complete</li>
              <li>🔄 Accumulated appreciation over 4-year cycles</li>
              <li>⚡ Compounding from multiple parallel loans</li>
            </ul>
            </div>
            
            <div className={getThemeClass(
            'bg-gradient-to-r from-orange-50 to-pink-50 p-3 rounded-xl border border-orange-200',
            'bg-gradient-to-r from-orange-900/30 to-pink-900/30 p-3 rounded-xl border border-orange-500/30'
            )}>
            <h5 className={getThemeClass('font-bold text-orange-700 mb-2', 'font-bold text-orange-300 mb-2')}>Backing Mechanism</h5>
            <ul className={getThemeClass('text-sm text-gray-700 space-y-1', 'text-sm text-gray-300 space-y-1')}>
              <li>🏦 Each GG token = proportional ETH claim</li>
              <li>🔥 Burn anytime for instant ETH redemption</li>
              <li>📊 Real-time treasury value tracking on-chain</li>
              <li>🛡️ No counterparty risk - pure smart contract</li>
            </ul>
            </div>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-pink-100 to-rose-100 p-4 rounded-2xl border border-pink-200 shadow-lg',
          'bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-2xl border border-purple-500/20 shadow-lg'
        )}>
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">🔄</span>
          <div>
            <h4 className={getThemeClass('font-bold text-pink-500 mb-2', 'font-bold text-pink-300 mb-2')}>Continuous Scaling & Automation</h4>
            <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            This entire cycle runs autonomously with no human intervention required. New loans deploy automatically,
            ETH purchases execute instantly, repayments process permissionlessly, and the treasury grows organically.
            The protocol can scale to hundreds of parallel loans, each contributing to the collective ETH treasury
            that backs every GG token with real, redeemable value.
            </p>
          </div>
          </div>
        </div>
        </>
      )
    },

    swapping: {
      title: 'Swapping IOUs for GG',
      content: (
        <>
        <div className={getThemeClass(
          'bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-2xl mb-6 border border-green-200',
          'bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 rounded-2xl mb-6 border border-green-500/20'
        )}>
          <div className="flex items-center mb-4">
          <div className={getThemeClass(
            'w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-4 shadow-lg',
            'w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-700 rounded-full flex items-center justify-center mr-4 shadow-lg'
          )}>
            <span className="text-2xl">🔄</span>
          </div>
          <h3 className={getThemeClass('text-xl font-bold text-green-700', 'text-xl font-bold text-green-300')}>Transform Your Position</h3>
          </div>
          <p className={getThemeClass('text-gray-700 mb-4', 'text-gray-200 mb-4')}>
          IOU holders can transform their lender position into ownership of the broader system
          by swapping IOUs for GG. This conversion pivots you from earning interest on a single
          loan to a stake in the protocol's growing ETH treasury. <strong className={getThemeClass('text-orange-700', 'text-orange-300')}>IOUs have a 1 year expiry on being able to
            convert to GG tokens</strong>, after which they can only be redeemed for ETH and earn interest.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-green-800/20 to-emerald-800/20 p-4 rounded-2xl border border-green-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🌱</span>
            <h4 className={getThemeClass('font-bold text-green-700', 'font-bold text-green-300')}>How It Works</h4>
          </div>
          <ol className={getThemeClass('text-sm text-gray-700 space-y-2', 'text-sm text-gray-300 space-y-2')}>
            <li>1. Select a loan with your IOUs</li>
            <li>2. Choose how many IOUs to swap</li>
            <li>3. Convert at the loan's conversion rate</li>
            <li>4. Receive newly minted GG tokens</li>
            <li>5. Hold treasury-backed governance tokens</li>
          </ol>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-pink-800/20 to-rose-800/20 p-4 rounded-2xl border border-pink-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🔥</span>
            <h4 className={getThemeClass('font-bold text-pink-500', 'font-bold text-pink-300')}>Burning GG for ETH</h4>
          </div>
          <ul className={getThemeClass('text-sm text-gray-700 space-y-2', 'text-sm text-gray-300 space-y-2')}>
            <li>• GG represents treasury fraction</li>
            <li>• Burn GG for proportional ETH</li>
            <li>• Creates liquidity mechanism</li>
            <li>• Real asset backing guaranteed</li>
            <li>• Exit anytime you want</li>
          </ul>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-orange-50 to-pink-50 p-5 rounded-2xl border border-orange-200 mb-4 shadow-lg',
          'bg-gradient-to-r from-orange-800/20 to-pink-800/20 p-5 rounded-2xl border border-orange-600/30 mb-4 shadow-lg'
        )}>
          <h4 className={getThemeClass('font-bold text-orange-700 mb-3 flex items-center', 'font-bold text-orange-300 mb-3 flex items-center')}>
          <span className="text-xl mr-2">📊</span>
          Inflation and Fees
          </h4>
          
          <div className={getThemeClass(
          'bg-gradient-to-r from-orange-100 to-pink-100 p-3 rounded-xl border border-orange-200 mb-3',
          'bg-gradient-to-r from-orange-900/30 to-pink-900/30 p-3 rounded-xl border border-orange-500/30 mb-3'
          )}>
          <p className={getThemeClass('text-sm text-gray-700 mb-2', 'text-sm text-gray-300 mb-2')}>
            There are no protocol fees for loans, swaps, mints, or burns. GigaStrat's inflation
            is set at 10% of IOU-to-GG swaps minted to the fee address for security and development.
          </p>
          <ul className={getThemeClass('text-sm text-gray-700 space-y-1', 'text-sm text-gray-300 space-y-1')}>
            <li>🛠️ Offset development costs and continued open source work</li>
            <li>🛡️ Create deterrent to governance attacks via minted GG</li>
            <li>🚫 No VC allocation, no team allocation, no presale</li>
          </ul>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-yellow-100 to-orange-100 p-4 rounded-2xl border border-yellow-200 shadow-lg',
          'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-2xl border border-yellow-500/20 shadow-lg'
        )}>
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">💡</span>
          <div>
            <h4 className={getThemeClass('font-bold text-yellow-700 mb-2', 'font-bold text-yellow-300 mb-2')}>Strategic Choice</h4>
            <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            The conversion rate is set per loan. After swapping, you hold GG tokens which do not expire
            or require redemption like IOUs do - they represent permanent treasury ownership.
            </p>
          </div>
          </div>
        </div>
        </>
      )
    },

    ious: {
      title: 'IOUs',
      content: (
        <>
        <div className={getThemeClass(
          'bg-gradient-to-br from-orange-100 to-pink-100 p-6 rounded-2xl mb-6 border border-orange-200',
          'bg-gradient-to-br from-orange-900/30 to-pink-900/30 p-6 rounded-2xl mb-6 border border-orange-500/20'
        )}>
          <div className="flex items-center mb-4">
          <div className={getThemeClass(
            'w-12 h-12 bg-gradient-to-r from-orange-400 to-pink-400 rounded-full flex items-center justify-center mr-4 shadow-lg',
            'w-12 h-12 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg'
          )}>
            <span className="text-2xl">📄</span>
          </div>
          <h3 className={getThemeClass('text-xl font-bold text-orange-700', 'text-xl font-bold text-orange-300')}>Understanding IOUs</h3>
          </div>
          <p className={getThemeClass('text-gray-700 mb-4', 'text-gray-200 mb-4')}>
          IOUs are the tokens you receive when you fund a loan. They represent your share of
          the loan's principal and let you claim repayment plus interest as the manager sells ETH.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-2xl border border-pink-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="text-center mb-3">
            <span className="text-3xl">💰</span>
            <h4 className={getThemeClass('font-bold text-pink-500 mt-2', 'font-bold text-pink-300 mt-2')}>Funding</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 text-center', 'text-sm text-gray-300 text-center')}>
            Send stablecoins to a loan contract and receive IOU tokens representing your share
          </p>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-2xl border border-green-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="text-center mb-3">
            <span className="text-3xl">💎</span>
            <h4 className={getThemeClass('font-bold text-green-700 mt-2', 'font-bold text-green-300 mt-2')}>Interest</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 text-center', 'text-sm text-gray-300 text-center')}>
            Claim interest on your IOUs at any time without burning your principal
          </p>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-gray-700/50 to-gray-800/50 p-4 rounded-2xl border border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="text-center mb-3">
            <span className="text-3xl">🔄</span>
            <h4 className={getThemeClass('font-bold text-orange-700 mt-2', 'font-bold text-orange-300 mt-2')}>Redeem</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 text-center', 'text-sm text-gray-300 text-center')}>
            Convert IOUs back to stablecoins based on repaid principal amounts
          </p>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-red-100 to-pink-100 p-5 rounded-2xl border border-red-200 mb-6 shadow-lg',
          'bg-gradient-to-r from-red-900/30 to-pink-900/30 p-5 rounded-2xl border border-red-500/20 mb-6 shadow-lg'
        )}>
          <h4 className={getThemeClass('font-bold text-red-700 mb-3 flex items-center', 'font-bold text-red-300 mb-3 flex items-center')}>
          <span className="text-xl mr-2">⚠️</span>
          Important About Redemption
          </h4>
          
          <div className={getThemeClass(
          'bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-xl border border-red-200',
          'bg-gradient-to-r from-red-900/30 to-pink-900/30 p-3 rounded-xl border border-red-500/30'
          )}>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
            <strong>Be careful:</strong> Redeeming IOUs will only give you however much principal 
            has been repaid to-date. If the loan is not fully repaid, you won't get the entire 
            principal unless enough ETH has been sold to cover it.
          </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-green-800/20 to-emerald-800/20 p-4 rounded-2xl border border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🏦</span>
            <h4 className={getThemeClass('font-bold text-green-700', 'font-bold text-green-300')}>Lender Benefits</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
            Hold IOUs to continue earning interest over time, or swap them for GG tokens
            to gain exposure to the protocol's ETH treasury growth.
          </p>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-pink-800/20 to-rose-800/20 p-4 rounded-2xl border border-pink-500/20 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🔧</span>
            <h4 className={getThemeClass('font-bold text-pink-500', 'font-bold text-pink-300')}>Flexible Options</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
            Choose between claiming interest, redeeming for stablecoins, or converting
            to GG tokens based on your investment strategy and risk tolerance.
          </p>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-orange-100 to-pink-100 p-4 rounded-2xl border border-orange-200 shadow-lg',
          'bg-gradient-to-r from-orange-900/30 to-pink-900/30 p-4 rounded-2xl border border-orange-500/20 shadow-lg'
        )}>
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">💫</span>
          <div>
            <h4 className={getThemeClass('font-bold text-orange-700 mb-2', 'font-bold text-orange-300 mb-2')}>Path to Treasury Exposure</h4>
            <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            IOUs serve as the bridge between traditional lending and treasury participation.
            Start as a lender, then decide if you want broader protocol exposure through GG tokens.
            </p>
          </div>
          </div>
        </div>
        </>
      )
    },
    gg: {
      title: 'GG Value Accumulation and Value',
      content: (
        <>
        <div className={getThemeClass(
          'bg-gradient-to-br from-yellow-100 to-orange-100 p-6 rounded-2xl mb-6 border border-yellow-200',
          'bg-gradient-to-br from-yellow-900/30 to-orange-900/30 p-6 rounded-2xl mb-6 border border-yellow-500/20'
        )}>
          <div className="flex items-center mb-4">
          <div className={getThemeClass(
            'w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-4 shadow-lg',
            'w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mr-4 shadow-lg'
          )}>
            <span className="text-2xl">🏆</span>
          </div>
          <h3 className={getThemeClass('text-xl font-bold text-yellow-700', 'text-xl font-bold text-yellow-300')}>Understanding GG Value Mechanics</h3>
          </div>
          <p className={getThemeClass('text-gray-700 mb-4', 'text-gray-200 mb-4')}>
          GG tokens represent proportional ownership of GigaStrat's ETH treasury. As the protocol executes its strategy
          of borrowing USDC, buying ETH, and repaying loans over time, the value accumulation happens through multiple
          compounding mechanisms that directly benefit GG holders.
          </p>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-green-100 to-emerald-100 p-6 rounded-2xl mb-6 border border-green-200 shadow-lg',
          'bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-6 rounded-2xl mb-6 border border-green-500/20 shadow-lg'
        )}>
          <div className="flex items-center mb-4">
          <span className="text-3xl mr-4">📊</span>
          <h4 className={getThemeClass('text-2xl font-bold text-green-700', 'text-2xl font-bold text-green-300')}>The $100,000 Example Breakdown</h4>
          </div>
          
          <div className="space-y-4">
            <div className={getThemeClass(
              'bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200',
              'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-4 rounded-xl border border-blue-500/30'
            )}>
              <h5 className={getThemeClass('font-bold text-blue-700 mb-2', 'font-bold text-blue-300 mb-2')}>Initial State: 1 GG Token Outstanding</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                You hold the only GG token in existence. The protocol has raised $100,000 in loans and immediately
                converted it to ETH at current market prices. Let's say ETH is $2,000, so the treasury now holds 50 ETH.
              </p>
            </div>
            
            <div className={getThemeClass(
              'bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200',
              'bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-xl border border-purple-500/30'
            )}>
              <h5 className={getThemeClass('font-bold text-purple-700 mb-2', 'font-bold text-purple-300 mb-2')}>ETH Price Doubles: $2,000 → $4,000</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                The 50 ETH in the treasury is now worth $200,000. The protocol still owes $100,000 to IOU holders
                (the original loan amount), but now has double the value needed to repay them.
              </p>
            </div>
            
            <div className={getThemeClass(
              'bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200',
              'bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-4 rounded-xl border border-green-500/30'
            )}>
              <h5 className={getThemeClass('font-bold text-green-700 mb-2', 'font-bold text-green-300 mb-2')}>Loan Repayment: $100,000 Returned</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                Over 4 years, the protocol sells 25 ETH (worth $100,000 at new prices) to repay all IOU holders.
                This leaves 25 ETH ($100,000 worth) permanently in the treasury as pure profit.
              </p>
            </div>
            
            <div className={getThemeClass(
              'bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200',
              'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-4 rounded-xl border border-yellow-500/30'
            )}>
              <h5 className={getThemeClass('font-bold text-yellow-700 mb-2', 'font-bold text-yellow-300 mb-2')}>Your GG Token Value: $100,000</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                As the sole GG holder, your single token represents 100% ownership of the 25 ETH treasury.
                You can burn your GG token anytime to claim the full $100,000 worth of ETH.
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={getThemeClass(
            'bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-200 shadow-lg',
            'bg-gradient-to-br from-pink-800/20 to-rose-800/20 p-4 rounded-2xl border border-pink-500/30 shadow-lg'
          )}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">⚡</span>
              <h4 className={getThemeClass('font-bold text-pink-500', 'font-bold text-pink-300')}>Instant Treasury Building</h4>
            </div>
            <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
              When IOU holders swap for GG tokens, their underlying ETH transfers immediately to the treasury.
              This creates instant backing value without waiting for loan repayments to complete.
            </p>
          </div>
          
          <div className={getThemeClass(
            'bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-2xl border border-orange-200 shadow-lg',
            'bg-gradient-to-br from-orange-800/20 to-pink-800/20 p-4 rounded-2xl border border-orange-500/30 shadow-lg'
          )}>
            <div className="flex items-center mb-3">
              <span className="text-2xl mr-3">🔄</span>
              <h4 className={getThemeClass('font-bold text-orange-600', 'font-bold text-orange-300')}>Continuous Compounding</h4>
            </div>
            <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
              Multiple loans operate in parallel, each contributing ETH to the treasury as they complete their cycles.
              The treasury grows from both IOU conversions and completed loan profits.
            </p>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-indigo-100 to-purple-100 p-5 rounded-2xl border border-indigo-200 mb-6 shadow-lg',
          'bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-5 rounded-2xl border border-indigo-500/20 mb-6 shadow-lg'
        )}>
          <h4 className={getThemeClass('font-bold text-indigo-700 mb-4 flex items-center text-xl', 'font-bold text-indigo-300 mb-4 flex items-center text-xl')}>
            <span className="text-2xl mr-3">💰</span>
            Value Accumulation Sources
          </h4>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className={getThemeClass(
              'bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-xl border border-indigo-200',
              'bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-3 rounded-xl border border-indigo-500/30'
            )}>
              <h5 className={getThemeClass('font-bold text-indigo-700 mb-2', 'font-bold text-indigo-300 mb-2')}>ETH Price Appreciation</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                The primary value driver. As ETH price increases, the treasury's value grows faster than
                the fixed USDC obligations to IOU holders.
              </p>
            </div>
            
            <div className={getThemeClass(
              'bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-200',
              'bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-3 rounded-xl border border-purple-500/30'
            )}>
              <h5 className={getThemeClass('font-bold text-purple-700 mb-2', 'font-bold text-purple-300 mb-2')}>IOU → GG Conversions</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                When lenders convert IOUs to GG, their ETH allocation transfers to the permanent treasury,
                reducing future repayment obligations.
              </p>
            </div>
            
            <div className={getThemeClass(
              'bg-gradient-to-r from-pink-50 to-rose-50 p-3 rounded-xl border border-pink-200',
              'bg-gradient-to-r from-pink-900/30 to-rose-900/30 p-3 rounded-xl border border-pink-500/30'
            )}>
              <h5 className={getThemeClass('font-bold text-pink-700 mb-2', 'font-bold text-pink-300 mb-2')}>Excess ETH After Repayment</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                Any ETH remaining after full loan repayment becomes permanent treasury assets,
                directly increasing the backing per GG token.
              </p>
            </div>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-2xl border border-red-200 mb-6 shadow-lg',
          'bg-gradient-to-r from-red-900/30 to-pink-900/30 p-5 rounded-2xl border border-red-500/20 mb-6 shadow-lg'
        )}>
          <h4 className={getThemeClass('font-bold text-red-700 mb-3 flex items-center', 'font-bold text-red-300 mb-3 flex items-center')}>
            <span className="text-xl mr-2">⚠️</span>
            Risk Considerations for GG Holders
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4"></div>
            <div className={getThemeClass(
              'bg-gradient-to-r from-red-50 to-pink-50 p-3 rounded-xl border border-red-200',
              'bg-gradient-to-r from-red-900/30 to-pink-900/30 p-3 rounded-xl border border-red-500/30'
            )}>
              <h5 className={getThemeClass('font-bold text-red-700 mb-2', 'font-bold text-red-300 mb-2')}>ETH Price Decline</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                If ETH price falls significantly, the treasury may not have enough value to cover both
                IOU redemptions and maintain GG backing. GG holders absorb this risk.
              </p>
            </div>
            
            <div className={getThemeClass(
              'bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-xl border border-orange-200 mt-2',
              'bg-gradient-to-r from-orange-900/30 to-red-900/30 p-3 rounded-xl border border-orange-500/30 mt-2'
            )}>
              <h5 className={getThemeClass('font-bold text-orange-700 mb-2', 'font-bold text-orange-300 mb-2')}>Treasury Dilution</h5>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
                New GG tokens are minted when IOUs convert, diluting existing holders unless the
                incoming ETH value exceeds the dilution impact. This is mitigated by the
                50% premium on the conversion rate.
              </p>
            </div>
          </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-yellow-100 to-orange-100 p-5 rounded-2xl border border-yellow-200 shadow-lg',
          'bg-gradient-to-r from-yellow-900/30 to-orange-900/30 p-5 rounded-2xl border border-yellow-500/20 shadow-lg'
        )}>
          <div className="flex items-start">
            <span className="text-3xl mr-4 mt-1">🎯</span>
            <div>
              <h4 className={getThemeClass('font-bold text-yellow-700 mb-3 text-xl', 'font-bold text-yellow-300 mb-3 text-xl')}>Long-Term Value Proposition</h4>
              <p className={getThemeClass('text-gray-700 mb-3', 'text-gray-200 mb-3')}>
                GG tokens represent a leveraged bet on ETH price appreciation with automatic profit realization.
                Unlike simply holding ETH, GG holders benefit from:
              </p>
              
              <ul className={getThemeClass('text-sm text-gray-700 space-y-2', 'text-sm text-gray-300 space-y-2')}>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>Leveraged ETH exposure</strong> through borrowed capital converted to ETH</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>Automatic profit taking</strong> as loans are repaid during ETH appreciation cycles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>Compound treasury growth</strong> from multiple parallel loan cycles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-1">•</span>
                  <span><strong>Instant liquidity</strong> through burn-to-redeem mechanism</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        </>
      )
    },
    refs: {
      title: 'Referrals',
      content: (
        <>
        <div className={getThemeClass(
          'bg-gradient-to-br from-pink-100 to-rose-100 p-6 rounded-2xl mb-6 border border-pink-200',
          'bg-gradient-to-br from-pink-900/30 to-rose-900/30 p-6 rounded-2xl mb-6 border border-pink-500/20'
          )}>
          <div className="flex items-center mb-4">
          <div className={getThemeClass(
          'w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full flex items-center justify-center mr-4 shadow-lg',
          'w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mr-4 shadow-lg'
          )}>
            <span className="text-2xl">🔗</span>
          </div>
<h3 className={getThemeClass('text-xl font-bold text-pink-600', 'text-xl font-bold text-pink-300')}>Referral Program Overview</h3>
          </div>
          <p className={getThemeClass('text-gray-700 mb-4', 'text-gray-200 mb-4')}>
          GigaStrat offers a referral program to incentivize community members to bring new users to the platform.
          Referrers can earn rewards by sharing their unique referral link with others.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-green-800/20 to-emerald-800/20 p-4 rounded-2xl border border-green-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🎯</span>
            <h4 className={getThemeClass('font-bold text-green-600', 'font-bold text-green-300')}>How It Works</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
            Share your unique referral link with friends, family, or on social media. 
            When someone uses your link to mint GG tokens, you earn 20% of the 10% GG inflation.
          </p>
          </div>
          <div className={getThemeClass(
          'bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-blue-800/20 to-purple-800/20 p-4 rounded-2xl border border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">💰</span>
            <h4 className={getThemeClass('font-bold text-blue-600', 'font-bold text-blue-300')}>Rewards Structure</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-300')}>
            Earn a percentage of the transaction fees generated by users you refer. 
            The more active your referrals are, the more rewards you can accumulate. Rewards are distributed in GG tokens to your wallet when distributions happen.
          </p>
          </div>
        </div>
        <button className={getThemeClass(
          'bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold py-2 px-4 rounded-full w-full hover:from-purple-500 hover:to-indigo-500 transition-all duration-300',
          'bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold py-2 px-4 rounded-full w-full hover:from-purple-800 hover:to-indigo-800 transition-all duration-300'
)}
        onClick={() => {
          navigator.clipboard.writeText(window.location.href + '?ref=' + userAddress);
          toast.success('Referral link copied to clipboard!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true}
          );
        }
        }
        >
          Get Your Referral Link
        </button>
        </>
      )
    },
staking: {
      title: 'Staking GG and IOUs',
      content: (
        <>
        <div className={getThemeClass(
          'bg-gradient-to-br from-purple-100 to-indigo-100 p-6 rounded-2xl mb-6 border border-purple-200',
          'bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-6 rounded-2xl mb-6 border border-purple-500/20'
        )}>
          <div className="flex items-center mb-4">
          <div className={getThemeClass(
            'w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mr-4 shadow-lg',
            'w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-lg'
          )}>
            <span className="text-2xl">💎</span>
          </div>
          <h3 className={getThemeClass('text-xl font-bold text-purple-600', 'text-xl font-bold text-purple-300')}>How Staking Works</h3>
          </div>
          <p className={getThemeClass('text-gray-700 mb-4', 'text-gray-200 mb-4')}>
          Staking allows you to lock up your IOU loans or GG tokens to earn $IOU rewards over time. 
          $IOU is the native token of IOU.fi and is used for governance purposes within the broader ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-purple-800/20 to-indigo-800/20 p-4 rounded-2xl border border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🪙</span>
            <h4 className={getThemeClass('font-bold text-purple-600', 'font-bold text-purple-300')}>Staking GG Tokens</h4>
          </div>
          <ul className={getThemeClass('text-sm text-gray-700 space-y-2', 'text-sm text-gray-300 space-y-2')}>
            <li>• Lock GG tokens to earn $IOU rewards</li>
            <li>• Maintain exposure to ETH treasury growth</li>
            <li>• Participate in protocol governance</li>
            <li>• Compound rewards by restaking</li>
            <li>• Flexible withdrawal options</li>
          </ul>
          </div>
          
          <div className={getThemeClass(
          'bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-blue-800/20 to-purple-800/20 p-4 rounded-2xl border border-blue-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">📄</span>
            <h4 className={getThemeClass('font-bold text-blue-600', 'font-bold text-blue-300')}>Staking IOU Tokens</h4>
          </div>
          <ul className={getThemeClass('text-sm text-gray-700 space-y-2', 'text-sm text-gray-300 space-y-2')}>
            <li>• Stake individual loan IOUs for rewards</li>
            <li>• Continue earning loan interest</li>
            <li>• Additional $IOU token rewards</li>
            <li>• Support specific loan pools</li>
            <li>• Maintain liquidity options</li>
          </ul>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-green-100 to-emerald-100 p-5 rounded-2xl border border-green-200 mb-6 shadow-lg',
          'bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-5 rounded-2xl border border-green-500/20 mb-6 shadow-lg'
        )}>
          <h4 className={getThemeClass('font-bold text-green-700 mb-3 flex items-center', 'font-bold text-green-300 mb-3 flex items-center')}>
          <span className="text-xl mr-2">⏰</span>
          Staking Mechanics
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className={getThemeClass(
            'bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border border-green-200',
            'bg-gradient-to-r from-green-900/30 to-emerald-900/30 p-3 rounded-xl border border-green-500/30'
            )}>
            <h5 className={getThemeClass('font-bold text-green-700 mb-2', 'font-bold text-green-300 mb-2')}>Earning Rewards</h5>
            <ul className={getThemeClass('text-sm text-gray-700 space-y-1', 'text-sm text-gray-300 space-y-1')}>
              <li>🎯 Stake tokens to earn rewards</li>
              <li>📈 Rewards accrue over time</li>
              <li>💰 Claim rewards anytime</li>
              <li>🔓 Withdraw staked tokens anytime</li>
            </ul>
            </div>
            
            <div className={getThemeClass(
            'bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-xl border border-blue-200',
            'bg-gradient-to-r from-blue-900/30 to-purple-900/30 p-3 rounded-xl border border-blue-500/30'
            )}>
            <h5 className={getThemeClass('font-bold text-blue-700 mb-2', 'font-bold text-blue-300 mb-2')}>Governance Benefits</h5>
            <ul className={getThemeClass('text-sm text-gray-700 space-y-1', 'text-sm text-gray-300 space-y-1')}>
              <li>🗳️ $IOU tokens provide voting rights</li>
              <li>🏛️ Participate in protocol decisions</li>
              <li>💡 Propose new features or changes</li>
              <li>🤝 Shape the future of IOU.fi</li>
            </ul>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-yellow-800/20 to-orange-800/20 p-4 rounded-2xl border border-yellow-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="text-center mb-3">
            <span className="text-3xl">🔒</span>
            <h4 className={getThemeClass('font-bold text-yellow-600 mt-2', 'font-bold text-yellow-300 mt-2')}>Lock Period</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 text-center', 'text-sm text-gray-300 text-center')}>
            Flexible staking with no mandatory lock periods. Withdraw anytime while keeping earned rewards.
          </p>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-2xl border border-pink-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-pink-800/20 to-rose-800/20 p-4 rounded-2xl border border-pink-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="text-center mb-3">
            <span className="text-3xl">💎</span>
            <h4 className={getThemeClass('font-bold text-pink-500 mt-2', 'font-bold text-pink-300 mt-2')}>Rewards</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 text-center', 'text-sm text-gray-300 text-center')}>
            Earn $IOU tokens based on staking duration and amount. Higher stakes earn proportionally more.
          </p>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-indigo-800/20 to-purple-800/20 p-4 rounded-2xl border border-indigo-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="text-center mb-3">
            <span className="text-3xl">🏛️</span>
            <h4 className={getThemeClass('font-bold text-indigo-600 mt-2', 'font-bold text-indigo-300 mt-2')}>Governance</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700 text-center', 'text-sm text-gray-300 text-center')}>
            Use earned $IOU tokens to vote on protocol upgrades, parameter changes, and new features.
          </p>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-2xl border border-purple-200 shadow-lg',
          'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-4 rounded-2xl border border-purple-500/20 shadow-lg'
        )}>
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">🎯</span>
          <div>
            <h4 className={getThemeClass('font-bold text-purple-600 mb-2', 'font-bold text-purple-300 mb-2')}>Strategic Benefits</h4>
            <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            Staking creates additional value streams while maintaining your original investment exposure. 
            GG stakers keep treasury benefits, while IOU stakers continue earning loan interest plus governance rewards.
            </p>
          </div>
          </div>
        </div>
        <button
              className={getThemeClass(
                "w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-4",
                "w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 mt-4",
                darkMode
              )}
              onClick={() => window.open('https://iou.fi/', '_blank')}
              target="_blank"
            >
              Go to IOU.fi to Stake
            </button>

        </>
      )
    },
    
      
    risks: {
      title: 'Risks and Considerations',
      content: (
        <>
        <div className={getThemeClass(
          'bg-gradient-to-br from-red-100 to-pink-100 p-6 rounded-2xl mb-6 border border-red-200',
          'bg-gradient-to-br from-red-900/30 to-pink-900/30 p-6 rounded-2xl mb-6 border border-red-500/20'
        )}>
          <div className="flex items-center mb-4">
          <div className={getThemeClass(
            'w-12 h-12 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center mr-4 shadow-lg',
            'w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mr-4 shadow-lg'
          )}>
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className={getThemeClass('text-xl font-bold text-red-700', 'text-xl font-bold text-red-300')}>Important Disclaimers</h3>
          </div>
          <p className={getThemeClass('text-gray-700 mb-4', 'text-gray-200 mb-4')}>
          GigaStrat is a new protocol with inherent risks. Please read and understand these risks before participating:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className={getThemeClass(
          'bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-yellow-800/20 to-orange-800/20 p-4 rounded-2xl border border-yellow-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🔒</span>
            <h4 className={getThemeClass('font-bold text-yellow-700', 'font-bold text-yellow-300')}>Smart Contract Risks</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            As with any smart contract, there is a risk of bugs or vulnerabilities. The code is open source
            but has not undergone formal audits. No system is completely secure.
          </p>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-2xl border border-red-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-red-800/20 to-pink-800/20 p-4 rounded-2xl border border-red-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">📉</span>
            <h4 className={getThemeClass('font-bold text-red-700', 'font-bold text-red-300')}>Market Risks</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            The protocol's value is tied to ETH price. If ETH drops significantly, the treasury
            may not be able to cover all IOU redemptions or GG burns, leading to potential losses.
          </p>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-orange-50 to-pink-50 p-4 rounded-2xl border border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-orange-800/20 to-pink-800/20 p-4 rounded-2xl border border-orange-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🧪</span>
            <h4 className={getThemeClass('font-bold text-orange-700', 'font-bold text-orange-300')}>Alpha Version</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            This is an ALPHA version for test purposes only and is not for use with real funds.
            Funds could be considered lost on deposit with no notice if contracts get updated.
          </p>
          </div>

          <div className={getThemeClass(
          'bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300',
          'bg-gradient-to-br from-purple-800/20 to-pink-800/20 p-4 rounded-2xl border border-purple-500/30 shadow-lg hover:shadow-xl transition-all duration-300'
          )}>
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">⚖️</span>
            <h4 className={getThemeClass('font-bold text-purple-700', 'font-bold text-purple-300')}>Liability</h4>
          </div>
          <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
            GigaStrat is provided "as is" without warranties of any kind. By using this protocol,
            you acknowledge the risks and agree that developers are not liable for losses.
          </p>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-2xl border border-blue-200 mb-4 shadow-lg',
          'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 p-4 rounded-2xl border border-blue-500/20 mb-4 shadow-lg'
        )}>
          <div className="flex items-start">
            <span className="text-2xl mr-3 mt-1">💡</span>
            <div>
              <h4 className={getThemeClass('font-bold text-blue-700 mb-2', 'font-bold text-blue-300 mb-2')}>Risk Management</h4>
              <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
                Only risk funds you can afford to lose. The protocol's performance depends heavily on ETH price
                movements and smart contract security. Do your own research before participating.
              </p>
            </div>
          </div>
        </div>

        <div className={getThemeClass(
          'bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-2xl border border-red-200 shadow-lg',
          'bg-gradient-to-r from-red-800/30 to-pink-800/30 p-4 rounded-2xl border border-red-400/30 shadow-lg'
        )}>
          <div className="text-center">
            <span className="text-3xl mb-2 block">🛡️</span>
            <h4 className={getThemeClass('font-bold text-red-700 mb-2', 'font-bold text-red-300 mb-2')}>Use at Your Own Risk</h4>
            <p className={getThemeClass('text-sm text-gray-700', 'text-sm text-gray-200')}>
              By proceeding, you acknowledge that you have read, understood, and accepted all risks associated with using GigaStrat.
            </p>
          </div>
        </div>
        </>
      )
    }
  };

  const tabItems = Object.keys(docs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 md:p-6">
      <div
        className={getThemeClass(
          "relative bg-white text-gray-800 w-full max-w-4xl rounded-3xl shadow-lg flex flex-col md:flex-row",
          "relative bg-gray-800 text-white w-full max-w-4xl rounded-3xl shadow-lg flex flex-col md:flex-row",
          darkMode
        )}
        style={{ maxHeight: "90vh" }}
      >
        {/* Theme toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={getThemeClass(
            "absolute top-3 right-3 md:top-4 md:right-4 z-10 text-2xl p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-110",
            "absolute top-3 right-3 md:top-4 md:right-4 z-10 text-2xl p-2 bg-gray-700 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-transform duration-300 hover:scale-110",
            darkMode
          )}
        >
          {darkMode ? "🌙" : "☀️"}
        </button>

        {/* Sidebar / header */}
        <div
          className={getThemeClass(
            "hidden md:block w-full md:w-1/3 md:border-b-0 md:border-r border-gray-200 overflow-y-auto rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none",
            "hidden md:block w-full md:w-1/3 border-b md:border-b-0 md:border-r border-gray-600 overflow-y-auto rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none",
            darkMode
          )}
        >
          {/* Social links */}
          <div
            className={getThemeClass(
              "flex items-center justify-center my-4 mb-6 gap-3 bg-gray-100 px-4 py-2 rounded-full w-fit mx-auto",
              "flex items-center justify-center my-4 mb-6 gap-3 bg-gray-700 px-4 py-2 rounded-full w-fit mx-auto",
              darkMode
            )}
          >
            {/* Twitter */}
            <a
              href="https://twitter.com/not_pr0"
              target="_blank"
              rel="noopener noreferrer"
              className={getThemeClass(
                "text-blue-600 hover:text-blue-700 transition-colors",
                "text-blue-400 hover:text-blue-300 transition-colors",
                darkMode
              )}
            >
              <svg
                role="img"
                fill={darkMode ? "#fff" : "#ec4899"}
                className="color-blue-100 w-6 h-6"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
            {/* Discord */}
            <a
              href="https://discord.gg/vrV4YpUccq"
              target="_blank"
              rel="noopener noreferrer"
              className={getThemeClass(
                "text-blue-600 hover:text-blue-700 transition-colors",
                "text-blue-400 hover:text-blue-300 transition-colors",
                darkMode
              )}
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill={darkMode ? "#fff" : "#ec4899"}
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
            {/* Basescan */}
            <a
              href="https://basescan.org/address/0xa5d97df3b74019d794cafbaF2d63Cc56250a8dF7"
              target="_blank"
              rel="noopener noreferrer"
              className={getThemeClass(
                "text-blue-600 hover:text-blue-700 transition-colors",
                "text-blue-400 hover:text-blue-300 transition-colors",
                darkMode
              )}
            >
              <img
                src="https://basescan.org/assets/base/images/svg/brandassets/logo-symbol.svg?v=25.1.4.0"
                alt="basescan"
                className="w-6 h-6 inline-block"
              />
            </a>
          </div>

          {/* Tab list (desktop) */}
          <div className="hidden md:block">
            {tabItems.map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`block w-full text-left px-6 py-4 border-b transition-all duration-300 ${
                  activeTab === key
                    ? getThemeClass(
                        "bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold border-pink-500 shadow-lg",
                        "bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold border-purple-500 shadow-lg",
                        darkMode
                      )
                    : getThemeClass(
                        "text-gray-700 border-gray-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 hover:text-pink-500",
                        "text-gray-300 border-gray-600 hover:bg-gradient-to-r hover:from-gray-700 hover:to-gray-600 hover:text-purple-300",
                        darkMode
                      )
                }`}
              >
                {docs[key].title}
              </button>
            ))}
          </div>

          {/* Close button */}
          <div className="hidden md:block mt-6 text-center px-4 pb-6">
            <button
              onClick={onClose}
              className={getThemeClass(
                "w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105",
                "w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105",
                darkMode
              )}
            >
              ✨ Got it!
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full md:w-2/3 py-2 p-6 md:p-8 overflow-y-auto">
        
          <div
            className={getThemeClass(
              "block md:hidden flex items-center justify-center my-4 mb-2 gap-3 bg-gray-100 px-4 py-2 rounded-full w-fit mx-auto",
              "block md:hidden flex items-center justify-center my-4 mb-2 gap-3 bg-gray-700 px-4 py-2 rounded-full w-fit mx-auto",
              darkMode
            )}
          >
            {/* Twitter */}
            <a
              href="https://twitter.com/not_pr0"
              target="_blank"
              rel="noopener noreferrer"
              className={getThemeClass(
                "text-blue-600 hover:text-blue-700 transition-colors",
                "text-blue-400 hover:text-blue-300 transition-colors",
                darkMode
              )}
            >
              <svg
                role="img"
                fill={darkMode ? "#fff" : "#ec4899"}
                className="color-blue-100 w-6 h-6"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
              </svg>
            </a>
            {/* Discord */}
            <a
              href="https://discord.gg/vrV4YpUccq"
              target="_blank"
              rel="noopener noreferrer"
              className={getThemeClass(
                "text-blue-600 hover:text-blue-700 transition-colors",
                "text-blue-400 hover:text-blue-300 transition-colors",
                darkMode
              )}
            >
              <svg
                role="img"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill={darkMode ? "#fff" : "#ec4899"}
              >
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </a>
            {/* Basescan */}
            <a
              href="https://basescan.org/address/0xa5d97df3b74019d794cafbaF2d63Cc56250a8dF7"
              target="_blank"
              rel="noopener noreferrer"
              className={getThemeClass(
                "text-blue-600 hover:text-blue-700 transition-colors",
                "text-blue-400 hover:text-blue-300 transition-colors",
                darkMode
              )}
            >
              <img
                src="https://basescan.org/assets/base/images/svg/brandassets/logo-symbol.svg?v=25.1.4.0"
                alt="basescan"
                className="w-6 h-6 inline-block"
              />
            </a>
          </div>
          <div className="px-6 pb-2 md:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className={getThemeClass(
                "w-full border border-gray-300 rounded-xl p-3 text-white text-center font-semibold bg-gradient-to-r from-pink-500 to-rose-500 focus:outline-none focus:ring-2 focus:ring-pink-500",
                "w-full border border-gray-600 bg-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500",
                darkMode
              )}
            >
              {tabItems.map((key) => (
                <option key={key} value={key} className=
                  {getThemeClass(
                    "text-pink-500 font-semibold",
                    "text-gray-300",
                    darkMode
                  )}>
                  {docs[key].title}
                </option>
              ))}
            </select>
          </div>
          <h2
            className={getThemeClass(
              "text-2xl sm:text-3xl font-black mb-6 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 bg-clip-text text-transparent",
              "text-2xl sm:text-3xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent",
              darkMode
            )}
          >
            {docs[activeTab].title}
          </h2>
          <div
            className={getThemeClass(
              "text-gray-700",
              "text-gray-200",
              darkMode
            )}
          >
            {docs[activeTab].content}
          </div>
      <div className="px-6 mt-4 md:hidden">
            <button
              onClick={onClose}
              className={getThemeClass(
                "w-full px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-500 hover:to-rose-600 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105",
                "w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105",
                darkMode
              )}
            >
              ✨ Got it!
            </button>
        </div> 
        </div>
      </div>
    </div>
  );
}



  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------
  return (
    <div
      className={getThemeClass(
        'min-h-screen w-full bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 text-gray-800 px-4 py-6',
        'min-h-screen w-full bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 px-4 py-6'
      )}
    >
    <title>GigaStrat</title>
      <meta name="description" content="GigaStrat - A fully onchain ETH treasury" />
      <Toaster
        position="top-right"
        toastOptions={{
          style: darkMode
            ? {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
                border: '1px solid #6b46c1'
              }
            : {
                borderRadius: '12px',
                border: '1px solid #ec4899'
              }
        }}
      />
      {showModal && <InfoModal />}
      <GigaStratModal show={showGigaStratModal} onClose={() => setShowGigaStratModal(false)} />

      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-center mb-8">
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className={getThemeClass(
            'text-3xl absolute top-4 left-4 p-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110',
            'text-3xl absolute top-4 left-4 p-3 bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110'
          )}
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
        <div className="absolute flex top-4 right-4 gap-3">
          <button
            onClick={() => setShowGigaStratModal(true)}
            className={getThemeClass(
              'text-xl rounded-full border-2 border-pink-400 text-pink-500 px-4 py-2 font-semibold hover:bg-pink-50 hover:border-pink-500 transition-all duration-300 backdrop-blur-sm bg-white/80 shadow-lg hover:shadow-xl',
              'text-xl rounded-full border-2 border-purple-400 text-purple-300 px-4 py-2 font-semibold hover:bg-gray-800/50 hover:border-purple-300 transition-all duration-300 backdrop-blur-sm bg-gray-800/80 shadow-lg hover:shadow-xl'
            )}
          >
            ?
          </button>
          <div className={getThemeClass(
            "bg-white/80 backdrop-blur-sm rounded-2xl p-1 shadow-lg",
            "bg-white/50 backdrop-blur-sm rounded-2xl p-1 shadow-lg")}>
            <ConnectButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto text-center mb-12">
        <h1
          className={getThemeClass(
            'text-6xl md:text-7xl font-black text-pink-500 tracking-tight mb-6 drop-shadow-2xl h-24 relative top-6 md:top-0',
            'text-6xl md:text-7xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent tracking-tight mb-6 drop-shadow-2xl h-24 relative top-6 md:top-0'
          )}
        >
           GigaStrat 
        </h1>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <div
            className={getThemeClass(
              'bg-gradient-to-r from-pink-400 to-rose-400 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-sm min-w-[280px] transform hover:scale-105 transition-all duration-300',
              'bg-gradient-to-r from-purple-600 to-purple-500 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-sm min-w-[280px] transform hover:scale-105 transition-all duration-300'
            )}
          >
            <h2 className="text-2xl font-bold mb-1">ETH Treasury</h2>
            <p className="text-3xl font-black">{Number(GGEthBalance).toFixed(4)} ETH</p>
          </div>
          
          <div
            className={getThemeClass(
              'bg-gradient-to-r from-emerald-400 to-teal-400 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-sm min-w-[280px] transform hover:scale-105 transition-all duration-300',
              'bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-4 rounded-2xl shadow-2xl backdrop-blur-sm min-w-[280px] transform hover:scale-105 transition-all duration-300'
            )}
          >
            <h2 className="text-2xl font-bold mb-1">My {GGSymbol || 'GG'} Tokens</h2>
            <p className="text-3xl font-black">{Number(myGGBalance).toFixed(4)}</p>
          </div>
        </div>
      </div>

      {/* Swap IOU → GG & Burn GG → ETH */}
      <div className="max-w-5xl mx-auto mb-16">
        <div
          className={getThemeClass(
            'bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-pink-200/50 max-w-md mx-auto',
            'bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-purple-500/30 max-w-md mx-auto'
          )}
        >
          <div className="text-center mb-8">
            <h3
              className={getThemeClass(
                'text-2xl font-bold text-green-600 mb-2',
                'text-2xl font-bold text-green-400 mb-2'
              )}
            >
              🌱 Swap IOU → GG
            </h3>
            <p className={getThemeClass('text-gray-600 text-sm', 'text-gray-300 text-sm')}>
              Convert your IOU tokens to GG governance tokens
            </p>
          </div>

          <div className="space-y-4">
            <select
              className={getThemeClass(
                'w-full px-4 py-3 bg-green-50 rounded-xl border-2 border-green-200 text-green-700 font-semibold focus:border-green-400 focus:outline-none transition-colors',
                'w-full px-4 py-3 bg-gray-700 rounded-xl border-2 border-green-600/50 text-green-300 font-semibold focus:border-green-500 focus:outline-none transition-colors'
              )}
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

            <div
              className={getThemeClass(
                'flex w-full bg-green-50 rounded-xl border-2 border-green-200 p-1',
                'flex w-full bg-gray-700 rounded-xl border-2 border-green-600/50 p-1'
              )}
            >
              <input
                className={getThemeClass(
                  'bg-transparent flex-grow outline-none px-3 py-2 text-green-700 placeholder-green-500',
                  'bg-transparent flex-grow outline-none px-3 py-2 text-green-300 placeholder-green-400'
                )}
                placeholder="IOU amount"
                value={swapIOUAmount}
                onChange={(e) => setSwapIOUAmount(e.target.value)}
                title="Enter how many IOU tokens you want to swap for GG tokens."
              />
              <button
                onClick={() => {
                  const i = parseInt(swapIndex);
                  if (!loans[i]) return;
                  setSwapIOUAmount(loans[i].userIOUBalance || '0');
                }}
                className={getThemeClass(
                  'bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-lg px-4 py-2 font-semibold hover:from-pink-500 hover:to-rose-500 transition-all duration-300 shadow-lg',
                  'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg px-4 py-2 font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg'
                )}
                title="Swap all your IOU tokens for GG tokens."
                >
                Max
                </button>
              </div>

              <div className={getThemeClass(
                'bg-green-100 rounded-xl p-4 text-center',
                'bg-green-900/30 rounded-xl p-4 text-center'
              )}>
                <p className={getThemeClass('text-green-700 font-bold text-lg', 'text-green-300 font-bold text-lg')}>
                {swapIOUAmount || 0} IOU →{' '}
                {loans[swapIndex]
                  ? (
                    Number(swapIOUAmount || 0) /
                    Number(loans[swapIndex].iouConversionRate || 1)
                  ).toFixed(4)
                  : 0}{' '}
                {GGSymbol || 'GG'}
                </p>
              </div>

              <button
                onClick={handleSwapIOU}
                className={getThemeClass(
                'w-full py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-green-500 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
                'w-full py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
                )}
                title="Swap your IOU tokens to mint new GG tokens."
              >
                Mint GG Tokens
              </button>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-600 my-8"></div>

              <div className="text-center mb-6">
              <h3
                className={getThemeClass(
                'text-2xl font-bold text-pink-500 mb-2',
                'text-2xl font-bold text-purple-400 mb-2'
                )}
              >
                🔥 Burn GG for ETH
              </h3>
              <p className={getThemeClass('text-gray-600 text-sm', 'text-gray-300 text-sm')}>
                Burn your GG tokens to claim your share of the treasury
              </p>
              </div>

              <div className="space-y-4">
              <div
                className={getThemeClass(
                'flex w-full bg-pink-50 rounded-xl border-2 border-pink-200 p-1',
                'flex w-full bg-gray-700 rounded-xl border-2 border-purple-500/50 p-1'
                )}
              >
                <input
                className={getThemeClass(
                  'bg-transparent flex-grow outline-none px-3 py-2 text-pink-500 placeholder-pink-500',
                  'bg-transparent flex-grow outline-none px-3 py-2 text-purple-300 placeholder-purple-400'
                )}
                placeholder={`Amount of ${GGSymbol || 'GG'}`}
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                title="How many GG tokens you want to burn in exchange for ETH."
                />
                <button
                onClick={() => setBurnAmount(myGGBalance)}
                className={getThemeClass(
                  'bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-lg px-4 py-2 font-semibold hover:from-pink-500 hover:to-rose-500 transition-all duration-300 shadow-lg',
                  'bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg px-4 py-2 font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg'
                )}
              >
                Max
              </button>
            </div>

            {burnAmount && parseFloat(burnAmount) > 0 && (
              <div className={getThemeClass(
                'bg-pink-100 rounded-xl p-4 space-y-2',
                'bg-purple-900/30 rounded-xl p-4 space-y-2'
              )}>
                <p className={getThemeClass('text-pink-500 font-bold text-lg text-center', 'text-purple-300 font-bold text-lg text-center')}>
                  {burnAmount} {GGSymbol || 'GG'} → ~{burnPreview} ETH
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className={getThemeClass('text-pink-500', 'text-purple-400')}>
                    <span className="font-semibold">Total Supply:</span><br/>
                    {GGSupply || 'N/A'} GG
                  </div>
                  <div className={getThemeClass('text-pink-500', 'text-purple-400')}>
                    <span className="font-semibold">ETH/GG Ratio:</span><br/>
                    {(ethFromMint/GGSupply || 0).toFixed(6)} ETH
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleBurnDAOForETH}
              className={getThemeClass(
                'w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold text-lg hover:from-pink-500 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
                'w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
              )}
              title="Burn the specified amount of GG tokens for your share of the treasury ETH."
            >
              Burn GG Tokens
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className={getThemeClass(
              'text-4xl font-black mb-4 bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500 bg-clip-text text-transparent',
              'text-4xl font-black mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent'
            )}
          >
            GG Loans
          </h2>
          <button
            onClick={() => setShowSimple(!showSimple)}
            className={getThemeClass(
              'px-6 py-3 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-xl font-semibold hover:from-pink-500 hover:to-rose-500 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105',
              'px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105'
            )}
            title="Toggle between simple and advanced view"
          >
            {showSimple ? '🔧 Show Advanced' : '✨ Show Simple'}
          </button>
        </div>

        {showSimple && (
          <div className={getThemeClass(
            "bg-white/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-pink-200/50 max-w-2xl mx-auto mb-8",
            "bg-gray-800/90 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-purple-500/30 max-w-2xl mx-auto mb-8"
          )}>
            <div className="text-center mb-6">
              <h2
                className={getThemeClass(
                  'text-3xl font-bold text-pink-500 mb-2',
                  'text-3xl font-bold text-purple-400 mb-2'
                )}
              >
                Fund Current Loan
              </h2>
              <p className={getThemeClass('text-gray-600', 'text-gray-300')}>
                Support the active loan to earn interest
              </p>
            </div>

            {loans.length > 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="flex justify-center items-center gap-3 mb-4">
                    <span className={getThemeClass(
                      "bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full px-4 py-2 font-bold text-lg shadow-lg",
                      "bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full px-4 py-2 font-bold text-lg shadow-lg"
                    )}>
                      #{Number(loans[0].index) ?? 'N/A'}
                    </span>
                    <span className={getThemeClass(
                      "bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full px-4 py-2 font-bold text-lg shadow-lg",
                      "bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-full px-4 py-2 font-bold text-lg shadow-lg"
                    )}>
                      {Number(loans[0].interestRate) ?? 'N/A'}% APR
                    </span>
                  </div>

                  <div className="mb-6">
                    <div className={getThemeClass(
                      "bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner",
                      "bg-gray-600 rounded-full h-4 overflow-hidden shadow-inner"
                    )}>
                      <div 
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: Math.min(100, Number(loans[0].totalFunded || '0') / Number(loans[0].loanGoal || '1') * 100) + '%' }}
                      />
                    </div>
                    <p className={getThemeClass('text-pink-500 font-semibold mt-2', 'text-purple-400 font-semibold mt-2')}>
                      {((Number(loans[0].totalFunded || '0') / Number(loans[0].loanGoal || '1')) * 100).toFixed(1)}% funded
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Loan Goal', value: `${Number(loans[0].loanGoal || '0').toFixed(2)} USDC`, color: 'pink' },
                    { label: 'Funded', value: `${Number(loans[0].totalFunded || '0').toFixed(2)} USDC`, color: 'blue' },
                    { label: 'My IOUs', value: `${Number(loans[0].userIOUBalance || '0').toFixed(4)} ${loans[0].iouSymbol}`, color: 'purple' },
                    { label: `My ${loans[0].underlyingSymbol || 'USDC'}`, value: `${Number(loans[0].underlyingBalance || '0').toFixed(2)} ${loans[0].underlyingSymbol || 'USDC'}`, color: 'green' }
                  ].map((item, idx) => (
                    <div key={idx} className={getThemeClass(
                      `bg-${item.color}-500 rounded-xl p-4 text-center border border-${item.color}-200`,
                      `bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl p-4 text-center border border-gray-500`
                    )}><div className="bg-purple-500 text-purple-300 border-purple-200`
">
                      </div>
                      <h3 className={getThemeClass(
                        `text-white/50 font-bold text-lg`,
                        `text-${item.color}-300 font-bold text-lg`
                      )}>
                        {item.label}
                      </h3>
                      <p className={getThemeClass(
                        `text-white font-black text-xl`,
                        `font-black text-xl`
                      )}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {Number(loans[0].interestClaimable || '0') > 0 && (
                  <div className={getThemeClass(
                    'bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 text-center border border-green-200',
                    'bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl p-4 text-center border border-green-600/30'
                  )}>
                    <h3 className={getThemeClass('text-green-700 font-bold text-lg', 'text-green-300 font-bold text-lg')}>
                      💰 Interest Available
                    </h3>
                    <p className={getThemeClass('text-green-800 font-black text-xl', 'text-green-200 font-black text-xl')}>
                      {Number(loans[0].interestClaimable || '0').toFixed(4)} {loans[0].underlyingSymbol || 'USDC'}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Enter amount..."
                    className={getThemeClass(
                      'w-full px-4 py-3 bg-pink-100 rounded-xl text-center font-semibold focus:border-pink-400 focus:outline-none transition-colors',
                      'w-full px-4 py-3 bg-gray-700 rounded-xl border-2 border-gray-600 text-center font-semibold text-white focus:border-purple-500 focus:outline-none transition-colors'
                    )}
                    value={fundInput}
                    onChange={(e) => setFundInput(e.target.value)}
                    title="Amount for Fund/Redeem/Unfund calls."
                  />
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: 'Fund', onClick: () => fundLoan(loans[0].index, loans[0].loanAddress, fundInput), color: 'from-pink-400 to-rose-400', icon: '💰' },
                      { label: 'Redeem', onClick: () => redeemIOUs(loans[0].loanAddress, fundInput), color: 'from-blue-400 to-blue-500', icon: '🔄' },
                      { label: 'Claim', onClick: () => claimInterest(loans[0].loanAddress), color: 'from-green-400 to-emerald-500', icon: '💎' },
                      { label: 'Unfund', onClick: () => unfundLoan(loans[0].loanAddress, fundInput), color: 'from-red-400 to-red-500', icon: '❌' }
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={btn.onClick}
                        className={`bg-gradient-to-r ${btn.color} text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm`}
                        title={`${btn.label} action for the current loan.`}
                      >
                        <span className="block text-lg mb-1">{btn.icon}</span>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {loans.length === 0 ? (
          <div className={getThemeClass(
            'bg-white/90 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-pink-200/50 text-center',
            'bg-gray-800/90 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-purple-500/30 text-center'
          )}>
            <div className="text-6xl mb-4">🌱</div>
            <p className={getThemeClass('text-pink-500 text-xl font-semibold', 'text-purple-400 text-xl font-semibold')}>
              No loans found or none discovered so far.
            </p>
          </div>
        ) : !showSimple && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loans.map((ln) => (
              <div
                key={ln.index}
                className={getThemeClass(
                  'bg-white/90 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-pink-200/50 relative overflow-hidden',
                  'bg-gray-800/90 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-purple-500/30 relative overflow-hidden'
                )}
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  {ln.fullyRepaid ? (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg">
                      ✅ Fully Repaid
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-lg">
                      ⏳ Active
                    </span>
                  )}
                </div>

                {/* Loan number badge */}
                <div className="absolute top-4 left-4">
                  <span className={getThemeClass(
                    'inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-pink-400 to-rose-400 text-white font-black text-xl rounded-full shadow-lg',
                    'inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-black text-xl rounded-full shadow-lg'
                  )}>
                    {ln.index}
                  </span>
                </div>

                <div className="mt-16 mb-6 text-center">
                  <div className="flex justify-center gap-2 mb-4 flex-wrap">
                    <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-3 py-1 font-semibold text-sm shadow-lg">
                      {ln.iouName}
                    </span>
                    <span className="bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-full px-3 py-1 font-semibold text-sm shadow-lg">
                      {ln.iouSymbol}
                    </span>
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full px-3 py-1 font-semibold text-sm shadow-lg">
                      {ln.interestRate}% APR
                    </span>
                  </div>

                  <div className="mb-4">
                    <h3 className={getThemeClass('text-pink-500 font-bold text-lg mb-2', 'text-purple-400 font-bold text-lg mb-2')}>
                      Loan Goal
                    </h3>
                    <p className={getThemeClass(
                      'text-2xl font-black text-white bg-gradient-to-r from-pink-400 to-rose-400 rounded-xl px-4 py-2 shadow-lg',
                      'text-2xl font-black text-white bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl px-4 py-2 shadow-lg'
                    )}>
                      {ln.loanGoal} USDC
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                  {[
                    { label: 'IOU Rate', value: `${ln.iouConversionRate} per ${GGSymbol || 'GG'}`, color: 'pink' },
                    { label: 'Loan ETH', value: `${Number(ln.totalBuyETH).toFixed(4)} ETH`, color: 'blue' },
                    { label: 'Funded', value: `${Number(ln.totalFunded || '0').toFixed(2)} USDC`, color: 'green' },
                    { label: 'Drawn', value: `${Number(ln.totalDrawnDown).toFixed(2)} USDC`, color: 'orange' },
                    { label: 'My IOUs', value: `${ln.userIOUBalance} ${ln.iouSymbol}`, color: 'purple' },
                    { label: 'Repaid', value: `${Number(ln.repayments || '0').toFixed(2)} ${ln.underlyingSymbol}`, color: 'red' },
                    { label: 'Interest Claimable', value: `${ln.claimableInterest} ${ln.underlyingSymbol}`, color: 'emerald' },
                    { label: 'Balance', value: `${Number(ln.underlyingBalance || '0').toFixed(2)} ${ln.underlyingSymbol}`, color: 'indigo' }
                  ].map((item, idx) => (
                    <div key={idx} className={getThemeClass(
                      'bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 shadow-sm',
                      'bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg p-3 border border-gray-600 shadow-sm'
                    )}>
                      <h4 className={getThemeClass('text-gray-600 font-semibold text-xs mb-1', 'text-gray-300 font-semibold text-xs mb-1')}>
                        {item.label}
                      </h4>
                      <p className={getThemeClass('text-gray-800 font-bold text-sm', 'text-white font-bold text-sm')}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Quick action button */}
                {!ln.fullyRepaid && (
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => handleQuickRepay(ln.index)}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                      title="Repay 1% of the total owed USDC by selling the required ETH."
                    >
                      💵 Quick Repay
                    </button>
                  </div>
                )}

                {/* Action inputs and buttons */}
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Enter amount..."
                    className={getThemeClass(
                      'w-full px-4 py-3 bg-gray-50 rounded-xl border-2 border-gray-200 text-center font-semibold focus:border-pink-400 focus:outline-none transition-colors',
                      'w-full px-4 py-3 bg-gray-700 rounded-xl border-2 border-gray-600 text-center font-semibold text-white focus:border-purple-500 focus:outline-none transition-colors'
                    )}
                    value={fundInput}
                    onChange={(e) => setFundInput(e.target.value)}
                    title="Amount for Fund/Redeem/Unfund calls."
                  />
                  
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Fund', onClick: () => fundLoan(ln.index, ln.loanAddress, fundInput), color: 'from-pink-400 to-rose-400' },
                      { label: 'Redeem', onClick: () => redeemIOUs(ln.loanAddress, fundInput), color: 'from-blue-400 to-blue-500' },
                      { label: 'Claim', onClick: () => claimInterest(ln.loanAddress), color: 'from-green-400 to-emerald-500' },
                      { label: 'Unfund', onClick: () => unfundLoan(ln.loanAddress, fundInput), color: 'from-red-400 to-red-500' }
                    ].map((btn, idx) => (
                      <button
                        key={idx}
                        onClick={btn.onClick}
                        className={`bg-gradient-to-r ${btn.color} text-white font-semibold py-2 px-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 text-sm`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

        
              {canOpenLoan ? (
                <button
                  onClick={handleOpenLoan}
                  className={getThemeClass(
                    'text-3xl font-semibold text-white bg-pink-400 rounded-3xl px-6 py-3 shadow-lg hover:bg-pink-500 transition-all duration-300',
                    'text-3xl font-semibold text-white bg-purple-600 rounded-3xl px-6 py-3 shadow-lg hover:bg-purple-700 transition-all duration-300'
                  )}
                  title="Create a new loan contract once all existing ones are fully funded."
                >
                  🌱 Open Next Loan
                </button>
              ) : (
                <div 
                  className={getThemeClass(
                    'text-3xl font-semibold text-white bg-gray-300 rounded-3xl px-6 py-3 shadow-lg text-center flex items-center justify-center',
                    'text-3xl font-semibold text-white bg-gray-700 rounded-3xl px-6 py-3 shadow-lg text-center flex items-center justify-center'
                  )}
                  title="You must ensure all existing loans are fully funded before creating a new one."
                >
                  Fill all loans to create more.
                </div>
              )}
          </div>)}
          </div>

      {/* Manager summary & advanced calls if user is the special address */}
      {userAddress?.toLowerCase() === '0x00000000000000C0D7D3017B342ff039B55b0879'.toLowerCase() && (
        <>
          <div
            className={getThemeClass(
              'max-w-6xl mx-auto mb-6 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200',
              'max-w-6xl mx-auto mb-6 bg-gray-800 rounded-xl p-4 shadow-md '
            )}
          >
            <h2 className={getThemeClass('text-lg font-semibold text-pink-500', 'text-lg font-semibold text-purple-400')}>
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

              <hr
                className={getThemeClass(
                  'border-rose-200 my-2',
                  'border-purple-700 my-2'
                )}
              />
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
            <div
              className={getThemeClass(
                'bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200',
                'bg-gray-800 rounded-xl p-4 shadow-md '
              )}
            >
              <h3 className="text-lg font-semibold text-pink-500 mb-3">💖 Start a New Loan</h3>
              <div className="space-y-2 text-sm">
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-rose-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Loan Goal (USDC, 6 decimals)"
                  value={startLoanGoal}
                  onChange={(e) => setStartLoanGoal(e.target.value)}
                  title="The total principal goal for the new loan (in USDC)."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-rose-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Underlying token address"
                  value={startLoanToken}
                  onChange={(e) => setStartLoanToken(e.target.value)}
                  title="Address of the ERC20 token to be borrowed (e.g., USDC)."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-rose-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Annual Interest Rate (bps)"
                  value={annualInterest}
                  onChange={(e) => setAnnualInterest(e.target.value)}
                  title="Annual interest rate in basis points, e.g., 100 = 1% APR."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-rose-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Platform Fee Rate (bps)"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  title="Platform fee in basis points (bps)."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-rose-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Fee Address"
                  value={feeAddress}
                  onChange={(e) => setFeeAddress(e.target.value)}
                  title="Where platform fees should be sent."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-rose-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="IOU→GG rate (e.g. 1.0 => 1e18)"
                  value={loanIOUConversionRate}
                  onChange={(e) => setLoanIOUConversionRate(e.target.value)}
                  title="How many IOUs per 1 GG token (in 1e18 scale)."
                />
                <button
                  onClick={handleStartLoan}
                  className={getThemeClass(
                    'w-full py-2 bg-pink-200 rounded-full font-medium hover:bg-pink-300 text-pink-800 transition-colors',
                    'w-full py-2 bg-purple-700 rounded-full font-medium hover:bg-purple-600 text-white transition-colors'
                  )}
                  title="Deploy a new Spot IOU Loan via the IOUMint factory."
                >
                  startLoan
                </button>
              </div>
            </div>

            {/* buyETH */}
            <div
              className={getThemeClass(
                'bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200',
                'bg-gray-800 rounded-xl p-4 shadow-md '
              )}
            >
              <h3 className="text-lg font-semibold text-yellow-600 mb-3">🌻 Buy ETH</h3>
              <div className="space-y-2 text-sm">
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-yellow-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Loan Index"
                  value={buyLoanIndex}
                  onChange={(e) => setBuyLoanIndex(e.target.value)}
                  title="Which loan (by index) to buy ETH for."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-yellow-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="USDC Amount"
                  value={buyUsdcAmount}
                  onChange={(e) => setBuyUsdcAmount(e.target.value)}
                  title="How many USDC to sell for ETH."
                />
                <button
                  onClick={handleBuyETH}
                  className={getThemeClass(
                    'w-full py-2 bg-yellow-200 rounded-full font-medium hover:bg-yellow-300 text-yellow-800 transition-colors',
                    'w-full py-2 bg-purple-700 rounded-full font-medium hover:bg-purple-600 text-white transition-colors'
                  )}
                  title="Swaps USDC for ETH on Uniswap (manager-level function)."
                >
                  buyETH
                </button>
              </div>
            </div>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 mt-6">
            {/* redeemHeldIOUsAndSwapToETH */}
            <div
              className={getThemeClass(
                'bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200',
                'bg-gray-800 rounded-xl p-4 shadow-md '
              )}
            >
              <h3 className="text-lg font-semibold text-orange-600 mb-3">🪄 Redeem IOUs & Swap</h3>
              <div className="space-y-2 text-sm">
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-orange-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Loan Index"
                  value={redeemLoanIndex}
                  onChange={(e) => setRedeemLoanIndex(e.target.value)}
                  title="The index of the loan from which you want to redeem IOUs & swap to ETH."
                />
                <button
                  onClick={() => handleRedeemIOUs(parseInt(redeemLoanIndex || '0', 10))}
                  className={getThemeClass(
                    'w-full py-2 bg-orange-200 rounded-full font-medium hover:bg-orange-300 text-orange-800 transition-colors',
                    'w-full py-2 bg-purple-700 rounded-full font-medium hover:bg-purple-600 text-white transition-colors'
                  )}
                  title="Redeems any IOUs this manager contract is still holding, then swaps USDC→ETH."
                >
                  redeemHeldIOUsAndSwapToETH
                </button>
              </div>
            </div>

            {/* drawDownLoan */}
            <div
              className={getThemeClass(
                'bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200',
                'bg-gray-800 rounded-xl p-4 shadow-md '
              )}
            >
              <h3 className="text-lg font-semibold text-purple-600 mb-3">🚰 Draw Down Loan</h3>
              <div className="space-y-2 text-sm">
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-purple-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Loan index"
                  value={drawLoanIndex}
                  onChange={(e) => setDrawLoanIndex(e.target.value)}
                  title="Which loan index to draw from."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-purple-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Amount in USDC"
                  value={drawAmount}
                  onChange={(e) => setDrawAmount(e.target.value)}
                  title="How many USDC to draw for that loan."
                />
                <button
                  onClick={handleDrawDownLoan}
                  className={getThemeClass(
                    'w-full py-2 bg-purple-200 rounded-full font-medium hover:bg-purple-300 text-purple-800 transition-colors',
                    'w-full py-2 bg-purple-700 rounded-full font-medium hover:bg-purple-600 text-white transition-colors'
                  )}
                  title="Borrower function: draws these USDC from the funded portion."
                >
                  drawDownLoan
                </button>
              </div>
            </div>

            {/* repayLoan (aggregator) */}
            <div
              className={getThemeClass(
                'bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200',
                'bg-gray-800 rounded-xl p-4 shadow-md '
              )}
            >
              <h3 className="text-lg font-semibold text-red-600 mb-3">💵 Repay Loan (Aggregator)</h3>
              <div className="space-y-2 text-sm">
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-red-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Loan index"
                  value={repayLoanIndex}
                  onChange={(e) => setRepayLoanIndex(e.target.value)}
                  title="Index of the loan to repay using the aggregator function."
                />
                <button
                  onClick={handleRepayLoan}
                  className={getThemeClass(
                    'w-full py-2 bg-red-200 rounded-full font-medium hover:bg-red-300 text-red-800 transition-colors',
                    'w-full py-2 bg-purple-700 rounded-full font-medium hover:bg-purple-600 text-white transition-colors'
                  )}
                  title="Calls repayLoan(loanIndex) which repays 1% of the total owed USDC."
                >
                  repayLoan
                </button>
              </div>
            </div>

            {/* repayLoanUSDC (manual) */}
            <div
              className={getThemeClass(
                'bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200',
                'bg-gray-800 rounded-xl p-4 shadow-md '
              )}
            >
              <h3 className="text-lg font-semibold text-red-600 mb-3">💵 Repay Loan (USDC)</h3>
              <div className="space-y-2 text-sm">
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-red-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Loan index"
                  value={repayLoanIndexUSDC}
                  onChange={(e) => setRepayLoanIndexUSDC(e.target.value)}
                  title="Which loan index to repay."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-red-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="USDC amount"
                  value={repayUsdcAmount}
                  onChange={(e) => setRepayUsdcAmount(e.target.value)}
                  title="How many USDC to repay for that loan."
                />
                <button
                  onClick={handleRepayLoanUSDC}
                  className={getThemeClass(
                    'w-full py-2 bg-red-200 rounded-full font-medium hover:bg-red-300 text-red-800 transition-colors',
                    'w-full py-2 bg-purple-700 rounded-full font-medium hover:bg-purple-600 text-white transition-colors'
                  )}
                  title="Manually repay the loan with a specific USDC amount."
                >
                  repayLoanUSDC
                </button>
              </div>
            </div>

            {/* setIOUConversionRate (if needed) */}
            <div
              className={getThemeClass(
                'bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-md ring-1 ring-rose-200',
                'bg-gray-800 rounded-xl p-4 shadow-md '
              )}
            >
              <h3 className="text-lg font-semibold text-blue-600 mb-3">⚙️ Update IOU Rate</h3>
              <div className="space-y-2 text-sm">
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-blue-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="Loan index"
                  value={setIndex}
                  onChange={(e) => setSetIndex(e.target.value)}
                  title="Which loan index to modify the rate for."
                />
                <input
                  className={getThemeClass(
                    'w-full px-3 py-2 bg-white rounded-full border border-blue-100',
                    'w-full px-3 py-2 bg-gray-700 rounded-full border border-purple-700 text-white'
                  )}
                  placeholder="New rate in 1e18"
                  value={newRate}
                  onChange={(e) => setNewRate(e.target.value)}
                  title="Enter the new IOU→GG conversion rate in 1e18 scale."
                />
                <button
                  onClick={handleSetIOURate}
                  className={getThemeClass(
                    'w-full py-2 bg-blue-200 rounded-full font-medium hover:bg-blue-300 text-blue-800 transition-colors',
                    'w-full py-2 bg-purple-700 rounded-full font-medium hover:bg-purple-600 text-white transition-colors'
                  )}
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
