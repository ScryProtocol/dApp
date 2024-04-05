//import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import './global.css';
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

} from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
const { chains, publicClient } = configureChains(
  [sepolia, ],// optimism, arbitrum, base],
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
	return (
		<WagmiConfig config={wagmiConfig}>
		<RainbowKitProvider chains={chains}>
					<Component {...pageProps} />
					</RainbowKitProvider>
    </WagmiConfig>
	);
}

export default MyApp;
