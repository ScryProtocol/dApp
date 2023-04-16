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
const wagmi = wagmiClient.provider;

// The MetaMask plugin also allows signing transactions to
// send ether and pay to change state within the blockchain.
// For this, you need the account signer...


let provider2 = wagmi// = new ethers.providers.Web3Provider(window.ethereum);
if (typeof window !== 'undefined') {
  provider2 = new ethers.providers.Web3Provider(window.ethereum);
}

const signer = provider2.getSigner();

const App = ({ Component, pageProps }: AppProps) => {
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [filter, setFilter] = useState();  function data() {
    let t0 = []
    let oracle = []
    oracle[0] = {
      name: 'Scry Team',
      stake: '1000000',
      addrs: '0x00FA498eD77F0eeb55acD56E1b869cbC405972a1',
      href:'https://goerli.etherscan.io/address/0x00FA498eD77F0eeb55acD56E1b869cbC405972a1',
      networks: ['goerli']
    }
    oracle[1] = {
      name: 'Scry Team',
      stake: '1000000',
      addrs: '0x927ba066081d016184a7D74Ba231d3Ce13B10D32',
      href:'https://sepolia.etherscan.io/address/0x927ba066081d016184a7D74Ba231d3Ce13B10D32',
      networks: ['sepolia']
    }
    oracle[2] = {
      name: 'Scry Team',
      stake: '1000000',
      addrs: '0x7F3dB2C9D4A52D78C4eEAECe4CDD5dc32Ab5d433',
      href:'https://optimistic.etherscan.io/address/0x7F3dB2C9D4A52D78C4eEAECe4CDD5dc32Ab5d433#writeContract',
      networks: ['optimism']
    }
    oracle[3] = {
      name: 'Scry Team',
      stake: '1000000',
      addrs: '0xE565f05422481345b5Fad564DD9Ab7B0cE3Ec017',
      href:'https://arbiscan.io/address/0xE565f05422481345b5Fad564DD9Ab7B0cE3Ec017',
      networks: ['arbitrum']
    }
    oracle[4] = {
      name: 'Scry Team',
      stake: '1000000',
      addrs: '0xb354e1d7265aff180d15f3b3a2ef917fef212b81',
      href:'https://goerli.basescan.org/address/0xb354e1d7265aff180d15f3b3a2ef917fef212b81',
      networks: ['base']
    }
    let oracleS = oracle
    if (filter!=null&&filter!='All'){
    oracleS = oracle.filter((o) => o.networks.includes(filter));}
    oracleS.sort((a, b) => parseInt(b.stake) - parseInt(a.stake));
    for (let n = 0; n < oracleS.length; n++) {
      t0[n] = (<Grid><div style={{ color: '#00ff55', width:420}} className="flex flex-col bg-gray-800 space-y-6 justify-center mt-6 md:mt-6  m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
          {oracleS[n].name}
        </h1>
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl font-bold w-3/4">
          Staked: {oracleS[n].stake}
        </h1>
        <div style={{ color: '#77ff8b' }}className="m-auto text-center color-green-500 text-1xl font-bold">
          Address: <br />{oracleS[n].addrs}
        </div>
        <div style={{ color: '#77ff8b' }}>
          Supported networks: {oracleS[n].networks}
        </div>
      </div></Grid>
      )}return (<Grid container spacing={2}className="bg-gray-900 w-3/4">{t0}</Grid>)}

    return (
      <div className="bg-gray-900 h-full w-full min-h-screen" >
        <WagmiConfig client={wagmiClient}>
          <RainbowKitProvider chains={chains}>
            <Navbar />
            <div style={{ color: '#00ff55' }} className="flex flex-col bg-gray-800 space-y-6 justify-center mt-6 md:mt-12 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
              <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
                Welcome to Morpheus
              </h1><div style={{ color: '#77ff8b' }}>
                Morpheus is designed to create a fully decentralized data market, allowing anyone to host an oracle and anyone to request data for a fee, creating a free and open data market. Oracles can stake $SCRY to create economic incentives to provide honest data to not be slashed. Anyone can run a Scry Morpheus node and help the network and developers access data when they need it.
              </div>
              <Button  style={{ color: '#77ff8b' }}variant='outlined'className="m-auto text-center w-80 bottom-4 color-green-500 border-green-500">Morpheus Docs</Button>
            </div><div style={{ color: '#00ff55' }} className="flex flex-col justify-center m-auto overflow-hidden">
              
        <InputLabel id="filter-label"style={{ color: '#00ff55' }} className="m-auto text-center md:mt-8 color-green-500 text-2xl font-bold w-3/4">Filter Network</InputLabel>
        <Select
          labelId="filter-label"
          id="filter-select"
          value={filter}style={{ color: '#00ff55' }} 
          onChange={(event: SelectChangeEvent) =>setFilter(event.target.value) }className="bg-gray-800 w-80 text-center flex flex-col justify-center mt-4 md:mt-4 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
          <MenuItem value="sepolia">Sepolia</MenuItem>
          <MenuItem value="optimism">Optimism</MenuItem>
          <MenuItem value="base">Base</MenuItem>
          <MenuItem value="arbitrum">Arbitrum</MenuItem>
        </Select></div><div style={{top:10, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}className="bg-gray-900">{data()}</div>
          </RainbowKitProvider>.
        </WagmiConfig>
      </div>
    )
  }
  export default App
