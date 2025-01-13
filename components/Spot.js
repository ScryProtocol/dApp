import React, { useState, useEffect } from 'react'; 
import { ethers } from 'ethers';
const FormData = require('form-data');
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { chainId } from 'wagmi'; 
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useEnsName, useChainId } from 'wagmi';
import {
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Typography,
  ListItem,
  ListItemAvatar,
  Avatar,
  IconButton,
  Paper,
  ListItemText
} from '@mui/material';

// Example placeholder token address for “no token” fallback
const tokenaddress = '0x0000000000000000000000000000000000000000';

let signer;
let provider;

/**
 * Replace with your new contract address & updated ABI.
 */
const ContractAddress = '0x1faa3b933df705ee40490316220b60febfdb1ac9';

// NEW Contract ABI (with getSpotInfo, interestRate, etc.)
const ContractABI = [
  'constructor(address payable feeAddrs)',
  'function allowBorrow(address token, address friend, uint256 amount, uint256 interestRate)',
  'function borrow(address token, address lender, uint256 amount)',
  'function repay(address token, address lender, uint256 amount)',
  'function setFee(uint256 newFee)',
  'function setFeeAddress(address newFeeAddress)',

  // The important function we’re using now
  'function getSpotInfo(bytes32 hash) view returns (address, address, address, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, string, string)',

  'function viewLenderAllowances(address lender) view returns (bytes32[])',
  'function viewFriendAllowances(address friend) view returns (bytes32[])',
  'function borrowDetails(bytes32) view returns (address, address, address, uint256, uint256, uint256, uint256)',
  'function borrowDetailsByLender(address) view returns (bytes32[])',
  'function borrowDetailsByFriend(address) view returns (bytes32[])',
  'function feeAddress() view returns (address)',
  'function fee() view returns (uint256)',
];

// Standard ERC20 ABI
const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function transfer(address, uint) returns (bool)',
  'function approve(address, uint) returns (bool)',
  'function allowance(address, address) view returns (uint)'
];

