import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { useEthersProvider, useEthersSigner } from './tl';
import { Alchemy, Network } from 'alchemy-sdk';

const defaultVaultAddress = '0x757Db67ef173678115a2E7F080eaD93d6aD76E00'; // Replace with your Vault contract address

// Define the Vault contract ABI
const vaultAbi = [
  "event TokenDeposited(address indexed token, uint256 amount, address indexed depositor)",
  "event TokenWithdrawn(address indexed token, uint256 amount)",
  "event NftDeposited(address indexed token, uint256 indexed tokenId, address indexed depositor)",
  "event NftWithdrawn(address indexed token, uint256 indexed tokenId)",
  "function depositToken(address token, uint256 amount) external payable",
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
  "function queuedTransactions(uint256) external view returns (address, bytes memory, uint256, bool, uint256, uint256)"
];

// Define the VaultFactory contract ABI
const factoryAbi = [
  "constructor()",
  "event VaultCreated(address vaultAddress, address indexed owner, string name, address recoveryAddress)",
  "function createVault(string _name, address _recoveryAddress, address[] _whitelistedAddresses, uint256 _dailyLimit, uint256 _threshold, uint256 _delay) external returns (address)",
  "function getVaultsByOwner(address _owner) external view returns (address[])",
  "function vaultNames(string) external view returns (address)"
];

const bgColors = [
  'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
  'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
  'bg-gradient-to-r from-green-400 to-blue-500',
  'bg-gradient-to-r from-yellow-400 to-orange-500',
  'bg-gradient-to-r from-red-400 to-yellow-500',
  'bg-gradient-to-r from-teal-400 to-blue-500'
];

const tokenLogos = {
  '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
  '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
  '0x94373a4919b3240d86ea41593d5eba789fef3848': 'https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png',
  // Add more token addresses and their corresponding logos here
};

