import './App.css';
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
  sepolia
} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from "ethers";
import { BrowserProvider, parseUnits, parseEther, JsonRpcProvider,Contract } from "ethers";

import { Container, TextField, Button, Typography, Paper, Grid, Modal, Select, MenuItem } from '@mui/material';
import 'tailwindcss/tailwind.css'
import { chainId } from 'wagmi';
import axios from 'axios';
const FormData = require('form-data')
const JWT = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYTY2ZDRiNS1kNTE1LTQ5MGMtYjBlMy1kY2I1M2M2MTg0MTkiLCJlbWFpbCI6InByMEB0YW1hLmxvbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI0YTZhMmY5ZGMzZDc4YTA5NjEwNiIsInNjb3BlZEtleVNlY3JldCI6Ijg3NzAyZDU1Y2U3YzQ5NzI2ZjFmM2E1YjUxYmVjYTZhOGQzMmYwNWU2YTAyODRiMDViYzk1M2I3ZTA2YzE3ZjEiLCJpYXQiOjE2OTQyNTAzMTR9.PNU6kAhWRUIxKxRJqiCKqGUMJaKh8ZO8pcuCkLTrrhg'

let provider = new ethers.BrowserProvider(window.ethereum)

let abi = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "signer", "type": "address" }, { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" }], "name": "NFTSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "nftAddress", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }], "name": "SignaturesSet", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }], "name": "autographs", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getAllAutographs", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address", "name": "signer", "type": "address" }], "name": "getAutograph", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }], "name": "getShownSignatures", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "nftSigners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "address[]", "name": "signers", "type": "address[]" }], "name": "setSignaturesToShow", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "shownSigners", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "nftAddress", "type": "address" }, { "internalType": "uint256", "name": "nftId", "type": "uint256" }, { "internalType": "string", "name": "ipfsHash", "type": "string" }], "name": "signNFT", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
let morpheusAbi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }, { "indexed": false, "internalType": "uint256", "name": "signerThreshold", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "contractSetup", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "endpoint", "type": "string" }, { "indexed": false, "internalType": "string", "name": "endpointp", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "feedRequested", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "feedSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "", "type": "string" }], "name": "feedSubmitted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "supportvalue", "type": "uint256" }], "name": "feedSupported", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "newPayoutAddress", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "addressValue", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "oracleType", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "proposer", "type": "address" }], "name": "newProposal", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "newSigner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "newThreshold", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "proposalSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }], "name": "routerFeeTaken", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "signerRemoved", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newPass", "type": "uint256" }], "name": "subscriptionPassPriceUpdated", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "buyPass", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "createProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factoryContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "feedSupport", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "feedID", "type": "uint256" }], "name": "getFeed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFeedLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }], "name": "getFeeds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "signers_", "type": "address[]" }, { "internalType": "uint256", "name": "signerThreshold_", "type": "uint256" }, { "internalType": "address payable", "name": "payoutAddress_", "type": "address" }, { "internalType": "uint256", "name": "subscriptionPassPrice_", "type": "uint256" }, { "internalType": "address", "name": "factoryContract_", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "payoutAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "proposalList", "outputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "address", "name": "proposer", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "proposalFeedId", "type": "uint256" }, { "internalType": "uint256", "name": "proposalActive", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string[]", "name": "APIendpoint", "type": "string[]" }, { "internalType": "string[]", "name": "APIendpointPath", "type": "string[]" }, { "internalType": "uint256[]", "name": "decimals", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "bounties", "type": "uint256[]" }], "name": "requestFeeds", "outputs": [{ "internalType": "uint256[]", "name": "feeds", "type": "uint256[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "signProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "signerLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "signerThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "signers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }, { "internalType": "string[]", "name": "vals", "type": "string[]" }], "name": "submitFeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "subscriptionPassPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIds", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "supportFeeds", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

const contractAddress = '0x5938CF3fDeeF437029192e2aF949Ae88ee87B503';
const morpheusAddress = '0x0000000000071821e8033345A7Be174647bE0706';
let signer
let contract = new ethers.Contract(contractAddress, abi, provider);
let morpheus = new ethers.Contract(morpheusAddress, morpheusAbi, provider);
let IPFS;

