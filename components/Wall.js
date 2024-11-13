import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId, useConnect } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { Remarkable } from 'remarkable';
import DOMPurify from 'dompurify';

const TheWallABI = [
  'function init(string _name, string _symbol, uint256 _price, uint _multi, bool _subWall, uint8 _canMod, uint8 _canChange, address _owner) external',
  'function transfer(address recipient, uint256 amount) external returns (bool)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)',
  'function mint(string _tag) external payable',
  'function renewSub(address to) external payable',
  'function getTags(uint256[] ids) external view returns (string[] tagsArr, address[] artistsArr, uint256[] timesArr, uint256[] tokensArr)',
  'function changePriceDesc(uint256 newPrice, string desc, address target, uint8 status, uint8 sub) external',
  'function latest(uint256 last) external view returns (string[] tagsArr, address[] artistsArr, uint256[] timesArr, uint256[] tokensArr)',
  'function deleteTag(uint256 id) external',
  'function banState(address target, uint8 bs) external',
  'function edit(uint256 id, string _tag) external',
  'function tip(address to, uint256 amount) external',
  'function changeOwner(address newOwner) external',
  'function balanceOf(address account) external view returns (uint256)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function tag(uint256 id) external view returns (string)',
  'function artist(uint256 id) external view returns (address)',
  'function time(uint256 id) external view returns (uint256)',
  'function artistT(address artist) external view returns (uint256)',
  'function artistTags(address artist, uint256 index) external view returns (uint256)',
  'function banstate(address user) external view returns (uint8)',
  'function mod(address user) external view returns (uint8)',
  'function hasSub(address user) external view returns (uint256)',
  'function tags() external view returns (uint256)',
  'function subs() external view returns (uint256)',
  'function owner() external view returns (address)',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
  'event Approval(address indexed owner, address indexed spender, uint256 value)',
  'string public name',
  'string public symbol',
  'uint8 public decimals',
  'uint public multi',
  'function price() external view returns (uint256)',
  'function subWall() external view returns (uint8)',
  'string public description',
  'uint8 public canChange',
  'uint8 public canMod',
];

const TheWallAddress = '0x4b4760AD19eDe0922531b72f85Dfe66e55F320E7';

