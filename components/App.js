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
    ChainId==17000 ?ContractAddress='0x27090cd6D7c20007B9a976E58Ac4231b74c20D8b':{}

  account = account.address
  let contract = new ethers.Contract(
    ContractAddress,
    ContractABI,
    ethersProvider
  );
  let token
  
provider.addListener('network', (newNetwork, oldNetwork) => {console.log('newNetwork',newNetwork,'oldNetwork',oldNetwork)
try {
  
ChainId==1?ContractAddress='0x90076e40A74F33cC2C673eCBf2fBa4068Af77892':{}
ChainId==17000 ?ContractAddress='0x27090cd6D7c20007B9a976E58Ac4231b74c20D8b':{}
console.log('ContractAddress',ContractAddress)
account = account.address
contract = new ethers.Contract(
ContractAddress,
ContractABI,
ethersProvider
);
fetchData();
console.log('lol')

} catch (error) {
  console.error('Error connecting to Ethereum:', error);
}
})
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

          setboop('1');
          fetchData();
        }
      };

      init();
    }
  }, [contract, userAddress]);

  const [maps, setmaps] = useState({
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
          
          
          let decimals
          try {
            decimals = await token.decimals();
        } catch (error) {
            decimals = 18;
        }
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
          let decimals
          try {
            decimals = await token.decimals();
        } catch (error) {
            decimals = 18;
        }
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
      fetchFriendAllowances();
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
  return (<div className="min-h-screen bg-gray-900 text-white">
      <a href="https://addrs.to/">
        <img
          className="absolute top-4 right-4 rounded-full"
          style={{ maxWidth: '50px' }}
          src={'https://addrs.to/a.png'}
          alt="Selected NFT Image"
        />
      </a>
  <main className="container mx-auto py-8">
    <h1 className="text-center text-4xl mb-8 relative">
    
      Stream - in Alpha
    </h1>
    <Toaster />
    <section id="borrow-form" className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl text-blue-400">Stream tokens from your wallet, no locking tokens, no interest, no fees.</h2>
      </div>
      <div className="space-y-6">
        <div>
          <label htmlFor="token" className="block mb-2 font-semibold text-gray-300">Token Address:</label>
          
          <select
            id="token"
            name="token"
            value={stoken}
            onChange={(e) => setToken(e.target.value)}
            required
            className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          >
            <option value="">{stoken ? stoken : 'Select a token'}</option>
            {ChainId == 17000 && (
              <>
                <option value="0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5">PR0</option>
                <option value="0x94373a4919b3240d86ea41593d5eba789fef3848">wETH</option>
                <option value="0x0987654321098765432109876543210987654321">USDC</option>
              </>
            )}
            {ChainId == 1 && (
              <>
                <option value="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2">wETH</option>
                <option value="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48">USDC</option>
                <option value="0xdac17f958d2ee523a2206206994597c13d831ec7">USDT</option>
              </>
            )}
            {ChainId == 10 && (
              <>
                <option value="0x4200000000000000000000000000000000000006">wETH</option>
                <option value="0x0b2c639c533813f4aa9d7837caf62653d097ff85">USDC</option>
                <option value="0x94b008aa00579c1307b0ef2c499ad98a8ce58e58">USDT</option>
                <option value="0x4200000000000000000000000000000000000042">OP</option>
              </>
            )}
            {ChainId == 8453 && (
              <>
                <option value="0x4200000000000000000000000000000000000006">wETH</option>
                <option value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</option>
              </>
            )}
            {ChainId == 534352 && (
              <>
                <option value="0x5300000000000000000000000000000000000004">wETH</option>
                <option value="0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4">USDC</option>
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
              className="w-full p-3 mt-2 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              placeholder="Enter custom token address"
            />
          )}
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label htmlFor="friend" className="block mb-2 font-semibold text-gray-300">To Address/ENS:</label>
            <input
              type="text"
              id="friend"
              name="friend"
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
              required
              className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="amount" className="block mb-2 font-semibold text-gray-300">Stream Amount:</label>
            <input
              type="number"
              id="amount"
              name="amount"
              step="0.01"
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          {!once && (
            <div className="flex-1">
              <label htmlFor="days" className="block mb-2 font-semibold text-gray-300">Days to Stream Amount:</label>
              <input
                type="number"
                id="days"
                name="days"
                step="0.01"
                onChange={(e) => setWindow(e.target.value)}
                required
                className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              />
            </div>
          )}
          {once && (
            <div className="flex-1">
              <label htmlFor="endDate" className="block mb-2 font-semibold text-gray-300">End Date:</label>
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
                className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              />
            </div>
          )}
        </div>
        <div className="items-center">
          <div className="items-center space-x-2">
            <span className="text-orange-400 font-semibold">{!once && 'Unlimited'}</span>
            <span className="text-gray-300">Stream</span>
            <span className="text-green-400 font-semibold">{once && 'Once only'}</span>
          </div>
          <div className="">
            <label className="switch">
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
        </div>
        <button
          onClick={() => requestBorrow(stoken, friend, amount)}
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
        >
          Set Allowance
        </button>
        <button
          onClick={() => location.assign('https://spot.pizza/')}
          className="w-full py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
        >
          Check out Spot🍕
        </button>
        <ConnectButton />
      </div>
    </section>
    <section id="allowance-list" className="mt-8">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-xl text-blue-400 mb-4">Allowances to Friends</h2>
        <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="py-2 px-4">Friend</th>
              <th className="py-2 px-4">Token</th>
              <th className="py-2 px-4">Limit</th>
              <th className="py-2 px-4">Available</th>
              <th className="py-2 px-4">Stream Type</th>
              <th className="py-2 px-4">Time</th>
              <th className="py-2 px-4">Volume Streamed</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Ends In</th>
              <th className="py-2 px-4">Duration</th>
              <th className="py-2 px-4"></th>

            </tr>
          </thead>
          <tbody className="text-gray-300">
            {Object.entries(
              allowances.reduce((acc, allowance) => {
                if (!acc[allowance.friend]) {
                  acc[allowance.friend] = [];
                }
                acc[allowance.friend].push(allowance);
                return acc;
              }, {})
            ).map(([friend, friendAllowances]) => (
              friendAllowances.map((allowance) => (
                <tr key={allowance.hash} className="border-b border-gray-600">
                  <td className="py-2 px-4">{map(friend)}</td>
                  <td className="py-2 px-4">{map(allowance.token)}</td>
                  <td className="py-2 px-4">{allowance.allowable}</td>
                  <td className="py-2 px-4">{(displayedAvailableAmounts[allowance.hash] || 0).toFixed(6)}</td>
                  <td className="py-2 px-4">
                    <span className="text-orange-400">{allowance.once && 'Unlimited'}</span>
                    <span className="text-green-400">{!allowance.once && 'Once only'}</span>
                  </td>
                  <td className="py-2 px-4">
                    {!allowance.once ? (
                      <span>
                        @ {allowance.allowable} tokens per {Math.floor(allowance.window / (3600 * 24))}d:
                        {Math.floor((allowance.window % (3600 * 24)) / 3600)}h:
                        {Math.floor((allowance.window % 3600) / 60)}m:
                        {Math.floor(allowance.window % 60)}s
                      </span>
                    ) : (
                      <span>
                        ends in {
                          `${Math.floor((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) / 3600)}h:` +
                          `${Math.floor(((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) % 3600) / 60)}m:` +
                          `${Math.floor((allowance.timestamp + allowance.outstanding * allowance.window / allowance.allowable - Date.now() / 1000) % 60)}s`
                        }
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4">{allowance.totalStreamed}</td>
                  <td className="py-2 px-4">
                      <input
                        type="text"
                        id="token"
                        name="token"
                        placeholder="amount"
                        onChange={(e) => setAmount(e.target.value)}
                        className="p-2 w-20 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                        required
                      />
                                        </td>
                                        <td className="py-2 px-4">

                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        step="0.01"
                        placeholder='days'
                        onChange={(e) => setWindow(e.target.value)}
                        required
                        className="p-2 w-20 bg-gray-700 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
                      />                  </td>
                  <td className="py-2 px-4">

                      <label className="flex items-center space-x-2">
                        <span>{once==true&&('Once') }{once!=true&&('Unlimited') }</span>
                        <label className="switch">
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
                      </label>                 
                      </td>
                      <td className="py-2 px-2">

                      <button
                        onClick={() => requestBorrow(allowance.token, friend, amount)}
                        className="py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
                      >
                        Set Allowance
                      </button>
                                </td>

                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </section>
    <section id="borrow-list" className="mt-8">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <h2 className="text-xl text-blue-400 mb-4">Friends That Have Spotted Me</h2>
        <table className="min-w-full bg-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-gray-300">
            <tr>
              <th className="py-2 px-4">Streamer</th>
              <th className="py-2 px-4">Token</th>
              <th className="py-2 px-4">Amount</th>
              <th className="py-2 px-4">Available</th>
              <th className="py-2 px-4">Stream Type</th>
              <th className="py-2 px-4">Time</th>
              <th className="py-2 px-4">Volume Streamed</th>
              <th className="py-2 px-4"></th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {Object.entries(
              borrows.reduce((acc, borrow) => {
                if (!acc[borrow.lender]) {
                  acc[borrow.lender] = [];
                }
                acc[borrow.lender].push(borrow);
                return acc;
              }, {})
            ).map(([lender, lenderBorrows]) => (
              lenderBorrows.map((borrow) => (
                <tr key={borrow.hash} className="border-b border-gray-600">
                  <td className="py-2 px-4">{map(lender)}</td>
                  <td className="py-2 px-4">{map(borrow.token)}</td>
                  <td className="py-2 px-4">{borrow.allowable}</td>
                  <td className="py-2 px-4">{(displayedAvailableBorrowAmounts[borrow.hash] || 0).toFixed(6)}</td>
                  <td className="py-2 px-4">
                    <span className="text-orange-400">{!borrow.once && 'Unlimited'}</span>
                    <span className="text-green-400">{borrow.once && 'Once only'}</span>
                  </td>
                  <td className="py-2 px-4">
                    {!borrow.once ? (
                      <span>
                        @ {borrow.allowable} tokens per {Math.floor(borrow.window / (3600 * 24))}d:
                        {Math.floor((borrow.window % (3600 * 24)) / 3600)}h:
                        {Math.floor((borrow.window % 3600) / 60)}m:
                        {Math.floor(borrow.window % 60)}s
                      </span>
                    ) : (
                      <span>
                        ends in {
                          `${Math.floor((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) / 3600)}h:` +
                          `${Math.floor(((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) % 3600) / 60)}m:` +
                          `${Math.floor((borrow.timestamp + borrow.outstanding * borrow.window / borrow.allowable - Date.now() / 1000) % 60)}s`
                        }
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4">{borrow.totalStreamed}</td>
                  <td className="py-2 px-4">
                    <button
                      onClick={() => handleBorrow(borrow.token, borrow.lender, amount)}
                      className="py-2 px-4 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
                    >
                      Claim
                    </button>
                  </td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </div>
    </section>
  </main>
</div>

  );
};
export default App;