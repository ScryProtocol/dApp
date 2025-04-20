import React, { useState, useEffect,useCallback, use } from 'react'; 
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount,useChainId } from 'wagmi';
import { useEthersProvider, useEthersSigner } from './tl';
import 'tailwindcss/tailwind.css';

// --------------------
// Contract Info
// --------------------
const streamContractAddress = '0x2726ef320b8ba1dd043dbacfe5beb088806ef478';

const streamContractABI = [
  'function computeHash(address streamer, address token, address recipient) view returns (bytes32)',
  'function streamDetails(bytes32) view returns (address streamer, address recipient, address token, uint256 totalStreamed, uint256 outstanding, uint256 allowable, uint256 window, uint256 timestamp, bool once)',
  'function allowStream(address token, address recipient, uint256 amount, uint256 window, bool once)',
  // batch calls
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

// --------------------
// Default Charities
// --------------------
const defaultCharities = [
  {
    name: 'Save The Paws',
    address: '0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5',
    about: 'Helping stray animals find safe homes & medical care.',
    link: 'https://example.org/save-the-paws',
    image: 'https://pbs.twimg.com/profile_images/1240285183594713088/kEXEEeFC_400x400.jpg',
    chain: 2,
    tokens: [
      {
        token: 'USDC',
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        presetAmounts: [5, 10, 20],
      },
      {
        token: 'DAI',
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        presetAmounts: [5, 10],
      },
    ],
  },
  {
    name: 'Green Earth Initiative',
    address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
    about: 'Planting trees & cleaning waterways globally.',
    link: 'https://example.org/green-earth',
    image: 'https://placehold.co/300x200?text=Green+Earth',
    chain: 2,
    tokens: [
      {
        token: 'USDC',
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        presetAmounts: [5, 10, 20],
      },
    ],
  },
  {
    name: 'Protocol Guild',
    address: '0x32e3C7fD24e175701A35c224f2238d18439C7dBC',
    about:
      'independent non-profit funding 190 Ethereum L1 R&D maintainers 🌿 $100mm from the ecosystem in an onchain 4yr vest 🌿 stewarding our commons infra.',
    link: 'https://example.org/water-for-all',
    image: 'https://pbs.twimg.com/profile_images/1529206083390255110/UkK0Hc6q_400x400.jpg',
    chain: 8453,
    tokens: [
      {
        token: 'USDC',
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        presetAmounts: [5, 10, 20],
      },
      {
        token: 'wETH',
        address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        presetAmounts: [0.005, 0.01, 0.05],
      },
    ],
  },{
    name: 'Protocol Guild',
    address: '0x32e3C7fD24e175701A35c224f2238d18439C7dBC',
    about:
      'Independent non-profit funding 190 Ethereum L1 R&D maintainers 🌿 $100mm from the ecosystem in an onchain 4yr vest 🌿 Stewarding our commons infra.',
    link: 'https://example.org/water-for-all',
    image: 'https://pbs.twimg.com/profile_images/1529206083390255110/UkK0Hc6q_400x400.jpg',
    chain: 1,
    tokens: [
      {
        token: 'USDC',
        address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        presetAmounts: [5, 10, 20],
      },
      {
        token: 'wETH',
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        presetAmounts: [0.005, 0.01, 0.05],
      },
    ],
  },{
    name: 'GiveDirectly',
    address: '0x69b4B1Ee9b7c619AdC51C256869cE705841BeD44',
    about: 'Delivers unconditional cash transfers to families living in extreme poverty.',
    link: 'https://www.givedirectly.org/crypto/',
    image: 'https://static.cdnlogo.com/logos/g/23/givedirectly.svg',   // 4 KB SVG, scales crisply :contentReference[oaicite:0]{index=0}
    chain: 1,
    tokens: [{ token: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', presetAmounts: [5, 10,25] }],
  },
  {
    name: 'Rainforest Foundation US',
    address: '0x98f5A404991Cc74590564cbECA88c8d8B76D6407',
    about: 'Supports Indigenous‑led protection of tropical rainforests across the Americas.',
    link: 'https://rainforestfoundation.org/give/cryptocurrency/',
    image: 'https://pbs.twimg.com/profile_banners/20268832/1732543962/500x200', // 879 × 144 JPG :contentReference[oaicite:1]{index=1}
    chain: 1,
    tokens: [{ token: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', presetAmounts: [5, 10,25] }],
  },
  {
    name: 'SENS Research Foundation Europe',
    address: '0xf4255Eb22c98EdFDf127f57035990Df9A0e4e136',
    about: 'Non‑profit biomedical R&D aiming to end age‑related disease.',
    link: 'https://sens.org/donate/',
    image: 'https://images.crunchbase.com/image/upload/c_pad,h_160,w_160,f_auto,b_white,q_auto:eco,dpr_1/v1426832792/bakudewvkwl21dhsixal.png',                  // 800 × 124 PNG :contentReference[oaicite:2]{index=2}
    chain: 1,
    tokens: [{ token: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', presetAmounts: [5, 10,25] }],
  },
  {
    name: 'India Covid Crypto Relief Fund',
    address: '0x68A99f89E475a078645f4BAC491360aFe255Dff1',
    about: 'Community‑run fund providing healthcare & essentials during India’s COVID‑19 crisis.',
    link: 'https://cryptorelief.in/',
    image: 'https://www.cphcalliance.org/frontend/assets/images/crypo-relief.png',               // 300 × 300 PNG :contentReference[oaicite:3]{index=3}
    chain: 1,
    tokens: [{ token: 'USDC', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', presetAmounts: [5, 10,25] }],
  },
  
];

const Charity = () => {
  const { address: userAddress } = useAccount();
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  // Keep track of all charities (defaults + newly added)
  const [charities, setCharities] = useState(defaultCharities);

  // The contract instance once we have a signer
  const [streamContract, setStreamContract] = useState(null);

  // Mapping of subscription details
  // charitySubs[charityAddress][tokenAddress] => { details, amountAllowed }
  const [charitySubs, setCharitySubs] = useState({});
const chainID = useChainId();
const { charityClaims, claimForCharity } =
  useCharityClaims(streamContract, charities);
  const [pr0, setPr0] = useState(false);
  // The user's plan for each charity
  /**
   * charityPlans[charityAddr] = {
   *   selectedToken: string,
   *   plan: "5"|"10"|"20"|"custom",
   *   customValue: string,
   *   subType: "once"|"recurring"
   * }
   */
  const [charityPlans, setCharityPlans] = useState({});

  // If "once", how many days (default 30)
  const [sub, setSub] = useState(30);

  // Show/hide the "create new charity" form
  const [showForm, setShowForm] = useState(false);

  // The new charity data
  const [newCharity, setNewCharity] = useState({
    name: '',
    address: '',
    about: '',
    link: '',
    image: '',
    tokens: [
      // Start with one token row by default
      { token: 'USDC', address: '', presetAmounts: [5, 10, 20] },
    ],
  });

  // ----------------------------------------------
  // Setup the contract once we have a signer
  // ----------------------------------------------
  useEffect(() => {
    if (signer) {
      const sc = new ethers.Contract(streamContractAddress, streamContractABI, signer);
      setStreamContract(sc);
    }
  }, [signer]);

  // ----------------------------------------------
  // On mount, parse ?newCharity= from window.location
  // ----------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('newCharity');
    if (encoded) {
      try {
        const decoded = JSON.parse(atob(encoded));
        // Only add if not a duplicate
        const alreadyExists = charities.some(
          (c) =>
            c.address.toLowerCase() === decoded.address.toLowerCase() ||
            c.name.toLowerCase() === decoded.name.toLowerCase()
        );
        if (!alreadyExists) {
          decoded.share=true; // mark as shared
          if(decoded.chain!==chainID){
            toast.error('This charity is not available on this chain. Please switch to chain '+decoded.chain);
            return;
          }
          decoded.chain=chainID;
          setCharities((prev) => [...prev, decoded]);
          toast.success(`Loaded new charity: ${decoded.name}`);
        }
      } catch (err) {
        console.error('Could not parse newCharity param as JSON:', err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------
  // Whenever we have contract + user + charities, fetch subscriptions
  // ----------------------------------------------
  useEffect(() => {
    if (streamContract && userAddress) {
      fetchSubscriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamContract, userAddress, charities]);
  const togglePro = useCallback((e) => {
    if (e.key.toLowerCase() === '`') {
      e.preventDefault();
      setPr0((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', togglePro);
    return () => window.removeEventListener('keydown', togglePro);
  }, [togglePro]);
  // ----------------------------------------------
  // Batch fetch subscription info
  // ----------------------------------------------
  const fetchSubscriptions = async () => {
    if (!streamContract || !userAddress) return;

    try {
      const tokensArr = [];
      const streamersArr = [];
      const recipientsArr = [];

      // Build arrays for batch call
      charities.forEach((charity) => {
        charity.tokens.forEach((token) => {
          tokensArr.push(token.address);
          streamersArr.push(userAddress);
          recipientsArr.push(charity.address);
        });
      });

      // Compute keccak256 for each (streamer, token, recipient)
      const hashes = tokensArr.map((tokenAddr, i) =>
        ethers.keccak256(
          ethers.solidityPacked(
            ['address', 'address', 'address'],
            [streamersArr[i], tokenAddr, recipientsArr[i]]
          )
        )
      );
      // Batch query
      const [availableAmounts, decimalsArr, str, st, detailsArr] =
        await streamContract.getStreamDetails(hashes);
console.log('availableAmounts',str,st);
      // Build results structure
      const results = {};
      let idx = 0;
      charities.forEach((charity) => {
        results[charity.address] = {};
        charity.tokens.forEach((token) => {
          const details = detailsArr[idx];
          const decimal = decimalsArr[idx];
          if (details.streamer.toLowerCase() === ethers.ZeroAddress) {
            // Not subscribed
            results[charity.address][token.address] = null;
          } else {
            const amountAllowed = Number(
              ethers.formatUnits(details.allowable, decimal)
            ).toFixed(4);
            results[charity.address][token.address] = {
              details,
              amountAllowed,
            };
          }
          idx++;
        });
      });

      setCharitySubs(results);
    } catch (err) {
      console.error('Failed to fetch subscriptions', err);
    }
  };

  // ----------------------------------------------
  // Subscribe
  // ----------------------------------------------
  const handleSubscribeCharity = async (charityAddress) => {
    if (!userAddress) {
      toast.error('Connect your wallet first!');
      return;
    }

    const planObj = charityPlans[charityAddress] || {};
    let { selectedToken, plan, customValue, subType } = planObj;
    if (!selectedToken) {
      selectedToken = charities.find((c) => c.address === charityAddress)?.tokens?.[0]?.address;
    }
    if (!plan) {
      toast.error('Please select an amount or custom value.');
      return;
    }

    const numeric = parseFloat(plan === 'custom' && customValue ? customValue : plan);
    if (numeric <= 0) {
      toast.error('Invalid subscription amount.');
      return;
    }

    try {
      const once = subType === 'once';
      const tokenContract = new ethers.Contract(selectedToken, tokenABI, signer);
      const decimals = await tokenContract.decimals();
      const parsed = ethers.parseUnits(String(numeric), decimals);

      // Check user balance
      const userBal = await tokenContract.balanceOf(userAddress);
      if (userBal < parsed) {
        toast.error('Insufficient token balance.');
        return;
      }

      // Approve if needed
      const allowance = await tokenContract.allowance(userAddress, streamContractAddress);
      if (allowance < parsed) {
        toast('Approving token...');
        const txA = await tokenContract.approve(streamContractAddress, ethers.MaxUint256);
        await txA.wait();
      }

      toast('Creating subscription...');
      const windowSeconds = sub * 24 * 60 * 60; // e.g. 30 days
      const tx = await streamContract.allowStream(selectedToken, charityAddress, parsed, windowSeconds, once);
      await tx.wait();

      toast.success('Subscription created!');
      fetchSubscriptions();
    } catch (err) {
      console.error('Subscription failed:', err);
      toast.error('Subscription failed.');
    }
  };

  // ----------------------------------------------
  // Cancel subscription
  // ----------------------------------------------
  const handleCancelSubscription = async (charityAddress) => {
    if (!userAddress) {
      toast.error('Connect your wallet first!');
      return;
    }

    // For simplicity, assume the first token in that charity's list is the "subscribed" one
    const firstToken = charities.find((c) => c.address === charityAddress)?.tokens?.[0];
    if (!firstToken) return;

    try {
      toast('Canceling subscription...');
      const tx = await streamContract.allowStream(firstToken.address, charityAddress, 0, 0, false);
      await tx.wait();

      toast.success('Subscription canceled!');
      fetchSubscriptions();
    } catch (err) {
      console.error('Cancel failed:', err);
      toast.error('Failed to cancel subscription.');
    }
  };

  // ----------------------------------------------
  // Plan Handling
  // ----------------------------------------------
  const handlePlanChange = (charityAddress, newPlan) => {
    setCharityPlans((prev) => ({
      ...prev,
      [charityAddress]: {
        ...prev[charityAddress],
        plan: newPlan,
        customValue: newPlan === 'custom' ? prev[charityAddress]?.customValue || '' : '',
      },
    }));
  };

  const handleCustomValueChange = (charityAddress, val) => {
    setCharityPlans((prev) => ({
      ...prev,
      [charityAddress]: {
        ...prev[charityAddress],
        plan: 'custom',
        customValue: val,
      },
    }));
  };

  const handleSubTypeChange = (charityAddress, newType) => {
    setCharityPlans((prev) => ({
      ...prev,
      [charityAddress]: {
        ...prev[charityAddress],
        subType: newType,
      },
    }));
  };

  const handleTokenSelect = (charityAddress, tokenAddr) => {
    setCharityPlans((prev) => ({
      ...prev,
      [charityAddress]: {
        ...prev[charityAddress],
        selectedToken: tokenAddr,
      },
    }));
  };

  const handleSubChange = (val) => setSub(val);

  // ----------------------------------------------
  // Adding multiple tokens in newCharity
  // ----------------------------------------------
  const handleAddTokenRow = () => {
    setNewCharity((prev) => ({
      ...prev,
      tokens: [
        ...prev.tokens,
        { token: '', address: '', presetAmounts: [5, 10, 20] },
      ],
    }));
  };

  const handleRemoveTokenRow = (index) => {
    setNewCharity((prev) => {
      const updated = [...prev.tokens];
      updated.splice(index, 1);
      return { ...prev, tokens: updated };
    });
  };

  const handleTokenFieldChange = (index, field, value) => {
    setNewCharity((prev) => {
      const updatedTokens = [...prev.tokens];
      const tokenObj = { ...updatedTokens[index] };

      if (field === 'preset') {
        // parse comma-separated amounts
        const splitted = value.split(',').map((x) => x.trim()).filter(Boolean);
        const asNumbers = splitted.map((n) => parseFloat(n) || 0).filter((n) => n > 0);
        tokenObj.presetAmounts = asNumbers.length ? asNumbers : [5];
      } else {
        tokenObj[field] = value;
      }
      updatedTokens[index] = tokenObj;
      return { ...prev, tokens: updatedTokens };
    });
  };

  // ----------------------------------------------
  // Submit new charity
  // ----------------------------------------------
  const handleAddCharity = () => {
    // minimal validation
    if (!newCharity.name || !newCharity.address) {
      toast.error('Please fill out the charity name & address');
      return;
    }
    if (!newCharity.tokens.length) {
      toast.error('Please add at least one token');
      return;
    }
    for (let i = 0; i < newCharity.tokens.length; i++) {
      if (!newCharity.tokens[i].address) {
        toast.error('A token entry is missing its address');
        return;
      }
    }
newCharity.chain=chainID;
    // Add to state
    setCharities((prev) => [...prev, newCharity]);

    // Build shareable link
    const encoded = btoa(JSON.stringify(newCharity));
    console.log('Encoded charity:', encoded);
    const baseUrl = window.location.origin + window.location.pathname;
    const shareLink = `${baseUrl}?newCharity=${encoded}`;

    toast.success('New charity added! Share link copied to clipboard.');
    console.log('Share link:', shareLink);

    // Copy to clipboard
    navigator.clipboard.writeText(shareLink).catch(() => {});

    // Reset form
    setNewCharity({
      name: '',
      address: '',
      about: '',
      link: '',
      image: '',
      tokens: [{ token: 'USDC', address: '', presetAmounts: [5, 10, 20] }],
    });
    setShowForm(false);
  };
  
  function useCharityClaims(streamContract, charities) {
    const [charityClaims, setCharityClaims] = useState({});
  
    /* ------------------------------------------------------------ */
    /*  Fetch claimable balances                                    */
    /* ------------------------------------------------------------ */
    const fetchCharityClaims = useCallback(async () => {
      if (!streamContract) return;
      const claims = {};
  
      for (const charity of charities) {
        try {
          let hashes = await streamContract.viewRecipientAllowances(
            charity.address
          );
          hashes = Array.from(hashes); // dedup
          if (hashes.length === 0) continue;
  
          const [avail, dec, , sym, details] =
            await streamContract.getStreamDetails(hashes);
  
          hashes.forEach((_, i) => {
            if (avail[i] === 0n) return; // skip empty
            const tokenAddr = details[i].token.toLowerCase();
            claims[charity.address] ??= {};
            const prev = claims[charity.address][tokenAddr]?.amount ?? 0n;
            claims[charity.address][tokenAddr] = {
              amount: prev + avail[i],
              decimals: dec[i],
              symbol: sym[i] || tokenAddr.slice(0, 6),
            };
          });
        } catch (err) {
          console.error('fetchCharityClaims', charity.name, err);
        }
      }
      setCharityClaims(claims);
    }, [streamContract, charities]);
  
    /* run once & whenever deps change */
    useEffect(() => {
      fetchCharityClaims();       // fire‑and‑forget (not returned)
    }, [fetchCharityClaims]);
  
    /* 30‑second poller */
    useEffect(() => {
      const id = setInterval(fetchCharityClaims, 30_000);
      return () => clearInterval(id);
    }, [fetchCharityClaims]);
  
    /* ------------------------------------------------------------ */
    /*  Claim helper                                                */
    /* ------------------------------------------------------------ */
    const claimForCharity = useCallback(
      async (charityAddr, tokenAddr = null) => {
        try {
          let hashes =
            await streamContract.viewRecipientAllowances(charityAddr);
          hashes = Array.from(hashes); // dedup
          if (!hashes.length) return toast.error('Nothing to claim');
  
          let chosen = hashes;
          if (tokenAddr) {
            const [, , , , details] =
              await streamContract.getStreamDetails(hashes);
            chosen = hashes.filter(
              (_, i) =>
                details[i].token.toLowerCase() === tokenAddr.toLowerCase()
            );
            if (!chosen.length) return toast.error('Nothing to claim');
          }
  
          toast('Claiming…');
          const tx =
            await streamContract.batchStreamAvailableAllowances(chosen);
          await tx.wait();
          toast.success('Claimed!');
          fetchCharityClaims(); // refresh balances
        } catch (err) {
          console.error('claimForCharity', err);
          toast.error('Claim failed');
        }
      },
      [streamContract, fetchCharityClaims]
    );
  
    return { charityClaims, claimForCharity };
  }
  
  // ----------------------------------------------
  // Render
  // ----------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-r from-pink-200 via-orange-200 to-yellow-200 relative overflow-hidden">
      <div className="absolute bg-white bg-opacity-30 backdrop-filter backdrop-blur-md"></div>
      <Toaster />
<title>Charity Subscriptions</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content="Subscribe to a charity and support their cause." />
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">

        {/* Header Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 mb-4 items-center justify-center">
          <div>.</div>
          <div>
            <p className="bg-gradient-to-r from-pink-400 to-yellow-400 text-white text-center py-2 rounded-full w-fit mx-auto px-4 font-semibold">
              Powered by Boop.Finance
            </p>
            <div className="text-center mt-2 flex items-center justify-center gap-2">
              <a href="https://boop.finance" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://boop.finance/logo.png"
                  alt="Boop.Finance Logo"
                  className="w-10 h-10 mx-auto mb-2"
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
                  className="w-8 h-8 mx-auto mb-2"
                />
              </a>
              <a href="https://x.com/0xboop" target="_blank" rel="noopener noreferrer">
                <img
                  src="https://cdn.simpleicons.org/x/db2777"
                  alt="Twitter"
                  className="w-7 h-7 mx-auto mb-2"
                />
              </a>
            </div>
          </div>
          <div className="mx-auto my-0 text-center">
            <ConnectButton />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-4xl md:text-5xl font-extrabold text-center text-pink-500 mb-6 drop-shadow-sm">
          Subscribe to a Charity
        </h1>
        <p className="text-lg text-center text-gray-700 mb-10 max-w-3xl mx-auto">
          Your subscriptions help these organizations continue their important work.
          Pick a token and a plan to show your support! Subscriptions can be one-time
          or recurring, streamed directly from your wallet. You can also <button onClick={() => setShowForm(!showForm)} className="text-pink-500 underline">share your own charity</button>.
        </p>



        {/* Display Charities */}
        <div className="flex flex-wrap gap-8 justify-center">
          {charities.sort((a, b) => {
  const A = a.share ? 1 : 0;
  const B = b.share ? 1 : 0;
  return B - A}).filter(charity=>charity.chain==chainID).map((charity) => {
            // This is the user's plan for this charity
            const planState = charityPlans[charity.address] || {};
            const isCustom = planState.plan === 'custom';

            // whichever token is chosen
            const chosenTokenObj =
              charity.tokens.find((t) => t.address === planState.selectedToken) ||
              charity.tokens[0];

            // subscription info if any
            const subInfoObj = charitySubs[charity.address]?.[chosenTokenObj.address];
console.log('charitySubs',charity.share);
            return (
              <div
                key={charity.address}
                className={`bg-white bg-opacity-90 rounded-3xl shadow-lg flex flex-col overflow-hidden text-center h-fit max-w-sm
                transform transition-all hover:shadow-2xl hover:-translate-y-1 hover:scale-105`}
                style={{ backgroundColor: subInfoObj ? '#d3ffd4' : '' }}
              >
                {charity.image && (
                  <img
                    src={charity.image}
                    alt={charity.name}
                    className="w-full h-40 object-cover rounded-t-3xl border-b border-pink-100"
                  />
                )}
<div className={`absolute top-2 right-2 text-xs font-semibold rounded-full px-2 py-1 border ${charity.share?'text-blue-500 border-blue-500 bg-blue-100':'border-green-500 text-green-500 bg-green-100'}`}>
{charity.share?'Shared':'Verified'}
</div>
                <div className="p-6 flex flex-col flex-grow text-center">
                  <h2 className="text-xl font-bold text-pink-500">{charity.name}</h2>
                  <p className="text-sm text-gray-500 mt-2 font-semibold">{charity.about}</p>
                  {charity.link && (
                    <a
                      href={charity.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-purple-500 underline mt-3"
                    >
                      More info
                    </a>
                  )}

                  {/* If user is subscribed */}
                  {subInfoObj && (
                    <div className="text-center">
                      <p className="text font-semibold bg-green-400 text-white rounded-full px-3 py-1 mt-2 w-3/4 mx-auto">
                        You are subscribed!
                      </p>
                      <p className="text-sm text-green-500 font-semibold px-3 py-1 mt-2 mx-auto">
                        <span className="bg-green-200 rounded-full px-3 py-1">
                          {Number(subInfoObj.amountAllowed)} {chosenTokenObj.token}
                        </span>
                        <span className="bg-green-200 rounded-full ml-4 px-3 py-1">
                          {subInfoObj.details.once
                            ? `${Number(
                                subInfoObj.details.window / 24 / 60 / 60 / 30
                              ).toFixed(0)} month(s)`
                            : 'Recurring'}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Token selection if multiple */}
                  {charity.tokens.length > 0 && (
                    <div className="flex items-center gap-2 mb-2 justify-center">
                      {charity.tokens.map((token) => (
                        <button
                          key={token.address}
                          onClick={() => handleTokenSelect(charity.address, token.address)}
                          className={`px-3 py-1 rounded-full border text-sm transition-colors w-full mt-2
                            ${
                              planState.selectedToken === token.address ||
                              (!planState.selectedToken && token === charity.tokens[0])
                                ? 'bg-pink-500 border-pink-500 text-white'
                                : 'bg-white border-pink-500 text-pink-500'
                            }`}
                        >
                          {token.token}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Choose an amount */}
                  <span className="block text-gray-700 mb-1 text-sm font-medium">
                    Choose an amount:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap mb-3 justify-center">
                    {chosenTokenObj.presetAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => handlePlanChange(charity.address, String(amt))}
                        className={`px-3 py-1 rounded-full border text-sm transition-colors 
                          ${
                            planState.plan === String(amt)
                              ? 'bg-pink-500 border-pink-500 text-white'
                              : 'bg-white border-pink-500 text-pink-500'
                          }`}
                      >
                        {amt}
                      </button>
                    ))}
                    {/* Custom */}
                    <button
                      type="button"
                      onClick={() => handlePlanChange(charity.address, 'custom')}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors 
                        ${
                          isCustom
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : 'bg-white border-pink-500 text-pink-500'
                        }`}
                    >
                      Custom
                    </button>
                  </div>
                  {isCustom && (
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Enter custom amount"
                      value={planState.customValue || ''}
                      onChange={(e) => handleCustomValueChange(charity.address, e.target.value)}
                      className="w-full p-2 border rounded-full mb-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
                    />
                  )}

                  {/* Subscription type */}
                  <label className="block text-gray-700 mb-1 text-sm font-medium">
                    Subscription:
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => handleSubTypeChange(charity.address, 'recurring')}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors 
                        ${
                          planState.subType !== 'once'
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : 'bg-white border-pink-500 text-pink-500'
                        }`}
                    >
                      Recurring
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSubTypeChange(charity.address, 'once');
                        handleSubChange(30);
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors 
                        ${
                          planState.subType === 'once' && sub === 30
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : 'bg-white border-pink-500 text-pink-500'
                        }`}
                    >
                      1 month
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSubTypeChange(charity.address, 'once');
                        handleSubChange(90);
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors 
                        ${
                          planState.subType === 'once' && sub === 90
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : 'bg-white border-pink-500 text-pink-500'
                        }`}
                    >
                      3 months
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleSubTypeChange(charity.address, 'once');
                        handleSubChange(180);
                      }}
                      className={`px-3 py-1 rounded-full border text-sm transition-colors 
                        ${
                          planState.subType === 'once' && sub === 180
                            ? 'bg-pink-500 border-pink-500 text-white'
                            : 'bg-white border-pink-500 text-pink-500'
                        }`}
                    >
                      6 months
                    </button>
                  </div>

                  {/* Subscribe Button */}
                  <button
                    onClick={() => handleSubscribeCharity(charity.address)}
                    className="mt-2 py-2 px-4 bg-pink-500 text-white font-semibold 
                      rounded-full hover:bg-pink-700 transition-colors"
                  >
                    Subscribe
                  </button>

                  {/* Cancel Button if Subscribed */}
                  {subInfoObj && (
                    <button
                      onClick={() => handleCancelSubscription(charity.address)}
                      className="mt-2 py-2 px-4 bg-pink-500 text-white font-semibold 
                        rounded-full hover:bg-pink-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>{/* ─── Claimable balances ─────────────────────────────────────── */}
{charityClaims[charity.address] && pr0 &&(
  <div className="w-full m-4 p-2 bg-white bg-opacity-90 rounded-3xl shadow-lg border border-pink-100 mx-auto max-w-xs">
    <h1 className="text-lg font-bold text-pink-500 mb-2">
      Claimable
    </h1>
    {Object.entries(charityClaims[charity.address]).map(
      ([tAddr, info]) => (
        <div
          key={tAddr}
          className="flex items-center justify-between
                     bg-pink-100 border border-pink-200
                     rounded-full px-4 py-1 shadow-sm mx-auto"
        >
          {/* token & amount */}
          <span className="text-sm font-semibold text-pink-700">
            {info.symbol}&nbsp;•&nbsp;
            {ethers.formatUnits(info.amount, info.decimals)}
          </span>

          {/* claim‑single */}
          <button
            onClick={() => claimForCharity(charity.address, tAddr)}
            className="text-xs font-semibold text-white
                       bg-green-400
                       rounded-full px-3 py-0.5 hover:to-green-700
                       transition-colors"
          >
            Claim
          </button>
        </div>
      )
    )}

    {/* claim‑all */}
    <button
      onClick={() => claimForCharity(charity.address)}
      className="w-full text-sm font-semibold text-white
                 bg-green-400
                 rounded-full py-2 hover:to-green-800 mt-2
                 transition-colors"
    >
      Claim&nbsp;All
    </button>
  </div>
)}

              </div>
            );
          })}
        {/* Create a New Charity Form */}
        {showForm && (
          <div className="max-w-sm mx-auto mb-10 p-6 bg-white bg-opacity-90 rounded-3xl shadow-2xl border border-pink-100 text-pink-500">
            <h2 className="text-2xl font-extrabold mb-4 drop-shadow-sm">Add Charity Info</h2>
            <p className="text-gray-500 mb-6">
              Fill out the details below to add your own charity. Once added, you'll be provided a share link so others can subscribe! You can claim all your subscriptions at <a href="https://boop.finance/?token=" target="_blank" rel="noopener noreferrer" className="text-pink-500 underline">Boop.Finance</a>. Press "`" to see claimable balances and claim from all supporters.
            </p>

            {/* Charity Info Fields */}
            <input
              type="text"
              placeholder="Charity Name"
              value={newCharity.name}
              onChange={(e) =>
                setNewCharity((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full mb-3 p-3 rounded-full border border-pink-200 
                         focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <input
              type="text"
              placeholder="Charity Address (0x...)"
              value={newCharity.address}
              onChange={(e) =>
                setNewCharity((prev) => ({ ...prev, address: e.target.value }))
              }
              className="w-full mb-3 p-3 rounded-full border border-pink-200 
                         focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <textarea
              placeholder="About this Charity"
              value={newCharity.about}
              onChange={(e) =>
                setNewCharity((prev) => ({ ...prev, about: e.target.value }))
              }
              className="w-full mb-3 p-3 rounded-2xl border border-pink-200 
                         focus:outline-none focus:ring-2 focus:ring-pink-300 min-h-[80px]"
            />
            <input
              type="text"
              placeholder="Website Link (https://...)"
              value={newCharity.link}
              onChange={(e) =>
                setNewCharity((prev) => ({ ...prev, link: e.target.value }))
              }
              className="w-full mb-3 p-3 rounded-full border border-pink-200 
                         focus:outline-none focus:ring-2 focus:ring-pink-300"
            />
            <input
              type="text"
              placeholder="Image URL"
              value={newCharity.image}
              onChange={(e) =>
                setNewCharity((prev) => ({ ...prev, image: e.target.value }))
              }
              className="w-full mb-4 p-3 rounded-full border border-pink-200 
                         focus:outline-none focus:ring-2 focus:ring-pink-300"
            />

            {/* Tokens Header + Add Button */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Tokens</h3>
              <button
                onClick={handleAddTokenRow}
                className="px-3 py-1 bg-pink-500 text-white rounded-full text-sm hover:bg-pink-500"
              >
                Add Token
              </button>
            </div>

            {newCharity.tokens.map((tokenObj, index) => (
              <div 
                key={index} 
                className="p-3 mb-4 bg-white rounded-2xl shadow-sm border border-pink-100"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Token Symbol (e.g. USDC)"
                    value={tokenObj.token}
                    onChange={(e) => handleTokenFieldChange(index, 'token', e.target.value)}
                    className="p-3 border border-pink-200 rounded-full 
                               focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                  <input
                    type="text"
                    placeholder="Token Address (0x...)"
                    value={tokenObj.address}
                    onChange={(e) => handleTokenFieldChange(index, 'address', e.target.value)}
                    className="p-3 border border-pink-200 rounded-full 
                               focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-semibold text-pink-500 mb-1">
                    Preset Amounts (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tokenObj.presetAmounts.join(', ')}
                    onChange={(e) => handleTokenFieldChange(index, 'preset', e.target.value)}
                    className="w-full p-3 border border-pink-200 rounded-full 
                               focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>

                {/* Remove token row if more than 1 */}
                {newCharity.tokens.length > 1 && (
                  <button
                    onClick={() => handleRemoveTokenRow(index)}
                    className="mt-3 px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-500 text-sm"
                  >
                    Remove Token
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={handleAddCharity}
              className="block mt-6 mx-auto px-6 py-3 bg-pink-500 text-white font-semibold 
                         rounded-full hover:bg-pink-700 text-base"
            >
              Add Charity
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default Charity;
