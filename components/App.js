import React, { useState, useEffect,useCallback } from 'react';
import { N, ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEthersProvider, useEthersSigner } from './tl';
import { useAccount, useChainId,useConnect } from 'wagmi';
import 'tailwindcss/tailwind.css';
import { Remarkable } from 'remarkable';
import DOMPurify from 'dompurify';
import 'tailwindcss/tailwind.css';
import { readContract } from '@wagmi/core';

import { http, createConfig } from '@wagmi/core';
import { base, holesky, mainnet, optimism, sepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { useCapabilities,useWriteContracts } from 'wagmi/experimental'

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
const ContractAddress = '0xdd528829749d6a4656d84cddbdc65e7dc5b350a7'//'0x5dcaC8c556D861E45A562C4c4AF7814FDEDEdFBF';
const BlogContractABI = ContractABI;
const CommentsContractABI = [{"inputs":[{"internalType":"address","name":"_blogContract","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"commentId","type":"uint256"},{"indexed":true,"internalType":"address","name":"author","type":"address"},{"indexed":false,"internalType":"string","name":"content","type":"string"}],"name":"CommentCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"commentId","type":"uint256"}],"name":"CommentDeleted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"commentId","type":"uint256"},{"indexed":false,"internalType":"string","name":"newContent","type":"string"}],"name":"CommentEdited","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"commentId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"}],"name":"LikedComment","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"postId","type":"uint256"},{"indexed":true,"internalType":"uint256","name":"commentId","type":"uint256"},{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"address","name":"token","type":"address"}],"name":"TippedComment","type":"event"},{"inputs":[],"name":"blogContract","outputs":[{"internalType":"contract IBlog","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"comments","outputs":[{"internalType":"string","name":"content","type":"string"},{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"tips","type":"uint256"},{"internalType":"uint256","name":"likes","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"string","name":"content","type":"string"}],"name":"createComment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"uint256","name":"commentId","type":"uint256"}],"name":"deleteComment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"uint256","name":"commentId","type":"uint256"},{"internalType":"string","name":"newContent","type":"string"}],"name":"editComment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256[]","name":"postIds","type":"uint256[]"}],"name":"getCommentCounts","outputs":[{"internalType":"uint256[]","name":"","type":"uint256[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"uint256","name":"commentId","type":"uint256"}],"name":"likeComment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"address","name":"","type":"address"}],"name":"likedComments","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"postCommentCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"uint256","name":"commentId","type":"uint256"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"tipComment","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"postId","type":"uint256"},{"internalType":"uint256","name":"limit","type":"uint256"}],"name":"viewComments","outputs":[{"components":[{"internalType":"string","name":"content","type":"string"},{"internalType":"address","name":"author","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"tips","type":"uint256"},{"internalType":"uint256","name":"likes","type":"uint256"}],"internalType":"struct Comments.Comment[]","name":"","type":"tuple[]"},{"internalType":"bool[]","name":"","type":"bool[]"}],"stateMutability":"view","type":"function"}];
const BlogContractAddress = '0x5dcaC8c556D861E45A562C4c4AF7814FDEDEdFBF';
const CommentsContractAddress = '0x53020d48B612f5b1CD1C8017abd4dB855e98B10a';

const App = () => {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [blogName, setBlogName] = useState('');
  const [blogBio, setBlogBio] = useState('');
  const [blogToken, setBlogToken] = useState('');
  const [blogAmount, setBlogAmount] = useState('0');
  const [tipping, setTipping] = useState(false);
  const [comments, setComments] = useState({});
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const account = useAccount();
  const userAddress = account.address;
  let chain = useChainId();
  const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: () => fetchPosts() },
  });
  const { data: capabilities } = useCapabilities();
  const contract = new ethers.Contract(chain == 17000 ? ContractAddress : '0xdd528829749d6a4656d84cddbdc65e7dc5b350a7', ContractABI, ethersProvider);
  const commentsContract = new ethers.Contract(CommentsContractAddress, CommentsContractABI, ethersProvider);

  useEffect(() => {
    if (userAddress) {
      const queryParams = new URLSearchParams(window.location.search);
      const extractedBlogName = queryParams.get('blog');
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

      const [postsFromContract, likedStatuses] = await readContract(config, {
        address: ContractAddress,
        abi: ContractABI,
        functionName: 'getPosts',
        args: [postIds],
        account: userAddress,
      });

      const commentCounts = await commentsContract.getCommentCounts(postIds);

      const formattedPosts = postsFromContract.map((post, index) => ({
        title: post.content.split('\n')[0],
        content: post.content.split('\n').slice(1).join('\n').trim().substring(0, 2000) + (post.content.length > 2000 ? '... View more on ' + post.blog + 's blog' : ''),
        author: post.author,
        timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
        blog: post.blog,
        blogAddress: post.blogAddress,
        likes: Number(post.likes),
        liked: likedStatuses[index],
        id: postIds[index],
        tips: Number(ethers.formatUnits(post.tips.toString(), post.tips.toString().length > 12 ? 18 : 6)),
        commentCount: Number(commentCounts[index]),
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const limit = 10;
      const [commentsFromContract, likedStatuses] = await commentsContract.viewComments(postId, limit);

      const formattedComments = commentsFromContract.map((comment, index) => ({
        content: comment.content,
        author: comment.author,
        timestamp: new Date(Number(comment.timestamp) * 1000).toLocaleString(),
        likes: Number(comment.likes),
        tips: Number(comment.tips),
        liked: likedStatuses[index],
        id: index,
      }));

      setComments(prevComments => ({ ...prevComments, [postId]: formattedComments }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreateComment = async (postId, commentContent) => {
    try {
  
        if (capabilities) {
          writeContracts({
            contracts: [{
              address: CommentsContractAddress,
              abi: CommentsContractABI,
              functionName: 'createComment',
              args: [postId,content],
            }],
            capabilities: {
              paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
            },
          });
        toast.success('Comment created successfully');
        fetchComments(postId);
  
        } else {
      const tx = await commentsContract.connect(ethersSigner).createComment(postId, commentContent);
      await tx.wait();
      toast.success('Comment created successfully');
      fetchComments(postId);
    }} catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Error creating comment');
    }
  };

  const handleTipComment = async (postId, commentId, amount) => {
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
      const blogToken = (await contract.blogs(await contract.blogNameToAddress(tipping[1].toLowerCase()))).token;
      const token = new ethers.Contract(blogToken, ERC20_ABI, ethersSigner);
      const decimals = await token.decimals();
      const tipAmount = ethers.parseUnits(amount.toString(), decimals);
      const allowance = await token.allowance(userAddress, CommentsContractAddress);

      if (allowance < tipAmount) {
        const approveTx = await token.approve(CommentsContractAddress, '1000000000000000000000000000');
        await approveTx.wait();
      }

      const tx = await commentsContract.connect(ethersSigner).tipComment(postId, commentId, tipAmount);
      await tx.wait();
      toast.success("Comment tipped successfully!");
      fetchComments(postId);
    } catch (error) {
      console.error("Error tipping comment:", error);
      toast.error("Error tipping comment");
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      const tx = await commentsContract.connect(ethersSigner).likeComment(postId, commentId);
      await tx.wait();
      toast.success('Comment liked successfully');
      fetchComments(postId);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Error liking comment');
    }
  };

  const handleCreatePost = async () => {
    if (!content) return;
    try {
      if (capabilities) {
        writeContracts({
          contracts: [{
            address: ContractAddress,
            abi: ContractABI,
            functionName: 'createPost',
            args: [content],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
      } else {
        const tx = await contract.connect(ethersSigner).createPost(content);
        toast('Creating post');
        await tx.wait();
      }
      toast.success('Post created successfully');
      fetchPosts();
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
      const token = new ethers.Contract(blogToken || '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', ['function decimals() view returns (uint)'], ethersProvider);
      const blogAddress = await contract.blogNameToAddress(blogName);
      if (blogAddress !== '0x0000000000000000000000000000000000000000') {
        toast.error('Blog name already taken');
        return;
      }

      if (capabilities) {
        writeContracts({
          contracts: [{
            address: ContractAddress,
            abi: ContractABI,
            functionName: 'createBlog',
            args: [blogName, blogBio, blogToken || '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', ethers.parseUnits((blogAmount / 3600 / 24 / 30).toFixed().toString(), await token.decimals())],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
      } else {
        const tx = await contract.connect(ethersSigner).createBlog(blogName, blogBio, blogToken || '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913', ethers.parseUnits((blogAmount / 3600 / 24 / 30).toFixed().toString(), await token.decimals()));
        toast('Creating blog');
        await tx.wait();
      }
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
      const blogToken = (await contract.blogs(await contract.blogNameToAddress(tipping[1].toLowerCase()))).token;
      const token = new ethers.Contract(blogToken, ERC20_ABI, ethersSigner);
      const decimals = await token.decimals();
      const tipAmount = ethers.parseUnits(amount.toString(), decimals);
      const allowance = await token.allowance(userAddress, ContractAddress);

      if (allowance < tipAmount) {
        const approveTx = await token.approve(ContractAddress, '1000000000000000000000000000');
        await approveTx.wait();
      }

      if (capabilities) {
        writeContracts({
          contracts: [{
            address: ContractAddress,
            abi: ContractABI,
            functionName: 'tipPost',
            args: [tipping[0], tipAmount],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
      } else {
        const tx = await contract.connect(ethersSigner).tipPost(tipping[0], tipAmount);
        await tx.wait();
      }
      toast.success("Post tipped successfully!");
      fetchPosts();
    } catch (error) {
      console.error("Error tipping post:", error);
      toast.error("Error tipping post");
    }
  };

  const likePost = async (postId) => {
    try {
      if (capabilities) {
        writeContracts({
          contracts: [{
            address: ContractAddress,
            abi: ContractABI,
            functionName: 'likePost',
            args: [postId],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
      } else {
        const tx = await contract.connect(ethersSigner).likePost(postId);
        await tx.wait();
      }
      toast.success('Post liked successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error liking post:', error);
      toast.error('Error liking post');
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

  const borderColors = ['blue', 'green', 'red', '#f0f', 'orange'];

  const renderContentWithImages = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+(?:\.jpg|\.jpeg|\.png|\.gif))/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return <img key={index} src={part} alt="Embedded" className="my-4 max-w-full h-auto mx-auto" />;
      } else {
        return <span key={index} dangerouslySetInnerHTML={renderMarkdown(part.replace(/\n/g, '<br/>'))} />;
      }
    });
  };

  const renderComments = (postId) => {
    const postComments = comments[postId] || [];
    return (
      <div className="mt-4">
                <div>

        <div>
          <textarea
            
            id='commentInput'
            placeholder="Add a comment..."
            className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-gray-500 transition duration-300 ease-in-out"
          /></div>
          <div>
          <button className="text-center mb-2 py-3 bg-pink-400 text-white font-semibold rounded-full hover:bg-pink-500 transition duration-300 ease-in-out w-full mx-auto" onClick={() => handleCreateComment(postId, document.getElementById('commentInput').value)}>Create Comment</button>
          </div>
        {postComments.map((comment, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-3xl mb-4">
            <p className="text-gray-800">{renderContentWithImages(comment.content)}</p>
            <div className="mt-2">
            <div className="text-gray-500 text-sm flex flex-col sm:flex-row sm:justify-between mt-2">
              <span>- {comment.author} @ {comment.timestamp}</span>
              <div className="flex space-x-4">
                {comment.liked ? (
                  <button
                    className="text-sm text-red-500 rounded-full bg-red-100 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
                    onClick={() => handleLikeComment(postId, comment.id)}
                  >
                    ♡ {comment.likes}
                  </button>
                ) : (
                  <button
                    className="text-sm text-gray-500 rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
                    onClick={() => handleLikeComment(postId, comment.id)}
                  >
                    ♡ {comment.likes}
                  </button>
                )}
                <button
                  className="text-sm text-blue-500 rounded-full bg-blue-200 px-3 py-1 hover:bg-blue-300 transition duration-300 ease-in-out"
                  onClick={() => setTipping([postId, comment.id])}
                >
                  $ {comment.tips} tips
                </button>
              </div></div>
            </div>
          </div>
        ))}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-300 via-pink-300 to-yellow-300 text-gray-800 overflow-hidden ">
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
                  style={{ textTransform: 'lowercase' }}
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
                <select
                  id="blogToken"
                  value={blogToken}
                  onChange={(e) => setBlogToken(e.target.value)}
                  className="w-full p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                >
                  <option value="">Select a token</option>
                  <option value="0x833589fcd6edb6e08f4c7c32d4f71b54bda02913">USDC</option>
                  <option value="0x4200000000000000000000000000000000000006">wETH</option>
                  <option value="0x4ed4e862860bed51a9570b96d89af5e1b0efefed">DEGEN</option>
                  <option value="custom">Custom</option>
                </select>
                {blogToken === 'custom' && (
                  <input
                    type="text"
                    id="customToken"
                    placeholder="Enter custom token address"
                    onChange={(e) => { setBlogToken(e.target.value); toast.success('Custom token address set') }}
                    className="w-full p-3 mt-2 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
                  />
                )}
              </div>
              <div>
                <label htmlFor="blogAmount" className="block mb-2 font-semibold text-gray-600">Subscription Cost per 30d:</label>
                <input
                  type="number"
                  id="blogAmount"
                  value={blogAmount}
                  placeholder='0 for no subscription needed'
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
              {!userAddress &&
                <BlueCreateWalletButton />}
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
                  placeholder={'Title\nContent...'}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-pink-500 h-80 transition duration-300 ease-in-out"
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
          {content && (
            <>
              <h3 className="text-xl font-bold text-pink-600 ">Post Preview</h3>
              <div className="mt-8 p-6 bg-white rounded-3xl shadow-2xl w-full border-l-8 border-blue-500">
                <h3 className="text-xl font-bold text-gray-800">{renderContentWithImages(content.split('\n')[0])}</h3>
                <div className="text-gray-600 mt-2">{renderContentWithImages(content.toString().split('\n').slice(1).join('\n').trim())}</div>
              </div>
            </>)}
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
                      <div className="text-gray-600 mt-2">{renderContentWithImages(post.content)}</div>
                      <p className="text-gray-500 text-sm mt-2">- {post.author}</p>
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-gray-500 text-sm">{post.timestamp}</p>
                        <div className="flex space-x-4">
                          {post.liked ? (<button className="text-sm text-red-500 rounded-full bg-red-100 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out" onClick={() => likePost(post.id)}>♡ {post.likes}</button>
                          )
                            : (<button className="text-sm text-gray-500 rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out" onClick={() => likePost(post.id)}>♡ {post.likes}</button>
                            )}
                          <button className="text-sm text-blue-500 rounded-full bg-blue-200 px-3 py-1 hover:bg-blue-300 transition duration-300 ease-in-out" onClick={() => setTipping([post.id, post.blog])}>$ {post.tips} tips</button>
                          <button className="text-sm text-gray-500 rounded-full bg-pink-200 px-3 py-1 hover:bg-pink-300 transition duration-300 ease-in-out" onClick={() => fetchComments(post.id)}>💬 {post.commentCount}</button>
                        </div>
                      </div>
                      {comments[post.id] && renderComments(post.id)}
                    </div>
                  ) : (
                    <div key={index} className="bg-pink-200 p-6 rounded-3xl border-l-8 border-green-500 shadow-md">
                      <h3 className="text-xl font-bold text-gray-800"><a href={`https://feed.spot.pizza/?blog=@${post.blog}`}>Subscribe to view post @ {post.blog}</a></h3>
                      <p className="text-gray-500 text-sm mt-2">- {post.author}</p>
                      <p className="text-gray-500 text-sm">{post.timestamp}</p>
                      <a href={`https://feed.spot.pizza/?blog=${post.blog}`}><button className="w-full py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300 ease-in-out mt-4">Subscribe to blog</button></a>
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
          onTip={(amount) => {
            if (Array.isArray(tipping) && tipping.length === 2) {
              if (typeof tipping[1] === 'number') {
                handleTipComment(tipping[0], tipping[1], amount);
              } else {
                tipPost(tipping[0], amount);
              }
            }
          }}
          tipping={tipping}
        />
      )}
    </div>
  );
};

const BlueCreateWalletButton = () => {
  const { connectors, connect } = useConnect();

  const createWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === 'coinbaseWalletSDK'
    );
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector });
    }
  }, [connectors, connect]);

  return (
    <button className="w-full p-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-pink-600 transition duration-300 ease-in-out" onClick={createWallet}>
      Create Coinbase Smart Wallet For Free Txs
    </button>
  );
};

const TipModal = ({ isOpen, onClose, onTip, tipping }) => {
  const [amount, setAmount] = useState('');
  const [symbol, setSymbol] = useState('');
  const ethersProvider = useEthersProvider();
let chain = useChainId();
  useEffect(() => {
    getSymbol();
  }, []);

  const handleTip = () => {
    onTip(amount);
    setAmount('');
    onClose();
  };

  const getSymbol = async () => {
    const contract = new ethers.Contract(chain == 17000 ? ContractAddress : '0xdd528829749d6a4656d84cddbdc65e7dc5b350a7', ContractABI, ethersProvider);
    const blogToken = (await contract.blogs(await contract.blogNameToAddress(tipping[1].toLowerCase()))).token;
    const token = new ethers.Contract(blogToken, ['function symbol() view returns (string)'], ethersProvider);
    const symbol = await token.symbol();
    setSymbol(symbol);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-3xl shadow-2xl">
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

const BlogView = ({ likePost, tipPost, setTipping }) => {
  const [blogName, setBlogName] = useState('');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [blog, setBlog] = useState(false);
  const [comments, setComments] = useState({});
  const ethersProvider = useEthersProvider();
  const ethersSigner = useEthersSigner();
  const chain = useChainId();
  const addrs = useAccount().address;
  const contract = new ethers.Contract(chain === 17000 ? ContractAddress : '0xdd528829749d6a4656d84cddbdc65e7dc5b350a7', ContractABI, ethersProvider);
  const commentsContract = new ethers.Contract(CommentsContractAddress, CommentsContractABI, ethersProvider);
  let useAddress = useAccount().address
  const { data: capabilities } = useCapabilities();

    const { writeContracts } = useWriteContracts({
    mutation: { onSuccess: () => fetchPosts() },
  });
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const extractedBlogName = queryParams.get('blog') ? queryParams.get('blog').toLowerCase() : null;
    if (!blogName) {
      setBlogName(extractedBlogName);
      console.log('Extracted Blog:', extractedBlogName);
    } else if (!blogName) {
      setBlog(useAddress);
      console.log('Blog:', useAddress);
    }
    console.log('Blog:', blog);
    fetchBlogPosts(extractedBlogName);
  }, []);

  useEffect(() => {
    if (blogName) {
      fetchBlogPosts(blogName);
    }
  }, [blogName]);

  const fetchBlogPosts = async (extractedBlogName) => {
    try {
      setLoading(true);
      let userAddress;
      let blogN;
      try {
        blogN = (await contract.blogs(useAddress)).name;
      } catch (error) {
        blogN = extractedBlogName;
      }
      console.log('Blog:', blogN, 't', blogName);
      console.log('Blog:', blogN, 't', extractedBlogName);
      userAddress = await contract.blogNameToAddress(!extractedBlogName ? blogN : extractedBlogName);
      if (!extractedBlogName) {
        setBlogName(blogN);
      }
      console.log('User Address: ', userAddress);
      setBlog(await contract.blogs(userAddress));
      const token = new ethers.Contract((await contract.blogs(userAddress)).token, ['function decimals() view returns (uint)'], ethersProvider);
      let decimals;
      try {
        decimals = await token.decimals();
      } catch (error) {
        decimals = 18;
      }
      const postCount = await contract.authorPostCount(userAddress);
      let postIds = Array.from({ length: Number(postCount) }, (v, k) => k);
      try {
        const multicallContract = new ethers.Contract('0xcA11bde05977b3631167028862bE2a173976CA11', ['function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)'], ethersProvider);
        const calls = postIds.map(id => ({
          target: ContractAddress,
          callData: contract.interface.encodeFunctionData('authorPosts', [userAddress, id]),
        }));

        const { returnData } = await multicallContract.aggregate(calls);
        console.log('Return Data:', returnData);
        postIds = returnData.map(data => contract.interface.decodeFunctionResult('authorPosts', data)[0]);
      } catch (error) {
        for (let i = 0; i < postCount; i++) {
          postIds[i] = await contract.authorPosts(userAddress, i);
          console.log('Post ID:', postIds[i]);
        }
      }
      const [postsFromContract, likedStatuses] = await readContract(config, {
        address: ContractAddress,
        abi: ContractABI,
        functionName: 'getPosts',
        args: [postIds],
        account: addrs,
      });

      const commentCounts = await commentsContract.getCommentCounts(postIds);
console.log('Comment Counts:', commentCounts,postIds);
      const formattedPosts = postsFromContract.map((post, index) => ({
        title: post.content.split('\n')[0],
        content: post.content.split('\n').slice(1).join('\n').trim(),
        author: post.author,
        timestamp: new Date(Number(post.timestamp) * 1000).toLocaleString(),
        blog: post.blog,
        blogAddress: post.blogAddress,
        likes: Number(post.likes),
        liked: likedStatuses[index],
        id: postIds[index],
        tips: Number(ethers.formatUnits(post.tips.toString(), decimals)),
        decimals: decimals,
        commentCount: Number(commentCounts[index]),
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const limit = 10;
      const [commentsFromContract, likedStatuses] = await commentsContract.viewComments(postId, limit);

      const formattedComments = commentsFromContract.map((comment, index) => ({
        content: comment.content,
        author: comment.author,
        timestamp: new Date(Number(comment.timestamp) * 1000).toLocaleString(),
        likes: Number(comment.likes),
        tips: Number(comment.tips),
        liked: likedStatuses[index],
        id: index,
      }));

      setComments(prevComments => ({ ...prevComments, [postId]: formattedComments }));
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleCreateComment = async (postId, commentContent) => {
    try {       

      if (capabilities) {
        writeContracts({
          contracts: [{
            address: CommentsContractAddress,
            abi: CommentsContractABI,
            functionName: 'createComment',
            args: [postId,content],
          }],
          capabilities: {
            paymasterService: { url: 'https://api.developer.coinbase.com/rpc/v1/base/qNWKQGIlR7R75W33Gk6qRkcXUrFOdbd9' },
          },
        });
      toast.success('Comment created successfully');
      fetchComments(postId);

      } else {
      const tx = await commentsContract.connect(ethersSigner).createComment(postId, commentContent);
      await tx.wait();
      toast.success('Comment created successfully');
      fetchComments(postId);
    }} catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Error creating comment');
    }
  };

  const handleTipComment = async (postId, commentId, amount) => {
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
      const blogToken = (await contract.blogs(await contract.blogNameToAddress(tipping[1].toLowerCase()))).token;
      const token = new ethers.Contract(blogToken, ERC20_ABI, ethersSigner);
      const decimals = await token.decimals();
      const tipAmount = ethers.parseUnits(amount.toString(), decimals);
      const allowance = await token.allowance(userAddress, CommentsContractAddress);

      if (allowance < tipAmount) {
        const approveTx = await token.approve(CommentsContractAddress, '1000000000000000000000000000');
        await approveTx.wait();
      }

      const tx = await commentsContract.connect(ethersSigner).tipComment(postId, commentId, tipAmount);
      await tx.wait();
      toast.success("Comment tipped successfully!");
      fetchComments(postId);
    } catch (error) {
      console.error("Error tipping comment:", error);
      toast.error("Error tipping comment");
    }
  };

  const handleLikeComment = async (postId, commentId) => {
    try {
      const tx = await commentsContract.connect(ethersSigner).likeComment(postId, commentId);
      await tx.wait();
      toast.success('Comment liked successfully');
      fetchComments(postId);
    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Error liking comment');
    }
  };

  const borderColors = ['blue', 'green', 'red', '#f0f', 'orange'];

  const renderContentWithImages = (content) => {
    const urlRegex = /(https?:\/\/[^\s]+(?:\.jpg|\.jpeg|\.png|\.gif))/g;
    const parts = content.split(urlRegex);

    return parts.map((part, index) => {
      if (urlRegex.test(part)) {
        return <img key={index} src={part} alt="Embedded" className="my-4 max-w-full h-auto mx-auto" />;
      } else {
        return <span key={index} dangerouslySetInnerHTML={renderMarkdown(part.replace(/\n/g, '<br/>'))} />;
      }
    });
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

  const renderBioWithLinks = (bio) => {
    const twitterRegex = /https:\/\/twitter\.com\/[^\s]+/g;
    const githubRegex = /https:\/\/github\.com\/[^\s]+/g;
    const iconLinkRegex = /\((https:\/\/[^\s]+)\)\[([^\s]+)\]/g;

    const twitterLink = bio.match(twitterRegex) ? bio.match(twitterRegex)[0] : null;
    const githubLink = bio.match(githubRegex) ? bio.match(githubRegex)[0] : null;

    const filteredBio = bio.replace(twitterRegex, '').replace(githubRegex, '').replace(iconLinkRegex, '').trim();

    const renderIcons = (bio) => {
      const parts = [];
      let lastIndex = 0;

      bio.replace(iconLinkRegex, (match, iconUrl, linkUrl, offset) => {
        parts.push(
          <a key={offset} href={linkUrl} target="_blank" rel="noopener noreferrer">
            <img src={iconUrl} alt="Icon" className="w-6 h-6 inline mx-1" />
          </a>
        );
        lastIndex = offset + match.length;
      });

      return parts;
    };

    const renderedIcons = renderIcons(bio);

    return (
      <div className="text-center w-1/2 mx-auto">
        <p className="flex justify-center space-x-4 mb-2">{filteredBio}</p>
        <div className="flex justify-center space-x-4 mb-4">
          {twitterLink && (
            <a href={twitterLink} target="_blank" rel="noopener noreferrer">
              <img src="./twitter.png" alt="Twitter" className="w-6 h-6" />
            </a>
          )}
          {githubLink && (
            <a href={githubLink} target="_blank" rel="noopener noreferrer">
              <img src="https://simpleicons.org/icons/github.svg" alt="GitHub" className="w-6 h-6" />
            </a>
          )}
          {renderedIcons}
        </div>
      </div>
    );
  };

  const renderComments = (postId) => {
    const postComments = comments[postId] || [];
    return (
      <div className="mt-4">
                        <div>

      <div>
        <textarea
          type="text"
          id='commentInput'
          placeholder="Add a comment..."
          className="w-full p-3 bg-pink-100 border-none rounded-3xl focus:ring-2 focus:ring-gray-500 transition duration-300 ease-in-out"
        />
      </div>
      <div>
        <button
          className="text-center mb-2 py-3 bg-pink-400 text-white font-semibold rounded-full hover:bg-pink-500 transition duration-300 ease-in-out w-full mx-auto"
          onClick={() => handleCreateComment(postId, document.getElementById('commentInput').value)}
        >
          Create Comment
        </button>
      </div>
    </div>
        {postComments.map((comment, index) => (
          <div key={index} className="bg-gray-100 p-4 rounded-3xl mb-4">
            <p className="text-gray-800">{renderContentWithImages(comment.content)}</p>
            <div className="flex justify-between items-center mt-2">
              <div className="text-gray-500 text-sm flex justify-between mt-2">
                <span>- {comment.author} @ {comment.timestamp}</span>
              </div>
              <div className="flex space-x-4">
                {comment.liked ? (
                  <button
                    className="text-sm text-red-500 rounded-full bg-red-100 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
                    onClick={() => handleLikeComment(postId, comment.id)}
                  >
                    ♡ {comment.likes}
                  </button>
                ) : (
                  <button
                    className="text-sm text-gray-500 rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
                    onClick={() => handleLikeComment(postId, comment.id)}
                  >
                    ♡ {comment.likes}
                  </button>
                )}
                <button
                  className="text-sm text-blue-500 rounded-full bg-blue-200 px-3 py-1 hover:bg-blue-300 transition duration-300 ease-in-out"
                  onClick={() => setTipping([postId, comment.id])}
                >
                  $ {comment.tips} tips
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="">
      <main className="container mx-auto py-8">
        <h1 className="text-center text-4xl mb-2 text-gray-700 font-extrabold">
          {blogName ? `${blogName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')}'s Blog` : 'Blog View'}
        </h1>
        {blog && <div className="text-center text-xl mb-4 text-gray-600 w-1/2 mx-auto">{renderBioWithLinks(blog.bio)}</div>}
        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.protocol + '://' + window.location.host + '/?blog=' + blogName);
            toast.success('Link copied :)');
          }}
          className="flex mx-auto center text-sm text-white rounded-full bg-blue-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
        >
          Copy link
        </button>
        <Toaster />
        <section className="mt-4">
          <div className="mb-4 flex justify-center">
            <input
              type="text"
              style={{ textTransform: 'lowercase' }}
              onChange={(e) => setBlogName(e.target.value)}
              placeholder="Search Blog Name..."
              className="w-1/2 p-3 bg-pink-100 border-none rounded-full focus:ring-2 focus:ring-pink-500 transition duration-300 ease-in-out"
            />
          </div>
          {posts[0] && blog && posts[0].title === 'subscribe to view post' && (
            <a href={`https://sub.spot.pizza/?token=${blog.token}&subscribe=${posts[0].blogAddress}&amount=${ethers.formatUnits((Number(blog.amount) * 604800).toString(), posts[0].decimals)}&window=604800&once=false&network=8453`}>
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
                <div className="bg-white p-6 rounded-3xl border-l-8 shadow-md">
                  <p className="text-gray-800">No posts yet.</p>
                </div>
              ) : (
                posts.slice().reverse().map((post, index) => (
                  post.title !== 'subscribe to view post' ? (
                    <div key={index} className="bg-white p-6 rounded-3xl border-l-8 shadow-md" style={{ borderColor: borderColors[index % borderColors.length] }}>
                      <h3 className="text-xl font-bold text-gray-800">{post.title}<a href={`${window.location}?blog=${post.blog}`} className="text-gray-500 text-sm ml-2">@ {post.blog}</a></h3>
                      <div className="text-gray-600 mt-2">{renderContentWithImages(post.content)}</div>
                      <p className="text-gray-500 text-sm mt-2">- {post.author}</p>
                      <div className="flex justify-between items-center mt-4">
                        <p className="text-gray-500 text-sm">{post.timestamp}</p>
                        <div className="flex space-x-4">
                          {useAddress === post.blogAddress && (
                            <button
                              className="text-sm text-white rounded-full bg-red-300 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
                              onClick={() => {let tx = contract.connect(ethersSigner).deletePost(post.id);}}
                            >
                              Delete
                            </button>)}
                          {post.liked ? (
                            <button
                              className="text-sm text-red-500 rounded-full bg-red-100 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
                              onClick={() => likePost(post.id)}
                            >
                              ♡ {post.likes}
                            </button>
                          ) : (
                            <button
                              className="text-sm text-gray-500 rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
                              onClick={() => likePost(post.id)}
                            >
                              ♡ {post.likes}
                            </button>
                          )}
                          <button
                            className="text-sm text-blue-500 rounded-full bg-blue-200 px-3 py-1 hover:bg-blue-300 transition duration-300 ease-in-out"
                            onClick={() => setTipping([post.id, post.blog])}
                          >
                            $ {post.tips} tips
                          </button>
                          <button
                            className="text-sm text-gray-500 rounded-full bg-gray-200 px-3 py-1 hover:bg-gray-300 transition duration-300 ease-in-out"
                            onClick={() => fetchComments(post.id)}
                          >
                            💬 {post.commentCount}
                          </button>
                        </div>
                      </div>
                      {comments[post.id] && renderComments(post.id)}
                    </div>
                  ) : (
                    <div key={index} className="bg-pink-200 p-6 rounded-3xl border-l-8 border-green-500 shadow-md">
                      <h3 className="text-xl font-bold text-gray-800"><a href={`${window.location}@${post.blog}`}>Subscribe to view post @ {post.blog}</a></h3>
                      <p className="text-gray-500 text-sm mt-2">- {post.author}</p>
                      <p className="text-gray-500 text-sm">{post.timestamp}</p>
                      <a href={`https://sub.spot.pizza/?token=${blog.token}&subscribe=${posts[0].blogAddress}&amount=${ethers.formatUnits((Number(blog.amount) * 604800).toString(), posts[0].decimals)}&window=604800&network=8453`}>
                        <button className="w-full py-3 bg-green-500 text-white font-semibold rounded-full hover:bg-green-600 transition duration-300 ease-in-out mt-4">
                          Subscribe to blog
                        </button>
                      </a>
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

export default App;