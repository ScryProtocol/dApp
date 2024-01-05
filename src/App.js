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
import zIndex from '@mui/material/styles/zIndex';
import toast, { Toaster } from 'react-hot-toast';

const { chains, publicClient } = configureChains(
  [mainnet],//mainnet, polygon, optimism, arbitrum, sepolia],
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
let signer = provider.getSigner(); let addrs = "0x000000000000c43f60e8a823c346fb8a162ce97d";
let addrsS = "0x0000000000071821e8033345a7be174647be0706";
let addrst = "0x000000000000a8c36fc75a2cbff5b9417c521264";

const ABI = [{ "inputs": [{ "internalType": "contract IERC20", "name": "_token", "type": "address" }, { "internalType": "address", "name": "_slasher", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oracle", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Slashed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oracle", "type": "address" }, { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Staked", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "oracle", "type": "address" }, { "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Unstaked", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "string", "name": "", "type": "string" }], "name": "data", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "oracle", "type": "address" }], "name": "getstake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "key", "type": "string" }, { "internalType": "string", "name": "value", "type": "string" }], "name": "setKeyValue", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "slash", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "oracle", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "slashOracle", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "slasher", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "oracle", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stakeTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "stakeWithdraw", "outputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "unlockTime", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "token", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSlashed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "totalStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "oracle", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "unstakeTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newSlasher", "type": "address" }], "name": "updateSlasher", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "userStake", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "receiver", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdrawSlashedTokens", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "oracle", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdrawStake", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
const fABI = [{ "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }, { "internalType": "address", "name": "_rewardsDistribution", "type": "address" }, { "internalType": "address", "name": "_stakingToken", "type": "address" }, { "internalType": "address", "name": "rToken", "type": "address" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "token", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Recovered", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }], "name": "RewardAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }], "name": "RewardPaid", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newDuration", "type": "uint256" }], "name": "RewardsDurationUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Staked", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Withdrawn", "type": "event" }, { "payable": true, "stateMutability": "payable", "type": "fallback" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "earned", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "exit", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "getReward", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getRewardForDuration", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "isOwner", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "lastTimeRewardApplicable", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "lastUpdateTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "reward", "type": "uint256" }], "name": "notifyRewardAmount", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "own", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "periodFinish", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "tokenAddress", "type": "address" }, { "internalType": "uint256", "name": "tokenAmount", "type": "uint256" }], "name": "recoverERC20", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [], "name": "renounceOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "rewardPerToken", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "rewardPerTokenStored", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "rewardRate", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "rewardToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "rewards", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "rewardsDistribution", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "rewardsDuration", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "_rewardsDistribution", "type": "address" }], "name": "setRewardsDistribution", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "_rewardsDuration", "type": "uint256" }], "name": "setRewardsDuration", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "stake", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "stakingToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "updatePeriodFinish", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "userRewardPerTokenPaid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdraw", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }]

