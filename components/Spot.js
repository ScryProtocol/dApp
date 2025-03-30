import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';

// Deployed factory address and ABI
const IOUMintAddress = '0xD9AF0e405a335602b6F05E978b3177087F367738';

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
    return (
      <div>
        {showModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
            onClick={() => setShowModal(false)}
          >
            <div
              className="relative top-0 max-w-3xl w-full bg-gray-800 text-gray-300
                         rounded-3xl p-8 shadow-xl overflow-y-auto max-h-[90vh]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 #1A202C' }}
            >
              <h2 className="text-3xl font-extrabold mb-6 text-blue-400">
                Welcome to IOU.fi
              </h2>

              <p className="mb-6">
                <strong>IOU.fi</strong> is a decentralized platform for creating, funding,
                and managing on-chain, tokenized loans. Each <strong>IOU</strong> represents
                a fraction of a loan, letting lenders and borrowers interact transparently
                and without needing to trust a middleman. Here’s a detailed look at how it all works.
              </p>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">
                  Mint/Deploy an IOU
                </h3>
                <p className="mb-3">
                  If you’re seeking to borrow, you can launch a specialized loan contract by specifying:
                </p>
                <ul className="list-disc list-inside pl-4 space-y-2 mb-3">
                  <li>
                    <strong>Loan Token</strong> – The ERC20 asset (e.g., DAI, USDC) you plan to borrow and repay.
                  </li>
                  <li>
                    <strong>Loan Goal</strong> – The total principal you aim to raise.
                  </li>
                  <li>
                    <strong>Annual Interest Rate</strong> – Stated in basis points (e.g., 500 = 5%).
                  </li>
                  <li>
                    <strong>Borrower</strong> – The address authorized to withdraw loaned funds and initiate repayments.
                  </li>
                  <li>
                    <strong>IOU Token Name &amp; Symbol</strong> – Custom labels for the ERC20 IOU
                    tokens representing a share of the debt.
                  </li>
                </ul>
                <p>
                  This contract monitors contributions, accumulates interest on the outstanding
                  principal, and orchestrates repayment logic until the loan is finalized.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">
                  Provide Funding
                </h3>
                <p className="mb-3">
                  As a lender, simply select a loan and click “Fund.” You’ll deposit the designated token
                  into the loan contract, receiving IOUs that reflect your proportion of the total funds
                  raised. These tokens let you claim principal and any accumulated interest once repayments
                  begin.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">
                  Borrower Withdrawals &amp; Repayments
                </h3>
                <p className="mb-3">
                  Once enough capital is raised, the borrower can withdraw part or all of the funds to use
                  as needed. Over the loan’s duration, they’re responsible for repaying the principal plus
                  accrued interest. Partial repayments are possible, and each one updates the amount
                  available to lenders.
                </p>
                <p>
                  Borrowers can manage the frequency and size of repayments, but interest continues to
                  accrue on any outstanding principal until it’s fully settled.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">
                  Interest Accrual &amp; Claiming
                </h3>
                <p className="mb-3">
                  Interest is calculated in real time based on the annual rate and the remaining principal.
                  As the borrower repays, the contract allocates a share of the interest to each IOU holder.
                  Lenders can claim this interest whenever they choose, without any complex manual calculations
                  or extra steps.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">
                  Redeeming IOUs for Principal
                </h3>
                <p className="mb-3">
                  When principal repayments take place, that repaid portion becomes available for IOU holders
                  to redeem. Redeeming <strong>burns</strong> the IOUs you surrender, granting you the
                  corresponding share of principal. Once redeemed, those IOUs no longer earn future repayments
                  or interest, so you can decide whether to wait for more principal to accumulate or redeem
                  early for partial liquidity.
                </p>
              </section>

              <section className="mb-8">
                <h3 className="text-xl font-semibold mb-3 text-blue-300">
                  Optional “Unfund” Feature
                </h3>
                <p className="mb-3">
                  If the borrower hasn’t yet withdrawn your contribution, you can back out by “unfunding.”
                  This action returns your tokens and burns the IOUs you received, freeing you to reallocate
                  your capital elsewhere if circumstances change.
                </p>
              </section>
              <h3 className="text-xl font-semibold mb-3 text-blue-300">
              Flexible Loans
              </h3>
              <p className="mb-3">
                🟢 Flexible loans allow the borrower to withdraw and repay at any time from available funds vs being able to draw from a loan and on repayment having the funds locked for IOU holders to guarantee liquidity. 🟢 Flexible 🔵 Non
                </p>

              <h3 className="text-xl font-semibold mb-3 text-blue-300">
                My Loans &amp; IOUs
              </h3>
              <p className="mb-6">
                After connecting your wallet, you can set up a new loan or fund existing ones. In “My Loans”
                you'll see all loans you've created and “My IOUs” for all loans you’ve funded. Each section
                displays interest due, principal redeemed, and more. Explore IOU.fi and experience
                decentralized lending firsthand!
              </p>
              <p className="text-sm font-semibold mb-3 text-orange-300">
                Note: IOUs are for use with private loans and not public sale. We do not guarantee any liquidity or value of loans. 
                Make sure to check local laws or regulations before participating.
              </p>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(false);
                  localStorage.setItem('showModal', 'false');
                }}
                className="bg-blue-400 hover:bg-blue-500 text-white font-semibold px-4 py-2
                           rounded-full transition w-full focus:outline-none
                           focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              >
                Got it!
              </button>
            </div>
          </div>
        )}
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

      {/* Deploy a new IOU */}
      <div
        className="max-w-xl w-full mt-10 p-6 md:p-8 bg-gray-800 rounded-3xl shadow-lg text-center flex flex-col
                   ring-1 ring-[#36444c] hover:scale-105 transform transition duration-300"
      >
        <h1 className="text-blue-400 text-3xl font-bold mt-2 mb-4 uppercase tracking-wide">
          Mint an IOU
        </h1>

        <div className="w-full space-y-4 text-left">
          {/* Loan Token */}
          <div>
            <label className="block font-semibold text-gray-200 mb-1">
              🪙 ERC20 Token Address:
            </label>
            <select
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                          focus:outline-none focus:ring-2 focus:ring-blue-400 transition mb-2"
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
              <option value="custom">Custom Token</option>
            </select>
            {loanToken === 'custom' && (
              <input
                type="text"
                placeholder="0x..."
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                onChange={(e) => setLoanToken(e.target.value)}
              />
            )}
          </div>

          {/* Borrower */}
          <div>
            <label className="block font-semibold text-gray-200 mb-1">
              🤝 Borrower Address / ENS:
            </label>
            {0==1&&<input
              type="text"
              value={borrower}
              placeholder="0x... or user.eth"
              className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              onChange={(e) => setBorrower(e.target.value)}
            />}
            <p className="bg-gray-700 text-gray-200 rounded-full px-4 py-2 mt-2 w-full overflow-hidden">
              {borrower || '0x14B214'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                🎯 Loan Goal:
              </label>
              <input
                type="text"
                placeholder="1000"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={loanGoal}
                onChange={(e) => setLoanGoal(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                📊 Annual Interest Rate (bps):
              </label>
              <input
                type="text"
                placeholder="500 = 5%"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={annualInterestRate}
                onChange={(e) => setAnnualInterestRate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                🏷 IOU Name:
              </label>
              <input
                type="text"
                placeholder="SpotIOU"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={iouName}
                onChange={(e) => setIouName(e.target.value)}
              />
            </div>
            <div>
              <label className="block font-semibold text-gray-200 mb-1">
                🔖 IOU Symbol:
              </label>
              <input
                type="text"
                placeholder="IOU"
                className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                value={iouSymbol}
                onChange={(e) => setIouSymbol(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={deployNewLoan}
            className="w-full py-2 bg-blue-400 hover:bg-[#356195] text-white font-semibold rounded-full transition
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Deploy Loan
          </button>
        </div>

        {/* Example ConnectButton at bottom of this section */}
        <div className="flex justify-between items-center mt-6">
          <div className="">
          <ConnectButton />
</div>
          <div className=""><button
            onClick={() => {
              setFlexible(!flexible);
            }
            }
            className={`w-28 p-2 ${flexible ? 'bg-green-400' : 'bg-blue-400'} hover:bg-[#356195] text-white font-semibold rounded-full transition
                       focus:outline-none focus:ring-2 focus:ring-blue-400 mx-auto ml-2`}
          >
            {flexible ? 'Flexible' : 'Non-Flexible'}
          </button>
          </div>
        </div>
      </div>

      {/* FIND A LOAN */}
      <div className="w-full max-w-lg mx-auto mt-6 text-center flex flex-col">
        <h2 className="text-blue-400 text-lg sm:text-2xl font-bold mb-4 uppercase mt-2">
          Find a Loan
        </h2>
        <input
          type="text"
          placeholder="Search by borrower address or loan address"
          value={searchAddress}
          className="w-full px-4 py-2 bg-gray-700 text-gray-200 rounded-full placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          onChange={(e) => setSearchAddress(e.target.value)}
        />
      </div>

      {/* SEARCH RESULTS (Accordion) */}
      {searchResults.length > 0 && (
        <div
          className="w-full max-w-4xl mx-auto mt-6 p-4 sm:p-6 bg-gray-800 rounded-3xl shadow-lg
                     text-center flex flex-col ring-1 ring-[#36444c]
                     md:hover:scale-105 transition-transform duration-300"
        >
          <h1 className="text-blue-400 text-xl sm:text-2xl font-bold mb-4 uppercase">🔍 IOUs</h1>
          <button
            onClick={() => {
              setSearchResults([]);
              setSearchAddress('');
            }}
            className="w-40 py-2 bg-blue-400 hover:bg-[#356195] text-white font-semibold
                       rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-400 mx-auto mb-4"
          >
            Close
          </button>

          <div className="space-y-2 w-full">
            {searchResults.map((info, i) => {
              const isBorrower =
                userAddress?.toLowerCase() === info.borrower.toLowerCase();

              return (
                <div key={info.loanAddress} className="bg-gray-700 rounded-3xl shadow-md">
                  <button
                    onClick={() => toggleExpandSearch(i)}
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
