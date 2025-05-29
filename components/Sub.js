import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useChainId } from 'wagmi';
import { useEthersProvider, useEthersSigner } from './tl'; // replace with your hooks
import 'tailwindcss/tailwind.css';
import tokens from './tokens.js';

// --------------------
// Contract Info
// --------------------
const streamContractAddress = '0x2726ef320b8ba1dd043dbacfe5beb088806ef478';
const streamContractABI = [
  'function streamDetails(bytes32) view returns (address streamer, address recipient, address token, uint256 totalStreamed, uint256 outstanding, uint256 allowable, uint256 window, uint256 timestamp, bool once)',
  'function allowStream(address token, address recipient, uint256 amount, uint256 window, bool once)',
  // ... any other calls you need ...
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

// --------------------
// Local Storage Keys
// --------------------
const LOCAL_FRONTS_KEY = 'mySubscriptionFronts_v2';
const LOCAL_BRAND_KEY = 'myCustomBrandSettings_v2';

export default function FullDapp() {
  // --------------------------------------------------------------------------
  // 1) If ?sub= present, parse brand + fronts. Otherwise load from local.
  // --------------------------------------------------------------------------
  const chainID = useChainId();
  const { address: userAddress } = useAccount();

  const [paramData, setParamData] = useState(null); // brand + fronts from the URL param
  const [fronts, setFronts] = useState([]);         // array of subscription fronts
  const [brandSettings, setBrandSettings] = useState({
    brandName: 'My Custom Brand',
    about: '',
    primaryColor: '#EC4899',
    gradientColor1: '#fbcfe8',
    gradientColor2: '#fed7aa',
    gradientColor3: '#fef08a',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('sub');
    if (encoded) {
      // We have a ?sub= param => parse it
      try {
        const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
        setParamData(decoded);

        // If they included brand in the param, apply it
        if (decoded.brand) {
          setBrandSettings(decoded.brand);
        }
        // If they included an array of fronts, apply it
        if (Array.isArray(decoded.fronts)) {
          // ensure chain matches or fallback
          const mapped = decoded.fronts.map((f) => ({
            ...f,
            chain: f.chain || chainID,
          }));
          setFronts(mapped);
        } else if (decoded.singleFront) {
          // or just a single front
          decoded.singleFront.chain = decoded.singleFront.chain || chainID;
          setFronts([decoded.singleFront]);
        }
      } catch (err) {
        console.error('Invalid ?sub= data', err);
        toast.error('Invalid shared link');
      }
    } else {
      // No param => load from local
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

  // Do we have param data or not?
  const hasParam = !!paramData;

  // Save fronts to local storage (only if no param)
  const saveLocalFronts = useCallback((frontsArr) => {
    if (hasParam) return;
    setFronts(frontsArr);
    localStorage.setItem(LOCAL_FRONTS_KEY, JSON.stringify(frontsArr));
    toast.success('Fronts saved locally!');
  }, [hasParam]);

  // Save brand to local storage (only if no param)
  const saveLocalBrand = useCallback((brandObj) => {
    if (hasParam) return;
    setBrandSettings(brandObj);
    localStorage.setItem(LOCAL_BRAND_KEY, JSON.stringify(brandObj));
    toast.success('Brand settings saved locally!');
  }, [hasParam]);

  // --------------------------------------------------------------------------
  // 2) “Copy Link” – brand + all local fronts => single param link
  // --------------------------------------------------------------------------
  function handleCopyLink() {
    // You can decide how many fronts to share. 
    // If you have multiple local fronts, you might share them all:
    const dataToShare = {
      brand: brandSettings,
      fronts,
      // or if you prefer only the first front => singleFront: fronts[0]
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(dataToShare))));
    const url = `${window.location.origin}${window.location.pathname}?sub=${encoded}`;
    navigator.clipboard.writeText(url).then(() => {
      toast.success('Link copied!');
    });
  }

  // --------------------------------------------------------------------------
  // 3) Brand form
  // --------------------------------------------------------------------------
  const [showBrandForm, setShowBrandForm] = useState(false);

  function handleBrandChange(e) {
    const { name, value } = e.target;
    setBrandSettings((prev) => ({ ...prev, [name]: value }));
  }

  function handleSaveBrand() {
    saveLocalBrand(brandSettings);
  }

  const pageBackground = `linear-gradient(to right, 
    ${brandSettings.gradientColor1}, 
    ${brandSettings.gradientColor2}, 
    ${brandSettings.gradientColor3}
  )`;

  // --------------------------------------------------------------------------
  // 4) The contract + subscription logic
  // --------------------------------------------------------------------------
  const signer = useEthersSigner();
  const provider = useEthersProvider();
  const [streamContract, setStreamContract] = useState(null);

  useEffect(() => {
    if (signer) {
      const sc = new ethers.Contract(streamContractAddress, streamContractABI, signer);
      setStreamContract(sc);
    }
  }, [signer]);

  // Subscription details (fetched once we have user + contract)
  const [frontSubs, setFrontSubs] = useState({});

  useEffect(() => {
    if (!streamContract || !userAddress || !fronts.length) return;
    // fetch subscription details
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

        // Build the keccak list
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

  // Plan selection
  const [frontPlans, setFrontPlans] = useState({});

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
      // fallback to first token
      selectedToken = front.tokens[0]?.address;
    }
    if (!plan) return toast.error('Pick an amount or custom value');

    let numeric = parseFloat(plan === 'custom' ? customValue : plan);
    numeric = subType === 'once'? numeric * (onceInterval || 1) : numeric;
    if (isNaN(numeric) || numeric <= 0) {
      return toast.error('Invalid subscription amount');
    }

    try {
      const once = subType === 'once';
      const tokenContract = new ethers.Contract(selectedToken, tokenABI, signer);
      const decimals = await tokenContract.decimals();
      const parsed = ethers.parseUnits(String(numeric), decimals);

      // Check user balance
      const userBal = await tokenContract.balanceOf(userAddress);
      if (userBal < parsed) {
        return toast.error('Insufficient balance');
      }

      // Approve if needed
      const allowance = await tokenContract.allowance(userAddress, streamContractAddress);
      if (allowance < parsed) {
        toast('Approving token...');
        const txA = await tokenContract.approve(streamContractAddress, ethers.MaxUint256);
        await txA.wait();
      }

      toast('Creating subscription...');
      // If once => user picks onceInterval months, else 1 month
      const months = once ? (onceInterval || 1) : 1;
      const windowSeconds = months * 24 * 60 * 60 * 30;

      const tx = await streamContract.allowStream(selectedToken, frontAddress, parsed, windowSeconds, once);
      await tx.wait();

      toast.success('Subscription created!');
      // Optionally re-fetch subscription details
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

  // --------------------------------------------------------------------------
  // 5) “Front claims” for owners
  // --------------------------------------------------------------------------
  const [frontClaims, setFrontClaims] = useState({});
  const [showClaims, setShowClaims] = useState(false);

  // Toggle claims with backtick
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

  // --------------------------------------------------------------------------
  // 6) “Add new front” form (only if no param)
  // --------------------------------------------------------------------------
  const [showForm, setShowForm] = useState(false);
  const [newFront, setNewFront] = useState({
    name: '',
    address: '',
    about: '',
    link: '',
    image: '',
    tokens: [{ token: 'USDC', address: '', presetAmounts: [5, 10, 20], custom: 'true' }],
    chain: chainID,
  });

  function handleAddTokenRow() {
    setNewFront((prev) => ({
      ...prev,
      tokens: [...prev.tokens, { token: '', address: '', presetAmounts: [5, 10, 20], custom: 'true' }],
    }));
  }
  function handleRemoveTokenRow(i) {
    setNewFront((prev) => {
      const arr = [...prev.tokens];
      arr.splice(i, 1);
      return { ...prev, tokens: arr };
    });
  }
  function handleTokenFieldChange(idx, field, value, custom = 'true') {
    setNewFront((prev) => {
      const tokensArr = [...prev.tokens];
      const obj = { ...tokensArr[idx] };
      if (field === 'preset') {
        const splitted = value.split(',').map((x) => x.trim()).filter(Boolean);
        const asNums = splitted.map((n) => parseFloat(n) || 0).filter((n) => n > 0);
        obj.presetAmounts = asNums.length ? asNums : [5];
        obj.custom = custom;
      } else if (field === 'custom') {
        obj.custom = value;
      } else {
        obj[field] = value;
      }
      tokensArr[idx] = obj;
      return { ...prev, tokens: tokensArr };
    });
  }

  function handleAddFront() {
    if (hasParam) {
      return toast.error('You are in param mode; cannot add local fronts here.');
    }
    if (!newFront.name || !newFront.address) {
      return toast.error('Please fill out name + receiving address');
    }
    // Basic validation
    for (const tk of newFront.tokens) {
      if (!tk.address) {
        return toast.error('One of the tokens is missing its address');
      }
    }
    const toSave = { ...newFront, chain: chainID };
    const updated = [...fronts, toSave];
    saveLocalFronts(updated);

    // Optionally copy link automatically or not
    // For demonstration, we won't do it automatically here
    toast.success('Front added to local. You can share link if you like!');

    // reset
    setNewFront({
      name: '',
      address: '',
      about: '',
      link: '',
      image: '',
      tokens: [{ token: 'USDC', address: '', presetAmounts: [5, 10, 20], custom: 'true' }],
      chain: chainID,
    });
    setShowForm(false);
  }

  function handleDeleteFront(frontAddress) {
    if (hasParam) {
      return toast.error('Param mode; cannot delete local fronts here.');
    }
    const filtered = fronts.filter((f) => f.address.toLowerCase() !== frontAddress.toLowerCase());
    saveLocalFronts(filtered);
  }

  // --------------------------------------------------------------------------
  // 7) (Optional) “My Subs” view for the user
  // --------------------------------------------------------------------------
  function Subs() {
    const [allowances, setAllowances] = useState([]);
    const [borrows, setBorrows] = useState([]);
    const [streamable, setStreamable] = useState({});
    const [totalClaim, setTotalClaim] = useState({});

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
      } catch (err) {
        console.error('fetchAllowances fail:', err);
      }
    }, [streamContract, userAddress]);

    function formatDetails(hashes, details) {
      return hashes.map((hash, idx) => ({
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
    }

    useEffect(() => {
      fetchAllowances();
      const interval = setInterval(fetchAllowances, 15000);
      return () => clearInterval(interval);
    }, [fetchAllowances]);

    // compute streamable
    useEffect(() => {
      if (!streamContract || !borrows.length) return;
      (async () => {
        try {
          const hashes = borrows.map((b) => b.hash);
          const [canArr] = await streamContract.getStreamable(hashes);

          const canMap = hashes.reduce((acc, h, i) => ({ ...acc, [h]: !!canArr[i] }), {});
          setStreamable(canMap);

          // sum up by token
          const totals = {};
          borrows.forEach((b, i) => {
            if (!canMap[b.hash]) return;
            const amt = parseFloat(b.available) || 0;
            totals[b.token] = (totals[b.token] ?? 0) + amt;
          });
          const friendly = Object.fromEntries(
            Object.entries(totals).map(([sym, val]) => [sym, val.toFixed(4)])
          );
          setTotalClaim(friendly);
        } catch (err) {
          console.error('streamable compute fail:', err);
        }
      })();
    }, [streamContract, borrows]);

    async function handleClaim(tokenSymbol) {
      if (!streamContract) return;
      try {
        const targetHashes = borrows
          .filter((b) => streamable[b.hash] && (!tokenSymbol || b.token === tokenSymbol))
          .map((b) => b.hash);
        if (!targetHashes.length) return toast('No claimable right now');
        toast('Claiming…');
        const tx = await streamContract.batchStreamAvailableAllowances(targetHashes);
        await tx.wait();
        toast.success('Claim success');
        fetchAllowances();
      } catch (err) {
        console.error('Claim fail', err);
        toast.error('Claim fail');
      }
    }

    const AllowanceCard = ({ title, data, isBorrow }) => (
      <div className="p-5 mb-6 max-w-7xl mx-auto bg-white bg-opacity-90 rounded-3xl shadow-lg">
        <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-pink-500 to-yellow-400 bg-clip-text text-transparent">
          {title}
        </h3>
        {/* If isBorrow => show claimable */}
        {isBorrow && (
          <>
            <h2 className="text-xl text-pink-500 font-bold">Claimable</h2>
            <div className="bg-gradient-to-r from-pink-200 to-pink-100 p-2 rounded-3xl mb-4">
              <div className="flex flex-wrap gap-4 justify-center flex-col md:flex-row">
                {/* Claim all */}
                <button
                  onClick={() => handleClaim()}
                  className="bg-pink-500 text-white font-semibold rounded-full px-4 py-2 transform transition-all duration-300 hover:scale-105"
                >
                  Claim All
                </button>
                {/* One per token */}
                {Object.entries(totalClaim).map(([sym, amt], idx) => {
                  const bgColors = [
                    '#FBBF24', // yellow
                    '#F472B6', // pink
                    '#60A5FA', // blue
                    '#A78BFA', // purple
                    '#34D399', // green
                  ];
                  return (
                    <button
                      key={sym}
                      onClick={() => handleClaim(sym)}
                      className="flex items-center justify-center text-white font-semibold rounded-full p-2 transform transition-all duration-300 hover:scale-105"
                      style={{ backgroundColor: bgColors[idx % bgColors.length] }}
                    >
                      <span className="font-bold">
                        {amt} {sym}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {data.length ? (
          <div className="gap-6 justify-center">
            {data.map((item) => (
              <div
                key={item.hash}
                className={`relative ${streamable[item.hash] ?'bg-green-100 border-green-200': 'bg-orange-100 border-orange-200 '} bg-opacity-90 rounded-3xl border w-full justify-between p-2 gap-2 mb-4 grid lg:flex`}
              >
                {/* label */}
                <div className="bg-green-400 text-white font-semibold rounded-full px-3 py-1">
                  {isBorrow
                    ? `${item.streamer.slice(0, 10)}...${item.streamer.slice(-10)}`
                    : `${item.recipient.slice(0, 10)}...${item.recipient.slice(-10)}`}
                </div>

                <p className="text-gray-500 mb-0 font-semibold text-md mt-1">
                  Subscribed for{' '}
                  <span className="font-semibold text-blue-500">
                    {item.allowable} {item.token}
                    <span className="font-bold text-purple-500 rounded-full p-2">
                      {item.once
                        ? `One-time for ${Number(item.window) / (60 * 60 * 24)}d`
                        : `Every ${Number(item.window) / (60 * 60 * 24)}d`}
                    </span>
                  </span>
                </p>
                <h2 className="text-sm font-bold bg-purple-100 text-purple-500 rounded-full px-2 py-1">
                  {item.available} Owed
                </h2>
                <span className="text-sm font-bold bg-pink-100 text-pink-500 rounded-full px-2 py-1">
                  {item.totalStreamed} Streamed
                </span>

                {isBorrow ? (
                  <button
                    onClick={() => claimForFront(item.recipient, item.token)}
                    className="py-1 px-2 rounded-full font-semibold text-white bg-pink-300 hover:bg-pink-500 transition-colors"
                  >
                    Claim
                  </button>
                ) : (
                  <button
                    onClick={() => handleCancelSubscription(item.recipient)}
                    className="py-1 px-2 rounded-full font-semibold text-white bg-red-300 hover:bg-red-500 transition-colors"
                  >
                    Cancel
                  </button>
                )}
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
          <AllowanceCard title="💸 My Subs" data={allowances} isBorrow={false} />
          <AllowanceCard title="🤝 Subs To Me" data={borrows} isBorrow />
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: pageBackground }}>
      <div className="absolute backdrop-filter backdrop-blur-md"></div>
      <Toaster />

      <title>{brandSettings.brandName || 'My Custom Subscriptions'}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-4">
        {/* Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 mb-4 items-center justify-center">
          <div></div>
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
              </a><button onClick={() => window.location.assign(window.location.origin+'?sub')} className="text-2xl mb-2" title='Create Your Own'>🛠️</button>
            </div>
          </div>
          <div className="mx-auto my-0 text-center">
            <ConnectButton />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl md:text-5xl font-extrabold text-center mb-4 drop-shadow-sm"
          style={{ color: brandSettings.primaryColor }}
        >
          {brandSettings.brandName}
        </h1>
        <p className="text-base md:text-lg text-center text-gray-700 mb-6 max-w-4xl mx-auto">
          {brandSettings.about ||
            'Let fans or supporters subscribe on-chain. Recurring or one-shot—choose intervals, tokens, etc. Tokens are streamed directly from your wallet, no deposits. Press "`" to see claimable if you’re the owner.'}
          <br />
          {/* Show these only if no param */}
          {!hasParam && (
            <>
              <button
                onClick={() => setShowForm((p) => !p)}
                className="bg-pink-500 text-white font-semibold rounded-full px-4 py-2 mt-4 hover:bg-pink-500 transition-colors"
              >
                Add new sub
              </button>
              <button
                onClick={() => setShowBrandForm((p) => !p)}
                className="bg-blue-500 text-white font-semibold rounded-full px-4 py-2 mt-4 ml-2 hover:bg-blue-500 transition-colors"
              >
                Brand settings
              </button>
              <button
                onClick={handleCopyLink}
                className="bg-green-500 text-white font-semibold rounded-full px-4 py-2 mt-4 ml-2 hover:bg-green-500 transition-colors"
              >
                Share link
              </button>
              
              <button
                onClick={async () => {
    const dataToShare = {
      brand: brandSettings,
      fronts,
      // or if you prefer only the first front => singleFront: fronts[0]
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(dataToShare))));
    const url = `${window.location.origin}${window.location.pathname}?sub=${encoded}`;
    let res = await fetch('https://tinyurl.com/api-create.php?url='+url)
    navigator.clipboard.writeText(await(res.text())).then(() => {
      toast.success('Link copied!');
    });}}
                className="bg-green-500 text-white font-semibold rounded-full px-4 py-2 mt-4 ml-2 hover:bg-green-500 transition-colors"
              >
                Share link (short)
              </button>
            </>
          )}
        </p>

        {/* Brand form */}
        {showBrandForm && !hasParam && (
          <div className="bg-white p-4 mt-3 rounded-3xl max-w-xl text-pink-500 mx-auto mb-4 text-center">
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
                value={brandSettings.primaryColor}
                onChange={handleBrandChange}
                className="w-12 h-12 cursor-pointer mx-auto"
              />
            </div>
            <button
              onClick={handleSaveBrand}
              className="bg-blue-500 text-white font-semibold rounded-full px-4 py-2 mt-4 hover:bg-blue-500 transition-colors"
            >
              Save Brand
            </button>
          </div>
        )}

        {/* The subscription fronts */}
        <div className="flex flex-wrap gap-8 justify-center">
          {fronts.map((front) => {
            const planState = frontPlans[front.address] || {};
            const isCustom = planState.plan === 'custom';
            const chosenTokenObj =
              front.tokens.find((t) => t.address === planState.selectedToken) || front.tokens[0];
            const subInfoObj = frontSubs[front.address]?.[chosenTokenObj.address];

            const chainMismatch = front.chain && front.chain !== chainID;

            return (
              <div
                key={front.address}
                className="relative bg-white bg-opacity-90 rounded-3xl shadow-lg flex flex-col
                  overflow-hidden text-center h-fit max-w-sm w-full sm:w-96
                  transform transition-all hover:shadow-2xl hover:-translate-y-1"
                style={{ backgroundColor: subInfoObj ? '#ccffcc' : 'white' }}
              >
                {/* Sub badge */}
                {subInfoObj && (
                  <div className="absolute top-2 bg-green-400 text-white font-semibold rounded-full px-3 py-1 mx-auto left-1/2 -translate-x-1/2">
                    Subscribed for {Number(subInfoObj.amountAllowed)} {chosenTokenObj.token}{' '}
                    {subInfoObj.details.once &&
                      `• ${Number(subInfoObj.details.window) / 60 / 60 / 30} months`}
                  </div>
                )}

                {/* Chain mismatch note */}
                {chainMismatch && (
                  <div className="absolute top-2 bg-orange-300 text-white font-semibold rounded-full px-4 py-2 m-0 mx-4">
                    Subscription not on current chain. Please switch to chainID {front.chain}.
                  </div>
                )}

                {/* Delete if local */}
                {!hasParam && (
                  <button
                    onClick={() => handleDeleteFront(front.address)}
                    className="bg-red-300 text-white font-semibold rounded-full px-2 py-2 hover:bg-red-500 transition-colors absolute top-3 right-3"
                  >
                    🗑️
                  </button>
                )}

                {/* optional front image */}
                {front.image && (
                  <img
                    src={front.image}
                    alt={front.name}
                    className="w-full h-40 object-cover rounded-t-3xl border-b border-gray-200"
                  />
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

                  {/* token selection */}
                  <div className="flex items-center gap-2 mb-2 justify-center mt-4">
                    {front.tokens.map((tk, i) => (
                      <button
                        key={tk.address + i}
                        onClick={() => handleTokenSelect(front.address, tk.address)}
                        className="px-3 py-1 rounded-full border text-sm transition-colors"
                        style={
                          planState.selectedToken === tk.address || (!planState.selectedToken && i === 0)
                            ? {
                                backgroundColor: brandSettings.primaryColor,
                                borderColor: brandSettings.primaryColor,
                                color: 'white',
                              }
                            : {
                                borderColor: brandSettings.primaryColor,
                                color: brandSettings.primaryColor,
                                backgroundColor: 'white',
                              }
                        }
                      >
                        {tk.token}
                      </button>
                    ))}
                  </div>

                  {/* amount selection */}
                  <span className="block text-gray-700 mb-1 text-sm font-medium">Pick Amount Per Month:</span>
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
                    {chosenTokenObj.custom === 'true' && (
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
                      </button>
                    )}
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

                  {/* subscription type */}
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
                      <div className="text-xs text-gray-500">
                        {planState.onceInterval || 1} months
                      </div>
                    </div>
                  )}

                  {/* subscribe / cancel */}
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
                        className="py-2 px-4 bg-gray-500 text-white font-semibold rounded-full hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                {/* If showClaims + we have claimable */}
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
                          className="text-xs font-semibold text-white bg-green-400 rounded-full px-3 py-0.5 hover:bg-green-500 transition-colors"
                        >
                          Claim
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => claimForFront(front.address)}
                      className="block w-full text-sm font-semibold text-white bg-green-400 rounded-full py-2 hover:bg-green-500 transition-colors mt-2"
                    >
                      Claim All
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add front form (only if local mode) */}
        {showForm && !hasParam && (
          <div className="max-w-xl mx-auto mb-10 p-6 bg-white bg-opacity-90 rounded-3xl shadow-2xl border border-gray-200 text-gray-700 mt-10">
            <h2
              className="text-2xl font-extrabold mb-4 drop-shadow-sm"
              style={{ color: brandSettings.primaryColor }}
            >
              Create Your Own Subscription Front
            </h2>
            <p className="mb-4 text-sm">
              Let supporters subscribe directly to your address. Once saved, you can share a link
              that also includes your brand design.
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

            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold" style={{ color: brandSettings.primaryColor }}>
                Tokens
              </h3>
              <button
                onClick={handleAddTokenRow}
                className="px-3 py-1 text-white rounded-full text-sm hover:bg-pink-500"
                style={{ backgroundColor: brandSettings.primaryColor }}
              >
                Add Token
              </button>
            </div>
            {newFront.tokens.map((tk, i) => (
              <div
                key={i}
                className="p-3 mb-4 bg-white rounded-2xl shadow-sm border border-gray-200"
              >
                <div className="grid gap-3">
                  <select
                    value={tk.address}
                    onChange={(e) => {
                      handleTokenFieldChange(i, 'address', e.target.value);
                      const textSym = e.target.options[e.target.selectedIndex].text;
                      handleTokenFieldChange(i, 'token', textSym);
                    }}
                    className="p-3 border border-gray-300 rounded-full 
                      focus:outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">Select Token</option>
                    {tokens[chainID]?.map((token) => (
                      <option key={token.address} value={token.address}>
                        {token.symbol}
                      </option>
                    ))}
                  </select>
                  {!tk.address && (
                    <>
                      <input
                        type="text"
                        placeholder="Token Symbol (e.g. USDC)"
                        onChange={(e) => handleTokenFieldChange(i, 'token', e.target.value)}
                        className="p-3 border border-gray-300 rounded-full 
                          focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                      <input
                        type="text"
                        placeholder="Token Address (0x...)"
                        value={tk.address}
                        onChange={(e) => handleTokenFieldChange(i, 'address', e.target.value)}
                        className="p-3 border border-gray-300 rounded-full 
                          focus:outline-none focus:ring-2 focus:ring-blue-300"
                      />
                    </>
                  )}
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
                    value={tk.presetAmounts.join(', ')}
                    onChange={(e) => handleTokenFieldChange(i, 'preset', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-full 
                      focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                  <label className="text-sm font-semibold mb-1 mt-3 text-pink-500">
                    Allow Custom Amount
                  </label>
                  <div>
                    <button
                      onClick={() =>
                        handleTokenFieldChange(i, 'custom', tk.custom === 'true' ? 'false' : 'true')
                      }
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        tk.custom === 'true'
                          ? 'bg-green-400 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                      style={{
                        backgroundColor:
                          tk.custom === 'true' ? brandSettings.primaryColor : 'lightgray',
                      }}
                    >
                      {tk.custom === 'true' ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
                {newFront.tokens.length > 1 && (
                  <button
                    onClick={() => handleRemoveTokenRow(i)}
                    className="mt-3 px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-500 text-sm"
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
        )}

        {/* Optionally show the “Subs” panel if no param */}
        {!hasParam && <Subs />}
      </div>
    </div>
  );
}
