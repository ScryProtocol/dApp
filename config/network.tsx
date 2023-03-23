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
const SepRPC = 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
const SepA = '0x67a24ce4321ab3af51c2d0a4801c3e111d88c9d9'
const SepM = <MenuItem value={'0xE565f05422481345b5Fad564DD9Ab7B0cE3Ec017'}>Main</MenuItem>
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
const M = [<MenuItem value={'0xE565f05422481345b5Fad564DD9Ab7B0cE3Ec017'}>Main</MenuItem>,
]
const PolyC = chain.polygon
const RPC = 'https://sepolia.infura.io/v3/6822e4e6edc847829086404ffe6d5b2b'
const A = '0xE565f05422481345b5Fad564DD9Ab7B0cE3Ec017'
const PolyN = '0x99029716DEeE316894DC8ce4f55Ab066222AACe6'

const envVars = {
  chainn:PolyC,//chainn,
  rpc: RPC,//SepRPC,
    createn: PolyN,
    contractn: SepA,
    menun:M
}

export default envVars
