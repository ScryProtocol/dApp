// src/App.js

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { useEthersProvider, useEthersSigner } from './tl'; // Ensure these hooks are correctly defined
import { Alchemy, Network } from 'alchemy-sdk';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import DiffViewer from 'react-diff-viewer';
import ReactMarkdown from 'react-markdown';

import { http, createConfig } from '@wagmi/core';
import { base, holesky, mainnet, optimism, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { useCapabilities,useWriteContracts } from 'wagmi/experimental'

const config = getDefaultConfig({
  chains: [mainnet, sepolia, holesky, base, optimism],
  projectId: '97d417268e5bd5a42151f0329e544898',

  transports: {
    [mainnet.id]: http(),
    [holesky.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [mainnet.id]: http(),
  },
});

// Define your contract address and ABI
const CONTRACT_ADDRESS = '0x00da7a00A10161407DF57Ab3C82Dc20849FB00cb'; // Replace with your contract address

const SourceABI = [
  // ... [Your existing ABI remains unchanged]
  // ERC20 Functions
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function decimals() external view returns (uint8)",
  "function totalSupply() external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function allowance(address owner, address spender) external view returns (uint256)",

  // ERC20 Token Transfer Functions
  "function transfer(address recipient, uint256 amount) external returns (bool)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",

  // AccessControl Functions
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function getRoleAdmin(bytes32 role) external view returns (bytes32)",
  "function grantRole(bytes32 role, address account) external",
  "function revokeRole(bytes32 role, address account) external",
  "function renounceRole(bytes32 role, address account) external",

  // Custom Functions
  "function buyTokens(uint256 amount) external payable",
  "function withdraw() external",
  "function stake(uint256 amount) external",
  "function requestUnstake(uint256 amount) external",
  "function unstake() external",
  "function setStakingAmount(uint256 newAmount) external",
  "function slash(address user, uint256 amount,string memory reason) external",
  "function tip(uint256 amount) external",
  "function claimReward() external",
  "function grantEditRole(address user) external",
  "function revokeEditRole(address user) external",
  "function createPage(string calldata title, string calldata content) external",
  "function editPage(string calldata title, string calldata content) external",
  "function getPage(string calldata title) external view returns (string memory, address[] memory, uint256[] memory)",
  "function getLatestPages(uint256 count) external view returns (string[] memory)",

  // Public Variables (Getters)
  "function stakingAmount() external view returns (uint256)",
  "function stakedBalances(address) external view returns (uint256 amount, uint256 unstakeTimestamp, uint256 unstakedBalances)",
  "function totalTips() external view returns (uint256)",
  "function claimed(address) external view returns (uint256)",
  "function rewards(address) external view returns (uint256)",
  "function pages(string) external view returns (string title, string content, address[] editors, uint256[] timestamps)",
  "function pageExists(string) external view returns (bool)",

  // Events
  "event Staked(address indexed user, uint256 amount)",
  "event UnstakeRequested(address indexed user, uint256 amount, uint256 unstakeTime)",
  "event Unstaked(address indexed user, uint256 amount)",
  "event Slashed(address indexed user, uint256 amount)",
  "event TipReceived(address indexed user, uint256 amount)",
  "event RewardClaimed(address indexed user, uint256 amount)",
  "event PageCreated(string indexed title, address indexed creator)",
  "event PageEdited(string indexed title, address indexed editor)",

  // ERC20 Events
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",

  // AccessControl Events
  "event RoleAdminChanged(bytes32 indexed role, bytes32 indexed previousAdminRole, bytes32 indexed newAdminRole)",
  "event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender)",
  "event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender)"
];

const App = () => {
  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);

  // Handle Dark Mode Toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // On initial load, check for saved theme preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Hooks for Ethereum interaction
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const account = useAccount().address;
  const chainId = useChainId();

  // State variables
  const [contract, setContract] = useState(null);
  const [network, setNetwork] = useState('');
  const [balance, setBalance] = useState(0);
  const [staked, setStaked] = useState({ amount: 0, unstakeTimestamp: 0, unstakedBalances: 0 });

  // UI State
  const [currentSection, setCurrentSection] = useState('wiki'); // 'wiki', 'dashboard', 'buy', 'stake', etc.

  // Buy Tokens
  const [buyAmount, setBuyAmount] = useState('');
  const [buyStatus, setBuyStatus] = useState('');

  // Stake Tokens
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeStatus, setStakeStatus] = useState('');
  const [rewards, setRewards] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);

  // Unstake Tokens
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [unstakeStatus, setUnstakeStatus] = useState('');
  const [unstakeRequested, setUnstakeRequested] = useState(false);
  const [unstakeTime, setUnstakeTime] = useState(null);

  // Tip DAO
  const [tipAmount, setTipAmount] = useState('');
  const [tipStatus, setTipStatus] = useState('');

  // Claim Rewards
  const [claimStatus, setClaimStatus] = useState('');

  // Wiki Management
  const [pageTitle, setPageTitle] = useState('');
  const [pageContent, setPageContent] = useState('');
  const [wikiStatus, setWikiStatus] = useState('');
  const [wikiViewTitle, setWikiViewTitle] = useState('');
  const [wikiViewContent, setWikiViewContent] = useState('');
  const [wikiEditors, setWikiEditors] = useState([]);
  const [wikiTimestamps, setWikiTimestamps] = useState([]);
  const [wikiPages, setWikiPages] = useState([]);
  const [wikiSearch, setWikiSearch] = useState('');

  // Role Management
  const [newEditor, setNewEditor] = useState('');
  const [roleStatus, setRoleStatus] = useState('');

  // Admin functionalities
  const [isMaint, setIsMaint] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStatus, setWithdrawStatus] = useState('');
  const [slashUser, setSlashUser] = useState('');
  const [slashAmount, setSlashAmount] = useState('');
  const [slashStatus, setSlashStatus] = useState('');

  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: () => viewPage(wikiViewTitle) },
  });
  const { data: capabilities } = useCapabilities();
  // Initialize Ethers.js and Contract
  useEffect(() => {
    const init = async () => {
    async function w() {
    if (window.location.hash) {
    let hash = window.location.hash; 
    async function wait(ms) {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }
    await wait(3000)
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView();
      }
    }}
    w();
    async function w() {
    if (window.location.hash) {
    let hash = window.location.hash; 
    async function wait(ms) {
      return new Promise(resolve => {
        setTimeout(resolve, ms);
      });
    }
    await wait(3000)
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView();
      }
    }}
    w();
      if (provider && account) {
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, SourceABI, signer);
        console.log(tempContract);
        setContract(tempContract);
        setPageTitle('home');
        setWikiViewTitle('home');
        const page = await tempContract.connect(provider).getPage('home');
        setWikiViewContent(page[0]);
        console.log('page', page);
        let editors = [...page[1]].reverse();
        let timestamps = [...page[2]].reverse();
        setWikiEditors(editors);
        setWikiTimestamps(timestamps);
        if (window.location.search.includes('@')) {
          console.log("Found '@' in the query string.");
          // Extract the part after the @ character
          const params = new URLSearchParams(window.location.search);
          const query = params.toString();
          const atIndex = query.indexOf('@');
          const pageParam = query.substring(atIndex + 1).split('=')[1].replaceAll('+', ' ');
          console.log("Page parameter found after '@':", pageParam);
          if (pageParam) {
            setWikiViewTitle(pageParam);
            viewPage(pageParam);
          } else {
            console.error("Page parameter is missing after '@'.");
          }
        } else {
          console.log("No '@' found in the query string.");
        }

        // Fetch network
        const tempNetwork = await provider.getNetwork();
        setNetwork(tempNetwork.name);

        // Fetch user balance
        const userBalance = await tempContract.balanceOf(account);
        setBalance(Number(ethers.formatEther(userBalance)));

        // Fetch staked balance
        const stakedInfo = await tempContract.stakedBalances(account);
        setStaked({
          amount: Number(ethers.formatEther(stakedInfo.amount)),
          unstakeTimestamp: stakedInfo.unstakeTimestamp,
          unstakedBalances: Number(ethers.formatEther(stakedInfo.unstakedBalances))
        });

        let claimed = Number(ethers.formatEther(await tempContract.claimed(account)));
        let stakedAmount = Number(ethers.formatEther(stakedInfo.amount));
        let totalSupplyValue = Number(ethers.formatEther(await tempContract.totalSupply()));
        let totalTipsValue = Number(ethers.formatEther(await tempContract.totalTips()));
        let balanceValue = Number(ethers.formatEther(userBalance));
        console.log('totalSupply', totalSupplyValue, 'totalTips', totalTipsValue, 'balance', balanceValue, 'staked', stakedAmount);

        let calculatedRewards = (totalTipsValue - claimed) * (balanceValue + stakedAmount) / totalSupplyValue + Number(ethers.formatEther(await tempContract.rewards(account)));
        setRewards(calculatedRewards);

        // Check if user has MAINT_ROLE
        const MAINT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MAINT_ROLE"));
        const hasMaintRole = await tempContract.hasRole(MAINT_ROLE, account);
        setIsMaint(hasMaintRole);

        setTotalSupply({ totalSupply: totalSupplyValue, totalTips: totalTipsValue, claimed: (balanceValue + stakedAmount) / totalSupplyValue });

        // Fetch existing wiki pages
        fetchWikiPages(tempContract);
      } else {
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, SourceABI, provider);
        setContract(tempContract);
        setPageTitle('home');
        setWikiViewTitle('home');
        const page = await tempContract.getPage('home');
        setWikiViewContent(page[0]);
        console.log('page', page);
        let editors = [...page[1]].reverse();
        let timestamps = [...page[2]].reverse();
        setWikiEditors(editors);
        setWikiTimestamps(timestamps);
        fetchWikiPages(tempContract);
        if (window.location.search.includes('@')) {
          console.log("Found '@' in the query string.");
          // Extract the part after the @ character
          const params = new URLSearchParams(window.location.search);
          const query = params.toString();
          const atIndex = query.indexOf('@');
          const pageParam = query.substring(atIndex + 1).split('=')[1];
          console.log("Page parameter found after '@':", pageParam);
          if (pageParam) {
            let pa = await tempContract.getPage(pageParam.replaceAll('+', ' '));
            let editors = [...pa[1]].reverse();
            let timestamps = [...pa[2]].reverse();
            setWikiViewContent(pa[0]);
            setWikiEditors(editors);
            setWikiTimestamps(timestamps);
          } else {
            console.error("Page parameter is missing after '@'.");
          }
        }
      }
          window.addEventListener('popstate', handlePopState);
    };
    init();
    
  return () => {
    window.removeEventListener('popstate', handlePopState);
  };
  }, [provider, signer, account]);

  // Fetch Wiki Pages
  const fetchWikiPages = async (contractInstance) => {
    try {
      setWikiPages(['home', 'about', 'contact']);
      const pages = await contractInstance.getLatestPages(2000);
      setWikiPages(pages.filter(page => page !== '')); // Filter out empty pages
    } catch (error) {
      console.error('Error fetching wiki pages:', error);
    }
  };

  // Buy Tokens Function
  const buyTokens = async () => {
    if (!contract) return;
    try {
      setBuyStatus('Pending...');
      const amount = ethers.parseUnits(buyAmount, 18);
      const value = ethers.parseEther((buyAmount / 100000).toString());
      const tx = await contract.buyTokens(amount, { value: value });
      await tx.wait();
      setBuyStatus('Success!');
      toast.success('Tokens purchased successfully!');
      // Update balance
      const userBalance = await contract.balanceOf(account);
      setBalance(Number(ethers.formatEther(userBalance)));
    } catch (error) {
      console.error(error);
      setBuyStatus('Failed!');
      toast.error('Failed to buy tokens.');
    }
  };

  // Stake Tokens Function
  const stakeTokens = async () => {
    if (!contract) return;
    try {
      setStakeStatus('Pending...');
      const amount = ethers.parseUnits(stakeAmount, 18);
      const tx = await contract.stake(amount);
      await tx.wait();
      setStakeStatus('Success!');
      toast.success('Tokens staked successfully!');
      // Update staked balance
      const stakedInfo = await contract.stakedBalances(account);
      setStaked({
        amount: Number(ethers.formatEther(stakedInfo.amount)),
        unstakeTimestamp: stakedInfo.unstakeTimestamp,
        unstakedBalances: Number(ethers.formatEther(stakedInfo.unstakedBalances))
      });
    } catch (error) {
      console.error(error);
      setStakeStatus('Failed!');
      toast.error('Failed to stake tokens.');
    }
  };

  // Request Unstake Function
  const requestUnstake = async () => {
    if (!contract) return;
    try {
      setUnstakeStatus('Pending...');
      const amount = ethers.parseUnits(unstakeAmount, 18);
      const tx = await contract.requestUnstake(amount);
      await tx.wait();
      setUnstakeStatus('Success! Unstake will be available after 7 days.');
      setUnstakeRequested(true);
      const block = await provider.getBlock(tx.blockNumber);
      setUnstakeTime(block.timestamp + 7 * 24 * 60 * 60); // 7 days later
      toast.success('Unstake requested successfully!');
      // Update staked balance
      const stakedInfo = await contract.stakedBalances(account);
      setStaked({
        amount: Number(ethers.formatEther(stakedInfo.amount)),
        unstakeTimestamp: stakedInfo.unstakeTimestamp,
        unstakedBalances: Number(ethers.formatEther(stakedInfo.unstakedBalances))
      });
    } catch (error) {
      console.error(error);
      setUnstakeStatus('Failed!');
      toast.error('Failed to request unstake.');
    }
  };

  // Complete Unstake Function
  const completeUnstake = async () => {
    if (!contract) return;
    try {
      setUnstakeStatus('Pending...');
      const tx = await contract.unstake();
      await tx.wait();
      setUnstakeStatus('Unstake Successful!');
      setUnstakeRequested(false);
      setUnstakeTime(null);
      toast.success('Unstake completed successfully!');
      // Update staked balance
      const stakedInfo = await contract.stakedBalances(account);
      setStaked({
        amount: Number(ethers.formatEther(stakedInfo.amount)),
        unstakeTimestamp: stakedInfo.unstakeTimestamp,
        unstakedBalances: Number(ethers.formatEther(stakedInfo.unstakedBalances))
      });
    } catch (error) {
      console.error(error);
      setUnstakeStatus('Failed!');
      toast.error('Failed to complete unstake.');
    }
  };

  // Tip DAO Function
  const tipDAO = async () => {
    if (!contract) return;
    try {
      setTipStatus('Pending...');
      const amount = ethers.parseUnits(tipAmount, 18);
      const tx = await contract.tip(amount);
      await tx.wait();
      setTipStatus('Tip Successful!');
      toast.success('DAO tipped successfully!');
      // Update totalTips if needed
    } catch (error) {
      console.error(error);
      setTipStatus('Failed!');
      toast.error('Failed to tip DAO.');
    }
  };

  // Claim Rewards Function
  const claimRewards = async () => {
    if (!contract) return;
    try {
      setClaimStatus('Pending...');
      const tx = await contract.claimReward();
      await tx.wait();
      setClaimStatus('Rewards Claimed!');
      toast.success('Rewards claimed successfully!');
      setRewards(0);
    setBalance(Number(ethers.formatEther(await contract.balanceOf(account))))
      // Update rewards balance if needed
    } catch (error) {
      console.error(error);
      setClaimStatus('Failed!');
      toast.error('Failed to claim rewards.');
    }
  };

  // Create Wiki Page Function
  const createPage = async () => {
    if (!contract) return;
    try {
      setWikiStatus('Pending...');
      
      if (capabilities) {
        try {
        console.log(pageTitle.toLowerCase(), pageContent);
        writeContracts({
          contracts: [{
            address: CONTRACT_ADDRESS,
            abi: [{"inputs":[{"internalType":"contract IERC20S","name":"_source","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"title","type":"string"},{"indexed":true,"internalType":"address","name":"creator","type":"address"}],"name":"PageCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"title","type":"string"},{"indexed":true,"internalType":"address","name":"editor","type":"address"}],"name":"PageEdited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Slashed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TipReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"unstakeTime","type":"uint256"}],"name":"UnstakeRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},{"inputs":[],"name":"ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DAO_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EDIT_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAINT_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"_updateRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"buyTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"claimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"content","type":"string"}],"name":"createPage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"content","type":"string"}],"name":"editPage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"count","type":"uint256"}],"name":"getLatestPages","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"title","type":"string"}],"name":"getPage","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"grantEditRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"pageExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pageIDs","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"pages","outputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"content","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"requestUnstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"revokeEditRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"admin","type":"address"},{"internalType":"uint256","name":"flag","type":"uint256"}],"name":"setAdminRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"dao","type":"address"}],"name":"setDAORole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"maint","type":"address"}],"name":"setMaintRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newAmount","type":"uint256"}],"name":"setStakingAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"string","name":"str","type":"string"}],"name":"slash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"slashed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"slashedReasons","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"source","outputs":[{"internalType":"contract IERC20S","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakedBalances","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"unstakeTimestamp","type":"uint256"},{"internalType":"uint256","name":"unstakedBalances","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stakingAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"tip","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTips","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}],
            functionName: 'createPage',
            args: [pageTitle.toLowerCase(), pageContent],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
        
        } catch (error) {
         console.log('error', error);
        }
      }
      else {
      const tx = await contract.createPage(pageTitle.toLowerCase(), pageContent);
      await tx.wait();
      }
      setWikiStatus('Page Created!');
      toast.success('Wiki page created successfully!');
      setPageTitle('');
      setPageContent('');
      // Refresh wiki pages
      setWikiViewTitle(pageTitle);
      viewPage(pageTitle);
      fetchWikiPages(contract);
      setModal(false);
    } catch (error) {
      console.error(error);
      setWikiStatus('Failed!');
      toast.error('Failed to create wiki page.');
    }
  };

  // Edit Wiki Page Function
  const editPage = async () => {
    if (!contract) return;
    try {
      setWikiStatus('Pending...');
      if (capabilities) {
        try {
          writeContracts({
            contracts: [{
              address: CONTRACT_ADDRESS,
              abi: [{"inputs":[{"internalType":"contract IERC20S","name":"_source","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"title","type":"string"},{"indexed":true,"internalType":"address","name":"creator","type":"address"}],"name":"PageCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"string","name":"title","type":"string"},{"indexed":true,"internalType":"address","name":"editor","type":"address"}],"name":"PageEdited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"RewardClaimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"previousAdminRole","type":"bytes32"},{"indexed":true,"internalType":"bytes32","name":"newAdminRole","type":"bytes32"}],"name":"RoleAdminChanged","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleGranted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"bytes32","name":"role","type":"bytes32"},{"indexed":true,"internalType":"address","name":"account","type":"address"},{"indexed":true,"internalType":"address","name":"sender","type":"address"}],"name":"RoleRevoked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Slashed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Staked","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"TipReceived","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"unstakeTime","type":"uint256"}],"name":"UnstakeRequested","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Unstaked","type":"event"},{"inputs":[],"name":"ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DAO_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"DEFAULT_ADMIN_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"EDIT_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"MAINT_ROLE","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"_updateRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"buyTokens","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"claimReward","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"claimed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"content","type":"string"}],"name":"createPage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"content","type":"string"}],"name":"editPage","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"count","type":"uint256"}],"name":"getLatestPages","outputs":[{"internalType":"string[]","name":"","type":"string[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"title","type":"string"}],"name":"getPage","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"address[]","name":"","type":"address[]"},{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"}],"name":"getRoleAdmin","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"grantEditRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"grantRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"hasRole","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"pageExists","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"pageIDs","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"pages","outputs":[{"internalType":"string","name":"title","type":"string"},{"internalType":"string","name":"content","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"renounceRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"requestUnstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"revokeEditRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"bytes32","name":"role","type":"bytes32"},{"internalType":"address","name":"account","type":"address"}],"name":"revokeRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"rewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"admin","type":"address"},{"internalType":"uint256","name":"flag","type":"uint256"}],"name":"setAdminRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"dao","type":"address"}],"name":"setDAORole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"maint","type":"address"}],"name":"setMaintRole","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"newAmount","type":"uint256"}],"name":"setStakingAmount","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"string","name":"str","type":"string"}],"name":"slash","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"slashed","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"slashedReasons","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"source","outputs":[{"internalType":"contract IERC20S","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"stake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"stakedBalances","outputs":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"unstakeTimestamp","type":"uint256"},{"internalType":"uint256","name":"unstakedBalances","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"stakingAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes4","name":"interfaceId","type":"bytes4"}],"name":"supportsInterface","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"tip","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"totalStaked","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalTips","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"unstake","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}],
              functionName: 'editPage',
              args: [wikiViewTitle, pageContent],
            }],
            capabilities: {
              paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
            },
          });
        } catch (error) {
          console.log('error', error);
        }
      }
      else {
      const tx = await contract.editPage(wikiViewTitle, pageContent);
      await tx.wait();
    }
      setWikiStatus('Page Edited!');
      toast.success('Wiki page edited successfully!');
      setPageTitle('');
      setPageContent('');
      // Refresh wiki pages
      setWikiViewTitle(wikiViewTitle);
      viewPage(wikiViewTitle);
      setModal(false);
    } catch (error) {
      console.error(error);
      setWikiStatus('Failed!');
      toast.error('Failed to edit wiki page.');
    }
  };

  // View Wiki Page Function
  const viewPage = async (pa) => {
  pa=pa?pa.replaceAll('+', ' '):null
    if (!contract) return;
    try {
      const page = await contract.connect(provider).getPage(pa ? pa : wikiViewTitle);
      let editors = [...page[1]].reverse();
      let timestamps = [...page[2]].reverse();
      setWikiViewContent(page[0]);
      console.log('page', page);
      setWikiEditors(editors);
      setWikiTimestamps(timestamps);
      window.history.pushState({}, '', `?@=${pa ? pa : wikiViewTitle}`);
    } catch (error) {
      console.error(error);
      setWikiViewContent('Page does not exist.');
      setWikiEditors([]);
      setWikiTimestamps([]);
    }
  };

  // Grant EDIT_ROLE Function
  const grantEditRole = async () => {
    if (!contract) return;
    try {
      setRoleStatus('Pending...');
      const tx = await contract.grantEditRole(newEditor);
      await tx.wait();
      setRoleStatus('EDIT_ROLE Granted!');
      toast.success('EDIT_ROLE granted successfully!');
      setNewEditor('');
    } catch (error) {
      console.error(error);
      setRoleStatus('Failed!');
      toast.error('Failed to grant EDIT_ROLE.');
    }
  };

  // Revoke EDIT_ROLE Function
  const revokeEditRole = async () => {
    if (!contract) return;
    try {
      setRoleStatus('Pending...');
      const tx = await contract.revokeEditRole(newEditor);
      await tx.wait();
      setRoleStatus('EDIT_ROLE Revoked!');
      toast.success('EDIT_ROLE revoked successfully!');
      setNewEditor('');
    } catch (error) {
      console.error(error);
      setRoleStatus('Failed!');
      toast.error('Failed to revoke EDIT_ROLE.');
    }
  };

  // Withdraw Function (Maint Role)
  const withdraw = async () => {
    if (!contract) return;
    try {
      setWithdrawStatus('Pending...');
      const tx = await contract.withdraw();
      await tx.wait();
      setWithdrawStatus('Withdrawal Successful!');
      toast.success('Funds withdrawn successfully!');
      setWithdrawAmount('');
    } catch (error) {
      console.error(error);
      setWithdrawStatus('Failed!');
      toast.error('Failed to withdraw funds.');
    }
  };

  // Slash User Function (Maint Role)
  const slash = async () => {
    if (!contract) return;
    try {
      setSlashStatus('Pending...');
      const tx = await contract.slash(slashUser, ethers.parseUnits(slashAmount, 18), 'Reason');
      await tx.wait();
      setSlashStatus('User Slashed!');
      toast.success('User slashed successfully!');
      setSlashUser('');
      setSlashAmount('');
    } catch (error) {
      console.error(error);
      setSlashStatus('Failed!');
      toast.error('Failed to slash user.');
    }
  };

  // Handle Wiki Search
  const handleWikiSearch = (e) => {
    setWikiSearch(e.target.value);
  };
  const handlePopState =async() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.toString();
    const atIndex = query.indexOf('%40');
    
    let pageParam = 'home'; // default page
  
    if (atIndex !== -1) {
      const extractedParam = query.substring(atIndex + 1).split('=')[1];
      pageParam = extractedParam || 'home'; 
    }
  
    // Now update state and view the page
    setWikiViewTitle(pageParam);
    
