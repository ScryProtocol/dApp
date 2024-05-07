//import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import './global.css';
import React, { useState, useEffect } from 'react';

import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createConfig, sepolia, WagmiConfig } from 'wagmi';
import {
  mainnet,
  optimism,
  arbitrum,
  base,
  holesky,scroll

} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
const { chains, publicClient } = configureChains(
  [mainnet, base, optimism, holesky,scroll],//sepolia,holesky],// optimism, arbitrum, base],
  [
    //alchemyProvider({ apiKey: 'noFpU53uptypQtmZDodsoYQwqcK2V3AC' }),
    publicProvider()
  ]
);
const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  projectId: '97d417268e5bd5a42151f0329e544898',
  chains
});
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient
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
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <div className={`app ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
          <label style={{ left: '200px', top: '4px', fontSize: '42px' }} onClick={toggleTheme} 
         ><a href="https://sub.spot.pizza/"><img style={{position: 'absolute', left: '10px', top: '10px', width: '100px' }}src='./favicon.ico'/></a> </label>
          <Component {...pageProps} />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default MyApp;
