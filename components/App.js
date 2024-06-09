import React, { useState, useEffect } from 'react';
import { N, ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { Remarkable } from 'remarkable';
import DOMPurify from 'dompurify';
import 'tailwindcss/tailwind.css';
import { http, createConfig } from '@wagmi/core';
import { base, holesky, mainnet, optimism, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const config = getDefaultConfig({
  chains: [mainnet, sepolia, holesky, base, optimism],
  projectId: '97d417268e5bd5a42151f0329e544898',

  transports: {
    [mainnet.id]: http(),
    [holesky.id]: http(),
    [base.id]: http(),
    [optimism.id]: http(),
    [mainnet.id]: http(),
  },
});

// Contract ABI and Address
const ContractABI = [ {"inputs":[{"internalType":"contract IStreamContract","name":"_streamContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"bio","type":"string"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"BlogCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"bio","type":"string"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"BlogUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"}],"name":"PostCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"}],"name":"PostDeleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":false,"internalType":"string","name":"newContent","type":"string"}],"name":"PostEdited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"blog","type":"address"}],"name":"likedPost","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":true,"internalType":"address","name":"blog","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"tippedPost","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"authorPostCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"authorPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"blogNameToAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"blogs","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"bio","type":"string"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"blogOwner","type":"address"}],"name":"checkSubd","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"lender","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"friend","type":"address"}],"name":"computeHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"bio","type":"string"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"createBlog","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"}],"name":"deletePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"string","name":"newContent","type":"string"}],"name":"editPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"}],"name":"getPost","outputs":[{"components":[{"internalType":"string","name":"content","type":"string"},{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"blog","type":"string"},{"internalType":"address","name":"blogAddress","type":"address"},{"internalType":"uint256","name":"tips","type":"uint256"},{"internalType":"uint256","name":"likes","type":"uint256"}],"internalType":"struct blog.Post","name":"","type":"tuple"},{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"postIds","type":"uint256[]"}],"name":"getPosts","outputs":[{"components":[{"internalType":"string","name":"content","type":"string"},{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"blog","type":"string"},{"internalType":"address","name":"blogAddress","type":"address"},{"internalType":"uint256","name":"tips","type":"uint256"},{"internalType":"uint256","name":"likes","type":"uint256"}],"internalType":"struct blog.Post[]","name":"","type":"tuple[]"},{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"}],"name":"likePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"liked","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"postCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newURI","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"streamContract","outputs":[{"internalType":"contract IStreamContract","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"tipPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"},{"internalType":"string","name":"newBio","type":"string"},{"internalType":"address","name":"newToken","type":"address"},{"internalType":"uint256","name":"newAmount","type":"uint256"}],"name":"updateBlog","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"viewLatestPosts","outputs":[{"components":[{"internalType":"string","name":"content","type":"string"},{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"blog","type":"string"},{"internalType":"address","name":"blogAddress","type":"address"},{"internalType":"uint256","name":"tips","type":"uint256"},{"internalType":"uint256","name":"likes","type":"uint256"}],"internalType":"struct blog.Post[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"}],"name":"viewPost","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}];
const ContractAddress = '0x0Ecba58726ad8959cf2004725DA08c94848A4129';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [blogName, setBlogName] = useState('');
  const [blogBio, setBlogBio] = useState('');
  const [blogToken, setBlogToken] = useState('');
  const [blogAmount, setBlogAmount] = useState('');
  const [tipping, setTipping] = useState(false);
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const account = useAccount();
  const userAddress = account.address;

  const contract = new ethers.Contract(ContractAddress, ContractABI, ethersProvider);

  useEffect(() => {
    if (userAddress) {
      const queryParams = new URLSearchParams(window.location.search);
      const extractedBlogName = queryParams.get('blog');
      console.log('Extracted Blog:', extractedBlogName);
      if (extractedBlogName) {
        setBlogName(extractedBlogName);
      }
      fetchPosts();
    }
  }, [userAddress]);

  const fetchPosts = async () => {
    try {
      const postCount = await contract.postCount();
      const postIds = Array.from({ length: Number(postCount) }, (v, k) => k);
      const [postsFromContract, likedStatuses] = await contract.getPosts(postIds);

      const formattedPosts = postsFromContract.map((post, index) => ({
        title: post.content.split('\n')[0],
        content: post.content.split('\n').slice(1).join('\n'),
        author: post.author,
        timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
        blog: post.blog,
        blogAddress: post.blogAddress,
        likes: Number(post.likes),
        liked: likedStatuses[index],
        tips: Number(ethers.formatUnits(post.tips.toString(), 18)),
      }));

      setPosts(formattedPosts);
      console.log('Posts:', formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!content) return;
    try {
      const tx = await contract.connect(ethersSigner).createPost(content);
      await tx.wait();
      toast.success('Post created successfully');
      fetchPosts();
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Error creating post');
    }
  };

  const handleCreateBlog = async () => {
    if (!blogName || !blogBio || !blogAmount) {
      toast.error('All fields are required');
      return;
    }
    try {
      const token = new ethers.Contract(blogToken || '0x94373a4919b3240d86ea41593d5eba789fef3848', ['function decimals() view returns (uint)'], ethersProvider);
      const blogAddress = await contract.blogNameToAddress(blogName);
      if (blogAddress !== '0x0000000000000000000000000000000000000000') {
        toast.error('Blog name already taken');
        return;
      }
      const tx = await contract.connect(ethersSigner).createBlog(
        blogName, 
        blogBio, 
        blogToken || '0x94373a4919b3240d86ea41593d5eba789fef3848', 
        ethers.parseUnits((blogAmount / 3600 / 24 / 30).toFixed().toString(), await token.decimals())
      );
      await tx.wait();
      toast.success('Blog created successfully');
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Error creating blog');
    }
  };

  const tipPost = async (postId, amount) => {
    const ERC20_ABI = [
      "function approve(address spender, uint256 amount) external returns (bool)",
      "function allowance(address owner, address spender) view returns (uint256)",
      "function decimals() view returns (uint8)",
    ];

    if (amount <= 0) {
      toast.error("Tip amount must be greater than zero.");
      return;
    }

    try {
      const blogToken = (await contract.blogs(await contract.blogNameToAddress(tipping[1]))).token;
      const token = new ethers.Contract(blogToken, ERC20_ABI, ethersSigner);
      const decimals = await token.decimals();
      const tipAmount = ethers.parseUnits(amount.toString(), decimals);
      const allowance = await token.allowance(userAddress, ContractAddress);

      if (allowance<(tipAmount)) {
        const approveTx = await token.approve(ContractAddress, tipAmount);
        await approveTx.wait();
      }

      const tx = await contract.connect(ethersSigner).tipPost(tipping[0], tipAmount);
      await tx.wait();
      toast.success("Post tipped successfully!");
      fetchPosts();
    } catch (error) {
      console.error("Error tipping post:", error);
      toast.error("Error tipping post");
    }
  };

  const likePost = async (postId) => {
    try {
      const tx = await contract.connect(ethersSigner).likePost(postId);
      await tx.wait();
      toast.success('Post liked successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Error liking post');
    }
  };

  const renderMarkdown = (markdown) => {
    const md = new Remarkable();
    const html = md.render(markdown);
    return { __html: DOMPurify.sanitize(html) };
  };
  const borderColors = ['blue', 'green', 'red', '#f0f', 'orange'];

  const renderContentWithImages = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+(?:\.jpg|\.jpeg|\.png|\.gif))/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return <img key={index} src={part} alt="Embedded" className="my-4 max-w-full h-auto mx-auto" />;
      } else {
        return <span key={index} dangerouslySetInnerHTML={renderMarkdown(part)} />;
      }
    });
  };
  return (
      <div className="min-h-screen bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 text-gray-800">
        <main className="container mx-auto py-8">
          <h1 className="text-center text-4xl mb-8 text-white font-extrabold">feed</h1>
          <Toaster />
          <BlogView likePost={likePost} tipPost={tipPost} setTipping={setTipping} />

          <div className="flex flex-wrap -mx-2 mb-8">
            <section className="bg-white p-8 rounded-3xl shadow-2xl mb-8 w-full sm:w-1/5 mx-2">
              <div className="text-center mb-8">
                <h2 className="text-2xl text-pink-600 font-bold">Create a new blog</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="blogName" className="block mb-2 font-semibold text-gray-600">Blog Name:</label>
                  <input
                    type="text"
                    id="blogName"
                    value={blogName}
                    onChange={(e) => setBlogName(e.target.value)}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
                <div>
                  <label htmlFor="blogBio" className="block mb-2 font-semibold text-gray-600">Blog Bio:</label>
                  <textarea
                    id="blogBio"
                    value={blogBio}
                    onChange={(e) => setBlogBio(e.target.value)}
                    className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out h-20"
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="blogToken" className="block mb-2 font-semibold text-gray-600">Blog Subscription Token Address:</label>
                  <input
                    type="text"
                    id="blogToken"
                    value={blogToken}
                    placeholder="empty for no subscription needed"
                    onChange={(e) => setBlogToken(e.target.value)}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
                <div>
                  <label htmlFor="blogAmount" className="block mb-2 font-semibold text-gray-600">Subscription Cost per 30d:</label>
                  <input
                    type="number"
                    id="blogAmount"
                    value={blogAmount}
                    onChange={(e) => setBlogAmount(e.target.value)}
                    className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                </div>
                <button
                  onClick={handleCreateBlog}
                  className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
                >
                  Create Blog
                </button>
              </div>
            </section>
            <section className="bg-white p-8 rounded-3xl shadow-2xl mb-8 w-full sm:w-3/4 mx-2">
              <div className="text-center mb-8">
                <h2 className="text-2xl text-pink-600 font-bold">Create a new post</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="content" className="block mb-2 font-semibold text-gray-600">Content:</label>
                  <textarea
                    id="content"
                    value={content}
                    placeholder={`Title\nContent...`}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  ></textarea>
                </div>
                <button
                  onClick={handleCreatePost}
                  className="w-full py-3 bg-pink-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out"
                >
                  Create Post
                </button>
                <ConnectButton className="w-full py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 transition duration-300 ease-in-out" />
              </div>
            </section>
          </div>
          <section className="w-full">
            <div>
              <h2 className="text-xl text-pink-600 mb-4 font-bold">Latest Posts</h2>
              <div className="space-y-4">
                {posts.length === 0 ? (
                  <p className="text-gray-800">No posts yet.</p>
                ) : (
                  posts.slice().reverse().map((post, index) => (
                    post.title !== 'subscribe to view post' ? (
                      <div key={index} className="bg-white p-6 rounded-3xl border-l-8 border-blue-500 shadow-md" style={{ borderColor: borderColors[index % borderColors.length] }}>
                        <h3 className="text-xl font-bold text-gray-800">{post.title}<a href={`https://feed.spot.pizza/?blog=${post.blog}`} className="text-gray-500 text-sm ml-2">@ {post.blog}</a></h3>
                        {//<div className="text-gray-600 mt-2" dangerouslySetInnerHTML={renderMarkdown(post.content)}/>
                        }
                                                                  <div className="text-gray-600 mt-2">{renderContentWithImages(post.content)}</div>

                        <p className="text-gray-500 text-sm mt-2">- {post.author}</p>
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-gray-500 text-sm">{post.timestamp}</p>
                          <div className="flex space-x-4">
                            {post.liked ? (<button className="text-sm text-red-500 rounded-full bg-red-100 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out" onClick={() => likePost(index)}>♡ {post.likes}</button>
                            )
                            :(<button className="text-sm text-gray-500 rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out" onClick={() => likePost(index)}>♡ {post.likes}</button>
                            )}<button className="text-sm text-blue-500 rounded-full bg-blue-200 px-3 py-1 hover:bg-blue-300 transition duration-300 ease-in-out" onClick={() => setTipping([index, post.blog])}>$ {post.tips} tips</button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div key={index} className="bg-pink-200 p-6 rounded-3xl border-l-8 border-green-500 shadow-md">
                        <h3 className="text-xl font-bold text-gray-800"><a href={`${window.location}@${post.blog}`}>Subscribe to view post @ {post.blog}</a></h3>
                        <p className="text-gray-500 text-sm mt-2">- {post.author}</p>
                        <p className="text-gray-500 text-sm">{post.timestamp}</p>
                        <a href={`https://feed.spot.pizza/${post.blog}`}><button className="w-full py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300 ease-in-out mt-4">Subscribe to blog</button></a>
                      </div>
                    )
                  ))
                )}
              </div>
            </div>
          </section>
        </main>
        {tipping && (
          <TipModal
            isOpen={tipping}
            onClose={() => setTipping(false)}
            onTip={(amount) => tipPost(tipping[0], amount)}
            tipping={tipping}
          />
        )}
      </div>
  );
};

