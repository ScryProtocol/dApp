import React, { useState, useEffect, useRef, use } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { chainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';
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
  ListItemText,
} from '@mui/material';
import 'tailwindcss/tailwind.css';

const tokenaddress = '0x0000000000000000000000000000000000000000';
let signer;
let provider;

const Stream = () => {
  let ContractAddress = '0x6d384bf7124b8b354ee41bc839994c4dc1de70cb';
  const ContractABI = [{"inputs":[{"internalType":"address payable","name":"feeAddrs","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"streamer","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"StreamAllowed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"streamer","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Streamed","type":"event"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"name":"allowStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256[]","name":"windows","type":"uint256[]"},{"internalType":"bool[]","name":"onces","type":"bool[]"}],"name":"batchAllowStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"batchStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"computeHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeAddress","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"getAvailable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"}],"name":"getStreamDetails","outputs":[{"internalType":"uint256[]","name":"availableAmounts","type":"uint256[]"},{"internalType":"uint8[]","name":"decimals","type":"uint8[]"},{"internalType":"string[]","name":"tokenNames","type":"string[]"},{"internalType":"string[]","name":"tokenSymbols","type":"string[]"},{"components":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"totalStreamed","type":"uint256"},{"internalType":"uint256","name":"outstanding","type":"uint256"},{"internalType":"uint256","name":"allowable","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"internalType":"struct Stream.StreamDetails[]","name":"details","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"},{"internalType":"address","name":"newFeeAddress","type":"address"}],"name":"setFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"stream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"streamDetails","outputs":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"totalStreamed","type":"uint256"},{"internalType":"uint256","name":"outstanding","type":"uint256"},{"internalType":"uint256","name":"allowable","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"streamDetailsByRecipient","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"streamDetailsByStreamer","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"}],"name":"viewRecipientAllowances","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"streamer","type":"address"}],"name":"viewStreamerAllowances","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"}]
      const tokenABI = [{ "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "address", "name": "minter_", "type": "address" }, { "internalType": "uint256", "name": "mintingAllowedAfter_", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "fromDelegate", "type": "address" }, { "indexed": true, "internalType": "address", "name": "toDelegate", "type": "address" }], "name": "DelegateChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegate", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "previousBalance", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256" }], "name": "DelegateVotesChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "minter", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newMinter", "type": "address" }], "name": "MinterChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "DELEGATION_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DOMAIN_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint32", "name": "", "type": "uint32" }], "name": "checkpoints", "outputs": [{ "internalType": "uint32", "name": "fromBlock", "type": "uint32" }, { "internalType": "uint96", "name": "votes", "type": "uint96" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }], "name": "delegate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "delegateBySig", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "delegates", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getCurrentVotes", "outputs": [{ "internalType": "uint96", "name": "", "type": "uint96" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "getPriorVotes", "outputs": [{ "internalType": "uint96", "name": "", "type": "uint96" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minimumTimeBetweenMints", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "mintCap", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mintingAllowedAfter", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "nonceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "numCheckpoints", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "minter_", "type": "address" }], "name": "setMinter", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "src", "type": "address" }, { "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }  ];
  

  const [boop, setBoop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [borrows, setBorrows] = useState([]);
  const [repayments, setRepayments] = useState([]);
  const [allowances, setAllowances] = useState([]);
  const [friend, setFriend] = useState('');
  const [amount, setAmount] = useState('');
  const ethersProvider = useEthersProvider();
  const [stoken, setToken] = useState(null);
  const [availableAmounts, setAvailableAmounts] = useState({});
  const [availableBorrowAmounts, setAvailableBorrowAmounts] = useState({});
  const [pro, setPro] = useState(0);

  const rafIdRef = useRef(null);
  const rafBorrowIdRef = useRef(null);
  const [displayedAvailableAmounts, setDisplayedAvailableAmounts] = useState({});
  const [displayedAvailableBorrowAmounts, setDisplayedAvailableBorrowAmounts] = useState({});

  const [window, setWindow] = useState('');
  const [once, setOnce] = useState(false);
  const [streams, setStreams] = useState([]);
  const ethersSigner = useEthersSigner();
  provider = ethersProvider;
  signer = ethersSigner;
  const multicallContract = new ethers.Contract(
    '0xcA11bde05977b3631167028862bE2a173976CA11', 
    ['function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'], 
    provider
  );

  let account = useAccount();
  let userAddress = useAccount().address;
  let ChainId = useChainId();

  if (ChainId === 1) {
    ContractAddress = '0x90076e40A74F33cC2C673eCBf2fBa4068Af77892';
  } else if (ChainId === 17000) {
    ContractAddress = '0x27090cd6D7c20007B9a976E58Ac4231b74c20D8b';
  }

  account = account.address;
  let contract = new ethers.Contract(ContractAddress, ContractABI, provider);
  let token;

  provider.addListener('network', (newNetwork, oldNetwork) => {
    console.log('newNetwork', newNetwork, 'oldNetwork', oldNetwork);
    try {
      if (ChainId === 1) {
        ContractAddress = '0x90076e40A74F33cC2C673eCBf2fBa4068Af77892';
      } else if (ChainId === 17000) {
        ContractAddress = '0x27090cd6D7c20007B9a976E58Ac4231b74c20D8b';
      }
      console.log('ContractAddress', ContractAddress);
      account = account.address;
      contract = new ethers.Contract(ContractAddress, ContractABI, ethersProvider);
      fetchData();
      console.log('lol');
    } catch (error) {
      console.error('Error connecting to Ethereum:', error);
    }
  });

  const toggleModal = () => {
    setShowModal(!showModal);
  };

  useEffect(() => {
    function handleAccountsChanged() {
      if (boop == null) {
        setBoop('1');
        console.log('boop');
      } else {
        console.log('boop2');
        initEthers();
      }
    }
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
    const initEthers = async () => {
      if (window.ethereum) {
        try {
          async function wait(ms) {
            return new Promise((resolve) => {
              setTimeout(resolve, ms);
            });
          }
          await wait(5000);
          console.log('lol');
          setPro(localStorage.getItem('pro'));
          fetchData();
        } catch (error) {
          console.error('Error connecting to Ethereum:', error);
        }
      } else {
        const providerInstance = new ethers.JsonRpcProvider('https://1rpc.io/sepolia');
        async function wait(ms) {
          return new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        }
        await wait(5000);
        console.log('lol');
        fetchData();
      }
    };
    initEthers();
  }, []);

  useEffect(() => {
    if (contract && userAddress) {
      const init = async () => {
        if (boop == null) {
          setBoop('1');
          fetchData();
        }
      };
      init();
    }
  }, [contract, userAddress]);

  const [maps, setMaps] = useState({
    '0x94373a4919b3240d86ea41593d5eba789fef3848': 'wETH',
    '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5': 'PR0',
    '0x0987654321098765432109876543210987654321': 'USDC',
    '0x4200000000000000000000000000000000000006': 'wETH',
    '0x0b2c639c533813f4aa9d7837caf62653d097ff85': 'USDC',
    '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58': 'USDT',
    '0x4200000000000000000000000000000000000042': 'OP',
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC',
    '0x5300000000000000000000000000000000000004': 'wETH',
    '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4': 'USDC',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'wETH',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC',
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT',
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI',
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913' : 'USDC' 
  });
  function checkToken(token) {
    if (maps[token.toLowerCase()] != null) {
      return maps[token.toLowerCase()];
    }
    return token;
  }

  const addMapping = (address, name) => {
    console.log('Adding mapping:', address, name);
    setMaps((prevMaps) => ({
      ...prevMaps,
      [address.toLowerCase()]: name,
    }));
  };

  const map = (lol) => {
    lol = lol.toLowerCase();
    if (maps[lol] != null) {
      return maps[lol];
    } else {
      return lol;
    }
  };

  const fetchData = async () => {
    fetchLenderAllowances();
    fetchFriendAllowances();
    console.log(ChainId);
  };
  const fetchLenderAllowances = async () => {
    if (contract && userAddress) {
      let friendAllowances = await contract.viewStreamerAllowances(userAddress);
  
        friendAllowances = Array.from(friendAllowances);

        const [availableAmounts, decimalsArray, tokenNames, tokenSymbols, detailsArray] =
          await contract.getStreamDetails(friendAllowances);

        const borrowDetails = await Promise.all( friendAllowances.map(async(hash, index) => {
          const details = detailsArray[index];
          const decimals = decimalsArray[index];
          return {
            hash: hash,
            lender: details.streamer,
            friend: details.recipient,
            token: checkToken(details.token),
            tokenAddrs: details.token,
            totalStreamed: Number(ethers.formatUnits(details.totalStreamed, decimals)),
            outstanding: Number(ethers.formatUnits(details.outstanding, decimals)),
            allowable: Number(ethers.formatUnits(details.allowable, decimals)),
            window: Number(details.window),
            timestamp: Number(details.timestamp),
            once: details.once,
          };
        })
  )
      setAllowances(borrowDetails);
    }
  };
  
  const fetchFriendAllowances = async () => {
    if (contract && userAddress) {
      let friendAllowances = await contract.viewRecipientAllowances(userAddress);
      friendAllowances = Array.from(friendAllowances);
      console.log(friendAllowances);
      const [availableAmounts, decimalsArray, tokenNames, tokenSymbols, detailsArray] =
        await contract.getStreamDetails(friendAllowances);
        console.log('detailsArray', detailsArray);
      const borrowDetails = await Promise.all(
        friendAllowances.map(async (hash, index) => {
          const details = detailsArray[index];
          const decimals = decimalsArray[index];
  console.log('details', details);
  console.log(details.streamer)
  console.log(details.recipient)
  console.log(details.token)
  console.log(details.totalStreamed)
  console.log(details.allowable)
  console.log(details.window)
  console.log(details.lastStreamTime)
  console.log(details.once)
  console.log(details.outstanding)
          return {
            hash: hash,
            lender: details.streamer,
            friend: details.recipient,
            token: tokenSymbols[index],
            tokenAddrs: details.token,
            totalStreamed: Number(ethers.formatUnits(details.totalStreamed, decimals)),
            outstanding: Number(ethers.formatUnits(details.outstanding, decimals)),
            allowable: Number(ethers.formatUnits(details.allowable, decimals)),
            window: Number(details.window),
            timestamp: Number(details.timestamp),
            once: details.once,
            decimals: decimals,
          };
        })
      );
  
      setBorrows(borrowDetails);
    }
  };

  const [ENSCache, setENSCache] = useState({});
  const resolveENS = async (address, cache, setCache) => {
    if (!address) return address;

    // Check if the ENS name is already in the cache
    if (cache[address]) return cache[address];

    // Otherwise, resolve the ENS name and cache it
    let provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com')
    const ensName = await provider.lookupAddress(address);
    if (ensName) {
      setCache((prevCache) => ({ ...prevCache, [address]: ensName }));
    } else {
      setCache((prevCache) => ({ ...prevCache, [address]: address }));
    }

    return ensName || address;
  };
useEffect(() => {
  let addresses = [];
    for (const allowance of allowances) {
if (!addresses.includes(allowance.friend)) {  addresses.push(allowance.friend); }
    }
    for (const allowance of borrows) {
if (!addresses.includes(allowance.lender)) {  addresses.push(allowance.lender); }
    }
    for (const address of addresses) {
      resolveENS(address, ENSCache, setENSCache);
    }

  }, [allowances, borrows]);
    
  const ENS = (address, cache, setCache) => {
    // If the ENS is cached, display it, otherwise resolve it
    if (cache[address]) {
      return cache[address].startsWith('0x') ? address.substring(0, 12) + '...' + address.substring(address.length - 10, address.length) : cache[address];
    } else {
      return address.substring(0, 10) + '...' + address.substring(address.length - 10, address.length);
    }
  };
  const fetchAllowances = async () => {
    if (contract && userAddress) {
      const allowances = await contract.viewLenderAllowances(userAddress);
      setAllowances(allowances);
    }
  };

  const requestBorrow = async (stoken, friend, amount) => {
    let contract = new ethers.Contract(ContractAddress, ContractABI, signer);
    let token = new ethers.Contract(stoken, tokenABI, signer);
    console.log('borrowing', stoken, friend, amount);
    if (contract) {
      try {
        let am = await token.allowance(userAddress, ContractAddress);
        let decimals = await token.decimals();

        console.log('lol', await token.balanceOf(userAddress), 'lol', am);
        let allowance = await token.allowance(userAddress, ContractAddress);
        if (allowance < once?ethers.parseUnits(amount, decimals):ethers.MaxUint256) {
         
        if (!once) {
          let tx = await token.approve(ContractAddress, ethers.MaxUint256);
          tx.wait();
        } else {
          if (am < ethers.parseUnits(amount, decimals)) {
            let tx = await token.approve(ContractAddress, ethers.parseUnits(amount, decimals));
            tx.wait();
          }
        }}
        if (!ethers.isAddress(friend)) {
          let pr = new ethers.JsonRpcProvider('https://1rpc.io/eth');
          const getAddressENS = async (address) => {
            const ensName = await pr.resolveName(address);
            if (ensName) friend = ensName;
            else toast.error('ENS not found');
            return ensName;
          };
          const ENS = await getAddressENS(friend);
          if (!ENS) {
            return;
          }
        }
        console.log('borrowing', stoken, friend, ethers.parseUnits(amount, decimals), window, once);
        const tx = await contract.allowStream(stoken, friend, ethers.parseUnits(amount, decimals), !once?window*3600*24:window, once);
        await tx.wait();
        toast.success('Allowance successful');
        fetchLenderAllowances();
      } catch (error) {
        console.error('Error requesting borrow:', error);
        toast.error('Error requesting borrow');
      }
    }
  };

  const handleBorrow = async (token, lender) => {
    console.log('borrowing', token, lender, amount);
    let contract = new ethers.Contract(ContractAddress, ContractABI, signer);
    try {
      const tx = await contract.stream(token, lender, account);
      await tx.wait();
      toast.success('Stream successful');
      fetchFriendAllowances();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error');
    }
  };const batchStream = async () => {
    if (!signer) {
        toast.error('No signer available');
        return;
    }

    let tokenTo = useSingleToken ? Array(recipients.length).fill(stoken) : tokens;
    let amountTo = useSameAmount ? Array(recipients.length).fill(amount) : amounts;

    // Assuming `window` is already defined somewhere else in the scope
    let windows = Array(recipients.length).fill(!once?window*3600*24:window); // Use the `window` variable here
    let onces = Array(recipients.length).fill(once); // Assuming you have a single `once` value (true/false)

    try {
        // Approve and calculate total amounts
        const tokenAmounts = await calculateTokenApprovals(tokenTo, amountTo);

        // Approve each token for the calculated amounts
        await approveTokensIfNecessary(tokenAmounts);

        // Prepare parsed amounts
        const parsedAmounts = await parseAmounts(tokenTo, amountTo);

        // Execute batch stream on contract
        const tx = await contract.connect(ethersSigner).batchAllowStream(tokenTo, recipients, parsedAmounts, windows, onces);
        await tx.wait();

        toast.success('Stream successful');
        fetchFriendAllowances();
    } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error occurred while streaming');
    }
};

// Reusable function to calculate token approvals
const calculateTokenApprovals = async (tokens, amounts) => {
    let tokenAmounts = {};
    console.log('tokens', tokens, 'amounts', amounts);
    for (let i = 0; i < tokens.length; i++) {
        let tokenAddress = tokens[i];
        let amount = amounts[i];

        if (!tokenAddress || !amount) {
            throw new Error(`Invalid token or amount at index ${i}`);
        }

        let tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
        let decimals = await tokenContract.decimals();
        let amountInUnits = ethers.parseUnits(amount.toString(), decimals);
        tokenAmounts[tokenAddress] = (tokenAmounts[tokenAddress] || BigInt(0)) + amountInUnits;
    }
    return tokenAmounts;
};

// Reusable function to check if tokens need approval and approve if necessary
const approveTokensIfNecessary = async (tokenAmounts) => {
    for (let tokenAddress in tokenAmounts) {
        let tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

        // Check current allowance
        let currentAllowance = await tokenContract.allowance(await signer.getAddress(), ContractAddress);

        // Only approve if current allowance is less than the required amount
        if (BigInt(currentAllowance) < tokenAmounts[tokenAddress]) {
            let tx = await tokenContract.approve(ContractAddress, tokenAmounts[tokenAddress]);
            await tx.wait();
        } else {
            console.log(`No need to approve for token ${tokenAddress}, sufficient allowance.`);
        }
    }
};

// Reusable function to parse amounts
const parseAmounts = async (tokens, amounts) => {
    let parsedAmounts = [];
    for (let i = 0; i < tokens.length; i++) {
        let tokenContract = new ethers.Contract(tokens[i], tokenABI, signer);
        let decimals = await tokenContract.decimals();
        let amountInUnits = ethers.parseUnits(amounts[i].toString(), decimals);
        parsedAmounts.push(amountInUnits);
    }
    return parsedAmounts;
};

const handledepoly = async (bc) => {
  let contract = new ethers.Contract('0x0000000000ffe8b47b3e2130213b802212439497', ['function safeCreate2(bytes32 salt, bytes initializationCode) payable'], signer);
  try {
    const tx = await contract.safeCreate2('0x0000000000000000000000000000000000000000000000000000000000000000','0x'+'608060405234801562000010575f80fd5b50604051620035f4380380620035f48339818101604052810190620000369190620000e2565b8060035f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505062000112565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f620000ac8262000081565b9050919050565b620000be81620000a0565b8114620000c9575f80fd5b50565b5f81519050620000dc81620000b3565b92915050565b5f60208284031215620000fa57620000f96200007d565b5b5f6200010984828501620000cc565b91505092915050565b6134d480620001205f395ff3fe608060405234801561000f575f80fd5b50600436106100fd575f3560e01c8063a136572d11610095578063c098c4b011610064578063c098c4b0146102d7578063cb5e174c14610307578063db0b5b2414610323578063ddca3f4314610353576100fd565b8063a136572d1461024f578063b3bfd06f14610283578063b4f2e8b81461029f578063b8b39691146102bb576100fd565b806341275358116100d157806341275358146101b55780635f261713146101d3578063743a29bd146101ef5780639cc0d08f1461021f576100fd565b80624790c11461010157806318fd373e1461013157806338cddec6146101695780634010d97214610185575b5f80fd5b61011b60048036038101906101169190611ef6565b610371565b6040516101289190611f5e565b60405180910390f35b61014b60048036038101906101469190611faa565b61049f565b60405161016099989796959493929190611ffe565b60405180910390f35b610183600480360381019061017e9190611ef6565b610551565b005b61019f600480360381019061019a9190612089565b610830565b6040516101ac919061216b565b60405180910390f35b6101bd6108c3565b6040516101ca91906121ab565b60405180910390f35b6101ed60048036038101906101e89190612225565b6108e8565b005b61020960048036038101906102049190611ef6565b610c87565b60405161021691906122e4565b60405180910390f35b61023960048036038101906102349190612327565b610cbc565b60405161024691906122e4565b60405180910390f35b610269600480360381019061026491906123ba565b610ce7565b60405161027a959493929190612840565b60405180910390f35b61029d60048036038101906102989190612225565b61129e565b005b6102b960048036038101906102b491906128b4565b6113a0565b005b6102d560048036038101906102d0919061291c565b6114e6565b005b6102f160048036038101906102ec9190612089565b6118e7565b6040516102fe919061216b565b60405180910390f35b610321600480360381019061031c9190612a3d565b61197a565b005b61033d60048036038101906103389190612327565b611ad6565b60405161034a91906122e4565b60405180910390f35b61035b611b01565b6040516103689190611f5e565b60405180910390f35b5f8061037e848685610c87565b90505f805f8381526020019081526020015f2090505f73ffffffffffffffffffffffffffffffffffffffff16815f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610423576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161041a90612bae565b60405180910390fd5b5f4290505f8260070154826104389190612bf9565b90505f83600601548285600501546104509190612c2c565b61045a9190612c9a565b9050836004015481118015610483575060011515846008015f9054906101000a900460ff161515145b1561049057836004015490505b80955050505050509392505050565b5f602052805f5260405f205f91509050805f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690806001015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690806002015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690806003015490806004015490806005015490806006015490806007015490806008015f9054906101000a900460ff16905089565b5f61055d838584610c87565b90505f805f8381526020019081526020015f2090505f73ffffffffffffffffffffffffffffffffffffffff16815f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610602576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105f990612bae565b60405180910390fd5b5f4290505f8260070154826106179190612bf9565b90505f836006015482856005015461062f9190612c2c565b6106399190612c9a565b9050836004015481118015610662575060011515846008015f9054906101000a900460ff161515145b1561066f57836004015490505b5f81116106b1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106a890612d14565b60405180910390fd5b836008015f9054906101000a900460ff16156106e25780846004015f8282546106da9190612bf9565b925050819055505b80846003015f8282546106f59190612d32565b925050819055508284600701819055506107328787838b73ffffffffffffffffffffffffffffffffffffffff16611b07909392919063ffffffff16565b5f60045411156107aa575f6103e86004548361074e9190612c2c565b6107589190612c9a565b90506107a88860035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16838c73ffffffffffffffffffffffffffffffffffffffff16611b07909392919063ffffffff16565b505b8573ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff167faf22af5691f06aea5afb81f1b3d51a6ecb1847e7ff25422fff392cbf52da23268460405161081e9190611f5e565b60405180910390a45050505050505050565b606060025f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f208054806020026020016040519081016040528092919081815260200182805480156108b757602002820191905f5260205f20905b8154815260200190600101908083116108a3575b50505050509050919050565b60035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b838390508686905014801561090257508181905084849050145b610941576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161093890612daf565b60405180910390fd5b5f5b86869050811015610c7e5784848281811061096157610960612dcd565b5b90506020020160208101906109769190612089565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480610a0157508282828181106109bd576109bc612dcd565b5b90506020020160208101906109d29190612089565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b610a40576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a3790612e6a565b60405180910390fd5b5f610ac1868684818110610a5757610a56612dcd565b5b9050602002016020810190610a6c9190612089565b898985818110610a7f57610a7e612dcd565b5b9050602002016020810190610a949190612089565b868686818110610aa757610aa6612dcd565b5b9050602002016020810190610abc9190612089565b610c87565b90505f805f8381526020019081526020015f2090505f73ffffffffffffffffffffffffffffffffffffffff16815f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610b66576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b5d90612bae565b60405180910390fd5b5f81600501819055505f8160040181905550848484818110610b8b57610b8a612dcd565b5b9050602002016020810190610ba09190612089565b73ffffffffffffffffffffffffffffffffffffffff16898985818110610bc957610bc8612dcd565b5b9050602002016020810190610bde9190612089565b73ffffffffffffffffffffffffffffffffffffffff16888886818110610c0757610c06612dcd565b5b9050602002016020810190610c1c9190612089565b73ffffffffffffffffffffffffffffffffffffffff167fcf8d64e381fa4c6934a7d60007173d92e3e32d0d11698bbb69f14e04fa2c4a895f604051610c619190612eca565b60405180910390a450508080610c7690612ee3565b915050610943565b50505050505050565b5f838383604051602001610c9d93929190612f6f565b6040516020818303038152906040528051906020012090509392505050565b6002602052815f5260405f208181548110610cd5575f80fd5b905f5260205f20015f91509150505481565b60608060608060605f8787905090508067ffffffffffffffff811115610d1057610d0f612fab565b5b604051908082528060200260200182016040528015610d4957816020015b610d36611e04565b815260200190600190039081610d2e5790505b5091508067ffffffffffffffff811115610d6657610d65612fab565b5b604051908082528060200260200182016040528015610d945781602001602082028036833780820191505090505b5095508067ffffffffffffffff811115610db157610db0612fab565b5b604051908082528060200260200182016040528015610ddf5781602001602082028036833780820191505090505b5094508067ffffffffffffffff811115610dfc57610dfb612fab565b5b604051908082528060200260200182016040528015610e2f57816020015b6060815260200190600190039081610e1a5790505b5093508067ffffffffffffffff811115610e4c57610e4b612fab565b5b604051908082528060200260200182016040528015610e7f57816020015b6060815260200190600190039081610e6a5790505b5092505f5b81811015611292575f808a8a84818110610ea157610ea0612dcd565b5b9050602002013581526020019081526020015f20604051806101200160405290815f82015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001600182015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001600282015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016003820154815260200160048201548152602001600582015481526020016006820154815260200160078201548152602001600882015f9054906101000a900460ff16151515158152505083828151811061101e5761101d612dcd565b5b602002602001018190525061108d83828151811061103f5761103e612dcd565b5b60200260200101516040015184838151811061105e5761105d612dcd565b5b60200260200101515f015185848151811061107c5761107b612dcd565b5b602002602001015160200151610371565b8782815181106110a05761109f612dcd565b5b6020026020010181815250505f8382815181106110c0576110bf612dcd565b5b60200260200101516040015190508073ffffffffffffffffffffffffffffffffffffffff1663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015611117573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061113b9190613002565b87838151811061114e5761114d612dcd565b5b602002602001019060ff16908160ff16815250508073ffffffffffffffffffffffffffffffffffffffff166306fdde036040518163ffffffff1660e01b81526004015f60405180830381865afa1580156111aa573d5f803e3d5ffd5b505050506040513d5f823e3d601f19601f820116820180604052508101906111d2919061311a565b8683815181106111e5576111e4612dcd565b5b60200260200101819052508073ffffffffffffffffffffffffffffffffffffffff166395d89b416040518163ffffffff1660e01b81526004015f60405180830381865afa158015611238573d5f803e3d5ffd5b505050506040513d5f823e3d601f19601f82011682018060405250810190611260919061311a565b85838151811061127357611272612dcd565b5b602002602001018190525050808061128a90612ee3565b915050610e84565b50509295509295909350565b83839050868690501480156112b857508181905084849050145b6112f7576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016112ee90612daf565b60405180910390fd5b5f5b868690508110156113975761138487878381811061131a57611319612dcd565b5b905060200201602081019061132f9190612089565b86868481811061134257611341612dcd565b5b90506020020160208101906113579190612089565b85858581811061136a57611369612dcd565b5b905060200201602081019061137f9190612089565b610551565b808061138f90612ee3565b9150506112f9565b50505050505050565b60035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461142f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611426906131ab565b60405180910390fd5b603282111561143f576032611441565b815b6004819055505f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036114a15760035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff166114a3565b805b60035f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b5f6114f2338787610c87565b90505f73ffffffffffffffffffffffffffffffffffffffff165f808381526020019081526020015f205f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036117d8576040518061012001604052803373ffffffffffffffffffffffffffffffffffffffff1681526020018673ffffffffffffffffffffffffffffffffffffffff1681526020018773ffffffffffffffffffffffffffffffffffffffff1681526020015f81526020018581526020018581526020018481526020014281526020018315158152505f808381526020019081526020015f205f820151815f015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506020820151816001015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506040820151816002015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550606082015181600301556080820151816004015560a0820151816005015560c0820151816006015560e08201518160070155610100820151816008015f6101000a81548160ff02191690831515021790555090505060015f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081908060018154018082558091505060019003905f5260205f20015f909190919091505560025f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081908060018154018082558091505060019003905f5260205f20015f9091909190915055611863565b835f808381526020019081526020015f2060050181905550835f808381526020019081526020015f2060040181905550825f808381526020019081526020015f2060060181905550425f808381526020019081526020015f2060070181905550815f808381526020019081526020015f206008015f6101000a81548160ff0219169083151502179055505b8473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fcf8d64e381fa4c6934a7d60007173d92e3e32d0d11698bbb69f14e04fa2c4a89876040516118d79190611f5e565b60405180910390a4505050505050565b606060015f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2080548060200260200160405190810160405280929190818152602001828054801561196e57602002820191905f5260205f20905b81548152602001906001019080831161195a575b50505050509050919050565b878790508a8a905014801561199457508585905088889050145b80156119a557508383905086869050145b80156119b657508181905084849050145b6119f5576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016119ec90612daf565b60405180910390fd5b5f5b8a8a9050811015611ac957611ab68b8b83818110611a1857611a17612dcd565b5b9050602002016020810190611a2d9190612089565b8a8a84818110611a4057611a3f612dcd565b5b9050602002016020810190611a559190612089565b898985818110611a6857611a67612dcd565b5b90506020020135888886818110611a8257611a81612dcd565b5b90506020020135878787818110611a9c57611a9b612dcd565b5b9050602002016020810190611ab191906131c9565b6114e6565b8080611ac190612ee3565b9150506119f7565b5050505050505050505050565b6001602052815f5260405f208181548110611aef575f80fd5b905f5260205f20015f91509150505481565b60045481565b611b8a846323b872dd60e01b858585604051602401611b28939291906131f4565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050611b90565b50505050565b5f611bf1826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16611c559092919063ffffffff16565b90505f81511115611c505780806020019051810190611c10919061323d565b611c4f576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611c46906132d8565b60405180910390fd5b5b505050565b6060611c6384845f85611c6c565b90509392505050565b606082471015611cb1576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611ca890613366565b60405180910390fd5b611cba85611d7c565b611cf9576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611cf0906133ce565b60405180910390fd5b5f808673ffffffffffffffffffffffffffffffffffffffff168587604051611d219190613430565b5f6040518083038185875af1925050503d805f8114611d5b576040519150601f19603f3d011682016040523d82523d5f602084013e611d60565b606091505b5091509150611d70828286611d9e565b92505050949350505050565b5f808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b60608315611dae57829050611dfd565b5f83511115611dc05782518084602001fd5b816040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611df4919061347e565b60405180910390fd5b9392505050565b6040518061012001604052805f73ffffffffffffffffffffffffffffffffffffffff1681526020015f73ffffffffffffffffffffffffffffffffffffffff1681526020015f73ffffffffffffffffffffffffffffffffffffffff1681526020015f81526020015f81526020015f81526020015f81526020015f81526020015f151581525090565b5f604051905090565b5f80fd5b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f611ec582611e9c565b9050919050565b611ed581611ebb565b8114611edf575f80fd5b50565b5f81359050611ef081611ecc565b92915050565b5f805f60608486031215611f0d57611f0c611e94565b5b5f611f1a86828701611ee2565b9350506020611f2b86828701611ee2565b9250506040611f3c86828701611ee2565b9150509250925092565b5f819050919050565b611f5881611f46565b82525050565b5f602082019050611f715f830184611f4f565b92915050565b5f819050919050565b611f8981611f77565b8114611f93575f80fd5b50565b5f81359050611fa481611f80565b92915050565b5f60208284031215611fbf57611fbe611e94565b5b5f611fcc84828501611f96565b91505092915050565b611fde81611ebb565b82525050565b5f8115159050919050565b611ff881611fe4565b82525050565b5f610120820190506120125f83018c611fd5565b61201f602083018b611fd5565b61202c604083018a611fd5565b6120396060830189611f4f565b6120466080830188611f4f565b61205360a0830187611f4f565b61206060c0830186611f4f565b61206d60e0830185611f4f565b61207b610100830184611fef565b9a9950505050505050505050565b5f6020828403121561209e5761209d611e94565b5b5f6120ab84828501611ee2565b91505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b6120e681611f77565b82525050565b5f6120f783836120dd565b60208301905092915050565b5f602082019050919050565b5f612119826120b4565b61212381856120be565b935061212e836120ce565b805f5b8381101561215e57815161214588826120ec565b975061215083612103565b925050600181019050612131565b5085935050505092915050565b5f6020820190508181035f830152612183818461210f565b905092915050565b5f61219582611e9c565b9050919050565b6121a58161218b565b82525050565b5f6020820190506121be5f83018461219c565b92915050565b5f80fd5b5f80fd5b5f80fd5b5f8083601f8401126121e5576121e46121c4565b5b8235905067ffffffffffffffff811115612202576122016121c8565b5b60208301915083602082028301111561221e5761221d6121cc565b5b9250929050565b5f805f805f806060878903121561223f5761223e611e94565b5b5f87013567ffffffffffffffff81111561225c5761225b611e98565b5b61226889828a016121d0565b9650965050602087013567ffffffffffffffff81111561228b5761228a611e98565b5b61229789828a016121d0565b9450945050604087013567ffffffffffffffff8111156122ba576122b9611e98565b5b6122c689828a016121d0565b92509250509295509295509295565b6122de81611f77565b82525050565b5f6020820190506122f75f8301846122d5565b92915050565b61230681611f46565b8114612310575f80fd5b50565b5f81359050612321816122fd565b92915050565b5f806040838503121561233d5761233c611e94565b5b5f61234a85828601611ee2565b925050602061235b85828601612313565b9150509250929050565b5f8083601f84011261237a576123796121c4565b5b8235905067ffffffffffffffff811115612397576123966121c8565b5b6020830191508360208202830111156123b3576123b26121cc565b5b9250929050565b5f80602083850312156123d0576123cf611e94565b5b5f83013567ffffffffffffffff8111156123ed576123ec611e98565b5b6123f985828601612365565b92509250509250929050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b61243781611f46565b82525050565b5f612448838361242e565b60208301905092915050565b5f602082019050919050565b5f61246a82612405565b612474818561240f565b935061247f8361241f565b805f5b838110156124af578151612496888261243d565b97506124a183612454565b925050600181019050612482565b5085935050505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b5f60ff82169050919050565b6124fa816124e5565b82525050565b5f61250b83836124f1565b60208301905092915050565b5f602082019050919050565b5f61252d826124bc565b61253781856124c6565b9350612542836124d6565b805f5b838110156125725781516125598882612500565b975061256483612517565b925050600181019050612545565b5085935050505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b5f81519050919050565b5f82825260208201905092915050565b5f5b838110156125df5780820151818401526020810190506125c4565b5f8484015250505050565b5f601f19601f8301169050919050565b5f612604826125a8565b61260e81856125b2565b935061261e8185602086016125c2565b612627816125ea565b840191505092915050565b5f61263d83836125fa565b905092915050565b5f602082019050919050565b5f61265b8261257f565b6126658185612589565b93508360208202850161267785612599565b805f5b858110156126b257848403895281516126938582612632565b945061269e83612645565b925060208a0199505060018101905061267a565b50829750879550505050505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b6126f681611ebb565b82525050565b61270581611fe4565b82525050565b61012082015f8201516127205f8501826126ed565b50602082015161273360208501826126ed565b50604082015161274660408501826126ed565b506060820151612759606085018261242e565b50608082015161276c608085018261242e565b5060a082015161277f60a085018261242e565b5060c082015161279260c085018261242e565b5060e08201516127a560e085018261242e565b506101008201516127ba6101008501826126fc565b50505050565b5f6127cb838361270b565b6101208301905092915050565b5f602082019050919050565b5f6127ee826126c4565b6127f881856126ce565b9350612803836126de565b805f5b8381101561283357815161281a88826127c0565b9750612825836127d8565b925050600181019050612806565b5085935050505092915050565b5f60a0820190508181035f8301526128588188612460565b9050818103602083015261286c8187612523565b905081810360408301526128808186612651565b905081810360608301526128948185612651565b905081810360808301526128a881846127e4565b90509695505050505050565b5f80604083850312156128ca576128c9611e94565b5b5f6128d785828601612313565b92505060206128e885828601611ee2565b9150509250929050565b6128fb81611fe4565b8114612905575f80fd5b50565b5f81359050612916816128f2565b92915050565b5f805f805f60a0868803121561293557612934611e94565b5b5f61294288828901611ee2565b955050602061295388828901611ee2565b945050604061296488828901612313565b935050606061297588828901612313565b925050608061298688828901612908565b9150509295509295909350565b5f8083601f8401126129a8576129a76121c4565b5b8235905067ffffffffffffffff8111156129c5576129c46121c8565b5b6020830191508360208202830111156129e1576129e06121cc565b5b9250929050565b5f8083601f8401126129fd576129fc6121c4565b5b8235905067ffffffffffffffff811115612a1a57612a196121c8565b5b602083019150836020820283011115612a3657612a356121cc565b5b9250929050565b5f805f805f805f805f8060a08b8d031215612a5b57612a5a611e94565b5b5f8b013567ffffffffffffffff811115612a7857612a77611e98565b5b612a848d828e016121d0565b9a509a505060208b013567ffffffffffffffff811115612aa757612aa6611e98565b5b612ab38d828e016121d0565b985098505060408b013567ffffffffffffffff811115612ad657612ad5611e98565b5b612ae28d828e01612993565b965096505060608b013567ffffffffffffffff811115612b0557612b04611e98565b5b612b118d828e01612993565b945094505060808b013567ffffffffffffffff811115612b3457612b33611e98565b5b612b408d828e016129e8565b92509250509295989b9194979a5092959850565b5f82825260208201905092915050565b7f53747265616d20646f6573206e6f7420657869737400000000000000000000005f82015250565b5f612b98601583612b54565b9150612ba382612b64565b602082019050919050565b5f6020820190508181035f830152612bc581612b8c565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f612c0382611f46565b9150612c0e83611f46565b9250828203905081811115612c2657612c25612bcc565b5b92915050565b5f612c3682611f46565b9150612c4183611f46565b9250828202612c4f81611f46565b91508282048414831517612c6657612c65612bcc565b5b5092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f612ca482611f46565b9150612caf83611f46565b925082612cbf57612cbe612c6d565b5b828204905092915050565b7f4e6f20616c6c6f7761626c6520616d6f756e7420746f207769746864726177005f82015250565b5f612cfe601f83612b54565b9150612d0982612cca565b602082019050919050565b5f6020820190508181035f830152612d2b81612cf2565b9050919050565b5f612d3c82611f46565b9150612d4783611f46565b9250828201905080821115612d5f57612d5e612bcc565b5b92915050565b7f496e70757420617272617973206c656e677468206d69736d61746368000000005f82015250565b5f612d99601c83612b54565b9150612da482612d65565b602082019050919050565b5f6020820190508181035f830152612dc681612d8d565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b7f596f7520617265206e6f74207468652073747265616d6572206f7220726563695f8201527f7069656e74000000000000000000000000000000000000000000000000000000602082015250565b5f612e54602583612b54565b9150612e5f82612dfa565b604082019050919050565b5f6020820190508181035f830152612e8181612e48565b9050919050565b5f819050919050565b5f819050919050565b5f612eb4612eaf612eaa84612e88565b612e91565b611f46565b9050919050565b612ec481612e9a565b82525050565b5f602082019050612edd5f830184612ebb565b92915050565b5f612eed82611f46565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203612f1f57612f1e612bcc565b5b600182019050919050565b5f8160601b9050919050565b5f612f4082612f2a565b9050919050565b5f612f5182612f36565b9050919050565b612f69612f6482611ebb565b612f47565b82525050565b5f612f7a8286612f58565b601482019150612f8a8285612f58565b601482019150612f9a8284612f58565b601482019150819050949350505050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b612fe1816124e5565b8114612feb575f80fd5b50565b5f81519050612ffc81612fd8565b92915050565b5f6020828403121561301757613016611e94565b5b5f61302484828501612fee565b91505092915050565b5f80fd5b61303a826125ea565b810181811067ffffffffffffffff8211171561305957613058612fab565b5b80604052505050565b5f61306b611e8b565b90506130778282613031565b919050565b5f67ffffffffffffffff82111561309657613095612fab565b5b61309f826125ea565b9050602081019050919050565b5f6130be6130b98461307c565b613062565b9050828152602081018484840111156130da576130d961302d565b5b6130e58482856125c2565b509392505050565b5f82601f830112613101576131006121c4565b5b81516131118482602086016130ac565b91505092915050565b5f6020828403121561312f5761312e611e94565b5b5f82015167ffffffffffffffff81111561314c5761314b611e98565b5b613158848285016130ed565b91505092915050565b7f596f7520617265206e6f7420746865206f776e657200000000000000000000005f82015250565b5f613195601583612b54565b91506131a082613161565b602082019050919050565b5f6020820190508181035f8301526131c281613189565b9050919050565b5f602082840312156131de576131dd611e94565b5b5f6131eb84828501612908565b91505092915050565b5f6060820190506132075f830186611fd5565b6132146020830185611fd5565b6132216040830184611f4f565b949350505050565b5f81519050613237816128f2565b92915050565b5f6020828403121561325257613251611e94565b5b5f61325f84828501613229565b91505092915050565b7f5361666545524332303a204552433230206f7065726174696f6e20646964206e5f8201527f6f74207375636365656400000000000000000000000000000000000000000000602082015250565b5f6132c2602a83612b54565b91506132cd82613268565b604082019050919050565b5f6020820190508181035f8301526132ef816132b6565b9050919050565b7f416464726573733a20696e73756666696369656e742062616c616e636520666f5f8201527f722063616c6c0000000000000000000000000000000000000000000000000000602082015250565b5f613350602683612b54565b915061335b826132f6565b604082019050919050565b5f6020820190508181035f83015261337d81613344565b9050919050565b7f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000005f82015250565b5f6133b8601d83612b54565b91506133c382613384565b602082019050919050565b5f6020820190508181035f8301526133e5816133ac565b9050919050565b5f81519050919050565b5f81905092915050565b5f61340a826133ec565b61341481856133f6565b93506134248185602086016125c2565b80840191505092915050565b5f61343b8284613400565b915081905092915050565b5f613450826125a8565b61345a8185612b54565b935061346a8185602086016125c2565b613473816125ea565b840191505092915050565b5f6020820190508181035f8301526134968184613446565b90509291505056fea2646970667358221220b8cdc476567c00679d0120b7b629fd55ab9838539b89332c30b3cf7e09c5420d64736f6c6343000815003300000000000000000000000000000000000000c0d7d3017b342ff039b55b0879')
    await tx.wait();
    toast.success('deploy successful');
  } catch (error) {
    console.error('Error:', error);
    toast.error('Error');
  }}
  const handleRepay = async (token, lender) => {
    if (contract) {
      let token = new ethers.Contract(token, tokenABI, signer);
      try {
        let am = await token.allowance(userAddress, ContractAddress);
        console.log('lol', await token.balanceOf(userAddress), 'lol', am);
        if (am < ethers.parseUnits(amount, await token.decimals())) {
          let tx = await token.approve(ContractAddress, ethers.parseUnits(amount, await token.decimals()));
          tx.wait();
        }
        const tx = await contract.repay(token, lender, ethers.parseUnits(amount, await token.decimals()));
        await tx.wait();
        toast.success('Repayment successful');
        fetchFriendAllowances();
      } catch (error) {
        console.error('Error repaying:', error);
        toast.error('Error repaying');
      }
    }
  };

  function calculateAllowableAmount(allowance) {
    const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
    const elapsedTime = currentTime - allowance.timestamp;
    const allowableAmount = (allowance.allowable * elapsedTime) / allowance.window;

    if (allowableAmount > allowance.outstanding) {
      return allowance.outstanding;
    } else {
      return allowableAmount;
    }
  }

  useEffect(() => {
    // Save theme preference to local storage whenever it changes
    localStorage.setItem('pro', pro);
  }, [pro]);

  const calculateAvailableAmount = (allowance) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedTime = currentTime - allowance.timestamp;
    if (allowance.once) {
      const allowableAmount = (allowance.allowable * elapsedTime) / allowance.window;
      if (allowableAmount > allowance.outstanding) {
        return allowance.outstanding;
      } else {
        return allowableAmount;
      }
    } else {
      const allowableAmount = (allowance.outstanding * elapsedTime) / allowance.window;
      return allowableAmount;
    }
  };

  const updateAvailableAmounts = () => {
    const newAvailableAmounts = {};
    for (const allowance of allowances) {
      newAvailableAmounts[allowance.hash] = calculateAvailableAmount(allowance);
    }
    setAvailableAmounts(newAvailableAmounts);
  };

  useEffect(() => {
    const timer = setInterval(updateAvailableAmounts, 100);
    return () => {
      clearInterval(timer);
    };
  }, [allowances]);

  const smoothUpdateAvailableAmounts = () => {
    for (const allowance of allowances) {
      const currentDisplayedAmount = displayedAvailableAmounts[allowance.hash] || 0;
      const targetAmount = availableAmounts[allowance.hash] || 0;
      const diff = targetAmount - currentDisplayedAmount;
      const step = diff / 10;
      if (Math.abs(diff) > 0.0000000001) {
        setDisplayedAvailableAmounts((prevAmounts) => ({
          ...prevAmounts,
          [allowance.hash]: currentDisplayedAmount + step,
        }));
      }
    }
    rafIdRef.current = requestAnimationFrame(smoothUpdateAvailableAmounts);
  };

  useEffect(() => {
    const timer = setInterval(updateAvailableAmounts, 100);
    rafIdRef.current = requestAnimationFrame(smoothUpdateAvailableAmounts);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(rafIdRef.current);
    };
  }, [allowances, availableAmounts]);

  const calculateAvailableBorrowAmount = (borrow) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedTime = currentTime - borrow.timestamp;
    if (borrow.once) {
      const allowableAmount = (borrow.allowable * elapsedTime) / borrow.window;
      if (allowableAmount > borrow.outstanding) {
        return borrow.outstanding;
      } else {
        return allowableAmount;
      }
    } else {
      const allowableAmount = (borrow.outstanding * elapsedTime) / borrow.window;
      return allowableAmount;
    }
  };

  const updateAvailableBorrowAmounts = () => {
    const newAvailableBorrowAmounts = {};
    for (const borrow of borrows) {
      newAvailableBorrowAmounts[borrow.hash] = calculateAvailableBorrowAmount(borrow);
    }
    setAvailableBorrowAmounts(newAvailableBorrowAmounts);
  };

  useEffect(() => {
    const timer = setInterval(updateAvailableBorrowAmounts, 100);
    console.log('borrows', borrows);
    return () => {
      clearInterval(timer);
    };
  }, [borrows]);

  const smoothUpdateAvailableBorrowAmounts = () => {
    for (const borrow of borrows) {
      const currentDisplayedAmount = displayedAvailableBorrowAmounts[borrow.hash] || 0;
      const targetAmount = availableBorrowAmounts[borrow.hash] || 0;
      const diff = targetAmount - currentDisplayedAmount;
      const step = diff / 10;
      if (Math.abs(diff) > 0.0000000001) {
        setDisplayedAvailableBorrowAmounts((prevAmounts) => ({
          ...prevAmounts,
          [borrow.hash]: currentDisplayedAmount + step,
        }));
      }
    }
    rafBorrowIdRef.current = requestAnimationFrame(smoothUpdateAvailableBorrowAmounts);
  };

  useEffect(() => {
    const timer = setInterval(updateAvailableBorrowAmounts, 100);
    rafBorrowIdRef.current = requestAnimationFrame(smoothUpdateAvailableBorrowAmounts);
    return () => {
      clearInterval(timer);
      cancelAnimationFrame(rafBorrowIdRef.current);
    };
  }, [borrows, availableBorrowAmounts]);
  
  const [useSingleToken, setUseSingleToken] = useState(true);
  const [useSameAmount, setUseSameAmount] = useState(true);
  const [tokens, setTokens] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [amounts, setAmounts] = useState([]);
  
