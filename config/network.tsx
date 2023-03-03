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

const C: Chain = {
  id: 5,
  name: 'Goerli',
  network: 'goerli',
  iconUrl: 'https://cryptologos.cc/logos/fantom-ftm-logo.svg?v=023',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'Fantom',
    symbol: 'FTM',
  },
  rpcUrls: {
    default: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
  },
  testnet: true,
};
const RPC = 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'
const A = '0x7Bae4f06a69C7E6664E52C71465d19ab946F0377'
const M = <MenuItem value={'0x7Bae4f06a69C7E6664E52C71465d19ab946F0377'}>Main</MenuItem>
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
const PolyC = chain.polygon
const RPC = 'https://eth.plexnode.wtf'
const A = '0xE565f05422481345b5Fad564DD9Ab7B0cE3Ec017'
const N = '0x99029716DEeE316894DC8ce4f55Ab066222AACe6'

const envVars = {
  chainn:SepC,//chainn,
  rpc: RPC,
    createn: N,
    contractn: A,
    menun:M
}
}

export default envVars
