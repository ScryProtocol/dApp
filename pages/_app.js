import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './global.css';
const FormData = require('form-data')
import axios from 'axios';
import { Toaster, toast } from 'react-hot-toast';

const tokenaddress = '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14'
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

    window.ethereum.on('accountsChanged', handleaccountsChanged);

    const initEthers = async () => {
      if (window.ethereum) {
        const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
        setProvider(providerInstance);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const signer = providerInstance.getSigner();
          const address = await signer.getAddress();
          setAccount(address);
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
        console.error('Ethereum not detected');
        
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
    
    if (artist&&contract) {
      fetchArtistProfile(artist);
      setShowModal(true);
    }
  
    function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    console.log(params.get('artist'))
    return {
      artist: params.get('artist')
    };
    }}// Other initialization code...
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
      setSelectedArtist(artistAddress );
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
  const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    const handleClickOutside = (event) => {
      if (event.target.classList.contains('modal-overlay')) {
        setShowModal(false); // Call the function to close the modal
        console.log('lol')
      }    };
    return (
      <div className="modal-overlay" style={{
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }} onClick={handleClickOutside}>
        <div className="modal" style={{
          position: 'fixed',
          width: '100%',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000, overflow: 'scroll'
        }}>
          {children}
        </div>
      </div>
    );
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
      <section id="artist-profile" className="artist-profile">
        <div className="card artist-card">
          <div className="artist-info" >
            <img
              className="profile-picture"
              src={
                profilePicture
                  ? `https://ipfs.io/ipfs/${profilePicture}`
                  : (
                    artistProfile.profilePictureIPFSHash
                      ? `https://ipfs.io/ipfs/${artistProfile.profilePictureIPFSHash}`
                      : 'https://cdn.discordapp.com/attachments/810019961165578294/1224489258027319427/image.png?ex=661dad7d&is=660b387d&hm=3f39b216ea2152d1b967f4cc1aa2c3a31fc61ca8b981f726a8a8ea7b1bdb1348&'
                  )}
              alt="Artist"
              style={{
                width: '250px',
                height: '250px',
                borderRadius: '8px',
              }}
            />            <h2 style={{ color: '#e91e63' }}>{artistProfile.name?artistProfile.name:'Artist'}</h2>

            <h3 >{artistProfile.bio}</h3>
            <p >Address: {selectedArtist}</p>
          </div> {
                  <div className="artist-info" style={{ alignItems: 'center'}}>
                  {selectedArtist==account&&(<button style={{ alignSelf: 'center', }
          } onClick={() => { setcomm(!comms) }}>Update Info</button>
          )}
           <button style={{ marginLeft: '10px', alignSelf: 'center', }
              } onClick={() => { toast.success('Copied :)');navigator.clipboard.writeText('https://kaku.art/?artist=' + selectedArtist) }}>copy link</button>
          <button style={{ marginLeft:'10px', alignSelf: 'center', }
        } onClick={() => { setShowModal(false) }}>close</button>
          </div>
}        {comms == 1 && (

            <div>
              <form onSubmit={handleSubmit}>
                <label>
                  Name:        </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label>
                  Bio:        </label>

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                ></textarea>
                <label>
                  Profile Picture:        </label>

                <input
                  type="file"
                  onChange={handleFileChange}
                />
                <button type="submit">Update Profile</button>
              </form>
            </div>)}
            
          <form style={{marginTop:'10px'}} onSubmit={requestCommission}>
            <h2 style={{ color: '#e91e63' }}>Commission</h2>

            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>

            <label htmlFor="bounty">Bounty:</label>
            <input
              type="number"
              id="bounty"
              value={bounty}
              onChange={(e) => setBounty(e.target.value)}
              required
            />

            <label htmlFor="payment-type">Payment Type:</label>
            <select
              id="payment-type"
              value={paymentType}
              onChange={(e) => setPaymentType(e.target.value)}
            >
              <option value="eth">ETH</option>
              <option value="token">Token</option>
            </select>

            <button type="submit">Request Commission</button>
          </form>
          <section id="commission-list">

            <div className="artist-commissions">
              <section id="commission-list">
                <h2 style={{ color: '#e91e63' }}>Commissions</h2>
                <ul id="commissions">
                  {commissions.map((commission) => (
                    <li key={commission.requestId.toString()} className="commission-item">
                      <h3>Commission {commission.requestId.toString()}</h3>
                      <p>
                        <strong>Artist:</strong> {commission.intendedArtist}
                      </p>
                      <p>
                        <strong>Description:</strong> {commission.description}
                      </p>
                      <p>
                        <strong>Bounty:</strong> {ethers.utils.formatEther(commission.bounty)} {commission.isETH ? 'ETH' : 'KAKU'}
                      </p>
                      <p>
                        <strong>Status:</strong>   {commission.isFulfilled ? 'Fulfilled' : (commission.isStarted ? 'Started' : 'Waiting')}
                      </p>
                      <button onClick={() => { setSelectedCommission(commission); console.log(selectedCommission) ;setShowModal(false)}}>View Details</button>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="artist-commissions">
                <section id="commission-list">
                  <h2 style={{ color: '#e91e63' }}>Commission Requests</h2>
                  <ul id="commissions">
                    {profileCommissions.map((commission) => (
                      <li key={commission.requestId.toString()} className="commission-item">
                        <h3>Commission {commission.requestId.toString()}</h3>
                        <p>
                          <strong>Artist:</strong> {commission.intendedArtist}
                        </p>
                        <p>
                          <strong>Description:</strong> {commission.description}
                        </p>
                        <p>
                          <strong>Bounty:</strong> {ethers.utils.formatEther(commission.bounty)} {commission.isETH ? 'ETH' : 'KAKU'}
                        </p>
                        <p>
                          <strong>Status:</strong>   {commission.isFulfilled ? 'Fulfilled' : (commission.isStarted ? 'Started' : 'Waiting')}
                        </p>
                        <button onClick={() => { setSelectedCommission(commission); console.log(selectedCommission);setShowModal(false) }}>View Details</button>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </section>     </div>
      </section>)
  };

  return (
    <div className="app">
      <main className="app-main"><button style={{position:'absolute',top:'10px',left:'10px'}} onClick={() => {
                      fetchArtistProfile(account);
                    }}>View My Profile</button> <Modal isOpen={showModal} onClose={toggleModal}>
        {selectedArtist && (

          <ArtistProfile
            artist={selectedArtist}
          />
        )}
      </Modal>
        <h1 style={{ color: '#e91e63', textAlign: 'center', paddingBottom: '40px' }}>
          <img
            style={{
              maxWidth: '64px',
              position: 'absolute',
              top: '10px',
              right: '10px',
              borderRadius: '8px',

            }}
            src={'./lol.png'}
            alt="Selected NFT Image"
          /><a href='https://discord.gg/W87Rw6wtk2'>
            <img
              style={{
                maxWidth: '50px',
                position: 'absolute',
                top: '16px',
                right: '80px',
                borderRadius: '8px',

              }}
              src={'./discord.png'}
              alt="Selected NFT Image"
            /></a><a href='https://twitter.com/kakudotart/'><img
              style={{
                maxWidth: '50px',
                position: 'absolute',
                top: '16px',
                right: '140px',
                borderRadius: '8px',

              }}
              src={'./twitter.png'}
              alt="Selected NFT Image"
            /></a>


          Kaku Art Commission
        </h1>
        <body>
          <section id="commission-form"><Toaster />
            <form onSubmit={requestCommission}>
              <h2 style={{ color: '#e91e63', textAlign: 'center', margin: '0px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ color: '#e91e63' }}>
                    KAKU Balance: {kakuBalance}
                  </span>

                  <a
                    style={{ color: '#ffb7cf', alignSelf: 'flex-end', position: 'relative', bottom: '28px', }}
                    href="https://app.uniswap.org/swap?inputCurrency=ETH&outputCurrency=0x64ba55A341EC586A4aC5d58d6297CdE5125aB55bC&chain=base"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Buy KAKU
                  </a>
                </div>
              </h2>
              <h2>Request a Commission</h2>
              <label htmlFor="artist">Intended Artist Address:</label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
              />
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
              <label htmlFor="bounty">Bounty:</label>
              <input
                type="number"
                id="bounty"
                name="bounty"
                step="0.01"
                value={bounty}
                onChange={(e) => setBounty(e.target.value)}
                required
              />
              <label htmlFor="payment-type">Payment Type:</label>
              <select
                id="payment-type"
                name="payment-type"
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="eth">ETH (5% fee)</option>
                <option value="token">KAKU</option>
              </select>
              <button type="submit">Request Commission</button>
            </form>
          </section>
          <section id="commission-list">
            <h2 style={{ color: '#e91e63' }}>Commissions</h2>
            <ul id="commissions">
              {commissions.map((commission) => (
                <li key={commission.requestId.toString()} className="commission-item">
                  <h3>Commission {commission.requestId.toString()}</h3>
                  <p>
                    <strong>Artist:</strong> {commission.intendedArtist}
                  </p>
                  <p>
                    <strong>Description:</strong> {commission.description}
                  </p>
                  <p>
                    <strong>Bounty:</strong> {ethers.utils.formatEther(commission.bounty)} {commission.isETH ? 'ETH' : 'KAKU'}
                  </p>
                  <p>
                    <strong>Status:</strong>   {commission.isFulfilled ? 'Fulfilled' : (commission.isStarted ? 'Started' : 'Waiting')}
                  </p>
                  <button onClick={() => { setSelectedCommission(commission); console.log(selectedCommission) }}>View Details</button>
                </li>
              ))}
            </ul>
          </section>
          <section id="commission-list">
            <h2 style={{ color: '#e91e63' }}>My Bounties</h2>
            <ul id="commissions">
              {myBounties.map((bounty) => (
                <li key={bounty.requestId.toString()} className="commission-item">
                  <h3>Commission {bounty.requestId.toString()}</h3>
                  <p>
                    <strong>Artist:</strong> {bounty.intendedArtist}
                  </p>
                  <p>
                    <strong>Description:</strong> {bounty.description}
                  </p>
                  <p>
                    <strong>Bounty:</strong> {ethers.utils.formatEther(bounty.bounty)} {bounty.isETH ? 'ETH' : 'KAKU'}
                  </p>
                  <p>
                    <strong>Status:</strong>   {bounty.isFulfilled ? 'Fulfilled' : (bounty.isStarted ? 'Started' : 'Waiting')}

                  </p>
                  <button onClick={() => { setSelectedCommission(bounty); console.log(selectedCommission) }}>View Details</button>

                </li>
              ))}
            </ul>
            <button
              className="claim-button"
              onClick={() => { fetchMyBounties(); fetchCommissions() }}
            >
              My Bounties
            </button> <button
              className="claim-button"
              onClick={() => { fetchAllCommissions() }}
            >
              Check All Bounties
            </button>
          </section>
          {selectedCommission && (
            <section id="nft-bounty-details">

              <div className="card" style={{ padding: '42px' }}>
                <div className="nft-viewer">
                  <div className="nft-image">
                    {selectedImage ? (
                      <img
                        style={{
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                        }}
                        src={selectedImage instanceof File ? URL.createObjectURL(selectedImage) : selectedImage}
                        alt="Selected NFT Image"
                      />
                    ) : (
                      <img
                        style={{
                          maxWidth: '400px',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                        }}
                        src={
                          selectedCommission.IPFS
                            ? `https://ipfs.io/ipfs/${selectedCommission.IPFS}`
                            : 'https://cdn.discordapp.com/attachments/810019961165578294/1224489258027319427/image.png?ex=661dad7d&is=660b387d&hm=3f39b216ea2152d1b967f4cc1aa2c3a31fc61ca8b981f726a8a8ea7b1bdb1348&'
                        }
                        alt="NFT Image"
                      />
                    )}                 {selectedCommission.IPFS && (
                      <button style={{ marginTop: '5px' }}
                        className="claim-button"
                        onClick={() => {
                          if (selectedCommission && selectedCommission.IPFS) {
                            const imageUrl = `https://ipfs.io/ipfs/${selectedCommission.IPFS}`;
                            const link = document.createElement('a');
                            link.href = imageUrl;
                            link.download = 'nft-image'; // You can specify the desired filename
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          } else {
                            console.log('No image available to save.');
                          }
                        }}
                      >
                        Save</button>)}
                  </div>
                  <div className="nft-details">
                    <h2>Kaku #{selectedCommission.requestId.toString()}</h2>
                    <p>
                      <strong>Artist:</strong> {selectedCommission.intendedArtist}
                    </p>   <button onClick={() => {
                      fetchArtistProfile(selectedCommission.intendedArtist);
                    }}>View Artist Profile</button>
                    <p>
                      <strong>Description:</strong> {selectedCommission.description}
                    </p>
                    <p>
                      <strong>Commissioner Address:</strong> {selectedCommission.commissioner}
                    </p>
                    <h2>Bounty Details</h2>
                    <div className="bounty-info">
                      <p>
                        <strong>Bounty Amount:</strong>
                      </p>
                      <p>
                        {selectedCommission.isETH
                          ? `${ethers.utils.formatEther(selectedCommission.bounty)} ETH`
                          : `${ethers.utils.formatEther(selectedCommission.bounty)} KAKU`}
                      </p>
                      <p>
                        <strong>Bounty Status:</strong>   {selectedCommission.isFulfilled ? 'Fulfilled' : (selectedCommission.isStarted ? 'Started' : 'Waiting')}

                      </p>
                    </div>
                    {(selectedCommission.intendedArtist == account) && (
                      <>{!selectedCommission.isStarted && (
                        <button className="claim-button" onClick={() => startCommission(selectedCommission.requestId)}>
                          Start
                        </button>
                      )}
                        {selectedCommission.isStarted && !selectedCommission.isFulfilled && (
                          <div>

                            <input type="file" accept="image/*" onChange={(event) => setSelectedImage(event.target.files[0])}
                            />

                            <button style={{ marginTop: '5px' }}
                              className="claim-button"
                              onClick={() => submitArtwork(selectedCommission.requestId, URL.createObjectURL(selectedImage))}
                            >
                              Upload and Claim Bounty
                            </button>          </div>

                        )}</>)}
                  </div>
                </div>
              </div>
            </section>
          )}
        </body>
      </main>
    </div>
  );
};
export default App;