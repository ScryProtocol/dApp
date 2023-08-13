import './App.css';
// @ts-nocheck
import React from 'react';
import 'tailwindcss/tailwind.css'
import '@rainbow-me/rainbowkit/styles.css'
import { useEffect, useState } from "react";
import Button from '@mui/material/Button'
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Modal from '@mui/material/Modal'
import Snackbar from '@mui/material/Snackbar'
import Card from '@mui/material/Card'
import Dialog from '@mui/material/Dialog'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Checkbox from '@mui/material/Checkbox'
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider, darkTheme
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, WagmiConfig } from 'wagmi';
import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  sepolia
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from "ethers";
import { BrowserProvider, parseUnits, parseEther, JsonRpcProvider } from "ethers";

const { chains, publicClient } = configureChains(
  [sepolia, optimism],//mainnet, polygon, optimism, arbitrum, sepolia],
  [
    alchemyProvider({ apiKey: process.env.ALCHEMY_ID }),
    publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: '6970767696eab42de8f4a532ef57bb52',
  chains
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
})
let provider = new ethers.BrowserProvider(window.ethereum);
let signer = provider.getSigner(); let addrs = "0x744fb68963291fdba4513fe4a8d3f1866480f28b";
function App() {
  const [filter, setFilter] = React.useState('All');
  const [amount, setAmount] = useState(1);
  const [name, setname] = useState();
  const [sym, setsym] = useState();
  const [balance, setBalance] = useState(null);
  const [sup, setSup] = useState(null);
  const [delta, setDelta] = useState(null);
  const [price, setprice] = useState(null);
  const [expiry, setexpiry] = useState(null);
  const [dec, setdec] = useState(null);
  const [profit, setprofit] = useState(null);
  const [strike, setstrike] = useState(null);

  const [collateral, setCollateral] = useState(null);
  const [account, setAccount] = useState(null); const [openModal, setOpenModal] = useState(false);
  function openOptionModal() {
    setOpenModal(true);
  }

  function closeOptionModal() {
    setOpenModal(false);
  }
  const handleChange = (event) => {
    setAmount(event.target.value);
  }; const handleaddrs = (event) => {
    addrs = (event.target.value);
  }; //let addrs = "0x4b28A73d1FBf118374741090FC747A84DCF5806F";
  const ABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "profit", "type": "uint256" }], "name": "Delta", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" }, { "indexed": false, "internalType": "address[]", "name": "morpheus", "type": "address[]" }, { "indexed": false, "internalType": "address", "name": "collateralToken", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "strikePrice", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "APIendpoint", "type": "string" }, { "indexed": false, "internalType": "string", "name": "APIendpointPath", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "dec", "type": "uint256" }, { "indexed": false, "internalType": "uint256[]", "name": "bounties", "type": "uint256[]" }], "name": "Initialized", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }], "name": "Minted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "PriceUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "optionamount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "collateral", "type": "uint256" }], "name": "Redeemed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "from", "type": "address" }], "name": "Unlocked", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "IDs", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "collateral", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "collateralToken", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "currentPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "expiry", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getDelta", "outputs": [{ "internalType": "uint256", "name": "profit", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "name_", "type": "string" }, { "internalType": "string", "name": "symbol_", "type": "string" }, { "internalType": "address[]", "name": "_morpheus", "type": "address[]" }, { "internalType": "address", "name": "_collateralToken", "type": "address" }, { "internalType": "uint256", "name": "_expiry", "type": "uint256" }, { "internalType": "uint256", "name": "_strikePrice", "type": "uint256" }, { "internalType": "string", "name": "APIendpoint", "type": "string" }, { "internalType": "string", "name": "APIendpointPath", "type": "string" }, { "internalType": "uint256", "name": "dec", "type": "uint256" }, { "internalType": "uint256[]", "name": "bounties", "type": "uint256[]" }], "name": "init", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "mint", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "morpheus", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "priceDec", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "redeem", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "strikePrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "timestamp", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "unlock", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "bounties", "type": "uint256[]" }], "name": "updateFeeds", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "updatePrice", "outputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }], "stateMutability": "nonpayable", "type": "function" }]; // ABI of your contract  

  let contract = new ethers.Contract(
    addrs,
    ABI,
    provider//signer
  );
  useEffect(() => {
    const fetchBalance = async () => {
      let ad = "0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5"
      console.log(await window.ethereum.request({ method: 'eth_requestAccounts' }))

      if (window.ethereum.isConnected()) {
        console.log('l')
        signer = await provider.getSigner();
        await provider.getSigner();
        contract = new ethers.Contract(
          addrs,
          ABI,
          signer
        );
        ad = signer.getAddress()
        console.log(ad, 'lo')
      } let d = 10n ** (await contract.decimals() - 2n)
      const bal = Number(await contract.balanceOf(ad) / d) / 100;
      setname(await contract.name());
      setsym(await contract.symbol());
      setBalance(bal.toString());
      const sup = Number(await contract.totalSupply() / d) / 100;
      setSup(sup.toString());
      setCollateral((Number(await contract.collateral(ad) / d) / 100).toString());
      let pric = ((Number(await contract.currentPrice())));
      setprice((pric / 10 ** Number(await contract.priceDec())).toString())
      let a = (1000n * await contract.expiry()).toString()
      let date = new Date(Number(a));
      console.log('tt')
      date = date.toLocaleString()
      setexpiry(date);
      setDelta((Number(await contract.getDelta()) / (10 ** Number(await contract.priceDec()))).toString());
      setdec((await contract.decimals()).toString());
      setstrike((Number(await contract.strikePrice()) / (10 ** Number(await contract.priceDec()))).toString());
      console.log('LOL', bal, date.toLocaleString())
    }
    fetchBalance();
  }, []);
  async function Mint() {
    signer = await provider.getSigner();
    contract = new ethers.Contract(
      addrs,
      ABI,
      signer
    );
    let tok = new ethers.Contract(
      (await contract.collateralToken()).toString(),
      ABI,
      signer
    );
    let amt = await tok.allowance(signer.getAddress(), addrs)
    let d = await tok.decimals()
    if (amt < (parseUnits((amount * strike).toString(), d))) {
      console.log('LO')
      let tx = await tok.approve(addrs, (parseUnits((amount * strike).toString(), d)))
      await tx.wait()
    }
    console.log('LOL')
    let am = parseUnits(amount.toString(), d)
    let tx = await contract.mint(signer.getAddress(), am)
    await tx.wait()
    fetchBalance()
  }
  async function handleRedeem() {
    signer = await provider.getSigner();
    contract = new ethers.Contract(
      addrs,
      ABI,
      signer
    );
    let tx = await contract.redeem()
    await tx.wait()
  } async function handleUnlock() {
    signer = await provider.getSigner();
    contract = new ethers.Contract(
      addrs,
      ABI,
      signer
    );
    let d = await contract.decimals()
    console.log('LOL')
    let am = parseUnits(amount.toString(), d)
    let tx = await contract.unlock(am)
    await tx.wait()
    fetchBalance()
  } window.ethereum.on('accountsChanged', function (accounts) {
    fetchBalance()
  })
  window.ethereum.on('chainChanged', function (accounts) {
    fetchBalance()
  })
  async function fetchBalance() {
    signer = await provider.getSigner();
    let ad = (await signer.getAddress())
    contract = new ethers.Contract(
      addrs,
      ABI,
      signer
    );
    console.log(addrs)
    let d = 10n ** (await contract.decimals() - 2n)
    const bal = Number(await contract.balanceOf(ad) / d) / 100;
    setname(await contract.name());
    setsym(await contract.symbol());
    setBalance(bal.toString());
    const sup = Number(await contract.totalSupply() / d) / 100;
    setSup(sup.toString());
    setCollateral((Number(await contract.collateral(ad) / d) / 100).toString());
    let pric = ((Number(await contract.currentPrice()))); //pdec)).toString());
    setprice((pric / 10 ** Number(await contract.priceDec())).toString())
    let a = (1000n * await contract.expiry()).toString()
    let date = new Date(Number(a));
    console.log('tt')
    date = date.toLocaleString()
    setexpiry(date);
    setDelta((Number(await contract.getDelta()) / (10 ** Number(await contract.priceDec()))).toString());
    setdec((await contract.decimals()).toString());
    setstrike((Number(await contract.strikePrice()) / (10 ** Number(await contract.priceDec()))).toString());
    console.log('LOL', bal, date.toLocaleString())
  }
  let UniURL = 'https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=' + addrs
  let LPURL = 'https://app.uniswap.org/#/add/' + addrs
  function data() {
    let t0 = []
    let oracle = []
    oracle[0] = {
      name: 'Scry Team',
      stake: '1000000',
      addrs: '0x0000000000071821e8033345a7be174647be0706',
      href: 'https://sepolia.etherscan.io/address/0x0000000000071821e8033345a7be174647be0706',
      networks: ['ethmainnet', 'sepolia', 'optimism', 'arbitrum', 'base', 'scroll', 'canto', 'arbitrum'],
      networksL: 'Ethereum, Sepolia, Optimism, Arbitrum , Base, Scroll, Canto'
    }
    oracle[1] = {
      name: 'Scry Team',
      stake: '0',
      addrs: '0x927ba066081d016184a7D74Ba231d3Ce13B10D32',
      href: 'https://sepolia.etherscan.io/address/0x927ba066081d016184a7D74Ba231d3Ce13B10D32',
      networks: ['sepolia'],
      networksL: 'Sepolia'

    }

    let oracleS = oracle
    if (filter !== null && filter !== 'All') {
      oracleS = oracle.filter((o) => o.networks.includes(filter));
    }
    oracleS.sort((a, b) => parseInt(b.stake) - parseInt(a.stake));
    for (let n = 0; n < oracleS.length; n++) {
      t0[n] = (<Grid><div style={{ color: '#00ff55', width: 420 }} className="flex flex-col bg-gray-800 space-y-6 justify-center mt-6 md:mt-6  m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
          {oracleS[n].name}
        </h1>
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl font-bold w-3/4">
          Staked: {oracleS[n].stake}
        </h1>
        <div style={{ color: '#77ff8b' }} className="m-auto text-center color-green-500 text-1xl font-bold">
          Address: <br />{oracleS[n].addrs}
        </div>
        <div style={{ color: '#77ff8b' }} className='mx-6'>
          Supported networks: {oracleS[n].networksL}
        </div>
      </div></Grid>
      )
    } return (<Grid container spacing={2} className="bg-gray-900 w-3/4">{t0}</Grid>)
  }
  function OptionModal({ open, onClose }) {
    const [api, setApi] = useState('');
    const [path, setPath] = useState('');
    const [collateralT, setcollateralT] = useState('');
    const [newName, setNewName] = useState('');
    const [newSymbol, setNewSymbol] = useState('');
    const [strike, setStrike] = useState('');
    const [date, setDate] = useState(new Date());
    const [oracle, setOracle] = useState('');
    const [sampleData, setSampleData] = useState('');
    const [decimals, setDecimals] = useState(0);
    const handleCreateDelta = async () => {
      // Check if MetaMask is installed
     try{ if (typeof window.ethereum !== 'undefined') {
        let fABI = [{ "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "deltaaddrs", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "ID", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" }, { "indexed": false, "internalType": "address[]", "name": "morpheus", "type": "address[]" }, { "indexed": false, "internalType": "address", "name": "collateralToken", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "strikePrice", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "APIendpoint", "type": "string" }, { "indexed": false, "internalType": "string", "name": "APIendpointPath", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "dec", "type": "uint256" }], "name": "deltaDeployed", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "DeltaInfo", "outputs": [{ "internalType": "address", "name": "collateralToken", "type": "address" }, { "internalType": "uint256", "name": "expiry", "type": "uint256" }, { "internalType": "uint256", "name": "strikePrice", "type": "uint256" }, { "internalType": "string", "name": "APIendpoint", "type": "string" }, { "internalType": "string", "name": "APIendpointPath", "type": "string" }, { "internalType": "uint256", "name": "dec", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "string", "name": "_symbol", "type": "string" }, { "internalType": "address[]", "name": "_morpheus", "type": "address[]" }, { "internalType": "address", "name": "_collateralToken", "type": "address" }, { "internalType": "uint256", "name": "_expiry", "type": "uint256" }, { "internalType": "uint256", "name": "_strikePrice", "type": "uint256" }, { "internalType": "string", "name": "APIendpoint", "type": "string" }, { "internalType": "string", "name": "APIendpointPath", "type": "string" }, { "internalType": "uint256", "name": "dec", "type": "uint256" }], "name": "createDelta", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "deployedDeltas", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getDeployedDeltas", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "total", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]
        const deltaFactory = new ethers.Contract('0xD1Dc98541126fa36Dc0F63209125194aF27E5Ba9', fABI, signer);

        // Convert date string to UNIX timestamp
        const expiryTimestamp = Math.floor(new Date(date).getTime() - Date.now() / 1000 / 3600);

        // Call the createDelta function
        const tx = await deltaFactory.createDelta(
          newName,
          newSymbol,
          [oracle], // Morpheus array - fill as needed
          collateralT,
          expiryTimestamp,
          strike, // Assuming strike is in Ether
          api,
          path,
          decimals, { value: '1000000000000000' } // Bounties array - fill as needed
        );

        // Wait for the transaction to be mined
        await tx.wait();
        deltaFactory.on('deltaDeployed', (adrs, a1, a2, a3, a4, a5, a6, a7, a8, a9, a0) => {
          console.log(adrs)
          alert('Delta created successfully at ', adrs.toString()); addrs = adrs.toString()
        })
        closeOptionModal()
      }}catch { console.log()}
    };
    const handleLookup = async () => {
      // try {

      let res = await fetch(api);
      let body = await res.json();
      console.log(body)
      let j;
      let toParse = body;
      let parsingargs = path.split(',')
      for (j = 0; j < parsingargs.length; j++) {
        toParse = toParse[parsingargs[j]]
      }

      setSampleData(toParse)
    };

    return (
      <Modal open={open} onClose={onClose}>
        <div style={{ color: '#00ff55' }} className="bg-gray-900 h-full min-h-screen">
          <div style={{
            color: '#00ff55', position: 'relative',
            top: '25px',
          }} className="flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">

            <div className="flex justify-center">
              <h1 className="text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
                Create your own option
              </h1>
            </div>

            <div className="flex justify-center">
              <TextField
                id="outlined"
                label="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                color='success' style={{ color: 'green', top: '1px' }} className="text-center text-white bg-green-500 w-1/2" focused
              />
            </div>

            <div className="flex justify-center">
              <TextField
                id="outlined"
                label="Symbol"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                color='success' style={{ color: 'green', top: '1px' }} className="text-center text-white bg-green-500 w-1/2" focused
              />
            </div>

            <div className="flex justify-center">
              <TextField
                id="outlined"
                label="API"
                value={api}
                onChange={(e) => setApi(e.target.value)}
                color='success' style={{ color: 'green', top: '1px' }} className="text-center text-white bg-green-500 w-1/2" focused
              />
            </div>

            <div className="flex justify-center">
              <TextField
                id="outlined"
                label="Path"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                color='success' style={{ color: 'green', top: '1px' }} className="text-center text-white bg-green-500 w-1/2" focused
              />
            </div>

            <div className="flex justify-center">
              <TextField
                id="outlined"
                label="Strike"
                value={strike}
                onChange={(e) => setStrike(e.target.value)}
                color='success' style={{ color: 'green', top: '1px' }} className="text-center text-white bg-green-500 w-1/2" focused
              />
            </div>

            <div className="flex justify-center">
              <TextField
                id="outlined"
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                color='success' style={{ color: 'green', top: '1px' }} className="text-center text-white bg-green-500 w-1/2" focused
              />
            </div>

            <div className="flex justify-center">
              <FormControl className="w-1/2">
                <InputLabel style={{ color: 'green' }}>Oracle</InputLabel>
                <Select
                  value={oracle}
                  onChange={(e) => setOracle(e.target.value)}
                  style={{ color: 'green', backgroundColor: '#00ff55' }}
                >
                  {/* Add your oracle options here */}
                  <MenuItem value="0x0000000000071821e8033345a7be174647be0706">Scry</MenuItem>
                  <MenuItem value="oracle2">Oracle 2</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="flex justify-center">
              <FormControl className="w-1/2">
                <InputLabel style={{ color: 'green' }}>Collateral Type</InputLabel>
                <Select
                  value={collateralT}
                  onChange={(e) => setcollateralT(e.target.value)}
                  style={{ color: 'green', backgroundColor: '#00ff55' }}
                >
                  {/* Add your collateral options here */}
                  <MenuItem value="0x53844F9577C2334e541Aec7Df7174ECe5dF1fCf0">Collateral 1</MenuItem>
                  <MenuItem value="collateral2">Collateral 2</MenuItem>
                </Select>
              </FormControl>
            </div>
            <div className="flex justify-center">
              <FormControl className="w-1/2">
                <InputLabel style={{ color: 'dark-green' }}>Decimals</InputLabel>
                <TextField
                  id="outlined"
                  defaultValue='2'
                  label="Decimals"
                  onChange={(e) => setDecimals(e.target.value)}
                  color='success' style={{ color: 'dark-green', top: '1px' }} className="text-center text-white bg-green-500 w-full" focused
                />
              </FormControl>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleCreateDelta}>Deploy</Button>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleLookup}>Lookup API</Button>
            </div>
            <div className="flex justify-center">
              <Button onClick={closeOptionModal}>close</Button>
            </div>
            <div className="flex justify-center w-1/2 m-auto">
              {sampleData}
            </div>

          </div>
        </div>
      </Modal>

    );
  }

  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains} theme={darkTheme({
        accentColor: '#00ff55',
        showBalance: true,
        accentColorForeground: 'white',
        borderRadius: 'small',
        fontStack: 'system',
        overlayBlur: 'small',
      })}>
        <div style={{ color: '#00ff55' }} className="bg-gray-900 h-full w-full min-h-screen" >
          <div style={{
            color: '#00ff55', position: 'relative',
            top: '25px',
          }} className=" flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
            <ConnectButton showBalance={true} accountStatus={{
              smallScreen: 'full',
              largeScreen: 'full',
            }} chainStatus="icon"
            /><h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
              Hedge
            </h1>
            <h1 style={{
              color: 'orange', position: 'relative',
              top: '25px',
            }} className="m-auto text-center md:mt-8 color-red-500 text-2xl md:text-3xl font-extrabold w-3/4">
              ALPHA - YOU MAY LOSE ALL YOUR MONEY.
            </h1><h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-1xl font-extrabold w-3/4">
              <div>{name}</div>
              <div> {sym}</div>
              <div>Hedges: {balance}</div>
              <div>Collateral: {collateral}</div>
              <div>Price: {price}  ||  Strike: {strike}</div>
              Profit per token: {delta}  || Expiry: {expiry}
              <div>Total Hedges: {sup}</div></h1><div style={{ color: '#77ff8b' }} className='mx-6' >
              Simple protection against your assets value. Hedge any asset, at any price, for any duration. You can put up collateral to sell Hedges, earning a profit if the price at expiry higher than the strike. Holders of the Hedges can redeem them if lower than the strike for the difference in the value. Hedge sellers are able to redeem any remaining collateral after.        </div>
            <Button onClick={openOptionModal}>Create Option</Button>
            <OptionModal open={openModal} onClose={closeOptionModal} /><div className="flex flex-col justify-center m-auto overflow-hidden">
              <TextField
                id="number"
                label=""
                type="number"
                defaultValue='1'
                InputLabelProps={{
                  shrink: true,
                }} onChange={handleChange}
                color='success' style={{ color: 'green' }} className="ml-10 m-auto text-center text-white bg-green-500" focused
              />
            </div><div className="flex flex-col justify-center m-auto overflow-hidden"><Button onClick={() => Mint()} style={{ color: '#77ff8b' }} variant='outlined' className="m-auto text-center color-green-500 border-green-500">Mint</Button>
              <Button onClick={() => handleRedeem()} style={{ color: '#77ff8b' }} variant='outlined' className="m-auto text-center color-green-500 border-green-500">Redeem</Button>
              <Button onClick={() => handleUnlock()} style={{ color: '#77ff8b' }} variant='outlined' className="m-auto text-center color-green-500 border-green-500">Unlock Collateral</Button></div><div className="justify-center m-auto overflow-hidden"> <Button onClick={() => window.location.assign(UniURL)} style={{ color: 'pink' }} variant='outlined' className="m-auto text-center color-pink-500 border-pink-500">Uniswap</Button>
              <Button onClick={() => window.location.assign(LPURL)} style={{ color: '#77ff8b' }} variant='outlined' className="m-auto text-center color-pink-500 border-pink-500">LP</Button>
            </div>
          </div> <div style={{
            color: '#00ff55', position: 'relative',
            top: '40px', height: '150px'
          }} className="space-y-6 justify-center m-auto max-w-xl min-w-80 overflow-hidden">
            <div className="top-20 flex flex-col justify-center m-auto overflow-hidden">
              <TextField
                id="outlined"
                label=""
                defaultValue='0x744fb68963291fdba4513fe4a8d3f1866480f28b'
                InputLabelProps={{
                  shrink: true,
                }} onChange={handleaddrs}
                color='success' style={{ color: 'green', top: '1px' }} className="ml-10 m-auto text-center text-white bg-green-500" focused
              />
              <Button onClick={() => fetchBalance()} style={{ color: '#77ff8b', }} variant='outlined' className=" m-auto text-center color-green-500 border-green-500">Fetch Hedge Contract</Button>
            </div></div>.</div></RainbowKitProvider>
    </WagmiConfig>
  )
}

export default App;
