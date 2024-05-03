import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
const FormData = require('form-data')
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { chainId } from 'wagmi'; import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider } from './tl'
import { useEthersSigner } from './tl'
import { useAccount, useConnect, useEnsName, useChainId } from 'wagmi'
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
  Paper,ListItemText 
} from '@mui/material';
const tokenaddress = '0x0000000000000000000000000000000000000000'
let signer
let provider
const App = () => {

  let ContractAddress = '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';//const ContractAddress = '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
  const ContractABI = [{ "inputs": [{ "internalType": "address payable", "name": "feeAddrs", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "streamer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Repaid", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "friend", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "StreamAllowed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "streamer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Streamed", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "window", "type": "uint256" }, { "internalType": "bool", "name": "once", "type": "bool" }], "name": "allowStream", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }], "name": "computeHash", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "me", "type": "address" }], "name": "getAvailable", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }, { "internalType": "address", "name": "newfeeAddress", "type": "address" }], "name": "setFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "me", "type": "address" }], "name": "stream", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "streamDetails", "outputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "totalStreamed", "type": "uint256" }, { "internalType": "uint256", "name": "outstanding", "type": "uint256" }, { "internalType": "uint256", "name": "allowable", "type": "uint256" }, { "internalType": "uint256", "name": "window", "type": "uint256" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "bool", "name": "once", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "streamDetailsByFriend", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "streamDetailsByLender", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "friend", "type": "address" }], "name": "viewFriendAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }], "name": "viewLenderAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }]
  const tokenABI = [{ "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "address", "name": "minter_", "type": "address" }, { "internalType": "uint256", "name": "mintingAllowedAfter_", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegator", "type": "address" }, { "indexed": true, "internalType": "address", "name": "fromDelegate", "type": "address" }, { "indexed": true, "internalType": "address", "name": "toDelegate", "type": "address" }], "name": "DelegateChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "delegate", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "previousBalance", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "newBalance", "type": "uint256" }], "name": "DelegateVotesChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "minter", "type": "address" }, { "indexed": false, "internalType": "address", "name": "newMinter", "type": "address" }], "name": "MinterChanged", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [], "name": "DELEGATION_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DOMAIN_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PERMIT_TYPEHASH", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint32", "name": "", "type": "uint32" }], "name": "checkpoints", "outputs": [{ "internalType": "uint32", "name": "fromBlock", "type": "uint32" }, { "internalType": "uint96", "name": "votes", "type": "uint96" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }], "name": "delegate", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "delegatee", "type": "address" }, { "internalType": "uint256", "name": "nonce", "type": "uint256" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "delegateBySig", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "delegates", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "getCurrentVotes", "outputs": [{ "internalType": "uint96", "name": "", "type": "uint96" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }, { "internalType": "uint256", "name": "blockNumber", "type": "uint256" }], "name": "getPriorVotes", "outputs": [{ "internalType": "uint96", "name": "", "type": "uint96" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minimumTimeBetweenMints", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "mintCap", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minter", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "mintingAllowedAfter", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "nonceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "nonces", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "numCheckpoints", "outputs": [{ "internalType": "uint32", "name": "", "type": "uint32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }, { "internalType": "uint256", "name": "deadline", "type": "uint256" }, { "internalType": "uint8", "name": "v", "type": "uint8" }, { "internalType": "bytes32", "name": "r", "type": "bytes32" }, { "internalType": "bytes32", "name": "s", "type": "bytes32" }], "name": "permit", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "minter_", "type": "address" }], "name": "setMinter", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "src", "type": "address" }, { "internalType": "address", "name": "dst", "type": "address" }, { "internalType": "uint256", "name": "rawAmount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }]

  //const [token, setToken] = useState(null);
  const [boop, setboop] = useState(null);
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
  const [pro, setpro] = useState(0);

  const rafIdRef = useRef(null);
  const rafBorrowIdRef = useRef(null);
  const [displayedAvailableAmounts, setDisplayedAvailableAmounts] = useState({});
  const [displayedAvailableBorrowAmounts, setDisplayedAvailableBorrowAmounts] = useState({});

  const [window, setWindow] = useState('');
  const [once, setOnce] = useState(false);
  const [streams, setStreams] = useState([]);
  const ethersSigner = useEthersSigner();
  provider = ethersProvider
  signer = ethersSigner
  let account = useAccount();
  let userAddress = useAccount().address;
  let ChainId = useChainId()
    ChainId==1?ContractAddress='0x90076e40A74F33cC2C673eCBf2fBa4068Af77892':{}

  account = account.address
  let contract = new ethers.Contract(
    ContractAddress,
    ContractABI,
    ethersProvider
  );
  let token
  const toggleModal = () => {
    setShowModal(!showModal);
  };
  useEffect(() => {
    function handleaccountsChanged() {
      if (boop == null) {
        setboop('1');
        console.log('boop');
      } else {
        console.log('boop2');
        initEthers();
      }
    }
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleaccountsChanged);
    }
    const initEthers = async () => {
      if (window.ethereum) {
        //try { window.ethereum.request({ method: 'eth_requestAccounts' }); } catch { }

        try {
          //  if (await signer.getChainId() != 11155111) { toast.error('Connect to Sepolia Chain and refresh') }// toast.error('Connect to Base Chain and refresh') }
          async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
          await wait(5000)
          console.log('lol');
          setpro(localStorage.getItem('pro'))
            
          fetchData();
        } catch (error) {
          console.error('Error connecting to Ethereum:', error);
        }
      } else {
        const providerInstance = new ethers.providers.JsonRpcProvider('https://1rpc.io/sepolia');

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

          setboop('1');
          fetchData();
        }
      };

      init();
    }
  }, [contract, userAddress]);

  const [maps, setmaps] = useState({
    '0x94373a4919B3240D86eA41593D5eBa789FEF3848': 'wETH',
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
  });

  // Function to add a new mapping
  const addMapping = (address, name) => {
    console.log('Adding mapping:', address, name);
    setmaps(prevMaps => ({
      ...prevMaps,
      [address.toLowerCase()]: name
    }));
  };
  const map = (lol) => {
    lol = lol.toLowerCase()
    if (maps[lol] != null) { return maps[lol] }
    else { return lol }

  };
  const fetchData = async () => {
    fetchLenderAllowances();
    fetchFriendAllowances();
    console.log(ChainId)

  };

  const fetchLenderAllowances = async () => {
    if (contract && userAddress) {
      const lenderAllowances = await contract.viewLenderAllowances(userAddress);
      const borrowDetails = await Promise.all(
        lenderAllowances.map(async (hash) => {
          const details = await contract.streamDetails(hash);
          let pr = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
          const getAddressENS = async (address) => {
            const ensName = await pr.lookupAddress(address);
            ensName ? addMapping(address, ensName) : {}
            return ensName || address; // Return ENS name if exists, otherwise return the address
          }; const ENS = await getAddressENS(details.friend);
          console.log('lol', ENS)

          const token = new ethers.Contract(details.token, tokenABI, provider);
          const decimals = await token.decimals();
          return {
            hash: hash,
            lender: details.lender,
            friend: details.friend,
            token: details.token,
            show: ENS,
            totalStreamed: Number(ethers.formatUnits(details.totalStreamed, decimals)),
            outstanding: Number(ethers.formatUnits(details.outstanding, decimals)),
            allowable: Number(ethers.formatUnits(details.allowable, decimals)),
            window: Number(details.window),
            timestamp: Number(details.timestamp),
            once: details.once,
          };
        })
      ); console.log(borrowDetails)
      setAllowances(borrowDetails);
    }
  };

  const fetchFriendAllowances = async () => {
    if (contract && userAddress) {
      const friendAllowances = await contract.viewFriendAllowances(userAddress);
      const borrowDetails = await Promise.all(
        friendAllowances.map(async (hash) => {
          const details = await contract.streamDetails(hash);
          let pr = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
          const getAddressENS = async (address) => {
            const ensName = await pr.lookupAddress(address);
            ensName ? addMapping(address, ensName) : {}

            return ensName || address; // Return ENS name if exists, otherwise return the address
          }; const ENS = await getAddressENS(details.friend);
          console.log('lol', ENS)
          const token = new ethers.Contract(details.token, tokenABI, provider);
          const decimals = await token.decimals();

          return {
            hash: hash,
            lender: details.lender,
            friend: details.friend,
            token: details.token,
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

    let contract = new ethers.Contract(
      ContractAddress,
      ContractABI,
      signer
    );
    let token = new ethers.Contract(
      stoken,
      tokenABI,
      signer
    );
    if (contract) {
      try {
        let am = await token.allowance(userAddress, ContractAddress)
        let decimals = await token.decimals()

        console.log('lol', await token.balanceOf(userAddress), 'lol', am)
        if (!once) {
          let tx = await token.approve(ContractAddress, ethers.MaxUint256)
          tx.wait()
        }
        else {
          if (am < (ethers.parseEther(amount)/10n**18n-decimals)) {
            let tx = await token.approve(ContractAddress, ethers.parseEther(amount)/10n**18n-decimals)
            tx.wait()
          }
        }
        if (!ethers.isAddress(friend)) {
          let pr = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
          const getAddressENS = async (address) => {
            const ensName = await pr.resolveName(address);
            ensName ? friend = ensName : toast.error('ENS not found');
            return ensNamex``
          }; const ENS = await getAddressENS(friend);
          if (!ENS) { return }
        }
        console.log('borrowing', stoken, friend, ethers.parseEther(amount)/10n**18n-decimals, window, once);
        const tx = await contract.allowStream(stoken, friend, ethers.parseEther(amount)/10n**18n-decimals, window, once);
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
    let contract = new ethers.Contract(
      ContractAddress,
      ContractABI,
      signer
    ); try {
      const tx = await contract.stream(token, lender, account);
      await tx.wait();
      toast.success('Stream successful');
      fetchBorrows();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error');
    }

  };

  const handleRepay = async (token, lender) => {
    if (contract) {
      let token = new ethers.Contract(
        token,
        tokenABI,
        signer
      );
      try {

        let am = await token.allowance(userAddress, ContractAddress)
        console.log('lol', await token.balanceOf(userAddress), 'lol', am)
        if (am < (ethers.parseEther(amount))) {
          let tx = await token.approve(ContractAddress, ethers.parseEther(amount))
          tx.wait()
        }
        const tx = await contract.repay(token, lender, amount);
        await tx.wait();
        toast.success('Repayment successful');
        fetchFriendAllowances();
      } catch (error) {
        console.error('Error repaying:', error);
        toast.error('Error repaying');
      }
    } function calculateAllowableAmount(allowance) {
      const currentTime = Math.floor(Date.now() / 1000); // Get current timestamp in seconds
      const elapsedTime = currentTime - allowance.timestamp;
      const allowableAmount = (allowance.allowable * elapsedTime) / allowance.window;

      if (allowableAmount > allowance.outstanding) {
        return allowance.outstanding;
      } else {
        return allowableAmount;
      }
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
    }
    else {
   
      const allowableAmount = allowance.outstanding*elapsedTime / allowance.window;
  
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
  }, [allowances, availableAmounts]);const calculateAvailableBorrowAmount = (borrow) => {
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedTime = currentTime - borrow.timestamp;
    if (borrow.once) {

    const allowableAmount = (borrow.allowable * elapsedTime) / borrow.window;
    if (allowableAmount > borrow.outstanding) {
      return borrow.outstanding;
    } else {
      return allowableAmount;
    }
  }
    else {
 
      const allowableAmount = borrow.outstanding*elapsedTime / borrow.window;
  
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
  return (<div className="app">
    <main className="app-main">
      <h1 style={{ color: '#1e88e5', textAlign: 'center', paddingBottom: '40px' }}>
        <a href="https://addrs.to/"> <img
          style={{
            maxWidth: '50px',
            position: 'absolute',
            top: '15px',
            right: '15px',
            borderRadius: '8px',
          }}
          src={'https://addrs.to/a.png'}
          alt="Selected NFT Image"
        /></a>
        
        <label className="switch"   style={{
            maxWidth: '50px',
            position: 'absolute',
            top: '15px',
            left: '80px',
            borderRadius: '8px',
          }}> <Typography style={{
            maxWidth: '50px',
            position: 'absolute',
            top: '6px',
            left: '60px',
            borderRadius: '8px',
          }}>{!pro?'Pro':'Fun'}</Typography >
                            <input
                              type="checkbox"
                              id="once"
                              name="once"
                              checked={pro}
                              onChange={(e) => setpro(e.target.checked)}

                            />
                                                        <span className="slider round"></span>
</label>
                            
        <a href="https://discord.gg/W87Rw6wtk2">
          <img
            style={{
              maxWidth: '50px',
              position: 'absolute',
              top: '16px',
              right: '80px',
              borderRadius: '8px',
            }}
            src={'./discord.png'}
            alt="Selected NFT Image"
          />
        </a>
        <a href="https://twitter.com/not_pr0/">
          <img
            style={{
              maxWidth: '50px',
              position: 'absolute',
              top: '16px',
              right: '140px',
              borderRadius: '8px',
            }}
            src={'./twitter.png'}
            alt="Selected NFT Image"
          />
        </a>
      </h1>
      <body>
        <section id="borrow-form">

          <Toaster />
          <div className='card' style={{
            textAlign: 'center', maxWidth: '100%'
          }}>
            <strong>   <h2 style={{ color: '#42aaff', fontSize: '36px', marginTop: '0px' }}>Stream - in Alpha</h2>
            </strong><p style={{ color: '#42aaff', marginTop: '0px', marginBottom: '40px' }}>            Stream tokens from your wallet, no locking tokens, no interest, no fees.
            </p>            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label htmlFor="token" style={{ display: 'block', marginBottom: '5px' }}>
                  Token Address:
                </label>{stoken}
                <select
                  id="token"
                  name="token"
                  value={stoken}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', fontSize: '18px' }}
                >
                  <option value="">{stoken ? stoken : 'Select a token'}</option>
                  {ChainId == 17000 && (<><option value="0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5">PR0</option>
                    <option value="0x94373a4919b3240d86ea41593d5eba789fef3848">wETH</option>
                    <option value="0x0987654321098765432109876543210987654321">USDC</option>
                  </>)}{ChainId == 1 && (
                    <>
                      <option value="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2">wETH</option>
                      <option value="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48">USDC</option>
                      <option value="0xdac17f958d2ee523a2206206994597c13d831ec7">USDT</option>
                    </>)}
                  {ChainId == 10 && (<>
                    <option value="0x4200000000000000000000000000000000000006">wETH</option>
                    <option value="0x0b2c639c533813f4aa9d7837caf62653d097ff85">USDC</option>
                    <option value="0x94b008aa00579c1307b0ef2c499ad98a8ce58e58">USDT</option>
                    <option value="0x4200000000000000000000000000000000000042">OP</option>
                  </>)}
                  {ChainId == 8453 && (<>
                    <option value="0x4200000000000000000000000000000000000006">wETH</option>
                    <option value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</option>
                  </>)}
                  {ChainId == 534352 && (<>
                    <option value="0x5300000000000000000000000000000000000004">wETH</option>
                    <option value="0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4">USDC</option>
                  </>)}

                  <option value="custom">Custom</option>
                </select>
                {stoken === 'custom' && (
                  <input
                    type="text"
                    id="customToken"
                    name="customToken"
                    onChange={(e) => setToken(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', fontSize: '18px', marginTop: '10px' }}
                    placeholder="Enter custom token address"
                  />
                )}
              </div>
              <div>
                <label htmlFor="friend" style={{ display: 'block', marginBottom: '5px' }}>To Address/ENS:</label>
                <input
                  type="text"
                  id="friend"
                  name="friend"
                  value={friend}
                  onChange={(e) => setFriend(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', fontSize: '18px' }}
                />
              </div>
              <div>
                <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>Stream Amount:</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px', fontSize: '18px' }}
                />
              </div>{!once && (
                <div>
                  <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>Days to Stream Amount:</label>
                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    step="0.01"
                    onChange={(e) => setWindow(e.target.value)}
                    required
                    style={{ width: '100%', padding: '10px', fontSize: '18px' }}
                  />
                </div>
              )}
              {once && (<div>
                <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px' }}>   End Date:
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
                  }} required
                  style={{ width: '100%', padding: '10px', fontSize: '18px' }}
                />
              </div>)}
              <div >
                <label htmlFor="once" style={{}}>
                  <label style={{ color: 'orange' }}> {!once && ('Unlimited')}</label> Stream <label style={{ color: '#00ff00' }}>{once && ('Once only')}</label>
                </label>
              </div>
              <div>
                <label className="switch">
                  <input
                    type="checkbox"
                    id="once"
                    name="once"
                    checked={once}
                    onChange={(e) => setOnce(e.target.checked)}

                  />
                  <span className="slider round"></span>
                </label>
              </div>

              <button onClick={() => requestBorrow(stoken, friend, amount)} style={{ backgroundColor: '#4caf50', width: '100%', justifySelf: 'center' }} >
                Set allowance     </button>

                <button onClick={() => location.assign('https://spot.pizza/')} style={{ backgroundColor: '#', width: '50%', justifySelf: 'center' }} >
                Check out Spot🍕     </button>
              <ConnectButton />
            </div>
          </div>
        </section>{pro &&(<><section id="allowance-list">
          <div className='card' style={{ marginTop: '20px' }}>
            <h2 style={{ color: '#1e88e5' }}>Allowances to Friends</h2>
            <ul id="allowances">
              {Object.entries(
                allowances
                  .filter((allowance) => allowance.lender === userAddress)
                  .reduce((acc, allowance) => {
                    if (!acc[allowance.friend]) {
                      acc[allowance.friend] = [];
                    }
                    acc[allowance.friend].push(allowance);
                    return acc;
                  }, {})
              ).map(([friend, friendAllowances]) => (
                <div key={friend} className='card' style={{ backgroundColor: '#5a5fff', textAlign: 'center', marginTop: '20px', fontSize: '20px' }}>
                  <h3>{map(friend)}{friend.show}</h3>
                  <div className="token-grid">
                    {friendAllowances.map((allowance) => (
                      <div key={allowance.hash} className='card token-card'>
                        <div className="allowance-item">
                          <p><strong>Token:</strong> {map(allowance.token)}</p>
                          <p><strong>Limit:</strong> {allowance.allowable}</p>
                          <p><strong>Available:</strong>                           {(displayedAvailableAmounts[allowance.hash] || 0).toFixed(6)}
                          </p>
                          <p style={{ marginBottom: '0px' }}><strong>   <label style={{ color: '#ffdbaa' }}> {allowance.once && ('Unlimited  ')}</label> Stream <label style={{ color: '#caffcc' }}>{!allowance.once && ('Once only')}</label>
                          </strong></p>
                          <p style={{ marginTop: '0px' }}>
              <strong>
                {!allowance.once && (
                  <label style={{ color: '#ffdbaa' }}>
              @ {allowance.allowable} tokens<br />
                    per {Math.floor(allowance.window / (3600 * 24))}d:
                    {Math.floor((allowance.window % (3600 * 24)) / 3600)}h:
                    {Math.floor((allowance.window % 3600) / 60)}m:
                    {Math.floor(allowance.window % 60)}s
                  </label>
                )}
              </strong>
              {allowance.once && (
                <label style={{ color: '#caffcc' }}>
              ends in {
                    `${Math.floor((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) / 3600)}h:` +
                    `${Math.floor(((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) % 3600) / 60)}m:` +
                    `${Math.floor((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) % 60)}s`
                  }
                </label>
              )}
            </p><p><strong>Volume streamed:</strong> {allowance.totalStreamed}</p>
                          <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', marginTop: '10px' }}>
                            <div
                              style={{
                                width: `${(allowance.outstanding / allowance.allowable) * 100}%`,
                                height: '20px',
                                backgroundColor: '#42aaff',
                                borderRadius: '10px',
                                transition: 'width 0.5s ease-in-out',
                                marginTop: '0px'
                              }}
                            >    <strong>{((allowance.outstanding / allowance.allowable) * 100).toString().slice(0, 5)}%</strong>

                            </div>
                          </div>
                        </div>

                        <input
                          type="text"
                          id="token"
                          name="token"
                          placeholder='amount'

                          onChange={(e) => setAmount(e.target.value)}
                          style={{ marginTop: '16px' }}

                          required
                        />
                        <div style={{ marginTop: '10px' }}>
                          <label htmlFor="amount" style={{ display: 'block', marginBottom: '5px', color: '#fff' }}>Days to Stream Amount:</label>
                          <input
                            type="number"
                            id="amount"
                            name="amount"
                            step="0.01"
                            onChange={(e) => setWindow(e.target.value)}
                            required
                            style={{ width: '20%', padding: '10px', fontSize: '18px' }}
                          />
                        </div>

                        <div style={{ marginTop: '10px' }}>
                          <label htmlFor="once" style={{ color: '#fff' }}>
                            <label style={{ color: '#ffdbaa' }}> {!once && ('Unlimited')}</label> Stream <label style={{ color: '#00ff00' }}>{once && ('Once only')}</label>
                          </label>
                        </div>
                        <div>
                          <label className="switch">
                            <input
                              type="checkbox"
                              id="once"
                              name="once"
                              checked={once}
                              onChange={(e) => setOnce(e.target.checked)}

                            />
                            <span className="slider round"></span>
                          </label>
                        </div>
                        <button
                          style={{ marginLeft: '6px', marginTop: '6px' }}
                          onClick={() => requestBorrow(allowance.token, friend, amount)}
                        >
                          Set allowance
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </ul>
          </div>
        </section><section id="borrow-list">
          <div className='card' style={{ marginTop: '20px' }}>
            <h2 style={{ color: '#1e88e5' }}>Friends That Have Spotted Me</h2>
            <div id="borrows">
              {Object.entries(
                borrows
                  .filter((borrow) => borrow.friend === userAddress)
                  .reduce((acc, borrow) => {
                    if (!acc[borrow.lender]) {
                      acc[borrow.lender] = [];
                    }
                    acc[borrow.lender].push(borrow);
                    return acc;
                  }, {})
              ).map(([lender, lenderBorrows]) => (
                <div key={lender} className='card' style={{ backgroundColor: '#5a5fff', textAlign: 'center', marginTop: '20px', fontSize: '20px' }}>
                  <h3>{map(lender)}{lender.show}</h3>
                  <div className="token-grid">
                    {lenderBorrows.map((borrow) => (
                      <div key={borrow.hash} className='card token-card'>
                        <div className="borrow-item">
                          <p><strong>Token:</strong> {map(borrow.token)}</p>
                          <p><strong>Amount:</strong> {borrow.allowable}</p>
                          <p><strong>Available:</strong>                           {(displayedAvailableBorrowAmounts[borrow.hash] || 0).toFixed(6)}</p>
                          <p style={{ marginBottom: '0px' }}><strong>   <label style={{ color: '#ffdbaa' }}> {!borrow.once && ('Unlimited ')}</label> Stream <label style={{ color: '#caffcc' }}>{borrow.once && ('Once only')}</label>
                          </strong></p><p  style={{ marginTop: '0px' }}>
  <strong>
    {!borrow.once && (
      <label style={{ color: '#ffdbaa' }}>
     @ {borrow.allowable} tokens<br />
        per {Math.floor(borrow.window / (3600 * 24))}d:
        {Math.floor((borrow.window % (3600 * 24)) / 36000)}h:
        {Math.floor((borrow.window % 3600) / 60)}m:
        {Math.floor(borrow.window % 60)}s
      </label>
    )}
  </strong>
  {borrow.once && (
    <label style={{ color: '#00ff00' }}>
     ends in {
        `${Math.floor((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) / 3600)}h:` +
        `${Math.floor(((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) % 3600) / 60)}m:` +
        `${Math.floor((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) % 60)}s`
      }
    </label>
  )}
</p>
<p><strong>Volume streamed:</strong> {borrow.totalStreamed}</p>

                        </div>                  <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', marginTop: '10px' }}>

                          <div
                            style={{
                              width: `${(borrow.outstanding / borrow.allowable) * 100}%`,
                              height: '20px',
                              backgroundColor: '#42aaff',
                              borderRadius: '10px',
                              transition: 'width 0.5s ease-in-out',
                              marginTop: '0px'
                            }}
                          >    <strong>{((borrow.outstanding / borrow.allowable) * 100).toString().slice(0, 5)}%</strong>

                          </div>
                        </div>
                        <button
                          style={{ marginLeft: '6px', marginTop: '6px' }}
                          onClick={() => handleBorrow(borrow.token, borrow.lender, amount)}
                        >
                          Claim
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section></>)}{!pro &&(<><section id="allowance-list">
  <div className='card' style={{ marginTop: '20px' }}>
    <h2 style={{ color: '#1e88e5' }}>Allowances to Friends</h2>
    <div id="allowances">
      {Object.entries(
        allowances
          .filter((allowance) => allowance.lender === userAddress)
          .reduce((acc, allowance) => {
            if (!acc[allowance.friend]) {
              acc[allowance.friend] = [];
            }
            acc[allowance.friend].push(allowance);
            return acc;
          }, {})
      ).map(([friend, friendAllowances]) => (
        <TableContainer key={friend} component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={5} style={{ backgroundColor: '#5a5fff', color: '#fff' }}>
                  <Typography variant="h5">{map(friend)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell width="200">Asset</TableCell>
                <TableCell>Limit</TableCell>
                <TableCell width="300">Available</TableCell>
                <TableCell width="300">Time</TableCell>

              </TableRow>
            </TableHead>
            <TableBody>
              {friendAllowances.map((allowance) => (<>
                <TableRow key={allowance.hash} hover>
                  <TableCell>
                    <ListItem>
                      <ListItemText primary={map(allowance.token).toString().substring(0, 10)} />
                    </ListItem>
                  </TableCell>
                  <TableCell>
                    <ListItem>
                      <ListItemText primary={allowance.allowable.toFixed(6)} />
                    </ListItem>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography color="#000">
                        {(displayedAvailableAmounts[allowance.hash] || 0).toFixed(6)}
                        
                      </Typography>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', marginTop: '10px' }}>
                      <div
                        style={{
                          width: `${(allowance.outstanding / allowance.allowable) * 100}%`,
                          height: '20px',
                          backgroundColor: '#42aaff',
                          borderRadius: '10px',
                          transition: 'width 0.5s ease-in-out',
                          marginTop: '0px'
                        }}
                      >
                        <strong>{((allowance.outstanding / allowance.allowable) * 100).toString().slice(0, 5)}%</strong>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="body2" color="textSecondary">
                        <p style={{ marginBottom: '0px' }}>
                          <strong>
                            <Typography style={{borderRadius:'20px',backgroundColor:'orange', textAlign: 'center',width:'70%', color: '#fff' }}> {!allowance.once && ('Unlimited  ')}</Typography>
                            <Typography style={{borderRadius:'20px',backgroundColor:'#00cb00', textAlign: 'center',width:'70%', color: '#fff' }}>{allowance.once && ('Once only')}</Typography>
                          </strong>
                        </p>
                        <p style={{ marginTop: '0px' }}>
                          <strong>
                            {!allowance.once && (
                              <Typography >
                                @ {allowance.allowable} tokens<br />
                                per {Math.floor(allowance.window / (3600 * 24))}d:
                                {Math.floor((allowance.window % (3600 * 24)) / 3600)}h:
                                {Math.floor((allowance.window % 3600) / 60)}m:
                                {Math.floor(allowance.window % 60)}s
                              </Typography>
                            )}
                          </strong>
                          {allowance.once && (
                            <Typography >
                              ends in {
                                `${Math.floor((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) / 3600)}h:` +
                                `${Math.floor(((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) % 3600) / 60)}m:` +
                                `${Math.floor((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) % 60)}s`
                              }
                            </Typography>
                          )}
                        </p>
                      </Typography>
                    </div>
                  </TableCell>
               

                </TableRow>
                  <TableRow style={{padding:'1px',backgroundColor:'#5a5fff'}}>
                <TableCell>
                  <input
                          type="text"
                          id="token"
                          name="token"
                          placeholder='amount'

                          onChange={(e) => setAmount(e.target.value)}
                          style={{ marginTop: '1px',width:'50%' }}

                          required
                        />
                                          </TableCell><TableCell>

                           <strong> <Typography style={{ color: 'orange' }}> {!once && ('Unlimited')}</Typography>  <Typography style={{ color: '#00ff00' }}>{once && ('Once only')}</Typography>
                           </strong>
                          <label className="switch">
                            <input
                              type="checkbox"
                              id="once"
                              name="once"
                              checked={once}
                              onChange={(e) => setOnce(e.target.checked)}

                            />
                            <span className="slider round"></span>
                          </label></TableCell><TableCell>  <input
                            type="number"
                            id="amount"
                            name="amount" placeholder='Days'
                            step="0.01"
                            onChange={(e) => setWindow(e.target.value)}
                            required
                            style={{ width: '50%', padding: '10px',margin:'1px', fontSize: '18px' }}
                          />
                        </TableCell><TableCell>
                    <button onClick={() => requestBorrow(allowance.token, friend, amount)}>
                      Set allowance
                    </button></TableCell>

                </TableRow></>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}
    </div>
  </div>
</section><section id="borrow-list">
  <div className='card' style={{ marginTop: '20px' }}>
    <h2 style={{ color: '#1e88e5' }}>Friends That Have Spotted Me</h2>
    <div id="borrows">
      {Object.entries(
        borrows
          .filter((borrow) => borrow.friend === userAddress)
          .reduce((acc, borrow) => {
            if (!acc[borrow.lender]) {
              acc[borrow.lender] = [];
            }
            acc[borrow.lender].push(borrow);
            return acc;
          }, {})
      ).map(([lender, lenderBorrows]) => (
        <TableContainer key={lender} component={Paper} elevation={1}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell colSpan={5} style={{backgroundColor:'#5a5fff',color:'#fff'}}>
                  <Typography variant="h5" >{map(lender)}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell width="200">Asset</TableCell>
                <TableCell>Limit</TableCell>
                <TableCell width="300">Available</TableCell>
                <TableCell width="300">Ends in</TableCell>
                <TableCell width="120"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lenderBorrows.map((borrow) => (
                <TableRow key={borrow.hash} hover>
                  <TableCell>
                    <ListItem>
                 
                      <ListItemText primary={map(borrow.token).toString().substring(0,10)} />
                    </ListItem>
                  </TableCell>
                  <TableCell>
                    <ListItem>
                      <ListItemText primary={borrow.allowable.toFixed(6)} />
                    </ListItem>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography  color="#000">
                        {(displayedAvailableBorrowAmounts[borrow.hash] || 0).toFixed(6)}
                      </Typography>
                    </div>
                    <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '10px', marginTop: '10px' }}>

                          <div
                            style={{
                              width: `${(borrow.outstanding / borrow.allowable) * 100}%`,
                              height: '20px',
                              backgroundColor: '#42aaff',
                              borderRadius: '10px',
                              transition: 'width 0.5s ease-in-out',
                              marginTop: '0px'
                            }}
>    <strong>{((borrow.outstanding / borrow.allowable) * 100).toString().slice(0, 5)}%</strong>

                          </div>    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Typography variant="body2" color="textSecondary">
                      <p style={{ marginBottom: '0px' }}><strong>   <Typography style={{borderRadius:'20px',backgroundColor:'orange', textAlign: 'center',width:'70%', color: '#fff'}}> {!borrow.once && ('Unlimited ')}</Typography>  <Typography style={{borderRadius:'20px',backgroundColor:'orange', textAlign: 'center',width:'70%', color: '#fff'}}>{borrow.once && ('Once only')}</Typography>
                          </strong></p><p  style={{ marginTop: '0px' }}>
  <strong>
    {!borrow.once && (
      <Typography >
     @ {borrow.allowable} tokens<br />
        per {Math.floor(borrow.window / (3600 * 24))}d:
        {Math.floor((borrow.window % (3600 * 24)) / 36000)}h:
        {Math.floor((borrow.window % 3600) / 60)}m:
        {Math.floor(borrow.window % 60)}s
      </Typography>
    )}
  </strong>
  {borrow.once && (
    <Typography >
     ends in {
        `${Math.floor((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) / 3600)}h:` +
        `${Math.floor(((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) % 3600) / 60)}m:` +
        `${Math.floor((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) % 60)}s`
      }
    </Typography>
  )}
</p>

                      </Typography>
                    </div>
                  </TableCell>
                  <TableCell align="center">
                    <button onClick={() => handleBorrow(borrow.token, borrow.lender, amount)}>
                    Claim</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}
    </div>
  </div>
</section></>)}
      </body>
    </main>
  </div>
  );
};
export default App;