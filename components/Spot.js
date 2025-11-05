import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Stack,
  LinearProgress,
  InputAdornment,
  Dialog,
  DialogContent,
  IconButton,
  Chip,
  alpha,
} from '@mui/material';
import {
  AccountBalanceWallet,
  TrendingUp,
  Close,
  ContentCopy,
  Link as LinkIcon,
} from '@mui/icons-material';
import { Toaster, toast } from 'react-hot-toast';
import { useAccount, useEnsName, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { GlassCard, GradientCard, AnimatedButton } from './v2';
import { gradients } from '../theme/v2Theme';

// ~~~~~~~~ CONTRACT DETAILS ~~~~~~~~
const ContractAddress = '0x6b8dcac6af8e93438cdb8eaeef2da95b8e9d372d';
const ContractABI = [
  'constructor(address payable feeAddrs)',
  'function allowBorrow(address token, address friend, uint256 amount, uint256 interestRate)',
  'function borrow(address token, address lender, uint256 amount)',
  'function repay(address token, address lender, uint256 amount)',
  'function setFee(uint256 newFee)',
  'function setFeeAddress(address newFeeAddress)',
  'function getSpotInfo(bytes32[] memory hashes) view returns ( (address lender, address friend, address token, uint256 totalBorrowed, uint256 outstanding, uint256 allowable, uint256 interestRate, uint256 lastAccrualTimestamp, uint256 interestAccrued)[] details, uint256[] updatedInterest, uint256[] updatedTotalOwed, uint256[] decimalsArr, string[] names, string[] symbols )',
  'function viewLenderAllowances(address lender) view returns (bytes32[])',
  'function viewFriendAllowances(address friend) view returns (bytes32[])',
  'function borrowDetails(bytes32) view returns (address, address, address, uint256, uint256, uint256, uint256)',
  'function borrowDetailsByLender(address) view returns (bytes32[])',
  'function borrowDetailsByFriend(address) view returns (bytes32[])',
  'function feeAddress() view returns (address)',
  'function fee() view returns (uint256)',
];

const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function transfer(address, uint) returns (bool)',
  'function approve(address, uint) returns (bool)',
  'function allowance(address, address) view returns (uint)'
];

const tokenaddress = '0x0000000000000000000000000000000000000000';

