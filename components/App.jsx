import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useEthersProvider, useEthersSigner } from './tl';
import { Alchemy, Network } from 'alchemy-sdk';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  LinearProgress,
  IconButton,
  Chip,
  Stack,
  Divider,
  Avatar,
  Paper,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  AccountBalanceWallet as WalletIcon,
  ArrowUpward as UploadIcon,
  ArrowDownward as DownloadIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  Share as ShareIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { GlassCard } from './v2/GlassCard';
import { gradients } from '../theme/v2Theme';

const defaultVaultAddress = '0x4CcfC47F4631B6e9a24A0BD18391E9De29B75381';

const vaultAbi = [
  "event TokenDeposited(address indexed token, uint256 amount, address indexed depositor)",
  "event TokenWithdrawn(address indexed token, uint256 amount)",
  "event NftDeposited(address indexed token, uint256 indexed tokenId, address indexed depositor)",
  "event NftWithdrawn(address indexed token, uint256 indexed tokenId)",
  "function depositAsset(address token, uint256 amountorID, uint256 ERC20orERC721) external payable",
  "function withdrawToken(address to, address token, uint256 amount) external",
  "function getLimit(address to, address token, uint256 amount) external view returns(uint)",
  "function getLimitAmount(address token) external view returns(uint)",
  "function updateRecoveryAddress(address newRecoveryAddress) external",
  "function updateWhitelistAddresses(address[] memory newWhitelistedAddresses) external",
  "function updateDailyLimit(uint256 newDailyLimit) external",
  "function updateThreshold(uint256 newThreshold) external",
  "function updateDelay(uint256 newDelay) external",
  "function queueTransaction(address to, bytes memory data, uint256 value) external",
  "function setTokenLimit(address token, uint256 fixedLimit, uint256 percentageLimit, uint256 useBaseLimit) external",
  "function recover(address token, address to, uint256 amount, bytes memory data) external",
  "function updateSettings(address newRecoveryAddress, address[] memory newWhitelistedAddresses, uint256 newDailyLimit, uint256 newThreshold, uint256 newDelay, address[] memory tokens, uint256[] memory fixedLimits, uint256[] memory percentageLimits, uint256[] memory useBaseLimits) external",
  "function confirmTransaction(uint256 id) external",
  "function cancelTransaction(uint256 id) external",
  "function owner() external view returns (address)",
  "function name() external view returns (string memory)",
  "function recoveryAddress() external view returns (address)",
  "function whitelistedAddresses(uint256) external view returns (address)",
  "function dailyLimit() external view returns (uint256)",
  "function threshold() external view returns (uint256)",
  "function delay() external view returns (uint256)",
  "function isWhitelisted(address) external view returns (bool)",
  "function dailyWithdrawnAmount(address) external view returns (uint256)",
  "function lastWithdrawTimestamp(address) external view returns (uint256)",
  "function tokenLimits(address) external view returns (uint256, uint256, uint256)",
  "function queuedTransactions(uint256) external view returns (address, bytes memory, uint256, bool, uint256, uint256)",
  "function queuedTxs() external view returns (uint)",
  "function getAssetDetails(uint256[] calldata indices) external view returns (address[] memory tokens, uint256[] memory amountsOrIDs, uint256[] memory wallet, uint256[] memory assetTypes, uint8[] memory decimals, string[] memory tokenNames, string[] memory tokenSymbols, string[] memory tokenURIs, uint256[] memory remainingLimits, uint256[] memory limitAmounts)"
];

const factoryAbi = [
  "constructor()",
  "event VaultCreated(address vaultAddress, address indexed owner, string name, address recoveryAddress)",
  "function createVault(string _name, address _recoveryAddress, address[] _whitelistedAddresses, uint256 _dailyLimit, uint256 _threshold, uint256 _delay, uint256 _mode) external returns (address)",
  "function getVaultsByOwner(address _owner) external view returns (address[])",
  "function vaultNames(string) external view returns (address)"
];

const bgColors = [
  gradients.primary,
  gradients.lavender,
  gradients.ocean,
  gradients.sunset,
  gradients.success,
  gradients.secondary
];

const tokenLogos = {
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf': 'https://basescan.org/token/images/cbbtc_32.png',
  '0x94373a4919b3240d86ea41593d5eba789fef3848': 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
  '0x4200000000000000000000000000000000000042': 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.png',
};

