import React, { useState, useEffect, useRef } from 'react';
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
  let ContractAddress = '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
  const ContractABI = [{ "inputs": [{ "internalType": "address payable", "name": "feeAddrs", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "streamer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Repaid", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "friend", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "StreamAllowed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "streamer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Streamed", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "window", "type": "uint256" }, { "internalType": "bool", "name": "once", "type": "bool" }], "name": "allowStream", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }], "name": "computeHash", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "me", "type": "address" }], "name": "getAvailable", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }, { "internalType": "address", "name": "newfeeAddress", "type": "address" }], "name": "setFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "me", "type": "address" }], "name": "stream", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "streamDetails", "outputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "totalStreamed", "type": "uint256" }, { "internalType": "uint256", "name": "outstanding", "type": "uint256" }, { "internalType": "uint256", "name": "allowable", "type": "uint256" }, { "internalType": "uint256", "name": "window", "type": "uint256" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "bool", "name": "once", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "streamDetailsByFriend", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "streamDetailsByLender", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "friend", "type": "address" }], "name": "viewFriendAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }], "name": "viewLenderAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }]
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

  let account = useAccount();
  let userAddress = useAccount().address;
  let ChainId = useChainId();

  if (ChainId === 1) {
    ContractAddress = '0x90076e40A74F33cC2C673eCBf2fBa4068Af77892';
  } else if (ChainId === 17000) {
    ContractAddress = '0x27090cd6D7c20007B9a976E58Ac4231b74c20D8b';
  }

  account = account.address;
  let contract = new ethers.Contract(ContractAddress, ContractABI, ethersProvider);
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
      const lenderAllowances = await contract.viewLenderAllowances(userAddress);
      const borrowDetails = await Promise.all(
        lenderAllowances.map(async (hash) => {
          const details = await contract.streamDetails(hash);
          let pr = new ethers.JsonRpcProvider('https://1rpc.io/eth');
          const getAddressENS = async (address) => {
            const ensName = await pr.lookupAddress(address);
            if (ensName) addMapping(address, ensName);
            return ensName || address;
          };
          const ENS = await getAddressENS(details.friend);
          console.log('lol', ENS);

          const token = new ethers.Contract(details.token, tokenABI, provider);
          let decimals;
          try {
            decimals = await token.decimals();
          } catch (error) {
            decimals = 18;
          }
          return {
            hash: hash,
            lender: details.lender,
            friend: details.friend,
            token: checkToken(details.token),
            show: ENS,
            totalStreamed: Number(ethers.formatUnits(details.totalStreamed, decimals)),
            outstanding: Number(ethers.formatUnits(details.outstanding, decimals)),
            allowable: Number(ethers.formatUnits(details.allowable, decimals)),
            window: Number(details.window),
            timestamp: Number(details.timestamp),
            once: details.once,
          };
        })
      );
      console.log(borrowDetails);
      setAllowances(borrowDetails);
    }
  };

  const fetchFriendAllowances = async () => {
    if (contract && userAddress) {
      const friendAllowances = await contract.viewFriendAllowances(userAddress);
      const borrowDetails = await Promise.all(
        friendAllowances.map(async (hash) => {
          const details = await contract.streamDetails(hash);
          let pr = new ethers.JsonRpcProvider('https://1rpc.io/eth');
          const getAddressENS = async (address) => {
            const ensName= await pr.lookupAddress(address);
            if (ensName) addMapping(address, ensName);
            return ensName || address;
          };
          const ENS = await getAddressENS(details.friend);
          console.log('lol', ENS);

          const token = new ethers.Contract(details.token, tokenABI, provider);
          let decimals;
          try {
            decimals = await token.decimals();
          } catch (error) {
            decimals = 18;
          }
          return {
            hash: hash,
            lender: details.lender,
            friend: details.friend,
            token: checkToken(details.token),
            show: ENS,
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

  const fetchAllowances = async () => {
    if (contract && userAddress) {
      const allowances = await contract.viewLenderAllowances(userAddress);
      setAllowances(allowances);
    }
  };

  const requestBorrow = async (stoken, friend, amount) => {
    let contract = new ethers.Contract(ContractAddress, ContractABI, signer);
    let token = new ethers.Contract(stoken, tokenABI, signer);
    if (contract) {
      try {
        let am = await token.allowance(userAddress, ContractAddress);
        let decimals = await token.decimals();

        console.log('lol', await token.balanceOf(userAddress), 'lol', am);
        if (!once) {
          let tx = await token.approve(ContractAddress, ethers.MaxUint256);
          tx.wait();
        } else {
          if (am < ethers.parseUnits(amount, decimals)) {
            let tx = await token.approve(ContractAddress, ethers.parseUnits(amount, decimals));
            tx.wait();
          }
        }
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
        const tx = await contract.allowStream(stoken, friend, ethers.parseUnits(amount, decimals), window, once);
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
  };

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
      <main className="mx-auto py-8 px-4 lg:px-0 max-w-5xl">
        <h1 className="text-center text-4xl mb-8 text-white font-extrabold">
          Stream - in Alpha
        </h1>
        <Toaster />
  
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
                {lender.substring(0, 20)}
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
                  {friend.substring(0, 20)}
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
                              <span>
                                {Math.floor(allowance.window / (3600 * 24))}d{' '}
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
        </section>
      </main>
    </div>
  );
  
};

export default Stream;