let contract = new ethers.Contract(CONTRACT_ADDRESS, SourceABI, provider);
    const page = await contract.getPage(pageParam);
    let editors = [...page[1]].reverse();
    let timestamps = [...page[2]].reverse();
    setWikiViewContent(page[0]);
    setWikiEditors(editors);
    setWikiTimestamps(timestamps);
       console.log('hash', window.location);//
   window.location.hash!=='' && window.location.hash!==undefined && document.getElementById(window.location.hash.substring(1)).scrollIntoView();
  
  };
  
  // Filtered Wiki Pages based on search
  const filteredWikiPages = wikiPages.filter(page =>
    page.toLowerCase().includes(wikiSearch.toLowerCase())
  ).slice(0, 20);

  // Navigation Arrays
  const navigation = [
    { name: 'Dashboard', section: 'dashboard' },
    { name: 'Wiki', section: 'wiki' },
    { name: 'Explore', section: 'explore' },
    // Add more navigation items if needed
  ];

  const topwikiPages = ['home', 'source', 'directory', 'crypto101', 'how to'];

  // Maintenance Navigation Items
  const maintNavigation = [
    { name: 'Role Management', section: 'roles' },
    { name: 'Admin Panel', section: 'admin' },
  ];
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView();
      }
    }
  }, []);
  
  // Modal and Navigation State
  const [modal, setModal] = useState(false);
  const [nav, setNav] = useState(true);
