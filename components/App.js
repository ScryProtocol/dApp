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
        {wikiSearch && filteredWikiPages.length > 0 &&window.location.href.split('@=')[1]!=wikiSearch&& (
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

export default App;
