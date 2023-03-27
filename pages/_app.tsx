// @ts-nocheck
import '../styles/globals.css'
import 'tailwindcss/tailwind.css'
import '@rainbow-me/rainbowkit/styles.css'
import { useEffect, useState } from "react";
import Navbar from '../components/navbar'
import type { AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
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
import { sepolia } from '@wagmi/core/chains'
import Confetti from 'react-confetti';
import DarkModeToggle from '../components/darkModeToggle';
import Router, { useRouter } from 'next/router'
import { Network, Alchemy } from 'alchemy-sdk';
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig, useContractWrite } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import config from '../config/env-vars'
import { BigNumber, ethers } from 'ethers'
import { RainbowKitChainProvider } from '@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/RainbowKitChainContext'
import Home from '.';
import Custom from '.';
import AddressPill from '../components/addressPill';
import { ChangeEvent } from 'react';
const { NEXT_PUBLIC_ALCHEMY_ID, NEXT_PUBLIC_INFURA_ID, NEXT_PUBLIC_ETHERSCAN_API_KEY } = config
import net from '../config/network'
import toast, { Toaster } from 'react-hot-toast';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import React from 'react';
const { chainn, rpc, createn, contractn, menun } = net
const alchemyId = NEXT_PUBLIC_ALCHEMY_ID
const etherscanApiKey = NEXT_PUBLIC_ETHERSCAN_API_KEY

const { chains, provider } = configureChains(
  [chain.sepolia],//, chain.arbitrum],//, //chain.optimism, chain.arbitrum, chain.localhost],
  [jsonRpcProvider({
    rpc: (chainn) => ({
      http: rpc,
    })
  })],//,// alchemyProvider({ apiKey: "l7DBx7tLlR-x_X8_3it8Jpr9u9yiqrn8" })],
)
const { connectors } = getDefaultWallets({
  appName: 'the Wall',
  chains,
})
const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

// MetaMask requires requesting permission to connect users accounts

// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...
const signerw = wagmiClient.provider;

// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...

let contractaddrs = contractn;
const Abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "betId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "player", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "playerRoll", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "salt", "type": "string" }], "name": "BetPlaced", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "betId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "playRoll", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "won", "type": "bool" }], "name": "BetSettled", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "inputs": [], "name": "a", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "betAmount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "bets", "outputs": [{ "internalType": "address", "name": "player", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "string", "name": "salt", "type": "string" }, { "internalType": "uint256", "name": "playerRoll", "type": "uint256" }, { "internalType": "uint256", "name": "playRoll", "type": "uint256" }, { "internalType": "bool", "name": "settled", "type": "bool" }, { "internalType": "bool", "name": "won", "type": "bool" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "play", "type": "uint256" }], "name": "defaultRoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "hash", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "maxRoll", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "minRoll", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextBetId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "pay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "lev", "type": "uint256" }, { "internalType": "string", "name": "salt", "type": "string" }], "name": "placeBet", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "roll", "type": "bytes32" }, { "internalType": "string", "name": "salt", "type": "string" }], "name": "randomRoll", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "newBetAmount", "type": "uint256" }], "name": "setBetAmount", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "playRoll", "type": "bytes32" }], "name": "submitRoll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "total", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "withdrawHouse", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
let values
let allowance

let addrs
let bid = []
//const accounts = window.ethereum.request({ method: 'eth_requestAccounts' });
let provider2 = signerw// = new ethers.providers.Web3Provider(window.ethereum);
if (typeof window !== 'undefined') {
  provider2 = new ethers.providers.Web3Provider(window.ethereum);
}

const signer = provider2.getSigner();

