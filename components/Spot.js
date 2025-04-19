import React, { useState, useEffect } from 'react'; 
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { useAccount, useEnsName, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';

// ~~~~~~~~ YOUR CONTRACT DETAILS ~~~~~~~~
const ContractAddress = '0x6b8dcac6af8e93438cdb8eaeef2da95b8e9d372d';
const ContractABI = [
  'constructor(address payable feeAddrs)',
  'function allowBorrow(address token, address friend, uint256 amount, uint256 interestRate)',
  'function borrow(address token, address lender, uint256 amount)',
  'function repay(address token, address lender, uint256 amount)',
  'function setFee(uint256 newFee)',
  'function setFeeAddress(address newFeeAddress)',

  // The important function we’re using now
  'function getSpotInfo(bytes32[] memory hashes) view returns ( (address lender, address friend, address token, uint256 totalBorrowed, uint256 outstanding, uint256 allowable, uint256 interestRate, uint256 lastAccrualTimestamp, uint256 interestAccrued)[] details, uint256[] updatedInterest, uint256[] updatedTotalOwed, uint256[] decimalsArr, string[] names, string[] symbols )',
  'function viewLenderAllowances(address lender) view returns (bytes32[])',
  'function viewFriendAllowances(address friend) view returns (bytes32[])',
  'function borrowDetails(bytes32) view returns (address, address, address, uint256, uint256, uint256, uint256)',
  'function borrowDetailsByLender(address) view returns (bytes32[])',
  'function borrowDetailsByFriend(address) view returns (bytes32[])',
  'function feeAddress() view returns (address)',
  'function fee() view returns (uint256)',
];

// Standard ERC20 ABI
const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function transfer(address, uint) returns (bool)',
  'function approve(address, uint) returns (bool)',
  'function allowance(address, address) view returns (uint)'
];

// For a “no token” fallback
const tokenaddress = '0x0000000000000000000000000000000000000000';

