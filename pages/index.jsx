//import styles from "../styles/Home.module.css";
import App from "../components/App";
//import "../styles/global.css";

export default function Home() {
  return (<>  
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="./pub/logo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Welcome to Collab by Signet, Collab allows you to engage in a new, more personal way, and collectors to have a whole new dimension of value and collectability. The Collabs a constantly evolving fully onchain and decentralized space to collaboratively draw and contribute to a single art piece, with each snapshot NFT showing a moment in time, with fully onchain authentication for those who contributed using IPFS attestation and layering. Draw, collaborate, collect."
    />
    <link rel="apple-touch-icon" href="./pub/logo.png" />
    
    <title>Collab</title>
  </head>
        <App />
    </>
  );
}
