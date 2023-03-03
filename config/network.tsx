import { Network, Alchemy } from 'alchemy-sdk';
import { Chain } from '@rainbow-me/rainbowkit';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { chain, configureChains, createClient, WagmiConfig, useContractWrite } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'
import { RainbowKitChainProvider } from '@rainbow-me/rainbowkit/dist/components/RainbowKitProvider/RainbowKitChainContext'
import MenuItem from '@mui/material/MenuItem';
import { useEffect, useState } from "react";
import React from 'react';

const SepC: Chain = {
  id: 11155111,
  name: 'Sepolia',
  network: 'sepolia',
  iconUrl: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg?v=023',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM',
  },
  rpcUrls: {
    default: 'https://sepolia.infura.io/v3/6822e4e6edc847829086404ffe6d5b2b',
  },
  testnet: true,
};
const SepRPC = 'https://sepolia.infura.io/v3/6822e4e6edc847829086404ffe6d5b2b'
const SepA = '0x63622676c54813C952421A3bA24ba6679AC44A4b'
const SepM = <MenuItem value={'0x63622676c54813C952421A3bA24ba6679AC44A4b'}>Main</MenuItem>
const BSCC: Chain = {
  id: 56,
  name: 'Binance Chain',
  network: 'BSC',
  iconUrl: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=023',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'BSC',
    symbol: 'BNB',
  },
  rpcUrls: {
    default: 'https://bsc-dataseed.binance.org/'//'https://rpc.ftm.tools/',
  },
  blockExplorers: {
    default: { name: 'B', url: '	https://bscscan.com/' },
  },
  testnet: false,
};
const BSCRPC = 'https://bsc-dataseed.binance.org/'
const BSCA = '0x18C519E0dA619d017908aFf504e782E381552620'
const BSCN = '0xB8112446078378f0998FBf834D4683B6C8Ac08C7'
const BSCM = [<MenuItem value={'0x18C519E0dA619d017908aFf504e782E381552620'}>Main</MenuItem>]
const PolyM = [<MenuItem value={'0xB504A9e1B24dD18b9400db85B29e6d79C4857C69'}>Main</MenuItem>,
<MenuItem value={'0x79ae22bf1db3938db61989e805e5cd1d5990007c'}>Demo</MenuItem>,
]
const PolyC = chain.polygon
const N = '0x99029716DEeE316894DC8ce4f55Ab066222AACe6'

const envVars = {
  chainn:SepC,//chainn,
  rpc: SepRPC,
    createn: PolyN,
    contractn: SepA,
    menun:SepM
}

export default envVars