const App = () => {
  const [currentTab, setCurrentTab] = useState('open');
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
  const [isCreateInfoModalOpen, setIsCreateInfoModalOpen] = useState(false); // New state for info modal
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const factoryAddress = chainId == 8453 ? '0xBAa9e4467ad7673a8A54b36fB5dc4ecd8b29FB05' : '0xc9035Dc511C7C4856E63b54fa0f39d012c45862f'; // Replace with your VaultFactory contract address

  const alchemyConfig = {
    apiKey: 'Z-ifXLmZ9T3-nfXiA0B8wp5ZUPXTkWlg', // Replace with your Alchemy API key
    network: chainId == 8453 ? Network.BASE_MAINNET : chainId == 1 ? Network.ETH_MAINNET : Network.OPT_MAINNET,
  };
  const alchemy = new Alchemy(alchemyConfig);
  const [net, setNet] = useState(null);
useEthersProvider().addListener('network', (newNetwork, oldNetwork) => {
if (  net!=null){
  window.location.reload();}
  setNet(newNetwork);
});
  const fetchVaults = async () => {
    try {
      const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
      const userVaults = await factory.getVaultsByOwner(userAddress);
      const allVaults = userVaults.length > 0 ? userVaults : [defaultVaultAddress];
      setVaults(allVaults);
      if (!selectedVault) {
        setSelectedVault(allVaults[0]);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch user vaults.');
    }
  };
  const fetchTokenBalances = async (vault) => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(vault, vaultAbi, provider);
      console.log(vault);
      const balances = await alchemy.core.getTokenBalances(vault);
      const nonZeroBalances = balances.tokenBalances.filter(token => token.tokenBalance !== "0");
      const name = await contract.name();
      const recoveryAddress = await contract.recoveryAddress();
      const dailyLimit = Number(await contract.dailyLimit());
      const threshold = Number(await contract.threshold());
      const delay = Number(await contract.delay());
      const baseLimit = await contract.dailyLimit();
      let owner = await contract.owner();

      const tokenDetails = await Promise.all(nonZeroBalances.map(async token => {
        const balance = token.tokenBalance;
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        console.log(metadata);
        const adjustedBalance = balance / Math.pow(10, metadata.decimals);
        const tokenLimit = await contract.getLimit(userAddress, token.contractAddress, 0);
        console.log('boop',tokenLimit);
const lim = await contract.getLimitAmount(token.contractAddress)//Number(tokenLimit.fixedLimit > 0 ? tokenLimit.fixedLimit : tokenLimit.percentageLimit > 0 ? tokenLimit.percentageLimit * Number(balance) / 100 : tokenLimit.useBaseLimit == 1 ? '0' : tokenLimit.useBaseLimit == 2 ? adjustedBalance.toFixed(2) : adjustedBalance * Number(baseLimit) / 100);
console.log(metadata.name,lim,tokenLimit,Number(lim)/ Math.pow(10, metadata.decimals), Number(tokenLimit)/ Math.pow(10, metadata.decimals));

return {
          ...metadata,
          balance: adjustedBalance,
          address: token.contractAddress,
          dailyLimit: Number(lim)/ Math.pow(10, metadata.decimals),
          limit: Number(tokenLimit)/ Math.pow(10, metadata.decimals)
        };
      }));

      const ethBalance = await provider.getBalance(vault);
      const adjustedEthBalance = ethers.formatEther(ethBalance);
      const ethLimit = await contract.getLimit(userAddress, '0x0000000000000000000000000000000000000000', 0);
      const lim = await contract.getLimitAmount('0x0000000000000000000000000000000000000000')
      const ethLimitAmount = Number(ethLimit.fixedLimit > 0 ? ethLimit.fixedLimit : ethLimit.percentageLimit > 0 ? ethLimit.percentageLimit * Number(ethBalance) / 100 : ethLimit.useBaseLimit == 1 ? '0' : ethLimit.useBaseLimit == 2 ? adjustedEthBalance : adjustedEthBalance * Number(baseLimit) / 100);

      tokenDetails.unshift({
        name: 'Ether',
        symbol: 'ETH',
        balance: adjustedEthBalance,
        address: '0x0000000000000000000000000000000000000000',
        dailyLimit: Number(lim)/ Math.pow(10, 18),
        limit: (Number(ethLimit)/ Math.pow(10, 18) )
            });

      setTokenBalances(tokenDetails.filter(token => token.symbol.length < 10));

      let whitelistedAddresses = [];
      let i = 0;
      while (true) {
        try {
          const address = await contract.whitelistedAddresses(i);
          whitelistedAddresses.push(address);
          console.log(address);
          i++;
          if (address === '0x0000000000000000000000000000000000000000') {
            break;
          }
        } catch (error) {
          break;
        }
      }
      console.log(recoveryAddress, dailyLimit, threshold, delay, whitelistedAddresses);
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
      console.log(nftsForOwner);

      const nftDetails = nftsForOwner.ownedNfts.map(nft => ({
        ...nft,
        imageUrl: nft.image.cachedUrl || 'https://via.placeholder.com/150'
      }));
      setNftAssets(nftDetails);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch NFT assets.');
    }
  };

  const fetchQueuedTransactions = async (vault) => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(vault, vaultAbi, provider);
      let queuedTransactions = [];
      let i = 0;
      const threshold = await contract.threshold();

      while (true) {
        try {
          const [to, data, timestamp, executed, numConfirmations, amount] = await contract.queuedTransactions(i);
          if (timestamp === 0) {
            break;
          }
          const tx = {
            id: i,
            to,
            data,
            timestamp: Number(timestamp),
            executed,
            numConfirmations: Number(numConfirmations),
            threshold: Number(threshold),
            amount: ethers.formatUnits(amount, 'ether') < 0.00000000001 ? ethers.formatUnits(amount, 6) : ethers.formatUnits(amount, 'ether')
          };
          queuedTransactions.push(tx);
          i++;
        } catch (error) {
          break;
        }
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

  useEffect(() => {
    if (userAddress) {
      fetchVaults();
    }
  }, [userAddress]);

  useEffect(() => {
    if (selectedVault) {
      fetchTokenBalances(selectedVault);
      fetchQueuedTransactions(selectedVault);
    }
  }, [selectedVault]);

  const handleDepositToken = async (tokenAddress, amount) => {
    try {
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      if (tokenAddress === '0x0000000000000000000000000000000000000000') {
        const tx = await contract.depositToken(tokenAddress, ethers.parseEther(amount), { value: ethers.parseEther(amount) });
        await tx.wait();
      } else {
        const token = new ethers.Contract(tokenAddress, ['function approve(address spender, uint256 amount)', 'function allowance(address owner, address spender) view returns (uint256)', 'function decimals() view returns (uint8)'], signer);
        const allowance = await token.allowance(userAddress, selectedVault);
        if (allowance < ethers.parseUnits(amount.toString(), await token.decimals())) {
          const approveTx = await token.approve(selectedVault, ethers.parseUnits('1000000000000000000', await token.decimals()));
          await approveTx.wait();
        }
        const tx = await contract.depositToken(tokenAddress, ethers.parseUnits(amount.toString(), await token.decimals()));
        await tx.wait();
      }
      toast.success('Token deposited successfully!');
      fetchTokenBalances(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to deposit token.');
    }
  };

  const handleSearch = async (vaultName) => {
    console.log(vaultName);
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
      const tx = await contract.createVault(name, recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay);
      await tx.wait();
      toast.success('Vault created successfully!');
      fetchVaults();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create vault.');
    }
  };

  const updateSettings = async (recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay, tokens, fixedLimits, percentageLimits, useBaseLimits) => {
    try {      let abi = new ethers.Interface(vaultAbi);

      console.log(recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay, tokens, fixedLimits, percentageLimits, useBaseLimits);
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      !whitelistedAddresses ? whitelistedAddresses = vaultSettings.whitelistedAddresses : whitelistedAddresses;
      !tokens ? tokens = [] : tokens;
      !fixedLimits ? fixedLimits = [] : fixedLimits;
      !percentageLimits ? percentageLimits = [] : percentageLimits;
      !useBaseLimits ? useBaseLimits = [] : useBaseLimits;
      !dailyLimit ? dailyLimit = 0 : dailyLimit;
      !threshold ? threshold = 0 : threshold;
      !delay ? delay = 0 : delay;
      !recoveryAddress ? recoveryAddress = '0x0000000000000000000000000000000000000000' : recoveryAddress;
      if(userAddress===vaultSettings.recoveryAddress){
     console.log('lol')
      const tx = await contract.updateSettings(recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay, tokens, fixedLimits, percentageLimits, useBaseLimits);
      await tx.wait();
      }
      else if(whitelistedAddresses!='')
{     const data = abi.encodeFunctionData("updatewhitelistAddresses", [whitelistedAddresses]);
  const tx = await contract.queueTransaction(selectedVault, data, 0); 
await tx.wait();
}
else if(dailyLimit!='')
{     const data = abi.encodeFunctionData("updateDailyLimit", [dailyLimit]);
  const tx = await contract.queueTransaction(selectedVault, data, 0);
await tx.wait();
}
else if(threshold!='')
{     const data = abi.encodeFunctionData("updateThreshold", [threshold]);
  const tx = await contract.queueTransaction(selectedVault, data, 0);
await tx.wait();
}
else if(delay!='')
{     const data = abi.encodeFunctionData("updateDelay", [delay]);
  const tx = await contract.queueTransaction(selectedVault, data, 0);
await tx.wait();
}
else if(recoveryAddress!='')
{     const data = abi.encodeFunctionData("updateRecoveryAddress", [recoveryAddress]);
  const tx = await contract.queueTransaction(contract.address, data, 0);
await tx.wait();
}
  
      toast.success('Settings updated successfully!');
      fetchTokenBalances(selectedVault);
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
        console.log(ethers.parseUnits(amount, await token.decimals()));
        const tx = await contract.withdrawToken(userAddress, tokenAddress, ethers.parseUnits(amount.toString(), await token.decimals()));
        await tx.wait();
      }
      toast.success('Token withdrawn successfully!');
      fetchTokenBalances(selectedVault);
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
      console.log(nft);
      const data = abi.encodeFunctionData("transferFrom", [selectedVault, userAddress, nft.tokenId]);
      const tx = await contract.queueTransaction(nft.contract.address, data, 0);
      await tx.wait();
      toast.success('NFT withdrawal queued successfully!');
      fetchTokenBalances(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to withdraw NFT.');
    }
  };

  const handleTabChange = (tab) => {
    setCurrentTab(tab);
  };

  const handleDepositModalToggle = () => {
    setIsDepositModalOpen(!isDepositModalOpen);
  };

  const handleLimitModalToggle = () => {
    setIsLimitModalOpen(!isLimitModalOpen);
  };

  const handleCreateInfoModalToggle = () => { // New function for toggling the info modal
    setIsCreateInfoModalOpen(!isCreateInfoModalOpen);
  };

  const handleVaultChange = (e) => {
    setSelectedVault(e.target.value);
  };

  const displayAssets = () => {
    return (
      <>
        {tokenBalances.map((asset, index) => (
          <div key={asset.symbol} className={`${bgColors[index % bgColors.length]} p-6 rounded-3xl flex flex-col items-center shadow-lg text-white relative`}>
            <div className="gear-icon text-lg" onClick={handleLimitModalToggle}>⚙️</div>
            <div className="flex items-center mb-2">
              <img src={asset.logo?asset.logo : tokenLogos[asset.address.toLowerCase()] ? tokenLogos[asset.address.toLowerCase()] : 'https://cryptologos.cc/logos/ethereum-eth-logo.png'} alt={`${asset.symbol} logo`} className="w-8 h-8 mr-2" />
              <div className="text-2xl font-bold">{asset.symbol}</div>
            </div>
            <div className="text-lg mb-2">Balance: {convert(asset.balance).toString().substring(0,12)}</div>
            <div className="text-lg mb-2">Limit: {convert(asset.limit).toString().substring(0,12)}</div>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
              <div className="bg-blue-300 h-4 rounded-full" style={{ width: `${asset.limit/asset.dailyLimit*100 }%` }}></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 space-x-4 mt-4 w-full sm:grid-cols-5 space-y-2 sm:space-y-0">
              <input id={`amount-${asset.symbol}`} style={{ position: 'relative', right: window.innerWidth < 1500 && window.innerWidth > 800 ? '10px' : '' }} className="rounded-full text-center text-gray-800 flex-1 p-2" placeholder='amount' />
              <button style={{ position: 'relative', right: window.innerWidth < 1500 && window.innerWidth > 800 ? '20px' : '' }} className="sm:w-24 bg-white text-blue-500 font-semibold py-2 px-4 rounded-full hover:bg-gray-200 transition duration-300 ease-in-out flex-1 relative right-2 sm:right-0" onClick={() => handleDepositToken(asset.address, document.getElementById(`amount-${asset.symbol}`).value)}>Deposit</button>
              <button className="sm:w-28 sm:left-8 bg-white text-blue-500 font-semibold py-2 px-4 rounded-full hover:bg-gray-200 transition duration-300 ease-in-out flex-1  relative right-2 sm:right-0" onClick={() => handleWithdrawToken(asset.address, document.getElementById(`amount-${asset.symbol}`).value)}>Withdraw</button>
            </div>
          </div>
        ))}
        {nftAssets.map((nft, index) => (
          <div key={nft.tokenId} className={`${bgColors[index % bgColors.length]} p-6 rounded-3xl flex flex-col items-center shadow-lg text-white relative`} style={{ backgroundImage: `url(${nft.imageUrl})`, backgroundSize: 'cover', minHeight: '250px' }}>
            <div className="gear-icon text-lg" onClick={handleLimitModalToggle}>⚙️</div>
            <div className="flex items-center mb-2">
              <img src={nft.imageUrl} alt={`${nft.title} logo`} className="w-8 h-8 mr-2" />
              <div style={{ backgroundColor: '#f9a8d4bf' }} className="text-2xl font-bold  rounded-full px-2">{nft.name} #{nft.tokenId}</div>
            </div>  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">

              <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-full hover:bg-gray-200 transition duration-300 ease-in-out mt-4  bottom-4" onClick={() => handleWithdrawNft(nft)}>Withdraw</button>
            </div>
          </div>
        ))}
      </>
    );
  };

  const displayTransactions = () => {
    return queuedTransactions.map((transaction) => (
      <div key={transaction.id} style={{ borderRadius: screen.availWidth < 1000 ? '20px' : '' }} className="grid grid-cols-1 sm:grid-cols-5 text-center bg-pink-100 rounded-full p-4 mb-4 shadow-lg transition-transform transform hover:scale-105">
        <div className="flex items-center justify-center sm:justify-left space-x-4 mb-2 sm:mb-0 lg:relative lg:right-20" style={{ right: window.innerWidth < 1500 ? '40px' : '' }}>
          <div className={`${transaction.executed ? 'bg-blue-200' : 'bg-red-200'} text-${transaction.executed ? 'blue' : 'red'}-800 text-lg rounded-full p-2 relative sm:right-4`}>
            {transaction.to !== selectedVault ?
              <img className="h-6 w-6" src={tokenLogos[transaction.to.toLowerCase()] ? tokenLogos[transaction.to.toLowerCase()] : 'https://cryptologos.cc/logos/ethereum-eth-logo.png'} />
              : '⚙️'}
          </div>
          <div className="text-gray-700 font-semibold">{transaction.id}</div>
        </div><a href={'https://etherscan.io/address/' + transaction.to}>
          <div className="text-pink-500 font-semibold text-left text-center relative lg:right-20 lg:top-2" style={{ top: window.innerWidth < 1000 && window.innerWidth > 600 ? '40px' : '' }}>{window.innerWidth < 1500 ? transaction.to.slice(0, 10) + '...' + transaction.to.slice(30, 40) : transaction.to}</div></a>
        <div className="text-gray-600 font-semibold relative lg:top-2">{transaction.amount}</div>
        <div className="text-gray-600 relative lg:top-2">{new Date(transaction.timestamp * 1000).toLocaleString()}</div>
        <div className="flex flex-col items-center relative lg:top-2">
          <div className={`${transaction.executed ? 'text-green-600' : 'text-yellow-600'} font-bold mb-2`}>{transaction.executed ? 'Completed' : 'Pending'} {!transaction.executed && (
            <button className="bg-red-500 text-white font-semibold py-1 px-3 rounded-full hover:bg-orange-600 transition duration-300 ease-in-out ml-2" onClick={() => handleConfirmTransaction(transaction.id)}>Sign {transaction.numConfirmations}/{transaction.threshold}</button>
          )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-blue-300 to-green-300 text-gray-800">
      <Toaster />
      <main className="container mx-auto py-8 px-4 sm:px-8">
        <Header />
        <section id="vault-management" className="bg-white p-8 rounded-3xl shadow-2xl mb-8 lg:w-1/2 mx-auto">
          <TabSwitcher activeTab={currentTab} onTabChange={handleTabChange} />
          {currentTab === 'open' && <>
            <OpenVaultSection />
            <div className="mt-2">
              <label htmlFor="vault-select" className="block mb-2 font-semibold text-gray-600">My Vaults:</label>
              <select id="vault-select" className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" onChange={handleVaultChange} value={selectedVault}>
                {vaults.map(vault => (
                  <option key={vault} value={vault}>{vault}</option>
                ))}
              </select>
            </div>
          </>}
          {currentTab === 'create' && <CreateVaultSection />}
          {currentTab === 'settings' && <SettingsSection />}
          <div className="relative top-4">
            <ConnectButton />
          </div>
        </section>
        <h1 className='text-4xl text-center text-white font-bold mb-8'>{vaultSettings.name}</h1>
        <section id="vault-assets" className="bg-white p-8 rounded-3xl shadow-2xl mb-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl text-pink-500 font-bold">Assets in Vault</h2>
            <button className="bg-pink-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-pink-600 transition duration-300 ease-in-out" onClick={handleDepositModalToggle}>Deposit New Token</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8" id="asset-list">
            {displayAssets()}
          </div>
        </section>
        <section id="allowance-list" className="mt-8">
          <div className="bg-white p-8 rounded-3xl shadow-2xl overflow-x-auto">
            <h2 className="text-xl text-pink-600 font-bold mb-4">Vault Transactions</h2>
            <div className="grid grid-cols-5 text-center font-semibold text-gray-600 mb-4">
              <div>Transaction ID</div>
              <div>To</div>
              <div>Amount</div>
              <div>Date</div>
              <div>Status</div>
            </div>
            <div id="transaction-list" className="space-y-4">
              {displayTransactions()}
            </div>
          </div>
        </section>
      </main>
      {isDepositModalOpen && <DepositModal handleClose={handleDepositModalToggle} handleDepositToken={handleDepositToken} />}
      {isLimitModalOpen && <LimitModal handleClose={handleLimitModalToggle} />}
      {isCreateInfoModalOpen && <CreateInfoModal handleClose={handleCreateInfoModalToggle} />}
    </div>
  );

  function Header() {
    return (
      <h1 className="text-center text-4xl mb-8 relative text-white font-extrabold">Welcome to Vault</h1>
    );
  }

  function TabSwitcher({ activeTab, onTabChange }) {
    return (
      <div className="tab-switcher mb-4 flex justify-center space-x-4">
        <div className={`tab ${activeTab === 'open' ? 'tab-active' : ''}`} onClick={() => onTabChange('open')}>Open</div>
        <div className={`tab ${activeTab === 'create' ? 'tab-active' : ''}`} onClick={() => onTabChange('create')}>Create</div>
        <div className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`} onClick={() => onTabChange('settings')}>Settings</div>
      </div>
    );
  }

  function OpenVaultSection() {
    return (
      <div className="space-y-6">
        <div>
          <label htmlFor="vault-search" className="block mb-2 font-semibold text-gray-600">Search Vault:</label>
          <input type="text" id="vault-search" name="vault-search" className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" placeholder="Enter vault name to search" />
        </div>
        <button className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out" onClick={() => handleSearch(document.getElementById('vault-search').value)}>Search</button>
      </div>
    );
  }

  function CreateVaultSection() {
    return (
      <div className="space-y-6 relative">
        <div>
          <label htmlFor="vault-name" className="block mb-2 font-semibold text-gray-600">Vault Name:</label><button className="absolute font-semibold w-6 h-6 right-0 rounded-full border border-pink-500 top-0 text-pink-500 cursor-pointer" onClick={handleCreateInfoModalToggle}>
            ?
          </button>
          <div className="flex items-center">
            <input type="text" id="vault-name" name="vault-name" required className="w-full p-3 bg-pink-100 border-none rounded-l-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" placeholder="Enter vault name" />
            <span className="bg-pink-100 p-3 rounded-r-full text-gray-600">.vault.eth</span>
          </div>
        </div>

        <div>
          <label htmlFor="recovery" className="block mb-2 font-semibold text-gray-600">Recovery Address:</label>
          <input type="text" id="recovery" name="recovery" placeholder="Enter address. This address is for backup and should be a cold wallet, has full control." required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
        </div>
        <div>
          <label htmlFor="custom-whitelist" className="block mb-2 font-semibold text-gray-600">Custom Whitelist Addresses:</label>
          <input type="text" id="custom-whitelist" name="custom-whitelist" placeholder="Enter addresses separated by commas" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
        </div>
        <div>
          <label htmlFor="transaction-delay" className="block mb-2 font-semibold text-gray-600">Safety Delay (in days):</label>
          <input type="number" id="transaction-delay" name="transaction-delay" step="1" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
        </div>
        <div>
          <label htmlFor="threshold" className="block mb-2 font-semibold text-gray-600">Threshold:</label>
          <input type="number" id="threshold" name="threshold" step="1" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" placeholder='Signers needed to confirm txs' />
        </div>
        <div>
          <label htmlFor="custom-limits" className="block mb-2 font-semibold text-gray-600">Limit per day of an asset (%):</label>
          <input type="number" id="custom-limits" name="custom-limits" step="1" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
        </div>
        <button className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out" onClick={() => createVault(document.getElementById('vault-name').value, document.getElementById('recovery').value, document.getElementById('custom-whitelist').value.split(','), document.getElementById('custom-limits').value, document.getElementById('threshold').value, document.getElementById('transaction-delay').value)}>Create Vault</button>
      </div>
    );
  }

  function SettingsSection() {
    return (
      <div className="space-y-6">
        <h1 className='text-pink-600 text-center text-lg font-semibold'>Info</h1>

        <div>
          <label htmlFor="vault-name" className="block mb-2 font-semibold text-gray-600">Owner Address:</label>
          <p className="text-gray-600 bg-pink-100 rounded-3xl text-center overflow-hidden">{vaultSettings.owner}</p>
        </div>
        <div>
          <label htmlFor="vault-name" className="block mb-2 font-semibold text-gray-600">Recovery Address:</label>
          <p className="text-gray-600 bg-pink-100 rounded-3xl text-center overflow-hidden">{vaultSettings.recoveryAddress}</p>
        </div>
        <div className="space-x-6 col-3 flex items-center justify-center ">

          <div>
            <label htmlFor="daily-limit" className="block mb-2 font-semibold text-gray-600">Daily Limit:</label>
            <p className="text-gray-600 text-center bg-pink-100 rounded-3xl">{vaultSettings.dailyLimit}%</p>
          </div>
          <div>
            <label htmlFor="threshold" className="block mb-2 font-semibold text-gray-600">Threshold:</label>
            <p className="text-gray-600  text-center bg-pink-100 rounded-3xl">{vaultSettings.threshold}</p>
          </div>
          <div>
            <label htmlFor="delay" className="block mb-2 font-semibold text-gray-600">Delay:</label>
            <p className="text-gray-600 w-40 text-center bg-pink-100 rounded-3xl">D:{(vaultSettings.delay / 84000).toFixed(0)} H:{(vaultSettings.delay % 84000 / 3600).toFixed(0)} M:{(vaultSettings.delay % 3600 / 60).toFixed(0)} S:{(vaultSettings.delay % 60).toFixed(0)}</p>
          </div>          </div>
        <div>
          <label htmlFor="whitelisted-addresses" className="block mb-2 font-semibold text-gray-600">Whitelisted Addresses:</label>
        </div>    {vaultSettings.whitelistedAddresses && vaultSettings.whitelistedAddresses.length > 0 ? (
          vaultSettings.whitelistedAddresses.map((address, index) => (
            <p key={index} className="text-gray-600 text-center bg-pink-100 rounded-3xl m-0 overflow-hidden">{address}</p>
          ))
        ) : (
          <p className="text-gray-600">No whitelisted addresses found.</p>
        )}
        <h1 className='text-pink-600 text-center text-lg m-2 font-semibold'>Update</h1>
        <div className='flex items-center justify-center col-3 space-x-4'>
          <div>
            <label htmlFor="withdraw-limit" className="block mb-2 font-semibold text-gray-600">Limit Per Day of An Asset (%):</label>
            <input type="number" id="withdraw-limit" name="withdraw-limit" step="0.01" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
          </div>
          <div>
            <label htmlFor="threshold" className="block mb-2 font-semibold text-gray-600">Threshold:</label>
            <input type="number" id="threshold" name="threshold" step="1" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
          </div>
          <div>
            <label htmlFor="delay" className="block mb-2 font-semibold text-gray-600">Delay:</label>
            <input type="number" id="delay" name="delay" step="1" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
          </div>
        </div>
        <div>
          <label htmlFor="recovery-addresses" className="block mb-2 font-semibold text-gray-600">Recovery Addresses:</label>
          <input type="text" id="recovery-addresses" name="recovery-addresses" placeholder="Enter recovery addresses separated by commas" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
        </div>
        <div>
          <label htmlFor="whitelisted-addresses" className="block mb-2 font-semibold text-gray-600">Whitelisted Addresses:</label>
          <input type="text" id="whitelisted-addresses" name="whitelisted-addresses" placeholder="Enter whitelisted addresses separated by commas" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
        </div>
        <button className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out" onClick={() => updateSettings(document.getElementById('recovery-addresses').value, document.getElementById('whitelisted-addresses').value.split(','), document.getElementById('withdraw-limit').value, document.getElementById('threshold').value, document.getElementById('delay').value)}>Save Settings</button>
      </div>
    );
  }

  function DepositModal({ handleClose, handleDepositToken }) {
    const [selectedToken, setSelectedToken] = useState('');
    const [amount, setAmount] = useState('');

    const handleTokenChange = (e) => {
      setSelectedToken(e.target.value);
    };

    const handleAmountChange = (e) => {
      setAmount(e.target.value);
    };

    const handleDeposit = () => {
      handleDepositToken(selectedToken, amount);
      handleClose();
    };

    return (
      <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleClose}>
        <div className="modal-content bg-white p-8 rounded-3xl shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
          <span className="close cursor-pointer text-gray-600 text-2xl absolute top-4 right-4" onClick={handleClose}>&times;</span>
          <section id="deposit-tokens">
            <div className="text-center mb-8">
              <h2 className="text-2xl text-pink-500 font-bold">Deposit Tokens</h2>
            </div>
            <div className="space-y-6">
              <div>
                <label htmlFor="token" className="block mb-2 font-semibold text-gray-600">Token Address:</label>
                <select id="token" name="token" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" onChange={(e) => setSelectedToken(e.target.value)}>
                  <option value="">Select a token</option>
                  <option value="0x0000000000000000000000000000000000000000">ETH</option>
                  <option value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</option>
                  <option value="0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5">PR0</option>
                  <option value="custom">Custom</option>
                </select>
                {selectedToken === 'custom' &&
                  <input type="text" id="customToken" name="customToken" className="w-full p-3 mt-2 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" placeholder="Enter custom token address" onChange={(e) => { setSelectedToken(e.target.value); toast.success('Token set') }} />}
              </div>
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label htmlFor="amount" className="block mb-2 font-semibold text-gray-600">Amount:</label>
                  <input type="number" id="amount" name="amount" step="0.01" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" onChange={handleAmountChange} />
                </div>
              </div>
              <button className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out" onClick={handleDeposit}>Deposit Tokens</button>
            </div>
          </section>
        </div>
      </div>
    );
  }

  function LimitModal({ handleClose }) {
    return (
      <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleClose}>
        <div className="modal-content bg-white p-8 rounded-3xl shadow-2xl relative" onClick={e => e.stopPropagation()}>
          <span className="close cursor-pointer text-gray-600 text-2xl absolute top-4 right-4" onClick={handleClose}>&times;</span>
          <section id="limit-settings">
            <div className="text-center mb-8">
              <h2 className="text-2xl text-pink-500 font-bold">Set Token Limits</h2>
            </div>
            <div className="tab-switcher mb-4 flex justify-center space-x-4">
              <div className={`tab px-4 py-2 rounded-full cursor-pointer ${limitSection === 'fixed' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'}`} onClick={() => setLimitSection('fixed')}>Fixed Limit</div>
              <div className={`tab px-4 py-2 rounded-full cursor-pointer ${limitSection === 'percentage' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'}`} onClick={() => setLimitSection('percentage')}>Percentage Limit (%)</div>
              <div className={`tab px-4 py-2 rounded-full cursor-pointer ${limitSection === 'no-limit' ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'}`} onClick={() => setLimitSection('no-limit')}>No Specific Limit</div>
            </div>
            {limitSection === 'fixed' && (
              <div id="fixed-limit-section" className="space-y-6">
                <div>
                  <label htmlFor="fixed-limit" className="block mb-2 font-semibold text-gray-600">Fixed Limit:</label>
                  <input type="number" id="fixed-limit" name="fixed-limit" step="0.01" className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
                </div>
              </div>
            )}
            {limitSection === 'percentage' && (
              <div id="percentage-limit-section" className="space-y-6">
                <div>
                  <label htmlFor="percentage-limit" className="block mb-2 font-semibold text-gray-600">Percentage Limit (%):</label>
                  <input type="number" id="percentage-limit" name="percentage-limit" step="0.01" className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
                </div>
              </div>
            )}
            {limitSection === 'no-limit' && (
              <div id="no-limit-section" className="space-y-6">
                <div className="text-center text-gray-600 font-semibold">No limit set for this token.</div>
              </div>
            )}
            <button className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out mt-2" onClick={() => alert('Token limits set successfully!')}>Set Limits</button>
          </section>
        </div>
      </div>
    );
  }

  function CreateInfoModal({ handleClose }) { // New component for the info modal
    return (
      <div className="modal fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleClose}>
        <div className="modal-content bg-white p-8 rounded-3xl shadow-2xl relative sm:w-1/2 m-auto relative max-h-screen overflow-y-auto" onClick={e => e.stopPropagation()}>
          <span className="close cursor-pointer text-gray-600 text-2xl absolute top-4 right-4" onClick={handleClose}>&times;</span>
          <section id="create-info">
            <div className="text-center mb-8">
              <h2 className="text-2xl text-pink-500 font-bold">Creating a Vault</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-600">What is a Vault?</h3>
                <p className="text-gray-600">A Vault is a secure smart contract that allows users to deposit tokens and NFTs, set limits, whitelist addresses, and require multiple signers for transactions. It is designed to enhance the security and management of digital assets.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Vault Name</h3>
                <p className="text-gray-600">The unique name for your vault on this specific chain. It will be associated with a .vault.eth domain if one is free but should not be relied on.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Recovery Address</h3>
                <p className="text-gray-600">An address used for recovering access to the vault. It should be a secure, cold wallet address.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Whitelist Addresses</h3>
                <p className="text-gray-600">Addresses that are allowed to interact with the vault as signers. These confirm transactions using your chosen threshold. Separate multiple addresses with commas.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Safety Delay</h3>
                <p className="text-gray-600">A delay period in days to provide an extra layer of security for transactions that are not simple limit withdrawals. After the delay you can self approve txs without signers. Leave at 0 to require signers.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Threshold</h3>
                <p className="text-gray-600">The number of signers required to confirm a transaction.</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-600">Daily Limit</h3>
                <p className="text-gray-600">The maximum percentage of an asset that can be withdrawn from the vault daily.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
};

export default App;
