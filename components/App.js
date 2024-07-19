import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { useEthersProvider, useEthersSigner } from './tl';
import { Alchemy, Network } from 'alchemy-sdk';

const alchemyConfig = {
  apiKey: 'Z-ifXLmZ9T3-nfXiA0B8wp5ZUPXTkWlg', // Replace with your Alchemy API key
  network: Network.BASE_MAINNET,
};
const alchemy = new Alchemy(alchemyConfig);

const defaultVaultAddress = '0xC808010a3f2c5962991F08719EDdf75261AC6aAF'; // Replace with your Vault contract address

// Define the Vault contract ABI
const vaultAbi = [
  "event TokenDeposited(address indexed token, uint256 amount, address indexed depositor)",
  "event TokenWithdrawn(address indexed token, uint256 amount)",
  "event NftDeposited(address indexed token, uint256 indexed tokenId, address indexed depositor)",
  "event NftWithdrawn(address indexed token, uint256 indexed tokenId)",
  "function depositToken(address token, uint256 amount) external payable",
  "function depositNft(address token, uint256 tokenId) external",
  "function withdrawToken(address to, address token, uint256 amount) external",
  "function withdrawNft(address to, address token, uint256 tokenId) external",
  "function getLimit(address to, address token, uint256 amount) external view returns(uint)",
  "function updateRecoveryAddress(address newRecoveryAddress) external",
  "function updateWhitelistAddresses(address[] memory newWhitelistedAddresses) external",
  "function updateDailyLimit(uint256 newDailyLimit) external",
  "function updateThreshold(uint256 newThreshold) external",
  "function updateDelay(uint256 newDelay) external",
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
const factoryAddress = '0xc6251a80dBCa419Bf54768587b32CFf3FBfb58Ee'; // Replace with your VaultFactory contract address

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
  const [loading, setLoading] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [queuedTransactions, setQueuedTransactions] = useState([]);
  const [vaultSettings, setVaultSettings] = useState({});
  const [vaults, setVaults] = useState([]);
  const [selectedVault, setSelectedVault] = useState('');
  const [limitSection, setLimitSection] = useState('fixed');
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

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
      const balances = await alchemy.core.getTokenBalances(vault);
      const nonZeroBalances = balances.tokenBalances.filter(token => token.tokenBalance !== "0");

      const tokenDetails = await Promise.all(nonZeroBalances.map(async token => {
        const balance = token.tokenBalance;
        const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
        const adjustedBalance = balance / Math.pow(10, metadata.decimals);
        const contract = new ethers.Contract(vault, vaultAbi, provider);
        const tokenLimit = await contract.getLimit(userAddress, token.contractAddress, balance);
        const baseLimit = await contract.dailyLimit();
        const limit = Number(tokenLimit.fixedLimit > 0 ? tokenLimit.fixedLimit : tokenLimit.percentageLimit > 0 ? tokenLimit.percentageLimit * Number(balance) / 100 : tokenLimit.useBaseLimit == 1 ? '0' : tokenLimit.useBaseLimit == 2 ? adjustedBalance.toFixed(2) : adjustedBalance * Number(baseLimit) / 100);
        return {
          ...metadata,
          balance: adjustedBalance.toFixed(2),
          address: token.contractAddress,
          limit: limit
        };
      }));

      setTokenBalances(tokenDetails);
      const contract = new ethers.Contract(vault, vaultAbi, provider);
      const name = await contract.name();
      const recoveryAddress = await contract.recoveryAddress();
      const dailyLimit = Number(await contract.dailyLimit());
      const threshold = Number(await contract.threshold());
      const delay = Number(await contract.delay());
      let whitelistedAddresses = []
      let i = 0;
      while (true) {
        try {
          const address = await contract.whitelistedAddresses(i);
          whitelistedAddresses.push(address);
          console.log(address)
          i++;
          if (address === ethers.constants.AddressZero) {
            break;
          }
        }
        catch (error) {
          break;
        }
      }
      console.log(recoveryAddress, dailyLimit, threshold, delay, whitelistedAddresses)
      setVaultSettings({ name, recoveryAddress, dailyLimit, threshold, delay, whitelistedAddresses });
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch token balances.');
    } finally {
      setLoading(false);
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
      const token = new ethers.Contract(tokenAddress, ['function approve(address spender, uint256 amount)', 'function allowance(address owner, address spender) view returns (uint256)', 'function decimals() view returns (uint8)'], signer);
      const allowance = await token.allowance(userAddress, selectedVault);
      if (allowance < ethers.parseUnits(amount.toString(), await token.decimals())) {
        const approveTx = await token.approve(selectedVault, ethers.parseUnits('1000000000000000000', await token.decimals()));
        await approveTx.wait();
      }
      const tx = await contract.depositToken(tokenAddress, ethers.parseUnits(amount.toString(), await token.decimals()));
      await tx.wait();
      toast.success('Token deposited successfully!');
      fetchTokenBalances(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to deposit token.');
    }
  };

  const handleSearch = async (vaultName) => {
    console.log(vaultName)
    try {
      const factory = new ethers.Contract(factoryAddress, factoryAbi, provider);
      const vaultAddress = await factory.vaultNames(vaultName);
      if (vaultAddress === ethers.AddressZero) {
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
      if (!whitelistedAddresses||recoveryAddress===''||dailyLimit===''||threshold===''||delay==='') {
toast.error('Please fill all fields.');   }
      const tx = await contract.createVault(name, recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay*84000);
      await tx.wait();
      toast.success('Vault created successfully!');
      fetchVaults();
    } catch (error) {
      console.error(error);
      toast.error('Failed to create vault.');
    }
  };

  const updateSettings = async (recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay, tokens, fixedLimits, percentageLimits, useBaseLimits) => {
    try {
      console.log(recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay, tokens, fixedLimits, percentageLimits, useBaseLimits)
      const contract = new ethers.Contract(selectedVault, vaultAbi, signer);
      !whitelistedAddresses ? whitelistedAddresses = [] : whitelistedAddresses;
      !tokens ? tokens = [] : tokens;
      !fixedLimits ? fixedLimits = [] : fixedLimits;
      !percentageLimits ? percentageLimits = [] : percentageLimits;
      !useBaseLimits ? useBaseLimits = [] : useBaseLimits;
      const tx = await contract.updateSettings(recoveryAddress, whitelistedAddresses, dailyLimit, threshold, delay, tokens, fixedLimits, percentageLimits, useBaseLimits);
      await tx.wait();
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
      const token = new ethers.Contract(tokenAddress, ['function decimals() view returns (uint8)'], signer);
      const tx = await contract.withdrawToken(userAddress, tokenAddress, ethers.parseUnits(amount.toString(), await token.decimals()));
      await tx.wait();
      toast.success('Token withdrawn successfully!');
      fetchTokenBalances(selectedVault);
    } catch (error) {
      console.error(error);
      toast.error('Failed to withdraw token.');
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

  const handleVaultChange = (e) => {
    setSelectedVault(e.target.value);
  };

  const displayAssets = () => {
    return tokenBalances.map((asset, index) => (
      <div key={asset.symbol} className={`${bgColors[index % bgColors.length]} p-6 rounded-3xl flex flex-col items-center shadow-lg text-white relative`}>
        <div className="gear-icon text-lg" onClick={handleLimitModalToggle}>⚙️</div>
        <div className="flex items-center mb-2">
          <img src={asset.logo || tokenLogos[asset.address.toLowerCase()] ? tokenLogos[asset.address.toLowerCase()] : 'https://cryptologos.cc/logos/ethereum-eth-logo.png'} alt={`${asset.symbol} logo`} className="w-8 h-8 mr-2" />
          <div className="text-2xl font-bold">{asset.symbol}</div>
        </div>
        <div className="text-lg mb-2">Balance: {asset.balance}</div>
        <div className="text-lg mb-2">Limit: {asset.limit}</div>
        <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
          <div className="bg-blue-300 h-4 rounded-full" style={{ width: '100%' }}></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 space-x-4 mt-4 w-full sm:grid-cols-5 space-y-2 sm:space-y-0">
          <input id={`amount-${asset.symbol}`} className="rounded-full text-center text-gray-800 flex-1 p-2" placeholder='amount' />
          <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-full hover:bg-gray-200 transition duration-300 ease-in-out flex-1 relative right-2 sm:right-0" onClick={() => handleDepositToken(asset.address, document.getElementById(`amount-${asset.symbol}`).value)}>Deposit</button>
          <button className="bg-white text-blue-500 font-semibold py-2 px-4 rounded-full hover:bg-gray-200 transition duration-300 ease-in-out flex-1  relative right-2 sm:right-0" onClick={() => handleWithdrawToken(asset.address, document.getElementById(`amount-${asset.symbol}`).value)}>Withdraw</button>
        </div>
      </div>
    ));
  };
  const displayTransactions = () => {
    return queuedTransactions.map((transaction) => (
      <div key={transaction.id} style={{borderRadius:screen.availHeight<1000?'20px':''}} className="grid grid-cols-1 sm:grid-cols-5 text-center bg-pink-100 rounded-full p-4 mb-4 shadow-lg transition-transform transform hover:scale-105">
        <div className="flex items-center justify-center sm:justify-left space-x-4 mb-2 sm:mb-0 lg:relative lg:right-20">
          <div className={`${transaction.executed ? 'bg-blue-200' : 'bg-red-200'} text-${transaction.executed ? 'blue' : 'red'}-800 text-lg rounded-full p-2`}>
            {transaction.to !== selectedVault ?
              <img className="h-6 w-6" src={tokenLogos[transaction.to.toLowerCase()] ? tokenLogos[transaction.to.toLowerCase()] : 'https://cryptologos.cc/logos/ethereum-eth-logo.png'} />
              : '⚙️'}
          </div>
          <div className="text-gray-700 font-semibold">{transaction.id}</div>
        </div>
        <div className="text-pink-500 font-semibold text-left text-center relative lg:right-20 lg:top-2">{screen.availWidth<1000?transaction.to.slice(0,10)+'...'+transaction.to.slice(30,40):transaction.to}</div>
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
      <ConnectButton/>
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
      <div className="space-y-6">
        <div>
          <label htmlFor="vault-name" className="block mb-2 font-semibold text-gray-600">Vault Name:</label>
          <div className="flex items-center">
            <input type="text" id="vault-name" name="vault-name" required className="w-full p-3 bg-pink-100 border-none rounded-l-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" placeholder="Enter vault name" />
            <span className="bg-pink-100 p-3 rounded-r-full text-gray-600">.eth</span>
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
          <input type="number" id="custom-limits" name="custom-limits" step="0.01" required className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" />
        </div>
        <button className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out" onClick={() => createVault(document.getElementById('vault-name').value, document.getElementById('recovery').value, document.getElementById('custom-whitelist').value.split(','), document.getElementById('custom-limits').value, document.getElementById('transaction-delay').value, document.getElementById('transaction-delay').value)}>Create Vault</button>
      </div>
    );
  }

  function SettingsSection() {
    return (
      <div className="space-y-6">
        <h1 className='text-pink-600 text-center text-lg font-semibold'>Info</h1>

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
                  {1 == 2 && <option value="0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5">PR0</option>}
                  <option value="0x4200000000000000000000000000000000000006">wETH</option>
                  <option value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</option>
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

};

export default App;
