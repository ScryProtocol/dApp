import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Container, TextField, Button, Typography, Paper, Grid, Modal } from '@mui/material';
import 'tailwindcss/tailwind.css'
let abi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "player1", "type": "address" }, { "indexed": false, "internalType": "address", "name": "player2", "type": "address" }], "name": "GameCreated", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "player", "type": "address" }, { "indexed": false, "internalType": "string", "name": "commit", "type": "string" }], "name": "PlayerJoined", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "player1roll", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "player2roll", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "winner", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "WinnerDetermined", "type": "event" }, { "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "internalType": "uint256", "name": "betAm", "type": "uint256" }], "name": "createGame", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }], "name": "determineWinner", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "games", "outputs": [{ "internalType": "address", "name": "player1", "type": "address" }, { "internalType": "address", "name": "player2", "type": "address" }, { "internalType": "address", "name": "winner", "type": "address" }, { "internalType": "string", "name": "commit1", "type": "string" }, { "internalType": "string", "name": "commit2", "type": "string" }, { "internalType": "uint256", "name": "player1bet", "type": "uint256" }, { "internalType": "uint256", "name": "player2bet", "type": "uint256" }, { "internalType": "uint256", "name": "player1roll", "type": "uint256" }, { "internalType": "uint256", "name": "player2roll", "type": "uint256" }, { "internalType": "uint256", "name": "betAmount", "type": "uint256" }, { "internalType": "uint256", "name": "vrfFeedId", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }, { "internalType": "string", "name": "_commit", "type": "string" }], "name": "joinGame", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "morpheus", "outputs": [{ "internalType": "contract Morpheus", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "", "type": "address" }], "name": "pay", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "gameId", "type": "uint256" }], "name": "withdrawBet", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
let morpheusAbi = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address[]", "name": "signers", "type": "address[]" }, { "indexed": false, "internalType": "uint256", "name": "signerThreshold", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "contractSetup", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "string", "name": "endpoint", "type": "string" }, { "indexed": false, "internalType": "string", "name": "endpointp", "type": "string" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "feedRequested", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "feedSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }, { "indexed": false, "internalType": "string", "name": "", "type": "string" }], "name": "feedSubmitted", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "feedId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "supportvalue", "type": "uint256" }], "name": "feedSupported", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "payout", "type": "address" }], "name": "newPayoutAddress", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "addressValue", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "oracleType", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "proposer", "type": "address" }], "name": "newProposal", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "newSigner", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "newThreshold", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "proposalId", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "proposalSigned", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }, { "indexed": false, "internalType": "address", "name": "sender", "type": "address" }], "name": "routerFeeTaken", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "address", "name": "signer", "type": "address" }], "name": "signerRemoved", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint256", "name": "newPass", "type": "uint256" }], "name": "subscriptionPassPriceUpdated", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "buyer", "type": "address" }, { "internalType": "uint256", "name": "duration", "type": "uint256" }], "name": "buyPass", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "feedId", "type": "uint256" }], "name": "createProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "factoryContract", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "feedSupport", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "feedID", "type": "uint256" }], "name": "getFeed", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "uint256", "name": "", "type": "uint256" }, { "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "getFeedLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }], "name": "getFeeds", "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "", "type": "uint256[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }, { "internalType": "string[]", "name": "", "type": "string[]" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address[]", "name": "signers_", "type": "address[]" }, { "internalType": "uint256", "name": "signerThreshold_", "type": "uint256" }, { "internalType": "address payable", "name": "payoutAddress_", "type": "address" }, { "internalType": "uint256", "name": "subscriptionPassPrice_", "type": "uint256" }, { "internalType": "address", "name": "factoryContract_", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "payoutAddress", "outputs": [{ "internalType": "address payable", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "proposalList", "outputs": [{ "internalType": "uint256", "name": "uintValue", "type": "uint256" }, { "internalType": "address", "name": "addressValue", "type": "address" }, { "internalType": "address", "name": "proposer", "type": "address" }, { "internalType": "uint256", "name": "proposalType", "type": "uint256" }, { "internalType": "uint256", "name": "proposalFeedId", "type": "uint256" }, { "internalType": "uint256", "name": "proposalActive", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "string[]", "name": "APIendpoint", "type": "string[]" }, { "internalType": "string[]", "name": "APIendpointPath", "type": "string[]" }, { "internalType": "uint256[]", "name": "decimals", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "bounties", "type": "uint256[]" }], "name": "requestFeeds", "outputs": [{ "internalType": "uint256[]", "name": "feeds", "type": "uint256[]" }], "stateMutability": "payable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "proposalId", "type": "uint256" }], "name": "signProposal", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "signerLength", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "signerThreshold", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "signers", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIDs", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }, { "internalType": "string[]", "name": "vals", "type": "string[]" }], "name": "submitFeed", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "subscriptionPassPrice", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256[]", "name": "feedIds", "type": "uint256[]" }, { "internalType": "uint256[]", "name": "values", "type": "uint256[]" }], "name": "supportFeeds", "outputs": [], "stateMutability": "payable", "type": "function" }, { "inputs": [], "name": "withdrawFunds", "outputs": [], "stateMutability": "nonpayable", "type": "function" }]
let provider = ethers.getDefaultProvider()
const contractAddress = '0x14f07de6De35D516186b7027cE7102A1C4683e9D';
const morpheusAddress = '0x0000000000071821e8033345A7Be174647bE0706';

let contract = new ethers.Contract(contractAddress, abi, provider);
let morpheus = new ethers.Contract(morpheusAddress, morpheusAbi, provider);

function App() {
  const [accounts, setAccounts] = useState([]);
  const [game, setGame] = useState('0');
  const [gameId, setGameId] = useState(0); const [OracleReady, setOracleReady] = useState(0);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerInfo, setWinnerInfo] = useState({}); const [player1, setPlayer1] = useState("");
  const [bal, setBal] = useState("0");
  const [commit, setCommit] = useState("");
  const [amount, setAmount] = useState("");
  useEffect(() => {
    async function init() {
      provider = new ethers.providers.Web3Provider(window.ethereum);

      contract = new ethers.Contract(contractAddress, abi, provider);
      morpheus = new ethers.Contract(morpheusAddress, morpheusAbi, provider);
      console.log((await provider.getBalance('0x9D31e30003f253563Ff108BC60B16Fdf2c93abb5')).toString())
      console.log(await contract.games(gameId).player1roll)
      console.log(await contract.games(gameId))
      const gameData = await contract.games(gameId);
      setGame({
        player1: gameData.player1.toString(),
        player2: gameData.player2.toString(),
        winner: gameData.winner.toString(),
        commit1: gameData.commit1.toString(),
        commit2: gameData.commit2.toString(),
        player1bet: ethers.utils.formatUnits(gameData.player1bet, 18).toString(),
        player2bet: ethers.utils.formatUnits(gameData.player2bet, 18).toString(),
        player1roll: gameData.player1roll.toString(),
        player2roll: gameData.player2roll.toString(),
        betAmount: ethers.utils.formatUnits(gameData.betAmount, 18).toString(),
        vrfFeedId: gameData.vrfFeedId.toString()
      }); const signer = provider.getSigner()
      setAmount(ethers.utils.formatUnits(gameData.betAmount, 18).toString())
      setBal(ethers.utils.formatUnits(await contract.pay(signer.getAddress()), 18).toString())
      console.log(await contract.games(gameId))
      setOracleReady((Number(feedValue)) !== 0);
    } window.ethereum.request({ method: 'eth_requestAccounts' });
    init();
  }, []);

  useEffect(() => {
    const listenForWinner = contract.on("WinnerDetermined", (Id, roll, roll1, win, am, event) => {
      // Update state to show the modal
      if (Number(Id) == gameId) {
        setWinnerInfo({ player1roll: roll.toString(), player2roll: roll1.toString(), winner: win.toString(), amount: ethers.utils.formatEther(am).toString() });
        console.log(winnerInfo)
        setWinnerModalOpen(true);
      }
    });
    const interval = setInterval(async () => {
      provider = new ethers.providers.Web3Provider(window.ethereum);
      if (gameId) {
        const gameData = await contract.games(gameId);
        setGame({
          player1: gameData.player1.toString(),
          player2: gameData.player2.toString(),
          winner: gameData.winner.toString(),
          commit1: gameData.commit1.toString(),
          commit2: gameData.commit2.toString(),
          player1bet: ethers.utils.formatUnits(gameData.player1bet, 18).toString(),
          player2bet: ethers.utils.formatUnits(gameData.player2bet, 18).toString(),
          player1roll: gameData.player1roll.toString(),
          player2roll: gameData.player2roll.toString(),
          betAmount: ethers.utils.formatUnits(gameData.betAmount, 18).toString(),
          vrfFeedId: gameData.vrfFeedId.toString()
        }); setBal(ethers.utils.formatUnits(await contract.pay(signer.getAddress()), 18).toString())

      }
      console.log('LOL', game)
      let feedValue
      [feedValue, , ,] = await morpheus.getFeed(game.vrfFeedId); // Replace this with your actual call
      console.log('T', feedValue)
      setOracleReady((Number(feedValue)) !== 0);
    }, 10000);
    return () => clearInterval(interval);
  }, [gameId]);
  const createGame = async () => {
    const signer = provider.getSigner()
    const tx = await contract.connect(signer).createGame(gameId, ethers.utils.parseEther(amount));
    await tx.wait();
    setGameId(gameId);
  };

  const joinGame = async () => {
    const signer = provider.getSigner()
    const tx = await contract.connect(signer).joinGame(gameId, commit, { value: ethers.utils.parseEther((Number(amount) + 0.0005).toString()) });
    await tx.wait();
    setGameId(gameId);
  };
  const withdraw = async () => {
    const signer = provider.getSigner()
    const tx = await contract.connect(signer).withdraw();
    await tx.wait();
  };
  const determineWinner = async () => {
    const signer = provider.getSigner()
    const gameData = await contract.games(gameId);
    setGame(gameData);
    const feedId = game.vrfFeedId;
    const { value } = await morpheus.getFeed(feedId);
    if (parseInt(value) !== 0) {
      const tx = await contract.connect(signer).determineWinner(gameId);
      await tx.wait();
    }
  };


  return (
    <div style={{ color: '#00ff55' }} className="bg-gray-900 h-full w-full min-h-screen">
      <div style={{ color: '#00ff55' }} className="justify-center text-center flex flex-col bg-gray-800 space-y-6 justify-center m-auto max-w-4xl min-w-80 shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
        <h1 className="m-auto text-center md:mt-8 color-green-500 text-2xl md:text-3xl font-extrabold w-3/4">
          Death Roll
        </h1> <div style={{ color: '#77ff8b' }} className='mx-6' >
          This is for testnet only. Do not bet more than you can afford to lose. Gamble Responsibly</div>
        <div style={{ color: '#00ff55' }} className="flex justify-center">
        </div><div style={{ color: '#00ff55' }} className="flex flex-col justify-center m-auto overflow-hidden">

          {/* Display Game Details */}
          <div className="m-auto text-center color-green-500 text-1xl md:text-1xl font-bold w-3/4">
            <h2>Game Details</h2>
            <h3>Game ID: {gameId}</h3>
            <p>Winner: {game.winner || "Not determined yet"}</p>
            <p>Bet Amount: {game.betAmount} ETH</p>
            <p>VRF Feed ID: {game.vrfFeedId}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {/* Player 1 Column */}
              <div className="text-center bg-gray-800 space-y-6  justify-center shadow-md rounded-md border border-solid border-green-500 overflow-hidden" style={{ flex: '0 0 45%' }}>
                <h4>Player 1: {game.player1}</h4>
                <p>Commit: {game.commit1}</p>
                <p>Bet: {game.player1bet} ETH</p>
                <p>Roll: {game.player1roll}</p>
              </div>
              {/* Player 2 Column */}
              <div className="text-center bg-gray-800 space-y-6 justify-center shadow-md rounded-md border border-solid border-green-500 overflow-hidden" style={{ flex: '0 0 45%' }}>
                <h4>Player 2: {game.player2}</h4>
                <p>Commit: {game.commit2}</p>
                <p>Bet: {game.player2bet} ETH</p>
                <p>Roll: {game.player2roll}</p>
              </div>
            </div> {/* Determine Winner */}
              <Button style={{ color: '#77ff8b' }} variant='outlined' className="top-1 color-green-500 border-green-500" onClick={determineWinner}>Determine Winner</Button>
            {(OracleReady==0 &&<>Awaiting VRF...</>)}
            <div className="m-auto justify-center text-center space-x-6 space-y-1">
              <h2>Join Game with Bet</h2>

              <input type="text" style={{ backgroundColor: '#111111', right: '2px' }} value={commit} onChange={(e) => setCommit(e.target.value)} />
              <input style={{ backgroundColor: '#111111' }} type="text" placeholder="Bet Amount in ETH" value={amount} onChange={(e) => setAmount(e.target.value)} />
              <div><Button variant='outlined' onClick={joinGame}>Join Game</Button>
              </div>
            </div>
            <div>Withdrawable: {bal}<Button onClick={withdraw}>Withdraw</Button>
            </div></div>  {/* Create Game */}
          Game ID
          <input type="text"
            style={{ backgroundColor: '#111111', color: 'green', top: '1px' }} className="m-auto justify-center text-center bg-green-500" placeholder="0" onChange={(e) => setGameId(e.target.value)} />
          {/* Join Game */}
          <div className="justify-center text-center space-x-6">
            <h2>Create Game</h2>

            <input type="text" style={{ backgroundColor: '#111111', color: 'green', top: '1px' }} className="m-auto justify-center text-center bg-green-500" placeholder="Chosen Game ID" onChange={(e) => setGameId(e.target.value)} />
            <input type="text" style={{ backgroundColor: '#111111', color: 'green', top: '1px' }} className="m-auto justify-center text-center bg-green-500" placeholder="Bet Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <div><Button onClick={createGame}>Create Game</Button>
            </div>
          </div> <Modal
            open={winnerModalOpen}
            onClose={() => setWinnerModalOpen(false)}
          >
            <div style={{ backgroundColor: '#222222', color: '#00ff55' }} className="text-center textflex flex-col space-y-6 justify-center m-auto w-1/2   shadow-md rounded-md border border-solid border-green-500 overflow-hidden">
              <p>Winner Determined!</p>
              <p>Winner: {winnerInfo.winner}</p>
              <p>Player 1: {game.player1}</p>
              <p>Player 1 Roll: {winnerInfo.player1roll}</p>
              <p>Player 2: {game.player2}</p>
              <p>Player 2 Roll: {winnerInfo.player2roll}</p>
              <p>Amount: {winnerInfo.amount} ETH</p>
            </div>
          </Modal></div></div ></div >
  );
}

export default App;
