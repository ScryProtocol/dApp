import './App.css';
// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react'; import { useLocation } from 'react-router-dom';

import 'tailwindcss/tailwind.css'
import '@rainbow-me/rainbowkit/styles.css'

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
import { BrowserProvider, parseUnits, parseEther, JsonRpcProvider, Contract } from "ethers";
import { List, ListItem } from '@mui/material';
import toast, { Toaster } from 'react-hot-toast';
import { Container, TextField, Button, Typography, Paper, Grid, Modal, Select, MenuItem, Switch } from '@mui/material';
import 'tailwindcss/tailwind.css'
import { chainId } from 'wagmi';
import axios from 'axios';
const FormData = require('form-data')
const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYTY2ZDRiNS1kNTE1LTQ5MGMtYjBlMy1kY2I1M2M2MTg0MTkiLCJlbWFpbCI6InByMEB0YW1hLmxvbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxN2ZkMDAyYmViMzIzMGE4MzNmMCIsInNjb3BlZEtleVNlY3JldCI6ImMxNjExMDMzODM4N2ZkMGIxZGRiNGRlYmU2ZmM1MTcyOGE2OTQ2YmZkMWU1YTIwZmJhODk3NDM3NjRkZGM4OTAiLCJpYXQiOjE2OTQ2MjU4NjN9.-agiF02ut_dEr_lbkkh05OhYDCDdaF2wOPwAf4UDkao'

let provider = new ethers.BrowserProvider(window.ethereum)

let abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "signer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "SigAmount", "type": "uint256" }], "name": "Bided", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "signer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Claimed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "signer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "ClaimedSig", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "signer", "type": "address" }, { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" }], "name": "NFTSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }], "name": "SignaturesSet", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "Bid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address", "name": "signers", "type": "address" }, { "internalType": "uint256", "name": "SigAmount", "type": "uint256" }], "name": "BidForSignet", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "Bider", "outputs": [{ "internalType": "address", "name": "NFT", "type": "address" }, { "internalType": "uint256", "name": "ID", "type": "uint256" }, { "internalType": "uint256", "name": "Amount", "type": "uint256" }, { "internalType": "uint256", "name": "SigAmount", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "Bids", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "SigBid", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "SigBids", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "Sigs", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "autographs", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeAddrs", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeControl", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getAllAutographs", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address", "name": "signer", "type": "address" }], "name": "getAutograph", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getShownAutographs", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getShownSignatures", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "hasSigned", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "nftSigners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "Address", "type": "address" }], "name": "setFeeAddrs", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address[]", "name": "signers", "type": "address[]" }], "name": "setSignaturesToShow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "shownSigners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "string", "name": "ipfsHash", "type": "string" }], "name": "signNFT", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address", "name": "signers", "type": "address" }], "name": "unBid", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
//[{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "signer", "type": "address" }, { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" }], "name": "NFTSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }], "name": "SignaturesSet", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "autographs", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getAllAutographs", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address", "name": "signer", "type": "address" }], "name": "getAutograph", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getShownSignatures", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "nftSigners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address[]", "name": "signers", "type": "address[]" }], "name": "setSignaturesToShow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "shownSigners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "string", "name": "ipfsHash", "type": "string" }], "name": "signNFT", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
let morpheusAbi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }, { "indexed": false, "internalType": "uint256", "name": "signerThreshold", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "contractSetup", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "endpoint", "type": "string" }, { "indexed": false, "internalType": "string", "name": "endpointp", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "feedRequested", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "feedSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "", "type": "string" }], "name": "feedSubmitted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "supportvalue", "type": "uint256" }], "name": "feedSupported", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "newPayoutAddress", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "addressValue", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "oracleType", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "proposer", "type": "address" }], "name": "newProposal", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "newSigner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "newThreshold", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "proposalSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }], "name": "routerFeeTaken", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "signerRemoved", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newPass", "type": "uint256" }], "name": "subscriptionPassPriceUpdated", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "buyPass", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "createProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factoryContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "feedSupport", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "feedID", "type": "uint256" }], "name": "getFeed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFeedLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }], "name": "getFeeds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "signers_", "type": "address[]" }, { "internalType": "uint256", "name": "signerThreshold_", "type": "uint256" }, { "internalType": "address payable", "name": "payoutAddress_", "type": "address" }, { "internalType": "uint256", "name": "subscriptionPassPrice_", "type": "uint256" }, { "internalType": "address", "name": "factoryContract_", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "payoutAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "proposalList", "outputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "address", "name": "proposer", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "proposalFeedId", "type": "uint256" }, { "internalType": "uint256", "name": "proposalActive", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string[]", "name": "APIendpoint", "type": "string[]" }, { "internalType": "string[]", "name": "APIendpointPath", "type": "string[]" }, { "internalType": "uint256[]", "name": "decimals", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "bounties", "type": "uint256[]" }], "name": "requestFeeds", "outputs": [{ "internalType": "uint256[]", "name": "feeds", "type": "uint256[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "signProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "signerLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "signerThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "signers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }, { "internalType": "string[]", "name": "vals", "type": "string[]" }], "name": "submitFeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "subscriptionPassPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIds", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "supportFeeds", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

