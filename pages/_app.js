//import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import './global.css';
import React, { useState, useEffect } from 'react';
import { http, createConfig } from 'wagmi'
import { base, holesky, mainnet, optimism, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { BrowserRouter as Router, Route, Switch, useParams } from 'react-router-dom';

const queryClient = new QueryClient()

const config = getDefaultConfig({
  chains: [base, holesky],//mainnet, sepolia, holesky, base, optimism],
  projectId: '97d417268e5bd5a42151f0329e544898',

  transports: {
 //   [mainnet.id]: http(),
    [holesky.id]: http(),
    [base.id]: http(),
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

  useEffect(() => {
    // Save theme preference to local storage whenever it changes
    localStorage.setItem('isDarkTheme', isDarkTheme);
  }, [isDarkTheme]);
  const toggleTheme = () => {
    setIsDarkTheme(!isDarkTheme);
  };
  return (
    <WagmiProvider  config={config}>
      <QueryClientProvider client={queryClient}>
      <RainbowKitProvider>
        <div className={`app ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
          <label style={{ left: '200px', top: '4px', fontSize: '42px' }} onClick={toggleTheme} 
         ><a href="https://sub.spot.pizza/"><img style={{position: 'absolute', left: '10px', top: '10px', width: '50px' }}src='./favicon.ico'/></a> </label>
          <a href="https://discord.gg/vrV4YpUccq"><img style={{position: 'absolute', right: '10px', top: '10px', width: '50px' }}src='./discord.png'/></a>
          <a href="https://twitter.com/spotdotpizza"><img style={{position: 'absolute', right: '70px', top: '10px', width: '50px' }}src='./twitter.png'/></a>
          <Component {...pageProps} />
        </div>
      </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider >
  );
}

export default MyApp;