const [editingRow, setEditingRow] = useState(null);
const [editedAllowance, setEditedAllowance] = useState({
  friend: '',
  token: '',
  allowable: '',
});

const handleEditClick = (allowance) => {
  setEditingRow(allowance.hash); // Set the editing row to the selected row
  setEditedAllowance({
    friend: allowance.friend,
    token: allowance.token,
    allowable: allowance.allowable,
  });
};

const handleCancelEdit = () => {
  setEditingRow(null); // Reset the editing row
};

const handleSaveEdit = (hash) => {
  // Here you would handle saving the updated allowance data
  console.log(`Saving changes for ${hash}`, editedAllowance);
  setEditingRow(null); // Reset editing after save
};

const handleChange = (e) => {
  setEditedAllowance({
    ...editedAllowance,
    [e.target.name]: e.target.value,
  });
};
  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 text-gray-800">
      <a href="https://addrs.to/">
        <img
          className="absolute top-4 right-4 rounded-full"
          style={{ maxWidth: '50px' }}
          src={'https://addrs.to/a.png'}
          alt="Selected NFT Image"
        />
      </a>
      <main className="mx-auto py-8 px-4 lg:px-0">
        <h1 className="text-center text-4xl mb-2 text-white font-extrabold">
          Stream - in Alpha
        </h1>
  {/* Switch Container */}<div className="relative mx-auto flex items-center mb-8">
  <label htmlFor="pro" className="items-center cursor-pointer mx-auto">
    {/* Hidden Checkbox */}
    <div className="text-white font-semibold">Pro Mode</div>
    <div>
    <input
      type="checkbox"
      id="pro"
      name="pro"
      checked={pro}
      onChange={(e) => setPro(e.target.checked)}
      className="sr-only"
    />
    {/* Switch Background */}
    <div
      className={`relative  ml-2 w-14 h-8 bg-gray-300 rounded-full p-1 transition-colors duration-300 ease-in-out ${
        pro ? 'bg-pink-500' : ''
      }`}
    >
      {/* Switch Handle */}
      <div
        className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform transform ${
          pro ? 'translate-x-6' : ''
        }`}
      ></div></div>
    </div>
  </label>
</div>

        
        <Toaster />
  {!pro &&(<div className="text-center mb-8 max-w-4xl mx-auto">
        {/* Borrow Form Section */}
        <section className="bg-white p-8 rounded-3xl shadow-2xl mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl text-pink-600 font-bold">
              Stream tokens from your wallet, no locking tokens, no interest, no fees.
            </h2>
          </div>
          {/* Form for borrowing */}
          <div className="space-y-6">
            {/* Token Select */}
            <div>
              <label htmlFor="token" className="block mb-2 font-semibold text-gray-600">
                Token Address:
              </label>
              <select
                id="token"
                name="token"
                value={stoken}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
              >
                <option value="">{stoken ? stoken : 'Select a token'}</option>
                {ChainId === 1 && (
                  <>
                    <option value="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2">wETH</option>
                    <option value="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48">USDC</option>
                    <option value="0xdac17f958d2ee523a2206206994597c13d831ec7">USDT</option>
                  </>
                )}
                {ChainId === 8453 && (
                  <>
                    <option value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</option>
                    <option value="0x4200000000000000000000000000000000000006">wETH</option>
                    </>
                )}
                <option value="custom">Custom</option>
              </select>
              {stoken === 'custom' && (
                <input
                  type="text"
                  id="customToken"
                  name="customToken"
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="w-full p-3 mt-2 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  placeholder="Enter custom token address"
                />
              )}
            </div>
            {/* Friend and Amount Fields */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="friend" className="block mb-2 font-semibold text-gray-600">
                  To Address/ENS:
                </label>
                <input
                  type="text"
                  id="friend"
                  name="friend"
                  value={friend}
                  onChange={(e) => setFriend(e.target.value)}
                  required
                  className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="amount" className="block mb-2 font-semibold text-gray-600">
                  Stream Amount:
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                />
              </div>
            </div>
            {/* Time Fields */}
            <div className="flex space-x-4">
              {!once && (
                <div className="flex-1">
                  <label htmlFor="days" className="block mb-2 font-semibold text-gray-600">
                    Days to Stream Amount:
                  </label>
                  <input
                    type="number"
                    id="days"
                    name="days"
                    step="0.01"
                    onChange={(e) => setWindow(e.target.value)}
                    required
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
              )}
              {once && (
                <div className="flex-1">
                  <label htmlFor="endDate" className="block mb-2 font-semibold text-gray-600">
                    End Date:
                  </label>
                  <input
                    type="datetime-local"
                    id="endDate"
                    name="endDate"
                    onChange={(e) => {
                      const selectedDate = new Date(e.target.value);
                      const currentDate = new Date();
                      const windowInSeconds = Math.floor((selectedDate - currentDate) / 1000);
                      setWindow(windowInSeconds);
                    }}
                    required
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
              )}
            </div>
            {/* Once Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-orange-400 font-semibold">{!once && 'Unlimited'}</span>
                <span className="text-gray-600">Stream</span>
                <span className="text-green-400 font-semibold">{once && 'Once only'}</span>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="once"
                  name="once"
                  checked={once}
                  onChange={(e) => setOnce(e.target.checked)}
                  className="toggle-checkbox"
                />
                <span className="toggle-slider round"></span>
              </label>
            </div>
            {/* Action Buttons */}
            <button
              onClick={() => requestBorrow(stoken, friend, amount)}
              className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
            >
              Set Allowance
            </button>
            <button
              onClick={() => location.assign('https://spot.pizza/')}
              className="w-full py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition duration-300 ease-in-out"
            >
              Check out Spot🍕
            </button>
            <ConnectButton />
          </div>
        </section>
  
        {/* Borrows by Lender Section */}
        <section className="container mt-8">
          <h2 className="text-xl text-pink-600 font-bold mb-4">Friends That Have Spotted Me</h2>
          {Object.entries(
            borrows.reduce((acc, borrow) => {
              if (!acc[borrow.lender]) {
                acc[borrow.lender] = [];
              }
              acc[borrow.lender].push(borrow);
              return acc;
            }, {})
          ).map(([lender, lenderBorrows]) => (
            <div key={lender} className="bg-white p-6 rounded-xl shadow-md space-y-4 subscription-item">
              <h3 className="text-xl text-pink-600 font-semibold text-gray-700 mb-2">
                {ENS(lender, ENSCache, setENSCache)}
              </h3>
              {/* Updated grid class here */}
              <div
  className={`grid gap-6 grid-cols-1 ${
    lenderBorrows.length >= 2 ? 'md:grid-cols-2' : ''
  } ${lenderBorrows.length >= 3 ? 'lg:grid-cols-3' : ''} center-items`}
>                {lenderBorrows.map((borrow) => (
                  <div key={borrow.hash} className="space-y-2 container max-w-md mx-auto">
                    <div className="items-center justify-between mb-4">
                      <div>
                        <p className="item-label">🪙 Token:</p>
                        <p className="item-value text-xl font-bold">{borrow.token.substring(0, 20)}</p>
                      </div>
                    </div>
  
                    <div className="flex space-x-4 mb-4">
                      <div className="flex-1">
                        <p className="item-label">💸 Allowable:</p>
                        <p className="item-value font-semibold">{borrow.allowable}</p>
                      </div>
                      <div className="flex-1">
                        <p className="item-label">💰 Available:</p>
                        <p className="item-value font-semibold">
                          {(displayedAvailableBorrowAmounts[borrow.hash] || 0).toFixed(6)}
                        </p>
                      </div>
                    </div>
  
                    <div className="mb-4">
                      <p className="item-label">📊 Volume Streamed:</p>
                      <p className="item-value">{borrow.totalStreamed}</p>
                    </div>
  
                    <div className="flex space-x-4 mb-4">
                      <div className="flex-1">
                        <p className="item-label">⏳ Allowance Type:</p>
                        <p
                          className={`item-value font-semibold ${
                            borrow.once ? 'text-green-500' : 'text-orange-500'
                          }`}
                        >
                          {borrow.once ? 'Once only' : 'Unlimited'}
                        </p>
                      </div>
                      <div className="flex-1">
                        <p className="item-label">⌛ Remaining Time:</p>
                        <p className="item-value">
                          {!borrow.once ? (
                            <span>
                              @ {borrow.allowable} tokens per{' '}
                              {Math.floor(borrow.window / (3600 * 24))}d{' '}
                              {Math.floor((borrow.window % (3600 * 24)) / 3600)}h{' '}
                              {Math.floor((borrow.window % 3600) / 60)}m{' '}
                              {Math.floor(borrow.window % 60)}s
                            </span>
                          ) : (
                            <span>
                              ends in{' '}
                              {Math.floor(
                                (borrow.timestamp +
                                  (borrow.outstanding * borrow.window) / borrow.allowable -
                                  Date.now() / 1000) /
                                  3600
                              )}
                              h{' '}
                              {Math.floor(
                                ((borrow.timestamp +
                                  (borrow.outstanding * borrow.window) / borrow.allowable -
                                  Date.now() / 1000) %
                                  3600) /
                                  60
                              )}
                              m{' '}
                              {Math.floor(
                                (borrow.timestamp +
                                  (borrow.outstanding * borrow.window) / borrow.allowable -
                                  Date.now() / 1000) %
                                  60
                              )}
                              s
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
  
                    <button
                      onClick={() => handleBorrow(borrow.token, borrow.lender)}
                      className="bg-green-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-green-600 transition duration-300 ease-in-out w-full"
                    >
                      Claim
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
  
        {/* Allowances to Friends Section */}
        <section className="container mt-8">
          <h2 className="text-xl text-pink-600 font-bold mb-4">Allowances to Friends</h2>
          <div className="">
            {Object.entries(
              allowances.reduce((acc, allowance) => {
                if (!acc[allowance.friend]) {
                  acc[allowance.friend] = [];
                }
                acc[allowance.friend].push(allowance);
                return acc;
              }, {})
            ).map(([friend, friendAllowances]) => (
              <div key={friend} className="bg-white p-6 rounded-xl shadow-md space-y-4 subscription-item">
                <h3 className="text-xl font-semibold text-gray-700 mb-2 text-pink-600">
                  {ENS(friend, ENSCache, setENSCache)}
                </h3>
                <div
  className={`grid gap-6 grid-cols-1 ${
    friendAllowances.length >= 2 ? 'md:grid-cols-2' : ''
  } ${friendAllowances.length >= 3 ? 'lg:grid-cols-3' : ''} center-items`}
>                  {friendAllowances.map((allowance, idx) => (
                    <div key={idx} className="space-y-2 container max-w-md mx-auto">
                      <div className="items-center justify-between mb-4">
                        <div>
                          <p className="item-label">🪙 Token:</p>
                          <p className="item-value font-bold">{allowance.token.substring(0, 20)}</p>
                        </div>
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <p className="item-label">💸 Allowable:</p>
                            <p className="item-value font-semibold">{allowance.allowable}</p>
                          </div>
                          <div className="flex-1">
                            <p className="item-label">💰 Available:</p>
                            <p className="item-value font-semibold">
                              {(displayedAvailableAmounts[allowance.hash] || 0).toFixed(6)}
                            </p>
                          </div>
                        </div>
                      </div>
  
                      <div className="mb-4">
                        <p className="item-label">📊 Volume Streamed:</p>
                        <p className="item-value">{allowance.totalStreamed}</p>
                      </div>
                      <div className="flex space-x-4 mb-4">
                        <div className="flex-1">
                          <p className="item-label">⏳ Allowance Type:</p>
                          <p
                            className={`item-value font-semibold ${
                              allowance.once ? 'text-green-500' : 'text-orange-500'
                            }`}
                          >
                            {allowance.once ? 'Once only' : 'Unlimited'}
                          </p>
                        </div>
                        <div className="flex-1">
                          <p className="item-label">⌛ Remaining Time:</p>
                          <p className="item-value">
                            {!allowance.once ? (
                              <span>{allowance.allowable} every {Math.floor(allowance.window / (3600 * 24))}d{' '}
                                {Math.floor((allowance.window % (3600 * 24)) / 3600)}h{' '}
                                {Math.floor((allowance.window % 3600) / 60)}m{' '}
                                {Math.floor(allowance.window % 60)}s
                              </span>
                            ) : (
                              <span>
                                ends in{' '}
                                {Math.floor(
                                  (allowance.timestamp +
                                    (allowance.outstanding * allowance.window) / allowance.allowable -
                                    Date.now() / 1000) /
                                    3600
                                )}
                                h{' '}
                                {Math.floor(
                                  ((allowance.timestamp +
                                    (allowance.outstanding * allowance.window) / allowance.allowable -
                                    Date.now() / 1000) %
                                    3600) /
                                    60
                                )}
                                m{' '}
                                {Math.floor(
                                  (allowance.timestamp +
                                    (allowance.outstanding * allowance.window) / allowance.allowable -
                                    Date.now() / 1000) %
                                    60
                                )}
                                s
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
  
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="flex-1">
                          <input
                            type="text"
                            id="token"
                            name="token"
                            placeholder="Amount"
                            onChange={(e) => setAmount(e.target.value)}
                            className="p-3 w-full bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                          />
                        </div>
                        <div className="flex-1">
                          <input
                            type="number"
                            id="amount"
                            name="amount"
                            step="0.01"
                            placeholder="Days"
                            onChange={(e) => setWindow(e.target.value)}
                            required
                            className="p-3 w-full bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                          />
                        </div>
                      </div>
  
                      <div className="flex items-center space-x-4 mb-4">
                        <label className="flex items-center space-x-2">
                          <span className="item-label font-semibold">{once === true ? 'Once' : 'Unlimited'}</span>
                          <label className="switch relative inline-block w-12 h-6">
                            <input
                              type="checkbox"
                              id="once"
                              name="once"
                              checked={once}
                              onChange={(e) => setOnce(e.target.checked)}
                              className="opacity-0 w-0 h-0"
                            />
                            <span className="toggle-slider round absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-300 transition duration-300 ease-in-out before:absolute before:content-[''] before:h-5 before:w-5 before:bg-white before:top-0.5 before:left-0.5 before:rounded-full"></span>
                          </label>
                        </label>
                      </div>
  
                      <button
                        onClick={() => requestBorrow(allowance.token, friend, amount)}
                        className="bg-green-500 text-white font-semibold py-3 px-6 rounded-full hover:bg-green-600 transition duration-300 ease-in-out w-full"
                      >
                        Set Allowance
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section></div>)}{pro && (
  <>
    {/* Batch Stream Section */}<section className="bg-white p-8 rounded-3xl shadow-2xl mb-8 mx-auto max-w-4xl">
  <div className="text-center mb-8">
    <h2 className="text-2xl text-pink-600 font-bold">Stream tokens to multiple recipients</h2>
  </div>

  {/* Recipient Addresses Input */}
  <div>
    <label htmlFor="recipients" className="block mb-2 font-semibold text-gray-600">
      Recipient Addresses (Comma-separated):
    </label>
    <textarea
      id="recipients"
      name="recipients"
      placeholder="Enter recipient addresses, separated by commas"
      onChange={(e) => setRecipients(e.target.value.split(','))}
      className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
    ></textarea>
  </div>

  {/* Switches */}
  <div className="flex items-center space-x-4 my-6">
    <label className="text-lg font-semibold">Use Single Token for All</label>
    <input
      type="checkbox"
      checked={useSingleToken}
      onChange={() => setUseSingleToken(!useSingleToken)}
      className="toggle-slider rounded-full"
    />
  </div>

  {/* Form for Batch Allow Stream */}
  <div className="space-y-6">
    {useSingleToken ? (
      <div>
        <label htmlFor="token" className="block mb-2 font-semibold text-gray-600">
          Token Address:
        </label>
        <input
          type="text"
          id="token"
          name="token"
          placeholder="Enter token address"
          onChange={(e) => setToken(e.target.value)}
          className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
        />
      </div>
    ) : (
      <div>
        <label htmlFor="tokens" className="block mb-2 font-semibold text-gray-600">
          Token Addresses (Comma-separated):
        </label>
        <textarea
          id="tokens"
          name="tokens"
          placeholder="Enter token addresses, separated by commas"
          onChange={(e) => setTokens(e.target.value.split(','))}
          className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
        ></textarea>
      </div>
    )}

    <div className="flex items-center space-x-4 my-6">
      <label className="text-lg font-semibold">Use Same Amount for All</label>
      <input
        type="checkbox"
        checked={useSameAmount}
        onChange={() => setUseSameAmount(!useSameAmount)}
        className="toggle-checkbox rounded-full"
      />
    </div>

    {useSameAmount ? (
      <div>
        <label htmlFor="amount" className="block mb-2 font-semibold text-gray-600">
          Stream Amount (Same for All):
        </label>
        <input
          type="text"
          id="amount"
          name="amount"
          placeholder="Enter stream amount"
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
        />
      </div>
    ) : (
      <div>
        <label htmlFor="amounts" className="block mb-2 font-semibold text-gray-600">
          Stream Amounts (Comma-separated):
        </label>
        <textarea
          id="amounts"
          name="amounts"
          placeholder="Enter stream amounts, separated by commas"
          onChange={(e) => setAmounts(e.target.value.split(','))}
          className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
        ></textarea>
      </div>
    )}

    <div className="flex space-x-4">
      {!once && (
        <div className="flex-1">
          <label htmlFor="days" className="block mb-2 font-semibold text-gray-600">
            Days to Stream Amount:
          </label>
          <input
            type="number"
            id="days"
            name="days"
            step="0.01"
            onChange={(e) => setWindow(e.target.value)}
            required
            className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
          />
        </div>
      )}
      {once && (
        <div className="flex-1">
          <label htmlFor="endDate" className="block mb-2 font-semibold text-gray-600">
            End Date:
          </label>
          <input
            type="datetime-local"
            id="endDate"
            name="endDate"
            onChange={(e) => {
              const selectedDate = new Date(e.target.value);
              const currentDate = new Date();
              const windowInSeconds = Math.floor((selectedDate - currentDate) / 1000);
              setWindow(windowInSeconds);
            }}
            required
            className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
          />
        </div>
      )}
    </div>

    {/* Once Toggle */}
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-orange-400 font-semibold">{!once && 'Unlimited'}</span>
        <span className="text-gray-600">Stream</span>
        <span className="text-green-400 font-semibold">{once && 'Once only'}</span>
      </div>
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="once"
          name="once"
          checked={once}
          onChange={(e) => setOnce(e.target.checked)}
          className="toggle-checkbox"
        />
        <span className="toggle-slider round"></span>
      </label>
    </div>

    <button
      className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
      onClick={() => batchStream()}
    >
      Set Batch Allowance
    </button>
    <ConnectButton />
  </div>
</section>


    {/* Borrows by Lender Section */}
    <section className="mt-8 mx-auto bg-white p-8 rounded-3xl shadow-2xl w-11/12">
      <h2 className="text-xl text-pink-600 font-bold mb-4">Friends That Have Spotted Me</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead>
            <tr className="bg-pink-500 text-white text-left">
              <th className="px-6 py-3 font-semibold text-sm">Lender</th>
              <th className="px-6 py-3 font-semibold text-sm">Token</th>
              <th className="px-6 py-3 font-semibold text-sm">Allowable</th>
              <th className="px-6 py-3 font-semibold text-sm">Available</th>
              <th className="px-6 py-3 font-semibold text-sm">Volume Streamed</th>
              <th className="px-6 py-3 font-semibold text-sm">Allowance Type</th>
              <th className="px-6 py-3 font-semibold text-sm">Remaining Time</th>
              <th className="px-6 py-3 font-semibold text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {borrows.map((borrow, idx) => (
              <tr key={borrow.hash} className={idx % 2 === 0 ? 'bg-pink-100' : 'bg-white'}>
                <td className="px-6 py-4">{borrow.lender}</td>
                <td className="px-6 py-4">{borrow.token.substring(0, 20)}</td>
                <td className="px-6 py-4">{borrow.allowable}</td>
                <td className="px-6 py-4">{(displayedAvailableBorrowAmounts[borrow.hash] || 0).toFixed(6)}</td>
                <td className="px-6 py-4">{borrow.totalStreamed}</td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${borrow.once ? 'text-green-500' : 'text-orange-500'}`}>
                    {borrow.once ? 'Once only' : 'Unlimited'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {!borrow.once ? (
                    <span>
                      @ {borrow.allowable} tokens per{' '}
                      {Math.floor(borrow.window / (3600 * 24))}d{' '}
                      {Math.floor((borrow.window % (3600 * 24)) / 3600)}h{' '}
                      {Math.floor((borrow.window % 3600) / 60)}m{' '}
                      {Math.floor(borrow.window % 60)}s
                    </span>
                  ) : (
                    <span>
                      ends in{' '}
                      {Math.floor(
                        (borrow.timestamp +
                          (borrow.outstanding * borrow.window) / borrow.allowable -
                          Date.now() / 1000) /
                          3600
                      )}
                      h{' '}
                      {Math.floor(
                        ((borrow.timestamp +
                          (borrow.outstanding * borrow.window) / borrow.allowable -
                          Date.now() / 1000) %
                          3600) /
                          60
                      )}
                      m{' '}
                      {Math.floor(
                        (borrow.timestamp +
                          (borrow.outstanding * borrow.window) / borrow.allowable -
                          Date.now() / 1000) %
                          60
                      )}
                      s
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleBorrow(borrow.tokenAddrs, borrow.lender)}
                    className="bg-green-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-600 transition duration-300 ease-in-out"
                  >
                    Claim
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    {/* Allowances to Friends Section */}
    <section className="mt-8 mx-auto bg-white p-8 rounded-3xl shadow-2xl mb-8 w-11/12">
      <h2 className="text-xl text-pink-600 font-bold mb-4">Allowances to Friends</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
          <thead>
            <tr className="bg-pink-500 text-white text-left">
              <th className="px-6 py-3 font-semibold text-sm">Friend</th>
              <th className="px-6 py-3 font-semibold text-sm">Token</th>
              <th className="px-6 py-3 font-semibold text-sm">Allowable</th>
              <th className="px-6 py-3 font-semibold text-sm">Available</th>
              <th className="px-6 py-3 font-semibold text-sm">Volume Streamed</th>
              <th className="px-6 py-3 font-semibold text-sm">Allowance Type</th>
              <th className="px-6 py-3 font-semibold text-sm">Remaining Time</th>
              <th className="px-6 py-3 font-semibold text-sm">Action</th>
            </tr>
          </thead>
          <tbody>
            {allowances.sort((a, b) => a.friend.localeCompare(b.friend)).map((allowance, idx) => (
              <tr key={allowance.hash} className={idx % 2 === 0 ? 'bg-pink-100' : 'bg-white'}>
                {editingRow === allowance.hash ? (
                  <>
                    <td className="px-6 py-4">{allowance.friend.substring(0, 20)}</td>
                    <td className="px-6 py-4">{allowance.token.substring(0, 20)}</td>
                    
                    {/* Editable Allowable Field */}
                    <td className="px-6 py-4">
                      <input
                        type="text"
                        name="allowable"
                        value={editedAllowance.allowable}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    
                    {/* Display Available */}
                    <td className="px-6 py-4">{(displayedAvailableAmounts[allowance.hash] || 0).toFixed(6)}</td>
                    
                    <td className="px-6 py-4">{allowance.totalStreamed}</td>

                    {/* Editable Allowance Type Field */}
                    <td className="px-6 py-4">
                      <select
                        name="once"
                        value={editedAllowance.once ? 'Once only' : 'Unlimited'}
                        onChange={(e) => setOnce(e.target.value === 'Once only')}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="Unlimited">Unlimited</option>
                        <option value="Once only">Once only</option>
                      </select>
                    </td>

                    {/* Editable Remaining Time Field */}
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        name="window"
                        value={editedAllowance.window}
                        onChange={(e) => setWindow(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Enter remaining time (in seconds)"
                      />
                    </td>

                    <td className="px-6 py-4">
                      <button
                        onClick={() => requestBorrow(allowance.tokenAddrs, allowance.friend)}
                        className="bg-green-500 text-white font-semibold py-2 px-4 m-1 rounded-full hover:bg-green-600 transition duration-300 ease-in-out"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-gray-600 transition duration-300 ease-in-out"
                      >
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4">{allowance.friend}</td>
                    <td className="px-6 py-4">{allowance.token.substring(0, 20)}</td>
                    <td className="px-6 py-4">{allowance.allowable}</td>
                    <td className="px-6 py-4">{(displayedAvailableAmounts[allowance.hash] || 0).toFixed(6)}</td>
                    <td className="px-6 py-4">{allowance.totalStreamed}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${allowance.once ? 'text-green-500' : 'text-orange-500'}`}>
                        {allowance.once ? 'Once only' : 'Unlimited'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {!allowance.once ? (
                        <span>{allowance.allowable} tokens every {Math.floor(allowance.window / (3600 * 24))}d{' '}
                          {Math.floor((allowance.window % (3600 * 24)) / 3600)}h{' '}
                          {Math.floor((allowance.window % 3600) / 60)}m{' '}
                          {Math.floor(allowance.window % 60)}s
                        </span>
                      ) : (
                        <span>
                          ends in{' '}
                          {Math.floor(
                            (allowance.timestamp +
                              (allowance.outstanding * allowance.window) / allowance.allowable -
                              Date.now() / 1000) /
                              3600
                          )}
                          h{' '}
                          {Math.floor(
                            ((allowance.timestamp +
                              (allowance.outstanding * allowance.window) / allowance.allowable -
                              Date.now() / 1000) %
                              3600) /
                              60
                          )}
                          m{' '}
                          {Math.floor(
                            (allowance.timestamp +
                              (allowance.outstanding * allowance.window) / allowance.allowable -
                              Date.now() / 1000) %
                              60
                          )}
                          s
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEditClick(allowance)}
                        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-full hover:bg-blue-600 transition duration-300 ease-in-out"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => requestBorrow(allowance.tokenAddrs, allowance.friend,0)}
                        className="bg-red-300 text-white font-semibold py-2 px-2 rounded-full hover:bg-red-600 transition duration-300 ease-in-out ml-2"
                      >
                      🗑️
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    <div className="flex items-center justify-center">
    <button
              onClick={() => handledepoly()}
              className="p-3 mx-auto bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300 ease-in-out"
            >
              Deploy to Current Network
              </button>
              </div>
  </>
)}


      </main>
    </div>
  );
  
};

export default Stream;
