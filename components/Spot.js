import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';

// Deployed factory address and ABI
const IOUMintAddress = '0xc497c2065C753A6fcC11ad6471d6bD16Bc3280CB';

const IOUMintABI = [
  'function deployLoan(address, address, uint256, uint256, uint256, address, string, string, bool) external returns (address)',
  'function getAllLoans() external view returns (address[])',
  'function getUserLoans(address) external view returns (address[])',
  'function getUserIOUs(address) external view returns (address[])',
  'function getLoans(uint256[] memory) external view returns (address[])',
  'function getSpotInfo(address[] memory, address) external view returns ( \
    tuple( \
      address loanAddress, \
      address borrower, \
      uint256 loanGoal, \
      uint256 totalFunded, \
      uint256 totalDrawnDown, \
      uint256 accruedInterest, \
      uint256 annualInterestRate, \
      uint256 platformFeeRate, \
      address feeAddress, \
      uint256 totalSupply, \
      string iouName, \
      string iouSymbol, \
      address underlying, \
      string underlyingName, \
      string underlyingSymbol, \
      uint8 underlyingDecimals, \
      uint256 updatedInterest, \
      uint256 updatedTotalOwed, \
      uint256 myIOUs, \
      uint256 repayments, \
      uint256 interestrepayments, \
      uint256 interestClaimable, \
      uint256 underlyingBalance, \
      uint256 redeemed, \
      bool flexible, \
    )[] memory)'
];

const SpotIOULoanABI = [
  'function fundLoan(uint256) external',
  'function drawDown(uint256) external',
  'function repayLoan(uint256) external',
  'function redeemIOUs(uint256) external',
  'function loanToken() external view returns (address)',
  'function borrower() external view returns (address)',
  'function loanGoal() external view returns (uint256)',
  'function totalFunded() external view returns (uint256)',
  'function annualInterestRate() external view returns (uint256)',
  'function decimals() external view returns (uint8)',
  'function unfundLoan(uint256) external',
  'function claimInterest(address) external',
  'function updateGoal(uint256) external',
];

// Minimal ERC20 ABI
const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint256)',
  'function allowance(address, address) view returns (uint256)',
  'function approve(address, uint256) returns (bool)',
];

function SpotIOUFactory() {
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address: userAddress } = useAccount();
  const chainId = useChainId();

  // Deploy fields
  // Borrower is set to userAddress by default; can be overridden
  const [loanToken, setLoanToken] = useState('');
  const [borrower, setBorrower] = useState('');
  const [loanGoal, setLoanGoal] = useState('');
  const [annualInterestRate, setAnnualInterestRate] = useState('');
  const [platformFeeRate, setPlatformFeeRate] = useState('');
  const [feeAddress, setFeeAddress] = useState('');
  const [iouName, setIouName] = useState('');
  const [iouSymbol, setIouSymbol] = useState('');