const BlogView = ({ likePost, tipPost, setTipping }) => {
  const [blogName, setBlogName] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState(false);
  const ethersProvider = useEthersProvider();
  const contract = new ethers.Contract(ContractAddress, ContractABI, ethersProvider);
  let useAddress = useAccount().address
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    let extractedBlogName = queryParams.get('blog');
    if (!blogName) {
      setBlogName(extractedBlogName);
      console.log('Extracted Blog:', extractedBlogName);
    }
    else if (!blogName) {
      setBlog(useAddress);
      console.log('Blog:', useAddress);
    }
    console.log('Blog:', blog);
    fetchBlogPosts(extractedBlogName);
  }, []);
  useEffect(() => {
    if(blogName){
    fetchBlogPosts(blogName);}
  }, [blogName]);

  const fetchBlogPosts = async (extractedBlogName) => {
    try {
      setLoading(true);
      let userAddress
      let blogN = (await contract.blogs(useAddress)).name
      console.log('Blog:', blogN,'t',blogName);
       userAddress = await contract.blogNameToAddress(!extractedBlogName?blogN:extractedBlogName);
       if(!extractedBlogName){
          setBlogName(blogN)}
    console.log('User Address: ', userAddress);
      setBlog(await contract.blogs(userAddress));
      const token = new ethers.Contract((await contract.blogs(userAddress)).token, ['function decimals() view returns (uint)'], ethersProvider);
      const decimals = await token.decimals();
      const postCount = await contract.authorPostCount(userAddress);
      let postIds = Array.from({ length: Number(postCount) }, (v, k) => k);
      let multicallContract = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', ['function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'], ethersProvider);
      const calls = postIds.map(id => ({
        target: ContractAddress,
        callData: contract.interface.encodeFunctionData('authorPosts', [userAddress, id]),
      }));

      const { returnData } = await multicallContract.aggregate(calls);
      postIds = returnData.map(data => contract.interface.decodeFunctionResult('authorPosts', data)[0]);

      const [postsFromContract, likedStatuses] = await contract.getPosts(postIds);
console.log('Posts:', postsFromContract[0]);
      const formattedPosts = postsFromContract.map((post, index) => ({
        title: post.content.split('\n')[0],
        content: post.content.split('\n').slice(1).join('\n'),
        author: post.author,
        timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
        blog: post.blog,
        blogAddress: post.blogAddress,
        likes: Number(post.likes),
        liked: likedStatuses[index],
        tips: Number(ethers.formatUnits(post.tips.toString(), decimals)),
        decimals: decimals,
      }));

      setPosts(formattedPosts);
    } catch (error) {
    //  toast.error('Error fetching blog posts');
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };
  const borderColors = ['blue', 'green', 'red', '#f0f', 'orange'];

  const renderContentWithImages = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+(?:\.jpg|\.jpeg|\.png|\.gif))/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return <img key={index} src={part} alt="Embedded" className="my-4 max-w-full h-auto  mx-auto" />;
      } else {
        return <span key={index} dangerouslySetInnerHTML={renderMarkdown(part)} />;
      }
    });
  };
  const renderMarkdown = (markdown) => {
    const md = new Remarkable();
    const html = md.render(markdown);
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <div className="">
      <main className="container mx-auto py-8">
        <h1 className="text-center text-4xl mb-2 text-gray-700 font-extrabold">{blogName ? `${blogName}'s Blog` : 'Blog View'}</h1>
        <button onClick={() => {
    navigator.clipboard.writeText(window.location.protocol+'://'+window.location.host+'/?blog='+blogName);toast.success('Link copied :)') }}className="flex mx-auto center text-sm text-white rounded-full bg-blue-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out">Copy link</button>
        <Toaster />
        <section className="mt-4">
          <div className="mb-4 flex justify-center">
            <input
              type="text"
              onChange={(e) => setBlogName(e.target.value)}
              placeholder="Search Blog Name..."
              className="w-1/2 p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
            />
          </div>
          {posts[0] && blog && posts[0].title === 'subscribe to view post' && (
            <a href={`https://sub.spot.pizza/?token=${blog.token}&subscribe=${posts[0].blogAddress}&amount=${ethers.formatUnits((Number(blog.amount) * 604800).toString(),posts[0].decimals)}&window=604800&once=false&network=8453`}>
              <button className="w-1/2 mx-auto block py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300 ease-in-out">
                Subscribe to blog
              </button>
            </a>
          )}
          <div className="">
            <h2 className="text-xl text-pink-600 mb-4 font-bold">Posts</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-800 bg-pink-200 p-6 rounded-3xl border-l-8 border-green-500 shadow-md">Loading...</p>
              ) : posts.length === 0 ? (
                <div  className="bg-white p-6 rounded-3xl border-l-8 shadow-md">

                <p className="text-gray-800">No posts yet.</p>
                </div>
              ) : (
                posts.slice().reverse().map((post, index) => (
                  post.title !== 'subscribe to view post' ? (
                    <div key={index} className="bg-white p-6 rounded-3xl border-l-8 shadow-md" style={{ borderColor: borderColors[index % borderColors.length] }}>
                      <h3 className="text-xl font-bold text-gray-800">{post.title}<a href={`${window.location}?blog=${post.blog}`} className="text-gray-500 text-sm ml-2">@ {post.blog}</a></h3>
                      {//<div className="text-gray-600 mt-2"dangerouslySetInnerHTML={renderMarkdown(post.content)}/>
}
<div className="text-gray-600 mt-2">{renderContentWithImages(post.content)}</div>

                      <p className="text-gray-500 text-sm mt-2">- {post.author}</p>
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-gray-500 text-sm">{post.timestamp}</p>
                        <div className="flex space-x-4">
                        {post.liked ? (<button className="text-sm text-red-500 rounded-full bg-red-100 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out" onClick={() => likePost(index)}>♡ {post.likes}</button>
                            )
                            :(
                          <button className="text-sm text-gray-500 rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out" onClick={() => likePost(index)}>♡ {post.likes}</button>
                        )}<button className="text-sm text-blue-500 rounded-full bg-blue-200 px-3 py-1 hover:bg-blue-300 transition duration-300 ease-in-out" onClick={() => setTipping([index, post.blog])}>$ {post.tips} tips</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={index} className="bg-pink-200 p-6 rounded-3xl border-l-8 border-green-500 shadow-md">
                      <h3 className="text-xl font-bold text-gray-800"><a href={`${window.location}@${post.blog}`}>Subscribe to view post @ {post.blog}</a></h3>
                      <p className="text-gray-500 text-sm mt-2">- {post.author}</p>
                      <p className="text-gray-500 text-sm">{post.timestamp}</p>
                      <a href={`https://sub.spot.pizza/?token=${blog.token}&subscribe=${posts[0].blogAddress}&amount=${ethers.formatUnits((Number(blog.amount) * 604800).toString(), posts[0].decimals )}&window=604800&once=false&network=8453${post.blog}`}><button className="w-full py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300 ease-in-out mt-4">Subscribe to blog</button></a>
                    </div>
                  )
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const TipModal = ({ isOpen, onClose, onTip,tipping }) => {
  const [amount, setAmount] = useState('');
const [symbol, setSymbol] = useState('');
  const ethersProvider = useEthersProvider();
  if (!isOpen) return null;
useEffect(() => {
    getSymbol();
  }, []);
  const handleTip = () => {
    onTip(amount);
    setAmount('');
    onClose();
  };
  async function getSymbol() {
    const contract = new ethers.Contract(ContractAddress, ContractABI, ethersProvider);
    let blogToken = (await contract.blogs(await contract.blogNameToAddress(tipping[1]))).token;
    const token = new ethers.Contract(blogToken, ['function symbol() view returns (string)'], ethersProvider);

    const symbol = await token.symbol();
    setSymbol(symbol);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className=" bg-white p-8 rounded-3xl shadow-2xl">
        <h2 className="text-2xl text-pink-600 font-bold mb-4">Tip Post</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="tipAmount" className="block mb-2 font-semibold text-gray-600">Tip Amount in {symbol}:</label>
            <input
              type="number"
              id="tipAmount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="py-2 px-4 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition duration-300 ease-in-out"
            >
              Cancel
            </button>
            <button
              onClick={handleTip}
              className="py-2 px-4 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300 ease-in-out"
            >
              Tip
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