function App() {
  const [accounts, setAccounts] = useState();
  const [addrs, setaddrs] = useState('0xd14cb764f012ef8d0ed7a1cba97e04156ec1455c');
  const [ID, setID] = useState('1');
  //const [IPFS, setIPFS] = useState();
  const [sigs, setsigs] = useState();
  const [pngs, setpngs] = useState(['https://uwulabs.mypinata.cloud/ipfs/QmY1TQeJ31T6juvx32mBevw2pTq5yLFaFqcfREnaJeuhTU/4841.png?alt=media']);
  const [token, setToken] = useState("0x0000000000071821e8033345a7be174647be0706");
  useEffect(() => {
    async function init() {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.BrowserProvider(window.ethereum)
      signer = await provider.getSigner()
      contract = new ethers.Contract(contractAddress, abi, await signer);

      let NFTb
      const NFT = new Contract('0xd14cb764f012ef8d0ed7a1cba97e04156ec1455c', [
        // Assuming the NFT contract is ERC721 compliant
        'function tokenURI(uint256 tokenId) external view returns (string)',
      ], signer)//provider);

      try {
        let uri = await NFT.tokenURI(ID);
        console.log('LOL', uri)
        uri = uri.replace("ipfs://", "");
        console.log('https://ipfs.io/ipfs/' + uri)

        const response = await fetch('https://ipfs.io/ipfs/' + uri);
        const metadata = await response.json();
        NFTb = (metadata.image);
        NFTb = 'https://ipfs.io/ipfs/' + NFTb.replace("ipfs://", "");
        console.log(NFTb)
      } catch (error) {
        console.error("Error fetching NFT image:", error);
      }

      let hash = []
      let lol = []
      hash = await contract.getAllAutographs(
        addrs,
        ID
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
    } 
    init();
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      const signer = await provider.getSigner()
      let hash = []
      let lol = []
      hash = await contract.getAllAutographs(
        addrs,
        ID
      ); console.log(hash)

      function convertHashesToUrls(ipfsHashes) {
        const baseUrl = "https://ipfs.io/ipfs/";
        let urls = ['https://uwulabs.mypinata.cloud/ipfs/QmY1TQeJ31T6juvx32mBevw2pTq5yLFaFqcfREnaJeuhTU/4841.png?alt=media'];

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

      setsigs(urls)
      console.log(sigs)
    }, 600000);
    return () => clearInterval(interval);
  }, []);
  const getBalance = async () => {
    const signer =  await provider.getSigner()
  };
  const sign = async () => {
    console.log(
      addrs,
      ID,
      IPFS);
    await contract.signNFT(
      addrs,
      ID,
      IPFS
    );
    const tx = await contract.signNFT(
      addrs,
      ID,
      IPFS
    );
    await tx.wait();
  };
  const sig = async (e) => {

  };
  const DrawOnLayeredCanvas = ({ pngs }) => {
    const backgroundCanvasRef = useRef(null);
    const drawingCanvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');

    useEffect(() => {
      const backgroundCanvas = backgroundCanvasRef.current;
      const drawingCanvas = drawingCanvasRef.current;
      const drawingContext = drawingCanvas.getContext("2d");
      contextRef.current = drawingContext;

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
      drawingContext.strokeStyle = color;
      drawingContext.lineWidth = 5;

    }, [pngs, color]);

    const startDrawing = ({ nativeEvent }) => {
      const { offsetX, offsetY } = nativeEvent;
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    };

    const finishDrawing = () => {
      contextRef.current.closePath();
      setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
      if (!isDrawing) {
        return;
      }
      const { offsetX, offsetY } = nativeEvent;
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
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
          IPFS =res.data.IpfsHash//IPFS = res.data.IpfsHash)
        } catch (error) {
          console.log(error);
        }
      });
    }
    return (
      <div style={{ position: 'relative', width: '500px', height: '500px' }}>
        <canvas
          ref={backgroundCanvasRef}
          width={500}
          height={500}
          style={{ position: 'absolute', left: '0', top: '0' }}
        />
        <canvas
          ref={drawingCanvasRef}
          width={500}
          height={500}
          style={{ position: 'absolute', left: '0', top: '0' }}
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
        />
        <div style={{ height: '42px', position: 'relative' }} className="top-2 left-2 color-white border-white">
          <button
            style={{ marginRight: '10px' }}
            onClick={clearDrawing}>
            Clear Drawing
          </button>

          <input
            style={{ marginRight: '10px' }}
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="border-black" /><button onClick={saveCanvas}>Save</button>
        </div>
      </div>
    );
  }; async function LOL() {
    let hash = []
    let lol = []
    hash = await contract.getAllAutographs(
      addrs,
      ID
    ); console.log(hash)
    let NFTb
    const NFT = new ethers.Contract('0xd14cb764f012ef8d0ed7a1cba97e04156ec1455c', [
      // Assuming the NFT contract is ERC721 compliant
      'function tokenURI(uint256 tokenId) external view returns (string)',
    ], signer);

    try {
      let uri = await NFT.tokenURI(ID);
      console.log('LOL', uri)
      uri = uri.replace("ipfs://", "");
      console.log('https://ipfs.io/ipfs/' + uri)

      const response = await fetch('https://ipfs.io/ipfs/' + uri);
      const metadata = await response.json();
      NFTb = (metadata.image);
      NFTb = 'https://ipfs.io/ipfs/' + NFTb.replace("ipfs://", "");
      console.log(NFTb)
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
    <div style={{ color: '#00ff55', backgroundColor: '#a8f9ff' }} className="h-full w-full min-h-screen">
      <div ><a href='https://scry.finance' ><img style={{ height: '42px', position: 'fixed' }} src="/scry.png" className="top-2 right-56 color-white border-white" />
      </a></div><div ><a href='https://discord.gg/3Z2qvm9BDg' ><img style={{ height: '42px', position: 'fixed' }} src="/discord.png" className="top-2 right-32 color-white border-white" />
      </a></div><div ><a href='https://twitter.com/scryprotocol' ><img style={{ height: '42px', position: 'fixed' }} src="/twitter.png" className="top-2 right-44 color-white border-white" />
      </a></div><a href='https://docs.veryfi.xyz'><Button style={{ backgroundColor: '#00aaff', color: '#ffffff', position: 'fixed' }} variant='outlined' className="top-2 right-2 color-white border-white">Our Docs</Button>
      </a><div style={{ color: '#ffffff', backgroundColor: '#53baff', position: 'relative', top: '50px', borderRadius: '25px' }} className="justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-white text-2xl md:text-3xl font-extrabold w-3/4">
          Signat
        </h1> <h3 style={{}} className='mx-6 font-bold' >
          Welcome to Signat, sign NFTs for all your fans, collect signatures from your favourite creators and show off all your signats!</h3>
        <div style={{ color: '#ffffff', backgroundColor: '#53baff', position: 'relative', top: '10px', borderRadius: '25px' }} className="justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
          <DrawOnLayeredCanvas pngs={pngs} />
        </div>{
          accounts && accounts.map((account, index) => (
            <div key={index} className="account-item">
              {account}
            </div>
          ))
        }<div>

        </div> <div className="m-auto text-center color-white text-1xl md:text-1xl font-bold w-3/4">
          <h2>NFT</h2>
          <Select
            labelId="filter-label"
            id="filter-select"
            value={'0x0000000000071821e8033345a7be174647be0706'} style={{ color: 'white', backgroundColor: '#00ccff' }}
            onChange={(e) => setaddrs(e.target.value)} className=" w-80 text-center flex flex-col justify-center mt-4 md:mt-4 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
            <MenuItem value="0x0000000000071821e8033345a7be174647be0706">uwucrew</MenuItem>
            <MenuItem value="42161">Arbitrum</MenuItem>
            <MenuItem value="8453">Base</MenuItem>
            <MenuItem value="10">Optimism</MenuItem>
            <MenuItem value="137">Polygon</MenuItem>
            <MenuItem value="534351">Scroll</MenuItem>
            <MenuItem value="11155111">Sepolia</MenuItem>
          </Select>
          <h3>Token</h3>
          <input type="text" style={{ backgroundColor: '#00ccff', right: '2px' }} placeholder="Token" value={ID} onChange={(e) => { setID(e.target.value) }} className=" w-80 text-center flex flex-col justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden" />
          <Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className="top-2 color-white border-white" onClick={LOL}>Refresh</Button>
          <div></div></div>Please note there is a 0.001 ETH fee.</div >
      <div>
      </div>
    </div >
  );
}

export default App;
