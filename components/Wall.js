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
  
  const TheWallFactoryAddress = '0xB7Da1745DbbA72F09390491Bc0214BFf9693C279'; // Replace with your factory contract address
  
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
  
    // Initialize ethers provider and signer
    const [ethersProvider, setEthersProvider] = useState(null);
    const [ethersSigner, setEthersSigner] = useState(null);
  
    useEffect(() => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setEthersProvider(provider);
        provider.getSigner().then((signer) => {
          setEthersSigner(signer);
        });
      } else {
        toast.error('Please install MetaMask!');
      }
    }, []);
  
    useEffect(() => {
      if (ethersProvider) {
        fetchWalls();
      }
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
      <div className="min-h-screen bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 text-gray-800 overflow-hidden">
        <main 
        style={{maxWidth: '1000px'}}
        className="w-11/12 p-8 mx-auto py-8">
          <h1 className="text-center text-4xl text-white font-extrabold m-2">The Wall</h1>
          <div className="flex align-center justify-center items-center text-center">
            <div className="text-center mx-auto p-4 rounded-full align-center justify-center items-center ">
          <ConnectButton className="text-center mx-auto p-4 rounded-full"/>
          </div>
          </div>
          <Toaster />
          
          <section className="w-full text-center justify-center items-center">
            <div>
              <h2 className="text-xl text-white mb-2 font-bold">Available Walls</h2>
              <div className="text-center mb-2">
                  <input type="text" placeholder="Search for a wall" className="p-3 bg-white border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out" onChange={(e) => fetchWall(e.target.value)} />
          </div>
          <button onClick={() => fetchWall('wall')} className="mb-2 py-3 px-8 text-white font-semibold rounded-full bg-orange-400 hover:bg-pink-600 transition duration-300 ease-in-out">Wall</button>
            <button
              onClick={() => setCreateModal(!createModal)}
              className=" mx-2 py-3 px-6 bg-pink-400 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
            >
              Deploy a New Wall
            </button><div className="text-center">
  <h2 className="text-xl text-white mb-4 font-bold">New Walls</h2>
</div>
<div
  style={{ backgroundColor: '#ffffff20', padding: '.2rem' }}
  className="bg-white rounded-lg shadow-lg"
>
  {walls.length === 0 ? (
    <p className="text-gray-800">No walls deployed yet.</p>
  ) : (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0.5">
      {walls.map((wall, index) => (
        <button
          key={index}
          onClick={() => selectWall(wall.id)}
          style={{
            backgroundColor: [
              "#f87171",
              "#60a5fa",
              "#fbbf24",
              "#34d399",
              "#818cf8",
            ][index % 5],
          }}
          className="h-20 w-full text-white font-semibold shadow-sm hover:shadow-md transition duration-300 ease-in-out"
        >
          {wall.name}
        </button>
      ))}
    </div>
  )}
</div>

            </div>
              <div className="text-center mb-2">
          </div>
          </section>
  
          {createModal&&(
  <section className="bg-white p-8 rounded-3xl shadow-2xl mb-8 w-full mx-2">
            <div className="text-center mb-8">
              <h2 className="text-2xl text-pink-600 font-bold">Deploy a New Wall</h2>
            </div>
            <div className="space-y-6">
              <div className="flex flex-wrap -mx-2">
                <div className="w-full sm:w-1/2 px-2">
                  <label htmlFor="wallName" className="block mb-2 font-semibold text-gray-600">
                    Name:
                  </label>
                  <input
                    type="text"
                    id="wallName"
                    value={newWallData.name}
                    onChange={(e) => setNewWallData({ ...newWallData, name: e.target.value })}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
                <div className="w-full sm:w-1/2 px-2">
                  <label htmlFor="wallSymbol" className="block mb-2 font-semibold text-gray-600">
                    Symbol:
                  </label>
                  <input
                    type="text"
                    id="wallSymbol"
                    value={newWallData.symbol}
                    onChange={(e) => setNewWallData({ ...newWallData, symbol: e.target.value })}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
              </div>
              <div className="flex flex-wrap -mx-2">
                <div className="w-full sm:w-1/2 px-2">
                  <label htmlFor="wallPrice" className="block mb-2 font-semibold text-gray-600">
                    Price (ETH):
                  </label>
                  <input
                    type="text"
                    id="wallPrice"
                    value={newWallData.price}
                    onChange={(e) => setNewWallData({ ...newWallData, price: e.target.value })}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
                <div className="w-full sm:w-1/2 px-2">
                  <label htmlFor="wallMulti" className="block mb-2 font-semibold text-gray-600">
                    Multi:
                  </label>
                  <input
                    type="number"
                    id="wallMulti"
                    value={newWallData.multi}
                    onChange={(e) => setNewWallData({ ...newWallData, multi: e.target.value })}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
              </div>
              <div className="flex flex-wrap -mx-2">
                <div className="w-full sm:w-1/3 px-2">
                  <label htmlFor="wallSubWall" className="block mb-2 font-semibold text-gray-600">
                    Subscription Wall:
                  </label>
                  <select
                    id="wallSubWall"
                    value={newWallData.subWall}
                    onChange={(e) =>
                      setNewWallData({ ...newWallData, subWall: e.target.value === 'true' })
                    }
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  >
                    <option value={false}>No</option>
                    <option value={true}>Yes</option>
                  </select>
                </div>
                <div className="w-full sm:w-1/3 px-2">
                  <label htmlFor="wallCanMod" className="block mb-2 font-semibold text-gray-600">
                    Can Moderate:
                  </label>
                  <select
                    id="wallCanMod"
                    value={newWallData.canMod}
                    onChange={(e) => setNewWallData({ ...newWallData, canMod: e.target.value })}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
                <div className="w-full sm:w-1/3 px-2">
                  <label htmlFor="wallCanChange" className="block mb-2 font-semibold text-gray-600">
                    Can Change:
                  </label>
                  <select
                    id="wallCanChange"
                    value={newWallData.canChange}
                    onChange={(e) => setNewWallData({ ...newWallData, canChange: e.target.value })}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  >
                    <option value="0">No</option>
                    <option value="1">Yes</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleDeployWall}
                className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
              >
                Deploy Wall
              </button>
            </div>
          </section>
          )}
          {selectedWall && (
            <section className="w-full mt-2 text-center justify-center items-center text-white">
              <h2 className="text-2xl text-white mb-2 font-bold">
                Chat on {walls.find((wall) => wall.addr === selectedWallAddress).name}
              </h2>
              <Subscription selectedWall={selectedWall} ethersSigner={ethersSigner} userAddress={userAddress} />
              <div className="3xl mb-2 w-full mx-2">
                <div className="text-center mb-4">
                </div>
                <div className="space-y-2">
                  <div>
                    <textarea
                      id="newTag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Enter your tag..."
                      style={{backgroundColor: '#ffffff50'}}
                      className="w-full text-gray-800 p-3 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 h-20 transition duration-300 ease-in-out"
                    ></textarea>
                  </div>
                  <button
                    onClick={handleMintTag}
                    className="px-12 py-3 bg-pink-400 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
                  >
                    Mint Tag
                  </button>
                </div>
              </div>
  
              <div>
                <h2 className="text-xl text-pink- mb-4 font-bold">Latest Tags</h2>
                {loading ? (
                  <p className="text-gray-800">Loading tags...</p>
                ) : tags.length === 0 ? (
                  <p className="text-gray-800">No tags yet.</p>
                ) : (
                  <div className="space-y-4">
                    {tags.map((tag, index) => (
                  
  <div
  key={index}
  style={{backgroundColor: '#ffffff'}}
  className=" w-full p-4 rounded-full shadow-2xl mb-4"
><div className="flex items-center justify-between flex-wrap w-full">
  <div className={`${window.innerWidth > 700 ? 'relative left-12': ''} flex-grow text-center text-gray-500 text-sm mt-2 sm:mt-0`}>
    {tag.artist.substr(0, window.innerWidth < 700 ? 20 : 40)}
  </div>

  <div className="flex w-full sm:w-auto items-center justify-center sm:justify-end space-x-2 mt-2 sm:mt-0">
    <span className="text-yellow-400">
      <button onClick={() => showTipModal(tag.artist)} className="bg-yellow-200 text-yellow-600 mx-2 px-2 rounded-full hover:bg-yellow-300 transition duration-300 ease-in-out font-semibold"> Tip </button>
        ⭐</span>
    <div className="bg-yellow-100 rounded-full px-3 py-1 font-semibold text-yellow-600 text-xs text-center">
      {tag.balance} {walls.find((wall) => wall.addr === selectedWallAddress)?.symbol}
    </div>
  </div>
</div>

  <div className="text-gray-700 font-semibold">
    <span dangerouslySetInnerHTML={renderMarkdown(tag.content)} />
  </div>
  <div className="text-gray-500 text-xs">{tag.timestamp}</div>
</div>  ))}
                  </div>
                )}
              </div>
            </section>
          )}
          {tipModal && (
            <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center" onClick={() => setTipModal(false)}>
              <div className="bg-white p-8 rounded-3xl shadow-2xl w-1/2">
                <h2 className="text-2xl text-pink-600 font-bold mb-4">Send Tip <button onClick={() => setTipModal(false)} className="float-right top-0 text-red-500 font-semibold">✕</button>

                </h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tipAmount" className="block mb-2 font-semibold text-gray-600">
                      Amount:
                    </label>
                    <input
                      type="text"
                      id="tipAmount"
                      value={tipAmount}
                      onChange={(e) => setTipAmount(e.target.value)}
                      className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
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
          </main>
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