export default function Spot() {
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

  const [friend, setFriend] = useState('');
  const [amount, setAmount] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [stoken, setToken] = useState(null);

  const [maps, setMaps] = useState({
    '0x94373a4919B3240D86eA41593D5eBa789FEF3848': 'wETH',
    '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5': 'PR0',
    '0x0987654321098765432109876543210987654321': 'USDC',
  });

  const addMapping = (address, name) => {
    setMaps((prev) => ({ ...prev, [address.toLowerCase()]: name }));
  };

  const map = (addr) => {
    addr = addr.toLowerCase();
    return maps[addr] || addr;
  };

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

  const tokenOptions = {
    1: [
      { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI' },
      { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC' },
      { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT' },
      { address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', symbol: 'WBTC' },
      { address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', symbol: 'WETH' },
    ],
    10: [{ address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', symbol: 'DAI' }],
    8453: [
      { address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', symbol: 'USDC' },
      { address: '0x4200000000000000000000000000000000000006', symbol: 'WETH' },
    ],
    534352: [],
  };

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('token')) setToken(params.get('token'));
    if (params.get('friend')) setFriend(params.get('friend'));
    if (params.get('amount')) setAmount(params.get('amount'));
    if (params.get('interest')) setInterestRate(params.get('interest'));
    if (params.get('token')) setShowModal(true);
  }, []);

  const requestBorrow = async (stoken, friendAddr, amt) => {
    if (!signer) return;
    const contractWithSigner = new ethers.Contract(ContractAddress, ContractABI, signer);

    try {
      let decimals = 18;
      if (ethers.isAddress(stoken) && stoken !== tokenaddress) {
        const tokenContract = new ethers.Contract(stoken, tokenABI, signer);
        decimals = await tokenContract.decimals();
      }
      const parsedAmount = ethers.parseUnits(amt || '0', decimals);

      if (ethers.isAddress(stoken) && stoken !== tokenaddress) {
        const tokenContract = new ethers.Contract(stoken, tokenABI, signer);
        const currentAllowance = await tokenContract.allowance(userAddress, ContractAddress);
        if (currentAllowance < parsedAmount) {
          const txApprove = await tokenContract.approve(ContractAddress, parsedAmount);
          await txApprove.wait();
        }
      }

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
      const tx = await contractWithSigner.allowBorrow(stoken, friendAddr, parsedAmount, interestRateBN);
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

  useEffect(() => {
    if (!initialized && userAddress && contract) {
      setInitialized(true);
      fetchData();
    }
  }, [initialized, userAddress, contract]);

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

  const fetchLenderAllowances = async () => {
    if (!contract || !userAddress) return;
    let lenderAllowances = await contract.viewLenderAllowances(userAddress);
    lenderAllowances = Array.from(lenderAllowances);
    if (!lenderAllowances?.length) {
      setAllowances([]);
      return;
    }
    const spotResult = await contract.getSpotInfo(lenderAllowances);

    const results = spotResult.details.map((info, idx) => {
      const [lender, friend, token, totalBorrowed, outstanding, allowable, iRate] = info;
      return {
        lender, friend, token, totalBorrowed, outstanding, allowable,
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
      const [lender, friend, token, totalBorrowed, outstanding, allowable, iRate] = info;
      return {
        lender, friend, token, totalBorrowed, outstanding, allowable,
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

  const LoanModal = () => {
    return (
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p: 4 }}>
          <IconButton
            onClick={() => setShowModal(false)}
            sx={{ position: 'absolute', top: 16, right: 16 }}
          >
            <Close />
          </IconButton>

          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
            Loan Request
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Lend a friend tokens from your wallet, with optional interest!
          </Typography>

          <Stack spacing={3}>
            {stoken && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Token Address
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: alpha('#ec4899', 0.1),
                    wordBreak: 'break-all',
                    fontFamily: 'monospace',
                  }}
                >
                  {stoken}
                </Box>
              </Box>
            )}

            {friend && (
              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Borrower Address/ENS
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    background: alpha('#ec4899', 0.1),
                    wordBreak: 'break-all',
                  }}
                >
                  {friend}
                </Box>
              </Box>
            )}

            <TextField
              fullWidth
              label="Loan Limit"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceWallet />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Interest Rate (e.g. 50 = 5%)"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TrendingUp />
                  </InputAdornment>
                ),
              }}
            />

            <AnimatedButton
              fullWidth
              onClick={() => requestBorrow(stoken, friend, amount)}
            >
              Set Allowance
            </AnimatedButton>
          </Stack>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', background: '#f8fafc' }}>
      <Toaster />

      {/* Hero Section */}
      <Box
        sx={{
          background: gradients.mesh,
          py: 6,
          borderRadius: '0 0 40px 40px',
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center" position="relative" zIndex={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
              <Box>
                <Chip
                  label="Powered by Boop.Finance"
                  sx={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <IconButton
                    href="https://boop.finance"
                    target="_blank"
                    sx={{ color: '#fff' }}
                  >
                    <img src="https://boop.finance/logo.png" alt="Boop" style={{ width: 32, height: 32 }} />
                  </IconButton>
                  <IconButton
                    href="https://discord.gg/vrV4YpUccq"
                    target="_blank"
                    sx={{ color: '#fff' }}
                  >
                    <img src="https://cdn.simpleicons.org/discord/fff" alt="Discord" style={{ width: 32, height: 32 }} />
                  </IconButton>
                  <IconButton
                    href="https://x.com/0xboop"
                    target="_blank"
                    sx={{ color: '#fff' }}
                  >
                    <img src="https://cdn.simpleicons.org/x/fff" alt="X" style={{ width: 32, height: 32 }} />
                  </IconButton>
                </Stack>
              </Box>
              <ConnectButton />
            </Stack>

            <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 2 }}>
              Spot a Friend
            </Typography>
            <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), maxWidth: 600, mx: 'auto' }}>
              Let friends borrow tokens from your wallet with an optional interest rate!
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <LoanModal />

        {/* Allow Borrow Form */}
        <GlassCard sx={{ p: 4, mb: 4, maxWidth: 600, mx: 'auto' }}>
          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
            Allow Friends to Borrow
          </Typography>

          <Stack spacing={3} sx={{ mt: 3 }}>
            <TextField
              select
              fullWidth
              label="Token"
              value={stoken || ''}
              onChange={(e) => setToken(e.target.value)}
            >
              <MenuItem value="">Select a token</MenuItem>
              {tokenOptions[chainIdNow]?.map((tk) => (
                <MenuItem key={tk.address} value={tk.address}>
                  {tk.symbol}
                </MenuItem>
              ))}
              <MenuItem value="custom">Custom</MenuItem>
            </TextField>

            {stoken === 'custom' && (
              <TextField
                fullWidth
                label="Custom Token Address"
                onChange={(e) => setToken(e.target.value)}
                placeholder="0x..."
              />
            )}

            <TextField
              fullWidth
              label="Borrower Address/ENS"
              value={friend}
              onChange={(e) => setFriend(e.target.value)}
              placeholder="vitalik.eth or 0x..."
            />

            <TextField
              fullWidth
              label="Loan Limit"
              type="number"
              onChange={(e) => setAmount(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountBalanceWallet />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Interest Rate (50 = 5%)"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <TrendingUp />
                  </InputAdornment>
                ),
              }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <AnimatedButton
                fullWidth
                onClick={() => requestBorrow(stoken, friend, amount)}
              >
                Set Allowance
              </AnimatedButton>

              <AnimatedButton
                fullWidth
                variant="outlined"
                onClick={() => {
                  if (!stoken || !friend || !amount || !interestRate) {
                    toast.error('Please fill all fields!');
                    return;
                  }
                  navigator.clipboard.writeText(
                    `https://spot.pizza?spot=1&token=${stoken}&friend=${friend}&amount=${amount}&interest=${interestRate}`
                  );
                  toast.success('Loan request link copied!');
                }}
                startIcon={<ContentCopy />}
              >
                Copy Link
              </AnimatedButton>
            </Stack>
          </Stack>
        </GlassCard>

        {/* Lender View */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3 }}>
            Allowances to Friends
          </Typography>

          <Grid container spacing={3}>
            {Object.entries(
              allowances
                .filter((a) => a.lender.toLowerCase() === userAddress?.toLowerCase())
                .reduce((acc, a) => {
                  if (!acc[a.friend]) acc[a.friend] = [];
                  acc[a.friend].push(a);
                  return acc;
                }, {})
            ).map(([friendAddr, friendAllowances]) =>
              friendAllowances.map((allowance) => (
                <Grid item xs={12} md={6} key={allowance.hash}>
                  <GlassCard sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={ENS[friendAddr] || `${map(friendAddr).slice(0, 10)}...`}
                        sx={{ background: gradients.secondary, color: '#fff' }}
                      />
                      <Chip
                        label={allowance.symbol}
                        sx={{ background: gradients.ocean, color: '#fff' }}
                      />
                    </Stack>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Limit
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {allowance.allowable}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Owed
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {allowance.outstandingFee.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Borrowed
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {allowance.totalBorrowed}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Interest Rate
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {(allowance.interestRate / 10).toFixed(2)}%
                        </Typography>
                      </Grid>
                    </Grid>

                    <LinearProgress
                      variant="determinate"
                      value={allowance.allowable > 0 ? (allowance.outstanding / allowance.allowable) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 2,
                        background: alpha('#ec4899', 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: gradients.secondary,
                        },
                      }}
                    />

                    <Stack spacing={2}>
                      <TextField
                        size="small"
                        label="New Amount"
                        type="number"
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <TextField
                        size="small"
                        label="Interest (50=5%)"
                        type="number"
                        onChange={(e) => setInterestRate(e.target.value)}
                      />
                      <AnimatedButton
                        fullWidth
                        size="small"
                        onClick={() => requestBorrow(allowance.token, allowance.friend, amount)}
                      >
                        Update Allowance
                      </AnimatedButton>
                    </Stack>
                  </GlassCard>
                </Grid>
              ))
            )}
          </Grid>
        </Box>

        {/* Borrower View */}
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom sx={{ mb: 3 }}>
            Friends That Have Spotted Me
          </Typography>

          <Grid container spacing={3}>
            {Object.entries(
              borrows
                .filter((b) => b.friend.toLowerCase() === userAddress?.toLowerCase())
                .reduce((acc, b) => {
                  if (!acc[b.lender]) acc[b.lender] = [];
                  acc[b.lender].push(b);
                  return acc;
                }, {})
            ).map(([lender, lenderBorrows]) =>
              lenderBorrows.map((borrow) => (
                <Grid item xs={12} md={6} key={borrow.hash}>
                  <GlassCard sx={{ p: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                      <Chip
                        label={ENS[lender] || `${map(lender).slice(0, 10)}...`}
                        sx={{ background: gradients.secondary, color: '#fff' }}
                      />
                      <Chip
                        label={borrow.symbol}
                        sx={{ background: gradients.ocean, color: '#fff' }}
                      />
                    </Stack>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Limit
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {borrow.allowable}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Owed
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {borrow.outstandingFee.toFixed(4)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Borrowed
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {borrow.totalBorrowed}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Interest Rate
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {(borrow.interestRate / 10).toFixed(2)}%
                        </Typography>
                      </Grid>
                    </Grid>

                    <LinearProgress
                      variant="determinate"
                      value={borrow.allowable > 0 ? (borrow.outstanding / borrow.allowable) * 100 : 0}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 2,
                        background: alpha('#ec4899', 0.1),
                        '& .MuiLinearProgress-bar': {
                          background: gradients.secondary,
                        },
                      }}
                    />

                    <Stack spacing={2}>
                      <TextField
                        size="small"
                        label="Amount"
                        type="number"
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      <Stack direction="row" spacing={2}>
                        <AnimatedButton
                          fullWidth
                          size="small"
                          onClick={() => handleBorrow(borrow.token, borrow.lender)}
                        >
                          Borrow
                        </AnimatedButton>
                        <AnimatedButton
                          fullWidth
                          size="small"
                          onClick={() => handleRepay(borrow.token, borrow.lender)}
                          sx={{ background: gradients.success }}
                        >
                          Repay
                        </AnimatedButton>
                      </Stack>
                    </Stack>
                  </GlassCard>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
