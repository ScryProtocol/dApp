import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { Remarkable } from 'remarkable';
import DOMPurify from 'dompurify';
import 'tailwindcss/tailwind.css';

// Contract ABI and Address
const ContractABI = [{"inputs":[{"internalType":"contract IStreamContract","name":"_streamContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"bio","type":"string"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"BlogCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":false,"internalType":"string","name":"name","type":"string"},{"indexed":false,"internalType":"string","name":"bio","type":"string"},{"indexed":false,"internalType":"address","name":"token","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"BlogUpdated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"}],"name":"PostCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"}],"name":"PostDeleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":false,"internalType":"string","name":"newContent","type":"string"}],"name":"PostEdited","type":"event"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"authorPostCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"authorPosts","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"baseURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"","type":"string"}],"name":"blogNameToAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"blogs","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"bio","type":"string"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"},{"internalType":"address","name":"blogOwner","type":"address"}],"name":"checkSubd","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"lender","type":"address"},{"internalType":"address","name":"token","type":"address"},{"internalType":"address","name":"friend","type":"address"}],"name":"computeHash","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"bio","type":"string"},{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"createBlog","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"content","type":"string"}],"name":"createPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"}],"name":"deletePost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"string","name":"newContent","type":"string"}],"name":"editPost","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"}],"name":"getPost","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"postIds","type":"uint256[]"}],"name":"getPosts","outputs":[{"components":[{"internalType":"string","name":"content","type":"string"},{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"blog","type":"string"},{"internalType":"address","name":"blogAddress","type":"address"}],"internalType":"struct blog.Post[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"postCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newURI","type":"string"}],"name":"setBaseURI","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"streamContract","outputs":[{"internalType":"contract IStreamContract","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"newName","type":"string"},{"internalType":"string","name":"newBio","type":"string"},{"internalType":"address","name":"newToken","type":"address"},{"internalType":"uint256","name":"newAmount","type":"uint256"}],"name":"updateBlog","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"viewLatestPosts","outputs":[{"components":[{"internalType":"string","name":"content","type":"string"},{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"blog","type":"string"},{"internalType":"address","name":"blogAddress","type":"address"}],"internalType":"struct blog.Post[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"}],"name":"viewPost","outputs":[{"internalType":"string","name":"","type":"string"},{"internalType":"address","name":"","type":"address"},{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]


const ContractAddress = '0xd517f696ba3d8D1809257cF734239F5Aa35DAE46';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [blogName, setBlogName] = useState('');
  const [blogBio, setBlogBio] = useState('');
  const [blogToken, setBlogToken] = useState('');
  const [blogAmount, setBlogAmount] = useState('');
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const account = useAccount();
  const userAddress = account.address;

  const contract = new ethers.Contract(ContractAddress, ContractABI, ethersProvider);

  useEffect(() => {
    if (userAddress) {
      fetchPosts();
    }
  }, [userAddress]);

  const fetchBl = async () => {
    try {
      const postCount = await contract.authorPostCount(userAddress);
      const postsFromContract = [];

      for (let i = Number(postCount)-1; i > 0; i--) {
        const postId = await contract.authorPosts(userAddress, i);
        const post = await contract.posts(postId);
        const lines = post.content.split('\n');
        const title = lines[0];
        const content = lines.slice(1).join('\n');
        postsFromContract.push({
          title: title,
          content: content,
          author: post.author,
          timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
          
        });
      }

      setPosts([...postsFromContract]); 
      console.log('Posts:', postsFromContract);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  
  const fetchPosts = async () => {
    try {
      const postCount = await contract.postCount();
      const postIds = Array.from({ length: Number(postCount) }, (v, k) => k);
      const postsFromContract = await contract.getPosts(postIds);
      
      const formattedPosts = postsFromContract.map(post => ({
        title: post.content.split('\n')[0],
        content: post.content.split('\n').slice(1).join('\n'),
        author: post.author,
        timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
        blog: post.blog,
        blogAddress: post.blogAddress,
      }));

      setPosts(formattedPosts);
      console.log('Posts:', formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  const fetchPosts1 = async () => {
    window.location.search.split('&').forEach((item) => {
      if (item.includes('blog')) {
        setBlogName(item.split('=')[1]);
console.log('Blog:', item.split('=')[1]);     }
    })
    try {
      //const postsFromContract = await contract.viewLatestPosts(userAddress, 10);
      //setPosts(postsFromContract);
      
      const postCount = await contract.postCount();
      const postsFromContract = [];

      for (let i = Number(postCount)-1; i > 0; i--) {
        const post = await contract.getPost(i);
        console.log('Post:', post);
        const lines = post.content.split('\n');
        const title = lines[0];
        const content = lines.slice(1).join('\n');
        postsFromContract.push({
          title: title,
          content: content,
          author: post.author,
          timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
        });
      }

      setPosts([...postsFromContract]); 
      console.log('Posts:', postsFromContract);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!content) return;
    try {
      const tx = await contract.createPost(content);
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
    toast.error('All fields are required')
    return;}
    try {
      let token = new ethers.Contract(blogToken, ['function decimals() view returns (uint)'], ethersProvider);

      ;
      if(await contract.blogNameToAddress(blogName)!='0x0000000000000000000000000000000000000000'){toast.error('Blog name already taken');return;}
      const tx = await contract.connect(ethersSigner).createBlog(blogName, blogBio, blogToken, ethers.parseUnits(blogAmount/3600/24/30,await token.decimals()));
      await tx.wait();
      toast.success('Blog created successfully');
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error('Error creating blog', error.reason);
    }
  };

  const renderMarkdown = (markdown) => {
    const md = new Remarkable();
    const html = md.render(markdown);
    return { __html: DOMPurify.sanitize(html) };
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto py-8">
        <h1 className="text-center text-4xl mb-8">Blog dApp</h1>
        <Toaster />
        <section className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl text-blue-400">Create a new blog</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="blogName" className="block mb-2 font-semibold text-gray-300">Blog Name:</label>
              <input
                type="text"
                id="blogName"
                value={blogName}
                onChange={(e) => setBlogName(e.target.value)}
                className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="blogBio" className="block mb-2 font-semibold text-gray-300">Blog Bio:</label>
              <textarea
                id="blogBio"
                value={blogBio}
                onChange={(e) => setBlogBio(e.target.value)}
                className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out h-20"
              ></textarea>
            </div>
            <div>
              <label htmlFor="blogToken" className="block mb-2 font-semibold text-gray-300">Blog Subscription Token Address:</label>
              <input
                type="text"
                id="blogToken"
                value={blogToken}
                placeholder='empty for no subscription needed'
                onChange={(e) => setBlogToken(e.target.value)}
                className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              />
            </div>
            <div>
              <label htmlFor="blogAmount" className="block mb-2 font-semibold text-gray-300">Subscription Cost per 30d:</label>
              <input
                type="number"
                id="blogAmount"
                value={blogAmount}
                onChange={(e) => setBlogAmount(e.target.value)}
                className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
              />
            </div>
            <button
              onClick={handleCreateBlog}
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
            >
              Create Blog
            </button>
          </div>
        </section>
        <section className="bg-gray-800 p-8 rounded-lg shadow-lg mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl text-blue-400">Create a new post</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="content" className="block mb-2 font-semibold text-gray-300">Content:</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out h-40"
              ></textarea>
            </div>
            <button
              onClick={handleCreatePost}
              className="w-full py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 transition duration-300 ease-in-out"
            >
              Create Post
            </button>
            <ConnectButton />
          </div>
        </section>
        <section className="mt-8">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg overflow-scroll">
            <h2 className="text-xl text-blue-400 mb-4">Posts</h2>
            <div className="space-y-4">
              {posts.length === 0 ? (
                <p className="text-gray-300">No posts yet.</p>
              ) : (
                posts.map((post, index) => (
                  
                  <div key={index} className="bg-gray-700 p-4 rounded-md">
                    <h3 className="text-xl font-bold text-white">{post.title}<a href={window.location+'@'+post.blog} className="text-gray-400 text-sm mt-2"> @ {post.blog}</a></h3>
                    <p className="text-gray-300 mt-2">{post.content}</p>
                     <div
                      className="text-gray-300 mt-2"
                      dangerouslySetInnerHTML={renderMarkdown(post.content)}
                    />
                                        

                    <p className="text-gray-400 text-sm mt-2">- {post.author}</p>
                    <p className="text-gray-400 text-sm">{post.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>  <section className="mt-8">
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg overflow-scroll">
            <h2 className="text-xl text-blue-400 mb-4">Posts</h2>
            <div className="space-y-4">
              {(
                posts.map((post, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-md">
                                        <p className="text-gray-200 text-m">- {post.title}</p>

                    <div
                      className="text-gray-300 mt-2"
                      dangerouslySetInnerHTML={renderMarkdown(post.content)}
                    />
                    <p className="text-gray-400 text-sm mt-2">- {post.author}</p>
                    <p className="text-gray-400 text-sm">{post.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
      <BlogView/>
    </div>
  );
};

export default App;

const BlogView = () => {
  const [blogName, setblogName] = useState('My Awesome Blog');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const contract = new ethers.Contract(ContractAddress, ContractABI, ethersProvider);

  useEffect(() => {
    fetchBl();
  }, [blogName]);

  const fetchBl = async () => {
    try {
      setLoading(true);
      let userAddress = await contract.blogNameToAddress(blogName);
      console.log('User:', userAddress);

      const postCount = await contract.authorPostCount(userAddress);
      const postIds = Array.from({ length:Number(postCount) }, (v, k) => k);
      const postsFromContract = await contract.getPosts(postIds);
      
      const formattedPosts = postsFromContract.map(post => ({
        title: post.content.split('\n')[0],
        content: post.content.split('\n').slice(1).join('\n'),
        author: post.author,
        timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
        blog: post.blog,
        blogAddress: post.blogAddress,
      }));

      setPosts(formattedPosts);
      console.log('Posts:', formattedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      toast.error('Error fetching blog posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchBl1 = async () => {
    try {
      let userAddress = await contract.blogNameToAddress(blogName);
      console.log('User:', userAddress);
      const postCount = await contract.authorPostCount( userAddress);
      const postsFromContract = [];

      for (let i = Number(postCount)-1; i > 0; i--) {
        const postId = await contract.authorPosts(userAddress, i);
        const post = await contract.getPost(postId);
        const lines = post.content.split('\n');
        const title = lines[0];
        const content = lines.slice(1).join('\n');
        postsFromContract.push({
          title: title,
          content: content,
          author: post.author,
          timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
        });
      }

      setPosts([...postsFromContract]); 
      console.log('Posts:', postsFromContract);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };
  const renderMarkdown = (markdown) => {
    const md = new Remarkable();
    const html = md.render(markdown);
    return { __html: DOMPurify.sanitize(html) };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <main className="container mx-auto py-8">
        <h1 className="text-center text-4xl mb-8">{blogName}'s Blog</h1>
        <Toaster />
        <section className="mt-8">
          
        <div className="mb-4">
          <input
            type="text"
            onChange={(e) => setblogName(e.target.value)}
            placeholder="Search Blog Name..."
            className="w-1/2 mx-auto p-3 bg-gray-700 border-none rounded-md focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out"
          />
        </div>

          <div className="bg-gray-800 p-8 rounded-lg shadow-lg overflow-scroll">
            <h2 className="text-xl text-blue-400 mb-4">Posts</h2>
            <div className="space-y-4">
              {loading ? (
                <p className="text-gray-300">Loading...</p>
              ) : posts.length === 0 ? (
                <p className="text-gray-300">No posts yet.</p>
              ) : (
                posts.map((post, index) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-md">
                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                    <div
                      className="text-gray-300 mt-2"
                      dangerouslySetInnerHTML={renderMarkdown(post.content)}
                    />
                    <p className="text-gray-400 text-sm mt-2">- {post.author}</p>
                    <p className="text-gray-400 text-sm">{post.timestamp}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