// ~~~~~~~~ MAIN SPOT COMPONENT ~~~~~~~~
export default function Spot() {
  // Wagmi, ethers, and state
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const chainIdNow = useChainId();
  const { address: userAddress } = useAccount();

  const provider = ethersProvider;
  const signer = ethersSigner;
  const contract = new ethers.Contract(ContractAddress, ContractABI, provider);

  const [initialized, setInitialized] = useState(false);
  const [allowances, setAllowances] = useState([]);
  const [borrows, setBorrows] = useState([]);

  // Form fields
  const [friend, setFriend] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [stoken, setToken] = useState(null);

  // Simple mapping of known addresses => names
  const [maps, setMaps] = useState({
    '0x94373a4919B3240D86eA41593D5eBa789FEF3848': 'wETH',
    '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5': 'PR0',
    '0x0987654321098765432109876543210987654321': 'USDC',
  });

  // Resolve addresses → names
  const addMapping = (address, name) => {
    setMaps((prev) => ({
      ...prev,
      [address.toLowerCase()]: name,
    }));
  };
  const map = (addr) => {
    addr = addr.toLowerCase();
    return maps[addr] || addr;
  };

  // For ENS lookups of lender/friend addresses
  const [ENS, setENS] = useState({});
  useEffect(() => {
    const pr = new ethers.JsonRpcProvider('https://1rpc.io/eth');
    const getAddressENS = async (address) => {
      if (maps[address.toLowerCase()]) return maps[address.toLowerCase()];
      try {
        const ensName = await pr.lookupAddress(address);
        if (ensName) addMapping(address, ensName);
        return ensName || address;
      } catch {
        return address;
      }
    };

    allowances.forEach((a) => {
      if (!ENS[a.friend]) {
        getAddressENS(a.friend).then((ens) =>
          setENS((prev) => ({ ...prev, [a.friend]: ens }))
        );
      }
    });
    borrows.forEach((b) => {
      if (!ENS[b.lender]) {
        getAddressENS(b.lender).then((ens) =>
          setENS((prev) => ({ ...prev, [b.lender]: ens }))
        );
      }
    });
  }, [allowances, borrows]);

  // Simple token lists by chain
  const tokenOptions = {
    1: [
      { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI' },
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC' },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT' },
      { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC' },
      { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
    ],
    10: [
      { address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI' },
    ],
    8453: [
      { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC' },
      { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
    ],
    534352: [],
  };

  // For the “borrow/repay” modals from URL
  const [showModal, setShowModal] = useState(false);

  // On load, parse query string for ?token=..., etc.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) setToken(params.get('token'));
    if (params.get('friend')) setFriend(params.get('friend'));
    if (params.get('amount')) setAmount(params.get('amount'));
    if (params.get('interest')) setInterestRate(params.get('interest'));
    if (params.get('token')) setShowModal(true);
  }, []);

  // ~~~~~~~~~~~~~~~~~~~~~
  //  Contract Interactions
  // ~~~~~~~~~~~~~~~~~~~~~
  const requestBorrow = async (stoken, friendAddr, amt) => {
    if (!signer) return;
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);

    try {
      // decimals
      let decimals = 18;
      if (ethers.isAddress(stoken) && stoken !== tokenaddress) {
        const tokenContract = new ethers.Contract(stoken, tokenABI, signer);
        decimals = await tokenContract.decimals();
      }
      const parsedAmount = ethers.parseUnits(amt || '0', decimals);

      // Approve if needed
      if (ethers.isAddress(stoken) && stoken !== tokenaddress) {
        const tokenContract = new ethers.Contract(stoken, tokenABI, signer);
        const currentAllowance = await tokenContract.allowance(
          userAddress,
          ContractAddress
        );
        if (currentAllowance < parsedAmount) {
          const txApprove = await tokenContract.approve(ContractAddress, parsedAmount);
          await txApprove.wait();
        }
      }

      // Resolve ENS if needed
      if (!ethers.isAddress(friendAddr)) {
        const pr = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
        const resolved = await pr.resolveName(friendAddr);
        if (!resolved) {
          toast.error('ENS not found.');
          return;
        }
        friendAddr = resolved;
      }

      const interestRateBN = parseInt(interestRate, 10) || 0;
      const tx = await contractWithSigner.allowBorrow(
        stoken,
        friendAddr,
        parsedAmount,
        interestRateBN
      );
      await tx.wait();

      toast.success('Allowance + interestRate set!');
      fetchLenderAllowances();
    } catch (error) {
      console.error(error);
      toast.error('Error requesting borrow');
    }
  };

  const handleBorrow = async (tokenAddress, lender) => {
    if (!signer) return;
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);
    try {
      let decimals = 18;
      if (ethers.isAddress(tokenAddress) && tokenAddress !== tokenaddress) {
        const tokenContract = new ethers.Contract(tokenAddress, tokenABI, provider);
        decimals = await tokenContract.decimals();
      }
      const parsedAmount = ethers.parseUnits(amount || '0', decimals);
      const tx = await contractWithSigner.borrow(tokenAddress, lender, parsedAmount);
      await tx.wait();
      toast.success('Borrow successful');
      fetchFriendAllowances();
    } catch (error) {
      console.error(error);
      toast.error('Error borrowing');
    }
  };

  const handleRepay = async (tokenAddress, lender) => {
    if (!signer) return;
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);
    const tokenContract = new ethers.Contract(tokenAddress, tokenABI, signer);

    try {
      let decimals = 18;
      if (ethers.isAddress(tokenAddress) && tokenAddress !== tokenaddress) {
        decimals = await tokenContract.decimals();
      }
      const parsedAmount = ethers.parseUnits(amount || '0', decimals);

      // Approve if needed
      const allowance = await tokenContract.allowance(userAddress, ContractAddress);
      if (allowance < parsedAmount) {
        const txApprove = await tokenContract.approve(ContractAddress, parsedAmount);
        await txApprove.wait();
      }
      const tx = await contractWithSigner.repay(tokenAddress, lender, parsedAmount);
      await tx.wait();
      toast.success('Repayment successful');
      fetchFriendAllowances();
    } catch (error) {
      console.error(error);
      toast.error('Error repaying');
    }
  };

  // ~~~~~~~~~~~~~~~~~~~~~
  //  FETCH DATA
  // ~~~~~~~~~~~~~~~~~~~~~
  // We call these after metamask changes or on page load
  useEffect(() => {
    if (!initialized && userAddress && contract) {
      setInitialized(true);
      fetchData();
    }
  }, [initialized, userAddress, contract]);

  // Listen for account changes to re-initialize
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        setInitialized(false);
      });
    }
  }, []);

  const fetchData = async () => {
    await fetchLenderAllowances();
    await fetchFriendAllowances();
  };

  // getSpotInfo references
  const fetchLenderAllowances = async () => {
    if (!contract || !userAddress) return;
    let lenderAllowances = await contract.viewLenderAllowances(userAddress);
    lenderAllowances = Array.from(lenderAllowances);
    if (!lenderAllowances?.length) {
      setAllowances([]);
      return;
    }
    const spotResult = await contract.getSpotInfo(lenderAllowances);

    // map them out
    const results = spotResult.details.map((info, idx) => {
      const [
        lender,
        friend,
        token,
        totalBorrowed,
        outstanding,
        allowable,
        iRate,
      ] = info;
      return {
        lender,
        friend,
        token,
        totalBorrowed,
        outstanding,
        allowable,
        interestRate: iRate,
        lastAccrualTimestamp: info[7],
        interestAccrued: info[8],
        fee: spotResult.updatedTotalOwed[idx],
        outstandingFee: spotResult.updatedTotalOwed[idx],
        interestRateFee: spotResult.updatedInterest[idx],
        decimals: spotResult.decimalsArr[idx],
        name: spotResult.names[idx],
        symbol: spotResult.symbols[idx],
        hash: lenderAllowances[idx],
      };
    });

    const finalAllowances = results.map((info) => {
      const dec = info.decimals;
      return {
        lender: info.lender,
        friend: info.friend,
        token: info.token,
        totalBorrowed: Number(ethers.formatUnits(info.totalBorrowed, dec)),
        outstanding: Number(ethers.formatUnits(info.outstanding, dec)),
        allowable: Number(ethers.formatUnits(info.allowable, dec)),
        interestRate: Number(info.interestRate),
        fee: Number(ethers.formatUnits(info.fee, dec)),
        outstandingFee: Number(ethers.formatUnits(info.outstandingFee, dec)),
        interestRateFee: Number(ethers.formatUnits(info.interestRateFee, dec)),
        hash: info.hash,
        name: info.name,
        symbol: info.symbol || info.token,
      };
    });

    setAllowances(finalAllowances);
  };

  const fetchFriendAllowances = async () => {
    if (!contract || !userAddress) return;
    let friendAllowances = await contract.viewFriendAllowances(userAddress);
    friendAllowances = Array.from(friendAllowances);
    if (!friendAllowances?.length) {
      setBorrows([]);
      return;
    }
    const spotResult = await contract.getSpotInfo(friendAllowances);

    const results = spotResult.details.map((info, idx) => {
      const [
        lender,
        friend,
        token,
        totalBorrowed,
        outstanding,
        allowable,
        iRate,
      ] = info;
      return {
        lender,
        friend,
        token,
        totalBorrowed,
        outstanding,
        allowable,
        interestRate: iRate,
        lastAccrualTimestamp: info[7],
        interestAccrued: info[8],
        fee: spotResult.updatedTotalOwed[idx],
        outstandingFee: spotResult.updatedTotalOwed[idx],
        interestRateFee: spotResult.updatedInterest[idx],
        decimals: spotResult.decimalsArr[idx],
        name: spotResult.names[idx],
        symbol: spotResult.symbols[idx],
        hash: friendAllowances[idx],
      };
    });

    const finalBorrows = results.map((info) => {
      const dec = info.decimals;
      return {
        lender: info.lender,
        friend: info.friend,
        token: info.token,
        totalBorrowed: Number(ethers.formatUnits(info.totalBorrowed, dec)),
        outstanding: Number(ethers.formatUnits(info.outstanding, dec)),
        allowable: Number(ethers.formatUnits(info.allowable, dec)),
        interestRate: Number(info.interestRate),
        fee: Number(ethers.formatUnits(info.fee, dec)),
        outstandingFee: Number(ethers.formatUnits(info.outstandingFee, dec)),
        interestRateFee: Number(ethers.formatUnits(info.interestRateFee, dec)),
        hash: info.hash,
        name: info.name,
        symbol: info.symbol || info.token,
      };
    });

    setBorrows(finalBorrows);
  };

  // ~~~~~~~~~~~~~~~~~~~~~
  //  LOAN MODAL
  // ~~~~~~~~~~~~~~~~~~~~~
  const LoanModal = () => {
    if (!showModal) return null;
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex items-center justify-center">
        {/* Modal Content */}
        <div className="relative bg-white shadow-2xl rounded-3xl w-full max-w-lg p-8 bg-blur-md">
          <button
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 font-bold text-gray-500 hover:text-red-500"
          >
            X
          </button>
          <h1 className="text-2xl font-bold text-pink-500 mb-4">
            📝 Loan Request
          </h1>
          <label className="block text-gray-700 font-semibold mb-2">
            🌈 Lend a friend tokens from your wallet, with optional interest!
          </label>
          <div className="space-y-4">
            {/* Display or ask for Token */}
            {stoken ? (
              <div>
                <span className="text-gray-700 font-semibold">Token Address:</span>
                <p className="bg-pink-100 rounded-xl px-3 py-2 mt-1 text-gray-800 break-all">
                  {stoken}
                </p>
              </div>
            ) : (
              <>
                <label htmlFor="modal-token" className="text-gray-700 font-semibold">
                  Token Address
                </label>
                <input
                  id="modal-token"
                  type="text"
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full p-2 rounded-xl border focus:ring-2 focus:ring-pink-300"
                />
              </>
            )}

            {/* Borrower */}
            <div>
              <span className="text-gray-700 font-semibold">Borrower Address/ENS:</span>
              <p className="bg-pink-100 rounded-xl px-3 py-2 mt-1 text-gray-800 break-all">
                {friend || 'N/A'}
              </p>
            </div>

            {/* Amount */}
            <label htmlFor="modal-amount" className="text-gray-700 font-semibold">
              💸 Loan Limit:
            </label>
            <input
              id="modal-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-2 rounded-xl border focus:ring-2 focus:ring-pink-300"
            />

            {/* Interest */}
            <label htmlFor="modal-interest" className="text-gray-700 font-semibold">
              🏦 Interest Rate (e.g. 50 = 5%):
            </label>
            <input
              id="modal-interest"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              className="w-full p-2 rounded-xl border focus:ring-2 focus:ring-pink-300"
            />

            {/* ACTION */}
            <button
              onClick={() => requestBorrow(stoken, friend, amount)}
              className="
                w-full bg-pink-500 hover:bg-pink-500 text-white 
                font-semibold py-2 px-4 rounded-full 
                transition-colors
              "
            >
              Set Allowance
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ~~~~~~~~~~~~~~~~~~~~~
  //  RENDER
  // ~~~~~~~~~~~~~~~~~~~~~
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-200 via-orange-200 to-yellow-200 relative overflow-hidden font-sans">
      {/* Glass/blur overlay */}
      <div className="absolute inset-0 bg-white bg-opacity-30 backdrop-filter backdrop-blur-md"></div>
      <Toaster />

      {/* Page Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 text-center">
        {/* Header Row: “Powered By Boop” in center, ConnectButton on right */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 mb-4 items-center justify-center">
          <div className="hidden sm:block"></div>
          <div className="text-center">
            <p className="bg-gradient-to-r from-pink-400 to-yellow-400 text-white text-center py-2 rounded-full w-fit mx-auto px-4 font-semibold">
              Powered by Boop.Finance
            </p>
            <div className="text-center mt-2 flex items-center justify-center gap-2">
              <a
                href="https://boop.finance"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://boop.finance/logo.png"
                  alt="Boop.Finance Logo"
                  className="w-8 h-8"
                />
              </a>
              <a
                href="https://discord.gg/vrV4YpUccq"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.simpleicons.org/discord/db2777"
                  alt="Discord"
                  className="w-8 h-8"
                />
              </a>
              <a
                href="https://x.com/0xboop"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://cdn.simpleicons.org/x/db2777"
                  alt="Twitter"
                  className="w-8 h-8"
                />
              </a>
            </div>
          </div>
          <div className="mx-auto sm:ml-auto sm:mr-0 my-0 text-center">
            <ConnectButton />
          </div>
        </div>

        {/* Main Title */}
        <h1 className="text-center text-4xl font-extrabold text-pink-500 mb-3 drop-shadow">
          Spot a Friend
        </h1>
        <p className="text-lg text-center text-gray-700 mb-8 max-w-xl mx-auto">
          Let friends borrow tokens from your wallet with an optional interest rate!
        </p>

        {/* Loan Modal for Querystring-based requests */}
        <LoanModal />

        {/* ALLOW BORROW FORM */}
        <div className="bg-white bg-opacity-90 shadow-xl rounded-3xl p-6 mb-8 max-w-xl mx-auto text-center">
          <h2 className="text-xl font-bold text-pink-500 mb-4">
            🌈 Allow friends to borrow
          </h2>
          <div className="gap-4 mb-4">
            {/* Token Select */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                🪙 Token:
              </label>
              <select
                id="token"
                value={stoken || ''}
                onChange={(e) => setToken(e.target.value)}
                className="w-full p-2 rounded-full border focus:ring-2 focus:ring-pink-300"
              >
                <option value="">
                  {stoken ? stoken : 'Select a token'}
                </option>
                {tokenOptions[chainIdNow]?.map((tk) => (
                  <option key={tk.address} value={tk.address}>
                    {tk.symbol}
                  </option>
                ))}
                <option value="custom">Custom</option>
              </select>
              {stoken === 'custom' && (
                <input
                  type="text"
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter custom token address"
                  className="mt-2 w-full p-2 rounded-full border focus:ring-2 focus:ring-pink-300"
                />
              )}
            </div>

            {/* Friend / Borrower */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                👥 Borrower Address/ENS:
              </label>
              <input
                type="text"
                value={friend}
                onChange={(e) => setFriend(e.target.value)}
                className="w-full p-2 rounded-full border focus:ring-2 focus:ring-pink-300"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                💸 Loan Limit:
              </label>
              <input
                type="number"
                step="0.01"
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 rounded-full border focus:ring-2 focus:ring-pink-300"
              />
            </div>

            {/* Interest Rate */}
            <div>
              <label className="block text-gray-700 font-semibold mb-1">
                🏦 Interest Rate (e.g. 50 = 5%):
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="w-full p-2 rounded-full border focus:ring-2 focus:ring-pink-300"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => requestBorrow(stoken, friend, amount)}
              className="
                bg-pink-500 text-white font-semibold py-2 px-4 
                rounded-full hover:bg-pink-500 transition-colors 
              "
            >
              Set Allowance
            </button>

            <button
              className="
                bg-blue-400 text-white font-semibold py-2 px-4 
                rounded-full hover:bg-blue-500 transition-colors 
              "
              onClick={() => {
                if (!stoken || !friend || !amount || !interestRate) {
                  toast.error('Please fill all fields!');
                  return;
                }
                navigator.clipboard.writeText(
                  `https://spot.pizza?spot=1&token=${stoken}&friend=${friend}&amount=${amount}&interest=${interestRate}`
                );
                toast.success('Loan request link copied to clipboard!');
              }}
            >
              📃 Copy Request Link
            </button>
          </div>
        </div>

        {/* LENDER VIEW */}
        <div className="bg-white bg-opacity-90 shadow-xl rounded-3xl p-6 mb-8 max-w-5xl w-fit mx-auto">
          <h2 className="text-xl font-bold text-pink-500 mb-4">
            🤝 Allowances to Friends
          </h2>
          {Object.entries(
            allowances
              .filter(
                (a) => a.lender.toLowerCase() === userAddress?.toLowerCase()
              )
              .reduce((acc, a) => {
                if (!acc[a.friend]) acc[a.friend] = [];
                acc[a.friend].push(a);
                return acc;
              }, {})
          ).map(([friendAddr, friendAllowances]) => (
            <div key={friendAddr} className="mb-6 max-w-xl mx-auto">
              <div className="flex flex-row items-center justify-center mb-4 gap-6">
                {friendAllowances.map((allowance) => (
                  <div
                    key={allowance.hash}
                    className="border border-pink-100 bg-pink-100 rounded-3xl p-4 shadow-sm space-y-2 items-center justify-center max-w-xs mx-auto"
                  >
                    <div className="flex flex-row items-center mx-auto gap-2 justify-center">
                                  <h3 className="bg-pink-400 py-1 px-3 rounded-full text-white font-semibold w-fit">
                {ENS[friendAddr] ||
                  map(friendAddr).slice(0, 16) + '...'}
              </h3>
                    <p className="font-semibold bg-blue-400 py-1 px-3 rounded-full text-white w-fit">
                      {allowance.symbol}
                    </p>
                    </div>
                    <div className="items-center justify-center text-center">
                      <div className="items-center justify-center grid grid-cols-2 gap-4">
                        <div>
                        <p className="font-semibold text-pink-500">
                          Limit
                        </p>
                        <p className="bg-pink-300 rounded-3xl px-3 py-1 mt-1 text-white">
                          {allowance.allowable}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-pink-500">
                          Owed
                        </p>
                        <p className="bg-pink-300 rounded-3xl px-3 py-1 mt-1 text-white">
                        {allowance.outstandingFee}
                        </p>
                      </div>
                      <div className="">
                    <p className="text-pink-500 font-semibold">
                      📊 Borrowed
                    </p>
                    <p className="text-white bg-pink-300 rounded-3xl px-3 py-1 mt-1">
                      {allowance.totalBorrowed}
                    </p>
                      </div>
                    <div>
                    <p className="text-pink-500 font-semibold">
                      🏦 Interest Rate
                      <p className="bg-pink-300 rounded-3xl px-3 py-1 mt-1 text-white">
                        {(allowance.interestRate / 10).toFixed(2)}%
                      </p>
                    </p>
                  </div>
                  </div>
                    </div>
                    {/* Quick progress bar */}
                    <div className="bg-gray-200 rounded-full h-2 w-full mt-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{width:
                            allowance.allowable > 0
                              ? `${(allowance.outstanding / allowance.allowable) * 100}%`
                              : '0%',
                        }}
                      />
                    </div>
<div className="grid grid-cols-2 gap-4 mt-4 text-center">
  <div>
                    <label className="text-pink-500 font-semibold">
                      New Amount
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full p-2 rounded-full border focus:ring-2 focus:ring-pink-300 border-pink-300 bg-pink-50"
                    />
</div>
<div>
                    <label className="text-pink-500 font-semibold">
                      Interest 50=5%
                    </label>
                    <input
                      type="number"
                      onChange={(e) => setInterestRate(e.target.value)}
                      className="w-full p-2 rounded-full border focus:ring-2 focus:ring-pink-300 border-pink-300 bg-pink-50"
                    />
</div>
                  </div>
                    <button
                      onClick={() =>
                        requestBorrow(allowance.token, allowance.friend, amount)
                      }
                      className="
                        mt-2 w-full bg-pink-500 hover:bg-pink-500 
                        text-white font-semibold py-1 px-2 rounded-full 
                        text-sm transition-colors
                      "
                    >
                      Update Allowance
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* BORROWER VIEW */}
        <div className="bg-white bg-opacity-90 shadow-xl rounded-3xl p-6 mb-8 max-w-5xl w-fit mx-auto">
          <h2 className="text-xl font-bold text-pink-500 mb-4">
            🙌 Friends That Have Spotted Me
          </h2>
  {Object.entries(
    borrows
      .filter((b) => b.friend.toLowerCase() === userAddress?.toLowerCase())
      .reduce((acc, b) => {
        if (!acc[b.lender]) acc[b.lender] = [];
        acc[b.lender].push(b);
        return acc;
      }, {})
  ).map(([lender, lenderBorrows]) => (
    <div key={lender} className="flex flex-row items-center justify-center mb-4 gap-6">
      {lenderBorrows.map((borrow) => (
        <div
          key={borrow.hash}
          className="border border-pink-100 bg-pink-100 rounded-3xl p-4 shadow-sm space-y-2 max-w-xs mx-auto mb-4"
        >
          <div className="flex flex-row items-center mx-auto gap-2 justify-center">
            <h3 className="bg-pink-400 py-1 px-3 rounded-full text-white font-semibold">
              {ENS[lender] || map(lender).slice(0, 16) + '...'}
            </h3>
            <p className="font-semibold bg-blue-400 py-1 px-3 rounded-full text-white">
              {borrow.symbol}
            </p>
          </div>

          <div className="items-center justify-center text-center">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-pink-500">Limit</p>
                <p className="bg-pink-300 rounded-3xl px-3 py-1 mt-1 text-white">
                  {borrow.allowable}
                </p>
              </div>
              <div>
                <p className="font-semibold text-pink-500">Owed</p>
                <p className="bg-pink-300 rounded-3xl px-3 py-1 mt-1 text-white">
                  {borrow.outstandingFee}
                </p>
              </div>
              <div>
                <p className="text-pink-500 font-semibold">📊 Borrowed</p>
                <p className="text-white bg-pink-300 rounded-3xl px-3 py-1 mt-1">
                  {borrow.totalBorrowed}
                </p>
              </div>
              <div>
                <p className="text-pink-500 font-semibold">🏦 Interest Rate</p>
                <p className="bg-pink-300 rounded-3xl px-3 py-1 mt-1 text-white">
                  {(borrow.interestRate / 10).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Quick progress bar */}
          <div className="bg-gray-200 rounded-full h-2 w-full mt-2">
            <div
              className="bg-pink-500 h-2 rounded-full"
              style={{
                width:
                  borrow.allowable > 0
                    ? `${(borrow.outstanding / borrow.allowable) * 100}%`
                    : '0%',
              }}
            />
          </div>

          <div className="">
            <div>
              <label className="text-pink-500 font-semibold">Amount</label>
              <input
                type="number"
                step="0.01"
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 rounded-full border focus:ring-2 focus:ring-pink-300 border-pink-300 bg-pink-50"
              />
            </div>
            <div className="flex flex-row gap-4 mt-4">
              <button
                onClick={() => handleBorrow(borrow.token, borrow.lender)}
                className="bg-pink-500 hover:bg-pink-500 text-white font-semibold py-1 px-2 rounded-full w-full"
              >
                Borrow
              </button>
              <button
                onClick={() => handleRepay(borrow.token, borrow.lender)}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-2 rounded-full w-full"
              >
                Repay
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  ))}
</div>
      </div>
    </div>
  );
}
