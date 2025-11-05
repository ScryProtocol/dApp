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
  Button,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Card,
  CardContent,
  Collapse,
  alpha,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Add,
  Close,
  ContentCopy,
  CheckCircle,
  Edit,
  Share,
  Settings,
  Link as LinkIcon,
  Cancel,
  MonetizationOn,
} from '@mui/icons-material';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useEthersProvider, useEthersSigner } from './tl';
import { GlassCard, AnimatedButton } from './v2';
import { gradients } from '../theme/v2Theme';
import tokens from './tokens.js';

const streamContractAddress = '0x2726ef320b8ba1dd043dbacfe5beb088806ef478';
const streamContractABI = [
  'function streamDetails(bytes32) view returns (address streamer, address recipient, address token, uint256 totalStreamed, uint256 outstanding, uint256 allowable, uint256 window, uint256 timestamp, bool once)',
  'function allowStream(address token, address recipient, uint256 amount, uint256 window, bool once)',
  'function getStreamDetails(bytes32[] calldata hashes) public view returns (uint[] memory, uint8[] memory, string[] memory, string[] memory, tuple(address streamer, address recipient, address token, uint256 totalStreamed, uint256 outstanding, uint256 allowable, uint256 window, uint256 timestamp, bool once)[] memory)',
  'function viewRecipientAllowances(address recipient) view returns (bytes32[] memory hashes)',
  'function batchStreamAvailableAllowances(bytes32[] calldata hashes) external returns (bool)',
  'function viewStreamerAllowances(address streamer) view returns (bytes32[] memory hashes)',
  'function getStreamable(bytes32[] calldata hashes) public view returns (bool[] memory canStream,uint[] memory balances, uint[] memory allowances)',
];

const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function allowance(address owner, address spender) view returns (uint)',
  'function approve(address spender, uint amount)',
];

const LOCAL_FRONTS_KEY = 'mySubscriptionFronts_v2';
const LOCAL_BRAND_KEY = 'myCustomBrandSettings_v2';

