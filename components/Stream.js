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
  let ContractAddress = '0x7d189ce0945cb89c00516f4957d4d739279e1ccd';
  const ContractABI = [{"inputs":[{"internalType":"address payable","name":"feeAddrs","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"streamer","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"StreamAllowed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"streamer","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"StreamFailure","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"streamer","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Streamed","type":"event"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"name":"allowStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256[]","name":"windows","type":"uint256[]"},{"internalType":"bool[]","name":"onces","type":"bool[]"}],"name":"batchAllowStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"batchComputeHash","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"batchStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"batchStreamAvailable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"}],"name":"batchStreamAvailableAllowances","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"cancelStreams","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"computeHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeAddress","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"getAvailable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"}],"name":"getStreamDetails","outputs":[{"internalType":"uint256[]","name":"availableAmounts","type":"uint256[]"},{"internalType":"uint8[]","name":"decimals","type":"uint8[]"},{"internalType":"string[]","name":"tokenNames","type":"string[]"},{"internalType":"string[]","name":"tokenSymbols","type":"string[]"},{"components":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"totalStreamed","type":"uint256"},{"internalType":"uint256","name":"outstanding","type":"uint256"},{"internalType":"uint256","name":"allowable","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"internalType":"struct Stream.StreamDetails[]","name":"details","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"}],"name":"getStreamable","outputs":[{"internalType":"bool[]","name":"canStream","type":"bool[]"},{"internalType":"uint256[]","name":"balances","type":"uint256[]"},{"internalType":"uint256[]","name":"allowances","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"},{"internalType":"address","name":"newFeeAddress","type":"address"}],"name":"setFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"stream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"streamDetails","outputs":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"totalStreamed","type":"uint256"},{"internalType":"uint256","name":"outstanding","type":"uint256"},{"internalType":"uint256","name":"allowable","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"streamDetailsByRecipient","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"streamDetailsByStreamer","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"}],"name":"viewRecipientAllowances","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"streamer","type":"address"}],"name":"viewStreamerAllowances","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"}]
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

  account = account.address;
  let contract = new ethers.Contract(ContractAddress, ContractABI, provider);
  let token;

  provider.addListener('network', (newNetwork, oldNetwork) => {
    console.log('newNetwork', newNetwork, 'oldNetwork', oldNetwork);
    try {
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
            available: availableAmounts[index],
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
        if (allowance < (once?ethers.parseUnits(amount, decimals):ethers.MaxUint256)) {
         
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
    const tx = await contract.safeCreate2('0x0000000000000000000000000000000000000000000000000000000000000000','0x'+'608060405234801562000010575f80fd5b5060405162004af138038062004af18339818101604052810190620000369190620000e2565b8060035f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505062000112565b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f620000ac8262000081565b9050919050565b620000be81620000a0565b8114620000c9575f80fd5b50565b5f81519050620000dc81620000b3565b92915050565b5f60208284031215620000fa57620000f96200007d565b5b5f6200010984828501620000cc565b91505092915050565b6149d180620001205f395ff3fe608060405234801561000f575f80fd5b5060043610610129575f3560e01c8063a136572d116100ab578063c098c4b01161006f578063c098c4b01461036b578063cb5e174c1461039b578063d4628ec6146103b7578063db0b5b24146103e9578063ddca3f431461041957610129565b8063a136572d146102b3578063b3bfd06f146102e7578063b416af7414610303578063b4f2e8b814610333578063b8b396911461034f57610129565b80635f261713116100f25780635f261713146101ff578063743a29bd1461021b5780638b614d091461024b578063993080c2146102675780639cc0d08f1461028357610129565b80624790c11461012d57806318fd373e1461015d57806338cddec6146101955780634010d972146101b157806341275358146101e1575b5f80fd5b61014760048036038101906101429190612efb565b610437565b6040516101549190612f63565b60405180910390f35b61017760048036038101906101729190612faf565b610565565b60405161018c99989796959493929190613003565b60405180910390f35b6101af60048036038101906101aa9190612efb565b610617565b005b6101cb60048036038101906101c6919061308e565b6108f6565b6040516101d89190613170565b60405180910390f35b6101e9610989565b6040516101f691906131b0565b60405180910390f35b6102196004803603810190610214919061322a565b6109ae565b005b61023560048036038101906102309190612efb565b610d4d565b60405161024291906132e9565b60405180910390f35b6102656004803603810190610260919061344a565b610d82565b005b610281600480360381019061027c9190613551565b611019565b005b61029d6004803603810190610298919061361f565b611693565b6040516102aa91906132e9565b60405180910390f35b6102cd60048036038101906102c891906136b2565b6116be565b6040516102de959493929190613b28565b60405180910390f35b61030160048036038101906102fc919061322a565b611c75565b005b61031d6004803603810190610318919061322a565b611d77565b60405161032a9190613170565b60405180910390f35b61034d60048036038101906103489190613b9c565b611ef1565b005b61036960048036038101906103649190613c04565b612037565b005b6103856004803603810190610380919061308e565b612438565b6040516103929190613170565b60405180910390f35b6103b560048036038101906103b09190613d25565b6124cb565b005b6103d160048036038101906103cc91906136b2565b612627565b6040516103e093929190613ee4565b60405180910390f35b61040360048036038101906103fe919061361f565b612adb565b60405161041091906132e9565b60405180910390f35b610421612b06565b60405161042e9190612f63565b60405180910390f35b5f80610444848685610d4d565b90505f805f8381526020019081526020015f2090505f73ffffffffffffffffffffffffffffffffffffffff16815f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036104e9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104e090613f88565b60405180910390fd5b5f4290505f8260070154826104fe9190613fd3565b90505f83600601548285600501546105169190614006565b6105209190614074565b9050836004015481118015610549575060011515846008015f9054906101000a900460ff161515145b1561055657836004015490505b80955050505050509392505050565b5f602052805f5260405f205f91509050805f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690806001015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690806002015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1690806003015490806004015490806005015490806006015490806007015490806008015f9054906101000a900460ff16905089565b5f610623838584610d4d565b90505f805f8381526020019081526020015f2090505f73ffffffffffffffffffffffffffffffffffffffff16815f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036106c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016106bf90613f88565b60405180910390fd5b5f4290505f8260070154826106dd9190613fd3565b90505f83600601548285600501546106f59190614006565b6106ff9190614074565b9050836004015481118015610728575060011515846008015f9054906101000a900460ff161515145b1561073557836004015490505b5f8111610777576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161076e906140ee565b60405180910390fd5b836008015f9054906101000a900460ff16156107a85780846004015f8282546107a09190613fd3565b925050819055505b80846003015f8282546107bb919061410c565b925050819055508284600701819055506107f88787838b73ffffffffffffffffffffffffffffffffffffffff16612b0c909392919063ffffffff16565b5f6004541115610870575f6103e8600454836108149190614006565b61081e9190614074565b905061086e8860035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16838c73ffffffffffffffffffffffffffffffffffffffff16612b0c909392919063ffffffff16565b505b8573ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff167faf22af5691f06aea5afb81f1b3d51a6ecb1847e7ff25422fff392cbf52da2326846040516108e49190612f63565b60405180910390a45050505050505050565b606060025f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2080548060200260200160405190810160405280929190818152602001828054801561097d57602002820191905f5260205f20905b815481526020019060010190808311610969575b50505050509050919050565b60035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b83839050868690501480156109c857508181905084849050145b610a07576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016109fe90614189565b60405180910390fd5b5f5b86869050811015610d4457848482818110610a2757610a266141a7565b5b9050602002016020810190610a3c919061308e565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161480610ac75750828282818110610a8357610a826141a7565b5b9050602002016020810190610a98919061308e565b73ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16145b610b06576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610afd90614244565b60405180910390fd5b5f610b87868684818110610b1d57610b1c6141a7565b5b9050602002016020810190610b32919061308e565b898985818110610b4557610b446141a7565b5b9050602002016020810190610b5a919061308e565b868686818110610b6d57610b6c6141a7565b5b9050602002016020810190610b82919061308e565b610d4d565b90505f805f8381526020019081526020015f2090505f73ffffffffffffffffffffffffffffffffffffffff16815f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610c2c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c2390613f88565b60405180910390fd5b5f81600501819055505f8160040181905550848484818110610c5157610c506141a7565b5b9050602002016020810190610c66919061308e565b73ffffffffffffffffffffffffffffffffffffffff16898985818110610c8f57610c8e6141a7565b5b9050602002016020810190610ca4919061308e565b73ffffffffffffffffffffffffffffffffffffffff16888886818110610ccd57610ccc6141a7565b5b9050602002016020810190610ce2919061308e565b73ffffffffffffffffffffffffffffffffffffffff167fcf8d64e381fa4c6934a7d60007173d92e3e32d0d11698bbb69f14e04fa2c4a895f604051610d2791906142a4565b60405180910390a450508080610d3c906142bd565b915050610a09565b50505050505050565b5f838383604051602001610d6393929190614349565b6040516020818303038152906040528051906020012090509392505050565b5f815167ffffffffffffffff811115610d9e57610d9d613312565b5b604051908082528060200260200182016040528015610dcc5781602001602082028036833780820191505090505b5090505f825167ffffffffffffffff811115610deb57610dea613312565b5b604051908082528060200260200182016040528015610e195781602001602082028036833780820191505090505b5090505f835167ffffffffffffffff811115610e3857610e37613312565b5b604051908082528060200260200182016040528015610e665781602001602082028036833780820191505090505b5090505f5b8451811015611007575f805f878481518110610e8a57610e896141a7565b5b602002602001015181526020019081526020015f209050806002015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16858381518110610ed857610ed76141a7565b5b602002602001019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050805f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16848381518110610f4857610f476141a7565b5b602002602001019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050806001015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16838381518110610fb957610fb86141a7565b5b602002602001019073ffffffffffffffffffffffffffffffffffffffff16908173ffffffffffffffffffffffffffffffffffffffff1681525050508080610fff906142bd565b915050610e6b565b50611013838383611019565b50505050565b8151835114801561102b575080518251145b61106a576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161106190614189565b60405180910390fd5b5f5b835181101561168d575f848281518110611089576110886141a7565b5b602002602001015190505f8483815181106110a7576110a66141a7565b5b602002602001015190505f8484815181106110c5576110c46141a7565b5b602002602001015190505f6110db838584610d4d565b90505f805f8381526020019081526020015f2090505f73ffffffffffffffffffffffffffffffffffffffff16815f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036111c9578273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff167f8f8aa0dc1312c50d248cb1d3452303f977e220adb4d4c1772bf13036c4347ffa6040516111b790613f88565b60405180910390a4505050505061167a565b5f4290505f8260070154826111de9190613fd3565b90505f83600601548285600501546111f69190614006565b6112009190614074565b9050836004015481118015611229575060011515846008015f9054906101000a900460ff161515145b1561123657836004015490505b5f81036112c4578573ffffffffffffffffffffffffffffffffffffffff168773ffffffffffffffffffffffffffffffffffffffff168973ffffffffffffffffffffffffffffffffffffffff167f8f8aa0dc1312c50d248cb1d3452303f977e220adb4d4c1772bf13036c4347ffa6040516112af906140ee565b60405180910390a4505050505050505061167a565b5f8060045411156112ed576103e8600454836112e09190614006565b6112ea9190614074565b90505b5f81836112fa919061410c565b90505f8a73ffffffffffffffffffffffffffffffffffffffff166370a082318b6040518263ffffffff1660e01b81526004016113369190614385565b602060405180830381865afa158015611351573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061137591906143b2565b905081811015611409578873ffffffffffffffffffffffffffffffffffffffff168a73ffffffffffffffffffffffffffffffffffffffff168c73ffffffffffffffffffffffffffffffffffffffff167f8f8aa0dc1312c50d248cb1d3452303f977e220adb4d4c1772bf13036c4347ffa6040516113f19061444d565b60405180910390a4505050505050505050505061167a565b5f8b73ffffffffffffffffffffffffffffffffffffffff1663dd62ed3e8c306040518363ffffffff1660e01b815260040161144592919061446b565b602060405180830381865afa158015611460573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061148491906143b2565b905082811015611519578973ffffffffffffffffffffffffffffffffffffffff168b73ffffffffffffffffffffffffffffffffffffffff168d73ffffffffffffffffffffffffffffffffffffffff167f8f8aa0dc1312c50d248cb1d3452303f977e220adb4d4c1772bf13036c4347ffa60405161150090614502565b60405180910390a450505050505050505050505061167a565b876008015f9054906101000a900460ff161561154a5784886004015f8282546115429190613fd3565b925050819055505b84886003015f82825461155d919061410c565b9250508190555086886007018190555061159a8b8b878f73ffffffffffffffffffffffffffffffffffffffff16612b0c909392919063ffffffff16565b5f8411156115f1576115f08b60035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16868f73ffffffffffffffffffffffffffffffffffffffff16612b0c909392919063ffffffff16565b5b8973ffffffffffffffffffffffffffffffffffffffff168b73ffffffffffffffffffffffffffffffffffffffff168d73ffffffffffffffffffffffffffffffffffffffff167faf22af5691f06aea5afb81f1b3d51a6ecb1847e7ff25422fff392cbf52da2326886040516116659190612f63565b60405180910390a45050505050505050505050505b8080611685906142bd565b91505061106c565b50505050565b6002602052815f5260405f2081815481106116ac575f80fd5b905f5260205f20015f91509150505481565b60608060608060605f8787905090508067ffffffffffffffff8111156116e7576116e6613312565b5b60405190808252806020026020018201604052801561172057816020015b61170d612e09565b8152602001906001900390816117055790505b5091508067ffffffffffffffff81111561173d5761173c613312565b5b60405190808252806020026020018201604052801561176b5781602001602082028036833780820191505090505b5095508067ffffffffffffffff81111561178857611787613312565b5b6040519080825280602002602001820160405280156117b65781602001602082028036833780820191505090505b5094508067ffffffffffffffff8111156117d3576117d2613312565b5b60405190808252806020026020018201604052801561180657816020015b60608152602001906001900390816117f15790505b5093508067ffffffffffffffff81111561182357611822613312565b5b60405190808252806020026020018201604052801561185657816020015b60608152602001906001900390816118415790505b5092505f5b81811015611c69575f808a8a84818110611878576118776141a7565b5b9050602002013581526020019081526020015f20604051806101200160405290815f82015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001600182015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001600282015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016003820154815260200160048201548152602001600582015481526020016006820154815260200160078201548152602001600882015f9054906101000a900460ff1615151515815250508382815181106119f5576119f46141a7565b5b6020026020010181905250611a64838281518110611a1657611a156141a7565b5b602002602001015160400151848381518110611a3557611a346141a7565b5b60200260200101515f0151858481518110611a5357611a526141a7565b5b602002602001015160200151610437565b878281518110611a7757611a766141a7565b5b6020026020010181815250505f838281518110611a9757611a966141a7565b5b60200260200101516040015190508073ffffffffffffffffffffffffffffffffffffffff1663313ce5676040518163ffffffff1660e01b8152600401602060405180830381865afa158015611aee573d5f803e3d5ffd5b505050506040513d601f19601f82011682018060405250810190611b12919061454a565b878381518110611b2557611b246141a7565b5b602002602001019060ff16908160ff16815250508073ffffffffffffffffffffffffffffffffffffffff166306fdde036040518163ffffffff1660e01b81526004015f60405180830381865afa158015611b81573d5f803e3d5ffd5b505050506040513d5f823e3d601f19601f82011682018060405250810190611ba99190614617565b868381518110611bbc57611bbb6141a7565b5b60200260200101819052508073ffffffffffffffffffffffffffffffffffffffff166395d89b416040518163ffffffff1660e01b81526004015f60405180830381865afa158015611c0f573d5f803e3d5ffd5b505050506040513d5f823e3d601f19601f82011682018060405250810190611c379190614617565b858381518110611c4a57611c496141a7565b5b6020026020010181905250508080611c61906142bd565b91505061185b565b50509295509295909350565b8383905086869050148015611c8f57508181905084849050145b611cce576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611cc590614189565b60405180910390fd5b5f5b86869050811015611d6e57611d5b878783818110611cf157611cf06141a7565b5b9050602002016020810190611d06919061308e565b868684818110611d1957611d186141a7565b5b9050602002016020810190611d2e919061308e565b858585818110611d4157611d406141a7565b5b9050602002016020810190611d56919061308e565b610617565b8080611d66906142bd565b915050611cd0565b50505050505050565b60608484905087879050148015611d9357508282905085859050145b611dd2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611dc990614189565b60405180910390fd5b5f8787905090505f8167ffffffffffffffff811115611df457611df3613312565b5b604051908082528060200260200182016040528015611e225781602001602082028036833780820191505090505b5090505f5b82811015611ee157611eaf8a8a83818110611e4557611e446141a7565b5b9050602002016020810190611e5a919061308e565b898984818110611e6d57611e6c6141a7565b5b9050602002016020810190611e82919061308e565b888885818110611e9557611e946141a7565b5b9050602002016020810190611eaa919061308e565b610d4d565b828281518110611ec257611ec16141a7565b5b6020026020010181815250508080611ed9906142bd565b915050611e27565b5080925050509695505050505050565b60035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614611f80576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611f77906146a8565b60405180910390fd5b6032821115611f90576032611f92565b815b6004819055505f73ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603611ff25760035f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16611ff4565b805b60035f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055505050565b5f612043338787610d4d565b90505f73ffffffffffffffffffffffffffffffffffffffff165f808381526020019081526020015f205f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603612329576040518061012001604052803373ffffffffffffffffffffffffffffffffffffffff1681526020018673ffffffffffffffffffffffffffffffffffffffff1681526020018773ffffffffffffffffffffffffffffffffffffffff1681526020015f81526020018581526020018581526020018481526020014281526020018315158152505f808381526020019081526020015f205f820151815f015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506020820151816001015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506040820151816002015f6101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550606082015181600301556080820151816004015560a0820151816005015560c0820151816006015560e08201518160070155610100820151816008015f6101000a81548160ff02191690831515021790555090505060015f3373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081908060018154018082558091505060019003905f5260205f20015f909190919091505560025f8673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f2081908060018154018082558091505060019003905f5260205f20015f90919091909150556123b4565b835f808381526020019081526020015f2060050181905550835f808381526020019081526020015f2060040181905550825f808381526020019081526020015f2060060181905550425f808381526020019081526020015f2060070181905550815f808381526020019081526020015f206008015f6101000a81548160ff0219169083151502179055505b8473ffffffffffffffffffffffffffffffffffffffff168673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fcf8d64e381fa4c6934a7d60007173d92e3e32d0d11698bbb69f14e04fa2c4a89876040516124289190612f63565b60405180910390a4505050505050565b606060015f8373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020015f208054806020026020016040519081016040528092919081815260200182805480156124bf57602002820191905f5260205f20905b8154815260200190600101908083116124ab575b50505050509050919050565b878790508a8a90501480156124e557508585905088889050145b80156124f657508383905086869050145b801561250757508181905084849050145b612546576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161253d90614189565b60405180910390fd5b5f5b8a8a905081101561261a576126078b8b83818110612569576125686141a7565b5b905060200201602081019061257e919061308e565b8a8a84818110612591576125906141a7565b5b90506020020160208101906125a6919061308e565b8989858181106125b9576125b86141a7565b5b905060200201358888868181106125d3576125d26141a7565b5b905060200201358787878181106125ed576125ec6141a7565b5b905060200201602081019061260291906146c6565b612037565b8080612612906142bd565b915050612548565b5050505050505050505050565b60608060605f8585905090508067ffffffffffffffff81111561264d5761264c613312565b5b60405190808252806020026020018201604052801561267b5781602001602082028036833780820191505090505b5093508067ffffffffffffffff81111561269857612697613312565b5b6040519080825280602002602001820160405280156126c65781602001602082028036833780820191505090505b5092508067ffffffffffffffff8111156126e3576126e2613312565b5b6040519080825280602002602001820160405280156127115781602001602082028036833780820191505090505b5091505f5b81811015612ad2575f805f898985818110612734576127336141a7565b5b9050602002013581526020019081526020015f2090505f73ffffffffffffffffffffffffffffffffffffffff16815f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16036127da576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016127d190613f88565b60405180910390fd5b5f61284e826002015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16835f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16846001015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16610437565b9050816002015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166370a08231835f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff166040518263ffffffff1660e01b81526004016128ce9190614385565b602060405180830381865afa1580156128e9573d5f803e3d5ffd5b505050506040513d601f19601f8201168201806040525081019061290d91906143b2565b8684815181106129205761291f6141a7565b5b602002602001018181525050816002015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1663dd62ed3e835f015f9054906101000a900473ffffffffffffffffffffffffffffffffffffffff16306040518363ffffffff1660e01b81526004016129ac92919061446b565b602060405180830381865afa1580156129c7573d5f803e3d5ffd5b505050506040513d601f19601f820116820180604052508101906129eb91906143b2565b8584815181106129fe576129fd6141a7565b5b602002602001018181525050858381518110612a1d57612a1c6141a7565b5b60200260200101516103e860045483612a369190614006565b612a409190614074565b82612a4b919061410c565b11158015612a985750848381518110612a6757612a666141a7565b5b60200260200101516103e860045483612a809190614006565b612a8a9190614074565b82612a95919061410c565b11155b878481518110612aab57612aaa6141a7565b5b60200260200101901515908115158152505050508080612aca906142bd565b915050612716565b50509250925092565b6001602052815f5260405f208181548110612af4575f80fd5b905f5260205f20015f91509150505481565b60045481565b612b8f846323b872dd60e01b858585604051602401612b2d939291906146f1565b604051602081830303815290604052907bffffffffffffffffffffffffffffffffffffffffffffffffffffffff19166020820180517bffffffffffffffffffffffffffffffffffffffffffffffffffffffff8381831617835250505050612b95565b50505050565b5f612bf6826040518060400160405280602081526020017f5361666545524332303a206c6f772d6c6576656c2063616c6c206661696c65648152508573ffffffffffffffffffffffffffffffffffffffff16612c5a9092919063ffffffff16565b90505f81511115612c555780806020019051810190612c15919061473a565b612c54576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401612c4b906147d5565b60405180910390fd5b5b505050565b6060612c6884845f85612c71565b90509392505050565b606082471015612cb6576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401612cad90614863565b60405180910390fd5b612cbf85612d81565b612cfe576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401612cf5906148cb565b60405180910390fd5b5f808673ffffffffffffffffffffffffffffffffffffffff168587604051612d26919061492d565b5f6040518083038185875af1925050503d805f8114612d60576040519150601f19603f3d011682016040523d82523d5f602084013e612d65565b606091505b5091509150612d75828286612da3565b92505050949350505050565b5f808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b60608315612db357829050612e02565b5f83511115612dc55782518084602001fd5b816040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401612df9919061497b565b60405180910390fd5b9392505050565b6040518061012001604052805f73ffffffffffffffffffffffffffffffffffffffff1681526020015f73ffffffffffffffffffffffffffffffffffffffff1681526020015f73ffffffffffffffffffffffffffffffffffffffff1681526020015f81526020015f81526020015f81526020015f81526020015f81526020015f151581525090565b5f604051905090565b5f80fd5b5f80fd5b5f73ffffffffffffffffffffffffffffffffffffffff82169050919050565b5f612eca82612ea1565b9050919050565b612eda81612ec0565b8114612ee4575f80fd5b50565b5f81359050612ef581612ed1565b92915050565b5f805f60608486031215612f1257612f11612e99565b5b5f612f1f86828701612ee7565b9350506020612f3086828701612ee7565b9250506040612f4186828701612ee7565b9150509250925092565b5f819050919050565b612f5d81612f4b565b82525050565b5f602082019050612f765f830184612f54565b92915050565b5f819050919050565b612f8e81612f7c565b8114612f98575f80fd5b50565b5f81359050612fa981612f85565b92915050565b5f60208284031215612fc457612fc3612e99565b5b5f612fd184828501612f9b565b91505092915050565b612fe381612ec0565b82525050565b5f8115159050919050565b612ffd81612fe9565b82525050565b5f610120820190506130175f83018c612fda565b613024602083018b612fda565b613031604083018a612fda565b61303e6060830189612f54565b61304b6080830188612f54565b61305860a0830187612f54565b61306560c0830186612f54565b61307260e0830185612f54565b613080610100830184612ff4565b9a9950505050505050505050565b5f602082840312156130a3576130a2612e99565b5b5f6130b084828501612ee7565b91505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b6130eb81612f7c565b82525050565b5f6130fc83836130e2565b60208301905092915050565b5f602082019050919050565b5f61311e826130b9565b61312881856130c3565b9350613133836130d3565b805f5b8381101561316357815161314a88826130f1565b975061315583613108565b925050600181019050613136565b5085935050505092915050565b5f6020820190508181035f8301526131888184613114565b905092915050565b5f61319a82612ea1565b9050919050565b6131aa81613190565b82525050565b5f6020820190506131c35f8301846131a1565b92915050565b5f80fd5b5f80fd5b5f80fd5b5f8083601f8401126131ea576131e96131c9565b5b8235905067ffffffffffffffff811115613207576132066131cd565b5b602083019150836020820283011115613223576132226131d1565b5b9250929050565b5f805f805f806060878903121561324457613243612e99565b5b5f87013567ffffffffffffffff81111561326157613260612e9d565b5b61326d89828a016131d5565b9650965050602087013567ffffffffffffffff8111156132905761328f612e9d565b5b61329c89828a016131d5565b9450945050604087013567ffffffffffffffff8111156132bf576132be612e9d565b5b6132cb89828a016131d5565b92509250509295509295509295565b6132e381612f7c565b82525050565b5f6020820190506132fc5f8301846132da565b92915050565b5f601f19601f8301169050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52604160045260245ffd5b61334882613302565b810181811067ffffffffffffffff8211171561336757613366613312565b5b80604052505050565b5f613379612e90565b9050613385828261333f565b919050565b5f67ffffffffffffffff8211156133a4576133a3613312565b5b602082029050602081019050919050565b5f6133c76133c28461338a565b613370565b905080838252602082019050602084028301858111156133ea576133e96131d1565b5b835b8181101561341357806133ff8882612f9b565b8452602084019350506020810190506133ec565b5050509392505050565b5f82601f830112613431576134306131c9565b5b81356134418482602086016133b5565b91505092915050565b5f6020828403121561345f5761345e612e99565b5b5f82013567ffffffffffffffff81111561347c5761347b612e9d565b5b6134888482850161341d565b91505092915050565b5f67ffffffffffffffff8211156134ab576134aa613312565b5b602082029050602081019050919050565b5f6134ce6134c984613491565b613370565b905080838252602082019050602084028301858111156134f1576134f06131d1565b5b835b8181101561351a57806135068882612ee7565b8452602084019350506020810190506134f3565b5050509392505050565b5f82601f830112613538576135376131c9565b5b81356135488482602086016134bc565b91505092915050565b5f805f6060848603121561356857613567612e99565b5b5f84013567ffffffffffffffff81111561358557613584612e9d565b5b61359186828701613524565b935050602084013567ffffffffffffffff8111156135b2576135b1612e9d565b5b6135be86828701613524565b925050604084013567ffffffffffffffff8111156135df576135de612e9d565b5b6135eb86828701613524565b9150509250925092565b6135fe81612f4b565b8114613608575f80fd5b50565b5f81359050613619816135f5565b92915050565b5f806040838503121561363557613634612e99565b5b5f61364285828601612ee7565b92505060206136538582860161360b565b9150509250929050565b5f8083601f840112613672576136716131c9565b5b8235905067ffffffffffffffff81111561368f5761368e6131cd565b5b6020830191508360208202830111156136ab576136aa6131d1565b5b9250929050565b5f80602083850312156136c8576136c7612e99565b5b5f83013567ffffffffffffffff8111156136e5576136e4612e9d565b5b6136f18582860161365d565b92509250509250929050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b61372f81612f4b565b82525050565b5f6137408383613726565b60208301905092915050565b5f602082019050919050565b5f613762826136fd565b61376c8185613707565b935061377783613717565b805f5b838110156137a757815161378e8882613735565b97506137998361374c565b92505060018101905061377a565b5085935050505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b5f60ff82169050919050565b6137f2816137dd565b82525050565b5f61380383836137e9565b60208301905092915050565b5f602082019050919050565b5f613825826137b4565b61382f81856137be565b935061383a836137ce565b805f5b8381101561386a57815161385188826137f8565b975061385c8361380f565b92505060018101905061383d565b5085935050505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b5f81519050919050565b5f82825260208201905092915050565b5f5b838110156138d75780820151818401526020810190506138bc565b5f8484015250505050565b5f6138ec826138a0565b6138f681856138aa565b93506139068185602086016138ba565b61390f81613302565b840191505092915050565b5f61392583836138e2565b905092915050565b5f602082019050919050565b5f61394382613877565b61394d8185613881565b93508360208202850161395f85613891565b805f5b8581101561399a578484038952815161397b858261391a565b94506139868361392d565b925060208a01995050600181019050613962565b50829750879550505050505092915050565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b6139de81612ec0565b82525050565b6139ed81612fe9565b82525050565b61012082015f820151613a085f8501826139d5565b506020820151613a1b60208501826139d5565b506040820151613a2e60408501826139d5565b506060820151613a416060850182613726565b506080820151613a546080850182613726565b5060a0820151613a6760a0850182613726565b5060c0820151613a7a60c0850182613726565b5060e0820151613a8d60e0850182613726565b50610100820151613aa26101008501826139e4565b50505050565b5f613ab383836139f3565b6101208301905092915050565b5f602082019050919050565b5f613ad6826139ac565b613ae081856139b6565b9350613aeb836139c6565b805f5b83811015613b1b578151613b028882613aa8565b9750613b0d83613ac0565b925050600181019050613aee565b5085935050505092915050565b5f60a0820190508181035f830152613b408188613758565b90508181036020830152613b54818761381b565b90508181036040830152613b688186613939565b90508181036060830152613b7c8185613939565b90508181036080830152613b908184613acc565b90509695505050505050565b5f8060408385031215613bb257613bb1612e99565b5b5f613bbf8582860161360b565b9250506020613bd085828601612ee7565b9150509250929050565b613be381612fe9565b8114613bed575f80fd5b50565b5f81359050613bfe81613bda565b92915050565b5f805f805f60a08688031215613c1d57613c1c612e99565b5b5f613c2a88828901612ee7565b9550506020613c3b88828901612ee7565b9450506040613c4c8882890161360b565b9350506060613c5d8882890161360b565b9250506080613c6e88828901613bf0565b9150509295509295909350565b5f8083601f840112613c9057613c8f6131c9565b5b8235905067ffffffffffffffff811115613cad57613cac6131cd565b5b602083019150836020820283011115613cc957613cc86131d1565b5b9250929050565b5f8083601f840112613ce557613ce46131c9565b5b8235905067ffffffffffffffff811115613d0257613d016131cd565b5b602083019150836020820283011115613d1e57613d1d6131d1565b5b9250929050565b5f805f805f805f805f8060a08b8d031215613d4357613d42612e99565b5b5f8b013567ffffffffffffffff811115613d6057613d5f612e9d565b5b613d6c8d828e016131d5565b9a509a505060208b013567ffffffffffffffff811115613d8f57613d8e612e9d565b5b613d9b8d828e016131d5565b985098505060408b013567ffffffffffffffff811115613dbe57613dbd612e9d565b5b613dca8d828e01613c7b565b965096505060608b013567ffffffffffffffff811115613ded57613dec612e9d565b5b613df98d828e01613c7b565b945094505060808b013567ffffffffffffffff811115613e1c57613e1b612e9d565b5b613e288d828e01613cd0565b92509250509295989b9194979a5092959850565b5f81519050919050565b5f82825260208201905092915050565b5f819050602082019050919050565b5f613e7083836139e4565b60208301905092915050565b5f602082019050919050565b5f613e9282613e3c565b613e9c8185613e46565b9350613ea783613e56565b805f5b83811015613ed7578151613ebe8882613e65565b9750613ec983613e7c565b925050600181019050613eaa565b5085935050505092915050565b5f6060820190508181035f830152613efc8186613e88565b90508181036020830152613f108185613758565b90508181036040830152613f248184613758565b9050949350505050565b5f82825260208201905092915050565b7f53747265616d20646f6573206e6f7420657869737400000000000000000000005f82015250565b5f613f72601583613f2e565b9150613f7d82613f3e565b602082019050919050565b5f6020820190508181035f830152613f9f81613f66565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601160045260245ffd5b5f613fdd82612f4b565b9150613fe883612f4b565b925082820390508181111561400057613fff613fa6565b5b92915050565b5f61401082612f4b565b915061401b83612f4b565b925082820261402981612f4b565b915082820484148315176140405761403f613fa6565b5b5092915050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52601260045260245ffd5b5f61407e82612f4b565b915061408983612f4b565b92508261409957614098614047565b5b828204905092915050565b7f4e6f20616c6c6f7761626c6520616d6f756e7420746f207769746864726177005f82015250565b5f6140d8601f83613f2e565b91506140e3826140a4565b602082019050919050565b5f6020820190508181035f830152614105816140cc565b9050919050565b5f61411682612f4b565b915061412183612f4b565b925082820190508082111561413957614138613fa6565b5b92915050565b7f496e70757420617272617973206c656e677468206d69736d61746368000000005f82015250565b5f614173601c83613f2e565b915061417e8261413f565b602082019050919050565b5f6020820190508181035f8301526141a081614167565b9050919050565b7f4e487b71000000000000000000000000000000000000000000000000000000005f52603260045260245ffd5b7f596f7520617265206e6f74207468652073747265616d6572206f7220726563695f8201527f7069656e74000000000000000000000000000000000000000000000000000000602082015250565b5f61422e602583613f2e565b9150614239826141d4565b604082019050919050565b5f6020820190508181035f83015261425b81614222565b9050919050565b5f819050919050565b5f819050919050565b5f61428e61428961428484614262565b61426b565b612f4b565b9050919050565b61429e81614274565b82525050565b5f6020820190506142b75f830184614295565b92915050565b5f6142c782612f4b565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82036142f9576142f8613fa6565b5b600182019050919050565b5f8160601b9050919050565b5f61431a82614304565b9050919050565b5f61432b82614310565b9050919050565b61434361433e82612ec0565b614321565b82525050565b5f6143548286614332565b6014820191506143648285614332565b6014820191506143748284614332565b601482019150819050949350505050565b5f6020820190506143985f830184612fda565b92915050565b5f815190506143ac816135f5565b92915050565b5f602082840312156143c7576143c6612e99565b5b5f6143d48482850161439e565b91505092915050565b7f496e73756666696369656e742062616c616e636520666f722073747265616d695f8201527f6e67000000000000000000000000000000000000000000000000000000000000602082015250565b5f614437602283613f2e565b9150614442826143dd565b604082019050919050565b5f6020820190508181035f8301526144648161442b565b9050919050565b5f60408201905061447e5f830185612fda565b61448b6020830184612fda565b9392505050565b7f496e73756666696369656e7420616c6c6f77616e636520666f722073747265615f8201527f6d696e6700000000000000000000000000000000000000000000000000000000602082015250565b5f6144ec602483613f2e565b91506144f782614492565b604082019050919050565b5f6020820190508181035f830152614519816144e0565b9050919050565b614529816137dd565b8114614533575f80fd5b50565b5f8151905061454481614520565b92915050565b5f6020828403121561455f5761455e612e99565b5b5f61456c84828501614536565b91505092915050565b5f80fd5b5f67ffffffffffffffff82111561459357614592613312565b5b61459c82613302565b9050602081019050919050565b5f6145bb6145b684614579565b613370565b9050828152602081018484840111156145d7576145d6614575565b5b6145e28482856138ba565b509392505050565b5f82601f8301126145fe576145fd6131c9565b5b815161460e8482602086016145a9565b91505092915050565b5f6020828403121561462c5761462b612e99565b5b5f82015167ffffffffffffffff81111561464957614648612e9d565b5b614655848285016145ea565b91505092915050565b7f596f7520617265206e6f7420746865206f776e657200000000000000000000005f82015250565b5f614692601583613f2e565b915061469d8261465e565b602082019050919050565b5f6020820190508181035f8301526146bf81614686565b9050919050565b5f602082840312156146db576146da612e99565b5b5f6146e884828501613bf0565b91505092915050565b5f6060820190506147045f830186612fda565b6147116020830185612fda565b61471e6040830184612f54565b949350505050565b5f8151905061473481613bda565b92915050565b5f6020828403121561474f5761474e612e99565b5b5f61475c84828501614726565b91505092915050565b7f5361666545524332303a204552433230206f7065726174696f6e20646964206e5f8201527f6f74207375636365656400000000000000000000000000000000000000000000602082015250565b5f6147bf602a83613f2e565b91506147ca82614765565b604082019050919050565b5f6020820190508181035f8301526147ec816147b3565b9050919050565b7f416464726573733a20696e73756666696369656e742062616c616e636520666f5f8201527f722063616c6c0000000000000000000000000000000000000000000000000000602082015250565b5f61484d602683613f2e565b9150614858826147f3565b604082019050919050565b5f6020820190508181035f83015261487a81614841565b9050919050565b7f416464726573733a2063616c6c20746f206e6f6e2d636f6e74726163740000005f82015250565b5f6148b5601d83613f2e565b91506148c082614881565b602082019050919050565b5f6020820190508181035f8301526148e2816148a9565b9050919050565b5f81519050919050565b5f81905092915050565b5f614907826148e9565b61491181856148f3565b93506149218185602086016138ba565b80840191505092915050565b5f61493882846148fd565b915081905092915050565b5f61494d826138a0565b6149578185613f2e565b93506149678185602086016138ba565b61497081613302565b840191505092915050565b5f6020820190508181035f8301526149938184614943565b90509291505056fea264697066735822122037b768e8dbcd03a88a39c3e4148b65a2ce2c5ddb90cf7b7aff27f2762b249d7764736f6c6343000815003300000000000000000000000000000000000000c0d7d3017b342ff039b55b0879')
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
};const [totalClaim, setTotalClaim] = useState({}); // Initialize totalClaim as an empty object
const [streamable, setStreamable] = useState({}); // Initialize streamable as an empty object
useEffect(() => {
  const fetchStreamableBorrows = async () => {
    try {
      let contract = new ethers.Contract(ContractAddress, ContractABI, signer);

      // Get hashes for all borrows
      const hashes = borrows.map(borrow => borrow.hash);

      // Fetch streamable data (canStreamArray, balances, allowances)
      const [canStreamArray] = await contract.getStreamable(hashes);

// Map the streamable status to the corresponding hashes
let canStream = hashes.map((hash, index) => ({
  hash,             // The corresponding hash
  canStream: canStreamArray[index],  // The streamable status for this hash
}));      setStreamable(canStream);

      // Filter out borrows that are not streamable
      const streamableBorrows = borrows.filter((_, index) => canStreamArray[index]);

      // Calculate claimable amounts for streamable borrows
      const newClaimByToken = streamableBorrows.reduce((acc, borrow) => {
        const { token, available, decimals } = borrow;

        // Convert available to a number format
        const availableFormatted = parseFloat(ethers.formatUnits(available, decimals));

        // If the token exists in the accumulator, sum the available amounts
        if (acc[token]) {
          acc[token] += availableFormatted;
        } else {
          acc[token] = availableFormatted;
        }

        return acc;
      }, {});

      // Format the final claimable amounts to fixed decimals (e.g., 10 decimals)
      const formattedTotalClaim = Object.fromEntries(
        Object.entries(newClaimByToken).map(([token, amount]) => [
          token,
          amount.toFixed(10) // Limit to 10 decimal places
        ])
      );

      // Update the totalClaim state with the calculated values
      setTotalClaim(formattedTotalClaim);
      
    } catch (error) {
      console.error('Error fetching streamable borrows:', error);
      toast.error('Error fetching streamable borrows.');
    }
  };

  if (borrows.length > 0) {
    fetchStreamableBorrows(); // Only fetch if borrows exist
  }
}, [borrows]); // Ensure `signer` and `borrows` are ready 
const handleClaim = async (token) => {
  try {
    let contract = new ethers.Contract(ContractAddress, ContractABI, signer);
    let relevantAllowances;
    if (token) {
      relevantAllowances = borrows.filter( 
        (allowance) => allowance.token === token
      );
    } else {
      relevantAllowances = borrows; // Use all allowances if no specific token is provided
    }

    // Compute the hashes for all relevant allowances
    const hashes = relevantAllowances.map((allowance) => allowance.hash);

    if (hashes.length === 0) {
      toast.info('No available streams to claim.');
      return;
    }

    // Call the smart contract function to claim the streams
    const tx = await contract.batchStreamAvailableAllowances(hashes); // Adjust this to the contract function
    await tx.wait();

    toast.success('Claim successful');
    fetchFriendAllowances(); // Refresh the list after claim
  } catch (error) {
    console.error('Error claiming:', error);
    toast.error('Error claiming');
  }
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
          {(allowances.length>0&&(<> <h2 className="text-xl text-pink-600 font-bold">Claimable</h2>
         
      <button onClick={()=>handleClaim()} className="bg-gradient-to-r from-red-400 to-yellow-400 text-white font-semibold px-12 p-2 rounded-full hover:bg-green-600 transition duration-300 ease-in-out mx-auto">
        Claim All
      </button>
          <div className="bg-gradient-to-r from-pink-200 to-pink-100 p-2 rounded-3xl m-6 mt-2">
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
  {Object.entries(totalClaim).map(([token, amount], index) => {
    // Define dynamic gradients
    const colorGradients = [
      "from-red-400 to-yellow-400",
      "from-blue-400 to-green-400",
      "from-green-400 to-teal-400",
      "from-yellow-400 to-pink-400",
      "from-indigo-400 to-blue-400",
      "from-teal-400 to-green-400",
    ];

    return (
      <button
        key={token}
        onClick={() => handleClaim(token)}
        className={`text-center flex items-center justify-center text-white bg-gradient-to-r ${colorGradients[index % colorGradients.length]} rounded-full transform transition-all duration-300 hover:scale-105`}
      >
        <p className="text-white text-lg font-bold m-2">
          {amount} {token.substring(0, 20)}
        </p>
      </button>
    );
  })}
</div>
</div>
</>))}
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
                      onClick={() => handleBorrow(borrow.tokenAddrs, borrow.lender)}
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
      <h2 className="text-xl text-pink-600 font-bold">Claimable</h2>
          
              <div className="bg-gradient-to-r from-pink-200 to-pink-100 p-2 rounded-3xl m-6 mt-2">
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4">
    <button onClick={()=>handleClaim()} className="bg-gradient-to-r from-red-400 to-yellow-400 text-white font-semibold px-12 p-2 rounded-full hover:bg-green-600 transition duration-300 ease-in-out mx-auto w-full">
            Claim All
          </button>
          {Object.entries(totalClaim).map(([token, amount], index) => {
        // Define dynamic gradients
        const colorGradients = [
          "from-red-400 to-yellow-400",
          "from-blue-400 to-green-400",
          "from-green-400 to-teal-400",
          "from-yellow-400 to-pink-400",
          "from-indigo-400 to-blue-400",
          "from-teal-400 to-green-400",
        ];
    
        return (
          <button
            key={token}
            onClick={() => handleClaim(token)}
            className={`text-center flex items-center justify-center text-white bg-gradient-to-r ${colorGradients[index % colorGradients.length]} rounded-full transform transition-all duration-300 hover:scale-105`}
          >
            <p className="text-white text-lg font-bold m-2">
              {amount} {token.substring(0, 20)}
            </p>
          </button>
        );
      })}
    </div>
    </div>
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
                <td className="px-6 py-4">{streamable.find(item => item.hash === borrow.hash).canStream === true?'': '🔴'}{(displayedAvailableBorrowAmounts[borrow.hash] || 0).toFixed(6)}</td>
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