const App = ({ Component, pageProps }: AppProps) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [rolld, setRolled] = useState(0);
  const [betAmount, setBetAmount] = useState(0);
  const [leverage, setLeverage] = useState(2);
  const [events, setEvents] = useState([]);
  const [wonAmount, setWon] = useState();
  const [lev, setLev] = useState(50);
  const [showConfetti, setShowConfetti] = useState(false);
  ch()
  try {
    check();
  } catch {
  }
  useEffect(() => {

    const signer = provider2.getSigner();
    try {
      check();
    } catch {
    }
    if (contractaddrs) {
      const chaindiceContract = new ethers.Contract(contractaddrs, Abi, signer);
      setContract(chaindiceContract);

      signer.getAddress().then(address => {
        setAccount(address);
      });
    }
  }, [provider2, contractaddrs]);
  useEffect(() => {
    if (contract) {
      contract.on("BetPlaced", (betId, player, amount, playerRoll, salt) => {
        amount = amount.toString()
        playerRoll = playerRoll.toString()
        console.log(betId, player, amount, playerRoll, salt)
        let won = 0
        let playRoll = 0
        let id = betId + 'a'
        bid[betId] = player
        setEvents(prevEvents => [{ id, betId, player, amount, playerRoll, salt }, ...prevEvents,]);

      });
      contract.on("BetSettled", (betId, playRoll, won) => {
        let amount = 0
        let playerRoll = 0
        playRoll = playRoll.toString()
        let salt = 0
        betId = betId - 1
        let id = betId
        console.log(bid, bid[betId], addrs)
        if (won && bid[betId].toString().toLowerCase() == addrs) {
          setShowConfetti(true);
          setRolled(playRoll.toString())
          setTimeout(() => {
            setShowConfetti(false);
          }, 5000); // Stop confetti animation after 5 seconds
        }if (bid[betId].toString().toLowerCase() == addrs) {
          setRolled(playRoll.toString())
        }

        console.log(bid, bid[betId], betId, addrs)
        setEvents(prevEvents => [{ id, betId, amount, playerRoll, salt, playRoll, won }, ...prevEvents]);
        check();
      });
    }
  }, [contract, account]);
  async function check() {
    if (contract) {
      console.log(2);
      const provider3 = new ethers.providers.Web3Provider(window.ethereum);
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      let pay = await contract.pay(accounts[0]);
      if (accounts[0] != null) {
        addrs = accounts[0]
      }
      console.log(pay)
      setWon(ethers.utils.formatEther(pay.toString()));
    }
  }
  async function ch() {
    try {
      const provider3 = new ethers.providers.Web3Provider(window.ethereum);
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts[0] != null) {
        addrs = accounts[0]
      }
      console.log(addrs)
    } catch {
    }
  }
  const placeBet = async () => {
    if (contract) {
      const provider3 = new ethers.providers.Web3Provider(window.ethereum);
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      let pay = await contract.pay(accounts[0]);
      console.log(pay)
      // setWon(ethers.utils.formatEther(pay.toString()));
      const salt = ethers.utils.id(Date.now().toString());
      await contract.placeBet(leverage, 'salt', { value: ethers.utils.parseEther(betAmount.toString()) });
    }
  };const claim = async () => {
    if (contract) {
      const provider3 = new ethers.providers.Web3Provider(window.ethereum);
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      let pay = await contract.withdraw();
      console.log(pay)}
  };
  return (
    <ThemeProvider attribute="class">
      <div className="bg-white dark:bg-gray-900 dark:text-white" >
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <Navbar />{showConfetti && <Confetti> <Dialog open={showConfetti} style={{
              background: "#00000050", color: '#ffaa0050',
            }}><div style={{
              background: "#00ff0090", color: '#ffffff',
              height: 100, width: 200
            }}><h1 className="m-auto text-center md:mt-8 text-5xl md:text-5xl font-extrabold rotating-hue">

                  <Typography variant="h5" className="m-auto text-center md:mt-8 text-2xl md:text-3xl font-extrabold rotating-hue">You Won</Typography></h1></div></Dialog></Confetti>
            }

            <div className="flex flex-col bg-white dark:bg-gray-800 space-y-6 justify-center mt-6 md:mt-12 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid light:border-gray-200 dark:border-gray-500 overflow-hidden">
              <h1 className="m-auto text-center md:mt-8 text-2xl md:text-3xl font-extrabold rotating-hue w-3/4">
                Welcome to ChainDice
              </h1>
              <h1 className="m-auto text-center md:mt-8 text-1xl md:text-1xl font-bold rotating-hue w-3/4">
                Chaindice uses the latest tech for verifiable VRFs with its own custom Hash RanCh onchain verification which requires that your bet is custom seeded and fully unique, with the roll being only submitted as long as all the bets for all transactions use the same root hash, allowing verifiability and security in realtime by the contract. This guarantees randomness at the contract level, allowing your funds to never be accessible and your rolls to be cryptographically secure and executed fully autonomously onchain.
              </h1><div className="flex-col bg-white dark:bg-gray-800 space-y-6 justify-center mt-6 md:mt-12 px-4 xs:px-0 m-auto w-1/2 min-w-400 shadow-md rounded-md border border-solid light:border-gray-200 dark:border-gray-500 overflow-hidden">
                <Typography variant="h5" className="m-auto text-center text-1xl md:text-1xl font-bold rotating-hue">
                  Winnings</Typography><Typography style={{ color: '#51ffaa' }} variant="h4" className="m-auto text-center md:mt-8 text-1xl md:text-1xl font-bold rotating-hue">
                  {wonAmount} ETH</Typography></div>
                  {
                  rolld != 0 && (
                    <Typography style={{ color: '#51ffaa' }} variant="h4" className="m-auto text-center md:mt-8 text-1xl md:text-1xl font-bold rotating-hue">
                    Rolled {rolld}</Typography>
                  )}
              <Grid item xs={12}>
                <Typography variant="h5" className="m-auto text-center text-2xl md:text-3xl font-extrabold rotating-hue">Place Bet</Typography>
                <div style={{ display: "flex", justifyContent: "center" }}>

                  <Typography variant="h5" className="top-12  m-auto text-center rotating-hue">Bet Amount</Typography>
                  <textarea style={{
                    background: "#00aaff51", color: 'white', margin: "auto",
                    resize: "none", height: 42
                  }} className="btn m-auto rounded-md border border-solid light:border-black dark:border-black light:text-gray-800 dark:text-black top-2"
                    label="Bet Amount"
                    value={betAmount}
                    onChange={e => setBetAmount(e.target.value)}
                  />
                  <Typography variant="h5" className="m-auto text-center  rotating-hue">Leverage</Typography>
                  <select style={{
                    background: "#00aaff51", color: 'white', margin: "auto",
                    resize: "none", height: 42
                  }} className="btn m-auto rounded-md border border-solid light:border-black dark:border-black light:text-gray-800 dark:text-black top-2" label="Leverage"
                    value={leverage}
                    onChange={e => {
                      setLeverage(e.target.value);
                      setLev(100 / e.target.value);
                    }}>
                    <option value="2">2x</option>
                    <option value="5">5x</option>
                    <option value="10">10x</option>
                    <option value="20">20x</option>
                    <option value="50">50x</option></select></div>
              </Grid>
              <Typography variant="h5" className="m-auto text-center md:mt-8 text-xl md:text-xl font-bold rotating-hue">

                Roll under {lev
                } / 100 to win {betAmount * leverage
                } ETH</Typography>
              <Button style={{ background: "#519aff", color: 'white', margin: "auto" }} className="btn m-auto rounded-md border border-solid light:border-black dark:border-black light:text-gray-800 dark:text-black top-2" type="button" onClick={() => {
                placeBet();
              }}>Bet
              </Button><Button style={{ background: "#519aff", color: 'white', margin: "auto" }} className="btn m-aut top-2 rounded-md border border-solid light:border-black dark:border-black light:text-gray-800 dark:text-black top-2" type="button" onClick={() => {
                claim();
              }}>Claim
              </Button>
              <div style={{ display: "flex", justifyContent: "center" }}><a href='https://docs.scry.finance/docs/morpheus'><Button style={{ background: "#519aff", color: 'white', margin: "auto" }} className="btn m-auto rounded-md border border-solid light:border-black dark:border-black light:text-gray-800 dark:text-black" type="button"> About Scry Hash RanCh
              </Button></a>
              </div>
              <h1 className="m-auto text-center md:mt-8 text-1xl md:text-1xl font-bold rotating-hue w-3/4">
                Transactions</h1>{events.reduce((accumulator, event) => {
                  if (accumulator.findIndex((item) => item.id === event.id) === -1) {
                    accumulator.push(event);
                  }
                  return accumulator;
                }, []).map((event, index) => (
                  <h1
                    className="m-auto text-center rounded-md border border-solid md:mt-8 text-1xl md:text-1xl font-bold rotating-hue w-3/4"
                    key={index}
                  >
                    {event.amount != 0 ? (
                      <Grid item xs={12}>
                        <Typography variant="h5" style={{ background: "#519aff", color: 'white', margin: "auto" }}>Bet ID: {event.betId.toString()}</Typography>
                        <Typography>{event.playerRoll}x</Typography>
                        <Typography className="text-1xl font-bold" variant="h5">
                          {ethers.utils.formatEther(event.amount)} ETH
                        </Typography>
                        <Typography>
                          Player: {event.player}
                        </Typography>
                      </Grid>
                    ) : (
                      <Grid item xs={12}>
                        <Typography variant="h5" style={{ background: "#51ffaa", color: '519aff', margin: "auto" }}>Filled ID: {event.betId.toString()}</Typography>
                        <Typography>Roll: {event.playRoll}</Typography>
                        <Typography>Won: {event.won.toString()}</Typography>
                      </Grid>
                    )}
                  </h1>
                ))}
            </div>
            <h1 className="rotating-hue w-3/4 top-16" >
              .</h1>
          </RainbowKitProvider>
        </WagmiConfig>
      </div>
    </ThemeProvider>
  )
}
export default App
