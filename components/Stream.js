import React, { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Stack,
  Chip,
  Button,
  Switch,
  FormControlLabel,
  IconButton,
  Card,
  CardContent,
  Divider,
  alpha,
  LinearProgress,
  Collapse,
  MenuItem,
} from '@mui/material';
import {
  ContentCopy,
  TrendingUp,
  CheckCircle,
  Edit,
  Save,
  Cancel,
  MonetizationOn,
} from '@mui/icons-material';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useEthersProvider, useEthersSigner } from './tl';
import { GlassCard, AnimatedButton } from './v2';
import { gradients } from '../theme/v2Theme';
import tokens from './tokens.js';

const tokenaddress = '0x0000000000000000000000000000000000000000';
let signer;
let provider;
let tokenOptions = tokens;

const Stream = () => {
  let ContractAddress = '0x27d632e1525a965dadd960a80c40fe8b31f8ea47';
  const ContractABI = [{"inputs":[{"internalType":"address payable","name":"feeAddrs","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"streamer","type":"address"},{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"StreamAllowed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"streamer","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"string","name":"message","type":"string"}],"name":"StreamFailure","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"token","type":"address"},{"indexed":true,"internalType":"address","name":"streamer","type":"address"},{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Streamed","type":"event"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"name":"allowStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"},{"internalType":"uint256[]","name":"amounts","type":"uint256[]"},{"internalType":"uint256[]","name":"windows","type":"uint256[]"},{"internalType":"bool[]","name":"onces","type":"bool[]"}],"name":"batchAllowStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"batchComputeHash","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"batchStream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"batchStreamAvailable","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"}],"name":"batchStreamAvailableAllowances","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"tokens","type":"address[]"},{"internalType":"address[]","name":"streamers","type":"address[]"},{"internalType":"address[]","name":"recipients","type":"address[]"}],"name":"cancelStreams","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"computeHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"fee","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"feeAddress","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"getAvailable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"}],"name":"getStreamDetails","outputs":[{"internalType":"uint256[]","name":"availableAmounts","type":"uint256[]"},{"internalType":"uint8[]","name":"decimals","type":"uint8[]"},{"internalType":"string[]","name":"tokenNames","type":"string[]"},{"internalType":"string[]","name":"tokenSymbols","type":"string[]"},{"components":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"totalStreamed","type":"uint256"},{"internalType":"uint256","name":"outstanding","type":"uint256"},{"internalType":"uint256","name":"allowable","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"internalType":"struct Stream.StreamDetails[]","name":"details","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32[]","name":"hashes","type":"bytes32[]"}],"name":"getStreamable","outputs":[{"internalType":"bool[]","name":"canStream","type":"bool[]"},{"internalType":"uint256[]","name":"balances","type":"uint256[]"},{"internalType":"uint256[]","name":"allowances","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_fee","type":"uint256"},{"internalType":"address","name":"newFeeAddress","type":"address"}],"name":"setFee","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"}],"name":"stream","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"name":"streamDetails","outputs":[{"internalType":"address","name":"streamer","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"totalStreamed","type":"uint256"},{"internalType":"uint256","name":"outstanding","type":"uint256"},{"internalType":"uint256","name":"allowable","type":"uint256"},{"internalType":"uint256","name":"window","type":"uint256"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"bool","name":"once","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"streamDetailsByRecipient","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"streamDetailsByStreamer","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"recipient","type":"address"}],"name":"viewRecipientAllowances","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"streamer","type":"address"}],"name":"viewStreamerAllowances","outputs":[{"internalType":"bytes32[]","name":"","type":"bytes32[]"}],"stateMutability":"view","type":"function"}];
  const tokenABI = [{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"minter_","type":"address"},{"internalType":"uint256","name":"mintingAllowedAfter_","type":"uint256"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Approval","type":"event"},{"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"rawAmount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"}];

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
    '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913': 'USDC'
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
        }))
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
    if (cache[address]) return cache[address];
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
if (await token.balanceOf(userAddress) < (ethers.parseUnits(amount, decimals))) {toast.error('You do not have enough tokens to stream.'); return;}
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

  const handleBorrow = async (token, lender,to) => {
    console.log('borrowing', token, lender,to);
    console.log('borrowing', token, lender, amount);
    let contract = new ethers.Contract(ContractAddress, ContractABI, signer);
    try {
      const tx = await contract.stream(token, lender, to?to:account);
      await tx.wait();
      toast.success('Stream successful');
      fetchFriendAllowances();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error');
    }
  };

  const batchStream = async () => {
    if (!signer) {
        toast.error('No signer available');
        return;
    }
    let tokenTo = useSingleToken ? Array(recipients.length).fill(stoken) : tokens;
    let amountTo = useSameAmount ? Array(recipients.length).fill(amount) : amounts;
    let windows = Array(recipients.length).fill(!once?window*3600*24:window);
    let onces = Array(recipients.length).fill(once);
    try {
        const tokenAmounts = await calculateTokenApprovals(tokenTo, amountTo);
        await approveTokensIfNecessary(tokenAmounts);
        const parsedAmounts = await parseAmounts(tokenTo, amountTo);
        const tx = await contract.connect(ethersSigner).batchAllowStream(tokenTo, recipients, parsedAmounts, windows, onces);
        await tx.wait();
        toast.success('Stream successful');
        fetchFriendAllowances();
    } catch (error) {
        console.error('Error:', error);
        toast.error(error.message || 'Error occurred while streaming');
    }
};

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

