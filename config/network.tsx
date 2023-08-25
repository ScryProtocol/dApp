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
  id: 8453,
  name: 'Base',
  network: 'Base',
  iconUrl: 'https://cryptologos.cc/logos/ethereum-eth.svg?v=023',
  iconBackground: '#fff',
  nativeCurrency: {
    decimals: 18,
    name: 'ethereum',
    symbol: 'eth',
  },
  rpcUrls: {
    default: 'https://developer-access-mainnet.base.org/',
  },
  testnet: true,
};
const RPC = 'https://sepolia-rpc.scroll.io'
const A = '0x66BE67167cF5E87FA6bC8CFA353584fC6737121c'
const M = <MenuItem value={'0x8517d3E3801F69c1F446dd41E71B37E8b8598367'}>Main</MenuItem>
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

const PolyC = chain.polygon
const N = '0x99029716DEeE316894DC8ce4f55Ab066222AACe6'

const envVars = {
  chainn:C,//chainn,
  rpc: RPC,
    createn: N,
    contractn: A,
    menun:M
}

export default envVars
