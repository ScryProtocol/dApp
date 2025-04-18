import React, { useState, useEffect, useCallback,useRef } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { custom, useAccount, useChainId } from 'wagmi';
import { useEthersProvider, useEthersSigner } from './tl';
import 'tailwindcss/tailwind.css';
import tokens from './tokens.js';
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
  'function viewStreamerAllowances(address streamer) view returns (bytes32[] memory hashes)',
'function getStreamable(bytes32[] calldata hashes) public view returns (bool[] memory canStream,uint[] memory balances, uint[] memory allowances)',
];

const tokenABI = [
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function allowance(address owner, address spender) view returns (uint)',
  'function approve(address spender, uint amount)',
];

// --------------------
// LOCAL STORAGE KEYS
// --------------------
const LOCAL_STORAGE_FRONTS_KEY = 'mySubscriptionFronts_v2';
const LOCAL_STORAGE_BRAND_KEY = 'myCustomBrandSettings_v2'; // bumped version to avoid conflicts

// ----------------------------------------------------------------------------
// Hook: Manage user fronts in local storage
// ----------------------------------------------------------------------------
function useLocalFronts() {
  const [fronts, setFronts] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_FRONTS_KEY);
    console.log('Saved fronts:', saved);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFronts(parsed);
        }
      } catch (err) {
        console.error('Failed to parse saved fronts:', err);
      }
    }
  }, []);

  const saveFronts = useCallback((frontsArray) => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('sub');
    if (!encoded) {
    setFronts(frontsArray);
    localStorage.setItem(LOCAL_STORAGE_FRONTS_KEY, JSON.stringify(frontsArray));
    toast.success('Fronts saved!');
    }
  }, []);

  return { fronts, setFronts: saveFronts };
}

// ----------------------------------------------------------------------------
// Hook: Manage user brand settings in local storage
// ----------------------------------------------------------------------------
function useLocalBrandSettings() {
  // Moved to color-based picks for the background gradient:
  const defaultBrand = {
    brandName: 'My Custom Brand',
    about: '',
    primaryColor: '#EC4899', // pink-600 as default
    gradientColor1: '#fbcfe8', // light pink
    gradientColor2: '#fed7aa', // light orange
    gradientColor3: '#fef08a', // light yellow
  };

  const [brandSettings, setBrandSettings] = useState(defaultBrand);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_BRAND_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // merge or just replace
        setBrandSettings({ ...defaultBrand, ...parsed });
      } catch (err) {
        console.error('Failed to parse brand settings:', err);
      }
    }
  }, []);

  const saveBrandSettings = useCallback((newSettings) => {
    setBrandSettings(newSettings);
    localStorage.setItem(LOCAL_STORAGE_BRAND_KEY, JSON.stringify(newSettings));
  }, []);

  return { brandSettings, setBrandSettings: saveBrandSettings };
}