const [flexible, setFlexible] = useState(true);
  // Searching
  const [searchAddress, setSearchAddress] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  // Data arrays
  const [myLoans, setMyLoans] = useState([]);
  const [myIOUs, setMyIOUs] = useState([]);
  const [allLoans, setAllLoans] = useState([]);

  // Single input for user actions (fund, repay, etc.)
  const [actionAmount, setActionAmount] = useState('');

  // Accordion expansions
  const [expandedRowsSearch, setExpandedRowsSearch] = useState({});
  const [expandedRowsMyLoans, setExpandedRowsMyLoans] = useState({});
  const [expandedRowsMyIOUs, setExpandedRowsMyIOUs] = useState({});
  const [expandedRows, setExpandedRows] = useState({});

  const toggleExpandSearch = (index) => {
    setExpandedRowsSearch((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const toggleExpandMyLoans = (index) => {
    setExpandedRowsMyLoans((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const toggleExpandMyIOUs = (index) => {
    setExpandedRowsMyIOUs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const toggleExpand = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Info modal state + localStorage check
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const show = localStorage.getItem('showModal');
    if (show === 'false') {
      setShowModal(false);
    }
  }, []);

  // InfoModal component
  const InfoModal = () => {
    const [activeTab, setActiveTab] = useState('overview');
    
    if (!showModal) return null;

    const docs = {
      overview: {
      title: 'IOU.fi Overview',
      content: (
        <>
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 p-6 rounded-2xl mb-6 border border-blue-500/20">
          <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="text-xl font-bold text-blue-300">What is IOU.fi?</h3>
          </div>
          <p className="mb-4 text-gray-200 leading-relaxed">
          <strong className="text-blue-300">IOU.fi</strong> is a decentralized platform for creating, funding,
          and managing on-chain, tokenized loans. Each <strong className="text-purple-300">IOU</strong> represents
          a fraction of a loan, letting lenders and borrowers interact transparently
          and without needing to trust a middleman.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🏦</span>
            <h4 className="font-semibold text-green-300">For Lenders</h4>
          </div>
          <p className="text-sm text-gray-300">
            Fund loans and receive IOU tokens representing your share. Interest accrues automatically,
            and repayments are handled transparently on-chain.
          </p>
          </div>
          
          <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">💰</span>
            <h4 className="font-semibold text-orange-300">For Borrowers</h4>
          </div>
          <p className="text-sm text-gray-300">
            Deploy loan contracts with custom terms, access capital from multiple lenders,
            and manage repayments at your own pace.
          </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-4 rounded-xl border border-green-500/20">
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">📊</span>
          <div>
            <h4 className="font-semibold text-green-300 mb-2">Example Scenario</h4>
            <p className="text-sm text-gray-200">
            If you lend $1,000 to a loan with a 5% annual rate, you'll receive
            IOU tokens representing your share. As the borrower repays, you can claim
            your principal plus interest, or redeem your IOUs for immediate liquidity.
            </p>
          </div>
          </div>
        </div>
        </>
      )
      },
      
      deployment: {
      title: 'Mint/Deploy an IOU',
      content: (
        <>
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-6 rounded-2xl mb-6 border border-purple-500/20">
          <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h3 className="text-xl font-bold text-purple-300">Launch Your Loan</h3>
          </div>
          <p className="text-gray-200 mb-4">
          Create a specialized loan contract by configuring these key parameters:
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-gray-700/50 p-4 rounded-xl border-l-4 border-blue-400">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-3">🪙</span>
            <h4 className="font-semibold text-blue-300">Loan Token</h4>
          </div>
          <p className="text-sm text-gray-300">
            The ERC20 asset (e.g., DAI, USDC) you plan to borrow and repay.
          </p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-xl border-l-4 border-purple-400">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-3">🎯</span>
            <h4 className="font-semibold text-purple-300">Loan Goal</h4>
          </div>
          <p className="text-sm text-gray-300">
            The total principal amount you aim to raise from lenders.
          </p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-xl border-l-4 border-green-400">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-3">📊</span>
            <h4 className="font-semibold text-green-300">Interest Rate</h4>
          </div>
          <p className="text-sm text-gray-300">
            Annual rate in basis points (e.g., 500 = 5%). Interest accrues automatically.
          </p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-xl border-l-4 border-orange-400">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-3">🏷️</span>
            <h4 className="font-semibold text-orange-300">IOU Details</h4>
          </div>
          <p className="text-sm text-gray-300">
            Custom name and symbol for the ERC20 IOU tokens representing debt shares.
          </p>
          </div>
          <div className="bg-gray-700/50 p-4 rounded-xl border-l-4 border-pink-400">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-3">🟢</span>
            <h4 className="font-semibold text-pink-300">Flexible Loans</h4>
          </div>
            <p className="text-sm text-gray-300">
            Choose whether borrowers can withdraw and repay freely (flexible) or if repaid funds are locked for IOU holders (non-flexible).
            </p>
            </div>
        </div>

        <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/20">
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">⚡</span>
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Smart Contract Features</h4>
            <p className="text-sm text-gray-200">
            Your contract automatically monitors contributions, calculates interest,
            and orchestrates repayment logic until the loan is fully settled.
            </p>
          </div>
          </div>
        </div>
        </>
      )
      },

      funding: {
      title: 'Provide Funding',
      content: (
        <>
        <div className="bg-gradient-to-br from-green-900/30 to-teal-900/30 p-6 rounded-2xl mb-6 border border-green-500/20">
          <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">💎</span>
          </div>
          <h3 className="text-xl font-bold text-green-300">Earn Interest as a Lender</h3>
          </div>
          <p className="text-gray-200 mb-4">
          Fund loans and receive IOU tokens that automatically earn interest as borrowers repay.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-800/20 to-green-900/20 p-4 rounded-xl border border-green-500/30">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">📈</span>
            <h4 className="font-semibold text-green-300">How It Works</h4>
          </div>
          <ol className="text-sm text-gray-300 space-y-2">
            <li>1. Select a loan and click "Fund"</li>
            <li>2. Deposit tokens into the contract</li>
            <li>3. Receive IOU tokens (your share)</li>
            <li>4. Interest accrues automatically</li>
            <li>5. Claim earnings anytime</li>
          </ol>
          </div>

          <div className="bg-gradient-to-br from-blue-800/20 to-blue-900/20 p-4 rounded-xl border border-blue-500/30">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">⚡</span>
            <h4 className="font-semibold text-blue-300">Interest Features</h4>
          </div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Real-time calculation</li>
            <li>• Proportional to your share</li>
            <li>• Claim whenever you want</li>
            <li>• No complex manual steps</li>
            <li>• Transparent on-chain</li>
          </ul>
          </div>
        </div>

        <div className="bg-yellow-900/30 p-4 rounded-xl border border-yellow-500/20">
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">💡</span>
          <div>
            <h4 className="font-semibold text-yellow-300 mb-2">Pro Tip</h4>
            <p className="text-sm text-gray-200">
            Your IOUs represent both principal and interest claims. As repayments flow in,
            you can either claim accumulated interest or redeem IOUs for principal.
            </p>
          </div>
          </div>
        </div>
        </>
      )
      },

      borrowing: {
      title: 'Borrower Operations',
      content: (
        <>
        <div className="bg-gradient-to-br from-orange-900/30 to-red-900/30 p-6 rounded-2xl mb-6 border border-orange-500/20">
          <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-xl font-bold text-orange-300">Access Capital & Manage Repayments</h3>
          </div>
          <p className="text-gray-200 mb-4">
          Once funded, withdraw capital as needed and repay on your schedule while interest accrues transparently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-700/50 p-4 rounded-xl border border-blue-500/30">
          <div className="text-center mb-3">
            <span className="text-3xl">💰</span>
            <h4 className="font-semibold text-blue-300 mt-2">Withdraw</h4>
          </div>
          <p className="text-sm text-gray-300 text-center">
            Access funded capital when you need it for your project or business
          </p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-xl border border-green-500/30">
          <div className="text-center mb-3">
            <span className="text-3xl">🔄</span>
            <h4 className="font-semibold text-green-300 mt-2">Repay</h4>
          </div>
          <p className="text-sm text-gray-300 text-center">
            Make partial or full repayments at your convenience
          </p>
          </div>

          <div className="bg-gray-700/50 p-4 rounded-xl border border-purple-500/30">
          <div className="text-center mb-3">
            <span className="text-3xl">📊</span>
            <h4 className="font-semibold text-purple-300 mt-2">Track</h4>
          </div>
          <p className="text-sm text-gray-300 text-center">
            Monitor interest accrual and outstanding balance in real-time
          </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 p-5 rounded-xl border border-gray-600/50 mb-4">
          <h4 className="font-semibold text-blue-300 mb-3 flex items-center">
          <span className="text-xl mr-2">🔄</span>
          Loan Types Explained
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/30">
            <div className="flex items-center mb-2">
            <span className="text-lg mr-2">🟢</span>
            <h5 className="font-semibold text-green-300">Flexible Loans</h5>
            </div>
            <p className="text-sm text-gray-300">
            Withdraw and repay freely from available funds. Maximum flexibility for borrowers.
            </p>
          </div>

          <div className="bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
            <div className="flex items-center mb-2">
            <span className="text-lg mr-2">🔵</span>
            <h5 className="font-semibold text-blue-300">Non-Flexible Loans</h5>
            </div>
            <p className="text-sm text-gray-300">
            Repaid funds are locked for IOU holders, guaranteeing lender liquidity.
            </p>
          </div>
          </div>
        </div>

        <div className="bg-orange-900/30 p-4 rounded-xl border border-orange-500/20">
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">⏰</span>
          <div>
            <h4 className="font-semibold text-orange-300 mb-2">Interest Management</h4>
            <p className="text-sm text-gray-200">
            Interest continues to accrue on outstanding principal until fully repaid.
            You control the timing and size of repayments to manage your costs effectively.
            </p>
          </div>
          </div>
        </div>
        </>
      )
      },

      redemption: {
      title: 'Redeeming IOUs',
      content: (
        <>
        <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 p-6 rounded-2xl mb-6 border border-blue-500/20">
          <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">💎</span>
          </div>
          <h3 className="text-xl font-bold text-blue-300">Convert IOUs to Cash</h3>
          </div>
          <p className="text-gray-200 mb-4">
          When borrowers repay principal, those funds become available for IOU holders to redeem.
          </p>
        </div>

        <div className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 p-5 rounded-xl border border-indigo-500/20 mb-6">
          <h4 className="font-semibold text-indigo-300 mb-3 flex items-center">
          <span className="text-xl mr-2">🔄</span>
          How Redemption Works
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-start">
            <span className="text-lg mr-3 mt-1">1️⃣</span>
            <div>
              <h5 className="font-medium text-blue-300">Borrower Repays</h5>
              <p className="text-sm text-gray-300">Principal repayments flow into the contract</p>
            </div>
            </div>
            
            <div className="flex items-start">
            <span className="text-lg mr-3 mt-1">2️⃣</span>
            <div>
              <h5 className="font-medium text-purple-300">Funds Available</h5>
              <p className="text-sm text-gray-300">Repaid principal becomes redeemable</p>
            </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
            <span className="text-lg mr-3 mt-1">3️⃣</span>
            <div>
              <h5 className="font-medium text-green-300">You Redeem</h5>
              <p className="text-sm text-gray-300">Burn IOUs to claim your share</p>
            </div>
            </div>
            
            <div className="flex items-start">
            <span className="text-lg mr-3 mt-1">4️⃣</span>
            <div>
              <h5 className="font-medium text-orange-300">Receive Funds</h5>
              <p className="text-sm text-gray-300">Get proportional principal back</p>
            </div>
            </div>
          </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-yellow-900/30 p-4 rounded-xl border border-yellow-500/20">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">⚖️</span>
            <h4 className="font-semibold text-yellow-300">Strategic Decision</h4>
          </div>
          <p className="text-sm text-gray-300">
            Choose between redeeming early for liquidity or holding IOUs longer 
            to accumulate more interest payments.
          </p>
          </div>

          <div className="bg-red-900/30 p-4 rounded-xl border border-red-500/20">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🔥</span>
            <h4 className="font-semibold text-red-300">Permanent Action</h4>
          </div>
          <p className="text-sm text-gray-300">
            Redeemed IOUs are burned forever. You won't earn future interest 
            or repayments on those tokens.
          </p>
          </div>
        </div>

        <div className="bg-green-900/30 p-4 rounded-xl border border-green-500/20">
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">🔙</span>
          <div>
            <h4 className="font-semibold text-green-300 mb-2">Redeeming vs. Holding</h4>
            <p className="text-sm text-gray-200">
            Redeeming IOUs gives you immediate liquidity, but holding them allows you to earn
            more interest over time. Consider your cash flow needs and investment strategy.
            </p>
          </div>
          </div>
        </div>
        </>
      )
      },
      risks: {
      title: 'Risks and Considerations',
      content: (
        <>
        <div className="bg-gradient-to-br from-red-900/30 to-pink-900/30 p-6 rounded-2xl mb-6 border border-red-500/20">
          <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mr-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-red-300">Important Disclaimers</h3>
          </div>
          <p className="text-gray-200 mb-4">
          Please read and understand these risks before using IOU.fi:
          </p>
        </div>

        <div className="space-y-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-900/40 p-4 rounded-xl border border-yellow-500/30">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">📋</span>
            <h4 className="font-semibold text-yellow-300">Private Loans Only</h4>
          </div>
          <p className="text-sm text-gray-200">
            IOUs are for use with private loans and not public sale. We do not guarantee any liquidity or value of loans. 
            Make sure to check local laws or regulations before participating.
          </p>
          </div>

          <div className="bg-red-900/40 p-4 rounded-xl border border-red-500/30">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🔒</span>
            <h4 className="font-semibold text-red-300">Smart Contract Risks</h4>
          </div>
          <p className="text-sm text-gray-200">
            As with any smart contract protocol, there are inherent risks including bugs, vulnerabilities, 
            and potential loss of funds. Use only what you can afford to lose.
          </p>
          </div>

          <div className="bg-orange-900/40 p-4 rounded-xl border border-orange-500/30">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">🤝</span>
            <h4 className="font-semibold text-orange-300">Counterparty Risk</h4>
          </div>
          <p className="text-sm text-gray-200">
            Borrowers may default on their loans. While IOUs provide transparency, they don't guarantee repayment. 
            Always assess the creditworthiness of borrowers.
          </p>
          </div>

          <div className="bg-purple-900/40 p-4 rounded-xl border border-purple-500/30">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">⚖️</span>
            <h4 className="font-semibold text-purple-300">Liability</h4>
          </div>
          <p className="text-sm text-gray-200">
            IOU.fi is provided "as is" without warranties of any kind. By using this platform, you acknowledge 
            the risks and agree that the developers are not liable for any losses incurred.
          </p>
          </div>
        </div>

        <div className="bg-blue-900/30 p-4 rounded-xl border border-blue-500/20 mb-4">
          <div className="flex items-start">
          <span className="text-2xl mr-3 mt-1">💡</span>
          <div>
            <h4 className="font-semibold text-blue-300 mb-2">Stay Informed</h4>
            <p className="text-sm text-gray-200">
            Follow IOU.fi updates, community discussions, and security best practices to mitigate risks.
            Always do your own research before participating in any loan.
            </p>
          </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-800/30 to-pink-800/30 p-4 rounded-xl border border-red-400/30">
          <div className="text-center">
          <span className="text-3xl mb-2 block">🛡️</span>
          <h4 className="font-bold text-red-300 mb-2">Use at Your Own Risk</h4>
          <p className="text-sm text-gray-200">
            By proceeding, you acknowledge that you have read, understood, and accepted all risks associated with using IOU.fi.
          </p>
          </div>
        </div>
        </>
      )
      }
    };

    const tabItems = Object.keys(docs);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-gray-800 text-white w-full max-w-4xl rounded-3xl shadow-lg flex" style={{ maxHeight: '90vh' }}>
          {/* Sidebar tabs */}
          <div className="w-1/3 border-r border-gray-600 overflow-y-auto rounded-l-xl">
            <div className="flex align-items-center items-center justify-center my-2 mb-2 gap-2 bg-gray-700 px-4 py-1 rounded-full w-fit mx-auto">
              <a
                href="https://twitter.com/heyvault"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <svg
                  role="img"
                  fill="white"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                >
                  <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                </svg>
              </a>
              <a
                href="https://discord.gg/vrV4YpUccq"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="white"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
                </svg>
              </a>
            </div>
            {tabItems.map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`block w-full text-left px-4 py-3 border-b border-gray-600 hover:bg-gray-700 transition ${
                  activeTab === key
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-gray-300'
                }`}
              >
                {docs[key].title}
              </button>
            ))}
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  setShowModal(false);
                  localStorage.setItem('showModal', 'false');
                }}
                className="px-4 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-full mb-4 transition"
              >
                Got it!
              </button>
            </div>
          </div>

          {/* Right-side content */}
          <div className="w-2/3 p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-blue-400 mb-4">
              {docs[activeTab].title}
            </h2>
            <div className="text-gray-200">
              {docs[activeTab].content}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // On mount or user change, fetch data
  useEffect(() => {
    //if (!provider || !userAddress) return;
    // Default borrower to userAddress on load
    setBorrower(userAddress||'0x14B214CA36249b516B59401B3b221CB87483b53C');
    fetchAllData();
  }, [provider, userAddress]);

  const IOUMintContract = new ethers.Contract(IOUMintAddress, IOUMintABI, provider);

  const fetchAllData = async () => {
    try {
      console.log('Fetching data...');
      const loans = await IOUMintContract.getUserLoans(userAddress||'0x14B214CA36249b516B59401B3b221CB87483b53C');
      console.log('Loans:', loans);
      const ious = await IOUMintContract.getUserIOUs(userAddress||'0x14B214CA36249b516B59401B3b221CB87483b53C');
      const all = await IOUMintContract.getAllLoans();

      // Reverse for "newest first"
      const myLoansReversed = [...loans].reverse();
      const myIOUsReversed = [...ious].reverse();
      const allLoansReversed = [...all].reverse();

      const myLoansInfo = await fetchLoanInfo(myIOUsReversed);
      const myIOUsInfo = await fetchLoanInfo(myLoansReversed);
      const allLoansInfo = await fetchLoanInfo(allLoansReversed);

      setMyLoans(myLoansInfo);
      setMyIOUs(myIOUsInfo);
      setAllLoans(allLoansInfo);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch loans');
    }
  };

  /**
   * Fetch and format loan info, including a "redeemable" per-IOU field.
   */
  const fetchLoanInfo = async (loanAddresses) => {
    if (!loanAddresses || loanAddresses.length === 0) return [];
    try {
      const data = await IOUMintContract.getSpotInfo(loanAddresses, userAddress||'0x14B214CA36249b516B59401B3b221CB87483b53C');

      return data.map((info) => {
        const loanGoal = ethers.formatUnits(info.loanGoal, info.underlyingDecimals);
        const totalFunded = ethers.formatUnits(info.totalFunded, info.underlyingDecimals);
        const totalDrawnDown = ethers.formatUnits(info.totalDrawnDown, info.underlyingDecimals);
        const repayments = ethers.formatUnits(info.repayments, info.underlyingDecimals);
        const interestrepayments = ethers.formatUnits(info.interestrepayments, info.underlyingDecimals);
        const redeemed = ethers.formatUnits(info.redeemed, info.underlyingDecimals);
        const totalSupply = ethers.formatUnits(info.totalSupply, 18); // IOU tokens typically 18 decimals

        // "redeemable" = (principal repaid - total redeemed so far) / totalSupply
        // principalRepaid = (repayments - interestrepayments)
        const principalRepaid = parseFloat(repayments) - parseFloat(interestrepayments);
        const unredeemedPrincipal = principalRepaid - parseFloat(redeemed);
        let redeemableVal = 0;
        if (parseFloat(totalSupply) > 0) {
          redeemableVal = unredeemedPrincipal / parseFloat(totalSupply);
        }

        return {
          loanAddress: info.loanAddress,
          borrower: info.borrower,
          loanGoal,
          totalFunded,
          totalDrawnDown,
          accruedInterest: ethers.formatUnits(info.accruedInterest, info.underlyingDecimals),
          annualInterestRate: Number(info.annualInterestRate),
          platformFeeRate: Number(info.platformFeeRate),
          feeAddress: info.feeAddress,
          iouName: info.iouName,
          iouSymbol: info.iouSymbol,
          underlying: info.underlying,
          underlyingName: info.underlyingName,
          underlyingSymbol: info.underlyingSymbol,
          underlyingDecimals: info.underlyingDecimals,
          updatedInterest: ethers.formatUnits(info.updatedInterest, info.underlyingDecimals),
          updatedTotalOwed: ethers.formatUnits(info.updatedTotalOwed, info.underlyingDecimals),
          myIOUs: ethers.formatUnits(info.myIOUs, 18),
          repayments,
          interestrepayments,
          totalSupply,
          interestClaimable: ethers.formatUnits(info.interestClaimable, info.underlyingDecimals),
          underlyingBalance: ethers.formatUnits(info.underlyingBalance, info.underlyingDecimals),
          redeemed,
          redeemable: Number(info.flexible?1:redeemableVal.toFixed(6)),
          flexible: info.flexible,
        };
      });
    } catch (err) {
      console.error(err);
      toast.error('Error fetching loan details');
      return [];
    }
  };

  /**
   * Deploy new IOU-based Loan
   */
  const deployNewLoan = async () => {
    console.log(myLoans)
    if (!signer) {
      toast.error('Connect wallet first.');
      return;
    }
    if (!loanToken || !loanGoal) {
      toast.error('Please fill in the required fields.');
      return;
    }

    try {
      const factoryWithSigner = IOUMintContract.connect(signer);

      // Borrower defaults to userAddress if none specified
      let finalBorrower = borrower || userAddress;

      // Fee address fallback
      let finalFeeAddr = feeAddress || '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5';
      if (!ethers.isAddress(finalFeeAddr)) {
        const resolvedFee = await provider.resolveName(finalFeeAddr);
        if (!resolvedFee) throw new Error('Could not resolve fee ENS');
        finalFeeAddr = resolvedFee;
      }

      let decimals = 18;
      if (ethers.isAddress(loanToken) && loanToken !== ethers.ZeroAddress) {
        try {
          const token = new ethers.Contract(loanToken, tokenABI, provider);
          decimals = await token.decimals();
        } catch {
          console.log('Defaulting to 18 decimals');
        }
      }

      const _loanGoal = ethers.parseUnits(loanGoal, decimals);
      const _annual = parseInt(annualInterestRate) || 0;
      const _platform = parseInt(platformFeeRate) || 0;

      const tx = await factoryWithSigner.deployLoan(
        loanToken,
        finalBorrower,
        _loanGoal,
        _annual,
        _platform,
        finalFeeAddr,
        iouName || 'SpotIOU',
        iouSymbol || 'IOU',
        flexible,
      );
      await tx.wait();

      toast.success('Loan deployed! Refreshing...');
      setTimeout(fetchAllData, 2500);
    } catch (err) {
      console.error(err);
      toast.error('Error deploying new loan');
    }
  };

  /**
   * Interactions with SpotIOULoan
   */
  const getLoanContract = (loanAddress) =>
    new ethers.Contract(loanAddress, SpotIOULoanABI, signer || provider);

  const fundLoan = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Fund amount must be > 0');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const underlying = await loan.loanToken();

      if (underlying !== ethers.ZeroAddress) {
        const tok = new ethers.Contract(underlying, tokenABI, signer);
        const decimals = await tok.decimals();
        const parsed = ethers.parseUnits(amount, decimals);

        const allowance = await tok.allowance(userAddress, loanAddress);
        if (allowance < parsed) {
          const approveTx = await tok.approve(loanAddress, parsed);
          await approveTx.wait();
        }

        const tx = await loan.fundLoan(parsed);
        await tx.wait();

        toast.success('Funded loan successfully');
        fetchAllData();
      } else {
        toast.error('Native asset flow not handled in this snippet.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error funding loan.');
    }
  };

  const drawDown = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const underlying = await loan.loanToken();

      let decimals = 18;
      if (underlying !== ethers.ZeroAddress) {
        const tok = new ethers.Contract(underlying, tokenABI, provider);
        decimals = await tok.decimals();
      }

      const parsed =
        amount && Number(amount) > 0
          ? ethers.parseUnits(amount, decimals)
          : 0n;

      const tx = await loan.drawDown(parsed);
      await tx.wait();

      toast.success('Withdraw successful');
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error drawing down.');
    }
  };

  const repayLoan = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Repay amount must be > 0');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const underlying = await loan.loanToken();

      if (underlying !== ethers.ZeroAddress) {
        const tok = new ethers.Contract(underlying, tokenABI, signer);
        const decimals = await tok.decimals();
        const parsed = ethers.parseUnits(amount, decimals);

        // check allowance
        const allowance = await tok.allowance(userAddress, loanAddress);
        if (allowance < parsed) {
          const approveTx = await tok.approve(loanAddress, parsed);
          await approveTx.wait();
        }

        const tx = await loan.repayLoan(parsed);
        await tx.wait();

        toast.success('Repayment successful');
        fetchAllData();
      } else {
        toast.error('Native asset flow not handled.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error repaying loan.');
    }
  };

  const redeemIOUs = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Redeem amount must be > 0');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const decimals = await loan.decimals();
      const parsed = ethers.parseUnits(amount, decimals);

      const tx = await loan.redeemIOUs(parsed);
      await tx.wait();

      toast.success('IOUs redeemed successfully');
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error redeeming IOUs.');
    }
  };

  const claimInterest = async (loanAddress) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const tx = await loan.claimInterest(userAddress);
      await tx.wait();

      toast.success('Interest claimed successfully');
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error claiming interest.');
    }
  };

  const unfundLoan = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Unfund amount must be > 0');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const token = new ethers.Contract(await loan.loanToken(), tokenABI, signer);
      const decimals = await token.decimals();
      const parsed = ethers.parseUnits(amount, decimals);

      const tx = await loan.unfundLoan(parsed);
      await tx.wait();
      toast.success('Unfunded loan successfully');
      fetchAllData();
    } catch (err) {
      console.error(err);
      toast.error('Error unfunding loan.');
    }
  };

  const updateGoal = async (loanAddress, amount) => {
    if (!signer) {
      toast.error('Connect wallet first');
      return;
    }
    try {
      const loan = getLoanContract(loanAddress);
      const token = new ethers.Contract(await loan.loanToken(), tokenABI, signer);
      const decimals = await token.decimals();
      const parsed = ethers.parseUnits(amount, decimals);

      const tx = await loan.updateGoal(parsed);
      await tx.wait();
      toast.success('Updated loan goal successfully');
      fetchAllData();
    }
    catch (err) {
      console.error(err);
      toast.error('Error updating loan goal.');
    }
  };

  /**
   * Searching
   */
  useEffect(() => {
    if (!searchAddress) return;

    async function fetchLoan() {
      try {
        // If not a 0x, treat as loan ID
        if (!searchAddress.startsWith('0x')) {
          let [...loans] = await IOUMintContract.getLoans([searchAddress]);
          let results = await fetchLoanInfo(loans);
          setSearchResults(results);
          return;
        }
        // Otherwise treat as loan address or user address
        try {
          let results = await fetchLoanInfo([searchAddress]);
          setSearchResults(results);
          if (results.length === 0) {
            // If no direct result, check if it’s a user address with IOUs
            const [...loans] = await IOUMintContract.getUserIOUs(searchAddress);
            const userResults = await fetchLoanInfo(loans);
            setSearchResults(userResults);
          }
        } catch {}
      } catch (err) {
        console.error(err);
        toast.error('Error fetching search results');
      }
    }
    fetchLoan();
  }, [searchAddress]);

