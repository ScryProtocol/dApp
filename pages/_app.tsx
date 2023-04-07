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
  [chainn],//, chain.arbitrum],//, //chain.optimism, chain.arbitrum, chain.localhost],
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


let provider2 = signerw// = new ethers.providers.Web3Provider(window.ethereum);
if (typeof window !== 'undefined') {
  provider2 = new ethers.providers.Web3Provider(window.ethereum);
}

const signer = provider2.getSigner();

const App = ({ Component, pageProps }: AppProps) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
 
  const [showConfetti, setShowConfetti] = useState(false);
  
  async function ch() {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const signer = provider.getSigner();
          return { provider, signer };
        } catch (error) {
          console.error('User rejected connection request:', error);
          return null;
        }
      } else {
        console.error('MetaMask not detected');
        return null;
      }
  }
  const placeBet = async () => {
    const ABI = [
        { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }, { "indexed": false, "internalType": "uint256", "name": "signerThreshold", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "contractSetup", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "name", "type": "string" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "decimal", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timelsot", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "mode", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "price", "type": "uint256" }], "name": "feedAdded", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "roundId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "feedSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "supportvalue", "type": "uint256" }], "name": "feedSupported", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "newFee", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "cost", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feed", "type": "uint256" }], "name": "newFeedCost", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "newPayoutAddress", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "addressValue", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "oracleType", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "proposer", "type": "address" }], "name": "newProposal", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "mode", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feed", "type": "uint256" }], "name": "newRevenueMode", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "newSigner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "newThreshold", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "proposalSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }], "name": "routerFeeTaken", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "signerRemoved", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newPass", "type": "uint256" }], "name": "subscriptionPassPriceUpdated", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "buyPass", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "string[]", "name": "names", "type": "string[]" }, { "internalType": "string[]", "name": "descriptions", "type": "string[]" }, { "internalType": "uint256[]", "name": "decimals", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "timeslots", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "feedCosts", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "revenueModes", "type": "uint256[]" }], "name": "createNewFeeds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "createProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factoryContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "feedSupport", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "feedID", "type": "uint256" }], "name": "getFeed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFeedLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }], "name": "getFeedList", "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }], "name": "getFeeds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "timestamps", "type": "uint256[]" }], "name": "getHistoricalFeeds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "signers_", "type": "address[]" }, { "internalType": "uint256", "name": "signerThreshold_", "type": "uint256" }, { "internalType": "address payable", "name": "payoutAddress_", "type": "address" }, { "internalType": "uint256", "name": "subscriptionPassPrice_", "type": "uint256" }, { "internalType": "address", "name": "factoryContract_", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "payoutAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "proposalList", "outputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "address", "name": "proposer", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "proposalFeedId", "type": "uint256" }, { "internalType": "uint256", "name": "proposalActive", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "signProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "signerLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "signerThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "signers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "submitFeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "durations", "type": "uint256[]" }, { "internalType": "address", "name": "buyer", "type": "address" }], "name": "subscribeToFeed", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "subscriptionPassPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIds", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "supportFeeds", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
    ]; const metaMaskConnection = await ch();
      const { provider, signer } = metaMaskConnection;
  
    const bc = '0x60606040523415600e57600080fd5b603580601b6000396000f3fe6080604052600080fdfea2646970667358221220f9c03cfb9337d94c2b26e7e8d1b11e7f0dfc6d26a8b9de230a9881290c5fb6d564736f6c63430008000033';
    const provider3 = new ethers.providers.Web3Provider(window.ethereum);        console.log("Deploying your contract");
        // Get the ABI (Application Binary Interface) of the contract
        // Replace with the actual ABI of your contract
        const contractFactory = new ethers.ContractFactory(ABI, bc, signer);
        const deployedContract = await contractFactory.deploy();
        await deployedContract.deployed();
    
        console.log("Contract address:", deployedContract.address);
        // Create a contract object
        setShowConfetti(true);  
        setTimeout(() => {
          window.location.href = 'https://quests.base.org/';
        }, 5000); // Wait 5 seconds (5000 milliseconds) before redirecting
      
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

                  <Typography variant="h5" className="m-auto text-center md:mt-8 text-2xl md:text-3xl font-extrabold rotating-hue">Deployed</Typography></h1></div></Dialog></Confetti>
            }

            <div className="flex flex-col bg-white dark:bg-gray-800 space-y-6 justify-center mt-6 md:mt-12 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid light:border-gray-200 dark:border-gray-500 overflow-hidden">
              <h1 className="m-auto text-center md:mt-8 text-2xl md:text-3xl font-extrabold rotating-hue w-3/4">
                Welcome to Base Contract DEPLOY
              </h1>
              <h1 className="m-auto text-center md:mt-8 text-1xl md:text-1xl font-bold rotating-hue w-3/4">
              Just mint your NFT once you've deployed the contract by the simple 1 click deployment. </h1>
              <Button style={{ background: "#519aff", color: 'white', margin: "auto" }} className="btn m-auto rounded-md border border-solid light:border-black dark:border-black light:text-gray-800 dark:text-black top-2" type="button" onClick={() => {
                placeBet();
              }}>Deploy
              </Button><h1 className="rotating-hue w-3/4 top-16" >
              .</h1>
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