// ----------------------------------------------------------------------------
// Main Component
// ----------------------------------------------------------------------------
export default function CustomizedSubscriptionFront() {
  const { address: userAddress } = useAccount();
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const chainID = useChainId();

  // 1) All user-created subscription fronts
  const { fronts, setFronts } = useLocalFronts();

  // 2) The contract
  const [streamContract, setStreamContract] = useState(null);

  // 3) Subscription details
  const [frontSubs, setFrontSubs] = useState({});

  // 4) For front owners, track claimable tokens
  const { frontClaims, claimForFront, refreshClaims } = useFrontClaims(streamContract, fronts);

  // 5) UI controls
  const [showClaims, setShowClaims] = useState(false);
  const [showForm, setShowForm] = useState(false);
  // 6) Plan selections
  const [frontPlans, setFrontPlans] = useState({});

  // 7) “Add new front” form data
  const [newFront, setNewFront] = useState({
    name: '',
    address: '',
    about: '',
    link: '',
    image: '',
    tokens: [{ token: 'USDC', address: '', presetAmounts: [5, 10, 20] ,custom:'true'}],
  });

  // 8) Brand: let the user choose
  const { brandSettings, setBrandSettings } = useLocalBrandSettings();

  // Build the background gradient once from the brandSettings color picks
  const pageBackground = `linear-gradient(to right, 
    ${brandSettings.gradientColor1}, 
    ${brandSettings.gradientColor2}, 
    ${brandSettings.gradientColor3}
  )`;

  // ----------------------------------------------
  // On signer load, set up contract
  // ----------------------------------------------
  useEffect(() => {
    if (signer) {
      const sc = new ethers.Contract(streamContractAddress, streamContractABI, signer);
      setStreamContract(sc);
    }
  }, [signer]);

  // ----------------------------------------------
  // On mount, parse ?sub= from URL
  // ----------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('sub');
    if (encoded) {
      try {
        const decoded = JSON.parse(atob(encoded));
        // Avoid duplicates
        const alreadyExists = fronts.some(
          (f) =>
            f.address.toLowerCase() === decoded.address.toLowerCase() ||
            f.name.toLowerCase() === decoded.name.toLowerCase()
        );
        if (!alreadyExists) {
          // Check chain
          if (decoded.chain !== chainID&& decoded.chain) {
            toast.error(`This front is on chain ${decoded.chain}. Switch networks, please!`);
            return;
          }
          decoded.chain = chainID;
          setFronts([...fronts, decoded]);
        }
      } catch (err) {
        console.error('Error parsing ?sub= param:', err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainID]);

  // ----------------------------------------------
  // Whenever we have contract + user + fronts, fetch subscriptions
  // ----------------------------------------------
  useEffect(() => {
    if (streamContract && userAddress && fronts.length) {
      fetchSubscriptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streamContract, userAddress, fronts]);

  // Optionally toggle claims by pressing "`"
  const toggleClaimsByKey = useCallback((e) => {
    if (e.key.toLowerCase() === '`') {
      e.preventDefault();
      setShowClaims((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', toggleClaimsByKey);
    return () => window.removeEventListener('keydown', toggleClaimsByKey);
  }, [toggleClaimsByKey]);

  // ----------------------------------------------
  // Batch fetch subscription details
  // ----------------------------------------------
  async function fetchSubscriptions() {
    if (!streamContract || !userAddress || !fronts.length) return;

    try {
      const tokensArr = [];
      const streamersArr = [];
      const recipientsArr = [];

      fronts.forEach((front) => {
        front.tokens.forEach((token) => {
          tokensArr.push(token.address);
          streamersArr.push(userAddress);
          recipientsArr.push(front.address);
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

      const [ , decimalsArr, , , detailsArr ] = await streamContract.getStreamDetails(hashes);

      const results = {};
      let idx = 0;
      fronts.forEach((front) => {
        results[front.address] = {};
        front.tokens.forEach((token) => {
          const details = detailsArr[idx];
          const decimal = decimalsArr[idx];
          if (details.streamer.toLowerCase() === ethers.ZeroAddress) {
            results[front.address][token.address] = null;
          } else {
            const amountAllowed = Number(ethers.formatUnits(details.allowable, decimal)).toFixed(4);
            results[front.address][token.address] = { details, amountAllowed };
          }
          idx++;
        });
      });
      setFrontSubs(results);
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    }
  }

  // ----------------------------------------------
  // Subscribe user
  // ----------------------------------------------
  async function handleSubscribeFront(frontAddress) {
    if (!userAddress) {
      toast.error('Connect your wallet first!');
      return;
    }
    const planObj = frontPlans[frontAddress] || {};
    let { selectedToken, plan, customValue, subType, onceInterval } = planObj;

    // fallback if no token selected yet
    if (!selectedToken) {
      selectedToken =
        fronts.find((f) => f.address === frontAddress)?.tokens?.[0]?.address;
    }
    if (!plan) {
      toast.error('Please select an amount or custom value.');
      return;
    }

    const numeric = parseFloat(plan === 'custom' && customValue ? customValue : plan);
    if (isNaN(numeric) || numeric <= 0) {
      toast.error('Invalid subscription amount.');
      return;
    }

    try {
      const once = subType === 'once';
      const tokenContract = new ethers.Contract(selectedToken, tokenABI, signer);
      console.log('Token contract:', selectedToken, tokenContract);
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
      const days = once ? (onceInterval || 1) : 1;
      const windowSeconds = days * 24 * 60 * 60*30;

      const tx = await streamContract.allowStream(
        selectedToken,
        frontAddress,
        parsed,
        windowSeconds,
        once
      );
      await tx.wait();

      toast.success('Subscription created!');
      fetchSubscriptions();
    } catch (err) {
      console.error('Subscription failed:', err);
      toast.error('Subscription failed.');
    }
  }

  // ----------------------------------------------
  // Cancel subscription
  // (assumes user subscribed with the front’s first token)
  // ----------------------------------------------
  async function handleCancelSubscription(frontAddress) {
    if (!userAddress) {
      toast.error('Connect your wallet first!');
      return;
    }
    const front = fronts.find((f) => f.address === frontAddress);
    if (!front || !front.tokens?.length) return;
    const firstToken = front.tokens[0];

    try {
      toast('Canceling subscription...');
      const tx = await streamContract.allowStream(firstToken.address, frontAddress, 0, 0, false);
      await tx.wait();

      toast.success('Subscription canceled!');
      fetchSubscriptions();
    } catch (err) {
      console.error('Cancel failed:', err);
      toast.error('Failed to cancel subscription.');
    }
  }

  // ----------------------------------------------
  // “Front claims” logic
  // ----------------------------------------------
  function useFrontClaims(streamContract, fronts) {
    const [frontClaims, setFrontClaims] = useState({});

    const fetchFrontClaims = useCallback(async () => {
      if (!streamContract) return;
      const claims = {};

      for (const front of fronts) {
        try {
          let hashes = await streamContract.viewRecipientAllowances(front.address);
          hashes = Array.from(hashes);
          if (!hashes.length) continue;

          const [avail, dec, , sym, details] = await streamContract.getStreamDetails(hashes);

          hashes.forEach((_, i) => {
            if (avail[i] === 0n) return;
            const tokenAddr = details[i].token.toLowerCase();
            claims[front.address] ??= {};
            const prev = claims[front.address][tokenAddr]?.amount ?? 0n;
            claims[front.address][tokenAddr] = {
              amount: prev + avail[i],
              decimals: dec[i],
              symbol: sym[i] || tokenAddr.slice(0, 6),
            };
          });
        } catch (err) {
          console.error('fetchFrontClaims', front.name, err);
        }
      }
      setFrontClaims(claims);
    }, [streamContract, fronts]);

    useEffect(() => {
      fetchFrontClaims();
    }, [fetchFrontClaims]);

    // poll every 30s
    useEffect(() => {
      const id = setInterval(fetchFrontClaims, 30000);
      return () => clearInterval(id);
    }, [fetchFrontClaims]);

    const claimForFront = useCallback(
      async (frontAddr, tokenAddr = null) => {
        try {
          let hashes = await streamContract.viewRecipientAllowances(frontAddr);
          hashes = Array.from(hashes);
          if (!hashes.length) return toast.error('Nothing to claim');

          let chosen = hashes;
          if (tokenAddr) {
            const [, , , , details] = await streamContract.getStreamDetails(hashes);
            chosen = hashes.filter(
              (_, i) => details[i].token.toLowerCase() === tokenAddr.toLowerCase()
            );
            if (!chosen.length) return toast.error('Nothing to claim');
          }

          toast('Claiming…');
          const tx = await streamContract.batchStreamAvailableAllowances(chosen);
          await tx.wait();
          toast.success('Claimed!');
          fetchFrontClaims();
        } catch (err) {
          console.error('claimForFront', err);
          toast.error('Claim failed');
        }
      },
      [streamContract, fetchFrontClaims]
    );

    return { frontClaims, claimForFront, refreshClaims: fetchFrontClaims };
  }

  // ----------------------------------------------
  // Plan Handling (UI)
  // ----------------------------------------------
  function handlePlanChange(frontAddress, newPlan) {
    setFrontPlans((prev) => ({
      ...prev,
      [frontAddress]: {
        ...prev[frontAddress],
        plan: newPlan,
        customValue: newPlan === 'custom' ? prev[frontAddress]?.customValue || '' : '',
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
        onceInterval: parseInt(val) || 30,
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

  // ----------------------------------------------
  // Adding multiple tokens in the newFront form
  // ----------------------------------------------
  function handleAddTokenRow() {
    setNewFront((prev) => ({
      ...prev,
      tokens: [...prev.tokens, { token: '', address: '', presetAmounts: [5, 10, 20], custom: 'true' }],
    }));
  }

  function handleRemoveTokenRow(index) {
    setNewFront((prev) => {
      const updated = [...prev.tokens];
      updated.splice(index, 1);
      return { ...prev, tokens: updated };
    });
  }

  function handleTokenFieldChange(index, field, value,custom) {
    setNewFront((prev) => {
      const updatedTokens = [...prev.tokens];
      const tokenObj = { ...updatedTokens[index] };

      if (field === 'preset') {
        const splitted = value
          .split(',')
          .map((x) => x.trim())
          .filter(Boolean);
        const asNumbers = splitted.map((n) => parseFloat(n) || 0).filter((n) => n > 0);
        tokenObj.presetAmounts = asNumbers.length ? asNumbers : [5];
        tokenObj.custom = custom;
      } else {
        tokenObj[field] = value;
      }
      updatedTokens[index] = tokenObj;
      return { ...prev, tokens: updatedTokens };
    });
  }

  // ----------------------------------------------
  // Submit new front
  // ----------------------------------------------
  function handleAddFront() {
    if (!newFront.name || !newFront.address) {
      toast.error('Please fill out name & receiving address!');
      return;
    }
    if (!newFront.tokens.length) {
      toast.error('Add at least one token!');
      return;
    }
    for (let i = 0; i < newFront.tokens.length; i++) {
      if (!newFront.tokens[i].address) {
        toast.error('One of the token rows is missing its address');
        return;
      }
    }
    newFront.chain = chainID;
    const updated = [...fronts, newFront];
    setFronts(updated);

    // Build share link
    const encoded = btoa(JSON.stringify(newFront));
    const baseUrl = window.location.origin + window.location.pathname;
    const shareLink = `${baseUrl}?sub=${encoded}`;

    toast.success('New front added! Link copied.');
    navigator.clipboard.writeText(shareLink).catch(() => {});

    // reset form
    setNewFront({
      name: '',
      address: '',
      about: '',
      link: '',
      image: '',
      tokens: [{ token: 'USDC', address: '', presetAmounts: [5, 10, 20], custom: 'true' }],
    });
    setShowForm(false);
  }

  // ----------------------------------------------
  // Delete an existing front from local storage
  // ----------------------------------------------
  function handleDeleteFront(frontAddress) {
    const filtered = fronts.filter(
      (f) => f.address.toLowerCase() !== frontAddress.toLowerCase()
    );
    setFronts(filtered);
    toast.success('Front removed');
  }

  // ----------------------------------------------
  // Quick form for the brand info
  // ----------------------------------------------
  const [showBrandForm, setShowBrandForm] = useState(false);

  function handleBrandChange(e) {
    const { name, value, type, checked } = e.target;
    setBrandSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }

  // A helper to see if we have a sub param in the URL
  const hasSubParam = !!new URLSearchParams(window.location.search).get('sub');

  function Subs() {
    const [allowances, setAllowances] = useState([]);
    const [borrows, setBorrows] = useState([]);
  
    const { address: userAddress } = useAccount();
  
  
    const fetchAllowances = useCallback(async () => {
      if (!streamContract || !userAddress) return;
  
      try {
        let [lenderHashes, friendHashes] = await Promise.all([
          streamContract.viewStreamerAllowances(userAddress),
          streamContract.viewRecipientAllowances(userAddress),
        ]);
        lenderHashes = Array.from(lenderHashes);
        friendHashes = Array.from(friendHashes);
        const lenderDetails = await streamContract.getStreamDetails(lenderHashes);
        const friendDetails = await streamContract.getStreamDetails(friendHashes);
  
        setAllowances(formatDetails(lenderHashes, lenderDetails));
        setBorrows(formatDetails(friendHashes, friendDetails));
        for (let i = 0; i < borrows.length; i++) {
        }
      } catch (error) {
        console.error('Fetching allowances failed:', error);
      }
    }, [streamContract, userAddress]);
  
    useEffect(() => {
      fetchAllowances();
      const interval = setInterval(fetchAllowances, 15000);
      return () => clearInterval(interval);
    }, [fetchAllowances]);
  
    const formatDetails = (hashes, details) =>
      hashes.map((hash, idx) => ({
        hash,
        streamer: details[4][idx].streamer,
        recipient: details[4][idx].recipient,
        token: details[3][idx] || details[4][idx].token,
        totalStreamed: Number(ethers.formatUnits(details[4][idx].totalStreamed, details[1][idx])).toFixed(4),
        outstanding: Number(ethers.formatUnits(details[4][idx].outstanding, details[1][idx])).toFixed(4),
        allowable: Number(ethers.formatUnits(details[4][idx].allowable, details[1][idx])).toFixed(4),
        available: Number(ethers.formatUnits(details[0][idx], details[1][idx])).toFixed(4),
        window: details[4][idx].window,
        timestamp: details[4][idx].timestamp,
        once: details[4][idx].once,
      }));
  // inside Subs, just under const [borrows, setBorrows] = useState([])
  const [streamable, setStreamable] = useState({});
  const [totalClaim, setTotalClaim] = useState({});
  useEffect(() => {
    if (!streamContract || !borrows.length) return;

    (async () => {
      try {
        const hashes = borrows.map(b => b.hash);
        const [canArr] = await streamContract.getStreamable(hashes);

        // Build { hash: boolean } map for quick look‑ups
        const canMap = hashes.reduce((acc, h, idx) => ({ ...acc, [h]: !!canArr[idx] }), {});
        setStreamable(canMap);

        // Aggregate totals per token using the *balances* array
        const totals = {};
        borrows.forEach((b, idx) => {
          if (!canMap[b.hash]) return;                 // skip if not streamable
          const amount = b.available; // use the available amount
          
          totals[b.token] = (totals[b.token] ?? 0) + amount;
        });

        const friendly = Object.fromEntries(
          Object.entries(totals).map(([sym, amt]) => [sym, Number(amt).toFixed(4)])
        );
        setTotalClaim(friendly);
      } catch (err) {
        console.error("streamable compute", err);
        toast.error("Could not compute claimable amounts");
      }
    })();
  }, [streamContract, borrows]);

const handleClaim = async (tokenSymbol) => {
  try {
    if (!streamContract) return;

    const targetHashes = borrows
      .filter(b => streamable[b.hash] && (!tokenSymbol || b.token === tokenSymbol))
      .map(b => b.hash);

    if (!targetHashes.length) {
      return toast('Nothing to claim right now.');
    }

    toast('Claiming…');
    const tx = await streamContract.batchStreamAvailableAllowances(targetHashes);
    await tx.wait();
    toast.success('Claim successful ✨');
  } catch (err) {
    console.error('handleClaim', err);
    toast.error('Claim failed');
  }
};

  const AllowanceCard = ({ title, data,allowances }) => (<div className="p-5 mb-6 max-w-7xl mx-auto bg-white bg-opacity-90 rounded-3xl shadow-lg">
    <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">
      {title}
    </h3>
    {allowances == 1 && (<>
      <h2 className="text-xl text-pink-500 font-bold">Claimable</h2>
<div className="bg-gradient-to-r from-pink-200 to-pink-100 p-2 rounded-full mb-4">
  <div className="flex flex-wrap gap-4 justify-center">
    {/* Claim‑all button */}
    <button
      onClick={() => handleClaim()}
      className="bg-pink-500 text-white font-semibold rounded-full px-4 py-2 transform transition-all duration-300 hover:scale-105"
    >
      Claim All
    </button>

    {/* One button per token */}
    {Object.entries(totalClaim).map(([token, amount], idx) => {
      const bgColor = [
        '#FBBF24', // yellow-300
        '#F472B6', // pink-300
        '#60A5FA', // blue-300
        '#A78BFA', // purple-300
        '#34D399', // green-300
      ];
      return (
        <button
          key={token}
          onClick={() => handleClaim(token)}
          className={`flex items-center justify-center text-white font-semibold rounded-full p-2 transform transition-all duration-300 hover:scale-105`}
          style={{
            backgroundColor: bgColor[idx % bgColor.length],
          }}
        >
          <span className="font-bold">
            {amount} {token.slice(0, 12)}
          </span>
        </button>
      );
    })}
  </div>
</div></>
    )}
    {data.length ? (
      <div className="gap-6 justify-center">
        {data.map((item) => (
          <div
            key={item.hash}
            className="relative bg-green-100 bg-opacity-90 rounded-3xl border border-green-200 flex w-full justify-between p-2 mb-4"
          >
            {/* Top Badge */}
            <div className="bg-green-400 text-white font-semibold rounded-full px-3 py-1">
            {allowances==0?item.recipient.slice(0, 10):item.streamer.slice(0, 10)}...{allowances==0?item.recipient.slice(-10):item.streamer.slice(-10)}
            </div>
  
              <p className="text-gray-500 mb-0 font-semibold text-md mt-1">
                Subscribed for{' '}
                <span className="font-semibold text-blue-500">
                  {item.allowable} {item.token} 
                <span className="font-bold text-purple-500 rounded-full p-2">
                  {item.once
                    ? `One‑time for ${Number(item.window) / (60 * 60 * 24)}d`
                    : `Every ${Number(item.window) / (60 * 60 * 24)}d`}
                </span>
                </span>
              </p>
            {/* Main Content */}
              <h2
                className="text-sm font-bold bg-purple-100 text-purple-500 rounded-full px-2 py-1"
              > {item.available} Owed
              </h2>
  
                <span className="text-sm font-bold bg-pink-100 text-pink-500 rounded-full px-2 py-1">
                  {item.totalStreamed} Streamed
                </span>{allowances == 1 && (
                <button
                  onClick={() => claimForFront(item.recipient, item.token)}
                  className="py-1 px-2 rounded-full font-semibold text-white bg-pink-300 hover:bg-pink-600 transition-colors"
                >
                  Claim
                </button>)}
                {allowances == 0 && (
                <button
                  onClick={() => handleCancelSubscription(item.recipient)}
                  className="py-1 px-2 rounded-full font-semibold text-white bg-red-300 hover:bg-red-600 transition-colors"
                >
                  Cancel
                </button>)}
          </div>
        ))}
      </div>
    ) : (
      <p className="text-gray-500 text-center py-6">Nothing here yet!</p>
    )}
  </div>
  
  );

  return (
    <div className="max-w-7xl mx-auto my-10">
      <div className="gap-6 text-center">
        <AllowanceCard title="💸 My Subs" data={allowances} allowances={0} />
        <AllowanceCard title="🤝 Subs To Me" data={borrows} allowances={1}/>
      </div>
    </div>
  );
}    // ----------------------------------------------
  // Render
  // ----------------------------------------------
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: pageBackground,
      }}
    >
      {/* Slight overlay for blur effect */}
      <div className="absolute inset-0 backdrop-filter backdrop-blur-md"></div>

      <Toaster />

      <title>{brandSettings.brandName || 'My Custom Subscriptions'}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta
        name="description"
        content="A custom subscription page for your supporters with user-chosen branding."
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
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

        {/* Title & disclaimers */}
        <h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-4 drop-shadow-sm"
          style={{ color: brandSettings.primaryColor }}
        >
          {brandSettings.brandName}
        </h1>
        <p className="text-base md:text-lg text-center text-gray-700 mb-6 max-w-4xl mx-auto">
          {brandSettings.about ||
            'Let fans or supporters subscribe on-chain. Recurring or one-shot—choose intervals, tokens, and more. Funds stream directly to the address(es) you specify. Press "`" to see claimable balances if you’re the front owner.'}
          <br />
          {!hasSubParam && (
            <>
              <button
                onClick={() => setShowForm((prev) => !prev)}
                className="bg-pink-500 text-white font-semibold rounded-full px-4 py-2 mt-4 hover:bg-blue-700 transition-colors"
              >
                Add new sub
              </button>
              <button
                onClick={() => setShowBrandForm((prev) => !prev)}
                className="bg-blue-500 text-white font-semibold rounded-full px-4 py-2 mt-4 ml-2 hover:bg-blue-700 transition-colors"
              >
                Brand settings
              </button>
              <button
                onClick={() => {
                  const encoded = btoa(JSON.stringify(newFront));
                  const baseUrl = window.location.origin + window.location.pathname;
                  const shareLink = `${baseUrl}?sub=${encoded}`;
                  navigator.clipboard.writeText(shareLink).catch(() => {});
                  toast.success('Link copied to clipboard!');
                }}
                className="bg-green-500 text-white font-semibold rounded-full px-4 py-2 mt-4 ml-2 hover:bg-blue-700 transition-colors"
              >
                Share link
              </button>
            </>
          )}
        </p>

        {showBrandForm && (
          <div className="bg-white p-4 mt-3 rounded-3xl max-w-xl text-pink-600 mx-auto mb-4 text-center">
            <h2
              className="text-2xl font-extrabold mb-4"
              style={{ color: brandSettings.primaryColor }}
            >
              Brand Settings
            </h2>
            <div className="grid gap-3 mb-4">
              <input
                type="text"
                name="brandName"
                placeholder="Brand Name"
                value={brandSettings.brandName}
                onChange={handleBrandChange}
                className="p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                name="about"
                placeholder="About my subscription page"
                value={brandSettings.about}
                onChange={handleBrandChange}
                className="p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <label className="text-sm text-pink-500 font-medium mb-1">Gradient Colors:</label>
              {/* Three color picks for the gradient */}
              <div className="flex justify-center gap-4">
                <input
                  type="color"
                  name="gradientColor1"
                  value={brandSettings.gradientColor1}
                  onChange={handleBrandChange}
                  className="w-12 h-12 cursor-pointer rounded-full"
                />
                <input
                  type="color"
                  name="gradientColor2"
                  value={brandSettings.gradientColor2}
                  onChange={handleBrandChange}
                  className="w-12 h-12 cursor-pointer rounded-full"
                />
                <input
                  type="color"
                  name="gradientColor3"
                  value={brandSettings.gradientColor3}
                  onChange={handleBrandChange}
                  className="w-12 h-12 cursor-pointer rounded-full"
                />
              </div>
              <label className="text-sm text-pink-500 font-medium mt-4">Primary Color:</label>
              <input
                type="color"
                name="primaryColor"
                defaultValue={brandSettings.primaryColor}
                value={brandSettings.primaryColor}
                onChange={handleBrandChange}
                className="w-12 h-12 cursor-pointer mx-auto"
              />
            </div>
            <button
              onClick={() => {
                setBrandSettings(brandSettings);
                toast.success('Brand settings saved!');
              }}
              className="bg-blue-500 text-white font-semibold rounded-full px-4 py-2 mt-4 hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        )}

        {/* Subscription Fronts */}
        <div className="flex flex-wrap gap-8 justify-center">
          {fronts
            .filter((front) => front.chain === chainID)
            .map((front) => {
              const planState = frontPlans[front.address] || {};
              const isCustom = planState.plan === 'custom';
              const chosenTokenObj =
                front.tokens.find((t) => t.address === planState.selectedToken) ||
                front.tokens[0];
              const subInfoObj = frontSubs[front.address]?.[chosenTokenObj.address];

              return (
                <div
                  key={front.address}
                  className="relative bg-white bg-opacity-90 rounded-3xl shadow-lg flex flex-col 
                             overflow-hidden text-center h-fit max-w-sm w-full sm:w-96
                             transform transition-all hover:shadow-2xl hover:-translate-y-1"
                             style={{backgroundColor: subInfoObj ? '#ccffcc' : 'white'}}
                >
                  {subInfoObj && (
                    <div className="justify-center flex items-center">
                    <div className="absolute top-2 bg-green-400 text-white font-semibold rounded-full px-3 py-1 mx-auto">
                      Subscribed for {Number(subInfoObj.amountAllowed)} {chosenTokenObj.token} {subInfoObj.details.once && 'for ' + Number(subInfoObj.details.window)/60/60/30 + ' months'}
                    </div>
                    </div>
                  )}
                  
                  {front.image && (
                    <img
                      src={front.image}
                      alt={front.name}
                      className="w-full h-40 object-cover rounded-t-3xl border-b border-gray-200"
                    />
                  )}
{!hasSubParam && (
                    <div className="p-3 border-t border-gray-200 text-center">
                      <button
                        onClick={() => handleDeleteFront(front.address)}
                        className="bg-red-300 text-white font-semibold rounded-full px-2 py-2 hover:bg-red-600 transition-colors absolute top-3 right-3"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                  <div className="p-2 flex flex-col flex-grow">
                    <h2
                      className="text-xl font-extrabold mb-1"
                      style={{ color: brandSettings.primaryColor }}
                    >
                      {front.name}
                    </h2>
                    <p className="text-sm text-gray-700 font-medium">{front.about}</p>
                    {front.link && (
                      <a
                        href={front.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline mt-2 block"
                        style={{ color: brandSettings.primaryColor }}
                      >
                        More info
                      </a>
                    )}

                    {/* Token selection */}
                    <div className="flex items-center gap-2 mb-2 justify-center mt-4">
                      {front.tokens.map((token, i) => (
                        <button
                          key={token.address + i}
                          onClick={() => handleTokenSelect(front.address, token.address)}
                          className={`px-3 py-1 rounded-full border text-sm transition-colors`}
                          style={
                            planState.selectedToken === token.address ||
                            (!planState.selectedToken && i === 0)
                              ? {
                                  backgroundColor: brandSettings.primaryColor,
                                  borderColor: brandSettings.primaryColor,
                                  color: 'white',
                                }
                              : { borderColor: brandSettings.primaryColor,
                                  color: brandSettings.primaryColor,
                                  backgroundColor: 'white' }
                          }
                        >
                          {token.token}
                        </button>
                      ))}
                    </div>

                    {/* Amount selection */}
                    <span className="block text-gray-700 mb-1 text-sm font-medium">
                      Pick Amount:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap justify-center mb-3">
                      {chosenTokenObj.presetAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handlePlanChange(front.address, String(amt))}
                          className="px-3 py-1 rounded-full border text-sm transition-colors bg-white"
                          style={
                            planState.plan === String(amt)
                              ? {
                                  backgroundColor: brandSettings.primaryColor,
                                  borderColor: brandSettings.primaryColor,
                                  color: 'white',
                                }
                              : {
                                  borderColor: brandSettings.primaryColor,
                                  color: brandSettings.primaryColor,
                                }
                          }
                        >
                          {amt}
                        </button>
                      ))}
                      {/* Custom */}{chosenTokenObj.custom && (
                      <button
                        type="button"
                        onClick={() => handlePlanChange(front.address, 'custom')}
                        className="px-3 py-1 rounded-full border text-sm transition-colors bg-white"
                        style={
                          isCustom
                            ? {
                                backgroundColor: brandSettings.primaryColor,
                                borderColor: brandSettings.primaryColor,
                                color: 'white',
                              }
                            : {
                                borderColor: brandSettings.primaryColor,
                                color: brandSettings.primaryColor,
                              }
                        }
                      >
                        Custom
                      </button>)}
                    </div>
                    {isCustom && (
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Your custom amount"
                        value={planState.customValue || ''}
                        onChange={(e) => handleCustomValueChange(front.address, e.target.value)}
                        className="w-full p-2 border rounded-full mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    )}

                    {/* Subscription type */}
                    <div className="mb-3">
                      <span className="block text-gray-700 mb-1 text-sm font-medium">
                        Subscription:
                      </span>
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSubTypeChange(front.address, 'recurring')}
                          className="px-3 py-1 rounded-full border text-sm transition-colors bg-white"
                          style={
                            planState.subType !== 'once'
                              ? {
                                  backgroundColor: brandSettings.primaryColor,
                                  borderColor: brandSettings.primaryColor,
                                  color: 'white',
                                }
                              : {
                                  borderColor: brandSettings.primaryColor,
                                  color: brandSettings.primaryColor,
                                }
                          }
                        >
                          Recurring
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSubTypeChange(front.address, 'once')}
                          className="px-3 py-1 rounded-full border text-sm transition-colors bg-white"
                          style={
                            planState.subType === 'once'
                              ? {
                                  backgroundColor: brandSettings.primaryColor,
                                  color: 'white',
                                }
                              : {
                                  borderColor: brandSettings.primaryColor,
                                  color: brandSettings.primaryColor,
                                }
                          }
                        >
                          Once
                        </button>
                      </div>
                    </div>
                    {planState.subType === 'once' && (
                      <div className="flex flex-col items-center mb-3">
                        <label className="text-sm text-gray-700 font-medium mb-1">
                          Interval (months):
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="24"
                          value={planState.onceInterval || 1}
                          onChange={(e) => handleOnceIntervalChange(front.address, e.target.value)}
                          className="w-full"
                        />
                        <div className="text-xs text-gray-600">
                          {planState.onceInterval || 1} months
                        </div>
                      </div>
                    )}

                    {/* Subscribe/Cancel */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-2 mb-2 mx-2">
                      <button
                        onClick={() => handleSubscribeFront(front.address)}
                        className="py-2 px-4 text-white font-semibold rounded-full hover:brightness-110 transition-colors w-full"
                        style={{ backgroundColor: brandSettings.primaryColor }}
                      >
                        Subscribe
                      </button>
                      {subInfoObj && (
                        <button
                          onClick={() => handleCancelSubscription(front.address)}
                          className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Claims (if showClaims) */}
                  {showClaims && frontClaims[front.address] && (
                    <div className="w-full mx-auto m-4 mb-6 p-3 bg-white bg-opacity-80 rounded-3xl shadow-lg border border-gray-200 max-w-xs">
                      <h3
                        className="text-base font-bold mb-2"
                        style={{ color: brandSettings.primaryColor }}
                      >
                        Claimable
                      </h3>
                      {Object.entries(frontClaims[front.address]).map(([tAddr, info]) => (
                        <div
                          key={tAddr}
                          className="flex items-center justify-between
                                     bg-gray-100 border border-gray-200
                                     rounded-full px-4 py-1 shadow-sm mx-auto mb-1"
                        >
                          <span className="text-sm font-semibold text-gray-700">
                            {info.symbol} • {ethers.formatUnits(info.amount, info.decimals)}
                          </span>
                          <button
                            onClick={() => claimForFront(front.address, tAddr)}
                            className="text-xs font-semibold text-white bg-green-400 rounded-full px-3 py-0.5 hover:bg-green-600 transition-colors"
                          >
                            Claim
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => claimForFront(front.address)}
                        className="block w-full text-sm font-semibold text-white bg-green-400 rounded-full py-2 hover:bg-green-600 transition-colors mt-2"
                      >
                        Claim All
                      </button>
                    </div>
                  )}

                  {/* Delete button if no ?sub param */}
                </div>
              );
            })}
        </div>

        {/* “Add new front” form */}
        {showForm && (
          <div className="max-w-xl mx-auto mb-10 p-6 bg-white bg-opacity-90 rounded-3xl shadow-2xl border border-gray-200 text-gray-700 mt-10">
            <h2
              className="text-2xl font-extrabold mb-4 drop-shadow-sm"
              style={{ color: brandSettings.primaryColor }}
            >
              Create Your Own Subscription Front
            </h2>
            <p className="mb-4 text-sm">
              Let supporters subscribe directly to your address. Once saved, you get a share link.
            </p>

            <div className="grid gap-3 mb-4">
              <input
                type="text"
                placeholder="Front Name"
                value={newFront.name}
                onChange={(e) => setNewFront((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 rounded-full border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                placeholder="Receiving Address (0x...)"
                value={newFront.address}
                onChange={(e) => setNewFront((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full p-3 rounded-full border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <textarea
                placeholder="Describe your front / project"
                value={newFront.about}
                onChange={(e) => setNewFront((prev) => ({ ...prev, about: e.target.value }))}
                className="w-full p-3 rounded-2xl border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-300 min-h-[80px]"
              />
              <input
                type="text"
                placeholder="Website Link (optional)"
                value={newFront.link}
                onChange={(e) => setNewFront((prev) => ({ ...prev, link: e.target.value }))}
                className="w-full p-3 rounded-full border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <input
                type="text"
                placeholder="Image URL (optional)"
                value={newFront.image}
                onChange={(e) => setNewFront((prev) => ({ ...prev, image: e.target.value }))}
                className="w-full p-3 rounded-full border border-gray-300 
                           focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>

            {/* Tokens header */}
            <div className="flex items-center justify-between mb-2">
              <h3
                className="text-xl font-semibold"
                style={{ color: brandSettings.primaryColor }}
              >
                Tokens
              </h3>
              <button
                onClick={handleAddTokenRow}
                className="px-3 py-1 text-white rounded-full text-sm hover:bg-pink-600"
                style={{ backgroundColor: brandSettings.primaryColor }}
              >
                Add Token
              </button>
            </div>

            {newFront.tokens.map((tokenObj, index) => (
              <div
                key={index}
                className="p-3 mb-4 bg-white rounded-2xl shadow-sm border border-gray-200"
              >
                <div className="grid gap-3">
                  <select
                    value={tokenObj.address}
                    onChange={(e) => {handleTokenFieldChange(index, 'address', e.target.value);
                      handleTokenFieldChange(index, 'token', e.target.options[e.target.selectedIndex].text);
                    }}
                    className="p-3 border border-gray-300 rounded-full 
                               focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select Token</option>
                    {tokens[chainID].map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                  {!tokenObj.address && (<>
                  <input
                    type="text"
                    placeholder="Token Symbol (e.g. USDC)"
                    onChange={(e) => handleTokenFieldChange(index, 'token', e.target.value)}
                    className="p-3 border border-gray-300 rounded-full 
                               focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <input
                    type="text"
                    placeholder="Token Address (0x...)"
                    value={tokenObj.address}
                    onChange={(e) => handleTokenFieldChange(index, 'address', e.target.value)}
                    className="p-3 border border-gray-300 rounded-full 
                               focus:outline-none focus:ring-2 focus:ring-blue-300"
                  /></>)}
                </div>
                <div className="mt-3">
                  <label
                    className="block text-sm font-semibold mb-1"
                    style={{ color: brandSettings.primaryColor }}
                  >
                    Preset Amounts (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tokenObj.presetAmounts.join(', ')}
                    onChange={(e) => handleTokenFieldChange(index, 'preset', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-full 
                               focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <label className="text-sm font-semibold mb-1 mt-3 text-pink-500">
                    Allow Custom Amount
                    </label>
                    <div>
                  <button
                    onClick={() => handleTokenFieldChange(index, 'custom', tokenObj.custom === 'true' ? 'false' : 'true')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${tokenObj.custom === 'true' ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-700'}`}
                    style={{ backgroundColor: tokenObj.custom === 'true' ? brandSettings.primaryColor : 'lightgray' }}
                  >
                    {tokenObj.custom === 'true' ? 'Enabled' : 'Disabled'}
                  </button>
                  </div>
                </div>
                {newFront.tokens.length > 1 && (
                  <button
                    onClick={() => handleRemoveTokenRow(index)}
                    className="mt-3 px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={handleAddFront}
              className="block mt-4 mx-auto px-6 py-3 text-white font-semibold 
                         rounded-full hover:brightness-110 text-base"
              style={{ backgroundColor: brandSettings.primaryColor }}
            >
              Save Front
            </button>
          </div>
        )}      {!hasSubParam&&<Subs/>}

      </div>
    </div>
  );
}