const contractAddress = '0xF1D38Ce14455AA4754b613Be27a66556825B6aCE';
const addrsS = '0x53844F9577C2334e541Aec7Df7174ECe5dF1fCf0';
let signer
let contract = new ethers.Contract(contractAddress, abi, provider);
//let morpheus = new ethers.Contract(morpheusAddress, morpheusAbi, provider);
let IPFS;
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} let check
let check2
function App() {
  const [accounts, setAccounts] = useState([]);
  const [addrs, setaddrs] = useState('0xd14cb764f012ef8d0ed7a1cba97e04156ec1455c');
  const [ID, setID] = useState('6');
  const [isBidsModalOpen, setIsBidsModalOpen] = useState(false);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [stateL, setstateL] = useState(); const [sigTog, setsigTog] = useState();

  //const [IPFS, setIPFS] = useState();
  const [sigs, setsigs] = useState();
  const [pngs, setpngs] = useState(['https://uwulabs.mypinata.cloud/ipfs/QmY1TQeJ31T6juvx32mBevw2pTq5yLFaFqcfREnaJeuhTU/4841.png?alt=media']);
  const [token, setToken] = useState("0x0000000000071821e8033345a7be174647be0706");
  const location = useLocation();
  useEffect(() => {
    async function init() {

      const queryParams = new URLSearchParams(location.search);
      const NFTaddrsURL = await queryParams.get('NFT');
      const NFTIDURL = await queryParams.get('ID');
      let NFTaddrs = addrs
      let NFTID = ID

      if (NFTaddrsURL != null) {
        setstateL(NFTaddrsURL)
        setaddrs(NFTaddrsURL)
        NFTaddrs = NFTaddrsURL
        console.log(NFTaddrs)
      }
      if (NFTIDURL != null) {
        setID(NFTIDURL)
        NFTID = NFTIDURL
        console.log(NFTID)
      }
      if (accounts.length == 0 && check == null) {
        check = 1
        toast('Connecting wallet')
      }

      await window.ethereum.request({ method: 'eth_requestAccounts' });
      try {
      provider = new ethers.BrowserProvider(window.ethereum)
      signer = await provider.getSigner()
      
    
      if ((await provider.getNetwork()).chainId != '11155111' && check2 == null) {
        check2 = 1
        toast.error('Change chain to Sepolia and refresh')
      }
      console.log('LOL', (await provider.getNetwork()).chainId)
    } catch (error) {
      provider = new ethers.JsonRpcProvider('https://endpoints.omniatech.io/v1/eth/sepolia/public')
      signer = new ethers.JsonRpcProvider('https://endpoints.omniatech.io/v1/eth/sepolia/public')

    } contract = new ethers.Contract(contractAddress, abi, await signer);
      let NFTb
      const NFT = new Contract(NFTaddrs, [
        // Assuming the NFT contract is ERC721 compliant
        'function tokenURI(uint256 tokenId) external view returns (string)',
      ], signer)//provider);

      try {
        let uri = await NFT.tokenURI(NFTID);
        console.log('LOL', uri)
        uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
        console.log(uri)

        const response = await fetch(uri);
        const metadata = await response.json();
        NFTb = (metadata.image);
        NFTb = NFTb.replace("ipfs://", "https://ipfs.io/ipfs/");
        console.log(NFTb)
      } catch (error) {
        console.error("Error fetching NFT image:", error);
      }

      let hash = []
      let lol = []
      hash = await contract.getShownAutographs(
        NFTaddrs,
        NFTID
      ); console.log(hash)

      function convertHashesToUrls(ipfsHashes) {
        const baseUrl = "https://ipfs.io/ipfs/";
        let urls = [NFTb]//'https://uwulabs.mypinata.cloud/ipfs/QmY1TQeJ31T6juvx32mBevw2pTq5yLFaFqcfREnaJeuhTU/4841.png?alt=media'];

        for (let i = 0; i < ipfsHashes.length; i++) {
          urls.push(baseUrl + ipfsHashes[i]);
        }
        setpngs(urls)
        return urls;
      }

      // Usage:
      const hashes = hash[1];
      const messages = await getMessagesForAccounts(hash[0]);
      setAccounts(messages)

      const urls = convertHashesToUrls(hashes);
      console.log(urls);

      setsigs(urls)
      console.log(sigs)
      LOL()
    }
    init(); try{window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        // Refresh the component content
        init();
      }
    });}
    catch{}
  }, [])

  const getBalance = async () => {
    const signer = await provider.getSigner()
  };
  const sign = async () => {
    toast.success('Signing')
    const MAX_RETRIES = 3; // Adjust as needed
    let retries = 0;

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    while (retries < MAX_RETRIES) {
      try {
        const tx = await contract.signNFT(
          addrs,
          ID,
          IPFS
        );
        await tx.wait(); break;
      } catch (error) {
        if (error.message.includes("undefined (reading 'then')")) {
          // Log the error for debugging or provide feedback to the user
          console.error('Failed to sign the NFT. Attempt:', retries + 1, error.message);

          retries++;

          if (retries === MAX_RETRIES) {
            console.error('Max retries reached. Aborting...');
          } else {
            // Wait for the specified delay time before retrying
            await sleep(2000);
          }
        } else {
          // If the error message is different, log it and break out of the loop without retrying
          console.error('Encountered an unexpected error:', error.message);
          break;
        }
      }
    }
  };
  const sig = async (sig1, amt) => {
    if (!sigTog) {
      console.log(addrs, ID, sig1, 0, amt)
      const tx = await contract.BidForSignet(addrs,
        ID, sig1, 0, { value: amt })
      await tx.wait();
    }
    if (sigTog) {
      let tok = new ethers.Contract(
        addrsS,
        [
          'function allowance(address,address) external view returns (uint)',
          'function approve(address spender, uint256 amount) external returns (bool)'
        ],
        signer
      );
      let amount = await tok.allowance(await signer.getAddress(), contractAddress)

      if (amount < amt) {
        let tx = await tok.approve(addrs, amt)
        await tx.wait()
      }
      let am = amount
      const tx = await contract.BidForSignet(addrs,
        ID, sig1, amt)
      await tx.wait();

    }
    toast.success('Your bid has been sent.')
  };
  const DrawOnLayeredCanvas = ({ pngs }) => {
    const backgroundCanvasRef = useRef(null);
    const drawingCanvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [isErasing, setIsErasing] = useState(false);

    const [smoothness, setSmoothness] = useState(1);
    const [lineWidth, setLineWidth] = useState(5);
    const undoStack = useRef([]);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
      const backgroundCanvas = backgroundCanvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      let drawingContext = drawingCanvas.getContext("2d");
      drawingContext.lineWidth = lineWidth;

      contextRef.current = drawingContext;
      const dpr = 1;
      backgroundCanvas.width = canvasWidth * dpr;
      backgroundCanvas.height = canvasHeight * dpr;
      drawingCanvas.width = canvasWidth * dpr;
      drawingCanvas.height = canvasHeight * dpr;

      backgroundCanvas.style.width = `${canvasWidth}px`;
      backgroundCanvas.style.height = `${canvasHeight}px`;
      drawingCanvas.style.width = `${canvasWidth}px`;
      drawingCanvas.style.height = `${canvasHeight}px`;

      // Layer the PNGs onto the background canvas
      let loadedImages = [];
      pngs.forEach((src) => {
        let img = new Image();
        img.src = src;
        img.onload = () => {
          loadedImages.push(img);
          if (loadedImages.length === pngs.length) {
            loadedImages.forEach(image => {
              backgroundCanvas.getContext("2d").drawImage(image, 0, 0, backgroundCanvas.width, backgroundCanvas.height);
            });
          }
        };
      });

      drawingContext.lineCap = "round";
      //  drawingContext.lineJoin = "round";
      drawingContext.strokeStyle = color;
      drawingContext.lineWidth = 5;
      drawingContext.shadowBlur = 1;  // adjust for desired softness
      drawingContext.shadowColor = color;
      drawingContext.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
    }, [pngs]);
    useEffect(() => {
      if (contextRef.current) {
        contextRef.current.strokeStyle = color;
        contextRef.current.shadowColor = color;
        contextRef.current.globalCompositeOperation = isErasing ? "destination-out" : "source-over";
        contextRef.current.lineWidth = 5;
        contextRef.current.shadowBlur = 1;  // adjust for desired softness}
      }
    }, [color, isErasing]);
    const startDrawing = (e) => {
      let offsetX, offsetY
      if (e.type.startsWith('touch')) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const dpr = 1;
        offsetX = (touch.clientX - rect.left) * dpr;
        offsetY = (touch.clientY - rect.top) * dpr;
      } else {
        offsetX = e.nativeEvent.offsetX;
        offsetY = e.nativeEvent.offsetY;
      } contextRef.current.lineWidth = lineWidth; // Set the lineWidth here
      contextRef.current.shadowBlur = smoothness; // Set the lineWidth here
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }; useEffect(() => {
      const canvasElement = drawingCanvasRef.current;

      if (canvasElement) {
        const handleTouchMove = (e) => {
          e.preventDefault();
        };

        canvasElement.addEventListener('touchmove', handleTouchMove, { passive: false });

        // Cleanup the event listener on component unmount
        return () => {
          canvasElement.removeEventListener('touchmove', handleTouchMove);
        };
      }
    }, []);
    const finishDrawing = (e) => {
      if (e.type.startsWith('touch')) {
        e.preventDefault();
      } const canvas = drawingCanvasRef.current;
      const imgData = canvas.toDataURL();
      undoStack.current.push(imgData);
      contextRef.current.lineWidth = lineWidth; // Set the lineWidth here
      setIsDrawing(false);
      lastX = undefined;
      lastY = undefined;
    };

    let lastX, lastY;
    const draw = (e) => {
      if (!isDrawing) {
        return;
      }
      let offsetX, offsetY
      if (e.type.startsWith('touch')) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = e.target.getBoundingClientRect();
        const dpr =  1;
        offsetX = (touch.clientX - rect.left) * dpr;
        offsetY = (touch.clientY - rect.top) * dpr;
      } else {
        offsetX = e.nativeEvent.offsetX;
        offsetY = e.nativeEvent.offsetY;
      }
      // Wrap the drawing code inside requestAnimationFrame
      requestAnimationFrame(() => {
        contextRef.current.lineWidth = lineWidth; // Set the lineWidth here

        // This checks if there's a significant difference between the last and current position.
        if (typeof lastX === 'undefined' || typeof lastY === 'undefined' || Math.abs(lastX - offsetX) > 1 || Math.abs(lastY - offsetY) > 1) {
          contextRef.current.lineTo(offsetX, offsetY);
          contextRef.current.stroke();
          lastX = offsetX;
          lastY = offsetY;
        }
      });
    };
    const toggleEraser = () => setIsErasing(!isErasing);
    const undo = () => {
      if (undoStack.current.length > 1) {
        undoStack.current.pop(); // remove current state
        const prevImgData = undoStack.current[undoStack.current.length - 1];
        const img = new Image();
        img.src = prevImgData;
        img.onload = () => {
          contextRef.current.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
          contextRef.current.drawImage(img, 0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
        };
      }
    };

    const clearDrawing = () => {
      const context = contextRef.current;
      context.clearRect(0, 0, drawingCanvasRef.current.width, drawingCanvasRef.current.height);
    };

    const saveCanvas = async () => {
      const drawingCanvas = drawingCanvasRef.current;
      const dataUrl = drawingCanvas.toDataURL("image/png");
      //  const link = document.createElement('a');
      //  link.download = 'drawing.png';
      //  link.href = dataUrl;
      //  link.click();
      await pinFileToIPFS()
      await sign()
    };
    const pinFileToIPFS = async () => {
      const drawingCanvas = drawingCanvasRef.current;
      await drawingCanvas.toBlob(async (blob) => {
        try {
          const formData = new FormData();
          formData.append('file', blob, 'drawing.png'); // Append the blob with a filename

          const pinataMetadata = JSON.stringify({
            name: 'File name',
          });
          formData.append('pinataMetadata', pinataMetadata);

          const pinataOptions = JSON.stringify({
            cidVersion: 0,
          })
          formData.append('pinataOptions', pinataOptions);


          const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
              'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
              Authorization: JWT
            }
          });
          console.log(res.data.IpfsHash);
          IPFS = res.data.IpfsHash//IPFS = res.data.IpfsHash)
        } catch (error) {
          console.log(error);
        }
      });
    }
    const maxWidth = 500;
    const maxHeight = 500;

    const canvasWidth = 500//Math.min(maxWidth, window.innerWidth);
    const canvasHeight = 500//Math.min(maxWidth, window.innerHeight); // Assuming you want the height to be the same as the width

    return (
      <div style={{ position: 'relative', width: `${canvasWidth}px`, height: `${canvasHeight}px` }}>
        <canvas
          ref={backgroundCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ position: 'absolute', left: '0', top: '0' }}
        />
        <canvas
          ref={drawingCanvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ position: 'absolute', left: '0', top: '0' }}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw} onTouchStart={startDrawing}
          onTouchEnd={finishDrawing}
          onTouchMove={draw}
        />
        <div style={{ position: 'absolute', top: '0', left: '50px', }} className="justify-center top-2 color-white border-white">
          {menuOpen && (
            <><label >Smooth:</label>
              <input
                style={{ marginRight: '10px' }}
                type="range"
                min="0"
                max="5" className="left-20 w-1/4"
                value={smoothness}
                onChange={(e) => { setSmoothness(e.target.value) }}
              />          <label >Width:</label>
              <input
                style={{}}
                type="range"
                min="1"
                max="20"
                value={lineWidth} className="w-1/4"
                onChange={(e) => setLineWidth(e.target.value)}
              /></>)} <button style={{ marginRight: '20px' }} onClick={() => setMenuOpen(!menuOpen)}>Menu </button>
          <button style={{ marginRight: '10px' }}
            onClick={toggleEraser}>{isErasing ? "Draw" : "Erase"}</button>
          <button style={{ marginRight: '10px' }}
            onClick={undo}>Undo</button>
          <button
            style={{ marginRight: '10px' }} onClick={clearDrawing}>
            Clear Drawing
          </button>

          <input
            style={{ marginRight: '10px', borderRadius: '5px' }}
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="border-black" /><button onClick={saveCanvas}>Sign NFT</button>
          <div></div></div>
      </div>
    );
  }; function BidsModal({ isOpen, onClose }) {
    const [availableBids, setAvailableBids] = useState([]);
    const [previousBids, setPreviousBids] = useState([]);

    useEffect(() => {
      async function fetchBids() {

        // Fetch bids for the user. You might need to modify this based on the smart contract's functions.
        const bidCount = await contract.Bids('0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5');
        let bidsArray = [];
        for (let i = 0; i < bidCount; i++) {
          const bid = await contract.Bider('0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5', i);  // Assuming Bider takes user, id, and index as arguments
          console.log(bid)
          bidsArray.push(bid);
        }
        // Separate available bids from previous bids based on some condition.
        // This is just a placeholder; adjust conditions as per your contract's logic.
        let availBids = bidsArray//.filter(bid => /* some condition */);
        availBids.reverse(); // For numeric bids
        //const prevBids = bids.filter(bid => /* some condition */);

        setAvailableBids(availBids);
        //setPreviousBids(prevBids);
      }

      fetchBids();
    }, []);

    return (
      <Modal open={isOpen} onClose={onClose}>
        <div style={{ color: '#ffffff', backgroundColor: '#53baff', position: 'relative', top: '50px', borderRadius: '25px' }} className="justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
          <h2 className="m-auto text-center md:mt-8 color-white text-2xl md:text-2xl font-extrabold w-3/4">Your Bids</h2>
          <List>
            {availableBids.map((bid, index) => (
              <h2 key={index}>
                <h2 className="font-bold">You have a Bid for NFT: </h2>
                <h2>{bid.NFT}</h2><h2 className="font-bold"> ID: {bid[1].toString()}, ETH Bounty: {Number(bid[2]) / 10 ** 18}
                </h2>_________________________________________</h2>
            ))}
          </List>

          <Button onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  } function BidModal({ isOpen, onClose }) {
    const [Signer, setSigner] = useState('');
    const [amount, setAmount] = useState(0);

    const handleSubmitBid = async () => {
      sig(Signer, ethers.parseEther(amount));
    };

    return (
      <Modal open={isOpen} onClose={onClose}>
        <div style={{ color: '#ffffff', backgroundColor: '#53baff', position: 'relative', top: '50px', borderRadius: '25px' }} className="w-2/4 justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
          <h2 className="m-auto text-center md:mt-8 color-white text-2xl md:text-2xl font-extrabold w-3/4">Bid for Signet</h2>
          <div className="m-auto w-3/4 space-y-4">
            <h2 className="font-bold ">Address to place bid for that will receive a reward for signing your NFT</h2>
            <input
              style={{ color: '#ffffff', backgroundColor: '#00ccff' }} type="text"
              value={Signer}
              onChange={e => setSigner(e.target.value)}
              className="p-2 rounded border border-solid border-white w-full"
            /><h2 className="font-bold">Amount to Bid in ETH (Minimum 0.01 )</h2>

            <input
              style={{ color: '#ffffff', backgroundColor: '#00ccff' }} type="number"
              placeholder="Amount"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="p-2 rounded border border-solid border-white w-full"
            />
            
            <div>
             
            </div><Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className=" top-3 color-white border-white" onClick={handleSubmitBid}>Submit Bid</Button>
          </div>
          <Button onClick={onClose}>Close</Button>
        </div>
      </Modal>
    );
  }
  async function LOL() {
    let hash = []
    let lol = []
    console.log(addrs)
    const queryParams = new URLSearchParams(location.search);
    const NFTaddrsURL = await queryParams.get('NFT');
    const NFTIDURL = await queryParams.get('ID');
    let NFTaddrs = addrs
    let NFTID = ID
    console.log('L', stateL)
    if (!stateL) {

      if (NFTaddrsURL != null) {
        NFTaddrs = NFTaddrsURL
        console.log(NFTaddrs)
      }
      if (NFTIDURL != null) {
        NFTID = NFTIDURL
        console.log(NFTID)
      }
    }
    hash = await contract.getShownAutographs(
      NFTaddrs,
      NFTID
    ); console.log(hash)
    let NFTb
    const NFT = new ethers.Contract(NFTaddrs, [
      // Assuming the NFT contract is ERC721 compliant
      'function tokenURI(uint256 tokenId) external view returns (string)',
    ], signer);

    try {
      let uri = await NFT.tokenURI(NFTID);
      console.log('LOL', uri)
      uri = uri.replace("ipfs://", "https://ipfs.io/ipfs/");
      console.log(uri)

      const response = await fetch(uri);
      console.log(response)

      const metadata = await response.json();
      NFTb = (metadata.image);
      NFTb = NFTb.replace("ipfs://", "https://ipfs.io/ipfs/");
      console.log("NT", NFTb)
    } catch (error) {
      console.error("Error fetching NFT image:", error);
    }
    function convertHashesToUrls(ipfsHashes) {
      const baseUrl = "https://ipfs.io/ipfs/";
      let urls = [NFTb]//'https://uwulabs.mypinata.cloud/ipfs/QmY1TQeJ31T6juvx32mBevw2pTq5yLFaFqcfREnaJeuhTU/4841.png?alt=media'];

      for (let i = 0; i < ipfsHashes.length; i++) {
        urls.push(baseUrl + ipfsHashes[i]);
      }
      setpngs(urls)
      return urls;
    }

    // Usage:
    const hashes = hash[1];
    console.log(hashes)
    const urls = convertHashesToUrls(hashes);
    console.log(urls);
    const messages = await getMessagesForAccounts(hash[0]);
    setAccounts(messages)

    setsigs(urls)
    console.log(sigs)
  }
  // const pngs = [
  // 'https://uwulabs.mypinata.cloud/ipfs/QmY1TQeJ31T6juvx32mBevw2pTq5yLFaFqcfREnaJeuhTU/4841.png?alt=media',
  // sigs//https://gateway.pinata.cloud/ipfs/QmfKG5DyFvpdzRAxuWGBQNyRGj8oiUiGZJL5iiNcvX6gPr sigs

  // ... more PNG URLs
  //    ];
  // 1. Create a function to resolve ENS names.
  async function resolveENS(address) {
    try {
      let pro = new JsonRpcProvider('https://eth.llamarpc.com');
      const ensName = await pro.lookupAddress(address);
      if (ensName != null) {
        return ensName;
      }
    } catch {
      // return the address itself if no ENS name is associated
    }
    return address;
  }

  // 2. Map over the accounts and generate messages.
  async function getMessagesForAccounts(accounts) {
    const messages = [];
    for (let i = 0; i < accounts.length; i++) {
      const nameOrAddress = await resolveENS(accounts[i]);
      messages.push(<h2><span className="font-bold">{nameOrAddress}</span> has signed this NFT</h2>);
    }
    return messages;
  }




  return (
    <div style={{ color: '#00ff55', backgroundColor: '#a8f9ff', display: 'flex', flexDirection: 'column', minHeight: '100%' }} className="min-h-screen">
      <Toaster /><div ><a href='https://scry.finance' ><img style={{ height: '42px', position: 'fixed' }} src="/scry.png" className="top-2 right-56 color-white border-white" />
      </a></div><div ><a href='https://discord.gg/sp5ubMK9Zt' ><img style={{ height: '42px', position: 'fixed' }} src="/discord.png" className="top-2 right-32 color-white border-white" />
      </a></div><div ><a href='https://twitter.com/heysignet' ><img style={{ height: '42px', position: 'fixed' }} src="/twitter.png" className="top-2 right-44 color-white border-white" />
      </a></div><a href='https://docs.veryfi.xyz'><Button style={{ backgroundColor: '#00aaff', color: '#ffffff', position: 'fixed' }} variant='outlined' className="top-2 right-2 color-white border-white">Our Docs</Button>
      </a><div style={{ color: '#ffffff', backgroundColor: '#53baff', position: 'relative', top: '40px', borderRadius: '25px' }} className="justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-white text-2xl md:text-3xl font-extrabold w-3/4">
          Signet
        </h1> <h3 style={{}} className='mx-6 font-bold' >
          Welcome to Signet, sign NFTs for all your fans, collect signatures from your favourite creators and show off all your Signets!</h3>
        <div style={{ color: '#ffffff', backgroundColor: '#53baff', position: 'relative', top: '10px', borderRadius: '25px' }} className="justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
          <DrawOnLayeredCanvas pngs={pngs} />
        </div>{
          accounts && accounts.map((account, index) => (
            <div key={index} className="account-item">
              {account}
            </div>
          ))
        } <div className="m-auto text-center color-white text-1xl md:text-1xl font-bold w-3/4">
          <h2>NFT</h2>
          <Select
            labelId="filter-label"
            id="filter-select"
            value={addrs} style={{ color: 'white', backgroundColor: '#00ccff' }}
            onChange={(e) => setaddrs(e.target.value)} className=" w-80 text-center flex flex-col justify-center mt-4 md:mt-4 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
            <MenuItem value="0xd14cb764f012ef8d0ed7a1cba97e04156ec1455c">uwucrew</MenuItem>
            <MenuItem value="0x19422ad584a93979b729fb93831c8db2de86b151">BAYC</MenuItem>
            <MenuItem value="0x706e00262e164092bca31c2e716dc0e8ec86c9e1">Azuki</MenuItem>
            <MenuItem value="">Custom</MenuItem>
            <MenuItem value="0x57ec0bc409b3d8a89b34b1737781adb3cf34a639">PudgyPenguins</MenuItem>
            <MenuItem value="534351">Scroll</MenuItem>
            <MenuItem value="11155111">Sepolia</MenuItem>
          </Select>
          {addrs == '' && <input type="text" style={{ backgroundColor: '#00ccff', position: 'relative', top: '4px' }} placeholder="" value={addrs} onChange={(e) => { toast.success('Custom NFT set'); setaddrs(e.target.value) }} className=" w-80 top-10 text-center flex flex-col justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden" />
          }<BidsModal
            isOpen={isBidsModalOpen}
            onClose={() => setIsBidsModalOpen(false)}
          /><BidModal
            isOpen={isBidModalOpen}
            onClose={() => setIsBidModalOpen(false)}
          /><h3>Token</h3>
          <input type="text" style={{ backgroundColor: '#00ccff', right: '2px' }} placeholder="Token" value={ID} onChange={(e) => { setID(e.target.value) }} className=" w-80 text-center flex flex-col justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden" />
          <Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className="top-2 color-white border-white" onClick={LOL}>Refresh</Button>
          <div><Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className="top-3 color-white border-white" onClick={() => setIsBidsModalOpen(true)}>View My Bids</Button>
            <Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className="top-3 left-2 color-white border-white" onClick={() => setIsBidModalOpen(true)}>Bids for Signet</Button>
            <Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className="top-3 left-4 color-white border-white" onClick={() => {
              let currentURL = new URL(window.location.href);
              currentURL = currentURL.origin; navigator.clipboard.writeText(currentURL + '?NFT=' + addrs + '&ID=' + ID); toast.success("Copied :)")
            }}>Link me to others</Button>
            <div>.</div></div></div></div >
      <div>.
      </div>
    </div >
  );
}

export default App;