const [showEditors, setShowEditors] = useState(false);
  // Components for Markdown Links
  const WikiSearch = () => {
    // Example array of wiki page titles.
    // In practice, you’d get this from your contract or server.
  
    // Filtered pages that match the user’s input
    const [filteredWikiPages, setFilteredWikiPages] = useState([]);
    useEffect(() => {
      try {
    setFilteredWikiPages([...wikiPages].filter((page) =>
        page.toLowerCase().includes(wikiSearch.toLowerCase())
      )
      .sort((a, b) => a.length - b.length) // sort by length
      .slice(0, 5)); // limit suggestions to 5
      console.log('filteredWikiPages', filteredWikiPages);
          } catch (error) {
        
    }
    }, [wikiSearch]);
  
  
    return (
      <div className="w-full mx-auto relative">
  
        {/* Suggestions Dropdown (only show if user typed something) */}
        {wikiSearch && filteredWikiPages.length > 0 &&((window.location.href.split('@=')[1])?(window.location.href.split('@=')[1]).replaceAll('%20',' '):'')!=wikiSearch&& (
          <ul className="absolute bg-white border border-blue-200 rounded mt-1 w-full max-h-60 overflow-y-auto shadow-lg z-10">
            {filteredWikiPages.map((page, index) => (
              <button
                key={index}
                className="p-2 hover:bg-blue-100 cursor-pointer w-full text-left"
                onClick={() => {
                  setWikiSearch(page);  // fill the input with the clicked suggestion
                  setWikiViewTitle(page); // optional: set the page title
                  viewPage(page);       // optional: immediately load the page
                }}
              >
                {page}
              </button>
            ))}
          </ul>
        )}
      </div>
    );
  };
  async function getPages(){  
    let provider = new ethers.JsonRpcProvider('https://base.meowrpc.com/base');
        let contract = new ethers.Contract(CONTRACT_ADDRESS, SourceABI, provider);
        console.log('boop');
        let pages= (await contract.getLatestPages(10000));
        console.log('pages', pages);
        pages=pages.filter(page=>page!=='');
        console.log('pages', pages);
        setWikiPages(pages);
        }
