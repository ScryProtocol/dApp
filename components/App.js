const React = require('react');
const { useState, useEffect, useCallback } = require('react');
const ethers = require('ethers');

import { Toaster, toast } from 'react-hot-toast';
import { chainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider } from './tl';
import { useEthersSigner } from './tl';
import { useAccount, useConnect, useEnsName, useChainId } from 'wagmi';

import 'tailwindcss/tailwind.css';
import { http, createConfig } from '@wagmi/core';
import { base, holesky, mainnet, optimism, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { useCapabilities, useWriteContracts } from 'wagmi/experimental';

const config = getDefaultConfig({
  chains: [mainnet, sepolia, holesky, base, optimism],
  projectId: '97d417268e5bd5a42151f0329e544898',
  transports: {
    [mainnet.id]: http(),
    [holesky.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [mainnet.id]: http(),
  },
});

let streamContractAddress = '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
const streamContractABI = [{ "inputs": [{ "internalType": "address payable", "name": "feeAddrs", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "friend", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "StreamAllowed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "streamer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Streamed", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "window", "type": "uint256" }, { "internalType": "bool", "name": "once", "type": "bool" }], "name": "allowStream", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }], "name": "computeHash", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "me", "type": "address" }], "name": "getAvailable", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }, { "internalType": "address", "name": "newfeeAddress", "type": "address" }], "name": "setFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "me", "type": "address" }], "name": "stream", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "streamDetails", "outputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "totalStreamed", "type": "uint256" }, { "internalType": "uint256", "name": "outstanding", "type": "uint256" }, { "internalType": "uint256", "name": "allowable", "type": "uint256" }, { "internalType": "uint256", "name": "window", "type": "uint256" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "bool", "name": "once", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "streamDetailsByFriend", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "streamDetailsByLender", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "friend", "type": "address" }], "name": "viewFriendAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }], "name": "viewLenderAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }];
  let tokenABI = [
    {
      "constant": true,
      "inputs": [],
      "name": "name",
      "outputs": [
        {
          "name": "",
          "type": "string"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [],
      "name": "decimals",
      "outputs": [
        {
          "name": "",
          "type": "uint8"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    },
    {
      "constant": false,
      "inputs": [
        {
          "name": "_spender",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "approve",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "constant": true,
      "inputs": [
        {
          "name": "_owner",
          "type": "address"
        },
        {
          "name": "_spender",
          "type": "address"
        }
      ],
      "name": "allowance",
      "outputs": [
        {
          "name": "",
          "type": "uint256"
        }
      ],
      "payable": false,
      "stateMutability": "view",
      "type": "function"
    }]


const App = () => {
  const [streamContract, setStreamContract] = useState(null);
  const [subscriptionLink, setSubscriptionLink] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    lender: "",
    friend: "",
    token: "",
    totalStreamed: 0,
    outstanding: 0,
    allowable: 0,
    window: "",
    timestamp: '',
    once: ''
  });
  const [showSubscribedMessage, setShowSubscribedMessage] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);
  const [subs, setSubs] = useState([]);
  const [selectedToken, setselectedToken] = useState(null);

  const ethersSigner = useEthersSigner();
  let provider = useEthersProvider();
  let signer = ethersSigner;
  let tok;
  let account = useAccount();
  let userAddress = useAccount().address;
  let ChainId = useChainId();
  streamContractAddress = ChainId === 1 ? '0x90076e40a74f33cc2c673ecbf2fba4068af77892' : '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';

  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        const { network } = getQueryParams();
        const streamContractAddress = network === '1' ? '0x90076e40a74f33cc2c673ecbf2fba4068af77892' : '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
        const streamContract = new ethers.Contract(streamContractAddress, streamContractABI, signer);
        setStreamContract(streamContract);
        await checkSubscription();
      } else {
        await checkSubscription();
      }
    };

    initializeContract();
  }, []);

  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    console.log(params, window.location.search);
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

  const displaySubscriptionDetails = (details, dec) => {
    setSubscriptionDetails({
      lender: details.lender,
      friend: details.friend,
      token: details.token,
      totalStreamed: ethers.formatUnits(details.totalStreamed, dec),
      outstanding: ethers.formatUnits(details.outstanding, dec),
      allowable: ethers.formatUnits(details.allowable, dec),
      window: !details.once
        ? `Pay every ${Math.floor(Number(details.window) / 86400)}d:${Math.floor((Number(details.window) % 86400) / 3600)}h:${Math.floor((Number(details.window) % 3600) / 60)}m:${Number(details.window) % 60}s`
        : `Sub until ${new Date(Date.now() + Number(details.window) * 1000).toLocaleString()}`,
      timestamp: new Date(Number(details.timestamp) * 1000).toLocaleString(),
      once: details.once ? 'One-time' : 'Recurring',
    });
  };

  const handleCreateSubscription = async (event) => {
    if (document.getElementById('subscriber').value == '') {
      document.getElementById('subscriber').value = userAddress;
    }
    event.preventDefault();
    const tokenAddress = selectedToken;
    const subscriber = document.getElementById('subscriber').value;
    const amount = document.getElementById('amount').value;
    const window = document.getElementById('window').value * 24 * 60 * 60; // Convert days to seconds
    const once = document.getElementById('once').value === 'true';
    const selectedNetwork = document.getElementById('networkSelect').value;

    const subscriptionLink = `https://sub.spot.pizza/?token=${tokenAddress}&subscribe=${subscriber}&amount=${amount}&window=${window}&once=${once}&network=${selectedNetwork}`;
    displaySubscriptionLink(subscriptionLink);
  };

  const checkSubscription = async () => {
    const { token, subscribe, amount, window, once, network } = getQueryParams();
    console.log(getQueryParams());
    console.log('1', token, subscribe, amount, window, once);
    if (token && subscribe && amount && window && once) {
      tok = token;
      let subscriptionHash;
      let details = { lender: 1 };
      try {
        console.log(provider);
        const streamContractAddress = network === '1' ? '0x90076e40a74f33cc2c673ecbf2fba4068af77892' : '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
        const streamContract = new ethers.Contract(streamContractAddress, streamContractABI, provider);
        subscriptionHash = await streamContract.computeHash(userAddress, token, subscribe);
        details = await streamContract.streamDetails(subscriptionHash);
      } catch (error) {
        console.log(error);
      }

      if (details.lender !== '0x0000000000000000000000000000000000000000' && details.lender !== 1) {
        const tokenContract = new ethers.Contract(token, tokenABI, provider);
        let dec;
        try {
          dec = await tokenContract.decimals();
        } catch (error) {
          toast.error(`Could not find token. Check network! Must be chainId: ${network}`);
          dec = 18;
        }
        displaySubscriptionDetails(details, dec);
        console.log(details, dec);
        setShowSubscribedMessage(true);
        setShowSubscribeForm(true);

        const resolvedLender = await resolveENS(details.lender);
        const resolvedFriend = await resolveENS(details.friend);
        const resolvedToken = await resolveENS(details.token, 1);
        console.log('2', resolvedLender, resolvedFriend, resolvedToken);

        setSubscriptionDetails(prevDetails => ({
          ...prevDetails,
          lender: resolvedLender,
          friend: resolvedFriend,
          token: resolvedToken
        }));
      } else {
        setSubscriptionDetails({
          lender: userAddress,//subscribe,
          friend: subscribe,//userAddress,
          token: token,
          totalStreamed: '',
          outstanding: '',
          allowable: amount,
          window: once == 'false'
            ? `Pay every ${Math.floor(Number(window) / 86400)}d:${Math.floor((Number(window) % 86400) / 3600)}h:${Math.floor((Number(window) % 3600) / 60)}m:${Number(window) % 60}s`
            : `Sub until ${new Date(Date.now() + Number(window) * 1000).toLocaleString()}`,
          timestamp: '',
          once: once !== 'false' ? 'One-time' : 'Recurring',
        });
        setShowSubscribeForm(true);
        console.log('no subscription found');
        const resolvedLender = await resolveENS(userAddress)//subscribe);
        const resolvedFriend = await resolveENS(subscribe)//userAddress);
        const resolvedToken = await resolveENS(token, 1);
        console.log('2', resolvedLender, resolvedFriend, resolvedToken);

        setSubscriptionDetails(prevDetails => ({
          ...prevDetails,
          lender: resolvedLender,
          friend: resolvedFriend,
          token: resolvedToken
        }));
      }
    }
  };

  const handleSubscribe = async () => {
    const { token, subscribe, amount, window, once, network } = getQueryParams();

    if (ChainId != network) {
      toast.error(`Check network! Must be chainId: ${network.toString()}`);
      return;
    }
    const streamContract = new ethers.Contract(streamContractAddress, streamContractABI, signer);
    const tokenContract = new ethers.Contract(token, tokenABI, signer);
    const dec = await tokenContract.decimals();
    console.log(tokenContract.allowance(userAddress, streamContractAddress));
    if (await tokenContract.allowance(userAddress, streamContractAddress) < (amount * 10 ** Number(dec))) {
      toast('Approving token for subscription');

      if (capabilities) {
        console.log('Paymaster:', capabilities.paymasterService);
        writeContracts({
          contracts: [{
            address: token,
            abi: tokenABI,
            functionName: 'approve',
            args: [streamContractAddress, ethers.MaxUint256],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
      }else {
        const tx = await tokenContract.approve(streamContractAddress, ethers.MaxUint256);
        await tx.wait();
      }
    }
    toast('Subscribing');

    if (capabilities) {
      console.log('Paymaster:', capabilities.paymasterService);
      writeContracts({
        contracts: [{
          address: streamContractAddress,
          abi: streamContractABI,
          functionName: 'allowStream',
          args: [token, subscribe, (amount * 10 ** Number(dec)).toString(), window, once],
        }],
        capabilities: {
          paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
        },
      });
    }else {

      const tx = await streamContract.allowStream(token, subscribe, (amount * 10 ** Number(dec)).toString(), window, once);
      await tx.wait();
    }

    await checkSubscription();
    setShowSubscribedMessage(true);
  };

  const resolveENS = async (address, isToken) => {
    let pro = new ethers.JsonRpcProvider('https://eth.meowrpc.com');

    try {
      if (isToken == 1) {
        try {
          const tokenContract = new ethers.Contract(tok, tokenABI, provider);
          const tokenName = await tokenContract.name();
          return tokenName || address;
        } catch (error) {
          return address;
        }
      }
      const ensName = await pro.lookupAddress(address);
      return ensName || address;
    } catch (error) {
      console.log(error);
      return address;
    }
  };

  const fetchSubscriptions = async () => {
    const lenderAddress = userAddress;
    let streamContractAddress = ChainId === 1 ? '0x90076e40a74f33cc2c673ecbf2fba4068af77892' : '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
    let contract = new ethers.Contract(streamContractAddress, streamContractABI, provider);
    const allowances = await contract.viewLenderAllowances(userAddress);
    const subscriptionsData = await Promise.all(
      allowances.map(async (allowance) => {
        console.log(allowance);

        const details = await contract.streamDetails(allowance);
        console.log(details.token);
        const tokenContract = new ethers.Contract(details.token, [
          { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], payable: false, stateMutability: 'view', type: 'function' },
        ], provider);
        let dec;
        try {
          dec = await tokenContract.decimals();
        } catch (error) {
          dec = 18;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsedTime = BigInt(currentTime) - details.timestamp;

        let allowableAmount = (details.allowable * elapsedTime) / details.window;
        if (details.once) {
          allowableAmount = (details.allowable * elapsedTime) / details.window;
          if (allowableAmount > details.outstanding) {
            allowableAmount = details.outstanding;
          }
        }
        allowableAmount = Number(allowableAmount) / 10 ** Number(dec);
        return {
          friend: details.friend,
          token: details.token,
          allowable: ethers.formatUnits(details.allowable, dec),
          window: !details.once ? `Pay every ${Math.floor(Number(details.window) / 86400)}d:${Math.floor((Number(details.window) % 86400) / 3600)}h:${Math.floor((Number(details.window) % 3600) / 60)}m:${Number(details.window) % 60}s`
            : `Sub until ${new Date(Number(details.timestamp) * 1000 + Number(details.window) * 1000).toLocaleString()}`,
          timestamp: new Date(Number(details.timestamp) * 1000).toLocaleString(),
          totalStreamed: ethers.formatUnits(details.totalStreamed, dec),
          outstanding: Number(allowableAmount),
          once: details.once ? 'One-time' : 'Recurring',
        };
      })
    );

    setSubscriptions(subscriptionsData);

    const allows = await contract.viewFriendAllowances(lenderAddress);

    const subsData = await Promise.all(
      allows.map(async (allowance) => {
        const details = await contract.streamDetails(allowance);
        const tokenContract = new ethers.Contract(details.token, [
          { constant: true, inputs: [], name: 'decimals', outputs: [{ name: '', type: 'uint8' }], payable: false, stateMutability: 'view', type: 'function' },
        ], provider);
        let dec;
        try {
          dec = await tokenContract.decimals();
        } catch (error) {
          dec = 18;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsedTime = BigInt(currentTime) - details.timestamp;
        let allowableAmount = (details.allowable * elapsedTime) / details.window;
        if (details.once) {
          allowableAmount = (details.allowable * elapsedTime) / details.window;
          if (allowableAmount > details.outstanding) {
            allowableAmount = details.outstanding;
          }
        }
        allowableAmount = Number(allowableAmount) / 10 ** Number(dec);
        return {
          friend: details.friend,
          lender: details.lender,
          token: details.token,
          allowable: ethers.formatUnits(details.allowable, dec),
          window: !details.once ? `Pay every ${Math.floor(Number(details.window) / 86400)}d:${Math.floor((Number(details.window) % 86400) / 3600)}h:${Math.floor((Number(details.window) % 3600) / 60)}m:${Number(details.window) % 60}s`
            : `Sub until ${new Date(Number(details.timestamp) * 1000 + Number(details.window) * 1000).toLocaleString()}`,
          timestamp: new Date(Number(details.timestamp) * 1000).toLocaleString(),
          totalStreamed: ethers.formatUnits(details.totalStreamed, dec),
          outstanding: Number(allowableAmount),
          once: details.once ? 'One-time' : 'Recurring',
        };
      })
    );

    setSubs(subsData);
  };

  const handleCancelSubscription = async (token, friend) => {
    try {

      if (capabilities) {
        console.log('Paymaster:', capabilities.paymasterService);
        writeContracts({
          contracts: [{
            address: streamContractAddress,
            abi: streamContractABI,
            functionName: 'allowStream',
            args: [token, friend, 0, 0, false],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
      }else {
        let streamContract = new ethers.Contract(streamContractAddress, streamContractABI, signer);
        const tx = await streamContract.allowStream(token, friend, 0, 0, false);
        await tx.wait();
      }

      fetchSubscriptions();
      toast.success('Subscription canceled successfully');
    } catch (error) {
      console.error('Error canceling subscription:', error);
    }
  };

  const handleClaimSubscription = async (token, friend) => {
    try {

      if (capabilities) {
        console.log('Paymaster:', capabilities.paymasterService);
        writeContracts({
          contracts: [{
            address: streamContractAddress,
            abi: streamContractABI,
            functionName: 'stream',
            args: [token, friend, userAddress],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
      }else {

        let streamContract = new ethers.Contract(streamContractAddress, streamContractABI, signer);
        const tx = await streamContract.stream(token, friend, userAddress);
        await tx.wait();
      }

      fetchSubscriptions();
      toast.success('Subscription claim successful');
    } catch (error) {
      console.error('Error canceling subscription:', error);
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
  };

  function BlueCreateWalletButton() {
    const { connectors, connect, data } = useConnect();

    const createWallet = useCallback(() => {
      const coinbaseWalletConnector = connectors.find(
          (connector) => connector.id === 'coinbaseWalletSDK'
      );
      if (coinbaseWalletConnector) {
        connect({ connector: coinbaseWalletConnector });
      }
    }, [connectors, connect]);
    return (
        <button className="py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out" onClick={createWallet}>
          Create Wallet
        </button>)}

  return (
    <body>
      <div className='container'>
        <Toaster />
        {!showSubscribeForm && (
          <div>
            <form onSubmit={handleCreateSubscription}>
              <h1>Create Subscription</h1>
              <div className="emoji">🍕🎉</div>
              <div className="card">
                <div className="form-group">
                  <label htmlFor="tokenAddress">Token Address:</label>
                  <select
                    id="tokenAddress"
                    onChange={(e) => setselectedToken(e.target.value)}
                  >
                    <option value="">{ }Select a token</option>
                    {tokenOptions[ChainId]?.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                    <option value="custom">Custom Token</option>
                  </select>
                  {selectedToken === 'custom' && (
                    <input
                      type="text"
                      id="customTokenAddress"
                      onChange={(e) => { setselectedToken(e.target.value); toast.success('Custom token set') }}
                      placeholder="Enter custom token address"
                    />
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="subscriber">Subscribe To Address:</label>
                  <input type="text" id="subscriber" placeholder="Enter subscribe address (blank for own address) " />
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
                      <option value="10">holesky</option>
                      <option value="10">Optimism</option>
                      <option value="8453">Base</option>
                      <option value="gnosis">Gnosis</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="btn">Create</button>
              </div>
            </form>
            {subscriptionLink && (
              <div className="card">
                <p>Subscription Link:</p>
                <a href={subscriptionLink} id="subLink">
                  <p id="subscriptionLink" style={{ wordBreak: 'break-all' }}>{subscriptionLink}</p>
                </a>
              </div>
            )}
          </div>
        )}

        {showSubscribeForm && (
          <div>
            <h1>Subscribe🍕😋</h1>
            <div className="card">
              <h2>Subscription Details</h2>
              <div className="details-container">
                <div className="detail-item">
                  <div className="detail-label">Subscribe To:</div>
                  <div className="detail-value">{subscriptionDetails.friend}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">My Address:</div>
                  <div className="detail-value">{subscriptionDetails.lender}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Token:</div>
                  <div className="detail-value" >{subscriptionDetails.token}</div>
                </div>
                {subscriptionDetails.totalStreamed != '' && (
                  <>
                    <div className="detail-item">
                      <div className={`detail-label ${subscriptionDetails.totalStreamed === '0' ? 'hidden' : ''}`}>Total Streamed:</div>
                      <div className={`detail-value ${subscriptionDetails.totalStreamed === '0' ? 'hidden' : ''}`}>{subscriptionDetails.totalStreamed}</div>
                    </div>
                    <div className="detail-item">
                      <div className={`detail-label ${subscriptionDetails.outstanding === '0' ? 'hidden' : ''}`}>Available:</div>
                      <div className={`detail-value ${subscriptionDetails.outstanding === '0' ? 'hidden' : ''}`}>{subscriptionDetails.outstanding}</div>
                    </div>
                  </>
                )}
                <div className="detail-item">
                  <div className="detail-label">Amount:</div>
                  <div className="detail-value">{subscriptionDetails.allowable}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Window:</div>
                  <div className="detail-value"><span>{subscriptionDetails.window}</span></div>
                </div>
                <div className="detail-item">
                  <div className={`detail-label ${!subscriptionDetails.timestamp ? 'hidden' : ''}`}>Timestamp:</div>
                  <div className={`detail-value ${!subscriptionDetails.timestamp ? 'hidden' : ''}`} id="timestamp1">{subscriptionDetails.timestamp}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Once:</div>
                  <div className="detail-value" id="once1">{subscriptionDetails.once}</div>
                </div>
              </div>
            </div>
            {(showSubscribeForm && subscriptionDetails.outstanding == 0) && (
              <div className="card">
                <button onClick={handleSubscribe} className="btn">Subscribe</button>
              </div>
            )}
            {showSubscribedMessage && (
              <div className="card">
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
            )}
          </div>
        )}
        <ConnectButton />
        {!userAddress &&
            <BlueCreateWalletButton/>}
      </div>
      <br />
      <div className="container" id="subscriptionsContainer" style={{ marginTop: '0px' }}>
        <h1>My Subscriptions</h1>
        <button onClick={fetchSubscriptions} className="btn cbtn">Check Subscriptions</button>
        <div id="subscriptionsList">
          {subscriptions.map((subscription, index) => (
            <div key={index} className="subscription-item">
              <div>
                🍕 <span className="subscription-label">Subscription to:</span>
                <br />
                <span className="subscription-value">{subscription.friend}</span>
              </div>
              <div>
                💰 <span className="subscription-label">Token:</span>
                <br />
                <span className="subscription-value">{tokenOptions[ChainId]?.find((token) => token.address.toLowerCase() === subscription.token.toString().toLowerCase())?.symbol || subscription.token}</span>
              </div>
              <div>
                🎉 <span className="subscription-label">Amount:</span>
                <br />
                <span className="subscription-value">{subscription.allowable}</span>
              </div>
              <div>
                ⏰ <span className="subscription-label">Window:</span>
                <br />
                <span className="subscription-value">{subscription.window}</span>
              </div>
              <div className="subscription-details">
                <div>
                  💸 <span className="subscription-label">Total Streamed:</span>
                  <br />
                  <span className="subscription-value">{subscription.totalStreamed}</span>
                </div>
                <div>
                  📈 <span className="subscription-label">Outstanding:</span>
                  <br />
                  <span className="subscription-value">{subscription.outstanding}</span>
                </div>
                <div>
                  📅 <span className="subscription-label">Timestamp:</span>
                  <br />
                  <span className="subscription-value">{subscription.timestamp}</span>
                </div>
                <div>
                  🔄 <span className="subscription-label">Type:</span>
                  <br />
                  <span className="subscription-value">{subscription.once}</span>
                </div>
                <button className="btn" onClick={() => handleCancelSubscription(subscription.token, subscription.friend)}>Cancel Subscription</button>
              </div>
            </div>
          ))}
        </div>
        <div id="subsList">
          {subs.length > 0 && (
            <>
              <h1 style={{ marginBottom: '16px' }}>Subscribed To Me </h1>
              <p className="subscription-value" style={{ position: 'relative', bottom: '1px', backgroundColor: '#ff5722', color: '#fff', width: '120px', margin: 'auto', marginBottom: '20px' }}>{subs.length} Subs</p>
            </>
          )}
          {subs.map((subscription, index) => (
            <div key={index} className="subscription-item">
              <div>
                🍕 <span className="subscription-label">Subscription:</span>
                <br />
                <span className="subscription-value">{subscription.lender}</span>
              </div>
              <div>
                💰 <span className="subscription-label">Token:</span>
                <br />
                <span className="subscription-value">{tokenOptions[ChainId]?.find((token) => token.address.toLowerCase() === subscription.token.toString().toLowerCase())?.symbol || subscription.token}</span>
              </div>
              <div>
                🎉 <span className="subscription-label">Amount:</span>
                <br />
                <span className="subscription-value">{subscription.allowable}</span>
              </div>
              <div>
                ⏰ <span className="subscription-label">Window:</span>
                <br />
                <span className="subscription-value">{subscription.window}</span>
              </div>
              <div className="subscription-details">
                <div>
                  💸 <span className="subscription-label">Total Streamed:</span>
                  <br />
                  <span className="subscription-value">{subscription.totalStreamed}</span>
                </div>
                <div>
                  📈 <span className="subscription-label">Available:</span>
                  <br />
                  <span className="subscription-value">{subscription.outstanding}</span>
                </div>
                <div>
                  📅 <span className="subscription-label">Timestamp:</span>
                  <br />
                  <span className="subscription-value">{subscription.timestamp}</span>
                </div>
                <div>
                  🔄 <span className="subscription-label">Type:</span>
                  <br />
                  <span className="subscription-value">{subscription.once}</span>
                </div>
                <button className="btn" onClick={() => handleClaimSubscription(subscription.token, subscription.lender)}>Claim Subscription</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </body>
  );
};

export default App;