const Spot = () => {
  // Wagmi
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const chainIdNow = useChainId();
  const { address: userAddress } = useAccount();

  provider = ethersProvider;
  signer = ethersSigner;

  // UI state
  const [initialized, setInitialized] = useState(false);
  const [allowances, setAllowances] = useState([]);
  const [borrows, setBorrows] = useState([]);

  // For creating or updating allowances
  const [friend, setFriend] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [stoken, setToken] = useState(null);

  // A small address->name map for token addresses & ENS
  const [maps, setMaps] = useState({
    '0x94373a4919B3240D86eA41593D5eBa789FEF3848': 'wETH',
    '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5': 'PR0',
    '0x0987654321098765432109876543210987654321': 'USDC',
  });

  const contract = new ethers.Contract(ContractAddress, ContractABI, provider);

  // Helper to add new name->address mapping
  const addMapping = (address, name) => {
    setMaps((prev) => ({
      ...prev,
      [address.toLowerCase()]: name
    }));
  };

  // Very simple function to display known addresses or fallback
  const map = (addr) => {
    addr = addr.toLowerCase();
    if (maps[addr]) return maps[addr];
    return addr;
  };

  // For re-initializing data
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchData();
    }
  }, [initialized, userAddress, contract]);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        setInitialized(false);
      });
    }
  }, []);

  // Main data fetch
  const fetchData = async () => {
    await fetchLenderAllowances();
    await fetchFriendAllowances();
  };

  // Multicall
  const MULTICALL_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11';
  const MULTICALL_ABI = [
    'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
  ];
  
  // -----------------------------
  // Fetch LENDER allowances
  // -----------------------------
  const fetchLenderAllowances = async () => {
    if (!contract || !userAddress) return;

    const lenderAllowances = await contract.viewLenderAllowances(userAddress);
    if (!lenderAllowances?.length) {
      setAllowances([]);
      return;
    }

    const multicallContract = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider);

    // Step 1: decode each allowance’s (lender, friend, token) from borrowDetails
    const calls = lenderAllowances.map((hash) => ({
      target: ContractAddress,
      callData: contract.interface.encodeFunctionData('getSpotInfo', [hash])
    }));
    const { returnData: spotData } = await multicallContract.aggregate(calls);

    // Decode each getSpotInfo result
    const spotResults = spotData.map((data) => {
      // getSpotInfo => (address lender, address friend, address token, uint256 totalBorrowed, uint256 outstanding, uint256 allowable, uint256 interestRate, uint256 fee, uint256 outstandingFee, uint256 interestRateFee)
      const decoded = contract.interface.decodeFunctionResult('getSpotInfo', data);
      const [
        lender,
        friend,
        token,
        totalBorrowed,
        outstanding,
        allowable,
        interestRate,
        fee,
        outstandingFee,
        interestRateFee,
        decimals,
        name,
        symbol
      ] = decoded;
      return {
        lender,
        friend,
        token,
        totalBorrowed,
        outstanding,
        allowable,
        interestRate,
        fee,
        outstandingFee,
        interestRateFee,
        decimals,
        name,
        symbol
      };
    });

    // Step 4: final UI array
    const finalAllowances = await Promise.all(
      spotResults.map(async (info, idx) => {
        const pr = new ethers.JsonRpcProvider('https://1rpc.io/eth');
        const getAddressENS = async (address) => {
          if (maps[address.toLowerCase()]) return maps[address.toLowerCase()];
          const ensName = await pr.lookupAddress(address);
          if (ensName) addMapping(address, ensName);
          return ensName || address;
        };

        const friendENS = await getAddressENS(info.friend);
let dec=info.decimals; 
        // Parse out the numeric fields
        return {
          lender: info.lender,
          friend: info.friend,
          friendENS,
          token: info.token,
          totalBorrowed: Number(ethers.formatUnits(info.totalBorrowed, dec)),
          outstanding: Number(ethers.formatUnits(info.outstanding, dec)),
          allowable: Number(ethers.formatUnits(info.allowable, dec)),
          interestRate: Number(info.interestRate),
          fee: Number(ethers.formatUnits(info.fee, dec)), 
          outstandingFee: Number(ethers.formatUnits(info.outstandingFee, dec)),
          interestRateFee: Number(ethers.formatUnits(info.interestRateFee, dec)),
          hash: lenderAllowances[idx],
          name: info.name,
          symbol: info.symbol
        };
      })
    );

    setAllowances(finalAllowances);
  };

  // -----------------------------
  // Fetch FRIEND allowances (where I am the borrower)
  // -----------------------------
  const fetchFriendAllowances = async () => {
    if (!contract || !userAddress) return;

    const friendAllowances = await contract.viewFriendAllowances(userAddress);
    if (!friendAllowances?.length) {
      setBorrows([]);
      return;
    }

    const multicallContract = new ethers.Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider);

    const calls = friendAllowances.map((hash) => ({
      target: ContractAddress,
      callData: contract.interface.encodeFunctionData('getSpotInfo', [hash])
    }));
    const { returnData: spotData } = await multicallContract.aggregate(calls);
    const spotResults = spotData.map((data) => {
      const decoded = contract.interface.decodeFunctionResult('getSpotInfo', data);
      const [
        lender,
        friend,
        token,
        totalBorrowed,
        outstanding,
        allowable,
        interestRate,
        fee,
        outstandingFee,
        interestRateFee,
        decimals,
        name,
        symbol
      ] = decoded;
      return {
        lender,
        friend,
        token,
        totalBorrowed,
        outstanding,
        allowable,
        interestRate,
        fee,
        outstandingFee,
        interestRateFee,
        decimals,
        name,
        symbol
      };
    })

    // Step 4: final UI array
    const finalBorrows = await Promise.all(
      spotResults.map(async (info, idx) => {
        const pr = new ethers.JsonRpcProvider('https://1rpc.io/eth');
        const getAddressENS = async (address) => {
          if (maps[address.toLowerCase()]) return maps[address.toLowerCase()];
          const ensName = await pr.lookupAddress(address);
          if (ensName) addMapping(address, ensName);
          return ensName || address;
        };
        const lenderENS = await getAddressENS(info.lender);
let dec=info.decimals;
        return {
          lender: info.lender,
          lenderENS,
          friend: info.friend,
          token: info.token,
          totalBorrowed: Number(ethers.formatUnits(info.totalBorrowed, dec)),
          outstanding: Number(ethers.formatUnits(info.outstanding, dec)),
          allowable: Number(ethers.formatUnits(info.allowable, dec)),
          interestRate: Number(info.interestRate),
          fee: Number(ethers.formatUnits(info.fee, dec)),
          outstandingFee: Number(ethers.formatUnits(info.outstandingFee, dec)),
          interestRateFee: Number(ethers.formatUnits(info.interestRateFee, dec)),
          hash: friendAllowances[idx],
          name: info.name,
          symbol: info.symbol
        };
      })
    );

    setBorrows(finalBorrows);
  };

  // --------------------------------
  // allowBorrow => sets allowance w/ interestRate
  // --------------------------------
  const requestBorrow = async (stoken, friend, amount) => {
    if (!signer) return;
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);

    try {
      let decimals = 18;
      // If not the dummy 0x000.. token
      if (ethers.isAddress(stoken) && stoken !== tokenaddress) {
        const tokenContract = new ethers.Contract(stoken, tokenABI, signer);
        decimals = await tokenContract.decimals();
      }
      const parsedAmount = ethers.parseUnits(amount || '0', decimals);

      // Approve if necessary
      if (ethers.isAddress(stoken) && stoken !== tokenaddress) {
        const tokenContract = new ethers.Contract(stoken, tokenABI, signer);
        const allowance = await tokenContract.allowance(userAddress, ContractAddress);
        if (allowance < parsedAmount) {
          const txApprove = await tokenContract.approve(ContractAddress, parsedAmount);
          await txApprove.wait();
        }
      }

      // Resolve ENS if needed
      if (!ethers.isAddress(friend)) {
        const pr = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
        const resolved = await pr.resolveName(friend);
        if (!resolved) {
          toast.error('ENS not found');
          return;
        }
        friend = resolved;
      }

      const interestRateBN = parseInt(interestRate, 10) || 0;
      const tx = await contractWithSigner.allowBorrow(stoken, friend, parsedAmount, interestRateBN);
      await tx.wait();

      toast.success('Allowance + interestRate set!');
      fetchLenderAllowances();
    } catch (error) {
      console.error('Error requesting borrow:', error);
      toast.error('Error requesting borrow');
    }
  };

  // --------------------------------
  // Borrow => friend calls this to actually pull tokens
  // --------------------------------
  const handleBorrow = async (tokenAddress, lender) => {
    if (!signer) return;
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);
    try {
      let decimals = 18;
      if (ethers.isAddress(tokenAddress) && tokenAddress !== tokenaddress) {
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
        decimals = await tokenContract.decimals();
      }
      const parsedAmount = ethers.parseUnits(amount || '0', decimals);

      const tx = await contractWithSigner.borrow(tokenAddress, lender, parsedAmount);
      await tx.wait();
      toast.success('Borrow successful');
      fetchFriendAllowances();
    } catch (error) {
      console.error('Error borrowing:', error);
      toast.error('Error borrowing');
    }
  };

  // --------------------------------
  // Repay => friend calls repay
  // --------------------------------
  const handleRepay = async (tokenAddress, lender) => {
    if (!signer) return;
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
    
    try {
      let decimals = 18;
      if (ethers.isAddress(tokenAddress) && tokenAddress !== tokenaddress) {
        decimals = await tokenContract.decimals();
      }
      const parsedAmount = ethers.parseUnits(amount || '0', decimals);

      // Approve the contract to spend your tokens
      const allowance = await tokenContract.allowance(userAddress, ContractAddress);
      if (allowance < parsedAmount) {
        const txApprove = await tokenContract.approve(ContractAddress, parsedAmount);
        await txApprove.wait();
      }

      const tx = await contractWithSigner.repay(tokenAddress, lender, parsedAmount);
      await tx.wait();
      toast.success('Repayment successful');
      fetchFriendAllowances();
    } catch (error) {
      console.error('Error repaying:', error);
      toast.error('Error repaying');
    }
  };

  // Example token lists by chain
  const tokenOptions = {
    1: [
      { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI' },
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC' },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT' },
      { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC' },
      { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
    ],
    10: [
      { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI' },
    ],
    8453: [
      { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC' },
    { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
    ],
    534352: [],
  };

  return (
    <div className="main-container font-sans">
      <div className="container lg:w-1/2">
        <h1 className="main-title">🍕 Spot a Friend 🚀</h1>
        <label className="subtitle">
          🌈 Allow friends to borrow tokens from your wallet, with optional interest!
        </label>

        <div>
          <Toaster />
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="token" className="form-label">🪙 Token Address:</label>
              <select
                id="token"
                name="token"
                value={stoken || ''}
                onChange={(e) => setToken(e.target.value)}
                required
                className="form-input"
              >
                <option value="">{stoken ? stoken : 'Select a token'}</option>
                {tokenOptions[chainIdNow]?.map((token) => (
                  <option key={token.address} value={token.address}>
                    {token.symbol}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>

              {stoken === 'custom' && (
                <input
                  type="text"
                  id="customToken"
                  name="customToken"
                  onChange={(e) => setToken(e.target.value)}
                  required
                  placeholder="Enter custom token address"
                  className="form-input"
                />
              )}
            </div>

            <div className="form-group">
              <label htmlFor="friend" className="form-label">👥 Borrower Address/ENS:</label>
              <input
                type="text"
                id="friend"
                name="friend"
                value={friend}
                onChange={(e) => setFriend(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="amount" className="form-label">💸 Loan Limit:</label>
              <input
                type="number"
                id="amount"
                name="amount"
                step="0.01"
                onChange={(e) => setAmount(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* NEW: Interest Rate Input */}
            <div className="form-group">
              <label htmlFor="interestRate" className="form-label">
                🏦 Interest Rate (e.g. 50 = 5%):
              </label>
              <input
                type="number"
                id="interestRate"
                name="interestRate"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                required
                className="form-input"
              />
            </div>

            <button
              onClick={() => requestBorrow(stoken, friend, amount)}
              className="submit-button"
            >
              Set Allowance
            </button>

            <div style={{ marginTop: '16px' }}>
              <ConnectButton style={{ margin: '10px' }} />
            </div>
          </div>
        </div>
      </div>

      {/* LENDER VIEW */}
      <div className="container lg:w-1/2" id="subscriptionsContainer">
        <h1 className="section-title">🤝 Allowances to Friends</h1>
        <div id="allowances">
          {Object.entries(
            allowances
              .filter((a) => a.lender.toLowerCase() === userAddress?.toLowerCase())
              .reduce((acc, a) => {
                if (!acc[a.friend]) acc[a.friend] = [];
                acc[a.friend].push(a);
                return acc;
              }, {})
          ).map(([friendAddr, friendAllowances]) => (
            <div key={friendAddr} className="subscription-item">
              <h3 className="subscription-title">
                {map(friendAddr).substring(0, 20)}{" "}
              </h3>
              <div className="token-grid">
                {friendAllowances.map((allowance) => (
                  <div key={allowance.hash} className="token-card">
                    <div className="allowance-item">
                      <p className="item-label">🪙 Token:</p>
                      <p className="token">
                        {allowance.symbol || allowance.token
                        }
                      </p>

                      <div className="item-row">
                        <div className="item-column">
                          <p className="item-label">🎯 Limit:</p>
                          <p className="item-value">{allowance.allowable}</p>
                        </div>
                        <div className="item-column">
                          <p className="item-label">💸 Owed:</p>
                          <p className="item-value">{allowance.outstandingFee}</p>
                        </div>
                      </div>

                      <p className="item-label">📊 Volume Borrowed:</p>
                      <p className="item-value">{allowance.totalBorrowed}</p>

                      <p className="item-label">🏦 Interest Rate:</p>
                      <p className="item-value">
                        <span className="item-label bg-gray-400 rounded-full p-1 text-white">
                        {(allowance.interestRate / 10).toFixed(2)}%
                        </span>
                        <span className="item-label bg-orange-300 rounded-full p-1 text-white ml-2">
                          Fee: {allowance.interestRateFee}
                        </span>
                      </p>

                      <div className="progress-bar">
                        <div
                          className="progress-bar-inner"
                          style={{
                            width: `${
                              allowance.allowable > 0
                                ? ((allowance.outstanding / allowance.allowable) * 100).toFixed(2)
                                : 0
                            }%`,
                          }}
                        >
                          {allowance.allowable > 0
                            ? ((allowance.outstanding / allowance.allowable) * 100).toFixed(2)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>

                    {/* Quick update */}
                    <input
                      type="text"
                      placeholder="New Amount"
                      onChange={(e) => setAmount(e.target.value)}
                      className="form-input"
                    />
                    <input
                      type="text"
                      placeholder="New Interest Rate"
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="form-input"
                      style={{ marginTop: 4 }}
                    />
                    <button
                      onClick={() =>
                        requestBorrow(allowance.token, allowance.friend, amount)
                      }
                      className="submit-button"
                    >
                      Update Allowance
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* BORROWER VIEW */}
      <div className="container lg:w-1/2" id="subscriptionsContainer">
        <h1 className="section-title">🙌 Friends That Have Spotted Me</h1>
        <div id="borrows">
          {Object.entries(
            borrows
              .filter((b) => b.friend.toLowerCase() === userAddress?.toLowerCase())
              .reduce((acc, b) => {
                if (!acc[b.lender]) acc[b.lender] = [];
                acc[b.lender].push(b);
                return acc;
              }, {})
          ).map(([lender, lenderBorrows]) => (
            <div key={lender} className="subscription-item">
              <h3 className="subscription-title">
                {map(lender).substring(0, 20)}{" "}
              </h3>
              <div className="token-grid">
                {lenderBorrows.map((borrow) => (
                  <div key={borrow.hash} className="token-card">
                    <div className="borrow-item">
                      <p className="item-label">🪙 Token:</p>
                      <p className="token">
                        {borrow.symbol || borrow.token
                        }
                      </p>
                      <div className="item-row">
                        <div className="item-column">
                          <p className="item-label">💸 Limit:</p>
                          <p className="item-value">{borrow.allowable}</p>
                        </div>
                        <div className="item-column">
                          <p className="item-label">🏦 Outstanding:</p>
                          <p className="item-value">{borrow.outstandingFee}</p>
                        </div>
                      </div>

                      <p className="item-label">📊 Volume Borrowed:</p>
                      <p className="item-value">{borrow.totalBorrowed}</p>

                      <p className="item-label">🏦 Interest Rate:</p>
                      <p className="item-value">
                                                <span className="item-label bg-gray-400 rounded-full p-1 text-white">

                        {(borrow.interestRate / 10).toFixed(2)}%
                        </span>
                        <span className="item-label bg-orange-300 rounded-full p-1 text-white ml-2">
                          Fee: {borrow.interestRateFee}
                        </span>
                      </p>

                      <div className="progress-bar">
                        <div
                          className="progress-bar-inner"
                          style={{
                            width: `${
                              borrow.allowable > 0
                                ? ((borrow.outstanding / borrow.allowable) * 100).toFixed(2)
                                : 0
                            }%`,
                          }}
                        >
                          {borrow.allowable > 0
                            ? ((borrow.outstanding / borrow.allowable) * 100).toFixed(2)
                            : 0}
                          %
                        </div>
                      </div>
                    </div>

                    <input
                      type="text"
                      placeholder="Amount"
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="form-input"
                    />
                    <div className="button-group">
                      <button
                        onClick={() => handleBorrow(borrow.token, borrow.lender)}
                        className="borrow-button"
                      >
                        Borrow
                      </button>
                      <button
                        onClick={() => handleRepay(borrow.token, borrow.lender)}
                        className="repay-button"
                      >
                        Repay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Spot;
