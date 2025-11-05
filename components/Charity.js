import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  Box,
  Container,
  Typography,
  Grid,
  TextField,
  Stack,
  Chip,
  Avatar,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  CardMedia,
  CardContent,
  alpha,
  Collapse,
} from '@mui/material';
import {
  Favorite,
  Add,
  Close,
  ContentCopy,
  CheckCircle,
  ExpandMore,
  Link as LinkIcon,
} from '@mui/icons-material';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useEthersProvider, useEthersSigner } from './tl';
import { GlassCard, AnimatedButton } from './v2';
import { gradients } from '../theme/v2Theme';

const streamContractAddress = '0x2726ef320b8ba1dd043dbacfe5beb088806ef478';

const streamContractABI = [
  'function computeHash(address streamer, address token, address recipient) view returns (bytes32)',
  'function streamDetails(bytes32) view returns (address streamer, address recipient, address token, uint256 totalStreamed, uint256 outstanding, uint256 allowable, uint256 window, uint256 timestamp, bool once)',
  'function allowStream(address token, address recipient, uint256 amount, uint256 window, bool once)',
  'function batchComputeHash(address[] calldata streamers, address[] calldata tokens, address[] calldata recipients) public pure returns (bytes32[] memory)',
  'function getStreamDetails(bytes32[] calldata hashes) public view returns (uint[] memory, uint8[] memory, string[] memory, string[] memory, tuple(address streamer, address recipient, address token, uint256 totalStreamed, uint256 outstanding, uint256 allowable, uint256 window, uint256 timestamp, bool once)[] memory)',
  'function getAvailable(address streamer, address token, address recipient) view returns (uint256 available)',
  'function viewRecipientAllowances(address recipient) view returns (bytes32[] memory hashes)',
  'function batchStreamAvailableAllowances(bytes32[] calldata hashes) external returns (bool)',
];

const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function allowance(address owner, address spender) view returns (uint)',
  'function approve(address spender, uint amount)',
];