provider.on("network", (newNetwork, oldNetwork) => {
  // Only reload if the network actually changed (i.e. oldNetwork is defined)
  toast.success(`Network changed to ${newNetwork.name}`);
  if (oldNetwork) {
    fetchAllData();
  }
});
  // If URL includes ?loan=, auto-search
  useEffect(() => {
    const loc = window.location.href;
    const url = new URL(loc);
    const loanParam = url.searchParams.get('loan');
    if (loanParam) {
      setSearchAddress(loanParam);
    }
  }, []);
const StakingContractAddress = '0x014B214CA36249b516B59401B3b221CB87483b53C'; // Replace with actual staking contract address
const StakingABI = [
  'function stake(uint256 amount) external',
  'function withdraw(uint256 amount) external',
  'function getReward() external',
  'function earned(address account) view returns (uint256)',
  'function balanceOf(address account) view returns (uint256)',
  'function rewardToken() view returns (address)'
];
const [showStaking, setShowStaking] = useState(false);
function StakingSection() {
  const provider = useEthersProvider();
  const signer = useEthersSigner();
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  
  const [stakeToken, setStakeToken] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakedBalance, setStakedBalance] = useState('0');
  const [earnedReward, setEarnedReward] = useState('0');
  const [rewardTokenAddress, setRewardTokenAddress] = useState(ethers.ZeroAddress);
  const [rewardTokenSymbol, setRewardTokenSymbol] = useState('IOU');
  const [stakeTokenSymbol, setStakeTokenSymbol] = useState('');
  const [rewardRate, setRewardRate] = useState('0');
  
  const staking = new ethers.Contract(StakingContractAddress, StakingABI, provider);

  useEffect(() => {
    if (!provider || !userAddress) return;
    fetchStakingData();
  }, [provider, userAddress]);

  const fetchStakingData = async () => {
    try {
      const balance = await staking.balanceOf(userAddress);
      const earned = await staking.earned(userAddress);
      const rewardAddr = await staking.rewardToken();
      setStakedBalance(ethers.formatUnits(balance, 18));
      setEarnedReward(ethers.formatUnits(earned, 18));
      setRewardTokenAddress(rewardAddr);
      
      // Fetch token symbols
      if (stakeToken && ethers.isAddress(stakeToken)) {
        try {
          const token = new ethers.Contract(stakeToken, ['function symbol() view returns (string)'], provider);
          const symbol = await token.symbol();
          setStakeTokenSymbol(symbol);
        } catch (err) {
          setStakeTokenSymbol('TOKEN');
        }
      }
      
      if (rewardAddr !== ethers.ZeroAddress) {
        try {
          const rewardToken = new ethers.Contract(rewardAddr, ['function symbol() view returns (string)'], provider);
          const symbol = await rewardToken.symbol();
          setRewardTokenSymbol(symbol);
        } catch (err) {
          setRewardTokenSymbol('REWARD');
        }
      }
    } catch (err) {
      console.error('Fetch staking data error', err);
    }
  };

  const stakeTokens = async () => {
    if (!signer) return toast.error('Connect wallet first');
    if (!stakeAmount || Number(stakeAmount) <= 0) return toast.error('Enter valid amount');
    try {
      const tok = new ethers.Contract(stakeToken, tokenABI, signer);
      const decimals = await tok.decimals();
      const parsed = ethers.parseUnits(stakeAmount, decimals);
      const allowance = await tok.allowance(userAddress, StakingContractAddress);
      if (allowance < parsed) {
        const approveTx = await tok.approve(StakingContractAddress, parsed);
        await approveTx.wait();
      }
      const tx = await staking.connect(signer).stake(parsed);
      await tx.wait();
      toast.success('Staked successfully');
      fetchStakingData();
      setStakeAmount('');
    } catch (err) {
      console.error(err);
      toast.error('Error staking');
    }
  };

  const withdrawTokens = async () => {
    if (!signer) return toast.error('Connect wallet first');
    if (!stakeAmount || Number(stakeAmount) <= 0) return toast.error('Enter valid amount');
    try {
      const decimals = 18;
      const parsed = ethers.parseUnits(stakeAmount, decimals);
      const tx = await staking.connect(signer).withdraw(parsed);
      await tx.wait();
      toast.success('Withdrawn successfully');
      fetchStakingData();
      setStakeAmount('');
    } catch (err) {
      console.error(err);
      toast.error('Error withdrawing');
    }
  };

  const claimRewards = async () => {
    if (!signer) return toast.error('Connect wallet first');
    try {
      const tx = await staking.connect(signer).getReward();
      await tx.wait();
      toast.success('Rewards claimed');
      fetchStakingData();
    } catch (err) {
      console.error(err);
      toast.error('Error claiming rewards');
    }
  };

  return (
    <div className="w-full h-full fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
    onClick={(e) => { if (e.target === e.currentTarget) setShowStaking(false); }}
    >
    <div className="w-full fixed inset-0 z-50 top-1/2 h-fit max-w-4xl mx-auto mt-6 p-4 my-auto sm:p-6 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col ring-1 ring-[#36444c] md:hover:scale-105 transition-transform duration-300 -translate-y-1/2 overflow-y-auto max-h-[100vh]">
      <h1 className="text-blue-400 text-xl sm:text-2xl font-bold mb-4 uppercase tracking-wide">
        🥩 Staking Rewards
      </h1>
      <button
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        onClick={() => setShowStaking(false)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Side - Staking Actions */}
        <div className="space-y-4">
          <div>
            <label className="block font-semibold text-gray-200 mb-2 text-left">
              🪙 Select Token to Stake:
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-2"
              value={stakeToken}
              onChange={(e) => setStakeToken(e.target.value)}
            >
              <option value="">{!stakeToken ? 'Select Token' : stakeToken}</option>
              {chainId === 1 && (
                <>
                  <option value="0x6B175474E89094C44Da98b954EedeAC495271d0F">DAI</option>
                  <option value="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48">USDC</option>
                  <option value="0xdac17f958d2ee523a2206206994597c13d831ec7">USDT</option>
                  <option value="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2">WETH</option>
                  <option value="0x2260fac5e5542a773aa44fbcfedf7c193bc2c599">WBTC</option>
                </>
              )}
              {chainId === 8453 && (
                <>
                  <option value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</option>
                  <option value="0x4200000000000000000000000000000000000006">WETH</option>
                </>
              )}
              <option value="custom">Custom Token</option>
            </select>
            {stakeToken === 'custom' && (
              <input
                type="text"
                placeholder="Enter token address (0x...)"
                className="w-full px-4 py-3 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                onChange={(e) => setStakeToken(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="block font-semibold text-gray-200 mb-2 text-left">
              💰 Amount to Stake/Withdraw:
            </label>
            <input
              type="text"
              placeholder="0.0"
              className="w-full px-4 py-3 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <button 
              onClick={stakeTokens}
              className="px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold
                         rounded-full transition focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Stake
            </button>
            <button 
              onClick={withdrawTokens}
              className="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold
                         rounded-full transition focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              Withdraw
            </button>
            <button 
              onClick={claimRewards}
              className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold
                         rounded-full transition focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Claim
            </button>
          </div>
          <div className="bg-gray-700 rounded-2xl p-4">
            <h3 className="text-lg font-semibold text-orange-300 mb-2">How Staking Works</h3>
            <p className="text-gray-300 mb-3 text-sm ">
              Staking allows you to lock up your IOU loans or GG to earn $IOU rewards over time. $IOU is the native token of IOU.fi and is used for governance only.
            </p>
            <ul className="text-gray-300 text-sm space-y-1 text-left">
              <li>• Stake tokens to earn rewards</li>
              <li>• Rewards accrue over time</li>
              <li>• Claim rewards anytime</li>
              <li>• Withdraw staked tokens anytime</li>
            </ul>
          </div>
        </div>

        {/* Right Side - Staking Stats */}
        <div className="space-y-4 relative ">
          <div className="bg-gray-700 rounded-2xl p-4 h-full relative">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">Staking</h3>
            
            <div className="space-y-3">
              <div className="bg-gray-600 rounded-xl p-3">
                <p className="text-gray-400 text-sm mb-1">Staked Balance:</p>
                <p className="text-green-300 font-bold text-lg">
                  {Number(stakedBalance).toFixed(4)} {stakeTokenSymbol || 'TOKENS'}
                </p>
              </div>
              
              <div className="bg-gray-600 rounded-xl p-3">
                <p className="text-gray-400 text-sm mb-1">Earned Rewards:</p>
                <p className="text-purple-300 font-bold text-lg">
                  {Number(earnedReward).toFixed(6)} {rewardTokenSymbol || 'REWARDS'}
                </p>
              </div>
              
              <div className="bg-gray-600 rounded-xl p-3">
                <p className="text-gray-400 text-sm mb-1">{stakeTokenSymbol || 'Stake'} Available:</p>
                <p className="text-blue-300 font-bold text-lg">
                  {Number(stakedBalance).toFixed(4)} {stakeTokenSymbol || 'TOKENS'}
                </p>
              </div>
              <div className="bg-gray-600 rounded-xl p-3">
                <p className="text-gray-400 text-sm mb-1">$IOU Per {stakeTokenSymbol || 'Stake'}:</p>
                <p className="text-blue-300 font-bold text-lg">
                  {rewardRate ? `${rewardRate} per day` : 'Calculating...'}
                </p>
              </div>
            <a
              href="https://gg.iou.fi/"
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold
                         px-4 py-2 rounded-full transition text-center mt-4 md:absolute md:bottom-4 md:left-1/2 md:transform md:-translate-x-1/2 w-3/4"
            >
              Go to Gigastrat to Mint {stakeTokenSymbol || 'Stake'}
            </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-gray-900 to-gray-800 text-gray-200 flex flex-col items-center pb-10 px-4">

      <Toaster />

      {/* Head tags (for Next.js or basic meta) */}
      <head>
        <title>IOU.fi - Decentralized Loans</title>
        <meta name="description" content="Decentralized, fully on-chain tokenized loans" />
      </head>

      {/* The Info Modal */}
      <InfoModal />

      {/* Header / Nav */}
      <span className="text-xl font-bold mt-4 inline-flex items-center">
        <h2 className="text-3xl font-bold text-blue-400 relative top-2">IOU</h2>
        <span className="relative top-3">.fi</span>

        {/* Example social icons */}
        <a
          href="https://twitter.com/heyvault"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 ml-3 inline-flex items-center relative top-3"
        >
          <svg
            role="img"
            fill="#fff"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
          >
            <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
          </svg>
        </a>
        <a
          href="https://discord.gg/vrV4YpUccq"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 ml-3 inline-flex items-center relative top-3"
        >
          <svg
            role="img"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="#fff"
          >
            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
          </svg>
        </a>

        {/* Toggle modal with "?" */}
        <button
          className="text-2xl text-white px-2.5 py-0 ml-1.5 relative top-2.5"
          onClick={() => setShowModal(!showModal)}
        >
          ?
        </button>
      </span>
<div className="items-center justify-center">
        <button
          className="px-4 py-2 bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold
                     rounded-full mt-4 hover:from-blue-600 hover:to-blue-700 transition
                     focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => setShowStaking(!showStaking)}
        >
          {showStaking ? 'Hide Staking' : 'Stake for $IOU'}
        </button>
        {showStaking && <StakingSection />}
      </div>
        <div
          className="max-w-lg w-full mt-6 p-4 bg-gray-800 rounded-2xl shadow-lg text-center flex flex-col
             ring-1 ring-gray-600 hover:scale-105 transform transition-all duration-300"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-lg">🏦</span>
            </div>
            <h1 className="text-blue-400 text-xl font-bold uppercase tracking-wide">
              Mint an IOU
            </h1>
          </div>

          <div className="w-full space-y-4 text-left">
            {/* Loan Token */}
            <div>
              <label className="block font-semibold text-gray-200 mb-2 flex items-center text-sm">
          <span className="text-lg mr-2">🪙</span>
          Token:
              </label>
              <div className="relative">
          <select
            className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-lg placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-400 transition
              border border-gray-600 appearance-none cursor-pointer text-sm"
            value={loanToken}
            onChange={(e) => setLoanToken(e.target.value)}
          >
            <option value="">{!loanToken ? 'Select Token' : loanToken}</option>
            {chainId === 1 && (
              <>
                <option value="0x6B175474E89094C44Da98b954EedeAC495271d0F">DAI</option>
                <option value="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48">USDC</option>
                <option value="0xdac17f958d2ee523a2206206994597c13d831ec7">USDT</option>
                <option value="0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2">WETH</option>
                <option value="0x2260fac5e5542a773aa44fbcfedf7c193bc2c599">WBTC</option>
              </>
            )}
            {chainId === 8453 && (
              <>
                <option value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</option>
                <option value="0x4200000000000000000000000000000000000006">WETH</option>
              </>
            )}
            <option value="custom">Custom</option>
          </select>
              </div>
              {loanToken === 'custom' && (
          <input
            type="text"
            placeholder="Token address (0x...)"
            className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-lg placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-purple-400 transition
              border border-gray-600 mt-2 text-sm"
            onChange={(e) => setLoanToken(e.target.value)}
          />
              )}
            </div>

            {/* Borrower */}
            <div>
              <label className="block font-semibold text-gray-200 mb-2 flex items-center text-sm">
          <span className="text-lg mr-2">🤝</span>
          Borrower:
              </label>
              <div className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-lg 
          border border-gray-600 font-mono text-xs overflow-hidden flex items-center">
          <span className="text-green-400 mr-2">👤</span>
          <span className="truncate">{borrower || '0x14B214CA36249b516B59401B3b221CB87483b53C'}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
          <label className="block font-semibold text-gray-200 mb-2 flex items-center text-sm">
            <span className="text-lg mr-2">🎯</span>
            Goal:
          </label>
          <input
            type="text"
            placeholder="1000"
            className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-lg placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-green-400 transition
              border border-gray-600 text-sm"
            value={loanGoal}
            onChange={(e) => setLoanGoal(e.target.value)}
          />
              </div>
              <div>
          <label className="block font-semibold text-gray-200 mb-2 flex items-center text-sm">
            <span className="text-lg mr-2">📊</span>
            APR (bps):
          </label>
          <input
            type="text"
            placeholder="500 = 5%"
            className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-lg placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-yellow-400 transition
              border border-gray-600 text-sm"
            value={annualInterestRate}
            onChange={(e) => setAnnualInterestRate(e.target.value)}
          />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
          <label className="block font-semibold text-gray-200 mb-2 flex items-center text-sm">
            <span className="text-lg mr-2">🏷</span>
            Name:
          </label>
          <input
            type="text"
            placeholder="SpotIOU"
            className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-lg placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-pink-400 transition
              border border-gray-600 text-sm"
            value={iouName}
            onChange={(e) => setIouName(e.target.value)}
          />
              </div>
              <div>
          <label className="block font-semibold text-gray-200 mb-2 flex items-center text-sm">
            <span className="text-lg mr-2">🔖</span>
            Symbol:
          </label>
          <input
            type="text"
            placeholder="IOU"
            className="w-full px-3 py-2 bg-gray-700 text-gray-200 rounded-lg placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-purple-400 transition
              border border-gray-600 text-sm"
            value={iouSymbol}
            onChange={(e) => setIouSymbol(e.target.value)}
          />
              </div>
            </div>

            <button
              onClick={deployNewLoan}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 
          text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 
          focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-lg
          flex items-center justify-center space-x-2"
            >
              <span className="text-lg">🚀</span>
              <span>Deploy Loan</span>
            </button>
          </div>

          {/* Bottom Controls */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-600">
            <div className="flex">
              <ConnectButton />
            </div>
            <div className="flex-1 flex justify-end">
              <button
          onClick={() => setFlexible(!flexible)}
          className={`px-4 py-2 ${
            flexible 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white font-semibold rounded-lg transition transform hover:scale-105
            focus:outline-none focus:ring-2 ${
              flexible ? 'focus:ring-green-400' : 'focus:ring-blue-400'
            } shadow-lg flex items-center space-x-2`}
              >
          <span className="text-sm">{flexible ? '🟢' : '🔵'}</span>
          <span className="text-sm">{flexible ? 'Flexible' : 'Non-Flexible'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="w-full max-w-2xl mx-auto mt-6 text-center flex flex-col">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-lg">🔍</span>
            </div>
            <h2 className="text-blue-400 text-xl font-bold uppercase tracking-wide">
              Discover Loans
            </h2>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search by address or loan ID..."
              value={searchAddress}
              className="w-full px-4 py-3 bg-gray-700 text-gray-200 rounded-lg 
          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 
          transition border border-gray-600 pl-10"
              onChange={(e) => setSearchAddress(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-blue-400">🔍</span>
            </div>
          </div>
        </div>

        {/* SEARCH RESULTS */}
        {searchResults.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mt-6 p-4 bg-gray-800 rounded-2xl shadow-lg text-center flex flex-col ring-1 ring-gray-600">
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
            <span className="text-lg">🎯</span>
          </div>
          <h1 className="text-green-400 text-xl font-bold uppercase tracking-wide">
            Search Results
          </h1>
              </div>
              
              <button
          onClick={() => {
            setSearchResults([]);
            setSearchAddress('');
          }}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg 
            transition transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
          Close
              </button>
            </div>

            <div className="space-y-3 w-full">
              {searchResults.map((info, i) => {
          const isBorrower = userAddress?.toLowerCase() === info.borrower.toLowerCase();

          return (
            <div key={info.loanAddress} className="bg-gray-700 rounded-2xl shadow-md">
              <button
                onClick={() => toggleExpandSearch(i)}
                className="flex items-center justify-between px-4 py-3 w-full
            cursor-pointer hover:bg-gray-600 transition hover:rounded-2xl"
              >
                <div className="flex items-center grid grid-cols-1 sm:grid-cols-5 w-full gap-2 sm:gap-0">
            <span className="text-sm text-gray-300 flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(
              window.location.origin + '?loan=' + info.loanAddress
                  );
                  toast.success('Copied!');
                }}
                className="bg-gray-600 px-1 py-1 rounded-full"
              >
                🔗
              </button>
              <span>🧑‍💼 {info.borrower.slice(0, 6)}...{info.borrower.slice(-4)}</span>
            </span>
            
            <span className="text-sm text-blue-300 bg-gray-600 px-2 py-1 rounded-full mx-2">
              {!info.flexible ? '🔵' : '🟢'} {info.underlyingSymbol || 'TOKEN'}
            </span>
            <span className="text-sm text-purple-300 bg-gray-600 px-2 py-1 rounded-full mx-2">
              Goal: {info.loanGoal}
            </span>
            <span className="text-sm text-green-300 bg-gray-600 px-2 py-1 rounded-full mx-2">
              APR: {(info.annualInterestRate / 100).toFixed(2)}%
            </span>
            <span className="text-sm text-pink-300 bg-gray-600 px-2 py-1 rounded-full mx-2">
              Owed: {info.updatedTotalOwed}
            </span>
                </div>
                <div className="text-gray-400">
            {expandedRowsSearch[i] ? '▼' : '▶'}
                </div>
              </button>

              {expandedRowsSearch[i] && (
                    <div className="px-4 py-4 border-t border-gray-600">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                        <div>
                          <p className="text-gray-400 text-xs">IOU Name:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.iouName} ({info.iouSymbol})
                          </p>
                          <p className="text-gray-400 text-xs">{info.underlyingSymbol} Available:</p>
                          <p className="text-white font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.underlyingBalance}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Available to Borrow:</p>
                          <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {(
                              parseFloat(info.totalFunded) -
                              parseFloat(info.totalDrawnDown || '0')
                            ).toFixed(4)}
                          </p>
                          <p className="text-gray-400 text-xs">Borrower:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.borrower}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Total Funded:</p>
                          <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.totalFunded}
                          </p>
                          <p className="text-gray-400 text-xs">My IOUs:</p>
                          <p className="text-pink-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.myIOUs}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Repayments / Interest:</p>
                          <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.repayments} / {info.interestrepayments}
                          </p>
                          <p className="text-gray-400 text-xs">Interest Claimable:</p>
                          <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.interestClaimable}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Total Withdrawn:</p>
                          <p className="text-yellow-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.totalDrawnDown}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Redeemable/IOU:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.redeemable}
                          </p>
                        </div>
                      </div>

                      <ProgressBar info={info} />

                      <div className="mt-4 flex flex-col sm:flex-row items-center sm:space-x-2 space-y-2 sm:space-y-0">
                        <input
                          type="text"
                          placeholder="Amount"
                          value={actionAmount}
                          onChange={(e) => setActionAmount(e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-800 text-gray-100
                                     rounded-full placeholder-gray-500
                                     focus:outline-none focus:ring-2
                                     focus:ring-pink-400 transition"
                        />
                        <div className="flex-1 flex flex-wrap gap-2">
                          <button
                            onClick={() => fundLoan(info.loanAddress, actionAmount)}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold
                                       px-3 py-2 rounded-full text-sm flex-1"
                          >
                            Fund
                          </button>
                              <button
                                onClick={() => repayLoan(info.loanAddress, actionAmount)}
                                className="bg-red-500 hover:bg-red-600 text-white
                                           font-semibold px-3 py-2 rounded-full text-sm flex-1"
                              >
                                Repay
                              </button>
                          {isBorrower && (
                            <>
                              <button
                                onClick={() => drawDown(info.loanAddress, actionAmount)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white
                                           font-semibold px-3 py-2 rounded-full text-sm flex-1"
                              >
                                Withdraw
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                            className="bg-blue-600 hover:bg-blue-700 text-white
                                       font-semibold px-3 py-2 rounded-full text-sm flex-1"
                          >
                            Redeem
                          </button>
                          <button
                            onClick={() => claimInterest(info.loanAddress)}
                            className="bg-[#206a5d] hover:scale-105 text-white
                                       font-semibold px-3 py-2 rounded-full text-sm flex-1"
                          >
                            Claim
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
            </div>
          );
              })}
        </div>
        </div>
        )}
        {/* MY LOANS */}
      <div
        className="w-full max-w-4xl mx-auto mt-6 p-4 sm:p-6 bg-gray-800 rounded-3xl
                   shadow-lg text-center flex flex-col ring-1 ring-[#36444c]
                   md:hover:scale-105 transition-transform duration-300"
      >
        <h1 className="text-blue-400 text-xl sm:text-2xl font-bold mb-4 uppercase">🌟 My Loans</h1>
        {myLoans.length === 0 && <p className="text-gray-400">No loans found.</p>}

        <div className="space-y-2 w-full mt-4">
          {myLoans.map((info, i) => {
            const isBorrower =
              userAddress?.toLowerCase() === info.borrower.toLowerCase();

            return (
              <div key={info.loanAddress} className="bg-gray-700 rounded-3xl shadow-md">
                <button
                  onClick={() => toggleExpandMyLoans(i)}
                  className="flex items-center justify-between px-4 py-3 w-full
                             cursor-pointer hover:bg-gray-600/50 transition hover:rounded-3xl"
                >
                  <div className="flex items-center grid grid-cols-1 sm:grid-cols-5 w-full gap-2 sm:gap-0">
                    <span className="text-sm text-gray-300 flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(
                            window.location.origin + '?loan=' + info.loanAddress
                          );
                          toast.success('Copied to clipboard!');
                        }}
                        className="bg-gray-600 px-1 py-1 rounded-full"
                      >
                        🔗
                      </button>
                      <span>🧑‍💼 {info.borrower.slice(0, 6)}...{info.borrower.slice(-4)}</span>
                    </span>
                    
                    <span className="text-sm text-blue-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      {!info.flexible ? '🔵' : '🟢'}
                      {info.underlyingSymbol || 'TOKEN'}
                    </span>
                    <span className="text-sm text-purple-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      Goal: {info.loanGoal}
                    </span>
                    <span className="text-sm text-green-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      APR: {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="text-sm text-pink-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      Owed: {info.updatedTotalOwed}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {expandedRowsMyLoans[i] ? '▼' : '▶'}
                  </div>
                </button>

                {expandedRowsMyLoans[i] && (
                  <div className="px-4 py-4 border-t border-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <div>
                        <p className="text-gray-400 text-xs">IOU Name:</p>
                        <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.iouName} ({info.iouSymbol})
                        </p>
                        <p className="text-gray-400 text-xs">Available to Borrow:</p>
                        <p className="text-purple-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {(
                            parseFloat(info.totalFunded) -
                            parseFloat(info.totalDrawnDown || '0')
                          ).toFixed(4)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Total Funded:</p>
                        <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.totalFunded}
                        </p>
                        <p className="text-gray-400 text-xs">Interest:</p>
                        <p className="text-pink-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.updatedInterest}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Repayments / Interest:</p>
                        <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.repayments} / {info.interestrepayments}
                        </p>
                        <p className="text-gray-400 text-xs">Total Withdrawn:</p>
                        <p className="text-yellow-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.totalDrawnDown}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">{info.underlyingSymbol} Available:</p>
                        <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.underlyingBalance}
                        </p>
                        <p className="text-gray-400 text-xs">Loan (excl. interest):</p>
                        <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {(
                            parseFloat(info.updatedTotalOwed || '0') -
                            parseFloat(info.updatedInterest || '0')
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <ProgressBar info={info} />

                    <div className="mt-4 flex flex-col sm:flex-row items-center sm:space-x-2 space-y-2 sm:space-y-0">
                      <input
                        type="text"
                        placeholder="Amount"
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-800 text-gray-100
                                   rounded-full placeholder-gray-500
                                   focus:outline-none focus:ring-2
                                   focus:ring-pink-400 transition"
                      />
                      <div className="flex-1 flex flex-wrap gap-2">
                        <button
                          onClick={() => updateGoal(info.loanAddress, actionAmount)}
                          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold
                                     px-3 py-2 rounded-full text-sm flex-1"
                        >
                          Set Goal
                        </button>
                        {isBorrower && (
                          <>
                            <button
                              onClick={() => drawDown(info.loanAddress, actionAmount)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white
                                         font-semibold px-3 py-2 rounded-full text-sm flex-1"
                            >
                              Withdraw
                            </button>
                            <button
                              onClick={() => repayLoan(info.loanAddress, actionAmount)}
                              className="bg-red-500 hover:bg-red-600 text-white
                                         font-semibold px-3 py-2 rounded-full text-sm flex-1"
                            >
                              Repay
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                          className="bg-blue-600 hover:bg-blue-700 text-white
                                     font-semibold px-3 py-2 rounded-full text-sm flex-1"
                        >
                          Redeem
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* MY IOUs */}
      <div
        className="w-full max-w-4xl mx-auto mt-6 p-4 sm:p-6 bg-gray-800 rounded-3xl
                   shadow-lg text-center flex flex-col ring-1 ring-[#36444c]
                   md:hover:scale-105 transition-transform duration-300"
      >
        <h1 className="text-blue-400 text-xl sm:text-2xl font-bold mb-4 uppercase">👛 IOUs</h1>
        {myIOUs.length === 0 && <p className="text-gray-400">No IOUs found.</p>}

        <div className="space-y-2 w-full mt-4">
          {myIOUs.map((info, i) => {
            const isBorrower =
              userAddress?.toLowerCase() === info.borrower.toLowerCase();

            return (
              <div key={info.loanAddress} className="bg-gray-700 rounded-3xl shadow-md">
                <button
                  onClick={() => toggleExpandMyIOUs(i)}
                  className="flex items-center justify-between px-4 py-3 w-full
                             cursor-pointer hover:bg-gray-600/50 transition hover:rounded-3xl"
                >
                  <div className="flex items-center grid grid-cols-1 sm:grid-cols-5 w-full gap-2 sm:gap-0">
                    <span className="text-sm text-gray-300 flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(
                            window.location.origin + '?loan=' + info.loanAddress
                          );
                          toast.success('Copied to clipboard!');
                        }}
                        className="bg-gray-600 px-1 py-1 rounded-full"
                      >
                        🔗
                      </button>
                      <span>🧑‍💼 {info.borrower.slice(0, 6)}...{info.borrower.slice(-4)}</span>
                    </span>
                    <span className="text-sm text-blue-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                    {!info.flexible ? '🔵' : '🟢'}                        {info.underlyingSymbol || 'TOKEN'}
                    </span>
                    <span className="text-sm text-purple-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      Goal: {info.loanGoal}
                    </span>
                    <span className="text-sm text-green-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      APR: {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="text-sm text-pink-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      Owed: {info.updatedTotalOwed}
                    </span>
                  </div>
                  <div className="text-gray-400">
                    {expandedRowsMyIOUs[i] ? '▼' : '▶'}
                  </div>
                </button>

                {expandedRowsMyIOUs[i] && (
                  <div className="px-4 py-4 border-t border-gray-600">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                      <div>
                        <p className="text-gray-400 text-xs">IOU Name:</p>
                        <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.iouName} ({info.iouSymbol})
                        </p>
                        <p className="text-gray-400 text-xs">Withdrawn:</p>
                        <p className="text-purple-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.totalDrawnDown}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Total Funded:</p>
                        <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.totalFunded}
                        </p>
                        <p className="text-gray-400 text-xs">My IOUs:</p>
                        <p className="text-pink-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.myIOUs}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Repayments / Interest:</p>
                        <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.repayments} / {info.interestrepayments}
                        </p>
                        <p className="text-gray-400 text-xs">Interest Claimable/Owed:</p>
                        <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.interestClaimable} / {info.updatedInterest}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs">Borrower:</p>
                        <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.borrower}
                        </p>
                        <p className="text-gray-400 text-xs">Redeemable/IOU:</p>
                        <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                          {info.redeemable}
                        </p>
                      </div>
                    </div>

                    <ProgressBar info={info} />

                    <p className="text-white font-semibold mt-2">
                      {info.underlyingSymbol} Available: {info.underlyingBalance}
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row items-center sm:space-x-2 space-y-2 sm:space-y-0">
                      <input
                        type="text"
                        placeholder="Amount"
                        value={actionAmount}
                        onChange={(e) => setActionAmount(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-800 text-gray-100
                                   rounded-full placeholder-gray-500
                                   focus:outline-none focus:ring-2
                                   focus:ring-pink-400 transition"
                      />
                      <div className="flex-1 flex flex-wrap gap-2">
                        <button
                          onClick={() => fundLoan(info.loanAddress, actionAmount)}
                          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold
                                     px-3 py-2 rounded-full text-sm flex-1"
                        >
                          Fund
                        </button>
                        {isBorrower && (
                          <>
                            <button
                              onClick={() => drawDown(info.loanAddress, actionAmount)}
                              className="bg-yellow-500 hover:bg-yellow-600 text-white
                                         font-semibold px-3 py-2 rounded-full text-sm flex-1"
                            >
                              Withdraw
                            </button>
                            <button
                              onClick={() => repayLoan(info.loanAddress, actionAmount)}
                              className="bg-red-500 hover:bg-red-600 text-white
                                         font-semibold px-3 py-2 rounded-full text-sm flex-1"
                            >
                              Repay
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                          className="bg-blue-600 hover:bg-blue-700 text-white
                                     font-semibold px-3 py-2 rounded-full text-sm flex-1"
                        >
                          Redeem
                        </button>
                        <button
                          onClick={() => unfundLoan(info.loanAddress, actionAmount)}
                          className="bg-red-400 hover:bg-red-600 text-white
                                     font-semibold px-3 py-2 rounded-full text-sm flex-1"
                        >
                          Unfund
                        </button>
                        <button
                          onClick={() => claimInterest(info.loanAddress)}
                          className="bg-pink-400 hover:scale-105 text-white
                                     font-semibold px-3 py-2 rounded-full text-sm flex-1"
                        >
                          Claim
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ALL LOANS */}
      <div
        className="w-full max-w-4xl mx-auto mt-6 p-4 sm:p-6 bg-gray-800 rounded-3xl
                   shadow-lg text-center flex flex-col ring-1 ring-[#36444c]
                   md:hover:scale-105 transition-transform duration-300"
      >
        <h1 className="text-blue-400 text-xl sm:text-2xl font-bold mb-4 uppercase">All Loans</h1>
        {allLoans.length === 0 ? (
          <p className="text-gray-400">No loans found.</p>
        ) : (
          <div className="space-y-2">
            {allLoans.map((info, i) => {
              const isBorrower =
                userAddress?.toLowerCase() === info.borrower.toLowerCase();

              return (
                <div key={info.loanAddress} className="bg-gray-700 rounded-3xl shadow-md">
                  <button
                    onClick={() => toggleExpand(i)}
                    className="flex items-center justify-between px-4 py-3 w-full
                               cursor-pointer hover:bg-gray-600/50 transition hover:rounded-3xl"
                  >
                    <div className="text-sm text-gray-500 font-bold bg-gray-600/70 px-2 py-1 rounded-full mr-2">
                      #{allLoans.length - i - 1}
                    </div>
                    <div className="flex items-center grid grid-cols-1 sm:grid-cols-5 w-full gap-2 sm:gap-0">
                      <span className="text-sm text-gray-300 flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(
                              window.location.origin + '?loan=' + info.loanAddress
                            );
                            toast.success('Copied to clipboard!');
                          }}
                          className="bg-gray-600 px-1 py-1 rounded-full"
                        >
                          🔗
                        </button>
                        <span>🧑‍💼 {info.borrower.slice(0, 6)}...{info.borrower.slice(-4)}</span>
                      </span>
                    
                      <span className="text-sm text-blue-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      {!info.flexible ? '🔵' : '🟢'}{info.underlyingSymbol || 'TOKEN'}
                    </span>
                    <span className="text-sm text-purple-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      Goal: {info.loanGoal}
                    </span>
                    <span className="text-sm text-green-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      APR: {(info.annualInterestRate / 100).toFixed(2)}%
                    </span>
                    <span className="text-sm text-pink-300 bg-gray-600 px-3 py-1 rounded-full mx-2 sm:mx-0 sm:bg-transparent sm:rounded-none">
                      Owed: {info.updatedTotalOwed}
                    </span></div>
                    <div className="text-gray-400">
                      {expandedRows[i] ? '▼' : '▶'}
                    </div>
                  </button>

                  {expandedRows[i] && (
                    <div className="px-4 py-4 border-t border-gray-600">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-xs">IOU Name:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.iouName} ({info.iouSymbol})
                          </p>
                          <p className="text-gray-400 text-xs">Loan Goal:</p>
                          <p className="text-purple-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.loanGoal}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Total Funded:</p>
                          <p className="text-green-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.totalFunded}
                          </p>
                          <p className="text-gray-400 text-xs">My IOUs:</p>
                          <p className="text-pink-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.myIOUs}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Repayments / Interest:</p>
                          <p className="text-orange-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.repayments} / {info.interestrepayments}
                          </p>
                          <p className="text-gray-400 text-xs">Total Withdrawn:</p>
                          <p className="text-yellow-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.totalDrawnDown}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-xs">Borrower:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.borrower}
                          </p>
                          <p className="text-gray-400 text-xs">Redeemable:</p>
                          <p className="text-blue-200 font-semibold mb-2 bg-gray-600 px-3 py-1 rounded-full overflow-x-hidden">
                            {info.redeemable}
                          </p>
                        </div>
                      </div>

                      <ProgressBar info={info} />

                      <div className="mt-4 flex flex-col sm:flex-row items-center sm:space-x-2 space-y-2 sm:space-y-0">
                        <input
                          type="text"
                          placeholder="Amount"
                          value={actionAmount}
                          onChange={(e) => setActionAmount(e.target.value)}
                          className="flex-1 px-4 py-2 bg-gray-800 text-gray-100
                                     rounded-full placeholder-gray-500
                                     focus:outline-none focus:ring-2
                                     focus:ring-pink-400 transition"
                        />
                        <div className="flex-1 flex flex-wrap gap-2">
                          <button
                            onClick={() => fundLoan(info.loanAddress, actionAmount)}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold
                                       px-3 py-2 rounded-full text-sm flex-1"
                          >
                            Fund
                          </button>
                          {isBorrower && (
                            <>
                              <button
                                onClick={() => drawDown(info.loanAddress, actionAmount)}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white
                                           font-semibold px-3 py-2 rounded-full text-sm flex-1"
                              >
                                Withdraw
                              </button>
                              <button
                                onClick={() => repayLoan(info.loanAddress, actionAmount)}
                                className="bg-red-500 hover:bg-red-600 text-white
                                           font-semibold px-3 py-2 rounded-full text-sm flex-1"
                              >
                                Repay
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => redeemIOUs(info.loanAddress, actionAmount)}
                            className="bg-blue-600 hover:bg-blue-700 text-white
                                       font-semibold px-3 py-2 rounded-full text-sm flex-1"
                          >
                            Redeem
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * ProgressBar for visualizing:
 * - Funded vs Goal
 * - Withdrawn vs Goal
 * - Repaid principal vs total withdrawn
 */
function ProgressBar({ info }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // parse numeric
  const goal = parseFloat(info.loanGoal) || 0;
  const fundedVal = parseFloat(info.totalFunded) || 0;
  const withdrawnVal = parseFloat(info.totalDrawnDown) || 0;
  const totalRepaid =
    (parseFloat(info.repayments) || 0) - (parseFloat(info.interestrepayments) || 0);

  const fundedWidth = goal > 0 ? (fundedVal / goal) * 100 : 0;
  const withdrawnWidth = goal > 0 ? (withdrawnVal / goal) * 100 : 0;
  const repaidWidth = withdrawnVal > 0 ? (totalRepaid / withdrawnVal) * 100 : 0;

  // approximate center positions for tooltips
  const fundedTooltipLeft = fundedWidth / 2;
  const withdrawnTooltipLeft = withdrawnWidth / 2;
  const repaidTooltipLeft = repaidWidth / 2;

  return (
    <div className="relative w-full my-2">
      <div className="relative w-full h-5 rounded-full bg-blue-300/20 overflow-hidden">
        {/* Funded Segment */}
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${fundedWidth}%` }}
          onMouseEnter={() => setHoveredSegment('funded')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div className="h-full bg-blue-400 transition-transform duration-300 origin-left" />
        </div>

        {/* Withdrawn Segment */}
        <div
          className="absolute left-0 top-0 h-full"
          style={{ width: `${withdrawnWidth}%` }}
          onMouseEnter={() => setHoveredSegment('withdrawn')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div className="h-full bg-pink-400/75 transition-transform duration-300 origin-left" />
        </div>

        {/* Repaid Segment (overlay on the portion withdrawn) */}
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${(withdrawnWidth * repaidWidth) / 100}%`,
          }}
          onMouseEnter={() => setHoveredSegment('repaid')}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <div className="h-full bg-orange-400/75 transition-transform duration-300 origin-left" />
        </div>
      </div>

      {/* Tooltips */}
      {hoveredSegment === 'funded' && (
        <div
          className="absolute -top-8 pointer-events-none"
          style={{ left: `${fundedTooltipLeft}%` }}
        >
          <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
            Funded: {fundedVal}/{goal} ({fundedWidth.toFixed(1)}%)
          </span>
        </div>
      )}
      {hoveredSegment === 'withdrawn' && (
        <div
          className="absolute -top-8 pointer-events-none"
          style={{ left: `${withdrawnTooltipLeft}%` }}
        >
          <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
            Withdrawn: {withdrawnVal}/{goal} ({withdrawnWidth.toFixed(1)}%)
          </span>
        </div>
      )}
      {hoveredSegment === 'repaid' && (
        <div
          className="absolute -top-8 pointer-events-none"
          style={{ left: `${repaidTooltipLeft}%` }}
        >
          <span className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
            Repaid: {totalRepaid}/{withdrawnVal} ({repaidWidth.toFixed(1)}%)
          </span>
        </div>
      )}
    </div>
  );
}

export default SpotIOUFactory;
