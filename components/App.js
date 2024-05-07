const React = require('react');
const { useState, useEffect } = require('react');
const ethers = require('ethers');

import { Toaster, toast } from 'react-hot-toast';
import { chainId } from 'wagmi'; import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider } from './tl'
import { useEthersSigner } from './tl'
import { useAccount, useConnect, useEnsName, useChainId } from 'wagmi'

const streamContractAddress = '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
const streamContractABI = [{ "inputs": [{ "internalType": "address payable", "name": "feeAddrs", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "friend", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "StreamAllowed", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "token", "type": "address" }, { "indexed": true, "internalType": "address", "name": "lender", "type": "address" }, { "indexed": true, "internalType": "address", "name": "streamer", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "Streamed", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }, { "internalType": "uint256", "name": "window", "type": "uint256" }, { "internalType": "bool", "name": "once", "type": "bool" }], "name": "allowStream", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }], "name": "computeHash", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "pure", "type": "function" }, { "inputs": [], "name": "fee", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "feeAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "me", "type": "address" }], "name": "getAvailable", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "_fee", "type": "uint256" }, { "internalType": "address", "name": "newfeeAddress", "type": "address" }], "name": "setFee", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "me", "type": "address" }], "name": "stream", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "streamDetails", "outputs": [{ "internalType": "address", "name": "lender", "type": "address" }, { "internalType": "address", "name": "friend", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "totalStreamed", "type": "uint256" }, { "internalType": "uint256", "name": "outstanding", "type": "uint256" }, { "internalType": "uint256", "name": "allowable", "type": "uint256" }, { "internalType": "uint256", "name": "window", "type": "uint256" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "internalType": "bool", "name": "once", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "streamDetailsByFriend", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "streamDetailsByLender", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "friend", "type": "address" }], "name": "viewFriendAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "lender", "type": "address" }], "name": "viewLenderAllowances", "outputs": [{ "internalType": "bytes32[]", "name": "", "type": "bytes32[]" }], "stateMutability": "view", "type": "function" }];
let tokenABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "name": "",
        "type": "string"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [
      {
        "name": "",
        "type": "uint8"
      }
    ],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }]
