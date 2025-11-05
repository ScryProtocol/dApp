import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
const FormData = require('form-data')
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';
import { chainId } from 'wagmi'; import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider } from './tl'
import { useEthersSigner } from './tl'
import { useAccount, useConnect, useEnsName } from 'wagmi'
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Collapse,
  Stack,
  Divider,
  Paper
} from '@mui/material';
import {
  Palette as PaletteIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  HourglassEmpty as HourglassEmptyIcon,
  PlayArrow as PlayArrowIcon,
  Download as DownloadIcon,
  Person as PersonIcon,
  ContentCopy as ContentCopyIcon
} from '@mui/icons-material';
import { GlassCard } from './v2/GlassCard';
import { gradients } from '../theme/v2Theme';

const tokenaddress = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
let signer
const App = () => {

  const ContractAddress = '0xFDFDc8927a75186c8698848bF8066a37C6612d5D';
  const ContractABI = [{ "inputs": [{ "internalType": "address", "name": "_paymentToken", "type": "address" }, { "internalType": "address", "name": "_feeAddress", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "artist", "type": "address" }], "name": "ArtistProfileUpdated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "commissioner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "artist", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "artworkIPFSHash", "type": "string" }], "name": "ArtworkSubmittedAndMinted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "commissioner", "type": "address" }], "name": "BountyWithdrawn", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "commissioner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "intendedArtist", "type": "address" }, { "indexed": false, "internalType": "string", "name": "description", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "indexed": false, "internalType": "bool", "name": "isETH", "type": "bool" }], "name": "CommissionRequested", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "artist", "type": "address" }], "name": "CommissionStarted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "allCommissions", "outputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "address", "name": "commissioner", "type": "address" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "internalType": "address", "name": "intendedArtist", "type": "address" }, { "internalType": "bool", "name": "isFulfilled", "type": "bool" }, { "internalType": "bool", "name": "isStarted", "type": "bool" }, { "internalType": "bool", "name": "isETH", "type": "bool" }, { "internalType": "string", "name": "IPFS", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "artistCommissions", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "artistProfiles", "outputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "bio", "type": "string" }, { "internalType": "string", "name": "profilePictureIPFSHash", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newFee", "type": "address" }, { "internalType": "uint256", "name": "fee", "type": "uint256" }], "name": "changeFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "feeAddress", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feePercentage", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "uint256", "name": "bounty", "type": "uint256" }], "name": "fundCommission", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }], "name": "getArtistCommissions", "outputs": [{ "components": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "address", "name": "commissioner", "type": "address" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "internalType": "address", "name": "intendedArtist", "type": "address" }, { "internalType": "bool", "name": "isFulfilled", "type": "bool" }, { "internalType": "bool", "name": "isStarted", "type": "bool" }, { "internalType": "bool", "name": "isETH", "type": "bool" }, { "internalType": "string", "name": "IPFS", "type": "string" }], "internalType": "struct ArtCommission.CommissionRequest[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }], "name": "getArtistProfile", "outputs": [{ "components": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "bio", "type": "string" }, { "internalType": "string", "name": "profilePictureIPFSHash", "type": "string" }], "internalType": "struct ArtCommission.ArtistProfile", "name": "", "type": "tuple" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "n", "type": "uint256" }], "name": "getLastCommissions", "outputs": [{ "components": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "address", "name": "commissioner", "type": "address" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "internalType": "address", "name": "intendedArtist", "type": "address" }, { "internalType": "bool", "name": "isFulfilled", "type": "bool" }, { "internalType": "bool", "name": "isStarted", "type": "bool" }, { "internalType": "bool", "name": "isETH", "type": "bool" }, { "internalType": "string", "name": "IPFS", "type": "string" }], "internalType": "struct ArtCommission.CommissionRequest[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "user", "type": "address" }], "name": "getUserCommissions", "outputs": [{ "components": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "address", "name": "commissioner", "type": "address" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "internalType": "address", "name": "intendedArtist", "type": "address" }, { "internalType": "bool", "name": "isFulfilled", "type": "bool" }, { "internalType": "bool", "name": "isStarted", "type": "bool" }, { "internalType": "bool", "name": "isETH", "type": "bool" }, { "internalType": "string", "name": "IPFS", "type": "string" }], "internalType": "struct ArtCommission.CommissionRequest[]", "name": "", "type": "tuple[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "string", "name": "IPFS", "type": "string" }, { "internalType": "string", "name": "description", "type": "string" }], "name": "mintWithTokenURI", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "nextRequestId", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ownerOf", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "paymentToken", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "intendedArtist", "type": "address" }, { "internalType": "string", "name": "description", "type": "string" }, { "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "internalType": "bool", "name": "isETH", "type": "bool" }], "name": "requestCommission", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "artist", "type": "address" }, { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "bio", "type": "string" }, { "internalType": "string", "name": "profilePictureIPFSHash", "type": "string" }], "name": "setArtistProfile", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }], "name": "startCommission", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }, { "internalType": "string", "name": "artworkIPFSHash", "type": "string" }], "name": "submitArtwork", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "userCommissions", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "requestId", "type": "uint256" }], "name": "withdrawBounty", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]

  const [provider, setProvider] = useState(null);
  const [account, setAccount] = useState('');
  const [contract, setContract] = useState(null);
  const [kakuBalance, setKakuBalance] = useState(0);
  const [commissions, setCommissions] = useState([]);
  const [myBounties, setMyBounties] = useState([]);
  const [selectedCommission, setSelectedCommission] = useState(null);
  const [artist, setArtist] = useState('');
  const [description, setDescription] = useState('');
  const [bounty, setBounty] = useState('');
  const [paymentType, setPaymentType] = useState('eth');
  const [selectedImage, setSelectedImage] = useState(null);
  const [token, setToken] = useState(null);
  const [boop, setboop] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [profileCommissions, setUserCommissions] = useState([]);
  const [artistProfile, setArtistProfile] = useState([]);

  const ethersProvider = useEthersProvider();

  const ethersSigner = useEthersSigner();

  const toggleModal = () => {
    setShowModal(!showModal);
  };
  useEffect(() => {
    function handleaccountsChanged() {
      if (boop == null) {
        setboop('1');
        console.log('boop');
      } else {
        console.log('boop2');
        initEthers();
      }
    }
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleaccountsChanged);
    }
    const initEthers = async () => {
      if (window.ethereum) {
        setProvider(ethersProvider);
        try {
          const signer = ethersSigner
          //  setAccount('0x14B214CA36249b516B59401B3b221CB87483b53C');
          const contractInstance = new ethers.Contract(
            ContractAddress,
            ContractABI,
            signer
          );
          setContract(contractInstance);
          const contractIn = new ethers.Contract(
            tokenaddress,
            ContractABI,
            signer
          );
          await setToken(contractIn);
          if (await signer.getChainId() != 11155111) { toast.error('Connect to Sepolia Chain and refresh') }// toast.error('Connect to Base Chain and refresh') }
          async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
          await wait(5000)
          console.log('lol')
          fetchCommissions();
          fetchMyBounties();
          fetchAllCommissions();

        } catch (error) {
          console.error('Error connecting to Ethereum:', error);
        }
      } else {
        //  console.error('Ethereum not detected');

        const providerInstance = new ethers.providers.JsonRpcProvider('https://1rpc.io/sepolia');
        setProvider(providerInstance);

        setAccount('0x14B214CA36249b516B59401B3b221CB87483b53C');
        const contractInstance = new ethers.Contract(
          ContractAddress,
          ContractABI,
          providerInstance
        );
        setContract(contractInstance);
        const contractIn = new ethers.Contract(
          tokenaddress,
          ContractABI,
          providerInstance
        );
        await setToken(contractIn);
        async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
        await wait(5000)
        console.log('lol')
        fetchCommissions();
        fetchMyBounties();
        fetchAllCommissions();

      }
    };

    initEthers();

  }, []);


  useEffect(() => {
    if (contract && account) {
      const init = async () => {

        fetchCommissions();
        fetchMyBounties();
        console.log(await token.balanceOf(account))
        setKakuBalance(ethers.utils.formatEther(await token.balanceOf(account))); // Replace with actual KAKU balance fetching
      }; init()
    }
  }, [contract, account]);
  useEffect(() => {
    if (contract && account) {

      const { artist } = getQueryParams();

      if (artist && contract) {
        fetchArtistProfile(artist);
        setShowModal(true);
      }

      function getQueryParams() {
        const params = new URLSearchParams(window.location.search);
        console.log(params.get('artist'))
        return {
          artist: params.get('artist')
        };
      }
    }// Other initialization code...
  }, [contract]);
  const fetchCommissions = async () => {
    try {
      if (contract) {
        const commission = await contract.getUserCommissions(account);
        setCommissions(commission);
      }
    }
    catch (error) {
      console.error('Error fetching commissions:', error);
    }
  };
  const fetchAllCommissions = async () => {
    if (contract) {
      const numCommissions = await contract.nextRequestId();
      const fetchedCommissions = [];
      for (let i = 0; i < numCommissions; i++) {
        const commission = await contract.allCommissions(i);
        fetchedCommissions.push(commission);
      }
      setCommissions(fetchedCommissions);
    }
  };
  const fetchMyBounties = async () => {
    if (contract && account) {
      const bounties = await contract.getArtistCommissions(account);
      setMyBounties(bounties);
    }
  };
  const requestCommission = async (event) => {

    event.preventDefault();

    try {

      const bountyInWei = ethers.utils.parseEther(bounty);
      const approvedBalance = await token.allowance(account, ContractAddress);
      console.log(approvedBalance);

      // Check if the approved balance is sufficient
      if (approvedBalance.lt(bountyInWei)) {
        // Approve the allowance if it's insufficient
        try {
          // Get the Scry contract instance

          // Calculate the amount to approve (e.g., MAX_UINT256)
          const approvalAmount = ethers.constants.MaxUint256;

          // Approve the allowance for the Vain contract
          const tx = await token.approve(ContractAddress, approvalAmount);
          await tx.wait();

          console.log('Allowance approved successfully');
        } catch (error) {
          console.error('Error approving allowance:', error);
        }
      }
      const tx = await contract.requestCommission(
        artist,
        description,
        bountyInWei,
        paymentType === 'eth', { value: paymentType === 'eth' ? bountyInWei : 0 }
      );

      await tx.wait();

      // Reset form fields

      setArtist('');

      setDescription('');

      setBounty('');

      setPaymentType('eth');

      // Refresh commissions and bounties

      fetchCommissions();

      fetchMyBounties();

    } catch (error) {

      console.error('Error requesting commission:', error);

      // Handle error state

    }

  };

  const startCommission = async (requestId) => {

    try {


      const tx = await contract.startCommission(requestId);

      await tx.wait();

      // Refresh selected commission

      const updatedCommission = await contract.allCommissions(requestId);

      setSelectedCommission(updatedCommission);

    } catch (error) {

      console.error('Error starting commission:', error);

      // Handle error state

    }

  };

  const submitArtwork = async (requestId, artworkIPFSHash) => {

    try {
      const formData = new FormData();
      formData.append('file', selectedImage, 'lol'); // Append the blob with a filename

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
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYTY2ZDRiNS1kNTE1LTQ5MGMtYjBlMy1kY2I1M2M2MTg0MTkiLCJlbWFpbCI6InByMEB0YW1hLmxvbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxN2ZkMDAyYmViMzIzMGE4MzNmMCIsInNjb3BlZEtleVNlY3JldCI6ImMxNjExMDMzODM4N2ZkMGIxZGRiNGRlYmU2ZmM1MTcyOGE2OTQ2YmZkMWU1YTIwZmJhODk3NDM3NjRkZGM4OTAiLCJpYXQiOjE2OTQ2MjU4NjN9.-agiF02ut_dEr_lbkkh05OhYDCDdaF2wOPwAf4UDkao'

        }
      });
      console.log(res.data.IpfsHash);
      artworkIPFSHash = res.data.IpfsHash//IPFS = res.data.IpfsHash)
      const tx = await contract.submitArtwork(requestId, artworkIPFSHash);

      await tx.wait();

      // Refresh selected commission

      const updatedCommission = await contract.allCommissions(requestId);

      setSelectedCommission(updatedCommission);

    } catch (error) {

      console.error('Error submitting artwork:', error);

      // Handle error state

    }

  }
  const fetchArtistProfile = async (artistAddress) => {
    try {
      // Fetch artist information based on their Ethereum address
      //  const artist = await fetchArtistData(artistAddress);

      // Fetch artist's commissions
      //  const commissions = await contract.getArtistCommissions(artistAddress);
      const artistData = {
        address: '0x9d31e30003f253563ff108bc60b16fdf2c93abb5',
        name: 'LOL',
        bio: 'I am a talented artist with a passion for creating unique and captivating artwork.',
        profilePicture: './scry.png'
        // Add more artist details as needed
      };
      const commissions = [
        {
          requestId: 1,
          description: 'Commission 1 description',
          bounty: '0.5',
          isETH: true,
          isFulfilled: false,
          isStarted: true,
        },
        {
          requestId: 2,
          description: 'Commission 2 description',
          bounty: '100',
          isETH: false,
          isFulfilled: true,
          isStarted: true,
        },
        // Add more commission objects as needed
      ];
      setCommissions(await contract.getArtistCommissions(artistAddress));
      setUserCommissions(await contract.getUserCommissions(artistAddress));
      setArtistProfile(await contract.getArtistProfile(artistAddress));

      console.log(profileCommissions)
      setSelectedArtist(artistAddress);
    } catch (error) {
      console.error('Error fetching artist profile:', error);
    }
    setShowModal(true);

  };

  const requestCommissionFromArtist = async (artistAddress, description, bounty, paymentType) => {
    try {
      const bountyInWei = ethers.utils.parseEther(bounty);
      const tx = await contract.requestCommission(
        artistAddress,
        description,
        bountyInWei,
        paymentType === 'eth',
        { value: paymentType === 'eth' ? bountyInWei : 0 }
      );
      await tx.wait();
      fetchArtistProfile(artistAddress);
    } catch (error) {
      console.error('Error requesting commission from artist:', error);
    }
  };

  const ArtistProfile = ({ artist }) => {
    const [description, setDescription] = useState('');
    const [bounty, setBounty] = useState('');
    const [paymentType, setPaymentType] = useState('eth');
    const [comms, setcomm] = useState(0);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [file, setFile] = useState(null);
    const handleRequestCommission = (e) => {
      e.preventDefault();
      setDescription('');
      setBounty('');
      setPaymentType('eth');
    };

    const uploadToIPFS = async (file) => {
      const formData = new FormData();
      formData.append('file', file, 'lol'); // Append the blob with a filename

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
          Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYTY2ZDRiNS1kNTE1LTQ5MGMtYjBlMy1kY2I1M2M2MTg0MTkiLCJlbWFpbCI6InByMEB0YW1hLmxvbCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIxN2ZkMDAyYmViMzIzMGE4MzNmMCIsInNjb3BlZEtleVNlY3JldCI6ImMxNjExMDMzODM4N2ZkMGIxZGRiNGRlYmU2ZmM1MTcyOGE2OTQ2YmZkMWU1YTIwZmJhODk3NDM3NjRkZGM4OTAiLCJpYXQiOjE2OTQ2MjU4NjN9.-agiF02ut_dEr_lbkkh05OhYDCDdaF2wOPwAf4UDkao'

        }
      });
      console.log(res.data.IpfsHash);//IPFS = res.data.IpfsHash)
      return res.data.IpfsHash;
    };

    const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const hash = await uploadToIPFS(file);
        setProfilePicture(hash);

      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();

      try {
        await contract.setArtistProfile(selectedArtist, name, bio, profilePicture);
        alert('Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    };

    return (
      <Box sx={{ p: 3, maxWidth: '900px', margin: '0 auto' }}>
        <GlassCard>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={
                  profilePicture
                    ? `https://ipfs.io/ipfs/${profilePicture}`
                    : (
                      artistProfile.profilePictureIPFSHash
                        ? `https://ipfs.io/ipfs/${artistProfile.profilePictureIPFSHash}`
                        : 'https://cdn.discordapp.com/attachments/810019961165578294/1224489258027319427/image.png?ex=661dad7d&is=660b387d&hm=3f39b216ea2152d1b967f4cc1aa2c3a31fc61ca8b981f726a8a8ea7b1bdb1348&'
                    )}
                sx={{ width: 150, height: 150, mb: 2, border: '4px solid', borderColor: 'primary.main' }}
              />
              <Typography variant="h5" sx={{ color: '#e91e63', fontWeight: 600, mb: 1 }}>
                {artistProfile.name ? artistProfile.name : 'Artist'}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                {artistProfile.bio}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled', wordBreak: 'break-all' }}>
                Address: {selectedArtist}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
              {selectedArtist == account && (
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={() => { setcomm(!comms) }}
                  sx={{ background: gradients.primary }}
                >
                  Update Info
                </Button>
              )}
              <Button
                variant="contained"
                startIcon={<ContentCopyIcon />}
                onClick={() => {
                  toast.success('Copied :)');
                  navigator.clipboard.writeText('https://kaku.art/?artist=' + selectedArtist)
                }}
                sx={{ background: gradients.ocean }}
              >
                Copy Link
              </Button>
              <Button
                variant="outlined"
                startIcon={<CloseIcon />}
                onClick={() => { setShowModal(false) }}
              >
                Close
              </Button>
            </Stack>

            <Collapse in={comms == 1}>
              <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{ mb: 2 }}
                >
                  Upload Profile Picture
                  <input
                    type="file"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                <Button type="submit" variant="contained" fullWidth sx={{ background: gradients.success }}>
                  Update Profile
                </Button>
              </Box>
            </Collapse>

            <Divider sx={{ my: 3 }} />

            <Box component="form" onSubmit={requestCommission} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#e91e63', mb: 2 }}>
                Commission Artist
              </Typography>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Bounty"
                type="number"
                value={bounty}
                onChange={(e) => setBounty(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  label="Payment Type"
                >
                  <MenuItem value="eth">ETH</MenuItem>
                  <MenuItem value="token">Token</MenuItem>
                </Select>
              </FormControl>
              <Button type="submit" variant="contained" fullWidth sx={{ background: gradients.lavender }}>
                Request Commission
              </Button>
            </Box>

            <Typography variant="h6" sx={{ color: '#e91e63', mb: 2 }}>
              Artist Commissions
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {commissions.map((commission) => (
                <Grid item xs={12} key={commission.requestId.toString()}>
                  <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Commission #{commission.requestId.toString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Artist:</strong> {commission.intendedArtist}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Description:</strong> {commission.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Bounty:</strong> {ethers.utils.formatEther(commission.bounty)} {commission.isETH ? 'ETH' : 'KAKU'}
                      </Typography>
                      <Chip
                        label={commission.isFulfilled ? 'Fulfilled' : (commission.isStarted ? 'Started' : 'Waiting')}
                        color={commission.isFulfilled ? 'success' : (commission.isStarted ? 'warning' : 'default')}
                        icon={commission.isFulfilled ? <CheckCircleIcon /> : (commission.isStarted ? <PlayArrowIcon /> : <HourglassEmptyIcon />)}
                        sx={{ mr: 1 }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => { setSelectedCommission(commission); setShowModal(false) }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" sx={{ color: '#e91e63', mb: 2 }}>
              Commission Requests
            </Typography>
            <Grid container spacing={2}>
              {profileCommissions.map((commission) => (
                <Grid item xs={12} key={commission.requestId.toString()}>
                  <Card sx={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Commission #{commission.requestId.toString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Artist:</strong> {commission.intendedArtist}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Description:</strong> {commission.description}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        <strong>Bounty:</strong> {ethers.utils.formatEther(commission.bounty)} {commission.isETH ? 'ETH' : 'KAKU'}
                      </Typography>
                      <Chip
                        label={commission.isFulfilled ? 'Fulfilled' : (commission.isStarted ? 'Started' : 'Waiting')}
                        color={commission.isFulfilled ? 'success' : (commission.isStarted ? 'warning' : 'default')}
                        icon={commission.isFulfilled ? <CheckCircleIcon /> : (commission.isStarted ? <PlayArrowIcon /> : <HourglassEmptyIcon />)}
                        sx={{ mr: 1 }}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => { setSelectedCommission(commission); setShowModal(false) }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </GlassCard>
      </Box>
    );
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: gradients.mesh,
      py: 4
    }}>
      <Toaster />
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Button
            variant="contained"
            startIcon={<PersonIcon />}
            onClick={() => { fetchArtistProfile(account); }}
            sx={{ background: gradients.primary }}
          >
            My Profile
          </Button>
          <ConnectButton />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              component="a"
              href="https://twitter.com/kakudotart/"
              target="_blank"
              sx={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <img src="./twitter.png" alt="Twitter" style={{ width: 24, height: 24 }} />
            </IconButton>
            <IconButton
              component="a"
              href="https://discord.gg/W87Rw6wtk2"
              target="_blank"
              sx={{ background: 'rgba(255,255,255,0.1)' }}
            >
              <img src="./discord.png" alt="Discord" style={{ width: 24, height: 24 }} />
            </IconButton>
            <Avatar src="./lol.png" sx={{ width: 40, height: 40 }} />
          </Box>
        </Box>

        {/* Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              color: '#e91e63',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1
            }}
          >
            <PaletteIcon sx={{ fontSize: 40 }} />
            Kaku Art Commission
          </Typography>
        </Box>

        {/* Artist Profile Modal */}
        <Dialog
          open={showModal}
          onClose={toggleModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px'
            }
          }}
        >
          {selectedArtist && (
            <ArtistProfile artist={selectedArtist} />
          )}
        </Dialog>

        {/* Request Commission Form */}
        <GlassCard sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ color: '#e91e63', fontWeight: 600 }}>
                KAKU Balance: {kakuBalance}
              </Typography>
              <Button
                component="a"
                href="https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=0x64ba55A341EC586A4aC5d58d6297CdE5125aB55bC&chain=base"
                target="_blank"
                size="small"
                sx={{ color: '#ffb7cf', mt: 1 }}
              >
                Buy KAKU
              </Button>
            </Box>

            <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
              Request a Commission
            </Typography>

            <Box component="form" onSubmit={requestCommission}>
              <TextField
                fullWidth
                label="Intended Artist Address"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Bounty"
                type="number"
                inputProps={{ step: '0.01' }}
                value={bounty}
                onChange={(e) => setBounty(e.target.value)}
                required
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Payment Type</InputLabel>
                <Select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value)}
                  label="Payment Type"
                >
                  <MenuItem value="eth">ETH (0% fee)</MenuItem>
                  <MenuItem value="token">KAKU</MenuItem>
                </Select>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{
                  background: gradients.lavender,
                  py: 1.5,
                  fontSize: '1.1rem'
                }}
              >
                Request Commission
              </Button>
            </Box>
          </CardContent>
        </GlassCard>

        {/* Commissions List */}
        <GlassCard sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" sx={{ color: '#e91e63', mb: 3 }}>
              Commissions
            </Typography>
            <Grid container spacing={2}>
              {commissions.map((commission) => (
                <Grid item xs={12} md={6} key={commission.requestId.toString()}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Commission #{commission.requestId.toString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Artist:</strong> {commission.intendedArtist.slice(0, 10)}...
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Description:</strong> {commission.description.slice(0, 50)}...
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Bounty:</strong> {ethers.utils.formatEther(commission.bounty)} {commission.isETH ? 'ETH' : 'KAKU'}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={commission.isFulfilled ? 'Fulfilled' : (commission.isStarted ? 'Started' : 'Waiting')}
                          color={commission.isFulfilled ? 'success' : (commission.isStarted ? 'warning' : 'default')}
                          icon={commission.isFulfilled ? <CheckCircleIcon /> : (commission.isStarted ? <PlayArrowIcon /> : <HourglassEmptyIcon />)}
                          size="small"
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => { setSelectedCommission(commission); }}
                        >
                          View Details
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </GlassCard>

        {/* My Bounties */}
        <GlassCard sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" sx={{ color: '#e91e63', mb: 3 }}>
              My Bounties
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {myBounties.map((bounty) => (
                <Grid item xs={12} md={6} key={bounty.requestId.toString()}>
                  <Card sx={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Commission #{bounty.requestId.toString()}
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Artist:</strong> {bounty.intendedArtist.slice(0, 10)}...
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        <strong>Description:</strong> {bounty.description.slice(0, 50)}...
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Bounty:</strong> {ethers.utils.formatEther(bounty.bounty)} {bounty.isETH ? 'ETH' : 'KAKU'}
                      </Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={bounty.isFulfilled ? 'Fulfilled' : (bounty.isStarted ? 'Started' : 'Waiting')}
                          color={bounty.isFulfilled ? 'success' : (bounty.isStarted ? 'warning' : 'default')}
                          icon={bounty.isFulfilled ? <CheckCircleIcon /> : (bounty.isStarted ? <PlayArrowIcon /> : <HourglassEmptyIcon />)}
                          size="small"
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => { setSelectedCommission(bounty); }}
                        >
                          View Details
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => { fetchMyBounties(); fetchCommissions() }}
                sx={{ background: gradients.primary }}
              >
                My Bounties
              </Button>
              <Button
                variant="contained"
                onClick={() => { fetchAllCommissions() }}
                sx={{ background: gradients.ocean }}
              >
                Check All Bounties
              </Button>
            </Stack>
          </CardContent>
        </GlassCard>

        {/* Selected Commission Details */}
        {selectedCommission && (
          <GlassCard>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{
                    position: 'relative',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                  }}>
                    {selectedImage ? (
                      <img
                        src={selectedImage instanceof File ? URL.createObjectURL(selectedImage) : selectedImage}
                        alt="Selected NFT"
                        style={{ width: '100%', display: 'block' }}
                      />
                    ) : (
                      <img
                        src={
                          selectedCommission.IPFS
                            ? `https://ipfs.io/ipfs/${selectedCommission.IPFS}`
                            : 'https://cdn.discordapp.com/attachments/810019961165578294/1224489258027319427/image.png?ex=661dad7d&is=660b387d&hm=3f39b216ea2152d1b967f4cc1aa2c3a31fc61ca8b981f726a8a8ea7b1bdb1348&'
                        }
                        alt="NFT"
                        style={{ width: '100%', display: 'block' }}
                      />
                    )}
                  </Box>
                  {selectedCommission.IPFS && (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      sx={{ mt: 2, background: gradients.success }}
                      onClick={() => {
                        if (selectedCommission && selectedCommission.IPFS) {
                          const imageUrl = `https://ipfs.io/ipfs/${selectedCommission.IPFS}`;
                          const link = document.createElement('a');
                          link.href = imageUrl;
                          link.download = 'nft-image';
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }
                      }}
                    >
                      Save Image
                    </Button>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                    Kaku #{selectedCommission.requestId.toString()}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Artist:</strong> {selectedCommission.intendedArtist}
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => { fetchArtistProfile(selectedCommission.intendedArtist); }}
                      sx={{ mb: 2 }}
                    >
                      View Artist Profile
                    </Button>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Description:</strong> {selectedCommission.description}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      <strong>Commissioner:</strong> {selectedCommission.commissioner}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Bounty Details
                  </Typography>
                  <Paper sx={{ p: 2, background: 'rgba(255,255,255,0.05)', mb: 3 }}>
                    <Typography variant="h5" sx={{ color: '#e91e63', mb: 1 }}>
                      {selectedCommission.isETH
                        ? `${ethers.utils.formatEther(selectedCommission.bounty)} ETH`
                        : `${ethers.utils.formatEther(selectedCommission.bounty)} KAKU`}
                    </Typography>
                    <Chip
                      label={selectedCommission.isFulfilled ? 'Fulfilled' : (selectedCommission.isStarted ? 'Started' : 'Waiting')}
                      color={selectedCommission.isFulfilled ? 'success' : (selectedCommission.isStarted ? 'warning' : 'default')}
                      icon={selectedCommission.isFulfilled ? <CheckCircleIcon /> : (selectedCommission.isStarted ? <PlayArrowIcon /> : <HourglassEmptyIcon />)}
                    />
                  </Paper>

                  {(selectedCommission.intendedArtist == account) && (
                    <>
                      {!selectedCommission.isStarted && (
                        <Button
                          fullWidth
                          variant="contained"
                          size="large"
                          startIcon={<PlayArrowIcon />}
                          onClick={() => startCommission(selectedCommission.requestId)}
                          sx={{ background: gradients.primary, mb: 2 }}
                        >
                          Start Commission
                        </Button>
                      )}
                      {selectedCommission.isStarted && !selectedCommission.isFulfilled && (
                        <Box>
                          <Button
                            component="label"
                            variant="outlined"
                            fullWidth
                            startIcon={<CloudUploadIcon />}
                            sx={{ mb: 2 }}
                          >
                            Select Artwork
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(event) => setSelectedImage(event.target.files[0])}
                            />
                          </Button>
                          <Button
                            fullWidth
                            variant="contained"
                            size="large"
                            onClick={() => submitArtwork(selectedCommission.requestId, URL.createObjectURL(selectedImage))}
                            sx={{ background: gradients.success }}
                          >
                            Upload and Claim Bounty
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </GlassCard>
        )}
      </Container>
    </Box>
  );
};
export default App;