const approveTokensIfNecessary = async (tokenAmounts) => {
    for (let tokenAddress in tokenAmounts) {
        let tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);
        let currentAllowance = await tokenContract.allowance(await signer.getAddress(), ContractAddress);
        if (BigInt(currentAllowance) < tokenAmounts[tokenAddress]) {
            let tx = await tokenContract.approve(ContractAddress, tokenAmounts[tokenAddress]);
            await tx.wait();
        } else {
            console.log(`No need to approve for token ${tokenAddress}, sufficient allowance.`);
        }
    }
};

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
    const currentTime = Math.floor(Date.now() / 1000);
    const elapsedTime = currentTime - allowance.timestamp;
    const allowableAmount = (allowance.allowable * elapsedTime) / allowance.window;
    if (allowableAmount > allowance.outstanding) {
      return allowance.outstanding;
    } else {
      return allowableAmount;
    }
  }

  useEffect(() => {
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
  setEditingRow(allowance.hash);
  setEditedAllowance({
    friend: allowance.friend,
    token: allowance.token,
    allowable: allowance.allowable,
  });
};

const handleCancelEdit = () => {
  setEditingRow(null);
};

const handleSaveEdit = (hash) => {
  console.log(`Saving changes for ${hash}`, editedAllowance);
  setEditingRow(null);
};

const handleChange = (e) => {
  setEditedAllowance({
    ...editedAllowance,
    [e.target.name]: e.target.value,
  });
};

const [totalClaim, setTotalClaim] = useState({});
const [streamable, setStreamable] = useState({});

useEffect(() => {
  const fetchStreamableBorrows = async () => {
    try {
      let contract = new ethers.Contract(ContractAddress, ContractABI, signer);
      const hashes = borrows.map(borrow => borrow.hash);
      const [canStreamArray] = await contract.getStreamable(hashes);
let canStream = hashes.map((hash, index) => ({
  hash,
  canStream: canStreamArray[index],
}));
setStreamable(canStream);
      const streamableBorrows = borrows.filter((_, index) => canStreamArray[index]);
      const newClaimByToken = streamableBorrows.reduce((acc, borrow) => {
        const { token, available, decimals } = borrow;
        const availableFormatted = parseFloat(ethers.formatUnits(available, decimals));
        if (acc[token]) {
          acc[token] += availableFormatted;
        } else {
          acc[token] = availableFormatted;
        }
        return acc;
      }, {});
      const formattedTotalClaim = Object.fromEntries(
        Object.entries(newClaimByToken).map(([token, amount]) => [
          token,
          amount.toFixed(10),
        ])
      );
      setTotalClaim(formattedTotalClaim);
    } catch (error) {
      console.error('Error fetching streamable borrows:', error);
    }
  };
  if (borrows.length > 0) {
    fetchStreamableBorrows();
  }
}, [borrows]);

const handleClaim = async (token) => {
  try {
    const hashesToClaim = borrows
      .filter(borrow => !token || borrow.token === token)
      .map(borrow => borrow.hash);
    if (hashesToClaim.length === 0) {
      toast.error('No claims available');
      return;
    }
    let contract = new ethers.Contract(ContractAddress, ContractABI, signer);
    const tx = await contract.batchStreamAvailableAllowances(hashesToClaim);
    await tx.wait();
    toast.success('Claimed successfully!');
    fetchFriendAllowances();
  } catch (error) {
    console.error('Error claiming:', error);
    toast.error('Error claiming');
  }
};

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(to right, #fce7f3, #fed7aa, #fef3c7)' }}>
      <Toaster />
      <Box sx={{ background: gradients.mesh, py: 4, borderRadius: '0 0 40px 40px', mb: 4 }}>
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Chip label="Powered by Boop.Finance" sx={{ background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#fff', fontWeight: 700 }} />
            <ConnectButton />
          </Stack>
          <Typography variant="h3" fontWeight={800} textAlign="center" sx={{ color: '#fff', mb: 1 }}>
            Stream - in Alpha
          </Typography>
          <Stack direction="row" justifyContent="center" alignItems="center" spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600 }}>Pro Mode</Typography>
            <Switch checked={pro} onChange={(e) => setPro(e.target.checked)} sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#ec4899' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#ec4899' } }} />
          </Stack>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {!pro && (
          <Box>
            <GlassCard sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom textAlign="center">
                Stream tokens from your wallet, no locking tokens, no interest, no fees.
              </Typography>
              <Stack spacing={3} sx={{ mt: 4 }}>
                <TextField select fullWidth label="Token Address" value={stoken || ''} onChange={(e) => setToken(e.target.value)}>
                  <MenuItem value="">Select a token</MenuItem>
                  {tokenOptions[ChainId]?.map((token) => (
                    <MenuItem key={token.address} value={token.address}>{token.symbol}</MenuItem>
                  ))}
                  <MenuItem value="custom">Custom</MenuItem>
                </TextField>
                {stoken === 'custom' && <TextField fullWidth label="Custom Token Address" placeholder="0x..." onChange={(e) => setToken(e.target.value)} />}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField fullWidth label="To Address/ENS" value={friend} onChange={(e) => setFriend(e.target.value)} />
                  <TextField fullWidth label="Stream Amount" type="number" step="0.01" onChange={(e) => setAmount(e.target.value)} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {!once && <TextField fullWidth label="Days to Stream Amount" type="number" step="0.01" onChange={(e) => setWindow(e.target.value)} />}
                  {once && <TextField fullWidth label="End Date" type="datetime-local" InputLabelProps={{ shrink: true }} onChange={(e) => { const selectedDate = new Date(e.target.value); const currentDate = new Date(); const windowInSeconds = Math.floor((selectedDate - currentDate) / 1000); setWindow(windowInSeconds); }} />}
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>{!once && <Chip label="Unlimited" color="warning" />}{once && <Chip label="Once only" color="success" />}</Typography>
                  <FormControlLabel control={<Switch checked={once} onChange={(e) => setOnce(e.target.checked)} />} label="Stream" />
                </Stack>
                <AnimatedButton fullWidth onClick={() => requestBorrow(stoken, friend, amount)}>Set Allowance</AnimatedButton>
                <Button fullWidth variant="outlined" onClick={() => location.assign('https://spot.pizza/')}>Check out Spot🍕</Button>
              </Stack>
            </GlassCard>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>Friends That Have Spotted Me</Typography>
              {borrows.length > 0 && (<>
                  <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom sx={{ mt: 3 }}>Claimable</Typography>
                  <AnimatedButton onClick={() => handleClaim()} sx={{ mb: 2, background: gradients.sunset }}>Claim All</AnimatedButton>
                  <GlassCard sx={{ p: 2, mb: 3 }}>
                    <Grid container spacing={2}>
                      {Object.entries(totalClaim).map(([token, amount], index) => {
                        const colorGradients = [gradients.sunset, gradients.ocean, gradients.success, gradients.lavender, gradients.primary, gradients.emerald];
                        return (<Grid item xs={12} sm={6} md={4} key={token}>
                            <Button fullWidth onClick={() => handleClaim(token)} sx={{ background: colorGradients[index % colorGradients.length], color: '#fff', fontWeight: 700, py: 2, borderRadius: 3, '&:hover': { transform: 'scale(1.05)' } }}>
                              {amount} {token.substring(0, 20)}
                            </Button>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </GlassCard>
                </>
              )}
              {Object.entries(borrows.reduce((acc, borrow) => { if (!acc[borrow.lender]) { acc[borrow.lender] = []; } acc[borrow.lender].push(borrow); return acc; }, {})).map(([lender, lenderBorrows]) => (
                <GlassCard key={lender} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>{ENS(lender, ENSCache, setENSCache)}</Typography>
                  <Grid container spacing={2}>
                    {lenderBorrows.map((borrow) => (
                      <Grid item xs={12} md={6} lg={4} key={borrow.hash}>
                        <Card sx={{ background: alpha('#ec4899', 0.1) }}>
                          <CardContent>
                            <Stack spacing={2}>
                              <Box textAlign="center"><Typography variant="caption" color="text.secondary">🪙 Token</Typography><Typography variant="h6" fontWeight={700} color="warning.main">{borrow.token.substring(0, 20)}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>💸 Allowable</Typography><Typography variant="body1" fontWeight={600} color="warning.main">{borrow.allowable}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>💰 Available</Typography><Typography variant="body1" fontWeight={600} color="warning.main">{(displayedAvailableBorrowAmounts[borrow.hash] || 0).toFixed(6)}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>📊 Volume Streamed</Typography><Typography variant="body1" color="warning.main">{borrow.totalStreamed}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>⏳ Allowance Type</Typography><Typography variant="body1" fontWeight={600} color={borrow.once ? 'success.main' : 'warning.main'}>{borrow.once ? 'Once only' : 'Unlimited'}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>⌛ Remaining Time</Typography><Typography variant="body2" color="warning.main">{!borrow.once ? `@ ${borrow.allowable} tokens per ${Math.floor(borrow.window / (3600 * 24))}d ${Math.floor((borrow.window % (3600 * 24)) / 3600)}h ${Math.floor((borrow.window % 3600) / 60)}m` : `ends in ${Math.floor((borrow.timestamp + (borrow.outstanding * borrow.window) / borrow.allowable - Date.now() / 1000) / 3600)}h ${Math.floor(((borrow.timestamp + (borrow.outstanding * borrow.window) / borrow.allowable - Date.now() / 1000) % 3600) / 60)}m`}</Typography></Box>
                              <AnimatedButton fullWidth onClick={() => handleBorrow(borrow.tokenAddrs, borrow.lender)} sx={{ background: gradients.success }}>Claim</AnimatedButton>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </GlassCard>
              ))}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>Allowances to Friends</Typography>
              {Object.entries(allowances.reduce((acc, allowance) => { if (!acc[allowance.friend]) { acc[allowance.friend] = []; } acc[allowance.friend].push(allowance); return acc; }, {})).map(([friend, friendAllowances]) => (
                <GlassCard key={friend} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>{ENS(friend, ENSCache, setENSCache)}</Typography>
                  <Grid container spacing={2}>
                    {friendAllowances.map((allowance, idx) => (
                      <Grid item xs={12} md={6} lg={4} key={idx}>
                        <Card sx={{ background: alpha('#ec4899', 0.1) }}>
                          <CardContent>
                            <Stack spacing={2}>
                              <Box textAlign="center"><Typography variant="caption" color="text.secondary">🪙 Token</Typography><Typography variant="h6" fontWeight={700} color="warning.main">{allowance.token.substring(0, 20)}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>💸 Allowable</Typography><Typography variant="body1" fontWeight={600} color="warning.main">{allowance.allowable}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>💰 Available</Typography><Typography variant="body1" fontWeight={600} color="warning.main">{(displayedAvailableAmounts[allowance.hash] || 0).toFixed(6)}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>📊 Volume Streamed</Typography><Typography variant="body1" color="warning.main">{allowance.totalStreamed}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>⏳ Allowance Type</Typography><Typography variant="body1" fontWeight={600} color={allowance.once ? 'success.main' : 'warning.main'}>{allowance.once ? 'Once only' : 'Unlimited'}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>⌛ Remaining Time</Typography><Typography variant="body2" color="warning.main">{!allowance.once ? `@ ${allowance.allowable} every ${Math.floor(allowance.window / (3600 * 24))}d ${Math.floor((allowance.window % (3600 * 24)) / 3600)}h ${Math.floor((allowance.window % 3600) / 60)}m` : `ends in ${Math.floor((allowance.timestamp + (allowance.outstanding * allowance.window) / allowance.allowable - Date.now() / 1000) / 3600)}h ${Math.floor(((allowance.timestamp + (allowance.outstanding * allowance.window) / allowance.allowable - Date.now() / 1000) % 3600) / 60)}m`}</Typography></Box>
                              <Stack direction="row" spacing={1}>
                                <TextField size="small" placeholder="Amount" type="number" onChange={(e) => setAmount(e.target.value)} sx={{ flex: 1 }} />
                                <TextField size="small" placeholder="Days" type="number" onChange={(e) => setWindow(e.target.value)} sx={{ flex: 1 }} />
                              </Stack>
                              <FormControlLabel control={<Switch checked={once} onChange={(e) => setOnce(e.target.checked)} />} label={once ? 'Once' : 'Unlimited'} />
                              <Stack spacing={1}>
                                <AnimatedButton fullWidth size="small" onClick={() => requestBorrow(allowance.token, friend, amount)} sx={{ background: gradients.success }}>Set Allowance</AnimatedButton>
                                <AnimatedButton fullWidth size="small" onClick={() => handleBorrow(allowance.tokenAddrs, account, friend)} sx={{ background: gradients.ocean }}>Stream</AnimatedButton>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </GlassCard>
              ))}
            </Box>
          </Box>
        )}
        {pro && (
          <Box>
            <GlassCard sx={{ p: 4, mb: 4 }}>
              <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom textAlign="center">Stream tokens to multiple recipients</Typography>
              <Stack spacing={3} sx={{ mt: 4 }}>
                <TextField fullWidth multiline rows={3} label="Recipient Addresses (Comma-separated)" placeholder="Enter recipient addresses, separated by commas" onChange={(e) => setRecipients(e.target.value.split(','))} />
                <FormControlLabel control={<Switch checked={useSingleToken} onChange={() => setUseSingleToken(!useSingleToken)} />} label="Use Single Token for All" />
                {useSingleToken ? (<TextField fullWidth label="Token Address" placeholder="Enter token address" onChange={(e) => setToken(e.target.value)} />) : (<TextField fullWidth multiline rows={3} label="Token Addresses (Comma-separated)" placeholder="Enter token addresses, separated by commas" onChange={(e) => setTokens(e.target.value.split(','))} />)}
                <FormControlLabel control={<Switch checked={useSameAmount} onChange={() => setUseSameAmount(!useSameAmount)} />} label="Use Same Amount for All" />
                {useSameAmount ? (<TextField fullWidth label="Stream Amount (Same for All)" type="number" placeholder="Enter stream amount" onChange={(e) => setAmount(e.target.value)} />) : (<TextField fullWidth multiline rows={3} label="Stream Amounts (Comma-separated)" placeholder="Enter stream amounts, separated by commas" onChange={(e) => setAmounts(e.target.value.split(','))} />)}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  {!once && <TextField fullWidth label="Days to Stream Amount" type="number" step="0.01" onChange={(e) => setWindow(e.target.value)} />}
                  {once && <TextField fullWidth label="End Date" type="datetime-local" InputLabelProps={{ shrink: true }} onChange={(e) => { const selectedDate = new Date(e.target.value); const currentDate = new Date(); const windowInSeconds = Math.floor((selectedDate - currentDate) / 1000); setWindow(windowInSeconds); }} />}
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography>{!once && <Chip label="Unlimited" color="warning" />}{once && <Chip label="Once only" color="success" />}</Typography>
                  <FormControlLabel control={<Switch checked={once} onChange={(e) => setOnce(e.target.checked)} />} label="Stream" />
                </Stack>
                <AnimatedButton fullWidth onClick={() => batchStream()}>Set Batch Allowance</AnimatedButton>
              </Stack>
            </GlassCard>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>Friends That Have Spotted Me</Typography>
              <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom sx={{ mt: 2 }}>Claimable</Typography>
              <GlassCard sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2}>
                  {Object.entries(totalClaim).map(([token, amount], index) => {
                    const colorGradients = [gradients.sunset, gradients.ocean, gradients.success, gradients.lavender, gradients.primary, gradients.emerald];
                    return (<Grid item xs={6} sm={4} md={3} key={token}>
                        <Button fullWidth onClick={() => handleClaim(token)} sx={{ background: colorGradients[index % colorGradients.length], color: '#fff', fontWeight: 700, py: 2, borderRadius: 3, '&:hover': { transform: 'scale(1.05)' } }}>
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>{amount} {token.substring(0, 20)}</Typography>
                        </Button>
                      </Grid>
                    );
                  })}
                </Grid>
              </GlassCard>
              {Object.entries(borrows.reduce((acc, borrow) => { if (!acc[borrow.lender]) { acc[borrow.lender] = []; } acc[borrow.lender].push(borrow); return acc; }, {})).map(([lender, lenderBorrows]) => (
                <GlassCard key={lender} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>{ENS(lender, ENSCache, setENSCache)}</Typography>
                  <Grid container spacing={2}>
                    {lenderBorrows.map((borrow) => (
                      <Grid item xs={12} md={6} lg={4} key={borrow.hash}>
                        <Card sx={{ background: alpha('#ec4899', 0.1) }}>
                          <CardContent>
                            <Stack spacing={2}>
                              <Box textAlign="center"><Typography variant="caption" color="text.secondary">🪙 Token</Typography><Typography variant="h6" fontWeight={700} color="warning.main">{borrow.token.substring(0, 20)}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>💸 Allowable</Typography><Typography variant="body1" fontWeight={600} color="warning.main">{borrow.allowable}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>💰 Available</Typography><Typography variant="body1" fontWeight={600} color="warning.main">{(displayedAvailableBorrowAmounts[borrow.hash] || 0).toFixed(6)}</Typography></Box>
                              <AnimatedButton fullWidth onClick={() => handleBorrow(borrow.tokenAddrs, borrow.lender)} sx={{ background: gradients.success }}>Claim</AnimatedButton>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </GlassCard>
              ))}
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>Allowances to Friends</Typography>
              {Object.entries(allowances.reduce((acc, allowance) => { if (!acc[allowance.friend]) { acc[allowance.friend] = []; } acc[allowance.friend].push(allowance); return acc; }, {})).map(([friend, friendAllowances]) => (
                <GlassCard key={friend} sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>{ENS(friend, ENSCache, setENSCache)}</Typography>
                  <Grid container spacing={2}>
                    {friendAllowances.map((allowance, idx) => (
                      <Grid item xs={12} md={6} lg={4} key={idx}>
                        <Card sx={{ background: alpha('#ec4899', 0.1) }}>
                          <CardContent>
                            <Stack spacing={2}>
                              <Box textAlign="center"><Typography variant="caption" color="text.secondary">🪙 Token</Typography><Typography variant="h6" fontWeight={700} color="warning.main">{allowance.token.substring(0, 20)}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>💸 Allowable</Typography><Typography variant="body1" fontWeight={600} color="warning.main">{allowance.allowable}</Typography></Box>
                              <Box sx={{ background: '#fff', p: 2, borderRadius: 3, textAlign: 'center' }}><Typography variant="caption" fontWeight={600}>💰 Available</Typography><Typography variant="body1" fontWeight={600} color="warning.main">{(displayedAvailableAmounts[allowance.hash] || 0).toFixed(6)}</Typography></Box>
                              <AnimatedButton fullWidth size="small" onClick={() => handleBorrow(allowance.tokenAddrs, account, friend)} sx={{ background: gradients.ocean }}>Stream</AnimatedButton>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </GlassCard>
              ))}
            </Box>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Stream;