useEffect(() => {
    getPages();
    window.innerWidth > 500 ? setNav(true) : setNav(false);
  }, []);  
  const components = {
    // Custom renderer for link nodes
    a: ({ href, children, ...props }) => {
      // Check if the href contains an "@" symbol
      const containsAtSymbol = href.includes("@");

      const bgColors = [
        'bg-red-300 dark:bg-red-500/70', 'bg-pink-300 dark:bg-pink-500/70', 'bg-purple-300 dark:bg-purple-500/70', 'bg-indigo-300 dark:bg-indigo-500/70',
        'bg-blue-300 dark:bg-blue-500/70', 'bg-cyan-300 dark:bg-cyan-500/70', 'bg-teal-300 dark:bg-teal-500/70', 'bg-green-300 dark:bg-green-500/70',
        'bg-lime-300 dark:bg-lime-500/70', 'bg-yellow-300 dark:bg-yellow-500/70', 'bg-amber-300 dark:bg-amber-500/70', 'bg-blue-300 dark:bg-blue-500/70',
        'bg-rose-300 dark:bg-rose-500/70', 'bg-fuchsia-300 dark:bg-fuchsia-500/70', 'bg-sky-300 dark:bg-sky-500/70', 'bg-violet-300 dark:bg-violet-500/70',
        'bg-red-400 dark:bg-red-600/70', 'bg-pink-400 dark:bg-pink-600/70', 'bg-blue-400 dark:bg-blue-600/70', 'bg-indigo-400 dark:bg-indigo-600/70',
        'bg-blue-400 dark:bg-blue-600/70', 'bg-cyan-400 dark:bg-cyan-600/70', 'bg-teal-400 dark:bg-teal-600/70', 'bg-green-400 dark:bg-green-600/70',
        'bg-lime-400 dark:bg-lime-600/70', 'bg-yellow-400 dark:bg-yellow-600/70'
            
        
      ];
      if (containsAtSymbol) {
        // Render a button if the link contains "@"
        let page = href.split("@")[1];
        page = page.replaceAll('%20', ' ');
        return (
          <button
            onClick={() => {
              toast.success('Loading');
              setWikiViewTitle(page);
              viewPage(page);
            }}
            style={{margin: '1px'}}
            className={`bg-blue-400 text-white p-2 rounded-full shadow hover:bg-blue-600 transition duration-200 ${bgColors[page.charCodeAt(0) % bgColors.length]}`}
            {...props}
          >
            {children}
          </button>
        );
      }

      // Default rendering for regular links
      return (
        <a
          href={href}
          {...props}
          className="text-blue-600 dark:text-blue-400 underline rounded hover:bg-blue-200 transition-colors duration-200"
         // target="_blank" // Opens link in a new tab
          rel="noopener noreferrer" // Security best practices
        >
          {children}
        </a>
      );
    },

    table: ({ node, ...props }) => (
      <div
        style={{
          overflowX: 'auto',
          borderRadius: '12px',
        }}
      >
        <table
          {...props}
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        />
      </div>
    ),
    th: ({ node, ...props }) => (
      <th
        {...props}
        style={{
          border: '1px solid #ddd',
          padding: '12px',
          textAlign: 'left',
        }} className='bg-blue-200 dark:bg-blue-400'
      />
    ),
    td: ({ node, ...props }) => (
      <td
        {...props}
        style={{
          border: '1px solid #ddd',
          padding: '12px',
        }} className='dark:bg-blue-400/20 dark:text-white'
      />
    ),
    hr: ({ node, ...props }) => (
      <hr
        {...props}
        style={{
        }} className='dark:border-white/20'
      /> 
    ),
    img: ({ node, ...props }) => (
      <div className="flex justify-center">
      <img
        {...props}
        style={{
          maxWidth: '100%',
          borderRadius: '12px',
        }}
      />
      </div>
    ),
  };

  return (
    <div className="flex min-h-screen bg-blue-100 text-gray-900 dark:bg-gray-800 dark:text-white">
      {/* Sidebar Toggle Button (Visible when sidebar is hidden) */}
      <title>Source</title>
      {!nav && (
        <button
          onClick={() => setNav(!nav)}
          className="bg-blue-400 dark:bg-blue-600 text-white px-2.5 py-1 rounded-full font-bold hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors duration-200 mt-2 absolute top-0 left-2"
        >
          ⇨
        </button>
      )}
  
      {/* Sidebar */}
      {nav && (
        <aside className="w-72 bg-gradient-to-b from-blue-300 to-blue-500 dark:from-gray-700/50 dark:to-gray-800 text-white flex flex-col relative transition-transform duration-300">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-20 bg-blue-500 dark:bg-blue-700">
            <h1 className="text-3xl font-bold">💧Source</h1>
          </div>
  
          {/* Close Sidebar Button */}
          <button
            onClick={() => setNav(!nav)}
            className="bg-blue-400 dark:bg-blue-600 text-white px-3 py-1 rounded-full font-bold hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 mt-2 absolute top-0 left-2"
          >
            X
          </button>
  
          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 font-semibold">
            <ul>
              {navigation.map((item) => (
                <li
                  key={item.section}
                  className={`flex items-center p-3 my-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    currentSection === item.section
                      ? 'bg-blue-600 dark:bg-blue-800'
                      : 'hover:bg-blue-600 hover:bg-opacity-75 dark:hover:bg-blue-700 dark:hover:bg-opacity-75 dark:bg-gray-700 bg-blue-400'
                  }`}
                  onClick={() => setCurrentSection(item.section)}
                >
                  <span className="text-lg">{item.name}</span>
                </li>
              ))}
  
              {/* Conditional Rendering for Maintenance Roles */}
              {isMaint &&
                maintNavigation.map((item) => (
                  <li
                    key={item.section}
                    className={`flex items-center p-3 my-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                      currentSection === item.section
                        ? 'bg-blue-600 dark:bg-blue-800'
                        : 'hover:bg-blue-600 hover:bg-opacity-75 dark:hover:bg-blue-700 dark:hover:bg-opacity-75'
                    }`}
                    onClick={() => setCurrentSection(item.section)}
                  >
                    <span className="text-lg">{item.name}</span>
                  </li>
                ))}
            </ul>
      {/* Dark Mode Toggle */}
      <div className="mt-8 flex items-center justify-center">
      <button
        onClick={toggleDarkMode}
        className="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full focus:outline-none transition-colors duration-300"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? (
          // Sun Icon (Light Mode)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 3v1m0 16v1m8.66-8.66h-1M4.34 12h-1m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.02 0l-.707.707M6.343 17.657l-.707.707M12 8a4 4 0 100 8 4 4 0 000-8z"
            />
          </svg>
        ) : (
          // Moon Icon (Dark Mode)
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-gray-800 dark:text-gray-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
            />
          </svg>
        )}
      </button>
    </div>


            {/* Top Pages */}
            <h3 className="text-lg font-semibold text-white dark:text-gray-200 bg-blue-400 dark:bg-blue-600 p-2 rounded-full w-1/2 mx-auto mt-4 text-center">
              Top Pages
            </h3>
            {topwikiPages.length > 0 && (
              <div className="mt-4">
                <ul className="mt-4">
                  {topwikiPages.map((page, index) => (
                    <li
                      key={index}
                      className={`items-center p-3 my-2 rounded-full ${
                        index % 10 === 0
                          ? 'bg-blue-400/70 dark:bg-blue-300/40'
                          : index % 10 === 1
                          ? 'bg-pink-400/70 dark:bg-pink-300/40'
                          : index % 10 === 2
                          ? 'bg-green-400/70 dark:bg-green-300/40'
                          : index % 10 === 3
                          ? 'bg-yellow-400/70 dark:bg-yellow-300/40'
                          : index % 10 === 4
                          ? 'bg-red-400/70 dark:bg-red-300/40'
                          : index % 10 === 5
                          ? 'bg-indigo-400/70 dark:bg-indigo-300/40'
                          : index % 10 === 6
                          ? 'bg-purple-400/70 dark:bg-purple-300/40'
                          : index % 10 === 7
                          ? 'bg-blue-400/70 dark:bg-blue-300/40'
                          : index % 10 === 8
                          ? 'bg-yellow-400/70 dark:bg-yellow-300/40'
                          : 'bg-green-400/70 dark:bg-green-300/40'
                      } cursor-pointer transition-colors duration-200 text-center`}
                      onClick={() => {
                        toast.success('Loading');
                        setWikiViewTitle(page);
                        viewPage(page);
                      }}
                    >
                      <span className="text-lg">{page}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
  
            {/* Latest Pages */}
            <h3 className="text-lg font-semibold text-white dark:text-gray-200 bg-blue-400 dark:bg-blue-600 p-2 rounded-full w-1/2 mx-auto mt-4 text-center">
              Latest Pages
            </h3>
            {wikiPages.length > 0 && (
              <div className="mt-4">
                <ul className="mt-4">
                  {filteredWikiPages.map((page, index) => (
                    <li
                      key={index}
                      className={`items-center p-3 my-2 rounded-full ${
                        index % 10 === 0
                          ? 'bg-blue-400/70 dark:bg-blue-300/40'
                          : index % 10 === 1
                          ? 'bg-pink-400/70 dark:bg-pink-300/40'
                          : index % 10 === 2
                          ? 'bg-green-400/70 dark:bg-green-300/40'
                          : index % 10 === 3
                          ? 'bg-yellow-400/70 dark:bg-yellow-300/40'
                          : index % 10 === 4
                          ? 'bg-red-400/70 dark:bg-red-300/40'
                          : index % 10 === 5
                          ? 'bg-indigo-400/70 dark:bg-indigo-300/40'
                          : index % 10 === 6
                          ? 'bg-purple-400/70 dark:bg-purple-300/40'
                          : index % 10 === 7
                          ? 'bg-blue-400/70 dark:bg-blue-300/40'
                          : index % 10 === 8
                          ? 'bg-yellow-400/70 dark:bg-yellow-300/40'
                          : 'bg-green-400/70 dark:bg-green-300/40'
                      } cursor-pointer transition-colors duration-200 text-center`}
                      onClick={() => {
                        toast.success('Loading');
                        setWikiViewTitle(page);
                        viewPage(page);
                      }}
                    >
                      <span className="text-lg">{page}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </nav>
  
          {/* Footer */}
          <div className="p-4 text-center text-sm">
            © {new Date().getFullYear()} Source DAO. All rights reserved.
          </div>
        </aside>
      )}
  
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-semibold text-blue-500 dark:text-blue-300">
            Welcome, {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Guest'}
          </h1>
          <ConnectButton />
        </div>
  
        {/* Dynamic Sections */}
        {currentSection === 'wiki' && (
          <section className="">
            {/* Search Wiki Pages */}
            <div className="mb-8 max-w-2xl align-middle mx-auto">
              <h2 className="text-2xl font-bold text-blue-500 dark:text-blue-300 mb-4">🔍 Search Wiki Pages</h2>
              <div className="flex flex-col md:flex-row items-stretch">
                <input
                  type="text"
                  placeholder="Page Title to View"
                  value={wikiViewTitle}
                  onChange={(e) => {setWikiViewTitle(e.target.value)
                    setWikiSearch(e.target.value)}
                  }
                  className="flex-1 p-3 border border-blue-300 dark:border-blue-500 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={() => viewPage()}
                  className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                >
                  👁️ View
                </button>
              </div>
              <WikiSearch />
            </div>
  
            {/* Wiki Content Display */}
            <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg relative items-center justify-center">
              {/* Create/Edit Page Button */}
              <button
                onClick={() => setModal(!modal ? 'create' : '')}
                className="bg-blue-400 dark:bg-blue-600 text-white px-3 mx-auto py-1 md:px-6 md:py-3 left-20 right-20 md:left-auto mt-0 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 md:mt-4 absolute top-0 md:right-4 mx-auto"
              >
                📝 Create/Edit Page
              </button>
  
              {/* Wiki Content */}
              <div className="mt-2">
                <h3 className="text-3xl font-semibold text-white dark:text-gray-200 mb-2 text-center bg-blue-400 dark:bg-blue-600 p-2 rounded-full w-[fit-content] px-6 mx-auto">
                  {wikiViewTitle.toLocaleUpperCase()}
                </h3>
  
                {wikiViewContent ? (
                  <div className="prose max-w-none dark:prose-invert">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSlug]} components={components}>{wikiViewContent}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No content available.</p>
                )}
  
                {/* Edit History */}
                {wikiEditors.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-lg text-blue-600 dark:text-blue-300 mb-2">📜 Edit History: <button onClick={() => setShowEditors(!showEditors)} className="bg-blue-400 dark:bg-blue-600 text-white text-xs w-6 h-6 rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200">
                      {!showEditors ? '▼' : '▲'}
                    </button></h4>
                     
                    <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
                      {wikiEditors.map((editor, index) => {
                        
                       if ( showEditors == 1 || index == 0 ) {
                        return(
                        <li key={index}>
                          {editor} at {new Date(Number(wikiTimestamps[index]) * 1000).toLocaleString()}
                        </li>
                      )}})}
                    </ul>
                  </div>
                )}
              </div>
            </div>
  
            {/* Wiki Management Modal */}
            {modal && (
              <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full flex items-center justify-center">
                <div
                  className="bg-blue-200 dark:bg-gray-800 md:max-w-5xl md:w-3/4 mx-auto p-8 rounded-2xl shadow-lg mt-8 overflow-y-auto relative max-h-full"
                  style={{
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                  }}
                >
                  {/* Close Modal Button */}
                  <button
                    onClick={() => setModal(false)}
                    className="absolute top-4 right-4 bg-red-400 dark:bg-red-600 text-white font-bold px-4 py-2 rounded-full hover:bg-red-600 dark:hover:bg-red-800 transition-colors duration-200"
                  >
                    X
                  </button>
  
                  {/* Modal Header */}
                  <h4 className="font-bold bg-orange-400 dark:bg-orange-600 text-white p-1 rounded-3xl max-w-xl mx-auto text-center">
                    Creating/Editing Pages Stakes 100 SOURCE
                  </h4>
                  <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-300 mb-6">📖 Wiki Management</h2>
  
                  {/* Toggle Create/Edit */}
                  <button
                    onClick={() => setModal(modal === 'create' ? 'edit' : 'create')}
                    className="bg-blue-400 dark:bg-blue-600 text-white px-6 py-3 mx-auto rounded-full hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors duration-200 mb-4"
                  >
                    {modal === 'create' ? '✏️ Edit Page' : '🆕 Create Page'}
                  </button>
  
                  {/* Create Page Form */}
                  {modal === 'create' && (
                    <div className="bg-gray-50 dark:bg-gray-600 p-6 rounded-xl shadow-md">
                      <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-4">🆕 Create Page</h3>
                      <input
                        type="text"
                        placeholder="Page Title"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        className="w-full p-3 border border-blue-300 dark:border-blue-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                      <textarea
                        placeholder="Page Content (Markdown Supported)"
                        value={pageContent}
                        onChange={(e) => setPageContent(e.target.value)}
                        className="w-full p-3 border border-blue-300 dark:border-blue-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows="6"
                      />
                      <button
                        onClick={createPage}
                        className="w-full bg-green-600 dark:bg-green-500 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
                      >
                        🆕 Create Page
                      </button>
                      {wikiStatus && (
                        <p className="mt-2 text-sm text-green-600 dark:text-green-300">{wikiStatus}</p>
                      )}
                    </div>
                  )}
  
                  {/* Edit Page Form */}
                  {modal === 'edit' && (
                    <div className="bg-white dark:bg-gray-600 p-6 rounded-xl shadow-md">
                      <h3 className="text-xl font-semibold text-blue-600 dark:text-blue-300 mb-4">✏️ Edit Page</h3>
                      <textarea
                        placeholder="New Page Content (Markdown Supported)"
                        value={pageContent !== '' ? pageContent : wikiViewContent}
                        onChange={(e) => setPageContent(e.target.value)}
                        className="w-full p-3 border border-blue-300 dark:border-blue-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        rows="6"
                      />
                      <button
                        onClick={editPage}
                        className="w-full bg-orange-600 dark:bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-700 dark:hover:bg-orange-600 transition-colors duration-200"
                      >
                        ✏️ Edit Page
                      </button>
                      {wikiStatus && (
                        <p className="mt-2 text-sm text-orange-600 dark:text-orange-300">{wikiStatus}</p>
                      )}
                    </div>
                  )}
  
                  {/* Preview Section */}
                  {pageContent !== '' && (
                    <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg mt-2">
                      <div className="mt-2">
                        <h3 className="text-3xl font-semibold text-white dark:text-gray-200 mb-2 text-center bg-blue-400 dark:bg-blue-600 p-2 rounded-full w-[fit-content] px-4 mx-auto">
                          Preview
                        </h3>
                        {pageContent ? (
                          <div className="prose max-w-none dark:prose-invert">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{pageContent}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400">No content available.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
  
        {currentSection === 'dashboard' && (
          <section className="bg-white dark:bg-gray-700/50 p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-8">📊 Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Balance Card */}
              <div className="bg-blue-100 dark:bg-blue-700/50 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">Balance</h3>
                <p className="text-3xl font-bold">{balance} SOURCE</p>
                <div className="mt-4">
                  <h4 className="text-blue-600 dark:text-blue-300 font-semibold text-sm mb-2">🛒 Buy Tokens</h4>
                  <input
                    type="number"
                    placeholder="Amount to buy"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value)}
                    className="w-full p-3 border border-blue-300 dark:border-blue-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={buyTokens}
                    className="w-full bg-blue-600 dark:bg-blue-500 text-white py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
                  >
                    🆕 Buy SOURCE
                  </button>
                  {buyStatus && (
                    <p className="mt-2 text-sm text-green-600 dark:text-green-300">{buyStatus}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Price: 0.01 ETH per 1000 SOURCE
                  </p>
                  <h2 className="font-bold text-blue-500 dark:text-blue-300 mb-2 mt-4 text-center">
                    SOURCE left
                  </h2>
                  <div className="relative pt-1">
                    <div className="flex mb-2 items-center justify-between">
                      <div>
                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 dark:text-blue-200 bg-blue-200 dark:bg-blue-600">
                          SOURCE
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-semibold inline-block text-blue-600 dark:text-blue-200">
                          {totalSupply.totalSupply} bought / 100,000,000 SOURCE
                        </span>
                      </div>
                    </div>
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200 dark:bg-blue-600">
                      <div
                        style={{ width: `${(totalSupply.totalSupply / 100000000) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 dark:bg-blue-300"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
  
              {/* Staked Card */}
              <div className="bg-green-100 dark:bg-green-700/50 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">Staked</h3>
                <p className="text-3xl font-bold">{staked.amount} SOURCE</p>
                <div className="mt-4">
                  <h4 className="text-green-600 dark:text-green-300 font-semibold text-sm mb-2">⛓️ Manage Staking</h4>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    className="w-full p-3 border border-green-300 dark:border-green-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={stakeTokens}
                    className="w-full bg-green-600 dark:bg-green-500 text-white py-2 rounded-lg hover:bg-green-800 dark:hover:bg-green-600 transition-colors duration-200"
                  >
                    ⛓️ Stake
                  </button>
                  <input
                    type="number"
                    placeholder="Amount"
                    value={unstakeAmount}
                    onChange={(e) => setUnstakeAmount(e.target.value)}
                    className="w-full p-3 border border-yellow-300 dark:border-yellow-500 rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                  />
                  <button
                    onClick={requestUnstake}
                    className="w-full bg-orange-500 dark:bg-orange-400 text-white py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors duration-200 mt-2"
                  >
                    🔓 Unstake
                  </button>
                  <h4 className="text-green-600 dark:text-green-300 font-semibold text-sm mt-4 mb-2">
                    Unstaking {staked.unstakedBalances} SOURCE
                  </h4>
                  <h4 className="text-green-600 dark:text-green-300 font-semibold text-sm mb-2">
                    Unstake Time {unstakeTime ? new Date(unstakeTime * 1000).toLocaleString() : 'N/A'}
                  </h4>
                  <button
                    onClick={completeUnstake}
                    className="w-full bg-yellow-500 dark:bg-yellow-400 text-white py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors duration-200 mt-2"
                  >
                    🔓 Withdraw
                  </button>
                </div>
              </div>
  
              {/* Rewards Card */}
              <div className="bg-purple-100 dark:bg-purple-700/50 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">Rewards</h3>
                <p className="text-3xl font-bold">{rewards} SOURCE</p>
                <div className="mt-4">
                  <h4 className="text-purple-600 dark:text-purple-300 font-semibold text-sm mb-2">🎁 Claim Rewards</h4>
                  <button
                    onClick={claimRewards}
                    className="w-full bg-pink-500 dark:bg-pink-400 text-white py-2 rounded-lg hover:bg-pink-700 dark:hover:bg-pink-600 transition-colors duration-200"
                  >
                    🎉 Claim
                  </button>
                  {claimStatus && (
                    <p className="mt-2 text-sm text-pink-600 dark:text-pink-300">{claimStatus}</p>
                  )}
                </div>
                <h4 className="text-purple-600 dark:text-purple-300 font-semibold text-center mt-4 mb-2">
                  Total Tips
                </h4>
                <h4 className="text-white font-semibold bg-purple-400 dark:bg-purple-600 p-2 rounded-full text-center">
                  {totalSupply.totalTips} SOURCE
                </h4>
                <h4 className="text-purple-600 dark:text-purple-300 font-semibold text-center mt-4 mb-2">
                  Total Stake
                </h4>
                <h4 className="text-white font-semibold bg-purple-500 dark:bg-purple-600 p-2 rounded-full text-center">
                  {totalSupply.claimed*100}% SOURCE
                </h4>
              </div>
  
              {/* Total Tips Card */}
              <div className="bg-yellow-100 dark:bg-yellow-700/50 p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Total Tips</h3>
                <p className="text-3xl font-bold">{totalSupply.totalTips} SOURCE</p>
                <input
                  type="number"
                  placeholder="Amount to tip"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  className="w-full p-3 border border-yellow-300 dark:border-yellow-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={tipDAO}
                  className="w-full bg-yellow-500 dark:bg-yellow-400 text-white py-2 rounded-lg hover:bg-yellow-600 dark:hover:bg-yellow-500 transition-colors duration-200"
                >
                  💸 Tip DAO
                </button>
              </div>
            </div>
          </section>
        )}
  
        {/* Conditional Sections for Maintainers */}
        {currentSection === 'roles' && isMaint && (
          <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-8">👥 Role Management</h2>
            <div className="flex flex-col md:flex-row items-stretch gap-8">
              {/* Grant Edit Role */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md flex-1">
                <h3 className="text-xl font-semibold text-green-600 dark:text-green-300 mb-4">
                  ➕ Grant EDIT_ROLE
                </h3>
                <input
                  type="text"
                  placeholder="Editor Address"
                  value={newEditor}
                  onChange={(e) => setNewEditor(e.target.value)}
                  className="w-full p-3 border border-green-300 dark:border-green-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={grantEditRole}
                  className="w-full bg-green-600 dark:bg-green-500 text-white py-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
                >
                  Grant EDIT_ROLE
                </button>
              </div>
  
              {/* Revoke Edit Role */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md flex-1">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-4">
                  ➖ Revoke EDIT_ROLE
                </h3>
                <input
                  type="text"
                  placeholder="Editor Address"
                  value={newEditor}
                  onChange={(e) => setNewEditor(e.target.value)}
                  className="w-full p-3 border border-red-300 dark:border-red-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={revokeEditRole}
                  className="w-full bg-red-600 dark:bg-red-500 text-white py-3 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors duration-200"
                >
                  Revoke EDIT_ROLE
                </button>
              </div>
            </div>
            {roleStatus && (
              <p className="mt-4 text-sm text-blue-600 dark:text-blue-300">{roleStatus}</p>
            )}
          </section>
        )}
  
        {currentSection === 'admin' && isMaint && (
          <section className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-8">🔧 Admin Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Withdraw Funds */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-purple-600 dark:text-purple-300 mb-4">
                  💰 Withdraw Funds
                </h3>
                <input
                  type="number"
                  placeholder="Amount to withdraw (ETH)"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full p-3 border border-purple-300 dark:border-purple-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={withdraw}
                  className="w-full bg-purple-600 dark:bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors duration-200"
                >
                  💸 Withdraw
                </button>
                {withdrawStatus && (
                  <p className="mt-2 text-sm text-purple-600 dark:text-purple-300">
                    {withdrawStatus}
                  </p>
                )}
              </div>
  
              {/* Slash User */}
              <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl shadow-md">
                <h3 className="text-xl font-semibold text-red-600 dark:text-red-300 mb-4">
                  🛑 Slash User
                </h3>
                <input
                  type="text"
                  placeholder="User Address to Slash"
                  value={slashUser}
                  onChange={(e) => setSlashUser(e.target.value)}
                  className="w-full p-3 border border-red-300 dark:border-red-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Amount to Slash"
                  value={slashAmount}
                  onChange={(e) => setSlashAmount(e.target.value)}
                  className="w-full p-3 border border-red-300 dark:border-red-500 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  onClick={slash}
                  className="w-full bg-black dark:bg-gray-800 text-white py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
                >
                  🚫 Slash
                </button>
                {slashStatus && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-300">
                    {slashStatus}
                  </p>
                )}
              </div>
            </div>
            <DataComparator contract={contract} />
          </section>
        )}
{currentSection === 'explore' && (
  <div className="bg-white dark:bg-gray-700 p-8 rounded-2xl shadow-lg">
    <h2 className="text-3xl font-bold text-blue-500 dark:text-blue-300 mb-8">🔍 Explore Latest Wiki Pages</h2>
    {wikiPages.length === 0 ? (
      <p className="text-gray-800 dark:text-gray-200">
        No pages available yet.
      </p>
    ) : (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
        {wikiPages.map((page, index) => (
          <button
            key={index}
            onClick={() => {setCurrentSection('wiki'); setWikiViewTitle(page); viewPage(page);}}
            style={{
              backgroundColor: [
                "#f87171", // Red
                "#60a5fa", // Blue
                "#fbbf24", // Yellow
                "#34d399", // Green
                "#818cf8", // Indigo
              ][index % 5], // Cycle through colors
            }}
            className="h-20 w-full text-white font-semibold shadow-sm hover:shadow-md transition duration-300 ease-in-out"
          >
            {page}
          </button>
        ))}
      </div>
    )}
  </div>
)}
            
      </main>
  
      {/* Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />
    </div>
  );
  
};
// src/DataComparator.js

// Define your ABI outside the component to prevent re-creation on each render
const ABI = ["function editPage(string title, string content)"];

// Create an Interface Instance
const iface = new ethers.Interface(ABI);

const DataComparator = ({ contract }) => {
  const [editEvents, setEditEvents] = useState([]);
  const [selectedEdit1, setSelectedEdit1] = useState(null);
  const [selectedEdit2, setSelectedEdit2] = useState(null);
  const [diffOnly, setDiffOnly] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  const [decodedData1, setDecodedData1] = useState(null);
  const [decodedData2, setDecodedData2] = useState(null);

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [filters, setFilters] = useState({
    editor: '',
    eventType: '',
    startDate: '',
    endDate: '',
    title: ''
  });

  // Function to fetch edit events from the server or use hardcoded data for testing
  const fetchEditEvents = async () => {
    try {
      // Uncomment and adjust the fetch URL if your server is hosted elsewhere
      /*
      const response = await fetch('https://159.223.150.70:5000/api/events');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      */
      
      // Hardcoded data for testing
let data=[{"id":4,"eventType":"PageEdited","title":"home","editor":"0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5","blockNumber":24778552,"transactionHash":"0x41f7869885860b88a34fed346fe81f0f01e52caf9fc9b070aeb78386668d53c1","functionName":"editPage","content":"# Welcome to Source: The Future of Decentralized Knowledge\n\nImagine a world where information is truly open—accessible to everyone, free from gatekeepers, and secured forever. A place where every contribution, every edit, and every page helps shape a **public, immutable, and transparent** legacy. Welcome to **Source**, the platform redefining how we share and build knowledge.\n\n## Source is currently free (no staking needed) and gas free to contribute to (if using CB smart wallet)! You can also earn rewards for contributing high quality info. Find more out [here](https://x.com/sourcedotwiki/status/1868764169451061388).\n[https://x.com/sourcedotwiki/status/1868764169451061388](https://x.com/sourcedotwiki/status/1868764169451061388)\n\n**Low quality contributions will slash any rewards to 0.**\n## Not sure what to contribute? Check out [the Directory](@directory) for pages that havent been created or need info!\n\n---\n\n## Jump Into It\n\n#### [About Source DAO](@source)  \n#### [How to Use Source](@how%20to) ● [SOURCE Token](@$source) ● [Source Directory](@directory) ● [Crypto 101](@crypto101) ● [Development](@dev)\n\n---\n\n## What’s Source All About?\n\n### Open and Public\nSource is an open library for knowledge. All information on the platform is **freely available**, **unowned**, and **shared**—creating a collaborative, global hub where ideas flourish.\n\n### Immutable\nEvery page, edit, and contribution on Source is permanently stored on the blockchain. This ensures the data is **tamper-proof**, **auditable**, and will last **forever**—offering unmatched trust and transparency.\n\n### Decentralized Governance\nNo overlords here! Source is **community-driven**, with contributors and maintainers working together to ensure **fairness** and **quality**. Decisions are made transparently, with power distributed among the people.\n\n### Built for the Future\nSource isn’t just a platform—it’s a **public good**, designed to serve as the backbone for **verified, decentralized knowledge** that empowers both **humans and AI** to innovate and grow.\n\n---\n\n## Staking and Slashing: Building Trust\n\n### Staking to Contribute\nTo create or edit a page, contributors must **stake 100 SOURCE tokens**. This financial commitment shows you’re serious about your contributions.\n\n- **Locked In**: Staked tokens are held for **7 days**, ensuring accountability and a commitment to quality.\n- **Get Them Back**: Your stake is returned after the lock period—unless your content is flagged for violations.\n\n### Slashing for Accountability\nIf content is harmful, spammy, or low-quality, maintainers can **slash the staked tokens** of contributors. This creates a financial disincentive for bad actors, ensuring that only high-quality contributions make it to the platform.\n\n---\n\n## AI and Source: A Collaborative Future\n\nArtificial intelligence is transforming the world, but even AI needs a **trusted source of knowledge**. That’s where Source shines.\n\n### AI as a User of Source\nAI agents can pull **verified, decentralized knowledge** from Source to generate **accurate and trustworthy outputs**. Blockchain immutability ensures that the data AI relies on is both credible and tamper-proof.\n\n### AI as a Contributor\nAI isn’t just a consumer—it can also **contribute to Source**. AI agents can stake tokens, create or edit pages, and even earn rewards for meaningful contributions. But just like humans, AI must adhere to the rules:\n\n- **Stake Tokens** to contribute.\n- **Be Accountable**: If AI-generated content is flagged for poor quality, it risks having its stake slashed.\n\nBy integrating AI, Source creates a world where humans and machines collaborate to expand knowledge while maintaining accountability.\n\n---\n\n## Why You’ll Love Source\n\n- **Be the Architect of Knowledge**: Build an on-chain legacy with contributions that are permanently recognized.\n- **Earn While You Create**: Stake tokens, contribute value, and earn rewards for your knowledge.\n- **Trust Through Transparency**: Every page, edit, and transaction is logged on-chain for all to see.\n- **Collaborate with AI**: Work alongside AI agents to build and refine the knowledge base.\n- **Guardrails for Quality**: Staking and slashing ensure the platform stays free of spam and misinformation.\n\n---\n\n## The DAO\n\nSource thrives on collaboration, fairness, and sustainability. The platform’s integrity and success depend on the dedicated contributions of **Maintainers** and **Editors**, whose roles are governed and chosen by the **DAO**, ensuring the platform remains decentralized and community-driven.\n\nFind out more on the [Source](@source) DAO page.\n\n---\n\nThe future of knowledge is **decentralized**, and Source is leading the way. It’s more than just a platform—it’s a **movement** to ensure that information is open, trustworthy, and everlasting.\n\n### So, what are you waiting for?\n**Join Source today and be part of the revolution.**  \n[Twitter](https://x.com/sourcedotwiki) [Discord](https://discord.gg/CSWHkcH8Ee)\n\nLet’s build the future, one block (and page) at a time.\n","data":"0xea313668000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004686f6d650000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000013d9232057656c636f6d6520746f20536f757263653a2054686520467574757265206f6620446563656e7472616c697a6564204b6e6f776c656467650a0a496d6167696e65206120776f726c6420776865726520696e666f726d6174696f6e206973207472756c79206f70656ee2809461636365737369626c6520746f2065766572796f6e652c20667265652066726f6d20676174656b6565706572732c20616e64207365637572656420666f72657665722e204120706c61636520776865726520657665727920636f6e747269627574696f6e2c20657665727920656469742c20616e6420657665727920706167652068656c70732073686170652061202a2a7075626c69632c20696d6d757461626c652c20616e64207472616e73706172656e742a2a206c65676163792e2057656c636f6d6520746f202a2a536f757263652a2a2c2074686520706c6174666f726d207265646566696e696e6720686f7720776520736861726520616e64206275696c64206b6e6f776c656467652e0a0a232320536f757263652069732063757272656e746c79206672656520286e6f207374616b696e67206e65656465642920616e6420676173206672656520746f20636f6e7472696275746520746f20286966207573696e6720434220736d6172742077616c6c6574292120596f752063616e20616c736f206561726e207265776172647320666f7220636f6e747269627574696e672068696768207175616c69747920696e666f2e2046696e64206d6f7265206f7574205b686572655d2868747470733a2f2f782e636f6d2f736f75726365646f7477696b692f7374617475732f31383638373634313639343531303631333838292e0a5b68747470733a2f2f782e636f6d2f736f75726365646f7477696b692f7374617475732f313836383736343136393435313036313338385d2868747470733a2f2f782e636f6d2f736f75726365646f7477696b692f7374617475732f31383638373634313639343531303631333838290a0a2a2a4c6f77207175616c69747920636f6e747269627574696f6e732077696c6c20736c61736820616e79207265776172647320746f20302e2a2a0a2323204e6f742073757265207768617420746f20636f6e747269627574653f20436865636b206f7574205b746865204469726563746f72795d28406469726563746f72792920666f72207061676573207468617420686176656e74206265656e2063726561746564206f72206e65656420696e666f210a0a2d2d2d0a0a2323204a756d7020496e746f2049740a0a23232323205b41626f757420536f757263652044414f5d2840736f757263652920200a23232323205b486f7720746f2055736520536f757263655d2840686f77253230746f2920e2978f205b534f5552434520546f6b656e5d284024736f757263652920e2978f205b536f75726365204469726563746f72795d28406469726563746f72792920e2978f205b43727970746f203130315d284063727970746f3130312920e2978f205b446576656c6f706d656e745d2840646576290a0a2d2d2d0a0a23232057686174e280997320536f7572636520416c6c2041626f75743f0a0a232323204f70656e20616e64205075626c69630a536f7572636520697320616e206f70656e206c69627261727920666f72206b6e6f776c656467652e20416c6c20696e666f726d6174696f6e206f6e2074686520706c6174666f726d206973202a2a667265656c7920617661696c61626c652a2a2c202a2a756e6f776e65642a2a2c20616e64202a2a7368617265642a2ae280946372656174696e67206120636f6c6c61626f7261746976652c20676c6f62616c2068756220776865726520696465617320666c6f75726973682e0a0a23232320496d6d757461626c650a457665727920706167652c20656469742c20616e6420636f6e747269627574696f6e206f6e20536f75726365206973207065726d616e656e746c792073746f726564206f6e2074686520626c6f636b636861696e2e205468697320656e7375726573207468652064617461206973202a2a74616d7065722d70726f6f662a2a2c202a2a617564697461626c652a2a2c20616e642077696c6c206c617374202a2a666f72657665722a2ae280946f66666572696e6720756e6d61746368656420747275737420616e64207472616e73706172656e63792e0a0a23232320446563656e7472616c697a656420476f7665726e616e63650a4e6f206f7665726c6f72647320686572652120536f75726365206973202a2a636f6d6d756e6974792d64726976656e2a2a2c207769746820636f6e7472696275746f727320616e64206d61696e7461696e65727320776f726b696e6720746f67657468657220746f20656e73757265202a2a666169726e6573732a2a20616e64202a2a7175616c6974792a2a2e204465636973696f6e7320617265206d616465207472616e73706172656e746c792c207769746820706f77657220646973747269627574656420616d6f6e67207468652070656f706c652e0a0a232323204275696c7420666f7220746865204675747572650a536f757263652069736ee2809974206a757374206120706c6174666f726de280946974e28099732061202a2a7075626c696320676f6f642a2a2c2064657369676e656420746f20736572766520617320746865206261636b626f6e6520666f72202a2a76657269666965642c20646563656e7472616c697a6564206b6e6f776c656467652a2a207468617420656d706f7765727320626f7468202a2a68756d616e7320616e642041492a2a20746f20696e6e6f7661746520616e642067726f772e0a0a2d2d2d0a0a2323205374616b696e6720616e6420536c617368696e673a204275696c64696e672054727573740a0a232323205374616b696e6720746f20436f6e747269627574650a546f20637265617465206f722065646974206120706167652c20636f6e7472696275746f7273206d757374202a2a7374616b652031303020534f5552434520746f6b656e732a2a2e20546869732066696e616e6369616c20636f6d6d69746d656e742073686f777320796f75e28099726520736572696f75732061626f757420796f757220636f6e747269627574696f6e732e0a0a2d202a2a4c6f636b656420496e2a2a3a205374616b656420746f6b656e73206172652068656c6420666f72202a2a3720646179732a2a2c20656e737572696e67206163636f756e746162696c69747920616e64206120636f6d6d69746d656e7420746f207175616c6974792e0a2d202a2a476574205468656d204261636b2a2a3a20596f7572207374616b652069732072657475726e656420616674657220746865206c6f636b20706572696f64e28094756e6c65737320796f757220636f6e74656e7420697320666c616767656420666f722076696f6c6174696f6e732e0a0a23232320536c617368696e6720666f72204163636f756e746162696c6974790a496620636f6e74656e74206973206861726d66756c2c207370616d6d792c206f72206c6f772d7175616c6974792c206d61696e7461696e6572732063616e202a2a736c61736820746865207374616b656420746f6b656e732a2a206f6620636f6e7472696275746f72732e2054686973206372656174657320612066696e616e6369616c20646973696e63656e7469766520666f7220626164206163746f72732c20656e737572696e672074686174206f6e6c7920686967682d7175616c69747920636f6e747269627574696f6e73206d616b6520697420746f2074686520706c6174666f726d2e0a0a2d2d2d0a0a232320414920616e6420536f757263653a204120436f6c6c61626f726174697665204675747572650a0a4172746966696369616c20696e74656c6c6967656e6365206973207472616e73666f726d696e672074686520776f726c642c20627574206576656e204149206e656564732061202a2a7472757374656420736f75726365206f66206b6e6f776c656467652a2a2e2054686174e280997320776865726520536f75726365207368696e65732e0a0a23232320414920617320612055736572206f6620536f757263650a4149206167656e74732063616e2070756c6c202a2a76657269666965642c20646563656e7472616c697a6564206b6e6f776c656467652a2a2066726f6d20536f7572636520746f2067656e6572617465202a2a616363757261746520616e64207472757374776f72746879206f7574707574732a2a2e20426c6f636b636861696e20696d6d75746162696c69747920656e737572657320746861742074686520646174612041492072656c696573206f6e20697320626f7468206372656469626c6520616e642074616d7065722d70726f6f662e0a0a232323204149206173206120436f6e7472696275746f720a41492069736ee2809974206a757374206120636f6e73756d6572e2809469742063616e20616c736f202a2a636f6e7472696275746520746f20536f757263652a2a2e204149206167656e74732063616e207374616b6520746f6b656e732c20637265617465206f7220656469742070616765732c20616e64206576656e206561726e207265776172647320666f72206d65616e696e6766756c20636f6e747269627574696f6e732e20427574206a757374206c696b652068756d616e732c204149206d7573742061646865726520746f207468652072756c65733a0a0a2d202a2a5374616b6520546f6b656e732a2a20746f20636f6e747269627574652e0a2d202a2a4265204163636f756e7461626c652a2a3a2049662041492d67656e65726174656420636f6e74656e7420697320666c616767656420666f7220706f6f72207175616c6974792c206974207269736b7320686176696e6720697473207374616b6520736c61736865642e0a0a427920696e746567726174696e672041492c20536f757263652063726561746573206120776f726c642077686572652068756d616e7320616e64206d616368696e657320636f6c6c61626f7261746520746f20657870616e64206b6e6f776c65646765207768696c65206d61696e7461696e696e67206163636f756e746162696c6974792e0a0a2d2d2d0a0a23232057687920596f75e280996c6c204c6f766520536f757263650a0a2d202a2a42652074686520417263686974656374206f66204b6e6f776c656467652a2a3a204275696c6420616e206f6e2d636861696e206c6567616379207769746820636f6e747269627574696f6e73207468617420617265207065726d616e656e746c79207265636f676e697a65642e0a2d202a2a4561726e205768696c6520596f75204372656174652a2a3a205374616b6520746f6b656e732c20636f6e747269627574652076616c75652c20616e64206561726e207265776172647320666f7220796f7572206b6e6f776c656467652e0a2d202a2a5472757374205468726f756768205472616e73706172656e63792a2a3a20457665727920706167652c20656469742c20616e64207472616e73616374696f6e206973206c6f67676564206f6e2d636861696e20666f7220616c6c20746f207365652e0a2d202a2a436f6c6c61626f7261746520776974682041492a2a3a20576f726b20616c6f6e6773696465204149206167656e747320746f206275696c6420616e6420726566696e6520746865206b6e6f776c6564676520626173652e0a2d202a2a47756172647261696c7320666f72205175616c6974792a2a3a205374616b696e6720616e6420736c617368696e6720656e737572652074686520706c6174666f726d2073746179732066726565206f66207370616d20616e64206d6973696e666f726d6174696f6e2e0a0a2d2d2d0a0a2323205468652044414f0a0a536f757263652074687269766573206f6e20636f6c6c61626f726174696f6e2c20666169726e6573732c20616e64207375737461696e6162696c6974792e2054686520706c6174666f726de280997320696e7465677269747920616e64207375636365737320646570656e64206f6e207468652064656469636174656420636f6e747269627574696f6e73206f66202a2a4d61696e7461696e6572732a2a20616e64202a2a456469746f72732a2a2c2077686f736520726f6c65732061726520676f7665726e656420616e642063686f73656e20627920746865202a2a44414f2a2a2c20656e737572696e672074686520706c6174666f726d2072656d61696e7320646563656e7472616c697a656420616e6420636f6d6d756e6974792d64726976656e2e0a0a46696e64206f7574206d6f7265206f6e20746865205b536f757263655d2840736f75726365292044414f20706167652e0a0a2d2d2d0a0a54686520667574757265206f66206b6e6f776c65646765206973202a2a646563656e7472616c697a65642a2a2c20616e6420536f75726365206973206c656164696e6720746865207761792e204974e2809973206d6f7265207468616e206a757374206120706c6174666f726de280946974e28099732061202a2a6d6f76656d656e742a2a20746f20656e73757265207468617420696e666f726d6174696f6e206973206f70656e2c207472757374776f727468792c20616e6420657665726c617374696e672e0a0a23232320536f2c20776861742061726520796f752077616974696e6720666f723f0a2a2a4a6f696e20536f7572636520746f64617920616e642062652070617274206f6620746865207265766f6c7574696f6e2e2a2a20200a5b547769747465725d2868747470733a2f2f782e636f6d2f736f75726365646f7477696b6929205b446973636f72645d2868747470733a2f2f646973636f72642e67672f435357486b6348384565290a0a4c6574e2809973206275696c6420746865206675747572652c206f6e6520626c6f636b2028616e6420706167652920617420612074696d652e0a00000000000000","createdAt":"2025-01-08 14:27:35"},{"id":3,"eventType":"PageEdited","title":"lol","editor":"0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5","blockNumber":24754053,"transactionHash":"0x35d6b8b9f0f15b1bab052476deec6177ccbc8ea3e7355b1ac10459b66f0fb811","functionName":"editPage","content":"boop","data":"0xea3136680000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000036c6f6c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004626f6f7000000000000000000000000000000000000000000000000000000000","createdAt":"2025-01-08 00:50:57"},{"id":2,"eventType":"PageEdited","title":"boop","editor":"0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5","blockNumber":24754039,"transactionHash":"0x4d2278dce77989bcbcf9a14c78ff3fbad1cfebe791f30c9c2747fe6b5a85f60c","functionName":"editPage","content":"lol","data":"0xea313668000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004626f6f700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000036c6f6c0000000000000000000000000000000000000000000000000000000000","createdAt":"2025-01-08 00:50:28"},{"id":1,"eventType":"PageEdited","title":"boop","editor":"0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5","blockNumber":24750330,"transactionHash":"0xe5d78ccf1a3c0f092ad66c43311629c2b8fad2b44717396dda275a3dad1d7168","functionName":"editPage","content":"boop","data":"0xea313668000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000004626f6f70000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004626f6f7000000000000000000000000000000000000000000000000000000000","createdAt":"2025-01-07 22:46:48"}]
      setEditEvents(data);
    } catch (error) {
      console.error("❌ Error fetching edit events:", error);
      toast.error('Failed to fetch edit events.');
    }
  };

  useEffect(() => {
    fetchEditEvents();
  }, []);

  // Apply filters whenever 'editEvents' or 'filters' change
  useEffect(() => {
    applyFilters();
  }, [editEvents, filters]);

  const applyFilters = () => {
    let events = [...editEvents];

    if (filters.editor) {
      events = events.filter(event => event.editor.toLowerCase().includes(filters.editor.toLowerCase()));
    }

    if (filters.eventType) {
      events = events.filter(event => event.eventType === filters.eventType);
    }

    if (filters.title) {
      events = events.filter(event => event.title.toLowerCase().includes(filters.title.toLowerCase()));
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      events = events.filter(event => new Date(event.createdAt) >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate);
      events = events.filter(event => new Date(event.createdAt) <= end);
    }

    setFilteredEvents(events);
  };

  // Handle filter input changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prevFilters => ({ ...prevFilters, [name]: value }));
  };

  const handleSelectEdit1 = (event) => {
    const selectedId = event.target.value;
    const edit = editEvents.find(e => e.id === parseInt(selectedId));
    if (edit) {
      try {
        // Ensure 'iface' is defined and imported correctly
        const decoded = iface.parseTransaction({ data: edit.data });
        setDecodedData1(decoded.args);
        toast.success(`Edit 1 (${edit.title}) decoded successfully!`);
      } catch (error) {
        console.error(error);
        toast.error('Failed to decode Edit 1.');
        setDecodedData1(null);
      }
    } else {
      setDecodedData1(null);
    }
  };

  const handleSelectEdit2 = (event) => {
    const selectedId = event.target.value;
    const edit = editEvents.find(e => e.id === parseInt(selectedId));
    if (edit) {
      try {
        // Ensure 'iface' is defined and imported correctly
        const decoded = iface.parseTransaction({ data: edit.data });
        setDecodedData2(decoded.args);
        toast.success(`Edit 2 (${edit.title}) decoded successfully!`);
      } catch (error) {
        console.error(error);
        toast.error('Failed to decode Edit 2.');
        setDecodedData2(null);
      }
    } else {
      setDecodedData2(null);
    }
  };

  const handleCompare = () => {
    if (!decodedData1 || !decodedData2) {
      toast.error('Please select both edits to compare.');
      return;
    }
    setShowDiff(true);
  };

  const restore = async (title, content, isFirst) => {
    if (!contract) {
      toast.error('Contract not initialized.');
      return;
    }

    try {
      // Example: Call editPage function to restore content
      const tx = await contract.editPage(title, content);
      await tx.wait();
      toast.success(`Page ${isFirst ? '1' : '2'} restored successfully!`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to restore Page ${isFirst ? '1' : '2'}.`);
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-2xl shadow-lg mt-6 space-y-16">
      <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-8 flex items-center">
        <span className="mr-2">🔍</span> Transaction Data Comparator
      </h2>
      
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Title Dropdown */}
        <select
          name="title"
          value={filters.title}
          onChange={(e) => {
            const value = e.target.value;
            setFilters((prevFilters) => ({
              ...prevFilters,
              title: value
            }));
          }}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="">Select Title</option>
          {Array.from(new Set(editEvents.map((event) => event.title))).map((title, index) => (
            <option key={index} value={title}>
              {title}
            </option>
          ))}
        </select>

        {/* Title Input */}
        <input
          type="text"
          name="title"
          placeholder="Filter by Title"
          value={filters.title}
          onChange={(e) => {
            const value = e.target.value;
            setFilters((prevFilters) => ({
              ...prevFilters,
              title: value
            }));
          }}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />

        {/* Editor Filter */}
        <input
          type="text"
          name="editor"
          placeholder="Filter by Editor"
          value={filters.editor}
          onChange={handleFilterChange}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />

        {/* Event Type Filter */}
        <select
          name="eventType"
          value={filters.eventType}
          onChange={handleFilterChange}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="">All Event Types</option>
          <option value="PageEdited">PageEdited</option>
          {/* Add more event types as needed */}
        </select>

        {/* Start Date Filter */}
        <input
          type="datetime-local"
          name="startDate"
          value={filters.startDate}
          onChange={handleFilterChange}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />

        {/* End Date Filter */}
        <input
          type="datetime-local"
          name="endDate"
          value={filters.endDate}
          onChange={handleFilterChange}
          className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
      </div>

      {/* Selection Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-full prose dark:prose-dark">
        {/* Select Edit 1 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Edit 1</h3>
          <select
            onChange={handleSelectEdit1}
            className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Select an Edit --</option>
            {filteredEvents.map(edit => (
              <option key={edit.id} value={edit.id}>
                {`${edit.title} by ${edit.editor} at ${new Date(edit.createdAt).toLocaleString()}`}
              </option>
            ))}
          </select>
          {decodedData1 && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
              <p><strong>Title:</strong> {decodedData1[0]}</p>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
              >
                {decodedData1[1]}
              </ReactMarkdown>
              <button
                onClick={() => restore(decodedData1[0], decodedData1[1], true)}
                className="mt-2 bg-green-600 dark:bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
              >
                Restore Page 1
              </button>
            </div>
          )}
        </div>

        {/* Select Edit 2 */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Edit 2</h3>
          <select
            onChange={handleSelectEdit2}
            className="w-full p-3 border border-blue-300 dark:border-blue-600 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">-- Select an Edit --</option>
            {filteredEvents.map(edit => (
              <option key={edit.id} value={edit.id}>
                {`${edit.title} by ${edit.editor} at ${new Date(edit.createdAt).toLocaleString()}`}
              </option>
            ))}
          </select>
          {decodedData2 && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow-inner">
              <p><strong>Title:</strong> {decodedData2[0]}</p>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSlug]}
              >
                {decodedData2[1]}
              </ReactMarkdown>
              <button
                onClick={() => restore(decodedData2[0], decodedData2[1], false)}
                className="mt-2 bg-green-600 dark:bg-green-500 text-white py-1 px-3 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200"
              >
                Restore Page 2
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Diff Only */}
      <div className="flex justify-center">
        <label className="inline-flex items-center text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            className="form-checkbox h-5 w-5 text-green-600 dark:text-green-400"
            checked={diffOnly}
            onChange={() => setDiffOnly(!diffOnly)}
          />
          <span className="ml-2">Show Differences Only</span>
        </label>
      </div>

      {/* Compare Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleCompare}
          className={`flex items-center justify-center bg-green-600 dark:bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-700 dark:hover:bg-green-600 transition-colors duration-200 ${
            (!decodedData1 || !decodedData2) ? 'cursor-not-allowed opacity-50' : ''
          }`}
          disabled={!decodedData1 || !decodedData2}
        >
          Compare Edits
        </button>
      </div>

      {/* Diff Display Section */}
      {showDiff && decodedData1 && decodedData2 && (
        <div>
          <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4 flex items-center">
            <span className="mr-2">📊</span> Differences:
          </h3>
          <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 overflow-auto">
            <DiffViewer
              oldValue={`Title: ${decodedData1[0]}\nContent: ${decodedData1[1]}`}
              newValue={`Title: ${decodedData2[0]}\nContent: ${decodedData2[1]}`}
              splitView={true}
              showDiffOnly={diffOnly}
              styles={{
                variables: {
                  light: {
                    diffViewerBackground: '#f5f5f5',
                    addedBackground: '#acf2bd', // Light green for additions
                    addedColor: '#24292e',
                    removedBackground: '#ffeef0', // Light red for removals
                    removedColor: '#24292e',
                    wordAddedBackground: '#acf2bd',
                    wordRemovedBackground: '#ffeef0',
                  },
                  dark: {
                    diffViewerBackground: '#2d2d2d',
                    addedBackground: '#3a5d31',
                    addedColor: '#c9d1d9',
                    removedBackground: '#5a1e1e',
                    removedColor: '#c9d1d9',
                    wordAddedBackground: '#58a55c',
                    wordRemovedBackground: '#e06c75',
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