const Wall = () => {
  const TheWallFactoryABI = [
    'event Deployed(address indexed addr, string name, string symbol, uint256 price, uint multi, bool subWall, uint8 canMod, uint8 canChange, address owner)',
    'function deploy(string _name, string _symbol, uint256 _price, uint _multi, bool _subWall, uint8 _canMod, uint8 _canChange, address _owner) external',
    'function wallCount() external view returns (uint256)',
    'function wallNames(uint256) external view returns (string)',
    'function getWalls(uint256[] ids) external view returns (tuple(string name, string symbol, address addr, uint256 id)[] memory)',
    'function walls(string) external view returns (tuple(string name, string symbol, address addr, uint256 id))', // Add this line
  ];
  
  const TheWallFactoryAddress = '0xb3e0e02d4ba979c92465ada9f0338a6d4cc4aa6d'; // Replace with your factory contract address
  
    const [walls, setWalls] = useState([]);
    const [selectedWallAddress, setSelectedWallAddress] = useState('');
    const [selectedWall, setSelectedWall] = useState(null);
    const [newWallData, setNewWallData] = useState({
      name: '',
      symbol: '',
      price: '0',
      multi: '1',
      subWall: false,
      canMod: '0',
      canChange: '0',
    });
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [loading, setLoading] = useState(false);
    const [createModal, setCreateModal] = useState(false);
  
    const { address: userAddress } = useAccount();
  let ethersProvider = useEthersProvider();
  let ethersSigner = useEthersSigner();
    useEffect(() => {
    }, []);
  
    useEffect(() => {
        fetchWalls();
    }, [ethersProvider]);
  
    const theWallFactoryContract = new ethers.Contract(
      TheWallFactoryAddress,
      TheWallFactoryABI,
      ethersProvider
    );
  
    const fetchWalls = async () => {
      try {
        const wallCount = await theWallFactoryContract.wallCount();
        const ids = Array.from({ length: Number(wallCount) }, (_, i) => i);
        console.log(await theWallFactoryContract.wallNames(1));
        const wallsData = await theWallFactoryContract.getWalls(ids);
  console.log(wallsData);
        const wallsList = wallsData.map((wall) => ({
          id: wall.id,
          name: wall.name,
          symbol: wall.symbol,
          addr: wall.addr,
        }));
  console.log(wallsList);
        setWalls(wallsList.reverse());
      } catch (error) {
        console.error('Error fetching walls:', error);
        toast.error('Error fetching walls');
      }
    };
  
    const handleDeployWall = async () => {
      const {
        name,
        symbol,
        price,
        multi,
        subWall,
        canMod,
        canChange,
      } = newWallData;
  
      if (!name || !symbol) {
        toast.error('Name and Symbol are required');
        return;
      }
  
      try {
        const signerContract = theWallFactoryContract.connect(ethersSigner);
        const tx = await signerContract.deploy(
          name.toLowerCase(),
          symbol,
          ethers.parseEther(price),
          multi,
          subWall,
          parseInt(canMod),
          parseInt(canChange),
          userAddress
        );
        toast('Deploying new wall...');
        await tx.wait();
        toast.success('Wall deployed successfully');
        setNewWallData({
          name: '',
          symbol: '',
          price: '0',
          multi: '1',
          subWall: false,
          canMod: '0',
          canChange: '0',
        });
        fetchWalls();
      } catch (error) {
        console.error('Error deploying wall:', error);
        toast.error('Error deploying wall');
      }
    };
  const fetchWall = async (wallName) => {
    let theWallFactoryContract = new ethers.Contract( TheWallFactoryAddress, [ { "inputs": [ { "internalType": "string", "name": "", "type": "string" } ], "name": "walls", "outputs": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "address", "name": "addr", "type": "address" }, { "internalType": "uint256", "name": "id", "type": "uint256" } ], "stateMutability": "view", "type": "function" }, ], ethersProvider)
    try {
      const wallData = await theWallFactoryContract.walls(wallName);
      console.log(wallData);
    selectWall(wallData.id);
    } catch (error) {
      console.error('Error fetching wall:', error);
      toast.error('Error fetching wall');
    }
  };
  
  const [tipModal, setTipModal] = useState(false);
  const [tipRecipient, setTipRecipient] = useState('');
  const [tipAmount, setTipAmount] = useState(0);
  const showTipModal = (recipient) => {
    setTipRecipient(recipient);
    setTipModal(true);
  }
  const handleTip = async () => {
    try {
      const signerContract = selectedWall.connect(ethersSigner);
      const tx = await signerContract.tip(tipRecipient, ethers.parseEther(tipAmount));
      toast('Sending tip...');
      await tx.wait();
      toast.success('Tip sent successfully');
      setTipModal(false);
    } catch (error) {
      console.error('Error sending tip:', error);
      toast.error('Error sending tip');
    }
  };
    const selectWall = async (wallId) => {
      try {
        const wallAddress = walls.find((wall) => wall.id === wallId).addr;
  
        setSelectedWallAddress(wallAddress);
        const wallContract = new ethers.Contract(wallAddress, TheWallABI, ethersProvider);
        setSelectedWall(wallContract);
        fetchWallTags(wallContract);
      } catch (error) {
        console.error('Error selecting wall:', error);
        toast.error('Error selecting wall');
      }
    };
    useEffect(() => {
      let interval;
      
      if (selectedWall) {
        fetchWallTags(selectedWall); // Fetch immediately on wall selection
    
        // Set interval to fetch every 60 seconds
        interval = setInterval(() => {
          fetchWallTags(selectedWall);
        }, 60000);
      }
    
      return () => clearInterval(interval); // Clear interval on component unmount or when selectedWall changes
    }, [selectedWall]);
    
    const fetchWallTags = async (wallContract) => {
      try {
        setLoading(true);
        const totalTags = await wallContract.tags();
        const last = Math.min(10, Number(totalTags));
  if (last === 0) {
          setTags([]);
          toast('No tags yet');
          return;
        }
        const [tagsArr, artistsArr, timesArr, tokensArr] = await wallContract.connect(ethersSigner).latest(last - 1);
        
  
        const formattedTags = tagsArr.map((tagContent, index) => ({
          content: tagContent,
          artist: artistsArr[index],
          timestamp: new Date(Number(timesArr[index]) * 1000).toLocaleString(),
          balance: ethers.formatEther(tokensArr[index]),
        }));
  
        setTags(formattedTags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        toast.error('Error fetching tags');
      } finally {
        setLoading(false);
      }
    };
  
    const handleMintTag = async () => {
      if (!newTag) {
        toast.error('Tag content cannot be empty');
        return;
      }
      try {
        const signerContract = selectedWall.connect(ethersSigner);
        const tx = await signerContract.mint(newTag, { value: ethers.parseEther('0') }); // Adjust value if needed
        toast('Minting tag...');
        await tx.wait();
        toast.success('Tag minted successfully');
        setNewTag('');
        fetchWallTags(selectedWall);
      } catch (error) {
        console.error('Error minting tag:', error);
        toast.error('Error minting tag');
      }
    };
  
    const renderMarkdown = (markdown) => {
      const md = new Remarkable({
        html: true,
        xhtmlOut: true,
        breaks: true,
        langPrefix: 'language-',
      });
      const html = md.render(markdown);
      return { __html: DOMPurify.sanitize(html) };
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-r from-gray-900 to-gray-800 text-white font-sans flex flex-col items-center py-10">
        <Toaster />
  
        {/* Main Container */}
        <div className="container max-w-5xl w-11/12 p-8 bg-gray-800 bg-opacity-60 backdrop-blur-lg rounded-3xl shadow-2xl text-center transition-transform transform hover:scale-105">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl text-white font-extrabold">The Wall</h1>
            <div className="mt-4">
              <ConnectButton />
            </div>
          </header>
  
          {/* Available Walls Section */}
          <section className="w-full text-center mb-8">
            <h2 className="text-xl text-white mb-4 font-bold">Available Walls</h2>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search for a wall"
                className="p-3 bg-gray-700 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out w-full max-w-md mx-auto"
                onChange={(e) => fetchWall(e.target.value)}
              />
            </div>
            <div className="flex justify-center space-x-4 mb-4">
              <button
                onClick={() => fetchWall('wall')}
                className="py-3 px-8 text-white font-semibold rounded-full bg-orange-400 hover:bg-pink-600 transition duration-300 ease-in-out"
              >
                Wall
              </button>
              <button
                onClick={() => setCreateModal(!createModal)}
                className="py-3 px-6 bg-pink-400 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
              >
                Deploy a New Wall
              </button>
            </div>
  
            <div className="text-center">
              <h3 className="text-xl text-white mb-4 font-bold">New Walls</h3>
              <div className="bg-gray-700 bg-opacity-40 backdrop-blur-lg rounded-lg shadow-lg p-2">
                {walls.length === 0 ? (
                  <p className="text-white">No walls deployed yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {walls.map((wall, index) => (
                      <button
                        key={wall.id}
                        onClick={() => selectWall(wall.id)}
                        style={{
                          backgroundColor: [
                            '#f87171',
                            '#60a5fa',
                            '#fbbf24',
                            '#34d399',
                            '#818cf8',
                          ][index % 5],
                        }}
                        className="h-20 w-full text-white font-semibold shadow-sm hover:shadow-md transition duration-300 ease-in-out rounded-full"
                        aria-label={`Select ${wall.name} Wall`}
                      >
                        {wall.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
  
          {/* Deploy Wall Modal */}
          {createModal && (
            <section className="bg-gray-700 bg-opacity-40 backdrop-blur-lg p-8 rounded-3xl shadow-2xl mb-8 w-full max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl text-pink-600 font-bold">Deploy a New Wall</h2>
              </div>
              <div className="space-y-6">
                {/* Name and Symbol */}
                <div className="flex flex-wrap -mx-2">
                  <div className="w-full sm:w-1/2 px-2 mb-4 sm:mb-0">
                    <label htmlFor="wallName" className="block mb-2 font-semibold text-white">
                      Name:
                    </label>
                    <input
                      type="text"
                      id="wallName"
                      value={newWallData.name}
                      onChange={(e) =>
                        setNewWallData({ ...newWallData, name: e.target.value })
                      }
                      className="w-full p-3 bg-pink-100 bg-opacity-30 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                      placeholder="Wall Name"
                    />
                  </div>
                  <div className="w-full sm:w-1/2 px-2">
                    <label htmlFor="wallSymbol" className="block mb-2 font-semibold text-white">
                      Symbol:
                    </label>
                    <input
                      type="text"
                      id="wallSymbol"
                      value={newWallData.symbol}
                      onChange={(e) =>
                        setNewWallData({ ...newWallData, symbol: e.target.value })
                      }
                      className="w-full p-3 bg-pink-100 bg-opacity-30 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                      placeholder="WALL"
                    />
                  </div>
                </div>
  
                {/* Price and Multi */}
                <div className="flex flex-wrap -mx-2">
                  <div className="w-full sm:w-1/2 px-2 mb-4 sm:mb-0">
                    <label htmlFor="wallPrice" className="block mb-2 font-semibold text-white">
                      Price (ETH):
                    </label>
                    <input
                      type="text"
                      id="wallPrice"
                      value={newWallData.price}
                      onChange={(e) =>
                        setNewWallData({ ...newWallData, price: e.target.value })
                      }
                      className="w-full p-3 bg-pink-100 bg-opacity-30 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                      placeholder="0.01"
                    />
                  </div>
                  <div className="w-full sm:w-1/2 px-2">
                    <label htmlFor="wallMulti" className="block mb-2 font-semibold text-white">
                      Multi:
                    </label>
                    <input
                      type="number"
                      id="wallMulti"
                      value={newWallData.multi}
                      onChange={(e) =>
                        setNewWallData({ ...newWallData, multi: e.target.value })
                      }
                      className="w-full p-3 bg-pink-100 bg-opacity-30 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                      min="1"
                    />
                  </div>
                </div>
  
                {/* Subscription, Can Moderate, Can Change */}
                <div className="flex flex-wrap -mx-2">
                  <div className="w-full sm:w-1/3 px-2 mb-4 sm:mb-0">
                    <label htmlFor="wallSubWall" className="block mb-2 font-semibold text-white">
                      Subscription Wall:
                    </label>
                    <select
                      id="wallSubWall"
                      value={newWallData.subWall}
                      onChange={(e) =>
                        setNewWallData({
                          ...newWallData,
                          subWall: e.target.value === 'true',
                        })
                      }
                      className="w-full p-3 bg-pink-100 bg-opacity-30 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                    >
                      <option value={false}>No</option>
                      <option value={true}>Yes</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-1/3 px-2 mb-4 sm:mb-0">
                    <label htmlFor="wallCanMod" className="block mb-2 font-semibold text-white">
                      Can Moderate:
                    </label>
                    <select
                      id="wallCanMod"
                      value={newWallData.canMod}
                      onChange={(e) =>
                        setNewWallData({ ...newWallData, canMod: e.target.value })
                      }
                      className="w-full p-3 bg-pink-100 bg-opacity-30 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                  <div className="w-full sm:w-1/3 px-2">
                    <label htmlFor="wallCanChange" className="block mb-2 font-semibold text-white">
                      Can Change:
                    </label>
                    <select
                      id="wallCanChange"
                      value={newWallData.canChange}
                      onChange={(e) =>
                        setNewWallData({ ...newWallData, canChange: e.target.value })
                      }
                      className="w-full p-3 bg-pink-100 bg-opacity-30 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                    >
                      <option value="0">No</option>
                      <option value="1">Yes</option>
                    </select>
                  </div>
                </div>
  
                {/* Deploy Button */}
                <button
                  onClick={handleDeployWall}
                  className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
                >
                  Deploy Wall
                </button>
              </div>
            </section>
          )}
  
          {/* Selected Wall Section */}
          {selectedWall && (
            <section className="w-full mt-2 text-center">
              <h2 className="text-2xl text-pink-500 mb-4 font-bold">
                Chat on {walls.find((wall) => wall.addr === selectedWallAddress)?.name || 'Selected Wall'}
              </h2>
              <Subscription selectedWall={selectedWall} ethersSigner={ethersSigner} userAddress={userAddress} />
  
              {/* Mint Tag Section */}
              <div className="mb-6">
                <textarea
                  id="newTag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Enter your tag..."
                  className="w-full text-gray-800 p-3 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 h-20 transition duration-300 ease-in-out bg-gray-700 bg-opacity-30 backdrop-blur-lg"
                ></textarea>
                <button
                  onClick={handleMintTag}
                  className="mt-4 px-12 py-3 bg-pink-400 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
                >
                  Mint Tag
                </button>
              </div>
  
              {/* Latest Tags */}
              <div>
                <h2 className="text-xl text-pink-500 mb-4 font-bold">Latest Tags</h2>
                {loading ? (
                  <p className="text-white">Loading tags...</p>
                ) : tags.length === 0 ? (
                  <p className="text-white">No tags yet.</p>
                ) : (
                  <div className="space-y-4">
                    {tags.map((tag, index) => (
                      <div
                        key={index}
                        className="w-full p-4 bg-gray-700 bg-opacity-40 backdrop-blur-lg rounded-full shadow-2xl mb-4"
                      >
                        <div className="flex items-center justify-between flex-wrap w-full mb-2">
                          <div className="flex-grow text-center text-white text-sm">
                            {`${tag.artist.substring(0, 20)}${tag.artist.length > 20 ? '...' : ''}`}
                          </div>
  
                          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <button
                              onClick={() => showTipModal(tag.artist)}
                              className="bg-yellow-200 text-yellow-600 px-3 py-1 rounded-full hover:bg-yellow-300 transition duration-300 ease-in-out font-semibold"
                            >
                              Tip ⭐
                            </button>
                            <div className="bg-yellow-100 rounded-full px-3 py-1 font-semibold text-yellow-600 text-xs text-center">
                              {tag.balance} {walls.find((wall) => wall.addr === selectedWallAddress)?.symbol}
                            </div>
                          </div>
                        </div>
  
                        <div className="text-white font-semibold">
                          <span dangerouslySetInnerHTML={renderMarkdown(tag.content)} />
                        </div>
                        <div className="text-gray-400 text-xs mt-2">{tag.timestamp}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
  
          {/* Tip Modal */}
          {tipModal && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-gray-700 bg-opacity-40 backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-1/2 max-w-md">
                <h2 className="text-2xl text-pink-600 font-bold mb-4 flex justify-between items-center">
                  Send Tip
                  <button
                    onClick={() => setTipModal(false)}
                    className="text-red-500 font-semibold text-xl"
                    aria-label="Close Tip Modal"
                  >
                    ✕
                  </button>
                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tipAmount" className="block mb-2 font-semibold text-white">
                      Amount (ETH):
                    </label>
                    <input
                      type="number"
                      id="tipAmount"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="w-full p-3 bg-pink-100 bg-opacity-30 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                      placeholder="0.01"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <button
                    onClick={handleTip}
                    className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
                  >
                    Send Tip
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
const Subscription = ({ selectedWall, ethersSigner, userAddress }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionFee, setSubscriptionFee] = useState(ethers.parseEther('0.01')); // Default value in case fetching fails
const [sub, setSub] = useState(0);
  useEffect(() => {
    if (selectedWall) {
      fetchSubscriptionStatus();
      fetchSubscriptionFee(); // Fetch the fee when the selected wall is set
    }
  }, [selectedWall]);

  const fetchSubscriptionStatus = async () => {
    try {
      const subscriptionStatus = await selectedWall.hasSub(userAddress);
      setIsSubscribed(subscriptionStatus > 0);
      setSub(await selectedWall.subWall()>0n&&await selectedWall.price()>0n);
    } catch (error) {
      console.error('Error checking subscription status:', error);
      toast.error('Error checking subscription status');
    }
  };

  const fetchSubscriptionFee = async () => {
    try {
      const fee = await selectedWall.price(); // Assuming the contract has a `price` variable
      setSubscriptionFee(fee);
    } catch (error) {
      console.error('Error fetching subscription fee:', error);
      toast.error('Error fetching subscription fee');
    }
  };

  const handleRenewSubscription = async () => {
    if (!selectedWall) return;
    try {
      const signerContract = selectedWall.connect(ethersSigner);
      const tx = await signerContract.renewSub(userAddress, { value: subscriptionFee });
      toast('Renewing subscription...');
      await tx.wait();
      toast.success('Subscription renewed!');
      fetchSubscriptionStatus(); // Refresh subscription status
    } catch (error) {
      console.error('Error renewing subscription:', error);
      toast.error('Error renewing subscription');
    }
  };

  return (
    <div className="text-center text-white mt-2">
      {isSubscribed && sub ? (
        <p className="bg-green-400 text-white p-2 rounded-full w-1/2 mx-auto">Subscribed</p>
      ):''} {!isSubscribed && sub ? (
        <div>
          <button
            onClick={handleRenewSubscription}
            className="px-6 py-2 bg-blue-400 text-white rounded-full hover:bg-green-600 transition duration-300 ease-in-out"
          >
            Sub for 30 days at {ethers.formatEther(subscriptionFee)} ETH
          </button>
        </div>
      ):''}
    </div>
  );
};

  
    
export default Wall;
