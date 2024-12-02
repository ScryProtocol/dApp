// src/App.js

import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { useEthersProvider, useEthersSigner } from './tl'; // Ensure these hooks are correctly defined
import { Alchemy, Network } from 'alchemy-sdk';
import ReactMarkdown from 'react-markdown';

const CONTRACT_ADDRESS = '0x1c4B48FF835d86f597a967a571aA9cB1fF91822F'; // Replace with your contract address

// Define the Source contract ABI
const SourceABI = [
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
  "function slash(address user, uint256 amount) external",
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

  // Initialize Ethers.js and Contract
  useEffect(() => {
    const init = async () => {
      if (provider && signer) {
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, SourceABI, signer);
        setContract(tempContract);
setPageTitle('home');
setWikiViewTitle('home');
      const page = await tempContract.getPage('home');
      setWikiViewContent(page[0]);
      setWikiEditors(page[1]);
      setWikiTimestamps(page[2]);
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
        let rewards
        let claimed = (Number(ethers.formatEther(await tempContract.claimed(account))))
        let staked = (Number(ethers.formatEther(stakedInfo.amount)))
        console.log(claimed)
        console.log(staked)
        let totalSupply=Number(ethers.formatEther(await tempContract.totalSupply()))
        let totalTips=Number(ethers.formatEther(await tempContract.totalTips()))
        let balance=Number(ethers.formatEther(userBalance))
        console.log('totalSupply',totalSupply,'totalTips',totalTips,'balance',balance,'staked',staked)
        rewards=(totalTips-claimed)*(balance+staked)/totalSupply
        setRewards(rewards)
        // Check if user has MAINT_ROLE
        const MAINT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("MAINT_ROLE"));
        const hasMaintRole = await tempContract.hasRole(MAINT_ROLE, account);
        setIsMaint(hasMaintRole);
//        setWikiViewTitle('home');
        setTotalSupply({totalSupply,totalTips,claimed})

        // Fetch existing wiki pages
        fetchWikiPages(tempContract);
      }
    };
    init();
  }, [provider, signer, account]);

  // Fetch Wiki Pages
  const fetchWikiPages = async (contractInstance) => {
    try {
      setWikiPages(['home', 'about', 'contact']);
      const pages = await contractInstance.getLatestPages(20);
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
      const tx = await contract.createPage(pageTitle, pageContent);
      await tx.wait();
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
      const tx = await contract.editPage(wikiViewTitle, pageContent);
      await tx.wait();
      setWikiStatus('Page Edited!');
      toast.success('Wiki page edited successfully!');
      setPageTitle('');
      setPageContent('');
      // Refresh wiki pages
      fetchWikiPages(contract);
    } catch (error) {
      console.error(error);
      setWikiStatus('Failed!');
      toast.error('Failed to edit wiki page.');
    }
  };

  // View Wiki Page Function
  const viewPage = async (pa) => {
    console.log(pa)
    if (!contract) return;
    try {
      const page = await contract.getPage(pa?pa:wikiViewTitle);
      setWikiViewContent(page[0]);
      setWikiEditors(page[1]);
      setWikiTimestamps(page[2]);
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
      const tx = await contract.slash(slashUser, ethers.parseUnits(slashAmount, 18));
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

  // Filtered Wiki Pages based on search
  const filteredWikiPages = wikiPages.filter(page =>
    page.toLowerCase().includes(wikiSearch.toLowerCase())
  );

    const navigation = [
      { name: 'Dashboard', section: 'dashboard' },
      { name: 'Wiki', section: 'wiki' },        
    ];
  
    // Maintenance Navigation Items
    const maintNavigation = [
      { name: 'Role Management', section: 'roles' },
      { name: 'Admin Panel', section: 'admin' },
    ];
    const components = {
      // Custom renderer for link nodes
      a: ({ href, children, ...props }) => {
        // Check if the href contains an "@" symbol
        const containsAtSymbol = href.includes("@");
    
        if (containsAtSymbol) {
          // Render a button if the link contains "@"
          let page = href.split("@")[1];
          return (
            <button
              onClick={() => {toast.success('Loading');setWikiViewTitle(page); viewPage(page);}}
              className="bg-blue-400 text-white px-2 rounded-full shadow hover:bg-blue-600 transition duration-200"
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
            className="text-blue-600 underline px-1 rounded hover:bg-blue-200 transition-colors duration-200"
            target="_blank" // Opens link in a new tab
            rel="noopener noreferrer" // Security best practices
          >
            {children}
          </a>
        );
      },
    };
    
  
    
    const [modal, setModal] = useState(false);
    const [nav, setNav] = useState(true);
    return (
      <div className="flex min-h-screen bg-blue-100">
        {!nav&&(
  <button onClick={() => setNav(!nav)} className="bg-blue-400 text-white px-2.5 py-1 rounded-full font-bold hover:bg-blue-600 transition-colors duration-200 mt-2 absolute top-0 left-2">
  ⇨ </button>  
        )}
        {/* Sidebar */}{nav&&(
        <aside className="w-72 bg-gradient-to-b from-blue-300 to-blue-500 text-white flex flex-col relative">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-20 bg-blue-500">
            <h1 className="text-3xl font-bold">Source</h1>
          </div>
  <button onClick={() => setNav(!nav)} className="bg-blue-400 text-white px-3 py-1 rounded-full font-bold hover:bg-blue-600 transition-colors duration-200 mt-2 absolute top-0 left-2">
  X
  </button>  
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 font-semibold">
            <ul>
              {navigation.map((item) => (
                <li
                  key={item.section}
                  className={`flex items-center p-3 my-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    currentSection === item.section
                      ? 'bg-blue-600'
                      : 'hover:bg-blue-600 hover:bg-opacity-75'
                  }`}
                  onClick={() => setCurrentSection(item.section)}
                >
                  <span className="text-lg">{item.name}</span>
                </li>
              ))}
  
              {/* Conditional Rendering for Maintenance Roles */}
              {isMaint && maintNavigation.map((item) => (
                <li
                  key={item.section}
                  className={`flex items-center p-3 my-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    currentSection === item.section
                      ? 'bg-blue-600'
                      : 'hover:bg-blue-600 hover:bg-opacity-75'
                  }`}
                  onClick={() => setCurrentSection(item.section)}
                >
                  <span className="text-lg">{item.name}</span>
                </li>
              ))}
            </ul>
            <h3 className="text-lg font-semibold text-white bg-blue-400 p-2 rounded-full w-1/2 mx-auto mt-4 text-center">
            Latest Pages</h3>
            {wikiPages.length > 0 && (
              <div className="mt-4">
                <ul className="mt-4">
                  {filteredWikiPages.map((page, index) => (
                    <li
                      key={index}
                      className={`items-center p-3 my-2 rounded-full ${
                        index % 10 === 0 ? 'bg-blue-200' : index % 10 === 1 ? 'bg-pink-200' : index % 10 === 2 ? 'bg-green-200' : index % 10 === 3 ? 'bg-yellow-200' : index % 10 === 4 ? 'bg-red-200' : index % 10 === 5 ? 'bg-indigo-200' : index % 10 === 6 ? 'bg-purple-200' : index % 10 === 7 ? 'bg-blue-200' : index % 10 === 8 ? 'bg-yellow-200' : 'bg-green-200'
                      } cursor-pointer transition-colors duration-200 text-center`}
                                            onClick={() => {toast.success('Loading');setWikiViewTitle(page); viewPage(page);}}
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
            <h1 className="text-4xl font-semibold text-blue-500">
              Welcome, {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Guest'}
            </h1>
            <ConnectButton />
          </div>
  
          {/* Dynamic Sections */}
          {currentSection === 'wiki' && (
            <section className="">
              {/* Search Wiki Pages */}
              <div className="mb-8 max-w-2xl align-middle mx-auto">
                <h2 className="text-2xl font-bold text-blue-500 mb-4">🔍 Search Wiki Pages</h2>
                <div className="flex flex-col md:flex-row items-stretch">
                  <input
                    type="text"
                    placeholder="Page Title to View"
                    value={wikiViewTitle}
                    onChange={(e) => setWikiViewTitle(e.target.value)}
                    className="flex-1 p-3 border border-blue-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => viewPage()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    👁️ View
                  </button>
                </div>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-lg relative items-center justify-center">
                
              <button onClick={() => setModal(!modal?'create':'')} className="bg-blue-400 text-white px-3 mx-auto py-1 md:px-6 md:py-3 left-20 right-20 md:left-auto mt-0 rounded-full hover:bg-blue-700 transition-colors duration-200 md:mt-4 absolute top-0 md:right-4 mx-auto">
                  📝 Create/Edit Page
                </button>
                <div className="mt-2">
                  <h3 className="text-3xl font-semibold text-white mb-2 text-center bg-blue-400 p-2 rounded-full w-[fit-content] px-6 mx-auto">
                  {wikiViewTitle.toLocaleUpperCase()}</h3>

                  {wikiViewContent ? (
                    <div className="prose max-w-none">
                    <ReactMarkdown components={components}>{wikiViewContent}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-gray-500">No content available.</p>
                  )}
                  {wikiEditors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-lg text-blue-600 mb-2">📜 Edit History:</h4>
                      <ul className="list-disc list-inside text-gray-700">
                        {wikiEditors.map((editor, index) => (
                          <li key={index}>
                            {editor} at {new Date(Number(wikiTimestamps[index]) * 1000).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
  
              {/* Wiki Management */}
              {modal&&(
              <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full flex items-center justify-center">
             <div className="bg-blue-200 md:max-w-5xl md:w-3/4 mx-auto p-8 rounded-2xl shadow-lg mt-8 overflow-y-auto relative max-h-full"
             style={{scrollbarWidth: 'none', msOverflowStyle: 'none'

             }}>
                <button onClick={() => setModal(false)} className="absolute top-4 right-4 bg-red-400 text-white font-bold px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-200">
                  X
                </button>
                <h4 className="font-bold bg-orange-400 text-white p-1 rounded-3xl max-w-xl mx-auto text-center">Creating/Editing Pages Stakes 100 SOURCE</h4>
                <h2 className="text-2xl font-bold text-blue-700 mb-6">📖 Wiki Management</h2>
                <button onClick={() => setModal(modal=='create'?'edit':'create')} className="bg-blue-400 text-white px-6 py-3 mx-auto rounded-full hover:bg-blue-700 transition-colors duration-200 mb-4">
                  {modal=='create'?'✏️ Edit Page':'🆕 Create Page'}
                  </button>
                  {/* Create Page */}
                  {modal=='create'&&(
                  <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4">🆕 Create Page</h3>
                    <input
                      type="text"
                      placeholder="Page Title"
                      value={pageTitle}
                      onChange={(e) => setPageTitle(e.target.value)}
                      className="w-full p-3 border border-blue-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Page Content (Markdown Supported)"
                      value={pageContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      className="w-full p-3 border border-blue-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="6"
                    />
                    <button
                      onClick={createPage}
                      className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
                    >
                      🆕 Create Page
                    </button>
                    {wikiStatus && <p className="mt-2 text-sm text-green-600">{wikiStatus}</p>}
                  </div>
                  )}
  {modal=='edit'&&(
              <div className="bg-white/70 p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold text-blue-600 mb-4">✏️ Edit Page</h3>
                    <textarea
                      placeholder="New Page Content (Markdown Supported)"
                      value={pageContent!='' ? pageContent : wikiViewContent}
                      onChange={(e) => setPageContent(e.target.value)}
                      className="w-full p-3 border border-blue-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="6"
                    />
                    <button
                      onClick={editPage}
                      className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors duration-200"
                    >
                      ✏️ Edit Page
                    </button>
                    {wikiStatus && <p className="mt-2 text-sm text-orange-600">{wikiStatus}</p>}
                    
            </div>
              )}
              {pageContent!='' && (
                <div className="bg-white p-8 rounded-2xl shadow-lg mt-2">
                  <div className="mt-2">
                    <h3 className="text-3xl font-semibold text-white mb-2 text-center bg-blue-400 p-2 rounded-full w-[fit-content] px-4 mx-auto">
                    Preview</h3>
                    {pageContent ? (
                      <div className="prose max-w-none">
                        <ReactMarkdown components={components}>{pageContent}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-gray-500">No content available.</p>
                    )}
                  </div>
                </div>
                )}</div>
                </div>
              )}
            </section>
          )}
  
          {currentSection === 'dashboard' && (<section className="bg-white p-8 rounded-2xl shadow-lg">
  <h2 className="text-3xl font-bold text-blue-700 mb-8">📊 Dashboard</h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
    {/* Balance Card */}
    <div className="bg-blue-100 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-blue-800 mb-2">Balance</h3>
      <p className="text-3xl font-bold">{balance} SOURCE</p>
      <div className="mt-4">
        <h4 className="text-blue-600 font-semibold text-sm mb-2">🛒 Buy Tokens</h4>
        <input
          type="number"
          placeholder="Amount to buy"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          className="w-full p-3 border border-blue-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={buyTokens}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          🆕 Buy SOURCE
        </button>
        {buyStatus && <p className="mt-2 text-sm text-green-600">{buyStatus}</p>}
        <p className="mt-2 text-xs text-gray-600">Price: 0.01 ETH per 1000 SOURCE</p>
        <h2 className="font-bold text-blue-500 mb-2 mt-4 text-center">SOURCE left</h2>
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                SOURCE
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-blue-600">
                {totalSupply.totalSupply} bought / 100,000,000 SOURCE
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
            <div
              style={{ width: `${(totalSupply.totalSupply / 100000000) * 1000000}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
            ></div>
          </div>
          </div>
        
      </div>
    </div>
    {/* Staked Card */}
    <div className="bg-green-100 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-green-800 mb-2">Staked</h3>
      <p className="text-3xl font-bold">{staked.amount} SOURCE</p>
      <div className="mt-4">
        <h4 className="text-green-600 font-semibold text-sm mb-2">⛓️ Manage Staking</h4>
        <input
          type="number"
          placeholder="Amount"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          className="w-full p-3 border border-green-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={stakeTokens}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-800 transition-colors duration-200"
        >
          ⛓️ Stake
        </button>
        <input
          type="number"
          placeholder="Amount"
          value={unstakeAmount}
          onChange={(e) => setUnstakeAmount(e.target.value)}
          className="w-full p-3 border border-yellow-300 rounded-lg mt-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button
          onClick={requestUnstake}
          className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200 mt-2"
        >
          🔓 Unstake
        </button>
        <h4 className="text-green-600 font-semibold text-sm mt-4 mb-2">Unstaking {staked.unstakedBalances} SOURCE</h4>
        <h4 className="text-green-600 font-semibold text-sm mb-2">Unstake Time {unstakeTime ? new Date(unstakeTime * 1000).toLocaleString() : 'N/A'}</h4>
        <button
          onClick={completeUnstake}
          className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200 mt-2"
        >
          🔓 Withdraw
        </button>
      </div>
    </div>
    {/* Rewards Card */}
    <div className="bg-purple-100 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-purple-800 mb-2">Rewards</h3>
      <p className="text-3xl font-bold">{rewards} SOURCE</p>
      <div className="mt-4">
        <h4 className="text-purple-600 font-semibold text-sm mb-2">🎁 Claim Rewards</h4>
        <button
          onClick={claimRewards}
          className="w-full bg-pink-500 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors duration-200"
        >
          🎉 Claim
        </button>
        {claimStatus && <p className="mt-2 text-sm text-pink-600">{claimStatus}</p>}
      </div>
      <h4 className="text-purple-600 font-semibold text-center mt-4 mb-2">Total Tips</h4>
      <h4 className="text-white font-semibold bg-purple-400 p-2 rounded-full text-center">
      {totalSupply.totalTips} SOURCE</h4>
      <h4 className="text-purple-600 font-semibold text-center mt-4 mb-2">Total Claimed</h4>
      <h4 className="text-white font-semibold bg-purple-500 p-2 rounded-full text-center">
      {totalSupply.claimed} SOURCE</h4>
    </div>
    {/* Total Tips Card */}
    <div className="bg-yellow-100 p-6 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">Total Tips</h3>
      <p className="text-3xl font-bold">{totalSupply.totalTips} SOURCE</p>
      <input 
      type="number"
      placeholder="Amount to tip"
      value={tipAmount}
      onChange={(e) => setTipAmount(e.target.value)}
      className="w-full p-3 border border-yellow-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
    />
    <button
      onClick={tipDAO}
      className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition-colors duration-200"
    >
      💸 Tip DAO
    </button>
    </div>
  </div>
</section>

          )}
  
          {/* Conditional Sections for Maintainers */}
          {currentSection === 'roles' && isMaint && (
            <section className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-blue-700 mb-8">👥 Role Management</h2>
              <div className="flex flex-col md:flex-row items-stretch gap-8">
                {/* Grant Edit Role */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md flex-1">
                  <h3 className="text-xl font-semibold text-green-600 mb-4">➕ Grant EDIT_ROLE</h3>
                  <input
                    type="text"
                    placeholder="Editor Address"
                    value={newEditor}
                    onChange={(e) => setNewEditor(e.target.value)}
                    className="w-full p-3 border border-green-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={grantEditRole}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors duration-200"
                  >
                    Grant EDIT_ROLE
                  </button>
                </div>
  
                {/* Revoke Edit Role */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md flex-1">
                  <h3 className="text-xl font-semibold text-red-600 mb-4">➖ Revoke EDIT_ROLE</h3>
                  <input
                    type="text"
                    placeholder="Editor Address"
                    value={newEditor}
                    onChange={(e) => setNewEditor(e.target.value)}
                    className="w-full p-3 border border-red-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={revokeEditRole}
                    className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    Revoke EDIT_ROLE
                  </button>
                </div>
              </div>
              {roleStatus && <p className="mt-4 text-sm text-blue-600">{roleStatus}</p>}
            </section>
          )}
  
          {currentSection === 'admin' && isMaint && (
            <section className="bg-white p-8 rounded-2xl shadow-lg">
              <h2 className="text-3xl font-bold text-blue-700 mb-8">🔧 Admin Panel</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Withdraw Funds */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold text-purple-600 mb-4">💰 Withdraw Funds</h3>
                  <input
                    type="number"
                    placeholder="Amount to withdraw (ETH)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full p-3 border border-purple-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={withdraw}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200"
                  >
                    💸 Withdraw
                  </button>
                  {withdrawStatus && <p className="mt-2 text-sm text-purple-600">{withdrawStatus}</p>}
                </div>
  
                {/* Slash User */}
                <div className="bg-gray-50 p-6 rounded-xl shadow-md">
                  <h3 className="text-xl font-semibold text-red-600 mb-4">🛑 Slash User</h3>
                  <input
                    type="text"
                    placeholder="User Address to Slash"
                    value={slashUser}
                    onChange={(e) => setSlashUser(e.target.value)}
                    className="w-full p-3 border border-red-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <input
                    type="number"
                    placeholder="Amount to Slash"
                    value={slashAmount}
                    onChange={(e) => setSlashAmount(e.target.value)}
                    className="w-full p-3 border border-red-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    onClick={slash}
                    className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
                  >
                    🚫 Slash
                  </button>
                  {slashStatus && <p className="mt-2 text-sm text-red-600">{slashStatus}</p>}
                </div>
              </div>
            </section>
          )}
        </main>
  
        {/* Toast Notifications */}
        <Toaster position="top-center" reverseOrder={false} />
      </div>
  );
};

export default App;
