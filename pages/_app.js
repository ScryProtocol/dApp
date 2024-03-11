import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './global.css';


// Replace with your contract ABI and contract address
const contractABI = [{ "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "bountyId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "claimer", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "privateKey", "type": "bytes32" }], "name": "BountyClaimed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "bountyId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "creator", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" }, { "indexed": false, "internalType": "bytes", "name": "publicKey", "type": "bytes" }, { "indexed": false, "internalType": "uint8", "name": "requiredScore", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "flag", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "locked", "type": "uint8" }], "name": "BountyCreated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "claimer", "type": "address" }, { "indexed": false, "internalType": "bytes32", "name": "privateKey", "type": "bytes32" }, { "indexed": false, "internalType": "bytes", "name": "publicKey", "type": "bytes" }, { "indexed": false, "internalType": "address", "name": "leaderAddress", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "rewardAmount", "type": "uint256" }], "name": "LeaderClaimed", "type": "event" }, { "inputs": [], "name": "AA", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "BB", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "Leader", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "LeaderAddr", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "LeaderPub", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "PP", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "Scry", "outputs": [{ "internalType": "contract IERC20", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "addr", "type": "address" }, { "internalType": "uint8", "name": "n", "type": "uint8" }], "name": "addressStartsWithNZeroes", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "bounties", "outputs": [{ "internalType": "uint8", "name": "score", "type": "uint8" }, { "internalType": "address payable", "name": "creator", "type": "address" }, { "internalType": "uint256", "name": "reward", "type": "uint256" }, { "internalType": "bytes", "name": "publicKey", "type": "bytes" }, { "internalType": "bytes32", "name": "privateKey", "type": "bytes32" }, { "internalType": "address", "name": "addrs", "type": "address" }, { "internalType": "uint8", "name": "flag", "type": "uint8" }, { "internalType": "bytes", "name": "custom", "type": "bytes" }, { "internalType": "uint8", "name": "locked", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "internalType": "bytes32", "name": "PK", "type": "bytes32" }], "name": "bounty", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "PK", "type": "bytes32" }], "name": "bountyLeader", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "bytesToHexString", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "bounty", "type": "uint256" }, { "internalType": "bytes32", "name": "PK", "type": "bytes32" }], "name": "checkCreate2", "outputs": [{ "internalType": "bytes20", "name": "addrBytes", "type": "bytes20" }, { "internalType": "uint256", "name": "score", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "pubkey", "type": "bytes" }, { "internalType": "bytes", "name": "custom", "type": "bytes" }, { "internalType": "uint8", "name": "nLeading0s", "type": "uint8" }, { "internalType": "uint8", "name": "flag", "type": "uint8" }, { "internalType": "uint8", "name": "locked", "type": "uint8" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "createBounty", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "PrivateKey", "type": "bytes32" }], "name": "derivePublicKey", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "bytes32", "name": "", "type": "bytes32" }, { "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeAddrs", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeControl", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_origin", "type": "address" }], "name": "getNonce0Address", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_origin", "type": "address" }], "name": "getNonce0AddressHex", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "pubKey", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "addrs", "type": "address" }, { "internalType": "uint256", "name": "addrT", "type": "uint256" }, { "internalType": "bytes", "name": "pubK", "type": "bytes" }], "name": "setAddrs", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "fullKey", "type": "bytes" }], "name": "splitKey", "outputs": [{ "internalType": "uint256", "name": "x", "type": "uint256" }, { "internalType": "uint256", "name": "y", "type": "uint256" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "bount", "type": "uint256" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "tipBounty", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "pubkey", "type": "bytes" }, { "internalType": "bytes", "name": "pubkey1", "type": "bytes" }, { "internalType": "bytes", "name": "pubkey2", "type": "bytes" }, { "internalType": "uint8", "name": "n", "type": "uint8" }, { "internalType": "bytes32", "name": "PK", "type": "bytes32" }, { "internalType": "uint8", "name": "flag", "type": "uint8" }], "name": "validate", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "pubkey", "type": "bytes" }, { "internalType": "uint8", "name": "flag", "type": "uint8" }], "name": "validatePubkey", "outputs": [{ "internalType": "address", "name": "wallet", "type": "address" }, { "internalType": "address", "name": "nonce0Addr", "type": "address" }, { "internalType": "uint256", "name": "score", "type": "uint256" }, { "internalType": "bytes20", "name": "addrs", "type": "bytes20" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "pubkey", "type": "bytes" }, { "internalType": "bytes", "name": "pubkey1", "type": "bytes" }, { "internalType": "bytes", "name": "pubkey2", "type": "bytes" }], "name": "validatePublicKeyAddition", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "bounty", "type": "uint256" }], "name": "withdrawBounty", "outputs": [], "stateMutability": "payable", "type": "function" }];
const contractAddress = '0x000000000001F04A9533e92d7AD4dDe7DC19a8F3';
const scryContractAddress = '0x64ba55a341ec586a4c5d58d6297cde5125ab55bc';

