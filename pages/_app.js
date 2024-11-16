//import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import './global.css';
import React, { useState, useEffect } from 'react';
import { http, createConfig } from 'wagmi'
import { base, holesky, mainnet, optimism, polygon, sepolia,scroll,arbitrum } from 'wagmi/chains'
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
const queryClient = new QueryClient()

const config = getDefaultConfig({
  chains: [base, holesky,mainnet,optimism, polygon,scroll,arbitrum],// sepolia, holesky, base, optimism],
  projectId: '97d417268e5bd5a42151f0329e544898',

  transports: {
 //   [mainnet.id]: http(),
    [holesky.id]: http(),
    [base.id]: http(), [optimism.id]: http(),[mainnet.id]: http(),[polygon.id]: http(),[sepolia.id]: http(), [scroll.id]: http(),[arbitrum.id]: http(),
//  [optimism.id]: http(),
  //  [mainnet.id]: http(),
  },
})

function MyApp({ Component, pageProps }) {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isDarkTheme') === 'true';
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState('vault');
  const [showInfo, setShowInfo] = useState(false);
  
  useEffect(() => {
    // Save theme preference to local storage whenever it changes
    localStorage.setItem('isDarkTheme', isDarkTheme);
    let location = window.location.href;
    if (location.includes('token')) {
      setActiveTab('sub');
    }
    if (location.includes('wall')) {
      setActiveTab('wall');
    }
  }, [isDarkTheme]);
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };
  
  function TabSwitcher({ activeTab, onTabChange }) {
    
    return (
      
      <div className="tab-switcher justify-center">
      <div className="tab-switcher absolute justify-center text-gray-500 bg-gray-700 rounded-full bg-opacity-60 mx-1/2 mt-1 bg-backdrop-blur-lg">
        <button className={`ta ${activeTab === 'vault' ? 'tab-active text-pink-500' : ''}`} onClick={() => setActiveTab('vault')}>
          Vault
          </button>
        <button className={`ta ${activeTab === 'stream' ? 'tab-active text-pink-500' : ''}`} onClick={() => setActiveTab('stream')}>
          Stream
          </button>
        <button className={`ta ${activeTab === 'spot' ? 'tab-active text-pink-500' : ''}`} onClick={() => setActiveTab('spot')}>
          Spot
          </button>
          <button className={`ta ${activeTab === 'sub' ? 'tab-active text-pink-500' : ''}`} onClick={() => setActiveTab('sub')}>
          Sub
          </button>
          <button className={`ta ${activeTab === 'fun' ? 'tab-active text-pink-500' : ''}`} onClick={() => setActiveTab('feed')}>
          Fun
          </button>
      </div>
      <div className="tab-switcher absolute justify-center text-gray-500 bg-gray-700 rounded-full bg-opacity-60 mx-1/2 mt-10 bg-backdrop-blur-lg">
      <button className={`ta ${activeTab === 'feed' ? 'tab-active text-pink-500' : ''}`} onClick={() => setActiveTab('feed')}>
          Feed
          </button>
      <button className={`ta ${activeTab === 'wall' ? 'tab-active text-pink-500' : ''}`} onClick={() => setActiveTab('wall')}>
          Wall
          </button>
      </div>
      <button className="absolute right-2 top-2 w-9 rounded-full bg-white p-1 font-bold text-xl" onClick={() => setShowInfo(!showInfo)}>?</button>
      </div>
    );
  }
  return (
    <WagmiProvider  config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <div className={`app ${isDarkTheme ? 'dark-theme' : 'light-theme'} `}>
          <label style={{ left: '200px', top: '4px', fontSize: '42px' }} onClick={{}}//toggleTheme} 
         ><a href={0!==1?'https://twitter.com/spotdotpizza':"https://sub.spot.pizza/"}><img style={{position: 'absolute', left: '10px', top: '10px', width: '50px' }}src='./favicon.ico'/></a> </label>
          <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} className="bg-gradient-to-r from-blue-100 via-blue-300 to-green-300" />
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
        </div>

        {showInfo && (
            <Info
              app={activeTab}
              handleClose={() => setShowInfo(false)}
            />
          )}      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider >
  );
}

export default MyApp;