const App = () => {
  const [streamContract, setStreamContract] = useState(null);
  const [subscriptionLink, setSubscriptionLink] = useState('');
  const [subscriptionDetails, setSubscriptionDetails] = useState({
    lender: "",
    friend: "",
    token: "",
    totalStreamed: 0,
    outstanding: 0,
    allowable: 0,
    window: "",
    timestamp: '',
    once: ''
  });
  const [showSubscribedMessage, setShowSubscribedMessage] = useState(false);
  const [showSubscribeForm, setShowSubscribeForm] = useState(false);
  const [subscriptions, setSubscriptions] = useState([]);

  const ethersSigner = useEthersSigner();
  let provider = useEthersProvider()
  let signer = ethersSigner
  let tok
  let account = useAccount();
  let userAddress = useAccount().address;
  let ChainId = useChainId()
  useEffect(() => {
    const initializeContract = async () => {
      if (window.ethereum) {
        const { network } = getQueryParams();
        const streamContractAddress = network === '1' ? '0x90076e40a74f33cc2c673ecbf2fba4068af77892' : '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
        const streamContract = new ethers.Contract(streamContractAddress, streamContractABI, signer);

        setStreamContract(streamContract);

        await checkSubscription();
      }
    };

    initializeContract();
  }, []);

  const getQueryParams = () => {
    const params = new URLSearchParams(window.location.search);
    console.log(params, window.location.search);
    return {
      token: params.get('token'),
      subscribe: params.get('subscribe'),
      amount: params.get('amount'),
      window: params.get('window'),
      once: params.get('once'),
      network: params.get('network'),
    };
  };

  const displaySubscriptionLink = (link) => {
    setSubscriptionLink(link);
    navigator.clipboard.writeText(link)
      .then(() => {
        // Show a toast notification
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = 'Subscription link copied to clipboard!';
        document.body.appendChild(toast);

        // Remove the toast after 3 seconds
        setTimeout(() => {
          toast.remove();
        }, 3000);
      })
      .catch((error) => {
        console.error('Failed to copy subscription link:', error);
      });
  };

  const displaySubscriptionDetails = (details, dec) => {
    setSubscriptionDetails({
      lender: details.lender,
      friend: details.friend,
      token: details.token,
      totalStreamed: ethers.formatUnits(details.totalStreamed, dec),
      outstanding: ethers.formatUnits(details.outstanding, dec),
      allowable: ethers.formatUnits(details.allowable, dec),
      window: !details.once
        ? `Pay every ${Math.floor(Number(details.window) / 86400)}d:${Math.floor((Number(details.window) % 86400) / 3600)}h:${Math.floor((Number(details.window) % 3600) / 60)}m:${Number(details.window) % 60}s`
        : `Sub until ${new Date(Date.now() + Number(details.window) * 1000).toLocaleString()}`,
      timestamp: new Date(Number(details.timestamp) * 1000).toLocaleString(),
      once: details.once ? 'One-time' : 'Recurring',
    });
  };

  const handleCreateSubscription = async (event) => {
    event.preventDefault();
    const tokenAddress = document.getElementById('tokenAddress').value;
    const subscriber = document.getElementById('subscriber').value;
    const amount = document.getElementById('amount').value;
    const window = document.getElementById('window').value * 24 * 60 * 60; // Convert days to seconds
    const once = document.getElementById('once').value === 'true';
    const selectedNetwork = document.getElementById('networkSelect').value;

    const subscriptionLink = `https://sub.spot.pizza/?token=${tokenAddress}&subscribe=${subscriber}&amount=${amount}&window=${window}&once=${once}&network=${selectedNetwork}`;
    displaySubscriptionLink(subscriptionLink);
  };

  const checkSubscription = async () => {
    const { token, subscribe, amount, window, once, network } = getQueryParams();
    console.log(getQueryParams())
    console.log('1', token, subscribe, amount, window, once)
    if (token && subscribe && amount && window && once) {
      tok = token;
      let subscriptionHash;
      let details = { lender: 1 };
      try {
        console.log(provider)
        const streamContractAddress = network === '1' ? '0x90076e40a74f33cc2c673ecbf2fba4068af77892' : '0x12A5103f551Fe9B659Fb40DCd4701CbE1bA0B3e6';
        const streamContract = new ethers.Contract(streamContractAddress, streamContractABI, provider);
        subscriptionHash = await streamContract.computeHash(userAddress, token, subscribe);
        details = await streamContract.streamDetails(subscriptionHash);
      } catch (error) {
        console.log(error);
      }

      if (details.lender !== '0x0000000000000000000000000000000000000000' && details.lender !== 1) {
        const tokenContract = new ethers.Contract(token, tokenABI, provider);
        const dec = await tokenContract.decimals();
        displaySubscriptionDetails(details, dec);
        console.log(details, dec);
        setShowSubscribedMessage(true);
        setShowSubscribeForm(true);

        const resolvedLender = await resolveENS(details.lender);
        const resolvedFriend = await resolveENS(details.friend);
        const resolvedToken = await resolveENS(details.token, 1);
        console.log('2', resolvedLender, resolvedFriend, resolvedToken)
        // Update the state with the new values, preserving existing ones
        setSubscriptionDetails(prevDetails => ({
          ...prevDetails,  // Spread the previous state to retain existing data
          lender: resolvedLender,
          friend: resolvedFriend,
          token: resolvedToken
        }))
      } else {

        setSubscriptionDetails({
          lender: subscribe,
          friend: userAddress,
          token: token,
          totalStreamed: '',
          outstanding: '',
          allowable: amount,
          window: once == 'false'
            ? `Pay every ${Math.floor(Number(window) / 86400)}d:${Math.floor((Number(window) % 86400) / 3600)}h:${Math.floor((Number(window) % 3600) / 60)}m:${Number(window) % 60}s`
            : `Sub until ${new Date(Date.now() + Number(window) * 1000).toLocaleString()}`,
          timestamp: '',
          once: once !== 'false' ? 'One-time' : 'Recurring',
        });
        setShowSubscribeForm(true);
        console.log('no subscription found');
        const resolvedLender = await resolveENS(subscribe);
        const resolvedFriend = await resolveENS(userAddress);
        const resolvedToken = await resolveENS(token, 1);
        console.log('2', resolvedLender, resolvedFriend, resolvedToken)
        // Update the state with the new values, preserving existing ones
        setSubscriptionDetails(prevDetails => ({
          ...prevDetails,  // Spread the previous state to retain existing data
          lender: resolvedLender,
          friend: resolvedFriend,
          token: resolvedToken
        }));
      }
    }
  };

  const handleSubscribe = async () => {
    const { token, subscribe, amount, window, once, network } = getQueryParams();

    if (ChainId != network) {
      const toast = document.createElement('div');
      toast.classList.add('toast');
      toast.textContent = `Check network! Must be chainId: ${network.toString()}`;
      document.body.appendChild(toast);

      // Remove the toast after 3 seconds
      setTimeout(() => {
        toast.remove();
      }, 3000);
      return;
    }
    const streamContract = new ethers.Contract(streamContractAddress, streamContractABI, signer);
    const tokenContract = new ethers.Contract(token, tokenABI, signer);
    const dec = await tokenContract.decimals();
    const tx = await streamContract.allowStream(token, subscribe, (amount * 10 ** Number(dec)).toString(), window, once);
    await tx.wait();

    await checkSubscription();
    setShowSubscribedMessage(true);
  };

  const resolveENS = async (address, isToken) => {
    let pro = new ethers.JsonRpcProvider('https://eth.meowrpc.com');

    try {
      if (isToken == 1) {
        const tokenContract = new ethers.Contract(tok, tokenABI, provider);
        const tokenName = await tokenContract.name();
        return tokenName || address;
      }
      const ensName = await pro.lookupAddress(address);
      console.log(ensName)
      return ensName || address;
    } catch (error) {
      console.log(error);
      return address;
    }
  };

  const fetchSubscriptions = async () => {
    const lenderAddress = userAddress
    let contract = new ethers.Contract(streamContractAddress, streamContractABI, provider);
    const allowances = await contract.viewLenderAllowances(lenderAddress);

    const subscriptionsData = await Promise.all(
      allowances.map(async (allowance) => {
        const details = await contract.streamDetails(allowance);
        const tokenContract = new ethers.Contract(
          details.token,
          [
            {
              constant: true,
              inputs: [],
              name: 'decimals',
              outputs: [{ name: '', type: 'uint8' }],
              payable: false,
              stateMutability: 'view',
              type: 'function',
            },
          ],
          provider
        );
        let dec
        try {
          dec = await tokenContract.decimals();
        } catch (error) {
          dec = 18
        }
        return {
          friend: details.friend,
          token: details.token,
          allowable: ethers.formatUnits(details.allowable, dec),
          window: !details.once ? `Pay every ${Math.floor(Number(details.window) / 86400)}d:${Math.floor((Number(details.window) % 86400) / 3600)}h:${Math.floor((Number(details.window) % 3600) / 60)}m:${Number(details.window) % 60}s`
            : `Sub until ${new Date(Date.now() + Number(details.window) * 1000).toLocaleString()}`,
          timestamp: new Date(Number(details.timestamp) * 1000).toLocaleString(),
          totalStreamed: ethers.formatUnits(details.totalStreamed, dec),
          outstanding: ethers.formatUnits(details.outstanding, dec),
          once: details.once ? 'One-time' : 'Recurring',
        };
      })
    );

    setSubscriptions(subscriptionsData);
  }; const handleCancelSubscription = async (token, friend) => {
    try {
      let streamContract = new ethers.Contract(streamContractAddress, streamContractABI, signer);
      // Call the smart contract function to cancel the subscription
      const tx = await streamContract.allowStream(token, friend, 0, 0, false);
     await tx.wait();

      // Update the subscriptions state by filtering out the canceled subscription
     fetchSubscriptions();

      // Optionally, you can display a success message or perform any other necessary actions
      console.log('Subscription canceled successfully');
      toast.success('Subscription canceled successfully');
    } catch (error) {
      // Handle any errors that occur during the cancellation process
      console.error('Error canceling subscription:', error);
    }
  };
  return (<body><div className='container'>
    {/* Render the subscription form */}
    {!showSubscribeForm && (
      <div>
        {/* Render the create subscription form */}
        <form onSubmit={handleCreateSubscription}>
          <h1>Create Subscription</h1>
          <div className="emoji">🍕🎉</div>
          <div className="card">
            <div className="form-group">
              <label htmlFor="tokenAddress">Token Address:</label>
              <input type="text" id="tokenAddress" placeholder="Enter ERC20 token address" />
            </div>
            <div className="form-group">
              <label htmlFor="subscriber">Subscribe To Address:</label>
              <input type="text" id="subscriber" placeholder="Enter subscribe address" />
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount:</label>
              <input type="number" id="amount" placeholder="Enter amount of tokens" />
            </div>
            <div className="form-group">
              <label htmlFor="window">Duration (in days):</label>
              <input type="number" id="window" placeholder="Enter duration in days" />
            </div>
            <div className="form-group">
              <label htmlFor="once">Subscription Type:</label>
              <select id="once">
                <option value="false">Recurring</option>
                <option value="true">One-time</option>
              </select>
            </div>
            <div className="form-group">
              <label>Network:</label>
              <div>
                <select id="networkSelect">
                  <option value="1">Mainnet</option>
                  <option value="10">holesky</option>
                  <option value="10">Optimism</option>
                  <option value="8453">Base</option>
                  <option value="gnosis">Gnosis</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn">Create</button>
          </div>
        </form>
        {subscriptionLink && (
          <div className="card">
            <p>Subscription Link:</p>
            <a href={subscriptionLink} id="subLink">
              <p id="subscriptionLink" style={{ wordBreak: 'break-all' }}>{subscriptionLink}</p>
            </a>
          </div>
        )}
      </div>
    )}

    {/* Render the subscription details */}
    {showSubscribeForm && (
      <div>
        <h1>Subscribe🍕😋</h1>
        <div className="card">
          <h2>Subscription Details</h2>
          <div className="details-container">
            <div className="detail-item">
              <div className="detail-label">Subscribe To:</div>
              <div className="detail-value">{subscriptionDetails.lender}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">My Address:</div>
              <div className="detail-value">{subscriptionDetails.friend}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Token:</div>
              <div className="detail-value" >{subscriptionDetails.token}</div>
            </div>
            {subscriptionDetails.totalStreamed != '' && (<>
              <div className="detail-item">
                <div className={`detail-label ${subscriptionDetails.totalStreamed === '0' ? 'hidden' : ''}`}>Total Streamed:</div>
                <div className={`detail-value ${subscriptionDetails.totalStreamed === '0' ? 'hidden' : ''}`}>{subscriptionDetails.totalStreamed}</div>
              </div>
              <div className="detail-item">
                <div className={`detail-label ${subscriptionDetails.outstanding === '0' ? 'hidden' : ''}`}>Available:</div>
                <div className={`detail-value ${subscriptionDetails.outstanding === '0' ? 'hidden' : ''}`}>{subscriptionDetails.outstanding}</div>
              </div></>)}
            <div className="detail-item">
              <div className="detail-label">Amount:</div>
              <div className="detail-value">{subscriptionDetails.allowable}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Window:</div>
              <div className="detail-value"><span>{subscriptionDetails.window}</span></div>
            </div>
            <div className="detail-item">
              <div className={`detail-label ${!subscriptionDetails.timestamp ? 'hidden' : ''}`}>Timestamp:</div>
              <div className={`detail-value ${!subscriptionDetails.timestamp ? 'hidden' : ''}`} id="timestamp1">{subscriptionDetails.timestamp}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Once:</div>
              <div className="detail-value" id="once1">{subscriptionDetails.once}</div>
            </div>
          </div>
        </div>
        {(showSubscribeForm && subscriptionDetails.outstanding == 0) && (
          <div className="card">
            <button onClick={handleSubscribe} className="btn">Subscribe</button>
          </div>
        )} {(showSubscribeForm && subscriptionDetails.outstanding != 0) && (
          <div className="card">
            <a href='https://stream.spot.pizza/'>
              <button className="btn">Manage my subs</button></a>
          </div>
        )}
        {showSubscribedMessage && (
          <div className="card">
            <div className="subscribed-content">
              <div className="emoji">🎉🍕</div>
              <h2>Congratulations!</h2>
              <p>Your subscription is cooking!</p>
              <div className="subscribed-animation">
                <div className="cheese"></div>
                <div className="cheese" style={{ top: '5%', left: '5%', width: '90%', height: '90%', backgroundColor: '#e74c3c' }}></div>
                <div className="grated-cheese" style={{ top: '5%', left: '5%', width: '90%', height: '90%', backgroundColor: '#e74c3c' }}></div>
                <div className="pepperoni" style={{ top: '20%', left: '15%' }}></div>
                <div className="pepperoni" style={{ top: '30%', right: '20%' }}></div>
                <div className="pepperoni" style={{ top: '60%', left: '30%' }}></div>
                <div className="pepperoni" style={{ top: '60%', right: '10%' }}></div>
                <div className="mushroom" style={{ top: '30%', left: '40%' }}></div>
                <div className="mushroom" style={{ top: '50%', right: '30%' }}></div>
                <div className="mushroom" style={{ top: '70%', left: '20%' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
    )}    <ConnectButton />

  </div><br/>
    <div className="container" id="subscriptionsContainer" style={{marginTop:'0px'} }>
      <h1>My Subscriptions</h1>
      <button onClick={fetchSubscriptions} className="btn cbtn">Check Subscriptions</button>
      <div id="subscriptionsList">
        {subscriptions.map((subscription, index) => (
          <div key={index} className="subscription-item">
            <div>
              🍕 <span className="subscription-label">Subscription to:</span>
              <br />
              <span className="subscription-value">{subscription.friend}</span>
            </div>
            <div>
              💰 <span className="subscription-label">Token:</span>
              <br />
              <span className="subscription-value">{subscription.token}</span>
            </div>
            <div>
              🎉 <span className="subscription-label">Amount:</span>
              <br />
              <span className="subscription-value">{subscription.allowable}</span>
            </div>
            <div>
              ⏰ <span className="subscription-label">Window:</span>
              <br />
              <span className="subscription-value">{subscription.window}</span>
            </div>
            <div className="subscription-details">
              <div>
                💸 <span className="subscription-label">Total Streamed:</span>
                <br />
                <span className="subscription-value">{subscription.totalStreamed}</span>
              </div>
              <div>
                📈 <span className="subscription-label">Outstanding:</span>
                <br />
                <span className="subscription-value">{subscription.outstanding}</span>
              </div>
              <div>
                📅 <span className="subscription-label">Timestamp:</span>
                <br />
                <span className="subscription-value">{subscription.timestamp}</span>
              </div>
              <div>
                🔄 <span className="subscription-label">Type:</span>
                <br />
                <span className="subscription-value">{subscription.once}</span>
              </div>
              <button
                className="btn"
                onClick={() => handleCancelSubscription(subscription.token, subscription.friend)}
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        ))}
      </div>
    </div></body>
  );
};

export default App;