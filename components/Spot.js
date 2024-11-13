import React, { useState, useEffect } from 'react';
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
  Paper, ListItemText
} from '@mui/material';

const tokenaddress = '0x0000000000000000000000000000000000000000'
let signer
let provider
const Spot = () => {

  const ContractAddress = '0x0000000042b5692b77c6816965e410c0bf31dea3';
  const ContractABI = [{ "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "friend", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "BorrowAllowed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "borrower", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Borrowed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "borrower", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Repaid", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "allowBorrow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "borrow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "borrowDetails", "outputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "totalBorrowed", "type": "uint256" }, { "internalType": "uint256", "name": "outstanding", "type": "uint256" }, { "internalType": "uint256", "name": "allowable", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "borrowDetailsByFriend", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "borrowDetailsByLender", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }], "name": "computeHash", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "repay", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "friend", "type": "address" }], "name": "viewFriendAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }], "name": "viewLenderAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }]
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
  const [pro, setpro] = useState(null);
  const ethersSigner = useEthersSigner();
  provider = ethersProvider
  signer = ethersSigner
  let account = useAccount();
  let userAddress = useAccount().address;
  let ChainId = useChainId()
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

// Multicall contract address (consistent across multiple chains)
const MULTICALL_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11';

// Multicall ABI
const MULTICALL_ABI = [
  'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
];
  const fetchLenderAllowances = async () => {
    if (contract && userAddress) {
      const lenderAllowances = await contract.viewLenderAllowances(userAddress);

      // Initialize multicall contract
      const multicallContract = new ethers.Contract(
        MULTICALL_ADDRESS,
        MULTICALL_ABI,
        provider
      );

      // Prepare calls to borrowDetails
      const calls = lenderAllowances.map((hash) => ({
        target: ContractAddress,
        callData: contract.interface.encodeFunctionData('borrowDetails', [hash]),
      }));

      // Execute multicall
      const { returnData } = await multicallContract.aggregate(calls);

      // Decode borrowDetails results
      const borrowDetailsResults = returnData.map((data) =>
        contract.interface.decodeFunctionResult('borrowDetails', data)
      );

      // Collect unique token addresses
      const tokenAddresses = [
        ...new Set(
          borrowDetailsResults.map((details) => details.token.toLowerCase())
        ),
      ];

      // Prepare calls to decimals for each token
      const tokenInterface = new ethers.Interface(tokenABI);
      const decimalCalls = tokenAddresses.map((address) => ({
        target: address,
        callData: tokenInterface.encodeFunctionData('decimals'),
      }));

      // Execute multicall for decimals
      const { returnData: decimalsData } = await multicallContract.aggregate(
        decimalCalls
      );

      // Decode decimals results
      const decimalsResults = decimalsData.map((data) =>
        tokenInterface.decodeFunctionResult('decimals', data)[0]
      );

      // Map token addresses to decimals
      const tokenDecimalsMap = {};
      tokenAddresses.forEach((address, index) => {
        tokenDecimalsMap[address] = decimalsResults[index];
      });

      // Process borrowDetailsResults and construct borrowDetails array
      const borrowDetails = await Promise.all(
        borrowDetailsResults.map(async (details, index) => {
          const hash = lenderAllowances[index];

          // ENS lookup (cannot be batched)
          const pr = new ethers.JsonRpcProvider('https://1rpc.io/eth');
          const getAddressENS = async (address) => {
            if (maps[address.toLowerCase()]) return maps[address.toLowerCase()];
            const ensName = await pr.lookupAddress(address);
            if (ensName) addMapping(address, ensName);
            return ensName || address;
          };
          const ENS = await getAddressENS(details.friend);

          const tokenAddress = details.token.toLowerCase();
          const dec = tokenDecimalsMap[tokenAddress] || 18;

          return {
            hash: hash,
            lender: details.lender,
            friend: details.friend,
            token: details.token,
            show: ENS,
            totalBorrowed: Number(ethers.formatUnits(details.totalBorrowed, dec)),
            outstanding: Number(ethers.formatUnits(details.outstanding, dec)),
            allowable: Number(ethers.formatUnits(details.allowable, dec)),
          };
        })
      );

      setAllowances(borrowDetails);
    }
  };

  const fetchFriendAllowances = async () => {
    if (contract && userAddress) {
      const friendAllowances = await contract.viewFriendAllowances(userAddress);

      // Initialize multicall contract
      const multicallContract = new ethers.Contract(
        MULTICALL_ADDRESS,
        MULTICALL_ABI,
        provider
      );

      // Prepare calls to borrowDetails
      const calls = friendAllowances.map((hash) => ({
        target: ContractAddress,
        callData: contract.interface.encodeFunctionData('borrowDetails', [hash]),
      }));

      // Execute multicall
      const { returnData } = await multicallContract.aggregate(calls);

      // Decode borrowDetails results
      const borrowDetailsResults = returnData.map((data) =>
        contract.interface.decodeFunctionResult('borrowDetails', data)
      );

      // Collect unique token addresses
      const tokenAddresses = [
        ...new Set(
          borrowDetailsResults.map((details) => details.token.toLowerCase())
        ),
      ];

      // Prepare calls to decimals for each token
      const tokenInterface = new ethers.Interface(tokenABI);
      const decimalCalls = tokenAddresses.map((address) => ({
        target: address,
        callData: tokenInterface.encodeFunctionData('decimals'),
      }));

      // Execute multicall for decimals
      const { returnData: decimalsData } = await multicallContract.aggregate(
        decimalCalls
      );

      // Decode decimals results
      const decimalsResults = decimalsData.map((data) =>
        tokenInterface.decodeFunctionResult('decimals', data)[0]
      );

      // Map token addresses to decimals
      const tokenDecimalsMap = {};
      tokenAddresses.forEach((address, index) => {
        tokenDecimalsMap[address] = decimalsResults[index];
      });

      // Process borrowDetailsResults and construct borrowDetails array
      const borrowDetails = await Promise.all(
        borrowDetailsResults.map(async (details, index) => {
          const hash = friendAllowances[index];

          // ENS lookup (cannot be batched)
          const pr = new ethers.JsonRpcProvider('https://1rpc.io/eth');
          const getAddressENS = async (address) => {
            if (maps[address.toLowerCase()]) return maps[address.toLowerCase()];
            const ensName = await pr.lookupAddress(address);
            if (ensName) addMapping(address, ensName);
            return ensName || address;
          };
          const ENS = await getAddressENS(details.lender);

          const tokenAddress = details.token.toLowerCase();
          const dec = tokenDecimalsMap[tokenAddress] || 18;

          return {
            hash: hash,
            lender: details.lender,
            friend: details.friend,
            token: details.token,
            show: ENS,
            totalBorrowed: Number(ethers.formatUnits(details.totalBorrowed, dec)),
            outstanding: Number(ethers.formatUnits(details.outstanding, dec)),
            allowable: Number(ethers.formatUnits(details.allowable, dec)),
          };
        })
      );

      setBorrows(borrowDetails);
    }
  };
  const requestBorrow = async (stoken, friend, amount) => {
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);
    const tokenContract = new ethers.Contract(stoken, tokenABI, signer);

    if (contractWithSigner) {
      try {
        // Fetch decimals
        let dec = 18;
        try {
          dec = await tokenContract.decimals();
        } catch (error) {
          console.error('Could not fetch decimals for token', stoken, error);
        }

        const parsedAmount = ethers.parseUnits(amount, dec);

        const allowance = await tokenContract.allowance(userAddress, ContractAddress);
        if (allowance < parsedAmount) {
          const txApprove = await tokenContract.approve(ContractAddress, parsedAmount);
          await txApprove.wait();
        }

        if (!ethers.isAddress(friend)) {
          const pr = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
          const getAddressENS = async (address) => {
            const resolvedAddress = await pr.resolveName(address);
            if (resolvedAddress) {
              friend = resolvedAddress;
            } else {
              toast.error('ENS not found');
              throw new Error('ENS not found');
            }
            return resolvedAddress;
          };
          await getAddressENS(friend);
        }

        const tx = await contractWithSigner.allowBorrow(stoken, friend, parsedAmount);
        await tx.wait();
        toast.success('Allowance successful');
        fetchLenderAllowances();
      } catch (error) {
        console.error('Error requesting borrow:', error);
        toast.error('Error requesting borrow');
      }
    }
  };

  const handleBorrow = async (tokenAddress, lender) => {
    console.log('Borrowing', tokenAddress, lender, amount);
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);

    try {
      // Fetch decimals
      let dec = 18;
      try {
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
        dec = await tokenContract.decimals();
      } catch (error) {
        console.error('Could not fetch decimals for token', tokenAddress, error);
      }

      const parsedAmount = ethers.parseUnits(amount, dec);

      const tx = await contractWithSigner.borrow(tokenAddress, lender, parsedAmount);
      await tx.wait();
      toast.success('Borrow successful');
      fetchFriendAllowances();
    } catch (error) {
      console.error('Error borrowing:', error);
      toast.error('Error borrowing');
    }
  };

  const handleRepay = async (tokenAddress, lender) => {
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

    try {
      // Fetch decimals
      let dec = 18;
      try {
        dec = await tokenContract.decimals();
      } catch (error) {
        console.error('Could not fetch decimals for token', tokenAddress, error);
      }

      const parsedAmount = ethers.parseUnits(amount, dec);

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
      { address: '0x4200000000000000000000000000000000000042', symbol: 'OP' },
      { address: '0x0b2c639c533813f4aa9d7837caf62653d097ff85', symbol: 'USDC' },
      { address: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', symbol: 'USDT' },
      { address: '0x68f180fcCe6836688e9084f035309E29Bf0A2095', symbol: 'WBTC' },
      { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
    ],
    8453: [
      { address: '0x50c5725949a6f0c72e6c4a641f24049a917db0cb', symbol: 'DAI' },
      { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC' },
      { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
    ],
    534352: [
      { address: '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4', symbol: 'USDC' },
      { address: '0x5300000000000000000000000000000000000004', symbol: 'WETH' },   
    ],
  };
  return (<body className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-gray-200 font-sans flex flex-col items-center py-10">
    <Toaster />
  
    {/* Main Container */}
    <div className="">
  
      {/* Flex Container for Forms and Sections */}
      <div className="flex flex-col gap-2"> {/* Removed lg:flex-row */}
  
        {/* Spot a Friend Form */}
        <div className="container w-full bg-gray-700 bg-opacity-50 rounded-3xl p-6 shadow-lg">
          <h1 className="text-4xl font-extrabold text-pink-500 mb-4">🍕 Spot a Friend 🚀</h1>
          <label className="block mb-6 text-lg">
            🌈 Allow friends to borrow tokens from your wallet, no locking tokens, no interest, no fees! 🎉
          </label>
  
          <div>
            <Toaster />
            <div className="form-container space-y-6">
  
              {/* Token Address Selection */}
              <div className="form-group text-left">
                <label htmlFor="token" className=" block font-semibold mb-2">
                  🪙 Token Address:
                </label>
                <select
                  id="token"
                  name="token"
                  value={stoken}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  className="form-input w-full p-4 bg-gray-600 bg-opacity-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                >
                  <option value="">{stoken ? stoken : 'Select a token'}</option>
                  {tokenOptions[ChainId]?.map((token) => (
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
                    onChange={(e) => { 
                      setToken(e.target.value); 
                      toast.success('Custom token set'); 
                    }}
                    required
                    placeholder="Enter custom token address"
                    className="form-input mt-4 w-full p-4 bg-gray-600 bg-opacity-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                  />
                )}
              </div>
  
              {/* Borrower Address/ENS */}
              <div className="form-group text-left">
                <label htmlFor="friend" className=" block font-semibold mb-2">
                  👥 Borrower Address/ENS:
                </label>
                <input
                  type="text"
                  id="friend"
                  name="friend"
                  value={friend}
                  onChange={(e) => setFriend(e.target.value)}
                  required
                  className="form-input w-full p-4 bg-gray-600 bg-opacity-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                />
              </div>
  
              {/* Borrow Amount */}
              <div className="form-group text-left">
                <label htmlFor="amount" className=" block font-semibold mb-2">
                  💸 Borrow Amount:
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  step="0.01"
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="form-input w-full p-4 bg-gray-600 bg-opacity-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                />
              </div>
  
              {/* Duration */}
              <div className="form-group text-left">
                <label htmlFor="window" className=" block font-semibold mb-2">
                  ⏰ Duration (in days):
                </label>
                <input
                  type="number"
                  id="window"
                  name="window"
                  placeholder="Enter duration in days"
                  className="form-input w-full p-4 bg-gray-600 bg-opacity-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                />
              </div>
  
              {/* Subscription Type */}
              <div className="form-group text-left">
                <label htmlFor="once" className=" block font-semibold mb-2">
                  Subscription Type:
                </label>
                <select 
                  id="once" 
                  className="form-input w-full p-4 bg-gray-600 bg-opacity-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                >
                  <option value="false">Recurring</option>
                  <option value="true">One-time</option>
                </select>
              </div>
  
              {/* Submit Button */}
              <button
                onClick={() => requestBorrow(stoken, friend, amount)}
                className="submit-button w-full py-4 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300"
              >
                Set Allowance
              </button>
  
              {/* Connect Button */}
              <div className="mt-4">
                <ConnectButton />
              </div>
  
            </div>
          </div>
        </div>
  
        {/* Allowances to Friends */}
        <div className="container w-full bg-gray-700 bg-opacity-50 rounded-3xl p-6 shadow-lg">
          <h1 className="section-title text-4xl font-extrabold text-pink-500 mb-4">🤝 Allowances to Friends</h1>
          <div id="allowances" className="space-y-6">
  
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
              <div key={friend} className=" bg-gray-800 bg-opacity-50 rounded-3xl p-6 shadow-inner">
                <h3 className="subscription-title text-2xl font-bold text-pink-500 mb-4">
                  {map(friend).toString().substring(0, 20)}{friend.show}
                </h3>
                <div className="token-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {friendAllowances.map((allowance) => (
                    <div key={allowance.hash} className="token-card bg-gray-700 bg-opacity-50 rounded-3xl p-4 shadow-md flex flex-col">
                      
                      {/* Allowance Details */}
                      <div className="allowance-item space-y-2">
                        <p className="item-label font-semibold">🪙 Token:</p>
                        <p className="token text-white">
                          {tokenOptions[ChainId]?.find(
                            (token) =>
                              token.address.toLowerCase() ===
                              allowance.token.toString().toLowerCase()
                          )?.symbol || allowance.token}
                        </p>
                        
                        {/* Limit and Owed */}
                        <div className="item-row flex flex-col sm:flex-row sm:space-x-6">
                          <div className="item-column bg-gray-800 bg-opacity-50">
                            <p className="item-label font-semibold">🎯 Limit:</p>
                            <p className="item-value text-white">{allowance.allowable}</p>
                          </div>
                          <div className="item-column bg-gray-800 bg-opacity-50">
                            <p className="item-label font-semibold">💸 Owed:</p>
                            <p className="item-value text-white">{allowance.outstanding}</p>
                          </div>
                        </div>
                        
                        {/* Volume Borrowed */}
                        <p className="item-label font-semibold">📊 Volume Borrowed:</p>
                        <p className="item-value text-white">{allowance.totalBorrowed}</p>
                        
                        {/* Progress Bar */}
                        <div className="progress-bar w-full bg-gray-600 rounded-full h-3 mt-2">
                          <div
                            className="progress-bar-inner bg-pink-500 h-3 rounded-full"
                            style={{
                              width: `${(allowance.outstanding / allowance.allowable) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Amount Input */}
                      <input
                        type="text"
                        id={`token-${allowance.hash}`}
                        name={`token-${allowance.hash}`}
                        placeholder="Amount"
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="form-input mt-4 w-full p-2 bg-gray-600 bg-opacity-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                      />
  
                      {/* Set Allowance Button */}
                      <button
                        onClick={() => requestBorrow(allowance.token, friend, amount)}
                        className="submit-button mt-4 w-full py-2 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300"
                      >
                        Set Allowance
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
  
        {/* Friends That Have Spotted Me */}
        <div className="container w-full bg-gray-700 bg-opacity-50 rounded-3xl p-6 shadow-lg">
          <h1 className="section-title text-4xl font-extrabold text-pink-500 mb-4">🙌 Friends That Have Spotted Me</h1>
          <div id="borrows" className="space-y-6">
  
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
              <div key={lender} className=" bg-gray-800 bg-opacity-50 rounded-3xl p-6 shadow-inner">
                <h3 className="subscription-title text-2xl font-bold text-pink-500 mb-4">
                  {map(lender).toString().substring(0, 20)}
                </h3>
                <div className="token-grid grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {lenderBorrows.map((borrow) => (
                    <div key={borrow.hash} className="token-card bg-gray-700 bg-opacity-50 rounded-3xl p-4 shadow-md flex flex-col">
                      
                      {/* Borrow Details */}
                      <div className="borrow-item space-y-2">
                        <p className="item-label font-semibold">🪙 Token:</p>
                        <p className="token text-white">
                          {tokenOptions[ChainId]?.find(
                            (token) =>
                              token.address.toLowerCase() ===
                              borrow.token.toString().toLowerCase()
                          )?.symbol || borrow.token}
                        </p>
                        
                        {/* Amount and Outstanding */}
                        <div className="item-row flex flex-col sm:flex-row sm:space-x-6">
                          <div className="item-column bg-gray-800 bg-opacity-50 p-2">
                            <p className="item-label font-semibold">💸 Amount:</p>
                            <p className="item-value text-white">{borrow.allowable}</p>
                          </div>
                          <div className="item-column bg-gray-800 bg-opacity-50 p-2">
                            <p className="item-label font-semibold">🏦 Outstanding:</p>
                            <p className="item-value text-white">{borrow.outstanding}</p>
                          </div>
                        </div>
                        
                        {/* Volume Borrowed */}
                        <p className="item-label font-semibold">📊 Volume Borrowed:</p>
                        <p className="item-value text-white">{borrow.totalBorrowed}</p>
                        
                        {/* Progress Bar */}
                        <div className="progress-bar w-full bg-gray-600 rounded-full h-3 mt-2">
                          <div
                            className="progress-bar-inner bg-pink-500 h-3 rounded-full"
                            style={{
                              width: `${(borrow.outstanding / borrow.allowable) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Amount Input */}
                      <input
                        type="text"
                        id={`token-borrow-${borrow.hash}`}
                        name={`token-borrow-${borrow.hash}`}
                        placeholder="Amount"
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        className="form-input mt-4 w-full p-2 bg-gray-600 bg-opacity-50 rounded-3xl focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                      />
  
                      {/* Borrow and Repay Buttons */}
                      <div className="button-group flex space-x-4 mt-4">
                        <button
                          onClick={() => handleBorrow(borrow.token, borrow.lender, amount)}
                          className="borrow-button w-full py-2 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300"
                        >
                          Borrow
                        </button>
                        <button
                          onClick={() => handleRepay(borrow.token, borrow.lender, amount)}
                          className="repay-button w-full py-2 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition duration-300"
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
    </div>
  </body>
  
  );
};
export default Spot;