const defaultCharities = [
  {
    name: 'Protocol Guild',
    address: '0xdddd576bAF106bAAe54bDE40BCac602bB4a7cf79',
    about: 'Independent non-profit funding 190 Ethereum L1 R&D maintainers. $100mm from the ecosystem in an onchain 4yr vest. Stewarding our commons infra.',
    link: 'https://protocol-guild.readthedocs.io/en/latest/04-donate.html',
    image: 'https://pbs.twimg.com/profile_images/1529206083390255110/UkK0Hc6q_400x400.jpg',
    chain: 8453,
    tokens: [
      { token: 'USDC', address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', presetAmounts: [10, 20, 50] },
      { token: 'wETH', address: '0x4200000000000000000000000000000000000006', presetAmounts: [0.005, 0.01, 0.05] },
    ],
  },
  {
    name: 'GiveDirectly',
    address: '0x69b4B1Ee9b7c619AdC51C256869cE705841BeD44',
    about: 'Delivers unconditional cash transfers to families living in extreme poverty.',
    link: 'https://www.givedirectly.org/crypto/',
    image: 'https://static.cdnlogo.com/logos/g/23/givedirectly.svg',
    chain: 1,
    tokens: [{ token: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', presetAmounts: [5, 10, 25] }],
  },
  {
    name: 'Rainforest Foundation US',
    address: '0x98f5A404991Cc74590564cbECA88c8d8B76D6407',
    about: 'Supports Indigenous-led protection of tropical rainforests across the Americas.',
    link: 'https://rainforestfoundation.org/give/cryptocurrency/',
    image: 'https://pbs.twimg.com/profile_banners/20268832/1732543962/1500x500',
    chain: 1,
    tokens: [{ token: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', presetAmounts: [5, 10, 25] }],
  },
  {
    name: 'SENS Research Foundation Europe',
    address: '0xf4255Eb22c98EdFDf127f57035990Df9A0e4e136',
    about: 'Non-profit biomedical R&D aiming to end age-related disease.',
    link: 'https://sens.org/donate/',
    image: 'https://images.crunchbase.com/image/upload/c_pad,h_160,w_160,f_auto,b_white,q_auto:eco,dpr_1/v1426832792/bakudewvkwl21dhsixal.png',
    chain: 1,
    tokens: [{ token: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', presetAmounts: [5, 10, 25] }],
  },
];

const useCharityClaims = (streamContract, charities) => {
  const [charityClaims, setCharityClaims] = useState({});

  const claimForCharity = useCallback(
    async (charityAddr) => {
      if (!streamContract) return;
      try {
        const charity = charities.find((c) => c.address === charityAddr);
        if (!charity) return;

        const hashes = [];
        charity.tokens.forEach((token) => {
          const hash = ethers.keccak256(
            ethers.solidityPacked(
              ['address', 'address', 'address'],
              [streamContract.runner.address, token.address, charity.address]
            )
          );
          hashes.push(hash);
        });

        const tx = await streamContract.batchStreamAvailableAllowances(hashes);
        await tx.wait();
        toast.success(`Claimed for ${charity.name}!`);
      } catch (err) {
        console.error(err);
        toast.error('Claim failed');
      }
    },
    [streamContract, charities]
  );

  return { charityClaims, claimForCharity };
};

export default function Charity() {
  const { address: userAddress } = useAccount();
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const chainID = useChainId();

  const [charities, setCharities] = useState(defaultCharities);
  const [streamContract, setStreamContract] = useState(null);
  const [charitySubs, setCharitySubs] = useState({});
  const [charityPlans, setCharityPlans] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [sub, setSub] = useState(30);

  const { charityClaims, claimForCharity } = useCharityClaims(streamContract, charities);

  useEffect(() => {
    if (signer) {
      const sc = new ethers.Contract(streamContractAddress, streamContractABI, signer);
      setStreamContract(sc);
    }
  }, [signer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('newCharity');
    if (encoded) {
      try {
        const decoded = JSON.parse(atob(encoded));
        const alreadyExists = charities.some(
          (c) => c.address.toLowerCase() === decoded.address.toLowerCase()
        );
        if (!alreadyExists) {
          if (decoded.chain !== chainID) {
            toast.error('This charity is not available on this chain.');
            return;
          }
          decoded.share = true;
          decoded.chain = chainID;
          setCharities((prev) => [...prev, decoded]);
          toast.success(`Loaded new charity: ${decoded.name}`);
        }
      } catch (err) {
        console.error('Could not parse newCharity param:', err);
      }
    }
  }, [chainID]);

  useEffect(() => {
    if (streamContract && userAddress) {
      fetchSubscriptions();
    }
  }, [streamContract, userAddress, charities]);

  const fetchSubscriptions = async () => {
    if (!streamContract || !userAddress) return;

    try {
      const tokensArr = [];
      const streamersArr = [];
      const recipientsArr = [];

      charities.forEach((charity) => {
        charity.tokens.forEach((token) => {
          tokensArr.push(token.address);
          streamersArr.push(userAddress);
          recipientsArr.push(charity.address);
        });
      });

      const hashes = tokensArr.map((tokenAddr, i) =>
        ethers.keccak256(
          ethers.solidityPacked(
            ['address', 'address', 'address'],
            [streamersArr[i], tokenAddr, recipientsArr[i]]
          )
        )
      );

      const [availableAmounts, decimalsArr, str, st, detailsArr] =
        await streamContract.getStreamDetails(hashes);

      const results = {};
      let idx = 0;
      charities.forEach((charity) => {
        results[charity.address] = {};
        charity.tokens.forEach((token) => {
          const details = detailsArr[idx];
          const decimals = Number(decimalsArr[idx]);
          const available = Number(availableAmounts[idx]);

          results[charity.address][token.address] = {
            details: {
              streamer: details[0],
              recipient: details[1],
              token: details[2],
              totalStreamed: details[3],
              outstanding: details[4],
              allowable: details[5],
              window: details[6],
              timestamp: details[7],
              once: details[8],
            },
            amountAllowed: available > 0 ? ethers.formatUnits(details[5], decimals) : 0,
          };
          idx++;
        });
      });

      setCharitySubs(results);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    }
  };

  const handleSubscribe = async (charityAddr) => {
    if (!streamContract || !userAddress) return;

    const planState = charityPlans[charityAddr];
    if (!planState || !planState.selectedToken) {
      toast.error('Please select a token and amount');
      return;
    }

    const charity = charities.find((c) => c.address === charityAddr);
    const tokenObj = charity.tokens.find((t) => t.address === planState.selectedToken);

    let amountValue = '0';
    if (planState.plan === 'custom') {
      amountValue = planState.customValue || '0';
    } else {
      amountValue = planState.plan || '0';
    }

    if (!amountValue || parseFloat(amountValue) <= 0) {
      toast.error('Invalid amount');
      return;
    }

    try {
      const tokenContract = new ethers.Contract(tokenObj.address, tokenABI, signer);
      const decimals = await tokenContract.decimals();
      const parsedAmount = ethers.parseUnits(amountValue, decimals);

      const allowance = await tokenContract.allowance(userAddress, streamContractAddress);
      if (allowance < parsedAmount) {
        const approveTx = await tokenContract.approve(streamContractAddress, parsedAmount);
        await approveTx.wait();
        toast.success('Approval successful!');
      }

      const isRecurring = planState.subType === 'recurring';
      const windowInSeconds = isRecurring ? 30 * 24 * 60 * 60 : sub * 24 * 60 * 60;

      const tx = await streamContract.allowStream(
        tokenObj.address,
        charityAddr,
        parsedAmount,
        windowInSeconds,
        !isRecurring
      );
      await tx.wait();

      toast.success(`Subscribed to ${charity.name}!`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Subscribe error:', error);
      toast.error('Subscription failed');
    }
  };

  const handleTokenSelect = (charityAddr, tokenAddr) => {
    setCharityPlans((prev) => ({
      ...prev,
      [charityAddr]: {
        ...prev[charityAddr],
        selectedToken: tokenAddr,
      },
    }));
  };

  const handlePlanChange = (charityAddr, plan) => {
    setCharityPlans((prev) => ({
      ...prev,
      [charityAddr]: {
        ...prev[charityAddr],
        plan,
        customValue: plan === 'custom' ? prev[charityAddr]?.customValue : '',
      },
    }));
  };

  const handleCustomValueChange = (charityAddr, value) => {
    setCharityPlans((prev) => ({
      ...prev,
      [charityAddr]: {
        ...prev[charityAddr],
        customValue: value,
      },
    }));
  };

  const handleSubTypeChange = (charityAddr, type) => {
    setCharityPlans((prev) => ({
      ...prev,
      [charityAddr]: {
        ...prev[charityAddr],
        subType: type,
      },
    }));
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
                  <IconButton href="https://boop.finance" target="_blank" sx={{ color: '#fff' }}>
                    <img src="https://boop.finance/logo.png" alt="Boop" style={{ width: 32, height: 32 }} />
                  </IconButton>
                  <IconButton href="https://discord.gg/vrV4YpUccq" target="_blank" sx={{ color: '#fff' }}>
                    <img src="https://cdn.simpleicons.org/discord/fff" alt="Discord" style={{ width: 32, height: 32 }} />
                  </IconButton>
                  <IconButton href="https://x.com/0xboop" target="_blank" sx={{ color: '#fff' }}>
                    <img src="https://cdn.simpleicons.org/x/fff" alt="X" style={{ width: 32, height: 32 }} />
                  </IconButton>
                </Stack>
              </Box>
              <ConnectButton />
            </Stack>

            <Typography variant="h3" fontWeight={800} sx={{ color: '#fff', mb: 2 }}>
              <Favorite sx={{ mr: 1, fontSize: 40 }} />
              Subscribe to a Charity
            </Typography>
            <Typography variant="h6" sx={{ color: alpha('#fff', 0.9), maxWidth: 700, mx: 'auto' }}>
              Your subscriptions help these organizations continue their important work.
              Pick a token and a plan to show your support!
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Charities Grid */}
        <Grid container spacing={3}>
          {charities
            .filter((charity) => charity.chain === chainID)
            .sort((a, b) => (b.share ? 1 : 0) - (a.share ? 1 : 0))
            .map((charity) => {
              const planState = charityPlans[charity.address] || {};
              const chosenTokenObj =
                charity.tokens.find((t) => t.address === planState.selectedToken) || charity.tokens[0];
              const subInfoObj = charitySubs[charity.address]?.[chosenTokenObj.address];
              const isSubscribed = subInfoObj && Number(subInfoObj.amountAllowed) > 0;

              return (
                <Grid item xs={12} sm={6} md={4} key={charity.address}>
                  <GlassCard
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      ...(isSubscribed && {
                        border: '2px solid',
                        borderColor: 'success.main',
                      }),
                    }}
                  >
                    {charity.image && (
                      <CardMedia
                        component="img"
                        height="160"
                        image={charity.image}
                        alt={charity.name}
                        sx={{ borderRadius: '20px 20px 0 0' }}
                      />
                    )}

                    <Chip
                      label={charity.share ? 'Shared' : 'Verified'}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        background: charity.share ? gradients.ocean : gradients.success,
                        color: '#fff',
                        fontWeight: 700,
                      }}
                    />

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                        {charity.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {charity.about}
                      </Typography>

                      {charity.link && (
                        <Button
                          size="small"
                          startIcon={<LinkIcon />}
                          href={charity.link}
                          target="_blank"
                          sx={{ mb: 2 }}
                        >
                          More info
                        </Button>
                      )}

                      {isSubscribed && (
                        <Chip
                          icon={<CheckCircle />}
                          label={`Subscribed: ${Number(subInfoObj.amountAllowed)} ${chosenTokenObj.token}`}
                          color="success"
                          sx={{ mb: 2, width: '100%' }}
                        />
                      )}

                      {/* Token Selection */}
                      {charity.tokens.length > 1 && (
                        <ToggleButtonGroup
                          value={planState.selectedToken || charity.tokens[0].address}
                          exclusive
                          onChange={(e, val) => val && handleTokenSelect(charity.address, val)}
                          fullWidth
                          size="small"
                          sx={{ mb: 2 }}
                        >
                          {charity.tokens.map((token) => (
                            <ToggleButton key={token.address} value={token.address}>
                              {token.token}
                            </ToggleButton>
                          ))}
                        </ToggleButtonGroup>
                      )}

                      {/* Amount Selection */}
                      <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                        Choose an amount:
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
                        {chosenTokenObj.presetAmounts.map((amt) => (
                          <Chip
                            key={amt}
                            label={amt}
                            onClick={() => handlePlanChange(charity.address, String(amt))}
                            color={planState.plan === String(amt) ? 'primary' : 'default'}
                            sx={{ cursor: 'pointer' }}
                          />
                        ))}
                        <Chip
                          label="Custom"
                          onClick={() => handlePlanChange(charity.address, 'custom')}
                          color={planState.plan === 'custom' ? 'primary' : 'default'}
                          sx={{ cursor: 'pointer' }}
                        />
                      </Stack>

                      {planState.plan === 'custom' && (
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          placeholder="Enter custom amount"
                          value={planState.customValue || ''}
                          onChange={(e) => handleCustomValueChange(charity.address, e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      )}

                      {/* Subscription Type */}
                      <ToggleButtonGroup
                        value={planState.subType || 'recurring'}
                        exclusive
                        onChange={(e, val) => val && handleSubTypeChange(charity.address, val)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                      >
                        <ToggleButton value="recurring">Recurring</ToggleButton>
                        <ToggleButton value="once">One-time</ToggleButton>
                      </ToggleButtonGroup>

                      {planState.subType === 'once' && (
                        <TextField
                          size="small"
                          fullWidth
                          type="number"
                          label="Days"
                          value={sub}
                          onChange={(e) => setSub(Number(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                      )}

                      <AnimatedButton
                        fullWidth
                        onClick={() => handleSubscribe(charity.address)}
                        disabled={!planState.plan || !planState.selectedToken}
                      >
                        Subscribe
                      </AnimatedButton>
                    </CardContent>
                  </GlassCard>
                </Grid>
              );
            })}
        </Grid>

        {/* Add New Charity Button */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <AnimatedButton
            variant="outlined"
            startIcon={<Add />}
            onClick={() => setShowForm(!showForm)}
          >
            Share Your Charity
          </AnimatedButton>
        </Box>
      </Container>
    </Box>
  );
}
