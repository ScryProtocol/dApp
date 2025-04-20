//import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import './global.css';
import React, { useState, useEffect } from 'react';
import { http, createConfig } from 'wagmi'
import * as allWagmiChains from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { BrowserRouter as Router, Route, Switch, useParams } from 'react-router-dom';
import Spot from '../components/Spot';
import Stream from "../components/Stream";
import Sub from "../components/Sub";
import Feed from "../components/Feed";
import Wall from "../components/Wall";
import Info from "../components/Info";
import App from '../components/App';
import Charity from '../components/Charity';
const queryClient = new QueryClient()

// Destructure some known chains from wagmi/chains
const { mainnet, base, optimism } = allWagmiChains;

// 1. Put your “most used” chains at the top in a fixed array:
const topChains = [mainnet, base, optimism];

// 2. Generate a complete chain list from wagmi
const wagmiChainList = Object.values(allWagmiChains).filter(
  (ch) => typeof ch.id === "number"
);

// 3. Remove any duplicates of your topChains to avoid collisions
const otherChains = wagmiChainList.filter((ch) => {
  return !topChains.some((top) => top.id === ch.id);
});

// 4. Merge them so that your favorites are at the top
const allChains = [...topChains, ...otherChains];

// 5. Create your config using allChains
const config = getDefaultConfig({
  chains: allChains,
  projectId: "97d417268e5bd5a42151f0329e544898",
  transports: Object.fromEntries(
    allChains.map((chain) => [chain.id, http()])
  ),
});
function MyApp({ Component, pageProps }) {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    console.log(optimism);
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isDarkTheme') === 'true';
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    // Save theme preference to local storage whenever it changes
    localStorage.setItem('isDarkTheme', isDarkTheme);
    let location = window.location.href;
    if (location.includes('?sub')) {
      setActiveTab('sub');
      console.log('sub');
    }
   else if (location.includes('?spot')) {
      setActiveTab('spot');
    }
    else if (location.includes('give')) {
      setActiveTab('charity');
    }
    else {
      setActiveTab('vault');
    }
  }, [isDarkTheme]);
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };
  
  function TabSwitcher({ activeTab, onTabChange }) {
    
    return (
      
      <div className="tab-switcher absolute top-0 left-0 items-center">
      <div className="tab-switcher justify-center text-gray-500 bg-white rounded-full opacity-50 md:my-4 md:ml-4 m-2 font-semibold p-1">
        <select className="bg-white/50 text-gray-500 rounded-full" value={activeTab} onChange={(e) => onTabChange(e.target.value)}>
        <option value="vault">Vault</option>
        <option value="stream">Stream</option>
        <option value="spot">Spot</option>
        <option value="sub">Sub</option>
        <option value="charity">Charity</option>
        </select>
      </div>
          <button className="w-2 rounded-full pl-2 pr-3.5 font-bold border border-pink-400 text-pink-400 hover:bg-pink-500 hover:text-white text-center" onClick={() => setShowInfo(!showInfo)}>?</button>
      
      </div>
    );
  }
  return (
    <WagmiProvider  config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <title>Boop - Simple Finance</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Onchain finance made simple" />{activeTab&&(
        <div className={`app ${isDarkTheme ? 'dark-theme' : 'light-theme'} `}>
         {// <label style={{ left: '200px', top: '4px', fontSize: '42px' }} onClick={{}}//toggleTheme} 
         }{//><a href={0!==1?'https://twitter.com/0xboop':"https://sub.spot.pizza/"}><img style={{position: 'absolute', left: '10px', top: '10px', width: '50px' }}src='./favicon.ico'/></a> </label>
} <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} className="bg-gradient-to-r from-blue-100 via-blue-300 to-green-300" />
          {activeTab === 'vault' && 
          <App /> }
          {activeTab === 'stream' &&
          <Stream/>}
          {activeTab === 'spot' &&
          <Spot/>}
          {activeTab === 'sub' &&
          <Sub/>}
          {activeTab === 'feed' &&
          <Feed/>
          }{activeTab === 'wall' &&
            <Wall/>
            }
          {activeTab === 'charity' &&
          <Charity/>}
        </div>
        )}<TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} className="bg-gradient-to-r from-blue-100 via-blue-300 to-green-300" />
          
        {showInfo && (
            <Info
              app={activeTab}
              handleClose={() => setShowInfo(false)}
              className="z-20"
            />
          )}      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider >
  );
}

export default MyApp;
