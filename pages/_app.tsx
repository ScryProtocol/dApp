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
  [chain.arbitrum],//, chain.arbitrum],//, //chain.optimism, chain.arbitrum, chain.localhost],
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
const Abi = [{"inputs":[{"internalType":"contract IERC20VotesUpgradeable","name":"_token","type":"address"},{"internalType":"address payable","name":"_sweepReceiver","type":"address"},{"internalType":"address","name":"_owner","type":"address"},{"internalType":"uint256","name":"_claimPeriodStart","type":"uint256"},{"internalType":"uint256","name":"_claimPeriodEnd","type":"uint256"},{"internalType":"address","name":"delegateTo","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"CanClaim","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"HasClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},{"indexed":true,"internalType":"address","name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"newSweepReceiver","type":"address"}],"name":"SweepReceiverSet","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Swept","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"recipient","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"delegatee","type":"address"},{"internalType":"uint256","name":"expiry","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"claimAndDelegate","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"claimPeriodEnd","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"claimPeriodStart","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"claimableTokens","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address[]","name":"_recipients","type":"address[]"},{"internalType":"uint256[]","name":"_claimableAmount","type":"uint256[]"}],"name":"setRecipients","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address payable","name":"_sweepReceiver","type":"address"}],"name":"setSweepReciever","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sweep","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"sweepReceiver","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"token","outputs":[{"internalType":"contract IERC20VotesUpgradeable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalClaimable","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}]
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
  
  const placeBet = async () => {
    
      const provider3 = new ethers.providers.Web3Provider(window.ethereum);
      let accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      let pay = await contract.claim();
      //let pay = await contract.pay(accounts[0]);
      console.log(pay)
      // setWon(ethers.utils.formatEther(pay.toString()));
      }
  return (
    <ThemeProvider attribute="class">
      <div className="bg-white dark:bg-gray-900 dark:text-white" >
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <Navbar />

            <div className="flex flex-col bg-white dark:bg-gray-800 space-y-6 justify-center mt-6 md:mt-12 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid light:border-gray-200 dark:border-gray-500 overflow-hidden">
              <h1 className="m-auto text-center md:mt-8 text-2xl md:text-3xl font-extrabold rotating-hue w-3/4">
                Welcome to ChainDice
                </h1>
              <Button style={{ background: "#519aff", color: 'white', margin: "auto" }} className="btn m-auto rounded-md border border-solid light:border-black dark:border-black light:text-gray-800 dark:text-black top-2" type="button" onClick={() => {
                placeBet();
              }}>Bet
              </Button>
            </div>
         
          </RainbowKitProvider>
        </WagmiConfig>
      </div>
    </ThemeProvider>
  )
}
export default App
