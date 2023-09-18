import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Container, TextField, Button, Typography, Paper, Grid, Modal, Select, MenuItem } from '@mui/material';
import 'tailwindcss/tailwind.css'
import { chainId } from 'wagmi'; import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider } from './tl'
import { useEthersSigner } from './tl'
import { useAccount, useConnect, useEnsName } from 'wagmi'


let abi = [{ "inputs": [], "stateMutability": "payable", "type": "constructor" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "RPC", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_address", "type": "address" }], "name": "addressToBytes", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "bytes", "name": "data", "type": "bytes" }], "name": "bytesToHexString", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "pure", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "Own", "type": "address" }, { "internalType": "uint256", "name": "nfee", "type": "uint256" }, { "internalType": "string", "name": "newRPC", "type": "string" }, { "internalType": "uint256", "name": "i", "type": "uint256" }], "name": "changeOwnerFEEAndRPC", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "address", "name": "TOKEN", "type": "address" }, { "internalType": "uint256", "name": "chainID", "type": "uint256" }], "name": "getBalance", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "TOKEN", "type": "address" }, { "internalType": "uint256", "name": "chainID", "type": "uint256" }], "name": "getMyBalance", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "target", "type": "address" }, { "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "chainID", "type": "uint256" }], "name": "setBalance", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "token", "type": "address" }, { "internalType": "uint256", "name": "chainID", "type": "uint256" }], "name": "setMyBalance", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "userBalance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "address", "name": "", "type": "address" }, { "internalType": "address", "name": "", "type": "address" }], "name": "userBalanceFeed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }]
let morpheusAbi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }, { "indexed": false, "internalType": "uint256", "name": "signerThreshold", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "contractSetup", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "endpoint", "type": "string" }, { "indexed": false, "internalType": "string", "name": "endpointp", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "feedRequested", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "feedSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "", "type": "string" }], "name": "feedSubmitted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "supportvalue", "type": "uint256" }], "name": "feedSupported", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "newPayoutAddress", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "addressValue", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "oracleType", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "proposer", "type": "address" }], "name": "newProposal", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "newSigner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "newThreshold", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "proposalSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }], "name": "routerFeeTaken", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "signerRemoved", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newPass", "type": "uint256" }], "name": "subscriptionPassPriceUpdated", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "buyPass", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "createProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factoryContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "feedSupport", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "feedID", "type": "uint256" }], "name": "getFeed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFeedLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }], "name": "getFeeds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "signers_", "type": "address[]" }, { "internalType": "uint256", "name": "signerThreshold_", "type": "uint256" }, { "internalType": "address payable", "name": "payoutAddress_", "type": "address" }, { "internalType": "uint256", "name": "subscriptionPassPrice_", "type": "uint256" }, { "internalType": "address", "name": "factoryContract_", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "payoutAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "proposalList", "outputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "address", "name": "proposer", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "proposalFeedId", "type": "uint256" }, { "internalType": "uint256", "name": "proposalActive", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string[]", "name": "APIendpoint", "type": "string[]" }, { "internalType": "string[]", "name": "APIendpointPath", "type": "string[]" }, { "internalType": "uint256[]", "name": "decimals", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "bounties", "type": "uint256[]" }], "name": "requestFeeds", "outputs": [{ "internalType": "uint256[]", "name": "feeds", "type": "uint256[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "signProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "signerLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "signerThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "signers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }, { "internalType": "string[]", "name": "vals", "type": "string[]" }], "name": "submitFeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "subscriptionPassPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIds", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "supportFeeds", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
let provider
const contractAddress = '0x4566F71333CDA135bC10F51bc9506f6dB68F4E78';
const morpheusAddress = '0x0000000000071821e8033345A7Be174647bE0706';
let signer
function App() {
  const [accounts, setAccounts] = useState([]);
  const [user, setUser] = useState('0');
  const [feedID, setfeedID] = useState('0');
  const [alt, setAlt] = useState(null); const [OracleReady, setOracleReady] = useState(0);
  const [bal, setBal] = useState("0");
  const [network, setNetwork] = useState(1);
  const [token, setToken] = useState("0x0000000000071821e8033345a7be174647be0706");
  provider = useEthersProvider()
  signer = useEthersSigner();
  const { address, isConnected } = useAccount()
  let contract = new ethers.Contract(contractAddress, abi, provider);
  let morpheus = new ethers.Contract(morpheusAddress, morpheusAbi, provider);
  morpheus.on("feedSubmitted", (feedId, value, timestamp,) => {
    // Update state to show the modal
    console.log('oracle', value)
    if (Number(feedId) == feedID) {
      setOracleReady((Number(value)));
    }
  });
  useEffect(() => {
    async function init() {
      setBal(Number(await contract.userBalance(network, address, token)) / 10 ** 18);
      setfeedID(Number(await contract.userBalanceFeed(network, await address, token)));
      let feedValue
      [feedValue, , ,] = await morpheus.getFeed(feedID); // Replace this with your actual call
      console.log('T', feedValue)
      setOracleReady((Number(feedValue)));
    }
    try { window.ethereum.request({ method: 'eth_requestAccounts' }); } catch { }
    init();

  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      setBal(Number(await contract.userBalance(network, await address, token)) / 10 ** 18);
      console.log(network, await address, token, alt, 'LOL', Number(await contract.userBalance(network, await address, token)) / 10 ** 18)
      setfeedID(Number(await contract.userBalanceFeed(network, await address, token)));
      let feedValue
      [feedValue, , ,] = await morpheus.getFeed(feedID); // Replace this with your actual call
      console.log('T', feedValue, 'lol', feedID)
      if (feedValue != 0) {
        setOracleReady(Number(feedValue))
      }
      //  }
    }, 100000);
    return () => clearInterval(interval);
  }, [token, feedID]);
  const getBalance = async () => {
    if (alt == null) {
      let success = false;
      while (!success) {
        try {
          const tx = await contract.connect(signer).getBalance(address, token, network, { value: ethers.parseEther('0.001') });
          await tx.wait();
          success = true;
        } catch (error) {
          if (error.message.includes("rejected")) {
            success = true
            break
          } else {
            console.error("Transaction failed:", error);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
          }
        }
      }
    }
    else {
      let success = false;
      while (!success) {
        try {
          const tx = await contract.connect(signer).getBalance(alt, token, network, { value: ethers.parseEther('0.001') });
          await tx.wait();
          success = true;
        } catch (error) {
          if (error.message.includes("rejected")) {
            success = true
            break
          } else {
            console.error("Transaction failed:", error);
            await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
          }
        }
      }
    }
    setOracleReady(11155111)
  };
  const update = async () => {
    let success = false;
    while (!success) {
      try {
        const tx = await contract.connect(signer).setBalance(address, token, network)//,  });
        await tx.wait(); success = true;
      } catch (error) {
        console.error("Transaction failed:", error);
        if (error.message.includes("rejected")) {
          success = true
          break
        } else {
          await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
        }
      }
    }
  };
  const sync = async (e) => {
    await setToken(e.target.value);
    setBal(Number(await contract.userBalance(network, await address, e.target.value)) / 10 ** 18);
    console.log(network, await address, e.target.value, alt, 'LOL', Number(await contract.userBalance(network, await address, token)) / 10 ** 18)
    setfeedID(Number(await contract.userBalanceFeed(network, await address, e.target.value)));
    let feedValue
    console.log(feedID);
    [feedValue, , ,] = await morpheus.getFeed(feedID); // Replace this with your actual call
    console.log('T', feedValue, 'lol', feedID)
    if (feedValue != 0) {
      setOracleReady(Number(feedValue))
    }
  };

  async function lol() {
    let addrs = address
    if (alt != null) { addrs = alt }
    let feed = (Number(await contract.userBalanceFeed(network, addrs, token)));
    setfeedID(feed)
    let feedValue
    console.log(feed);
    let success = false;
    while (!success) {
      try {
        [feedValue, , ,] = await morpheus.getFeed(feed); // Replace this with your actual call
        console.log('T', feedValue, 'lol', feed)
        if (feedValue != 0) {
          setOracleReady(Number(feedValue))

        } success = true

      } catch {

      }
    }
    setBal(Number(await contract.userBalance(network, addrs, token)) / 10 ** 18);
    console.log(network, addrs, token, alt, 'LOL', Number(await contract.userBalance(network, addrs, token)) / 10 ** 18)

  };
  return (
    <div style={{ color: '#00ff55', backgroundColor: '#a8f9ff' }} className="h-full w-full min-h-screen">
      <ConnectButton /><div ><a href='https://scry.finance' ><img style={{ height: '42px', position: 'fixed' }} src="/scry.png" className="top-2 right-56 color-white border-white" />
      </a></div><div ><a href='https://discord.gg/3Z2qvm9BDg' ><img style={{ height: '42px', position: 'fixed' }} src="/discord.png" className="top-2 right-32 color-white border-white" />
      </a></div><div ><a href='https://twitter.com/scryprotocol' ><img style={{ height: '42px', position: 'fixed' }} src="/twitter.png" className="top-2 right-44 color-white border-white" />
      </a></div><a href='https://docs.veryfi.xyz'><Button style={{ backgroundColor: '#00aaff', color: '#ffffff', position: 'fixed' }} variant='outlined' className="top-2 right-2 color-white border-white">Our Docs</Button>
      </a><div style={{ color: '#ffffff', backgroundColor: '#53baff', position: 'relative', top: '50px', borderRadius: '25px' }} className="justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-white text-2xl md:text-3xl font-extrabold w-3/4">
          Veryfi
        </h1> <h3 style={{}} className='mx-6 font-bold' >
          Verify that you own any NFTs, ERCs, are staking or any other ownership that uses balanceOf, for any other network! Veryfi lets you easily check membership and ownership for your community/project! Simply choose the network, enter the token or contract address and Request Veryfication! The app will then show you when the oracles ready and you can submit the verification and it's ready to use onchain!</h3>
        <h2 className="m-auto text-center color-white text-2xl  font-extrabold w-3/4">
          Your Balance for {token}
        </h2><h2 className="m-auto text-center md:mt-8 color-white text-2xl md:text-3xl font-extrabold w-3/4">
          {bal} {(bal != 0 && <span className="text-green-300 ml-2">✓ Veryfied</span>)}

        </h2>
        <div className="m-auto text-center color-white text-1xl md:text-1xl font-bold w-3/4">
          <h2>Network</h2>
          <Select
            labelId="filter-label"
            id="filter-select"
            value={network} style={{ color: 'white', backgroundColor: '#00ccff' }}
            onChange={(e) => setNetwork(e.target.value)} className=" w-80 text-center flex flex-col justify-center mt-4 md:mt-4 px-4 xs:px-0 m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden">
            <MenuItem value="1">Ethereum</MenuItem>
            <MenuItem value="42161">Arbitrum</MenuItem>
            <MenuItem value="8453">Base</MenuItem>
            <MenuItem value="10">Optimism</MenuItem>
            <MenuItem value="137">Polygon</MenuItem>
            <MenuItem value="534351">Scroll</MenuItem>
            <MenuItem value="11155111">Sepolia</MenuItem>

          </Select>
          <h3>Token</h3>
          <input type="text" style={{ backgroundColor: '#00ccff', right: '2px' }} placeholder="Token" value={token} onChange={sync} className=" w-80 text-center flex flex-col justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden" />
          <Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className="top-2 color-white border-white" onClick={getBalance}>Request Veryfication</Button>
          <h3><Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className="top-4 color-white border-white" onClick={lol}>Refresh and Check</Button>
          </h3><div></div>{(OracleReady > 1 && OracleReady != 11155111 && <Button style={{ backgroundColor: '#00aaff', color: '#ffffff' }} variant='outlined' className="top-6 color-white border-white" onClick={update}>Set Balance</Button>)
          }{(OracleReady == 11155111 && <div style={{ position: 'relative', top: '12px' }}>Awaiting Oracle...</div>)}
          <div style={{ color: '#00ccff', top: '6px' }}>.</div ><h2 className=" top-6 ">Balance for other address</h2>
          <input type="text" style={{ backgroundColor: '#00ccff', top: '6px' }} placeholder="User Address" value={alt} onChange={(e) => { setAlt(e.target.value) }} className=" top-10 w-80 text-center flex flex-col justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-white overflow-hidden" />
        </div>Please note there is a 0.001 ETH oracle fee.</div ></div >
  );
}

export default App;