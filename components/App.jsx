// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';

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
  sepolia,
  base
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
import { useEthersProvider } from './tl'
import { useEthersSigner } from './tl'
import { useAccount, useConnect, useEnsName } from 'wagmi'

let provider

let abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "player1", "type": "address" }, { "indexed": false, "internalType": "address", "name": "player2", "type": "address" }], "name": "GameCreated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "player", "type": "address" }, { "indexed": false, "internalType": "string", "name": "commit", "type": "string" }], "name": "PlayerJoined", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "player1roll", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "player2roll", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "winner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "WinnerDetermined", "type": "event" }, { "inputs": [], "name": "collect", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "internalType": "uint256", "name": "betAm", "type": "uint256" }, { "internalType": "address", "name": "p1", "type": "address" }], "name": "createGame", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }], "name": "determineWinner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "games", "outputs": [{ "internalType": "address", "name": "player1", "type": "address" }, { "internalType": "address", "name": "player2", "type": "address" }, { "internalType": "address", "name": "winner", "type": "address" }, { "internalType": "string", "name": "commit1", "type": "string" }, { "internalType": "string", "name": "commit2", "type": "string" }, { "internalType": "uint256", "name": "player1bet", "type": "uint256" }, { "internalType": "uint256", "name": "player2bet", "type": "uint256" }, { "internalType": "uint256", "name": "player1roll", "type": "uint256" }, { "internalType": "uint256", "name": "player2roll", "type": "uint256" }, { "internalType": "uint256", "name": "betAmount", "type": "uint256" }, { "internalType": "uint256", "name": "vrfFeedId", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "internalType": "string", "name": "_commit", "type": "string" }], "name": "joinGame", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "morpheus", "outputs": [{ "internalType": "contract Morpheus", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "oracleFee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "pay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newcollector", "type": "address" }, { "internalType": "uint256", "name": "oFee", "type": "uint256" }], "name": "swapcollector", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }], "name": "withdrawBet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

//[{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "signer", "type": "address" }, { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" }], "name": "NFTSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }], "name": "SignaturesSet", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "autographs", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getAllAutographs", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address", "name": "signer", "type": "address" }], "name": "getAutograph", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getShownSignatures", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "nftSigners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address[]", "name": "signers", "type": "address[]" }], "name": "setSignaturesToShow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "shownSigners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "string", "name": "ipfsHash", "type": "string" }], "name": "signNFT", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
let morpheusAbi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }, { "indexed": false, "internalType": "uint256", "name": "signerThreshold", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "contractSetup", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "endpoint", "type": "string" }, { "indexed": false, "internalType": "string", "name": "endpointp", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "feedRequested", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "feedSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "", "type": "string" }], "name": "feedSubmitted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "supportvalue", "type": "uint256" }], "name": "feedSupported", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "newPayoutAddress", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "addressValue", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "oracleType", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "proposer", "type": "address" }], "name": "newProposal", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "newSigner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "newThreshold", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "proposalSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }], "name": "routerFeeTaken", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "signerRemoved", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newPass", "type": "uint256" }], "name": "subscriptionPassPriceUpdated", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "buyPass", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "createProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factoryContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "feedSupport", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "feedID", "type": "uint256" }], "name": "getFeed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFeedLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }], "name": "getFeeds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "signers_", "type": "address[]" }, { "internalType": "uint256", "name": "signerThreshold_", "type": "uint256" }, { "internalType": "address payable", "name": "payoutAddress_", "type": "address" }, { "internalType": "uint256", "name": "subscriptionPassPrice_", "type": "uint256" }, { "internalType": "address", "name": "factoryContract_", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "payoutAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "proposalList", "outputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "address", "name": "proposer", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "proposalFeedId", "type": "uint256" }, { "internalType": "uint256", "name": "proposalActive", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string[]", "name": "APIendpoint", "type": "string[]" }, { "internalType": "string[]", "name": "APIendpointPath", "type": "string[]" }, { "internalType": "uint256[]", "name": "decimals", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "bounties", "type": "uint256[]" }], "name": "requestFeeds", "outputs": [{ "internalType": "uint256[]", "name": "feeds", "type": "uint256[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "signProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "signerLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "signerThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "signers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }, { "internalType": "string[]", "name": "vals", "type": "string[]" }], "name": "submitFeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "subscriptionPassPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIds", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "supportFeeds", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