let contract = new ethers.Contract(
  addrs,
  ABI,
  provider//signer
);
function App() {
  const [filter, setFilter] = React.useState('All');
  const [stakes, setstakes] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [openModal, setOpenModal] = useState(false)
  const [userstake, setuserstake] = useState('0');  const [tstake, settstake] = useState('0');
  const [usertoken, setusertoken] = useState('0'); 
  const [oraclestake, setoraclestake] = useState('0');
  const [useroracle, setuseroracle] = useState('0');
  const [userreward, setuserreward] = useState('0');
  const [userrewardstaked, setuserrewardstaked] = useState('0');
  const [amount, setamount] = useState('');
  const [oraclead, setoraclead] = useState('');
  provider.on("network", (newNetwork, oldNetwork) => {
    // When a Provider makes its initial connection, it emits a "network"
    // event with a null oldNetwork along with the newNetwork. So, if the
    // oldNetwork exists, it represents a changing network
    if (oldNetwork) {
      window.location.reload();
    }
  });
  function openOptionModal() {
    setOpenModal(true);
  }

  function closeOptionModal() {
    setOpenModal(false);
  }
  let oracle = []
  const handleChange = (event) => {
    setFilter(event.target.value);
  };
  async function getStake() {
    let oracleS = oracle
    let s = []
    if (filter != null && filter != 'All') {
      oracleS = oracle.filter((o) => o.networks.includes(filter));
    }
    for (let n = 0; n < oracleS.length; n++) {
      s[oracleS[n].addrs] = ((await contract.getstake(oracleS[n].addrs) / 10n ** 18n).toString());
      //alert(s[n])
    }

    setstakes(s)
    signer = await provider.getSigner();
    contract = new ethers.Contract(
      addrs,
      ABI,
      signer
    );
    let tok = new ethers.Contract(
      addrst,
      fABI,
      signer
    );let t = new ethers.Contract(
      addrsS,
      ABI,
      signer
    );console.log()
    settstake((await t.balanceOf(addrs)/10n**18n).toString())
    let ba = (await contract.balanceOf(await signer.getAddress()) / 10n ** 18n ).toString()//+ await tok.balanceOf(await signer.getAddress()) / 10n ** 18n).toString()
    //let aa = (await tok.earned(await signer.getAddress())).toString()
    setuserstake(ba)
   // setuserreward(Number(aa / 10 ** 18))
    setusertoken((await t.balanceOf(await signer.getAddress())/10n**18n).toString())
  }
  useEffect(() => {

    getStake();
  }, [])
  function data() {
    let t0 = []
    oracle = []
    oracle[0] = {
      name: 'Scry Team',
      stake: 'Scry',
      addrs: '0x0000000000071821e8033345a7be174647be0706',
      href: 'https://sepolia.etherscan.io/address/0x0000000000071821e8033345a7be174647be0706',
      networks: ['ethmainnet', 'sepolia', 'optimism', 'arbitrum', 'base', 'scroll', 'canto', 'arbitrum'],
      networksL: 'Ethereum, Sepolia, Optimism, Arbitrum , Base, Scroll, Canto'
    }
    oracle[5] = {
      name: 'Scry Team',
      stake: '0',
      addrs: '0x927ba066081d016184a7D74Ba231d3Ce13B10D32',
      href: 'https://sepolia.etherscan.io/address/0x927ba066081d016184a7D74Ba231d3Ce13B10D32',
      networks: ['sepolia'],
      networksL: 'Sepolia'

    }
    oracle[2] = {
      name: 'CryptoDevs @Post',
      stake: 'Partner',
      addrs: '0x38887b21213BC057CaBE94b23cC394B2E79C218D',
      href: 'https://optimistic.etherscan.io/address/0x38887b21213BC057CaBE94b23cC394B2E79C218D',
      networks: ['optimism'],
      networksL: 'Optimism'

    }
    oracle[3] = {
      name: 'CryptoDevs @treyzania',
      stake: 'Partner',
      addrs: '0xc69d240e7bd109d4b8a485dfda0b6481738f18c9',
      href: 'https://optimistic.etherscan.io/address/0xc69d240e7bd109d4b8a485dfda0b6481738f18c9',
      networks: ['optimism'],
      networksL: 'Optimism'

    }
    oracle[4] = {
      name: '0xchibi',
      stake: 'Partner',
      addrs: '0xf97e7651e76ca3da6839d6f414ea0fc675f8d295',
      href: 'https://optimistic.etherscan.io/address/0xF478b60A72AB5D3a076cC222428FBfCa1A0163dd',
      networks: ['optimism'],
      networksL: 'Optimism'

    }
      oracle[6] = {
      name: 'iMalFect',
      stake: 'Independant',
      addrs: '0xcBb10d79a3282f2d31800cE553b80d0d76959178',
      href: 'https://Sepolia.etherscan.io/address/0xcBb10d79a3282f2d31800cE553b80d0d76959178',
      networks: ['sepolia'],
      networksL: 'Sepolia'

    }
 oracle[1] = {
      name: 'Velodrome',
      stake: 'Partner',
      addrs: '0x805Eaa904889A5c3754E1A11C1b4a49bCDDd828A',
      href: 'https://optimistic.etherscan.io/address/0x805Eaa904889A5c3754E1A11C1b4a49bCDDd828A',
      networks: ['optimism'],
      networksL: 'Optimism'

    }
    let oracleS = oracle
    if (filter != null && filter != 'All') {
      oracleS = oracle.filter((o) => o.networks.includes(filter));
    }
    oracleS.sort((a, b) => parseInt(b.stake) - parseInt(a.stake));
    for (let n = 0; n < oracleS.length; n++) {
      t0[n] = (<Grid><div style={{ color: '#00ff55', width: 420 }} className="flex flex-col bg-gray-800 space-y-6 justify-center mt-6 md:mt-6  m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
          {oracleS[n].name}
        </h1>
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl font-bold w-3/4">
          Staked: {stakes[oracleS[n].addrs]}
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
    const [amount, setamount] = useState('');
    const [oraclead, setoraclead] = useState('');
    async function getS() {
      signer = await provider.getSigner();
      contract = new ethers.Contract(
        addrs,
        ABI,
        signer
      );
      let tok = new ethers.Contract(
        addrst,
        fABI,
        signer
      );
      let ba
      let ts
      [ba, ts] = (await contract.stakeWithdraw(oraclead, await signer.getAddress()))
      let ls = (await contract.userStake(oraclead, await signer.getAddress()))
      setoraclestake(Number(ls) / 10 ** 18)
      //ts = (await contract.earned(await signer.getAddress())).toString()
      setuseroracle(Number(ba) / 10 ** 18)
      const date = new Date(Number(ts * 1000n));
      setuserrewardstaked(date.toLocaleString())
      console.log(date, ts)
    }
    async function unstake() {
      signer = await provider.getSigner();
      console.log(10,await signer.getAddress())
      let t = new ethers.Contract(
        addrst,
        fABI,
        signer
      );

      let am = parseUnits(amount.toString(), 18)
      console.log(10)
     // if (await t.balanceOf(await signer.getAddress()) > 0) {
     //   let tx = await t.exit()//let tx = await t.unstake(oraclead, am)
     //   await tx.wait()
     // }
      console.log(await contract.stakeWithdraw(oraclead, await signer.getAddress()))

      let ts
      let sw
      [sw, ts] = await contract.stakeWithdraw(oraclead, await signer.getAddress())
      console.log(sw,ts,Date.now())
      if (Number(ts) < (Date.now() / 1000)&&Number(ts)!=0)//
      { console.log(2)
        let am = parseUnits(amount.toString(), 18)
        let tx = await contract.unstakeTokens(oraclead, sw)//let tx = await t.withdrawStake(oraclead, am)
        await tx.wait()
      }
  

      else { console.log(3)
        let tx = await contract.withdrawStake(oraclead, am)//let tx = await t.withdrawStake(oraclead, am)
        await tx.wait()
      }
      getStake()
    }
    async function withdraw() {
      signer = await provider.getSigner();
      let t = new ethers.Contract(
        addrst,//addrst,
        fABI,//fABI,
        signer
      );

      let tx = await t.getReward()
      await tx.wait()
      getStake()
    }
    async function stake() {
      signer = await provider.getSigner();
      contract = new ethers.Contract(
        addrs,
        ABI,
        signer
      );
      let tok = new ethers.Contract(
        addrsS,
        ABI,
        signer
      ); let t = new ethers.Contract(
        addrst,
        fABI,
        signer
      );
      let amt = await tok.allowance(signer.getAddress(), addrs)

      if (amt < (parseUnits((amount).toString(), 18))) {
        console.log('LO')
        toast('Please approve the oracle staking contract')

        let tx = await tok.approve(addrs, (parseUnits((amount).toString(), 18)))
        await tx.wait()
      }
      console.log('LOL')
      let am = parseUnits(amount.toString(), 18)
      toast('Please approve the oracle staking stake transaction')

      let tx = await contract.stakeTokens(oraclead, am)
      await tx.wait()
     // amt = await contract.allowance(signer.getAddress(), addrst)

    //  if (amt < (parseUnits((amount).toString(), 18))) {
    //    console.log('LO')
    //    toast('Please approve the reward staking contract')

     //   let tx = await contract.approve(addrst, (parseUnits((amount).toString(), 18)))
     //   await tx.wait()
     // }
    //  console.log('LOL')
    //  am = parseUnits(amount.toString(), 18)
    //  toast('Please approve the reward stake transaction')

//      tx = await t.stake(am)
  //    await tx.wait()
      getStake()
    }
    return (
      <Modal open={open} onClose={onClose}>
        <div style={{ color: '#00ff55' }} className="bg-gray-900 h-full min-h-screen">
          <div style={{
            color: '#00ff55', position: 'relative',
            top: '25px',
          }} className="flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">

            <div className="flex justify-center">
              <h1 className="text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
                Staking {userstake} SCRY
              </h1>
            </div>
            <div className="flex justify-center">
              <h1 className="text-center md:mt-8 text-color-red-500 text-2xl md:text-3xl font-extrabold w-3/4">
                Earned  {userreward} OP
              </h1>
            </div><div className="flex justify-center">
              <h1 className="text-center text-color-red-500 text-2xl font-extrabold w-3/4">
                Staked for Oracle: {oraclestake}
              </h1>
            </div><div className="flex justify-center">
              <h1 className="text-center color-green-500 text-2xl font-extrabold w-3/4">
               {usertoken} Available
              </h1>
            </div>
            <div className="flex justify-center">
              <h1 className="text-center text-color-red-500 text-2xl  font-extrabold w-3/4">

                Unstaking: {useroracle} Available to withdraw at: {userrewardstaked}
              </h1>
            </div><div className="flex justify-center">
              <TextField
                id="outlined"
                label="Oracle address"
                value={oraclead}
                onChange={(e) => setoraclead(e.target.value)}
                color='success' style={{ color: 'green', top: '1px' }} className="text-center text-white bg-green-500 w-1/2" focused
              />
            </div>

            <div className="flex justify-center">
              <TextField
                id="outlined"
                label="Amount"
                value={amount}
                onChange={(e) => setamount(e.target.value)}
                color='success' style={{ color: 'green', top: '1px' }} className="text-center text-white bg-green-500 w-1/2" focused
              />
            </div><div className="flex justify-center"><Button onClick={() => stake()} style={{ color: '#77ff8b' }} variant='outlined' className="w-1/2 m-auto text-center bottom-4 color-green-500 border-green-500">Stake</Button>
            </div><div className="flex justify-center"><Button onClick={() => unstake()} style={{ color: '#77ff8b' }} variant='outlined' className="w-1/2 m-auto text-center bottom-4 color-green-500 border-green-500">Unstake from Oracle</Button>
            </div>{//<div className="flex justify-center"><Button onClick={() => withdraw()} style={{ color: '#77ff8b' }} variant='outlined' className="w-1/2 m-auto text-center bottom-4 color-green-500 border-green-500">Claim Reward</Button>
            }
            
            {//</div>
            }
            <div className="flex justify-center"><Button onClick={() => getS()} style={{ color: '#77ff8b' }} variant='outlined' className="w-1/2 m-auto text-center bottom-4 color-green-500 border-green-500">Check Oracle Stake</Button>

            </div>
            <div className="flex justify-center">
              <Button onClick={closeOptionModal}>close</Button>
            </div>

          </div>
        </div>
      </Modal>

    );
  }
  return (
    <div style={{ color: '#00ff55' }} className="bg-gray-900 h-full w-full min-h-screen" >
      <WagmiConfig config={wagmiConfig}>
        <RainbowKitProvider chains={chains} theme={darkTheme({
          accentColor: '#00ff55',
          showBalance: true,
          accentColorForeground: 'white',
          borderRadius: 'small',
          fontStack: 'system',
          overlayBlur: 'small',
        })}>
          <ConnectButton showBalance={true} accountStatus={{
            smallScreen: 'full',
            largeScreen: 'full',
          }} chainStatus="icon"
          /><Toaster/> <div style={{ color: '#00ff55' }} className="flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
            <OptionModal open={openModal} onClose={closeOptionModal} /> <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
              Welcome to Morpheus
            </h1> <div style={{ color: '#77ff8b' }} className='mx-6' >
              Morpheus is designed to create a fully decentralized data market, allowing anyone to host an oracle and anyone to request data for a fee, creating a free and open data market. Oracles can stake $SCRY to create economic incentives to provide honest data to not be slashed. Anyone can run a Scry Morpheus node and help the network and developers access data when they need it.
            </div>
            <div style={{ color: '#00ff55' }} className="flex justify-center">
              <Button onClick={() => window.location.assign('https://docs.scry.finance/docs/morpheus/morpehus')} style={{ color: '#77ff8b' }} variant='outlined' className="right-4 w-1/4 m-auto text-center bottom-4 color-green-500 border-green-500">Morpheus Docs</Button>
              <Button onClick={() => openOptionModal()} style={{ color: '#77ff8b' }} variant='outlined' className=" w-1/4 m-auto text-center bottom-4 color-green-500 border-green-500">Stake</Button>              <Button onClick={() => window.location.assign('https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=0x0000000000071821e8033345a7be174647be0706&chain=mainnet')} style={{ color: '#77ff8b' }} variant='outlined' className=" left-4 w-1/4 m-auto text-center bottom-4 color-green-500 border-green-500">Buy Scry</Button>

            </div></div><div style={{ color: '#00ff55' }} className="flex flex-col justify-center m-auto overflow-hidden">
            <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
              Staked: {tstake}
            </h1> 
            <InputLabel id="filter-label" style={{ color: '#00ff55' }} className="m-auto text-center md:mt-8 color-green-500 text-2xl font-bold w-3/4">Filter Network</InputLabel>
            <Select
              labelId="filter-label"
              id="filter-select"
              value={filter} style={{ color: '#00ff55' }}
              onChange={handleChange} className="bg-gray-800 w-80 text-center flex flex-col justify-center mt-4 md:mt-4 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
              <MenuItem value="All">All</MenuItem><MenuItem value="ethmainnet">Ethereum</MenuItem><MenuItem value="sepolia">Sepolia</MenuItem>
              <MenuItem value="arbitrum">Arbitrum</MenuItem><MenuItem value="canto">Canto</MenuItem><MenuItem value="optimism">Optimism</MenuItem>
              <MenuItem value="base">Base</MenuItem>
              <MenuItem value="scroll">Scroll</MenuItem>
            </Select></div><div style={{ top: 10, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }} className="bg-gray-900">{data()}</div>
        </RainbowKitProvider>
      </WagmiConfig> </div>
  )
}

export default App;
