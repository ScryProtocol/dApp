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
  Paper, ListItemText
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

  const [subscriptionDetails, setSubscriptionDetails] = useState(null);
  const [subscriptionLink, setSubscriptionLink] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [streamContract, setStreamContract] = useState(null);
  const [window, setWindow] = useState('');
  const [once, setOnce] = useState(false);
  const [streams, setStreams] = useState([]);
  const ethersSigner = useEthersSigner();
  provider = ethersProvider
  signer = ethersSigner
  let location
  let account = useAccount();
  let userAddress = useAccount().address;
  let ChainId = useChainId()
  ChainId == 1 ? ContractAddress = '0x90076e40A74F33cC2C673eCBf2fBa4068Af77892' : {}
  ChainId == 17000 ? ContractAddress = '0x27090cd6D7c20007B9a976E58Ac4231b74c20D8b' : {}

  account = account.address
  let contract = new ethers.Contract(
    ContractAddress,
    ContractABI,
    ethersProvider
  );
  let token
  provider.addListener('network', (newNetwork, oldNetwork) => {
    console.log('newNetwork', newNetwork, 'oldNetwork', oldNetwork)
    try {

      ChainId == 1 ? ContractAddress = '0x90076e40A74F33cC2C673eCBf2fBa4068Af77892' : {}
      ChainId == 17000 ? ContractAddress = '0x27090cd6D7c20007B9a976E58Ac4231b74c20D8b' : {}
      console.log('ContractAddress', ContractAddress)
      account = account.address
      contract = new ethers.Contract(
        ContractAddress,
        ContractABI,
        ethersProvider
      );
      console.log('lol')

    } catch (error) {
      console.error('Error connecting to Ethereum:', error);
    }
  })
  const toggleModal = () => {
    setShowModal(!showModal);
  };useEffect(() => {
    async function w(ms) {
    async function wait(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }
    await wait(5000);
    if (typeof window !== 'undefined' && window.location) {
      location = window.location.href;
      console.log('location', location, window.location)
    }
    console.log(window, window.location)
  check()}
   w()
  }, []);
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

        } catch (error) {
          console.error('Error connecting to Ethereum:', error);
        }
      } else {
//        const providerInstance = new ethers.providers.JsonRpcProvider('https://1rpc.io/sepolia');

        async function wait(ms) {
          return new Promise((resolve) => {
            setTimeout(resolve, ms);
          });
        }

        await wait(5000);
        console.log('lol');
      }
    };

    initEthers();
  }, []);

  useEffect(() => {
    if (contract && userAddress) {
      const init = async () => {
        if (boop == null) {

          setboop('1');
        }
      };

      init();
    }
  }, [contract, userAddress]);

  useEffect(() => {
    const initializeContract = async () => {

      const { token, subscribe, amount, window, once, network } = getQueryParams();

      if (network && (await provider.getNetwork()).chainId !== network) {
        toast.error('Check network. Must be chainId', network)
      }


      await check();
    };

    initializeContract();
  }, []);

  const getQueryParams = () => {
    const params = new URLSearchParams(location);
    return {
      token: params.get('token'),
      subscribe: params.get('subscribe'),
      amount: params.get('amount'),
      window: params.get('window'),
      once: params.get('once'),
      network: params.get('network'),
    };
  };

  const displaySubscriptionLink = (link) => {
    setSubscriptionLink(link);
    navigator.clipboard.writeText(link)
      .then(() => {
        toast.success('Subscription link copied to clipboard!');

      })
      .catch((error) => {
        console.error('Failed to copy subscription link:', error);
      });
  };

  const displaySubscriptionDetails = (details) => {
    setSubscriptionDetails(details);
  };

  const handleCreateSubscription = async (event) => {
    event.preventDefault();
    const tokenAddress = event.target.tokenAddress.value;
    const subscriber = event.target.subscriber.value;
    const amount = ethers.parseUnits(event.target.amount.value, 18);
    const window = event.target.window.value * 24 * 60 * 60;
    const once = event.target.once.value === 'true';
    const selectedNetwork = event.target.networkSelect.value;

    const subscriptionLink = `https://sub.spot.pizza/?token=${tokenAddress}&subscribe=${subscriber}&amount=${amount}&window=${window}&once=${once}&network=${selectedNetwork}`;
    displaySubscriptionLink(subscriptionLink);
  };

  const check = async () => {
    console.log('check')
    const { token, subscribe, amount, window, once } = getQueryParams();
    console.log('token', token, 'subscribe', subscribe, 'amount', amount, 'window', window, 'once', once) 
    if (token && subscribe && amount && window && once !== null) {
      let subscriptionHash;
      let details = { lender: 1 };
      try {
        subscriptionHash = await contract.computeHash(userAddress, token, subscribe);
        details = await contract.streamDetails(subscriptionHash);
      } catch (error) {
        console.log(error);
      }

      if (details.lender !== ethers.constants.AddressZero && details.lender !== 1) {
        displaySubscriptionDetails(details);
        setIsSubscribed(true);
      } else {
        // Display subscription details for new subscription
        // ...
      }
    }
  };

  const handleSubscribe = async () => {
    const { token, subscribe, amount, window, once, network } = getQueryParams();

    if ((await provider.getNetwork()).chainId !== network) {
      toast.error('Check network. Must be chainId', network)

      return;
    }

    const tx = await contract.allowStream(token, subscribe, amount, window, once);
    await tx.wait();
    await check();
    setIsSubscribed(true);
  };

  return (
    <>
      <div className="container" id="createForm">
        <h1>Create Subscription</h1>
        <div className="emoji">🍕🎉</div>
        <div className="card">
          <form onSubmit={handleCreateSubscription}>
            <div className="form-group">
              <label htmlFor="tokenAddress">Token Address:</label>
              <input type="text" id="tokenAddress" placeholder="Enter ERC20 token address" />
            </div>
            <div className="form-group">
              <label htmlFor="subscriber">Subscriber Address:</label>
              <input type="text" id="subscriber" placeholder="Enter subscriber address" />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input type="number" id="amount" placeholder="Enter amount of tokens" />
            </div>
            <div className="form-group">
              <label htmlFor="window">Duration (in days):</label>
              <input type="number" id="window" placeholder="Enter duration in days" />
            </div>
            <div className="form-group">
              <label htmlFor="once">Subscription Type:</label>
              <select id="once">
                <option value="false">Recurring</option>
                <option value="true">One-time</option>
              </select>
            </div>
            <div className="form-group">
              <label>Network:</label>
              <div>
                <select id="networkSelect">
                  <option value="1">Mainnet</option>
                  <option value="10">Holesky</option>
                  <option value="10">Optimism</option>
                  <option value="8453">Base</option>
                  <option value="gnosis">Gnosis</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn">Create</button>
          </form>
        </div>
        <div id="linkContainer" className="card">
          <p>Subscription Link:</p>
          <a href={subscriptionLink} id="subLink">
            <p id="subscriptionLink" style={{ wordBreak: 'break-all' }}>{subscriptionLink}</p>
          </a>
        </div>
      </div>

      <div className="container" id="subscriptionDetails">
        <h1>Subscribe🍕😋</h1>
        <div className="card">
          <h2>Subscription Details</h2>
          {subscriptionDetails && (
            <div className="details-container">
              <div className="detail-item">
                <div className="detail-label">Subscribe To:</div>
                <div className="detail-value">{subscriptionDetails.lender}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">My Address:</div>
                <div className="detail-value">{subscriptionDetails.friend}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Token:</div>
                <div className="detail-value">{subscriptionDetails.token}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label" id="totalStreamed2">Total Streamed:</div>
                <div className="detail-value">{ethers.utils.formatUnits(subscriptionDetails.totalStreamed, 18)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label" id="outstanding2">Outstanding:</div>
                <div className="detail-value">{ethers.utils.formatUnits(subscriptionDetails.outstanding, 18)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Amount:</div>
                <div className="detail-value">{ethers.utils.formatUnits(subscriptionDetails.allowable, 18)}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Window:</div>
                <div className="detail-value">{subscriptionDetails.window.toString()}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label" id="timestamp2">Timestamp:</div>
                <div className="detail-value">{new Date(subscriptionDetails.timestamp.toNumber() * 1000).toLocaleString()}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Once:</div>
                <div className="detail-value">{subscriptionDetails.once ? 'One-time' : 'Recurring'}</div>
              </div>
            </div>
          )}
        </div>
        {!isSubscribed && (
          <div id="subscribeForm" className="card">
            <button className="btn" onClick={handleSubscribe}>Subscribe</button>
          </div>
        )}
        {isSubscribed && (
          <div id="subscribedMessage" className="card">
            <div className="subscribed-content">
              <div className="emoji">🎉🍕</div>
              <h2>Congratulations!</h2>
              <p>Your subscription is cooking!</p>
              <div className="subscribed-animation">
                <div className="cheese"></div>
                <div className="cheese" style={{ top: '5%', left: '5%', width: '90%', height: '90%', backgroundColor: '#e74c3c' }}></div>
                <div className="grated-cheese" style={{ top: '5%', left: '5%', width: '90%', height: '90%', backgroundColor: '#e74c3c' }}></div>
                <div className="pepperoni" style={{ top: '20%', left: '15%' }}></div>
                <div className="pepperoni" style={{ top: '30%', right: '20%' }}></div>
                <div className="pepperoni" style={{ top: '60%', left: '30%' }}></div>
                <div className="pepperoni" style={{ top: '60%', right: '10%' }}></div>
                <div className="mushroom" style={{ top: '30%', left: '40%' }}></div>
                <div className="mushroom" style={{ top: '50%', right: '30%' }}></div>
                <div className="mushroom" style={{ top: '70%', left: '20%' }}></div>
              </div>
            </div>
          </div>
        )}<ConnectButton />
      </div>
    </>
  );
};
export default App;