const scryContractABI = [
  // ... other contract functions ...
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address"
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool"
      }
    ],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address"
      },
      {
        internalType: "address",
        name: "spender",
        type: "address"
      }
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256"
      }
    ],
    stateMutability: "view",
    type: "function"
  }
  // ... other contract functions ...
];
function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [pubkey, setPubkey] = useState('');
  const [custom, setCustom] = useState('0x');
  const [nLeading0s, setNLeading0s] = useState('0');
  const [addressType, setAddressType] = useState(0);
  const [amount, setAmount] = useState('0');
  const [bountyId, setBountyId] = useState('0');
  const [bountyDetails, setBountyDetails] = useState(null);
  const [privateKey, setPrivateKey] = useState('');
  const [privateKeyB, setPrivateKeyB] = useState('');
  const [bountyreward, setbountyreward] = useState('0');
  const [bountyC, setbountyC] = useState('0');

  const [publicKey, setPublicKey] = useState('');
  const [ethereumAddress, setEthereumAddress] = useState('');
  const [recoveredPublicKey, setRecoveredPublicKey] = useState('');
  const [addedPrivateKey, setAddedPrivateKey] = useState('');
  const [addedAddress, setAddedAddress] = useState('');
  const [addedContractAddress, setAddedContractAddress] = useState('');
  const [bounties, setBounties] = useState([]);
  const [minedPrivateKey, setMinedPrivateKey] = useState('');
  const [bountyToSubmit, setBountyToSubmit] = useState(null);
  const [showMiningInstructions, setShowMiningInstructions] = useState(false);
    const [showModal, setShowModal] = useState(true);
    const [showMining, setShowMining] = useState(false);

  useEffect(() => {
    const initializeEthers = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          await provider.send('eth_requestAccounts', []);
          setProvider(provider);

          const signer = provider.getSigner();
          setSigner(signer);

          const contract = new ethers.Contract(contractAddress, contractABI, signer);
          setContract(contract);
          contract.on('BountyCreated', (bountyId, creator, reward, publicKey, requiredScore, flag, locked) => {
            console.log('Bounty created successfully with ID:', bountyId.toNumber());
            setBountyId(bountyId.toNumber());
          })
        } catch (error) {
          console.error('Error initializing Ethers:', error);
        }
      } else {
        console.error('No Ethereum provider detected');
      }
    };

    initializeEthers();
  }, []);

  const createBounty = async () => {
    if (contract && signer) {
      const scryContract = new ethers.Contract(scryContractAddress, scryContractABI, signer);
      const userAddress = await signer.getAddress();

      const approvedBalance = await scryContract.allowance(userAddress, contractAddress);
      console.log(approvedBalance);

      // Check if the approved balance is sufficient
      const bountyAmount = ethers.utils.parseEther(amount.toString());
      if (approvedBalance.lt(bountyAmount)) {
        // Approve the allowance if it's insufficient
        try {
          // Get the Scry contract instance

          // Get the user's address
          const userAddress = await signer.getAddress();

          // Calculate the amount to approve (e.g., MAX_UINT256)
          const approvalAmount = ethers.constants.MaxUint256;

          // Approve the allowance for the Vain contract
          const tx = await scryContract.approve(contractAddress, approvalAmount);
          await tx.wait();

          console.log('Allowance approved successfully');
        } catch (error) {
          console.error('Error approving allowance:', error);
        }
      }
      try {
        console.log(pubkey,
          custom,
          nLeading0s,
          addressType,
          0,
          ethers.utils.parseEther(amount.toString()));

        const tx = await contract.createBounty(
          pubkey,
          custom,
          nLeading0s,
          addressType,
          0,
          ethers.utils.parseEther(amount.toString())
        );
        await tx.wait();
        console.log('Bounty created successfully');

        contract.on('BountyCreated', (bountyId, creator, reward, publicKey, requiredScore, flag, locked) => {
          console.log('Bounty created successfully with ID:', bountyId.toNumber());
          setBountyId(bountyId.toNumber());

        });
      } catch (error) {
        console.error('Error creating bounty:', error);
      }
    } else {
      console.error('Contract or signer not initialized');
    }
  };

  const checkBountyStatus = async () => {
    if (contract) {
      try {
        const bounty = await contract.bounties(bountyId);
        const isFilled = bounty.reward.eq(0);
        console.log(`Bounty ${bountyId} is ${isFilled ? 'filled' : 'not filled'}`);
        setBountyDetails(bounty);
      } catch (error) {
        console.error('Error checking bounty status:', error);
      }
    } else {
      console.error('Contract not initialized');
    }
  };
  const generateKeyAndAddress = () => {
    const elliptic = require('elliptic').ec;
    const ec = new elliptic('secp256k1');
    const keyPair = ec.genKeyPair();

    const privateKey = keyPair.getPrivate().toString('hex');
    const publicKey = '0x' + keyPair.getPublic().encode('hex').substring(2);
    const ethereumAddress = '0x' + ethers.utils.keccak256(publicKey).slice(-40);

    setPrivateKey(privateKey);
    setPublicKey(publicKey);
    setEthereumAddress(ethereumAddress);
  };

  const addPrivateKeys = (privateKeyA, privateKeyB) => {
    const secp256k1N = BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141');
    const addedPrivateKey = (BigInt(`0x${privateKeyA}`) + BigInt(`0x${privateKeyB}`)) % secp256k1N;
    const addedPrivateKeyHex = addedPrivateKey.toString(16).padStart(64, '0').toUpperCase();

    const addedAddress = ethers.utils.computeAddress(`0x${addedPrivateKeyHex}`);
    const nonce = 0;
    const addedContractAddress = ethers.utils.getContractAddress({ from: addedAddress, nonce });

    setAddedPrivateKey(addedPrivateKeyHex);
    setAddedAddress(addedAddress);
    setAddedContractAddress(addedContractAddress);
  };

  const pubKey = () => {
    const recoveredPublicKey = ethers.utils.computePublicKey(`0x${privateKey}`);
    setRecoveredPublicKey(`0x${recoveredPublicKey.substring(4)}`);
  };

  const signMessage = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const message = "Hello, world!";
        const signature = await signer.signMessage(message);

        const messageBytes = ethers.utils.toUtf8Bytes(message);
        const messageDigest = ethers.utils.keccak256(messageBytes);
        const recoveredPublicKey = ethers.utils.recoverPublicKey(messageDigest, signature);
        setRecoveredPublicKey(`0x${recoveredPublicKey.substring(4)}`);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.log('Please install MetaMask!');
    }
  };

  const fetchUserBounties = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const vainContractAddress = '0x000000000001F04A9533e92d7AD4dDe7DC19a8F3';
    const vainContract = new ethers.Contract(vainContractAddress, contractABI, signer);

    const userAddress = await signer.getAddress();

    try {
      const bountyCount = Number(bountyC);

      const userBounties = [];

      for (let i = 1; i <= bountyCount; i++) {
        try {
          const bounty = await vainContract.bounties(i);
          if (bounty.reward.gte(ethers.utils.parseEther(bountyreward))) {
            userBounties.push({
              id: i,
              score: bounty.score,
              creator: bounty.creator,
              reward: ethers.utils.formatUnits(bounty.reward, 18),
              publicKey: ethers.utils.hexlify(bounty.publicKey),
              privateKey: ethers.utils.hexlify(bounty.privateKey),
              addrs: bounty.addrs,
              flag: bounty.flag,
              custom: ethers.utils.hexlify(bounty.custom),
              locked: bounty.locked,
              filled: bounty.privateKey !== '0x0000000000000000000000000000000000000000000000000000000000000000'
            });
          }
        } catch (error) {

        }
      }

      setBounties(userBounties);
    } catch (error) {
      console.error('Error fetching user bounties:', error);
    }
  };

  const MiningModal = () => {

    const handleCloseMiningModal = () => {
      setShowMining(false);
    };

    return (
      <div className={`welcome-modal ${showMining ? 'show' : ''}`}>
        <div className="modal-content">
          <span className="close" onClick={handleCloseMiningModal}>
          </span>
          <h2>Welcome to Vain!</h2>
          <p>
            Vain is an open marketplace for mining vanity ETH addresses securely
            using ECC offsets of public keys.
          </p> <div className="mining-instructions">
    <h4>Mining Instructions</h4>
    <ol>
      <li>
        <p>Look through bounties</p>
      </li>
      <li>
        <p>Mine for a vanity address using the following commands:</p>
        <p>
              Grab the miner:{' '}
              <a
                style={{
                  color: '#0ff',

                }}
                href="https://github.com/pr0toshi/profanity2/"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://github.com/pr0toshi/profanity2/
              </a>
            </p>
        <pre>
          <code>
            nvidia-smi<br />
            git clone https://github.com/pr0toshi/profanity2…<br />
            cd profanity2<br />
            apt-get update<br />
            apt-get install opencl-headers<br />
            find /usr/ -name *<br />
            ln -s /usr/local/cuda-11.8/targets/x86\_64-linux/lib/libOpenCL.so /usr/lib/libOpenCL.so<br />
            ldconfig<br />
            mkdir -p /etc/OpenCL/vendors/<br />
            echo "/usr/lib/x86\_64-linux-gnu/libnvidia-opencl.so.1" | tee /etc/OpenCL/vendors/nvidia.icd<br />
            chmod +x ./profanity.x64<br />
            chmod +x ./lol.sh<br />
            <br />
            For flag 0: ./profanity.x64 --leading 0 -z TargetPubKey<br />
            For flag 1: ./profanity.x64 --contract --leading 0 -z TargetPubKey<br />
            For flag 3: ./profanity.x64 --matching BOUNTYCUSTOMNO0x -z TargetPubKey<br />
            For flag 4: ./profanity.x64 --contract --matching BOUNTYCUSTOMNO0x -z TargetPubKey<br />
<br />
            Mining will start
          </code>
        </pre>
      </li>
      <li>
        <p>Find addresses and private keys in output.txt</p>
        <pre>
          <code>cat output.txt</code>
        </pre>
      </li>
      <li>
        <p>Submit</p>
        <pre>
          <code>
            PK (bytes32) Mined private key without 0x
          </code>
        </pre>
      </li>
      <li>
        <p>Profit!</p>
      </li>
          
          </ol>
          <button className="btn btn-primary" onClick={handleCloseMiningModal}>
            Got it!
          </button>        </div>

        </div>
      </div>
    );
  };
  const WelcomeModal = () => {

    const handleCloseModal = () => {
      setShowModal(false);
    };

    return (
      <div className={`welcome-modal ${showModal ? 'show' : ''}`}>
        <div className="modal-content">
          <span className="close" onClick={handleCloseModal}>
          </span>
          <h2>Welcome to Vain!</h2>
          <p>
            Vain is an open marketplace for mining vanity ETH addresses securely
            using ECC offsets of public keys.
          </p>
          <h3>How to Use Vain:</h3>
          <ol>
            <li>
              <strong>Recover Public Key</strong>: Click "Sign Message" to recover
              your public key from a signed message from your own address.
              <br /><strong>Generate Keys and Addresses</strong>: Click the "Generate
              Address" button to generate a new private key, public key, and
              Ethereum address.
            </li>
            <li>
              <strong>Create Bounty</strong>: Enter your public key, select the
              desired address type (EOA, contract, or create2) and the number of
              leading zeros or custom prefix you want for your vanity address.
              Specify the bounty amount in SCRY tokens and click "Create Bounty".
            </li>
            <li>
              <strong>Check Bounty Status</strong>: Enter the bounty ID and click
              "Check Bounty" to view the details of the bounty, including its
              status (filled or not filled). <strong>Keep this ID.</strong>
            </li>
            <li>
              <strong>Private Key Adder</strong>: Add your private key and the
              Vain private key to generate a new private key and corresponding
              address and contract address.
            </li>
            <li>
              <strong>Bounties</strong>: View a list of bounties filtered by
              minimum bounty reward and bounty count.
            </li>
            <p>
              For a deeper dive into secure vanity address generation using ECC
              offsets, check out this tweet:{' '}
              <a
                style={{
                  color: '#0ff',

                }}
                href="https://twitter.com/not\_pr0/status/1710992292838850591"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://twitter.com/not\_pr0/status/1710992292838850591
              </a>
            </p>
            <p>
              For Miners:{' '}
              <a
                style={{
                  color: '#0ff',

                }}
                href="https://twitter.com/not\_pr0/status/1710992292838850591"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://twitter.com/not\_pr0/status/1710992292838850591
              </a>
            </p>
          </ol>
          <button className="btn btn-primary" onClick={handleCloseModal}>
            Got it!
          </button>
        </div>
      </div>
    );
  };
  const handleSubmitMining = async () => {
    if (contract && signer && bountyToSubmit && minedPrivateKey) {
      try {
        const tx = await contract.bounty(
          bountyToSubmit.id,
          '0x' + minedPrivateKey,
          { value: 0 }
        );
        await tx.wait();
        console.log('Mined private key submitted successfully');
      } catch (error) {
        console.error('Error submitting mined private key:', error);
      }
    } else {
      console.error('Missing required data for submission');
    }
  };

  const toggleMiningInstructions = () => {
    setShowMiningInstructions(!showMiningInstructions);
  };const toggleMining = () => {
    setShowMining(!showMining);
  };
  return (
    <div className="app">
      <header className="app-header">
        <h1>Vain dApp</h1>
      </header>
      <main className="app-main">
        <WelcomeModal />
        <MiningModal /><div className="form-container">
          <h2>Create Bounty</h2>
          <div className="form-group">
            <label htmlFor="pubkey">Public Key</label>
            <input
              type="text"
              id="pubkey"
              value={pubkey}
              onChange={(e) => setPubkey(e.target.value)}
              className="form-control"
              placeholder="Enter your public key"
            />
          </div><div className="form-group">
            <label htmlFor="addressType">Address Type</label>
            <select
              id="addressType"
              value={addressType}
              onChange={(e) => {
                setAddressType(parseInt(e.target.value));
                if (e.target.value === '0' || e.target.value === '1' || e.target.value === '2') {
                  setCustom('0x');
                  setNLeading0s('0');
                } else if (e.target.value === '3' || e.target.value === '4' || e.target.value === '5') {
                  setNLeading0s('0');
                  setCustom('0x');

                }
              }}
              className="form-control"
            >
              <option value={0}>User Wallet EOA with n leading 0s</option>
              <option value={1}>Contract with n leading 0s</option>
              <option value={2}>Create2 Contract with n leading 0s</option>
              <option value={3}>User Wallet EOA with custom prefix</option>
              <option value={4}>Contract with custom prefix</option>
              <option value={5}>Create2 Contract with custom prefix</option>
            </select>
          </div>

          {addressType === 0 || addressType === 1 || addressType === 2 ? (
            <div className="form-group">
              <label htmlFor="nLeading0s">Number of Leading 0s</label>
              <input
                type="number"
                id="nLeading0s"
                value={nLeading0s}
                onChange={(e) => setNLeading0s(e.target.value)}
                className="form-control"
                placeholder="Enter number of leading 0s"
              />
            </div>
          ) : null}

          {addressType === 3 || addressType === 4 || addressType === 5 ? (
            <div className="form-group">
              <label htmlFor="custom">Custom Prefix</label>
              <input
                type="text"
                id="custom"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="form-control"
                placeholder="Enter custom prefix"
              />
            </div>
          ) : null}
          <div className="form-group">
            <label htmlFor="amount">Bounty Amount (SCRY)</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="form-control"
              placeholder="Enter bounty amount"
            />
          </div>
          <button onClick={createBounty} className="btn btn-primary">
            Create Bounty
          </button>
          <div className="form-group">
            <label htmlFor="amount">Enter bounty Id</label>

            <input
              type="number"
              id="bountyId"
              value={bountyId}
              onChange={(e) => setBountyId(e.target.value)}
              className="form-control"
              placeholder="Enter bounty Id"
            />
            <button onClick={checkBountyStatus} className="btn btn-primary">
              Check Bounty
            </button>        </div>

          <div className="bounty-status">
            <h2>Bounty Details</h2>
            {bountyDetails ? (
              <div>
                <p>Bounty ID: {bountyId}</p>
                <p>Score: {bountyDetails.score}</p>
                <p>Creator: {bountyDetails.creator}</p>
                <p>Reward: {ethers.utils.formatEther(bountyDetails.reward)} SCRY</p>
                <p>Status: {bountyDetails.reward.eq(0) ? 'Filled' : 'Not Filled'}</p>

                <p>Public Key: {ethers.utils.hexlify(bountyDetails.publicKey)}</p>
                <p>Private Key: {ethers.utils.hexlify(bountyDetails.privateKey)}</p>
                <p>Address: {bountyDetails.addrs}</p>
                <p>Flag: {bountyDetails.flag}</p>
                <p>Custom: {ethers.utils.hexlify(bountyDetails.custom)}</p>
                <p>Locked: {bountyDetails.locked}</p>
              </div>
            ) : (
              <p>No bounty details available</p>
            )}
          </div> </div>
        <div className="form-container">
          <h2>Generate Keys and Addresses</h2>
          <button onClick={generateKeyAndAddress} className="btn btn-primary">
            Generate Address
          </button>
          <p>Private Key: {privateKey}</p>
          <p>Public Key: {publicKey}</p>
          <p>Ethereum Address: {ethereumAddress}</p>

          <br />
          <label htmlFor="privateKey">Your Private Key:</label>
          <input
            type="text"
            id="privateKey"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="form-control"
          />
          <button onClick={pubKey} className="btn btn-primary">
            Get Public Key
          </button>
          <br />

          <h2>Recover Public Key</h2>
          <button onClick={signMessage} className="btn btn-primary">
            Sign Message
          </button>
          <p>Recovered Public Key: {recoveredPublicKey}</p>
          <h2>Private Key Adder</h2>
          <label htmlFor="privateKeyA">Your Private Key:</label>
          <input
            type="text"
            id="privateKeyA"
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="form-control"
          />
          <br />
          <label htmlFor="privateKeyB">Vain Private Key:</label>
          <input
            type="text"
            id="privateKeyB"
            value={privateKeyB}
            onChange={(e) => setPrivateKeyB(e.target.value)}
            className="form-control"
          />
          <br />
          <button
            onClick={() => addPrivateKeys(privateKey, privateKeyB)}
            className="btn btn-primary"
          >
            Add Private Keys
          </button>
          <p>Added Private Key: {addedPrivateKey}</p>
          <p>Address: {addedAddress}</p>
          <p>Contract Address: {addedContractAddress}</p>
        </div>
      </main><br />
      <div className="bounties-section">
        <h2 className="section-title">Bounties</h2>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="bountyReward" className="filter-label">
              Min Bounty Reward
            </label>
            <input
              type="number"
              id="bountyReward"
              value={bountyreward}
              onChange={(e) => setbountyreward(e.target.value)}
              className="filter-input"
              placeholder="Enter minimum bounty reward"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="bountyCount" className="filter-label">
              Bounty Count
            </label>
            <input
              type="number"
              id="bountyCount"
              value={bountyC}
              onChange={(e) => setbountyC(e.target.value)}
              className="filter-input"
              placeholder="Enter bounty count"
            />
          </div>
          <button onClick={() => fetchUserBounties()} className="fetch-button">
            Fetch Bounties
          </button>
          <button
                    
                    onClick={toggleMiningInstructions} className="btn btn-primary"
                  >
                    {showMiningInstructions ? 'Hide Mining Instructions' : 'Show Mining Instructions'}
                  </button>
                  <button
                    
                    onClick={toggleMining} className="btn btn-primary"
                  >
                    {showMiningInstructions ? 'Hide Mining Instructions' : 'Show Mining Instructions'}
                  </button>
        </div>
        <ul className="bounties-list">
          {bounties.map((bounty) => (
            <li key={bounty.id} className="bounty-item">
              <div className="bounty-header">
                <h3 className="bounty-title">Bounty ID: {bounty.id}</h3>
                <span className={`bounty-status ${bounty.filled ? 'filled' : 'open'}`}>
                  {bounty.filled ? 'Filled' : 'Open'}
                </span>
              </div>
              <div className="bounty-details">
                <div className="detail-column">
                  <p className="detail-item">
                    <span className="detail-label">Score:</span> {bounty.score}
                  </p>
                  <p className="detail-item">
                    <span className="detail-label">Creator:</span> {bounty.creator}
                  </p>
                  <p className="detail-item">
                    <span className="detail-label">Reward:</span> {bounty.reward} SCRY
                  </p>
                  <p className="detail-item">
                    <span className="detail-label">Public Key:</span> {bounty.publicKey}
                  </p>
                  <p className="detail-item">
                    <span className="detail-label">Private Key:</span> {bounty.privateKey}
                  </p>
                  <p className="detail-item">
                    <span className="detail-label">Filled by:</span> {bounty.addrs}
                  </p>
                  <p className="detail-item">
                    <span className="detail-label">Flag:</span> {bounty.flag}
                  </p>
                  <p className="detail-item">
                    <span className="detail-label">Custom:</span> {bounty.custom}
                  </p>
                  <p className="detail-item">
                    <span className="detail-label">Locked:</span> {bounty.locked}
                  </p>
                </div>
                {showMiningInstructions && (
                  <div className="mining-instructions">
                    <h4>Submit Mined Private Key</h4>
                    {/* ... existing mining instructions ... */}
                    <div className="mining-submission">
                      <div className="form-group">
                        <label htmlFor="minedPrivateKey">Mined Private Key</label>
                        <input
                          type="text"
                          id="minedPrivateKey"
                          value={minedPrivateKey}
                          onChange={(e) => setMinedPrivateKey(e.target.value)}
                          className="form-control"
                          placeholder="Enter mined private key"
                        />
                      </div>
                      <button
                        onClick={() => {
                          setBountyToSubmit(bounty);
                          handleSubmitMining();
                        }}
                        className="btn btn-primary"
                      >
                        Submit
                      </button>
                    </div>
                  </div>  )}</div>
          </li>
          ))}
        </ul>
      </div>
    </div>

  );
}

export default App;