export default function Sub() {
  const chainID = useChainId();
  const { address: userAddress } = useAccount();
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  const [paramData, setParamData] = useState(null);
  const [fronts, setFronts] = useState([]);
  const [brandSettings, setBrandSettings] = useState({
    brandName: 'My Custom Brand',
    about: '',
    primaryColor: '#EC4899',
    gradientColor1: '#fbcfe8',
    gradientColor2: '#fed7aa',
    gradientColor3: '#fef08a',
  });

  const [streamContract, setStreamContract] = useState(null);
  const [frontSubs, setFrontSubs] = useState({});
  const [frontPlans, setFrontPlans] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showClaims, setShowClaims] = useState(false);
  const [frontClaims, setFrontClaims] = useState({});

  // New front form state
  const [newFront, setNewFront] = useState({
    name: '',
    address: '',
    about: '',
    image: '',
    tokens: [{ symbol: 'USDC', address: '', presetAmounts: [5, 10, 20] }],
  });

  useEffect(() => {
    if (signer) {
      const sc = new ethers.Contract(streamContractAddress, streamContractABI, signer);
      setStreamContract(sc);
    }
  }, [signer]);

  // Load from URL param or localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('sub');
    if (encoded) {
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        setParamData(decoded);

        if (decoded.brand) {
          setBrandSettings(decoded.brand);
        }
        if (Array.isArray(decoded.fronts)) {
          const mapped = decoded.fronts.map((f) => ({
            ...f,
            chain: f.chain || chainID,
          }));
          setFronts(mapped);
        } else if (decoded.singleFront) {
          decoded.singleFront.chain = decoded.singleFront.chain || chainID;
          setFronts([decoded.singleFront]);
        }
      } catch (err) {
        console.error('Invalid ?sub= data', err);
        toast.error('Invalid shared link');
      }
    } else {
      const savedFronts = localStorage.getItem(LOCAL_FRONTS_KEY);
      if (savedFronts) {
        try {
          const parsed = JSON.parse(savedFronts);
          if (Array.isArray(parsed)) setFronts(parsed);
        } catch (err) {
          console.error('Failed to parse local fronts:', err);
        }
      }
      const savedBrand = localStorage.getItem(LOCAL_BRAND_KEY);
      if (savedBrand) {
        try {
          const parsed = JSON.parse(savedBrand);
          setBrandSettings((prev) => ({ ...prev, ...parsed }));
        } catch (err) {
          console.error('Failed to parse brand settings:', err);
        }
      }
    }
  }, [chainID]);

  const hasParam = !!paramData;

  const saveLocalFronts = useCallback(
    (frontsArr) => {
      if (hasParam) return;
      setFronts(frontsArr);
      localStorage.setItem(LOCAL_FRONTS_KEY, JSON.stringify(frontsArr));
      toast.success('Fronts saved locally!');
    },
    [hasParam]
  );

  const saveLocalBrand = useCallback(
    (brandObj) => {
      if (hasParam) return;
      setBrandSettings(brandObj);
      localStorage.setItem(LOCAL_BRAND_KEY, JSON.stringify(brandObj));
      toast.success('Brand settings saved locally!');
    },
    [hasParam]
  );

  function handleCopyLink() {
    const dataToShare = {
      brand: brandSettings,
      fronts,
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(dataToShare))));
    const url = `${window.location.origin}${window.location.pathname}?sub=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied!');
    });
  }

  async function handleCopyShortLink() {
    const dataToShare = {
      brand: brandSettings,
      fronts,
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(dataToShare))));
    const url = `${window.location.origin}${window.location.pathname}?sub=${encoded}`;
    const res = await fetch('https://tinyurl.com/api-create.php?url=' + url);
    navigator.clipboard.writeText(await res.text()).then(() => {
      toast.success('Short link copied!');
    });
  }

  function handleBrandChange(e) {
    const { name, value } = e.target;
    setBrandSettings((prev) => ({ ...prev, [name]: value }));
  }

  function handleSaveBrand() {
    saveLocalBrand(brandSettings);
    setShowBrandForm(false);
  }

  // Fetch subscription details
  useEffect(() => {
    if (!streamContract || !userAddress || !fronts.length) return;
    (async () => {
      try {
        const tokensArr = [];
        const streamersArr = [];
        const recipientsArr = [];

        fronts.forEach((front) => {
          front.tokens.forEach((tk) => {
            tokensArr.push(tk.address);
            streamersArr.push(userAddress);
            recipientsArr.push(front.address);
          });
        });

        const hashes = tokensArr.map((tokenAddr, i) =>
          ethers.keccak256(
            ethers.solidityPacked(['address', 'address', 'address'], [
              streamersArr[i],
              tokenAddr,
              recipientsArr[i],
            ])
          )
        );

        const [, decimalsArr, , , detailsArr] = await streamContract.getStreamDetails(hashes);

        const results = {};
        let idx = 0;
        fronts.forEach((front) => {
          results[front.address] = {};
          front.tokens.forEach((tk) => {
            const detail = detailsArr[idx];
            const dec = decimalsArr[idx];
            if (detail.streamer.toLowerCase() === ethers.ZeroAddress) {
              results[front.address][tk.address] = null;
            } else {
              const allowedNum = Number(ethers.formatUnits(detail.allowable, dec)).toFixed(4);
              results[front.address][tk.address] = {
                details: detail,
                amountAllowed: allowedNum,
              };
            }
            idx++;
          });
        });
        setFrontSubs(results);
      } catch (err) {
        console.error('Failed to fetch subscription details:', err);
      }
    })();
  }, [streamContract, userAddress, fronts]);

  function handlePlanChange(frontAddress, plan) {
    setFrontPlans((prev) => ({
      ...prev,
      [frontAddress]: {
        ...prev[frontAddress],
        plan,
        customValue: plan === 'custom' ? prev[frontAddress]?.customValue || '' : '',
      },
    }));
  }

  function handleCustomValueChange(frontAddress, val) {
    setFrontPlans((prev) => ({
      ...prev,
      [frontAddress]: {
        ...prev[frontAddress],
        plan: 'custom',
        customValue: val,
      },
    }));
  }

  function handleSubTypeChange(frontAddress, newType) {
    setFrontPlans((prev) => ({
      ...prev,
      [frontAddress]: {
        ...prev[frontAddress],
        subType: newType,
      },
    }));
  }

  function handleOnceIntervalChange(frontAddress, val) {
    setFrontPlans((prev) => ({
      ...prev,
      [frontAddress]: {
        ...prev[frontAddress],
        onceInterval: parseInt(val) || 1,
      },
    }));
  }

  function handleTokenSelect(frontAddress, tokenAddr) {
    setFrontPlans((prev) => ({
      ...prev,
      [frontAddress]: {
        ...prev[frontAddress],
        selectedToken: tokenAddr,
      },
    }));
  }

  async function handleSubscribeFront(frontAddress) {
    if (!streamContract || !userAddress) {
      return toast.error('Connect wallet first!');
    }

    const planObj = frontPlans[frontAddress] || {};
    let { selectedToken, plan, customValue, subType, onceInterval } = planObj;
    const front = fronts.find((f) => f.address === frontAddress);

    if (!front) return;
    if (!selectedToken) {
      selectedToken = front.tokens[0]?.address;
    }
    if (!plan) return toast.error('Pick an amount or custom value');

    let numeric = parseFloat(plan === 'custom' ? customValue : plan);
    numeric = subType === 'once' ? numeric * (onceInterval || 1) : numeric;
    if (isNaN(numeric) || numeric <= 0) {
      return toast.error('Invalid subscription amount');
    }

    try {
      const once = subType === 'once';
      const tokenContract = new ethers.Contract(selectedToken, tokenABI, signer);
      const decimals = await tokenContract.decimals();
      const parsed = ethers.parseUnits(String(numeric), decimals);

      const userBal = await tokenContract.balanceOf(userAddress);
      if (userBal < parsed) {
        return toast.error('Insufficient balance');
      }

      const allowance = await tokenContract.allowance(userAddress, streamContractAddress);
      if (allowance < parsed) {
        toast('Approving token...');
        const txA = await tokenContract.approve(streamContractAddress, ethers.MaxUint256);
        await txA.wait();
      }

      toast('Creating subscription...');
      const months = once ? onceInterval || 1 : 1;
      const windowSeconds = months * 24 * 60 * 60 * 30;

      const tx = await streamContract.allowStream(selectedToken, frontAddress, parsed, windowSeconds, once);
      await tx.wait();

      toast.success('Subscription created!');
    } catch (err) {
      console.error('Subscription failed:', err);
      toast.error('Subscription failed');
    }
  }

  async function handleCancelSubscription(frontAddress) {
    if (!streamContract || !userAddress) {
      return toast.error('Connect wallet first!');
    }
    const front = fronts.find((f) => f.address === frontAddress);
    if (!front || !front.tokens.length) return;
    const firstToken = front.tokens[0];

    try {
      toast('Canceling subscription...');
      const tx = await streamContract.allowStream(firstToken.address, frontAddress, 0, 0, false);
      await tx.wait();
      toast.success('Subscription canceled!');
    } catch (err) {
      console.error('Cancel failed:', err);
      toast.error('Cancel subscription failed');
    }
  }

  // Claims functionality
  const fetchFrontClaims = useCallback(async () => {
    if (!streamContract) return;
    try {
      const claims = {};
      for (const front of fronts) {
        let hashes = await streamContract.viewRecipientAllowances(front.address);
        hashes = Array.from(hashes);
        if (!hashes.length) continue;

        const [avail, dec, , sym, details] = await streamContract.getStreamDetails(hashes);
        hashes.forEach((_, i) => {
          if (avail[i] === 0n) return;
          const tokenAddr = details[i].token.toLowerCase();
          if (!claims[front.address]) claims[front.address] = {};
          const prev = claims[front.address][tokenAddr]?.amount || 0n;
          claims[front.address][tokenAddr] = {
            amount: prev + avail[i],
            decimals: dec[i],
            symbol: sym[i] || tokenAddr.slice(0, 6),
          };
        });
      }
      setFrontClaims(claims);
    } catch (err) {
      console.error('fetchFrontClaims error:', err);
    }
  }, [streamContract, fronts]);

  useEffect(() => {
    fetchFrontClaims();
    const interval = setInterval(fetchFrontClaims, 30000);
    return () => clearInterval(interval);
  }, [fetchFrontClaims]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === '`') {
        e.preventDefault();
        setShowClaims((p) => !p);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  async function claimForFront(frontAddr, tokenAddr = null) {
    if (!streamContract) return;
    try {
      let hashes = await streamContract.viewRecipientAllowances(frontAddr);
      hashes = Array.from(hashes);
      if (!hashes.length) return toast.error('Nothing to claim');

      if (tokenAddr) {
        const [, , , , details] = await streamContract.getStreamDetails(hashes);
        hashes = hashes.filter((_, i) => details[i].token.toLowerCase() === tokenAddr.toLowerCase());
        if (!hashes.length) return toast.error('Nothing to claim');
      }

      toast('Claiming…');
      const tx = await streamContract.batchStreamAvailableAllowances(hashes);
      await tx.wait();
      toast.success('Claimed!');
      fetchFrontClaims();
    } catch (err) {
      console.error('Claim failed:', err);
      toast.error('Claim failed');
    }
  }

  // Add new front
  function handleAddFront() {
    if (!newFront.name || !newFront.address) {
      return toast.error('Name and address are required');
    }
    const newFrontObj = {
      ...newFront,
      chain: chainID,
    };
    saveLocalFronts([...fronts, newFrontObj]);
    setNewFront({
      name: '',
      address: '',
      about: '',
      image: '',
      tokens: [{ symbol: 'USDC', address: '', presetAmounts: [5, 10, 20] }],
    });
    setShowForm(false);
  }

  const pageBackground = `linear-gradient(to right, ${brandSettings.gradientColor1}, ${brandSettings.gradientColor2}, ${brandSettings.gradientColor3})`;

  return (
    <Box sx={{ minHeight: '100vh', background: pageBackground }}>
      <Toaster />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          py: 4,
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Chip
                label="Powered by Boop.Finance"
                sx={{
                  background: 'rgba(255, 255, 255, 0.25)',
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
                {!hasParam && (
                  <IconButton
                    onClick={() => window.location.assign(window.location.origin + '?sub')}
                    sx={{ color: '#fff', fontSize: '2rem' }}
                    title="Create Your Own"
                  >
                    🛠️
                  </IconButton>
                )}
              </Stack>
            </Box>
            <ConnectButton />
          </Stack>

          <Typography
            variant="h3"
            fontWeight={800}
            textAlign="center"
            sx={{ color: brandSettings.primaryColor, mb: 2 }}
          >
            {brandSettings.brandName}
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.primary" sx={{ maxWidth: 800, mx: 'auto', mb: 3 }}>
            {brandSettings.about ||
              'Let fans or supporters subscribe on-chain. Recurring or one-shot—choose intervals, tokens, etc. Tokens are streamed directly from your wallet, no deposits. Press "`" to see claimable if you\'re the owner.'}
          </Typography>

          {!hasParam && (
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              <AnimatedButton startIcon={<Add />} onClick={() => setShowForm(true)}>
                Add New Sub
              </AnimatedButton>
              <AnimatedButton startIcon={<Settings />} onClick={() => setShowBrandForm(true)} variant="outlined">
                Brand Settings
              </AnimatedButton>
              <AnimatedButton startIcon={<Share />} onClick={handleCopyLink} variant="outlined">
                Share Link
              </AnimatedButton>
              <AnimatedButton startIcon={<LinkIcon />} onClick={handleCopyShortLink} variant="outlined">
                Short Link
              </AnimatedButton>
            </Stack>
          )}
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        {/* Claims Section */}
        <Collapse in={showClaims}>
          <GlassCard sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" fontWeight={700} color="primary.main" gutterBottom>
              <MonetizationOn sx={{ mr: 1 }} />
              Claimable Funds
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(frontClaims).map(([frontAddr, tokens]) => {
                const front = fronts.find((f) => f.address === frontAddr);
                return (
                  <Grid item xs={12} md={6} key={frontAddr}>
                    <Card sx={{ p: 2 }}>
                      <Typography variant="h6" gutterBottom>
                        {front?.name || frontAddr.slice(0, 10)}
                      </Typography>
                      {Object.entries(tokens).map(([tokenAddr, data]) => (
                        <Box key={tokenAddr} sx={{ mb: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2">
                              {ethers.formatUnits(data.amount, data.decimals)} {data.symbol}
                            </Typography>
                            <Button size="small" onClick={() => claimForFront(frontAddr, tokenAddr)}>
                              Claim
                            </Button>
                          </Stack>
                        </Box>
                      ))}
                      <Button fullWidth variant="contained" onClick={() => claimForFront(frontAddr)} sx={{ mt: 2 }}>
                        Claim All
                      </Button>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </GlassCard>
        </Collapse>

        {/* Subscription Fronts */}
        <Grid container spacing={3}>
          {fronts.map((front) => {
            const planState = frontPlans[front.address] || {};
            const chosenTokenObj = front.tokens.find((t) => t.address === planState.selectedToken) || front.tokens[0];
            const subInfoObj = frontSubs[front.address]?.[chosenTokenObj?.address];
            const isSubscribed = subInfoObj && Number(subInfoObj.amountAllowed) > 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={front.address}>
                <GlassCard
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    ...(isSubscribed && {
                      border: '2px solid',
                      borderColor: 'success.main',
                    }),
                  }}
                >
                  {front.image && (
                    <Box
                      component="img"
                      src={front.image}
                      alt={front.name}
                      sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: '20px 20px 0 0' }}
                    />
                  )}

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" fontWeight={700} color="primary.main" gutterBottom>
                      {front.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {front.about}
                    </Typography>

                    {isSubscribed && (
                      <Chip
                        icon={<CheckCircle />}
                        label={`Subscribed: ${Number(subInfoObj.amountAllowed)} ${chosenTokenObj.symbol}`}
                        color="success"
                        sx={{ mb: 2, width: '100%' }}
                      />
                    )}

                    {/* Token Selection */}
                    {front.tokens.length > 1 && (
                      <ToggleButtonGroup
                        value={planState.selectedToken || front.tokens[0].address}
                        exclusive
                        onChange={(e, val) => val && handleTokenSelect(front.address, val)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                      >
                        {front.tokens.map((token) => (
                          <ToggleButton key={token.address} value={token.address}>
                            {token.symbol}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                    )}

                    {/* Amount Selection */}
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Choose an amount:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2, gap: 1 }}>
                      {chosenTokenObj?.presetAmounts.map((amt) => (
                        <Chip
                          key={amt}
                          label={amt}
                          onClick={() => handlePlanChange(front.address, String(amt))}
                          color={planState.plan === String(amt) ? 'primary' : 'default'}
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                      <Chip
                        label="Custom"
                        onClick={() => handlePlanChange(front.address, 'custom')}
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
                        onChange={(e) => handleCustomValueChange(front.address, e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    )}

                    {/* Subscription Type */}
                    <ToggleButtonGroup
                      value={planState.subType || 'recurring'}
                      exclusive
                      onChange={(e, val) => val && handleSubTypeChange(front.address, val)}
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
                        label="Months"
                        value={planState.onceInterval || 1}
                        onChange={(e) => handleOnceIntervalChange(front.address, e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Stack spacing={1}>
                      <AnimatedButton
                        fullWidth
                        onClick={() => handleSubscribeFront(front.address)}
                        disabled={!planState.plan}
                      >
                        Subscribe
                      </AnimatedButton>
                      {isSubscribed && (
                        <Button
                          fullWidth
                          variant="outlined"
                          color="error"
                          startIcon={<Cancel />}
                          onClick={() => handleCancelSubscription(front.address)}
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>
                  </CardContent>
                </GlassCard>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Brand Settings Dialog */}
      <Dialog open={showBrandForm} onClose={() => setShowBrandForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Brand Settings
          <IconButton
            onClick={() => setShowBrandForm(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Brand Name"
              name="brandName"
              value={brandSettings.brandName}
              onChange={handleBrandChange}
            />
            <TextField
              fullWidth
              label="About"
              name="about"
              multiline
              rows={3}
              value={brandSettings.about}
              onChange={handleBrandChange}
            />
            <TextField
              fullWidth
              label="Primary Color"
              name="primaryColor"
              type="color"
              value={brandSettings.primaryColor}
              onChange={handleBrandChange}
            />
            <Typography variant="subtitle2">Gradient Colors:</Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Color 1"
                name="gradientColor1"
                type="color"
                value={brandSettings.gradientColor1}
                onChange={handleBrandChange}
              />
              <TextField
                label="Color 2"
                name="gradientColor2"
                type="color"
                value={brandSettings.gradientColor2}
                onChange={handleBrandChange}
              />
              <TextField
                label="Color 3"
                name="gradientColor3"
                type="color"
                value={brandSettings.gradientColor3}
                onChange={handleBrandChange}
              />
            </Stack>
            <AnimatedButton fullWidth onClick={handleSaveBrand}>
              Save Brand Settings
            </AnimatedButton>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Add New Front Dialog */}
      <Dialog open={showForm} onClose={() => setShowForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add New Subscription Front
          <IconButton onClick={() => setShowForm(false)} sx={{ position: 'absolute', right: 8, top: 8 }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={newFront.name}
              onChange={(e) => setNewFront({ ...newFront, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Address"
              value={newFront.address}
              onChange={(e) => setNewFront({ ...newFront, address: e.target.value })}
              placeholder="0x..."
            />
            <TextField
              fullWidth
              label="About"
              multiline
              rows={2}
              value={newFront.about}
              onChange={(e) => setNewFront({ ...newFront, about: e.target.value })}
            />
            <TextField
              fullWidth
              label="Image URL"
              value={newFront.image}
              onChange={(e) => setNewFront({ ...newFront, image: e.target.value })}
            />
            <AnimatedButton fullWidth onClick={handleAddFront}>
              Add Front
            </AnimatedButton>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