const App = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [tokenBalances, setTokenBalances] = useState([]);
  const [nftAssets, setNftAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [queuedTransactions, setQueuedTransactions] = useState([]);
  const [vaultSettings, setVaultSettings] = useState({});
  const [vaults, setVaults] = useState([]);
  const [selectedVault, setSelectedVault] = useState('');
  const [limitSection, setLimitSection] = useState('fixed');
  const [selectedToken, setSelectedToken] = useState('');
  const [isCreateInfoModalOpen, setIsCreateInfoModalOpen] = useState(false);
  const [isCustomTxModalOpen, setIsCustomTxModalOpen] = useState(false);
  const [customTx, setCustomTx] = useState({ to: '', value: '', fnSig: '', params: [] });
  const [todeposit, settodeposit] = useState([]);
  const [todepositnft, settodepositnft] = useState([]);
  const [showVaultOnly, setShowVaultOnly] = useState(true);
  const [tokenLimit, setTokenLimit] = useState({ fixedLimit: '', percentageLimit: '', useBaseLimit: '' });

  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const factoryAddress = '0x5684295a97e32af4a9574d90ef593f5b2d963ed0';

  const alchemyConfig = {
    apiKey: 'Z-ifXLmZ9T3-nfXiA0B8wp5ZUPXTkWlg',
    network: chainId == 8453 ? Network.BASE_MAINNET : chainId == 1 ? Network.ETH_MAINNET : chainId == 137 ? Network.MATIC_MAINNET : chainId == 534352 ? Network.SCROLL_MAINNET : chainId == 42161 ? Network.ARB_MAINNET : chainId == 57073 ? Network.INK : Network.OPT_MAINNET,
  };
  const alchemy = new Alchemy(alchemyConfig);
  const [net, setNet] = useState(null);

  useEthersProvider().addListener('network', (newNetwork, oldNetwork) => {
    if (net != null) {
      window.location.reload();
    }
    setNet(newNetwork);
  });

  const fetchVaults = async () => {
    try {
      const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
      const userVaults = await factory.getVaultsByOwner(userAddress);
      userVaults.length == 0 && toast('Create a vault to get started', { style: { backgroundColor: '#00aaff', color: '#fff', fontWeight: 'bold' } });
      const allVaults = userVaults.length > 0 ? userVaults : [chainId == 1 ? '0x5bC3bB0d396072f0a86ACb4F3790505A54a25579' : defaultVaultAddress];
      setVaults(allVaults);
      if (!selectedVault) {
        if (userVaults.length == 0) {
          setIsCreateInfoModalOpen(true);
        } else {
          setSelectedVault(allVaults[0]);
        }
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch user vaults.');
    }
  };

  const fetchTokenBalances = async (vault) => {
    const chainIds = [8453, 1, 137, 534352, 42161, 10, 56, 43114, 250, 57073];
    if (chainIds.includes(chainId)) {
      fetchTokenBalances2(vault);
      return;
    }
    setLoading(true);
    try {
      const contract = new ethers.Contract(vault, vaultAbi, provider);
      const [tokens, amountsOrIDs, walletBalances, assetTypes, decimals, tokenNames, tokenSymbols, tokenURIs, remainingLimits, limitAmounts] = await contract.connect(signer).getAssetDetails([]);
      const tokenDetails = [];
      const nftDetails = [];

      for (let i = 0; i < tokens.length; i++) {
        const asset = {
          address: tokens[i],
          type: Number(assetTypes[i]),
          decimals: Number(decimals[i]),
          name: tokenNames[i],
          symbol: tokenSymbols[i],
          dailyLimit: Number(limitAmounts[i]) / Math.pow(10, Number(decimals[i])),
          limit: Number(remainingLimits[i]) / Math.pow(10, Number(decimals[i])),
          wallet: Number(walletBalances[i]) / Math.pow(10, Number(decimals[i]))
        };

        if (asset.type === 0) {
          const adjustedBalance = Number(amountsOrIDs[i]) / Math.pow(10, asset.decimals);
          asset.balance = adjustedBalance;
          tokenDetails.push(asset);
        } else if (asset.type === 1) {
          asset.tokenId = amountsOrIDs[i];
          asset.imageUrl = tokenURIs[i] ? await fetchNftImage(tokenURIs[i]) : './favicon.ico';
          if (amountsOrIDs[i] > 0) {
            nftDetails.push(asset);
          }
        }
      }

      const ethBalance = await provider.getBalance(vault);
      const ethLimit = await contract.getLimit(userAddress, ethers.ZeroAddress, 0);
      const ethDailyLimit = await contract.getLimitAmount(ethers.ZeroAddress);

      tokenDetails.unshift({
        name: 'Ether',
        symbol: 'ETH',
        balance: ethers.formatEther(ethBalance),
        address: ethers.ZeroAddress,
        dailyLimit: Number(ethDailyLimit) / Math.pow(10, 18),
        limit: Number(ethLimit) / Math.pow(10, 18),
        wallet: ethers.formatEther(await provider.getBalance(userAddress))
      });

      const name = await contract.name();
      const recoveryAddress = await contract.recoveryAddress();
      const dailyLimit = await contract.dailyLimit();
      const threshold = await contract.threshold();
      const delay = await contract.delay();
      const owner = await contract.owner();

      setTokenBalances(tokenDetails);
      setNftAssets(nftDetails);
      setVaultSettings({ name, recoveryAddress, dailyLimit: Number(dailyLimit), threshold: Number(threshold), delay: Number(delay), owner });

    } catch (error) {
      console.error("Failed to fetch token balances:", error);
      toast.error('Failed to fetch token balances.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNftImage = async (uri) => {
    try {
      if (uri.startsWith("ipfs://")) {
        uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      const response = await fetch(uri);
      if (!response.ok) throw new Error("Failed to fetch NFT metadata");
      const metadata = await response.json();
      let imageUri = metadata.image || './favicon.ico';
      if (imageUri.startsWith("ipfs://")) {
        imageUri = imageUri.replace("ipfs://", "https://ipfs.io/ipfs/");
      }
      return imageUri;
    } catch (error) {
      console.error("Error fetching NFT image:", error);
      return './favicon.ico';
    }
  };

  const fetchTokenBalances2 = async (vault) => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(vault, vaultAbi, provider);
      const balances = await alchemy.core.getTokenBalances(vault);
      let symbols = [];
      await Promise.all(balances.tokenBalances.map(async (token) => {
        let metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        if (metadata.symbol.length > 7) {
          symbols.push(token.contractAddress);
        }
      }));

      const nonZeroBalances = balances.tokenBalances.filter(token => token.tokenBalance !== "0").filter(token => !symbols.includes(token.contractAddress));
      const multicallContract = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', ['function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'], provider);

      const calls = nonZeroBalances.map(token => ({
        target: token.contractAddress,
        callData: new ethers.Interface(["function decimals() view returns (uint8)"]).encodeFunctionData('decimals')
      })).concat([
        { target: vault, callData: contract.interface.encodeFunctionData('name') },
        { target: vault, callData: contract.interface.encodeFunctionData('recoveryAddress') },
        { target: vault, callData: contract.interface.encodeFunctionData('dailyLimit') },
        { target: vault, callData: contract.interface.encodeFunctionData('threshold') },
        { target: vault, callData: contract.interface.encodeFunctionData('delay') },
        { target: vault, callData: contract.interface.encodeFunctionData('owner') },
      ]);

      const { returnData } = await multicallContract.aggregate(calls);

      const name = contract.interface.decodeFunctionResult('name', returnData[nonZeroBalances.length])[0];
      const recoveryAddress = contract.interface.decodeFunctionResult('recoveryAddress', returnData[nonZeroBalances.length + 1])[0];
      const dailyLimit = Number(contract.interface.decodeFunctionResult('dailyLimit', returnData[nonZeroBalances.length + 2])[0]);
      const threshold = Number(contract.interface.decodeFunctionResult('threshold', returnData[nonZeroBalances.length + 3])[0]);
      const delay = Number(contract.interface.decodeFunctionResult('delay', returnData[nonZeroBalances.length + 4])[0]);
      const owner = contract.interface.decodeFunctionResult('owner', returnData[nonZeroBalances.length + 5])[0];

      const tokenDetails = await Promise.all(nonZeroBalances.map(async (token, index) => {
        let metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        const balance = token.tokenBalance;
        let mybals = await alchemy.core.getTokenBalances(userAddress);
        try {
          const decimals = Number(returnData[index] ? Number(returnData[index]) : 18);
          const adjustedBalance = balance / Math.pow(10, decimals);
          const tokenLimit = await contract.getLimit(userAddress, token.contractAddress, 0);
          const lim = await contract.getLimitAmount(token.contractAddress);
          return {
            ...token,
            ...metadata,
            balance: adjustedBalance,
            address: token.contractAddress,
            dailyLimit: Number(lim) / Math.pow(10, decimals),
            limit: Number(tokenLimit) / Math.pow(10, decimals),
            wallet: mybals.tokenBalances.find(bal => bal.contractAddress == token.contractAddress)
              ? Number(mybals.tokenBalances.find(bal => bal.contractAddress == token.contractAddress).tokenBalance) / Math.pow(10, decimals)
              : 0
          };
        } catch (error) { }
      }));

      const ethBalance = await provider.getBalance(vault);
      const adjustedEthBalance = ethers.formatEther(ethBalance);
      const ethLimit = await contract.getLimit(userAddress, '0x0000000000000000000000000000000000000000', 0);
      const lim = await contract.getLimitAmount('0x0000000000000000000000000000000000000000');

      tokenDetails.unshift({
        name: 'Ether',
        symbol: 'ETH',
        balance: adjustedEthBalance,
        address: '0x0000000000000000000000000000000000000000',
        dailyLimit: Number(lim) / Math.pow(10, 18),
        limit: (Number(ethLimit) / Math.pow(10, 18)),
        wallet: ethers.formatEther(await provider.getBalance(userAddress))
      });

      let tokenDetail = tokenDetails.filter(token => token).filter(token => token.symbol.length < 10);
      setTokenBalances(tokenDetail);

      let whitelistedAddresses = [];
      let i = 0;
      while (true) {
        try {
          const address = await contract.whitelistedAddresses(i);
          whitelistedAddresses.push(address);
          i++;
          if (address === '0x0000000000000000000000000000000000000000') {
            break;
          }
        } catch (error) {
          break;
        }
      }

      setVaultSettings({ name, recoveryAddress, dailyLimit, threshold, delay, whitelistedAddresses, owner });
      await fetchNftAssets(vault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch token balances.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNftAssets = async (vault) => {
    try {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(vault);
      const nftDetails = nftsForOwner.ownedNfts.map(nft => ({
        ...nft,
        imageUrl: nft.image.cachedUrl || './favicon.ico',
        address: nft.contract.address
      }));
      setNftAssets(nftDetails);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch NFT assets.');
    }
  };

  async function fetchDeps() {
    let mybals = await alchemy.core.getTokenBalances(userAddress);
    const Bals = mybals.tokenBalances.filter(token => token.tokenBalance !== "0");
    const tokenDets = await Promise.all(Bals.map(async (token) => {
      let metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
      const balance = token.tokenBalance;
      const decimals = metadata.decimals ? Number(metadata.decimals) : 18;
      const adjustedBalance = balance / Math.pow(10, decimals);
      return {
        ...token,
        ...metadata,
        balance: adjustedBalance,
        address: token.contractAddress
      };
    }));
    const balances = await alchemy.core.getTokenBalances(selectedVault);
    settodeposit(tokenDets.filter(token => token.symbol ? token.symbol.length < 10 : token.symbol).filter(token => token.balance !== 0).filter(token => !balances.tokenBalances.find(t => t.contractAddress === token.contractAddress)).sort((a, b) => b.balance - a.balance));

    try {
      const nftsForOwner = await alchemy.nft.getNftsForOwner(userAddress);
      const nftDetails = nftsForOwner.ownedNfts.map(nft => ({
        ...nft,
        imageUrl: nft.image.cachedUrl || './favicon.ico'
      }));
      settodepositnft(nftDetails);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch NFT assets.');
    }
  }

  const fetchQueuedTransactions = async (vault) => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(vault, vaultAbi, provider);
      const totalTxs = Number(await contract.queuedTxs());
      const startTx = totalTxs > 100 ? totalTxs - 100 : 0;
      const endTx = totalTxs;

      const multicallContract = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', ['function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'], provider);

      const calls = [];
      for (let i = startTx; i < endTx; i++) {
        calls.push({
          target: vault,
          callData: contract.interface.encodeFunctionData('queuedTransactions', [i])
        });
      }

      const { returnData } = await multicallContract.aggregate(calls);
      const threshold = Number(await contract.threshold());

      let queuedTransactions = [];
      for (let i = 0; i < returnData.length; i++) {
        let [to, data, timestamp, executed, numConfirmations, amount] = contract.interface.decodeFunctionResult('queuedTransactions', returnData[i]);
        let token = '';
        if (data.startsWith('0xa9059cbb')) {
          const abi = new ethers.Interface(['function transfer(address to, uint256 amount)']);
          const decodedData = abi.decodeFunctionData('transfer', data);
          const amt = decodedData.amount;
          token = to;
          to = decodedData.to;
          amount = amt;
        }
        const tx = {
          id: startTx + i,
          to,
          data,
          timestamp: Number(timestamp),
          executed,
          numConfirmations: Number(numConfirmations),
          threshold: threshold,
          amount: ethers.formatUnits(amount, 'ether') < 0.000000001 ? ethers.formatUnits(amount, 6) : ethers.formatUnits(amount, 'ether'),
          token
        };
        queuedTransactions.push(tx);
      }

      setQueuedTransactions(queuedTransactions.reverse());
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch queued transactions.');
    } finally {
      setLoading(false);
    }
  };

  function convert(n) {
    var sign = +n < 0 ? "-" : "",
      toStr = n.toString();
    if (!/e/i.test(toStr)) {
      return n;
    }
    var [lead, decimal, pow] = n.toString()
      .replace(/^-/, "")
      .replace(/^([0-9]+)(e.*)/, "$1.$2")
      .split(/e|\./);
    return +pow < 0 ?
      sign + "0." + "0".repeat(Math.max(Math.abs(pow) - 1 || 0, 0)) + lead + decimal :
      sign + lead + (+pow >= decimal.length ? (decimal + "0".repeat(Math.max(+pow - decimal.length || 0, 0))) : (decimal.slice(0, +pow) + "." + decimal.slice(+pow)))
  }

  const handleConfirmTransaction = async (txIndex) => {
    try {
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      const tx = await contract.confirmTransaction(txIndex);
      await tx.wait();
      toast.success('Transaction confirmed successfully!');
      fetchQueuedTransactions(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to confirm transaction.');
    }
  };

  const handleCancelTransaction = async (txIndex) => {
    try {
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      const tx = await contract.cancelTransaction(txIndex);
      await tx.wait();
      toast.success('Transaction canceled successfully!');
      fetchQueuedTransactions(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to cancel transaction.');
    }
  };

  useEffect(() => {
    if (userAddress) {
      fetchVaults();
    } else {
      setIsCreateInfoModalOpen(true);
      toast('Connect your wallet to get started', { style: { backgroundColor: '#00aaff', color: '#fff', fontWeight: 'bold' } });
    }
  }, [userAddress]);

  useEffect(() => {
    if (selectedVault) {
      fetchTokenBalances(selectedVault);
      fetchQueuedTransactions(selectedVault);
    }
  }, [selectedVault]);

  const handleDepositToken = async (tokenAddress, amountOrID, assetType) => {
    assetType = assetType ? assetType : 0;
    try {
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);

      if (tokenAddress === ethers.ZeroAddress) {
        const tx = await contract.depositAsset(tokenAddress, ethers.parseEther(amountOrID.toString()), 0, { value: ethers.parseEther(amountOrID.toString()) });
        await tx.wait();
      } else if (assetType === 0) {
        const tokenContract = new ethers.Contract(tokenAddress, ["function approve(address spender, uint256 amount)", "function decimals() view returns (uint8)"], signer);
        const approvalTx = await tokenContract.approve(selectedVault, ethers.parseUnits(amountOrID.toString(), await tokenContract.decimals()));
        await approvalTx.wait();
        const tx = await contract.depositAsset(tokenAddress, ethers.parseUnits(amountOrID.toString(), await tokenContract.decimals()), 0);
        await tx.wait();
      } else if (assetType === 1) {
        const tokenContract = new ethers.Contract(tokenAddress, ["function approve(address spender, uint256 tokenId)", "function decimals() view returns (uint8)"], signer);
        let tx = await tokenContract.approve(selectedVault, amountOrID);
        await tx.wait();
        tx = await contract.depositAsset(tokenAddress, amountOrID, 1);
        await tx.wait();
      }

      toast.success('Asset deposited successfully!');
      fetchTokenBalances(selectedVault);

    } catch (error) {
      console.error("Deposit failed:", error);
      toast.error('Failed to deposit asset.');
    }
  };

  const handleSearch = async (vaultName) => {
    try {
      const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
      const vaultAddress = await factory.vaultNames(vaultName);
      if (vaultAddress === '0x0000000000000000000000000000000000000000') {
        toast.error('Vault not found.');
      } else {
        setSelectedVault(vaultAddress);
        fetchTokenBalances(vaultAddress);
        fetchQueuedTransactions(vaultAddress);
        toast.success('Vault found successfully!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to search for vault.');
    }
  };

  const createVault = async (name, recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay) => {
    try {
      const contract = new ethers.Contract(factoryAddress, factoryAbi, signer);
      delay == 0 ? delay = 2 * 52 : delay;
      if (!whitelistedAddresses || name === '' || recoveryAddress === '' || dailyLimit === '' || threshold === '' || delay === '') {
        toast.error('Please fill all fields.');
        return;
      }
      try {
        let vault = await contract.vaultNames(name);
        if (vault !== '0x0000000000000000000000000000000000000000') {
          toast.error('Vault name already exists.');
          return;
        }
      } catch (error) { }
      if (whitelistedAddresses.length < threshold) {
        toast.error('Threshold must be less than or equal to the number of whitelisted addresses.');
        return;
      }
      let iface = new ethers.Interface(factoryAbi);
      const queryParams = new URLSearchParams(window.location.search);
      let ref = queryParams.get('ref');
      let data = iface.encodeFunctionData("createVault", [name, recoveryAddress, whitelistedAddresses, dailyLimit, threshold, (delay * 84000).toFixed(0), 0]);
      const tx = await signer.sendTransaction({
        to: factoryAddress,
        data: data + ethers.hexlify(ethers.toUtf8Bytes('gstagref=' + ref)).toString().slice(2),
      });
      await tx.wait();

      if (typeof window !== 'undefined') {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', 'G-L8YDH0NR8C');
        const queryParams = new URLSearchParams(window.location.search);
        let ref = queryParams.get('ref');
        gtag('event', 'createVault', {
          event_category: 'Vault',
          event_label: 'Create Vault',
          ref: ref ? ref.toString() : '0x',
          user: userAddress,
          vault: name
        });
      }
      window.location.reload();
      toast.success('Vault created successfully!');
      await fetchVaults();
      await fetchTokenBalances(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create vault.');
    }
  };

  const updateSettings = async (recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay, tokens, fixedLimits, percentageLimits, useBaseLimits) => {
    try {
      let abi = new ethers.Interface(vaultAbi);
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      !whitelistedAddresses ? whitelistedAddresses = [] : whitelistedAddresses;
      !tokens ? tokens = [] : tokens;
      !fixedLimits ? fixedLimits = [] : fixedLimits;
      !percentageLimits ? percentageLimits = [] : percentageLimits;
      !useBaseLimits ? useBaseLimits = [] : useBaseLimits;
      !dailyLimit ? dailyLimit = 0 : dailyLimit;
      !threshold ? threshold = 0 : threshold;
      !delay ? delay = 0 : delay;
      !recoveryAddress ? recoveryAddress = '0x0000000000000000000000000000000000000000' : recoveryAddress;
      if (userAddress === vaultSettings.recoveryAddress) {
        const tx = await contract.updateSettings(recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay, tokens, fixedLimits, percentageLimits, useBaseLimits);
        await tx.wait();
      } else {
        tokens.forEach((tokenAddress) => {
          tokens.push(tokenAddress);
          fixedLimits.push(document.getElementById(`fixed-limit-${tokenAddress}`).value || 0);
          percentageLimits.push(document.getElementById(`percentage-limit-${tokenAddress}`).value || 0);
          useBaseLimits.push(document.getElementById(`use-base-limit-${tokenAddress}`).value || 0);
        });
        const data = abi.encodeFunctionData("updateSettings", [
          recoveryAddress,
          whitelistedAddresses,
          dailyLimit || 0,
          threshold || 0,
          delay * 84000 || 0,
          tokens,
          fixedLimits,
          percentageLimits,
          useBaseLimits
        ]);
        const tx = await contract.queueTransaction(selectedVault, data, 0);
        await tx.wait();
      }
      toast.success('Settings updated successfully!');
      fetchTokenBalances(selectedVault);
      fetchQueuedTransactions(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update settings.');
    }
  };

  const updateTokenLimit = async () => {
    try {
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      let fixedLimits = tokenLimit.fixedLimit != '' ? tokenLimit.fixedLimit : 0;
      let percentageLimits = tokenLimit.percentageLimit != '' ? tokenLimit.percentageLimit : 0;
      let useBaseLimits = tokenLimit.useBaseLimit != '' ? tokenLimit.useBaseLimit : 0;
      let abi = new ethers.Interface(vaultAbi);
      const data = abi.encodeFunctionData("setTokenLimit", [selectedToken, fixedLimits, percentageLimits, useBaseLimits]);
      const tx = await contract.queueTransaction(selectedVault, data, 0);
      await tx.wait();
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update settings.');
    }
  };

  const handleWithdrawToken = async (tokenAddress, amount) => {
    try {
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        const tx = await contract.withdrawToken(userAddress, tokenAddress, ethers.parseEther(amount));
        await tx.wait();
      } else {
        const token = new ethers.Contract(tokenAddress, ['function decimals() view returns (uint8)'], signer);
        const tx = await contract.withdrawToken(userAddress, tokenAddress, ethers.parseUnits(amount.toString(), await token.decimals()));
        await tx.wait();
      }
      toast.success('Token withdrawn successfully!');
      fetchTokenBalances(selectedVault);
      fetchQueuedTransactions(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to withdraw token.');
    }
  };

  const handleWithdrawNft = async (nft) => {
    try {
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      const abi = new ethers.Interface([
        "function transferFrom(address from, address to, uint256 tokenId)"
      ]);
      const data = abi.encodeFunctionData("transferFrom", [selectedVault, userAddress, nft.tokenId]);
      const tx = await contract.queueTransaction(nft.address, data, 0);
      await tx.wait();
      toast.success('NFT withdrawal queued successfully!');
      fetchTokenBalances(selectedVault);
      fetchQueuedTransactions(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to withdraw NFT.');
    }
  };

  const handleSendCustomTx = async () => {
    try {
      const { to, value, fnSig, params } = customTx;
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      const abi = new ethers.Interface([`function ${fnSig}`]);
      const data = fnSig.startsWith('calldata') ? params[0] : abi.encodeFunctionData(fnSig.split('(')[0], params);
      const tx = await contract.queueTransaction(to, data, ethers.parseUnits(value.toString(), 'ether'));
      await tx.wait();
      toast.success('Custom transaction queued successfully!');
      fetchQueuedTransactions(selectedVault);
      setIsCustomTxModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to queue custom transaction.');
    }
  };

  const commonFunctionSignatures = [
    "transfer(address to, uint256 amount)",
    "approve(address to, uint256 amount)",
    "transferFrom(address from, address to, uint256 amount)",
    "delegate(address delegatee)"
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: gradients.mesh, py: 4 }}>
      <Toaster />
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
            <WalletIcon sx={{ fontSize: 40, mr: 1, verticalAlign: 'middle' }} />
            Welcome to Vault
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <IconButton
              component="a"
              href="https://twitter.com/heyvault"
              target="_blank"
              sx={{ color: 'white' }}
            >
              <img src="https://cdn.simpleicons.org/x/ffffff" alt="Twitter" style={{ width: 20, height: 20 }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://discord.gg/vrV4YpUccq"
              target="_blank"
              sx={{ color: 'white' }}
            >
              <img src="https://cdn.simpleicons.org/discord/ffffff" alt="Discord" style={{ width: 20, height: 20 }} />
            </IconButton>
            <Button
              onClick={() => {
                navigator.clipboard.writeText('https://vault.store/?ref=' + userAddress);
                toast.success('Referral Link copied to clipboard')
              }}
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              <ShareIcon sx={{ mr: 0.5 }} /> Refer
            </Button>
          </Stack>
        </Box>

        {/* Vault Management Section */}
        <GlassCard sx={{ mb: 4 }}>
          <CardContent>
            <Tabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              centered
              sx={{
                mb: 3,
                '& .MuiTab-root': { fontWeight: 600, fontSize: '1rem' },
                '& .Mui-selected': { color: '#e91e63' }
              }}
            >
              <Tab label="Open Vault" />
              <Tab label="Create Vault" />
              <Tab label="Settings" />
            </Tabs>

            {/* Tab Content */}
            {currentTab === 0 && (
              <Box>
                <TextField
                  fullWidth
                  label="Search Vault by Name"
                  placeholder="Enter vault name to search"
                  sx={{ mb: 2 }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearch(e.target.value);
                    }
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleSearch(document.querySelector('input[placeholder="Enter vault name to search"]').value)}
                  sx={{ mb: 3, background: gradients.primary }}
                >
                  Search
                </Button>
                <FormControl fullWidth>
                  <InputLabel>My Vaults</InputLabel>
                  <Select value={selectedVault} onChange={(e) => setSelectedVault(e.target.value)} label="My Vaults">
                    {vaults.map(vault => (
                      <MenuItem key={vault} value={vault}>{vault}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}

            {currentTab === 1 && (
              <Box component="form" sx={{ '& > *': { mb: 2 } }}>
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    fullWidth
                    label="Vault Name"
                    id="vault-name"
                    required
                    InputProps={{
                      endAdornment: <Typography sx={{ color: 'text.secondary' }}>.vlt.eth</Typography>
                    }}
                  />
                  <IconButton
                    onClick={() => setIsCreateInfoModalOpen(true)}
                    sx={{ position: 'absolute', right: -40, top: 8 }}
                  >
                    ?
                  </IconButton>
                </Box>
                <TextField
                  fullWidth
                  label="Recovery Address"
                  id="recovery"
                  placeholder="Cold wallet address for backup - has full control"
                  required
                />
                <TextField
                  fullWidth
                  label="Whitelist Addresses (comma separated)"
                  id="custom-whitelist"
                  placeholder="Trusted signers separated by commas"
                  required
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Safety Delay (days)"
                  id="transaction-delay"
                  required
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Threshold"
                  id="threshold"
                  placeholder="Signers needed to confirm txs"
                  required
                />
                <TextField
                  fullWidth
                  type="number"
                  label="Daily Limit (%)"
                  id="custom-limits"
                  required
                />
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => createVault(
                    document.getElementById('vault-name').value,
                    document.getElementById('recovery').value,
                    document.getElementById('custom-whitelist').value.split(','),
                    document.getElementById('custom-limits').value,
                    document.getElementById('threshold').value,
                    document.getElementById('transaction-delay').value
                  )}
                  sx={{ background: gradients.success, mt: 2 }}
                >
                  Create Vault
                </Button>
              </Box>
            )}

            {currentTab === 2 && (
              <Box sx={{ '& > *': { mb: 3 } }}>
                <Typography variant="h6" sx={{ color: '#e91e63', mb: 2 }}>Vault Info</Typography>
                <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
                  <Typography variant="body2" sx={{ mb: 1 }}><strong>Owner:</strong> {vaultSettings.owner}</Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}><strong>Recovery:</strong> {vaultSettings.recoveryAddress}</Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                    <Chip label={`Limit: ${vaultSettings.dailyLimit}%`} color="primary" />
                    <Chip label={`Threshold: ${vaultSettings.threshold}`} color="secondary" />
                    <Chip label={`Delay: ${(vaultSettings.delay / 84000).toFixed(0)}d`} color="info" />
                  </Stack>
                </Paper>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 3 }}>Whitelisted Addresses</Typography>
                {vaultSettings.whitelistedAddresses && vaultSettings.whitelistedAddresses.length > 0 ? (
                  vaultSettings.whitelistedAddresses.map((address, index) => (
                    <Chip key={index} label={address} sx={{ m: 0.5 }} />
                  ))
                ) : (
                  <Typography variant="body2">No whitelisted addresses</Typography>
                )}

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ color: '#e91e63', mb: 2 }}>Update Settings</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth type="number" label="Daily Limit (%)" id="withdraw-limit" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth type="number" label="Threshold" id="threshold" />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField fullWidth type="number" label="Delay (days)" id="delay" />
                  </Grid>
                </Grid>
                <TextField
                  fullWidth
                  label="Recovery Address"
                  id="recovery-addresses"
                  sx={{ mt: 2 }}
                />
                <TextField
                  fullWidth
                  label="Whitelisted Addresses (comma separated)"
                  id="whitelisted-addresses"
                  sx={{ mt: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => updateSettings(
                    document.getElementById('recovery-addresses').value,
                    document.getElementById('whitelisted-addresses').value.split(','),
                    document.getElementById('withdraw-limit').value,
                    document.getElementById('threshold').value,
                    document.getElementById('delay').value
                  )}
                  sx={{ mt: 2, background: gradients.primary }}
                >
                  Save Settings
                </Button>
                {(userAddress == vaultSettings.owner || userAddress == vaultSettings.recoveryAddress || vaultSettings.whitelistedAddresses && vaultSettings.whitelistedAddresses.includes(userAddress)) && (
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<LockIcon />}
                    onClick={() => {
                      let contract = new ethers.Contract(selectedVault, ["function freezeLock(uint) external"], signer);
                      contract.freezeLock(2);
                    }}
                    sx={{ mt: 2, background: gradients.sunset }}
                  >
                    Freeze Vault
                  </Button>
                )}
              </Box>
            )}

            <Box sx={{ mt: 3 }}>
              <ConnectButton />
            </Box>
          </CardContent>
        </GlassCard>

        {/* Vault Name and Address */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
            {vaultSettings.name}
          </Typography>
          <Chip
            label={selectedVault}
            sx={{ background: '#e91e63', color: 'white', fontWeight: 600 }}
          />
        </Box>

        {/* Assets Section */}
        <GlassCard sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: 700 }}>
                Assets in Vault
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={() => { setShowVaultOnly(!showVaultOnly); fetchDeps() }}
                  sx={{ background: showVaultOnly ? gradients.ocean : gradients.lavender }}
                >
                  {showVaultOnly ? 'Deposit Assets' : 'Show Vault Assets'}
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setIsDepositModalOpen(true)}
                  sx={{ background: gradients.success }}
                >
                  Deposit New Token
                </Button>
              </Stack>
            </Stack>

            {loading && <LinearProgress sx={{ mb: 2 }} />}

            <Grid container spacing={3}>
              {/* Token Balances */}
              {tokenBalances.map((asset, index) => (
                <Grid item xs={12} md={6} lg={4} key={asset.symbol}>
                  <Card sx={{
                    background: bgColors[index % bgColors.length],
                    color: 'white',
                    position: 'relative',
                    minHeight: 280
                  }}>
                    <IconButton
                      sx={{ position: 'absolute', top: 8, right: 8, color: 'white' }}
                      onClick={() => {
                        setIsLimitModalOpen(true);
                        setSelectedToken(asset.address);
                      }}
                    >
                      <SettingsIcon />
                    </IconButton>
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                        <Avatar
                          src={asset.logo || tokenLogos[asset.address.toLowerCase()] || 'https://cryptologos.cc/logos/ethereum-eth-logo.png'}
                          sx={{ width: 40, height: 40 }}
                        />
                        <Typography variant="h5" fontWeight="bold">{asset.symbol}</Typography>
                      </Stack>

                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption">Balance</Typography>
                          <Paper sx={{ p: 1, background: 'rgba(59, 130, 246, 0.8)', textAlign: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">
                              {convert(asset.balance).toString().substring(0, 12)}
                            </Typography>
                          </Paper>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption">Wallet</Typography>
                          <Paper sx={{ p: 1, background: 'rgba(251, 146, 60, 0.8)', textAlign: 'center' }}>
                            <Typography variant="body2" fontWeight="bold">{asset.wallet}</Typography>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Typography variant="caption">{convert(asset.limit).toString().substring(0, 12)} Available</Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(asset.limit / asset.dailyLimit) * 100}
                        sx={{ height: 8, borderRadius: 1, mt: 1, mb: 2 }}
                      />

                      <Stack spacing={1}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Amount"
                          id={`amount-${asset.symbol}`}
                          sx={{ background: 'white', borderRadius: 1 }}
                        />
                        <Stack direction="row" spacing={1}>
                          <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            startIcon={<UploadIcon />}
                            onClick={() => handleDepositToken(asset.address, document.getElementById(`amount-${asset.symbol}`).value)}
                            sx={{ background: 'white', color: '#3b82f6', '&:hover': { background: '#f3f4f6' } }}
                          >
                            Deposit
                          </Button>
                          <Button
                            fullWidth
                            variant="contained"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleWithdrawToken(asset.address, document.getElementById(`amount-${asset.symbol}`).value)}
                            sx={{ background: 'white', color: '#3b82f6', '&:hover': { background: '#f3f4f6' } }}
                          >
                            Withdraw
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* NFT Assets */}
              {nftAssets.map((nft, index) => (
                <Grid item xs={12} md={6} lg={4} key={nft.tokenId}>
                  <Card sx={{
                    background: `url(${nft.imageUrl}) center/cover`,
                    minHeight: 300,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                    }
                  }}>
                    <IconButton
                      sx={{ position: 'absolute', top: 8, right: 8, color: 'white', zIndex: 1 }}
                      onClick={() => setIsLimitModalOpen(true)}
                    >
                      <SettingsIcon />
                    </IconButton>
                    <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <Stack alignItems="center" spacing={1}>
                        <Avatar src={nft.imageUrl} sx={{ width: 60, height: 60, border: '3px solid white' }} />
                        <Chip
                          label={`${nft.name} #${nft.tokenId}`}
                          sx={{ background: '#e91e63', color: 'white', fontWeight: 'bold' }}
                        />
                      </Stack>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => handleWithdrawNft(nft)}
                        sx={{ background: 'white', color: '#3b82f6', '&:hover': { background: '#f3f4f6' } }}
                      >
                        Withdraw NFT
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Assets not in vault */}
              {!showVaultOnly && (
                <>
                  {todeposit.map((asset, index) => (
                    <Grid item xs={12} md={6} lg={4} key={asset.symbol}>
                      <Card sx={{ background: 'linear-gradient(135deg, #d8b4fe 0%, #f9a8d4 50%, #fca5a5 100%)', color: 'white' }}>
                        <CardContent>
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                            <Avatar
                              src={asset.logo || tokenLogos[asset.address.toLowerCase()] || 'https://cryptologos.cc/logos/ethereum-eth-logo.png'}
                              sx={{ width: 40, height: 40 }}
                            />
                            <Typography variant="h6" fontWeight="bold">{asset.symbol}</Typography>
                          </Stack>
                          <Typography variant="body2" sx={{ mb: 2 }}>
                            Wallet: <strong>{convert(asset.balance).toString().substring(0, 12)}</strong>
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Amount"
                            id={`amt-${asset.symbol}`}
                            sx={{ background: 'white', borderRadius: 1, mb: 1 }}
                          />
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleDepositToken(asset.address, document.getElementById(`amt-${asset.symbol}`).value)}
                            sx={{ background: 'white', color: '#3b82f6' }}
                          >
                            Deposit to Vault
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}

                  {todepositnft.map((nft, index) => (
                    <Grid item xs={12} md={6} lg={4} key={nft.tokenId}>
                      <Card sx={{
                        background: `url(${nft.imageUrl}) center/cover`,
                        minHeight: 300,
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'linear-gradient(to bottom, rgba(216, 180, 254, 0.5), rgba(236, 72, 153, 0.8))'
                        }
                      }}>
                        <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                          <Stack alignItems="center" spacing={1}>
                            <Avatar src={nft.imageUrl} sx={{ width: 60, height: 60, border: '3px solid white' }} />
                            <Chip label={`${nft.name} ${nft.symbol} #${nft.tokenId}`} sx={{ background: '#f9a8d4', color: 'white' }} />
                            <Chip label="NFT Not Secured" color="error" />
                          </Stack>
                          <Button
                            fullWidth
                            variant="contained"
                            onClick={() => handleDepositToken(nft.contract.address, nft.tokenId, 1)}
                            sx={{ background: 'white', color: '#3b82f6' }}
                          >
                            Deposit to Vault
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </>
              )}
            </Grid>
          </CardContent>
        </GlassCard>

        {/* Transactions Section */}
        <GlassCard>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: 700 }}>
                Vault Transactions
              </Typography>
              <Button
                variant="contained"
                onClick={() => setIsCustomTxModalOpen(true)}
                sx={{ background: gradients.lavender }}
              >
                Queue Custom Transaction
              </Button>
            </Stack>

            <Box sx={{ display: { xs: 'none', md: 'grid' }, gridTemplateColumns: '1fr 2fr 1fr 2fr 2fr', gap: 2, mb: 2, fontWeight: 600 }}>
              <Typography>ID</Typography>
              <Typography>To</Typography>
              <Typography>Amount</Typography>
              <Typography>Date</Typography>
              <Typography>Status</Typography>
            </Box>

            <Stack spacing={2}>
              {queuedTransactions.map((tx, index) => (
                <Card key={tx.id} sx={{ background: bgColors[index % bgColors.length], color: 'white' }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={1}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Avatar sx={{ background: tx.executed ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)', width: 32, height: 32 }}>
                            {tx.to !== selectedVault ? (
                              <img src={tokenLogos[tx.token.toLowerCase()] || 'https://cryptologos.cc/logos/ethereum-eth-logo.png'} style={{ width: 24, height: 24 }} />
                            ) : (
                              <SettingsIcon />
                            )}
                          </Avatar>
                          <Typography fontWeight="bold">{tx.id}</Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" noWrap>{tx.to}</Typography>
                      </Grid>
                      <Grid item xs={12} md={2}>
                        <Typography fontWeight="bold">{tx.amount}</Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2">{new Date(tx.timestamp * 1000).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={tx.executed ? (tx.numConfirmations == 404 ? 'Canceled' : 'Completed') : 'Pending'}
                            color={tx.executed ? (tx.numConfirmations == 404 ? 'error' : 'success') : 'warning'}
                            icon={tx.executed ? (tx.numConfirmations == 404 ? <CancelIcon /> : <CheckIcon />) : null}
                            size="small"
                          />
                          {!tx.executed && (
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleConfirmTransaction(tx.id)}
                              sx={{ background: 'rgba(236, 72, 153, 0.8)', minWidth: 80 }}
                            >
                              Sign {tx.numConfirmations}/{tx.threshold}
                            </Button>
                          )}
                          {!tx.executed && userAddress == vaultSettings.owner && (
                            <IconButton
                              size="small"
                              onClick={() => handleCancelTransaction(tx.id)}
                              sx={{ color: 'white', background: 'rgba(239, 68, 68, 0.5)' }}
                            >
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </CardContent>
        </GlassCard>
      </Container>

      {/* Modals */}
      <DepositModal
        open={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        onDeposit={handleDepositToken}
        chainId={chainId}
      />

      <LimitModal
        open={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        limitSection={limitSection}
        setLimitSection={setLimitSection}
        tokenLimit={tokenLimit}
        setTokenLimit={setTokenLimit}
        onUpdate={updateTokenLimit}
      />

      <CreateInfoModal
        open={isCreateInfoModalOpen}
        onClose={() => setIsCreateInfoModalOpen(false)}
      />

      <CustomTxModal
        open={isCustomTxModalOpen}
        onClose={() => setIsCustomTxModalOpen(false)}
        customTx={customTx}
        setCustomTx={setCustomTx}
        onSend={handleSendCustomTx}
        commonFunctionSignatures={commonFunctionSignatures}
      />
    </Box>
  );
};

// Modal Components
function DepositModal({ open, onClose, onDeposit, chainId }) {
  const [selectedToken, setSelectedToken] = useState('');
  const [amount, setAmount] = useState('');
  const [nft, setNft] = useState(0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Deposit Assets
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <ToggleButtonGroup
          value={nft}
          exclusive
          onChange={(e, val) => val !== null && setNft(val)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value={0}>Token</ToggleButton>
          <ToggleButton value={1}>NFT</ToggleButton>
        </ToggleButtonGroup>

        {nft === 0 ? (
          <>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Select Token</InputLabel>
              <Select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} label="Select Token">
                <MenuItem value="0x0000000000000000000000000000000000000000">ETH</MenuItem>
                {chainId === 8453 && (
                  <>
                    <MenuItem value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</MenuItem>
                    <MenuItem value="0x50c5725949a6f0c72e6c4a641f24049a917db0cb">DAI</MenuItem>
                    <MenuItem value="0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42">EURC</MenuItem>
                  </>
                )}
                {chainId === 1 && (
                  <>
                    <MenuItem value="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48">USDC</MenuItem>
                    <MenuItem value="0x2260fac5e5542a773aa44fbcfedf7c193bc2c599">WBTC</MenuItem>
                  </>
                )}
                <MenuItem value="custom">Custom</MenuItem>
              </Select>
            </FormControl>
            {selectedToken === 'custom' && (
              <TextField
                fullWidth
                label="Custom Token Address"
                sx={{ mb: 2 }}
                onChange={(e) => { setSelectedToken(e.target.value); toast.success('Token set') }}
              />
            )}
            <TextField
              fullWidth
              type="number"
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onDeposit(selectedToken, amount);
                onClose();
              }}
              sx={{ background: gradients.success }}
            >
              Deposit Token
            </Button>
          </>
        ) : (
          <>
            <TextField fullWidth label="NFT Contract Address" onChange={(e) => setSelectedToken(e.target.value)} sx={{ mb: 2 }} />
            <TextField fullWidth label="Token ID" onChange={(e) => setAmount(e.target.value)} sx={{ mb: 2 }} />
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                onDeposit(selectedToken, amount, 1);
                onClose();
              }}
              sx={{ background: gradients.success }}
            >
              Deposit NFT
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LimitModal({ open, onClose, limitSection, setLimitSection, tokenLimit, setTokenLimit, onUpdate }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Set Token Limits
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <ToggleButtonGroup
          value={limitSection}
          exclusive
          onChange={(e, val) => val && setLimitSection(val)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="fixed">Fixed</ToggleButton>
          <ToggleButton value="percentage">Percentage</ToggleButton>
          <ToggleButton value="no-limit">No Limit</ToggleButton>
        </ToggleButtonGroup>

        {limitSection === 'fixed' && (
          <TextField
            fullWidth
            type="number"
            label="Fixed Limit"
            value={tokenLimit.fixedLimit}
            onChange={(e) => setTokenLimit({ ...tokenLimit, fixedLimit: e.target.value })}
            sx={{ mb: 2 }}
          />
        )}

        {limitSection === 'percentage' && (
          <TextField
            fullWidth
            type="number"
            label="Percentage Limit (%)"
            value={tokenLimit.percentageLimit}
            onChange={(e) => setTokenLimit({ ...tokenLimit, percentageLimit: e.target.value })}
            sx={{ mb: 2 }}
          />
        )}

        {limitSection === 'no-limit' && (
          <>
            <Typography sx={{ mb: 2, textAlign: 'center' }}>No limit set for this token</Typography>
            <FormControl fullWidth>
              <InputLabel>Use Base Limits</InputLabel>
              <Select
                value={tokenLimit.useBaseLimit}
                onChange={(e) => setTokenLimit({ ...tokenLimit, useBaseLimit: e.target.value })}
                label="Use Base Limits"
              >
                <MenuItem value="0">Use Base Limit</MenuItem>
                <MenuItem value="1">Disable withdrawals</MenuItem>
                <MenuItem value="2">Unlimited withdrawals</MenuItem>
              </Select>
            </FormControl>
          </>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            onUpdate();
            onClose();
          }}
          sx={{ mt: 2, background: gradients.primary }}
        >
          Set Limits
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function CreateInfoModal({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Vault Information Guide
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="h6" gutterBottom>What is a Vault?</Typography>
        <Typography paragraph>
          A Vault is a secure smart contract that functions as a safe savings account for your hot wallet.
          It allows you to deposit tokens and NFTs, set withdrawal limits, whitelist addresses, and require
          multiple signers for transactions.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Key Features</Typography>
        <Stack spacing={1}>
          <Typography>• Daily withdrawal limits to protect against drainers</Typography>
          <Typography>• Multi-signature approval for enhanced security</Typography>
          <Typography>• Recovery address for emergency access</Typography>
          <Typography>• Transaction delays for suspicious activity detection</Typography>
          <Typography>• Freeze functionality to stop all activity</Typography>
        </Stack>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Creating a Vault</Typography>
        <Typography paragraph>
          <strong>Vault Name:</strong> Choose a unique name for your vault<br />
          <strong>Recovery Address:</strong> Cold wallet address for backup (has full control)<br />
          <strong>Whitelist:</strong> Trusted addresses that can sign transactions<br />
          <strong>Safety Delay:</strong> Time delay before transactions execute<br />
          <strong>Threshold:</strong> Number of signers needed to approve transactions<br />
          <strong>Daily Limit:</strong> Maximum percentage of assets withdrawable per day
        </Typography>

        <Button fullWidth variant="contained" onClick={onClose} sx={{ mt: 2, background: gradients.success }}>
          Got It
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function CustomTxModal({ open, onClose, customTx, setCustomTx, onSend, commonFunctionSignatures }) {
  const [paramInputs, setParamInputs] = useState([]);

  useEffect(() => {
    const params = customTx.fnSig.match(/\(([^)]+)\)/)?.[1].split(',') || [];
    setParamInputs(params);
  }, [customTx.fnSig]);

  const handleParamChange = (index, value) => {
    const newParams = [...customTx.params];
    newParams[index] = value;
    setCustomTx({ ...customTx, params: newParams });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Queue Custom Transaction
        <IconButton onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="To Address"
          value={customTx.to}
          onChange={(e) => setCustomTx({ ...customTx, to: e.target.value })}
          sx={{ mb: 2, mt: 1 }}
        />
        <TextField
          fullWidth
          type="number"
          label="ETH Value"
          value={customTx.value}
          onChange={(e) => setCustomTx({ ...customTx, value: e.target.value })}
          sx={{ mb: 2 }}
        />
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Function Signature</InputLabel>
          <Select
            value={customTx.fnSig}
            onChange={(e) => setCustomTx({ ...customTx, fnSig: e.target.value, params: Array(e.target.value.split(',').length - 1).fill('') })}
            label="Function Signature"
          >
            <MenuItem value="">Select a function</MenuItem>
            {commonFunctionSignatures.map((sig, index) => (
              <MenuItem key={index} value={sig}>{sig}</MenuItem>
            ))}
            <MenuItem value="custom">Custom</MenuItem>
            <MenuItem value="calldata">Call Data</MenuItem>
          </Select>
        </FormControl>

        {customTx.fnSig === 'custom' && (
          <TextField
            fullWidth
            label="Custom Function Signature"
            placeholder="e.g., transfer(address to, uint256 amount)"
            onChange={(e) => setCustomTx({ ...customTx, fnSig: e.target.value, params: Array(e.target.value.split(',').length - 1).fill('') })}
            sx={{ mb: 2 }}
          />
        )}

        {customTx.fnSig === 'calldata' ? (
          <TextField
            fullWidth
            label="Call Data"
            value={customTx.params[0] || ''}
            onChange={(e) => handleParamChange(0, e.target.value)}
            sx={{ mb: 2 }}
          />
        ) : (
          paramInputs.map((param, index) => (
            <TextField
              key={index}
              fullWidth
              label={param.split(' ')[1] || `param${index}`}
              value={customTx.params[index] || ''}
              onChange={(e) => handleParamChange(index, e.target.value)}
              sx={{ mb: 2 }}
            />
          ))
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={onSend}
          sx={{ background: gradients.lavender }}
        >
          Queue Transaction
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default App;