let contractAddress = '0x66BE67167cF5E87FA6bC8CFA353584fC6737121c';
const addrsS = '0x0000000000071821e8033345a7be174647be0706';
let signer
let contract
let morpheus
let IPFS;
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} let check
let check2
function App() {
  provider = useEthersProvider()
  signer = useEthersSigner();
  let address = useAccount().address
  contract = new ethers.Contract(contractAddress, abi, signer);
  morpheus = new ethers.Contract(addrsS, morpheusAbi, signer);


  const [accounts, setAccounts] = useState([]);
  const [game, setGame] = useState('0');
  const [gameId, setGameId] = useState(0); const [OracleReady, setOracleReady] = useState(0);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState({}); const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState('0x0000000000000000000000000000000000000000');
  const [bal, setBal] = useState("0");
  const [commit, setCommit] = useState("");
  const [amount, setAmount] = useState("");
  useEffect(() => {
    async function init() {

      console.log((await provider.getBalance('0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5')).toString())
      console.log(await contract.games(gameId).player1roll)
      console.log(await contract.games(gameId))
      const gameData = await contract.games(gameId);
      setGame({
        player1: gameData.player1.toString(),
        player2: gameData.player2.toString(),
        winner: gameData.winner.toString(),
        commit1: gameData.commit1.toString(),
        commit2: gameData.commit2.toString(),
        player1bet: ethers.formatUnits(gameData.player1bet, 18).toString(),
        player2bet: ethers.formatUnits(gameData.player2bet, 18).toString(),
        player1roll: gameData.player1roll.toString(),
        player2roll: gameData.player2roll.toString(),
        betAmount: ethers.formatUnits(gameData.betAmount, 18).toString(),
        vrfFeedId: gameData.vrfFeedId.toString()
      }); 
      setAmount(ethers.formatUnits(gameData.betAmount, 18).toString())
      setBal(ethers.formatUnits(await contract.pay(address), 18).toString())
      console.log(await contract.games(gameId))
      let feedValue
      [feedValue, , ,] = await morpheus.getFeed(gameData.vrfFeedId); // Replace this with your actual call
      console.log('T', feedValue)
      setOracleReady((Number(feedValue)));
    } window.ethereum.request({ method: 'eth_requestAccounts' });
    init();
  }, []);

  useEffect(() => {
    const listenForWinner = contract.on("WinnerDetermined", (Id, roll, roll1, win, am, event) => {
      // Update state to show the modal
      if (Number(Id) == gameId) {
        setWinnerInfo({ player1roll: roll.toString(), player2roll: roll1.toString(), winner: win.toString(), amount: ethers.formatEther(am).toString() });
        console.log(winnerInfo)
        setWinnerModalOpen(true);
      }
    });
    const interval = setInterval(async () => {
      // if (gameId) {
      const gameData = await contract.games(gameId);
      setGame({
        player1: gameData.player1.toString(),
        player2: gameData.player2.toString(),
        winner: gameData.winner.toString(),
        commit1: gameData.commit1.toString(),
        commit2: gameData.commit2.toString(),
        player1bet: ethers.formatUnits(gameData.player1bet, 18).toString(),
        player2bet: ethers.formatUnits(gameData.player2bet, 18).toString(),
        player1roll: gameData.player1roll.toString(),
        player2roll: gameData.player2roll.toString(),
        betAmount: ethers.formatUnits(gameData.betAmount, 18).toString(),
        vrfFeedId: gameData.vrfFeedId.toString()
      }); setBal(ethers.formatUnits(await contract.pay(signer.getAddress()), 18).toString())
      let feedValue
      [feedValue, , ,] = await morpheus.getFeed(gameData.vrfFeedId); // Replace this with your actual call
      console.log('T', feedValue)
      setOracleReady((Number(feedValue)));
      //  }
      console.log('LOL', game)
    }, 10000);
    return () => clearInterval(interval);
  }, [gameId]);
  const createGame = async () => {
    const tx = await contract.connect(signer).createGame(gameId, ethers.parseEther(amount), player2);
    await tx.wait();
    setGameId(gameId);
  };
  const pingoracle = async () => {
    const tx = await morpheus.connect(signer).supportFeeds([gameId], ['10000000000000000'], { value: '10000000000000000' });
    await tx.wait();
  };
  const joinGame = async () => {
    const tx = await contract.connect(signer).joinGame(gameId, commit, { value: ethers.parseEther((Number(amount) + 0.0005).toString()) });
    await tx.wait();
    setGameId(gameId);
  };
  const withdraw = async () => {
    const tx = await contract.connect(signer).withdraw();
    await tx.wait();
  };
  const determineWinner = async () => {
    const feedId = game.vrfFeedId;
    const { value } = await morpheus.getFeed(feedId);
    try {
      if (parseInt(value) !== 0) {
        const tx = await contract.connect(signer).determineWinner(gameId);
        await tx.wait();
      }
    } catch (error) {

    }
  };


  return (
    <div style={{ color: '#00ff55' }} className="bg-gray-900 h-full w-full min-h-screen">
      <ConnectButton /><div style={{ color: '#00ff55' }} className="justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
          Death Roll
        </h1> <div style={{ color: '#77ff8b' }} className='mx-6' >
          This is for test only. Do not bet more than you can afford to lose. Gamble Responsibly</div>
        <div style={{ color: '#00ff55' }} className="flex justify-center">
        </div><div style={{ color: '#00ff55' }} className="flex flex-col justify-center m-auto overflow-hidden">

          {/* Display Game Details */}
          <div className="m-auto text-center color-green-500 text-1xl md:text-1xl font-bold w-3/4">
            <h2>Game Details</h2>
            <h3>Game ID: {gameId}</h3>
            <p>Winner: {game.winner || "Not determined yet"}</p>
            <p>Bet Amount: {game.betAmount} ETH</p>
            <p>VRF Feed ID: {game.vrfFeedId}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {/* Player 1 Column */}
              <div className="text-center bg-gray-800 space-y-6  justify-center shadow-md rounded-md border border-solid border-green-500 overflow-hidden" style={{ flex: '0 0 45%' }}>
                <h4>Player 1: {game.player1}</h4>
                <p>Commit: {game.commit1}</p>
                <p>Bet: {game.player1bet} ETH</p>
                <p>Roll: {game.player1roll}</p>
              </div>
              {/* Player 2 Column */}
              <div className="text-center bg-gray-800 space-y-6 justify-center shadow-md rounded-md border border-solid border-green-500 overflow-hidden" style={{ flex: '0 0 45%' }}>
                <h4>Player 2: {game.player2}</h4>
                <p>Commit: {game.commit2}</p>
                <p>Bet: {game.player2bet} ETH</p>
                <p>Roll: {game.player2roll}</p>
              </div>
            </div> {/* Determine Winner */}
            {OracleReady !== 0 && <Button style={{ color: '#77ff8b' }} variant='outlined' className="top-1 color-green-500 border-green-500" onClick={determineWinner}>Determine Winner</Button>
            }{(OracleReady == 0 && <>Awaiting VRF...</>)}
            <div style={{
  justifyContent: 'center',
  alignItems: 'center',
}}className="m-auto justify-center text-center space-x-6 space-y-1">
              <h2>Join Game with Bet</h2>

              <input type="text" style={{
                backgroundColor: '#111111',
                color: '#fff',
                border: '2px solid #333333',
                borderRadius: '5px',
                fontSize: '16px',
                outline: 'none', padding: '5px',
                boxSizing: 'border-box', // Ensures padding doesn't affect overall width
                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                transition: '0.3s',
                margin: '5px 0',
              }} placeholder="Your message" value={commit} onChange={(e) => setCommit(e.target.value)} />
              <input style={{
                backgroundColor: '#111111',
                color: '#fff',
                border: '2px solid #333333',
                borderRadius: '5px',
                fontSize: '16px',
                outline: 'none',    padding: '5px',

                boxSizing: 'border-box', // Ensures padding doesn't affect overall width
                boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
                transition: '0.3s',
                margin: '5px 5px',
              }} type="text" placeholder="Bet Amount in ETH" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <div><Button variant='outlined' onClick={joinGame}>Join Game</Button>
              </div>
            </div>
            <div>Withdrawable: {bal}<Button onClick={withdraw}>Withdraw</Button>
            </div></div>  {/* Create Game */}
          Game ID<div className="flex justify-center items-center h-screen"> {/* Container with Flexbox */}

          <input type="text"
            style={{
              backgroundColor: '#111111',
              color: '#fff',
              border: '2px solid #333333',
              borderRadius: '5px',
              fontSize: '16px',
              outline: 'none',
              width: '20%', // Adjust as needed
              boxSizing: 'border-box', // Ensures padding doesn't affect overall width
              boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
              transition: '0.3s',
              margin: '5px 5px',
            }} className="m-auto justify-center text-center bg-green-500" placeholder="0" onChange={(e) => setGameId(e.target.value)} />
          </div>{/* Join Game */}
          <div className="justify-center text-center space-x-6">
            <h2>Create Game</h2>

            <input type="text" style={{
              backgroundColor: '#111111',
              color: '#fff',
              border: '2px solid #333333',
              borderRadius: '5px',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box', // Ensures padding doesn't affect overall width
              boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
              transition: '0.3s',
              margin: '5px 5px',
            }} className="m-auto justify-center text-center bg-green-500" placeholder="Chosen Game ID" onChange={(e) => setGameId(e.target.value)} />
            <input type="text" style={{
              backgroundColor: '#111111',
              color: '#fff',
              border: '2px solid #333333',
              borderRadius: '5px',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box', // Ensures padding doesn't affect overall width
              boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
              transition: '0.3s',
              margin: '5px 5px',
            }} className="m-auto justify-center text-center bg-green-500" placeholder="Whitelist player only" onChange={(e) => setPlayer2(e.target.value)} />
            <input type="text" style={{
              backgroundColor: '#111111',
              color: '#fff',
              border: '2px solid #333333',
              borderRadius: '5px',
              fontSize: '16px',
              outline: 'none',
              boxSizing: 'border-box', // Ensures padding doesn't affect overall width
              boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
              transition: '0.3s',
              margin: '5px 5px',
            }} className="w-1/4 m-auto justify-center text-center bg-green-500" placeholder="Bet Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div><Button onClick={createGame}>Create Game</Button>
              <Button onClick={pingoracle}>Create</Button>
            </div>
          </div> <Modal
            open={winnerModalOpen}
            onClose={() => setWinnerModalOpen(false)}
          >
            <div style={{ backgroundColor: '#222222', color: '#00ff55' }} className="text-center textflex flex-col space-y-6 justify-center m-auto w-1/2   shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
              <p>Winner Determined!</p>
              <p>Winner: {winnerInfo.winner}</p>
              <p>Player 1: {game.player1}</p>
              <p>Player 1 Roll: {winnerInfo.player1roll}</p>
              <p>Player 2: {game.player2}</p>
              <p>Player 2 Roll: {winnerInfo.player2roll}</p>
              <p>Amount: {winnerInfo.amount} ETH</p>
            </div>
          </Modal></div></div ></div >
  );
}

export default App;
