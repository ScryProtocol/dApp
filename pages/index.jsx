//import styles from "../styles/Home.module.css";
import App from "../components/App";
//import "../styles/global.css";

export default function Home() {
  return (<>  
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/slo.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Welcome to Signet, sign NFTs for all your fans, collect signatures from your favourite creators and show off all your signats!"
    />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/slo.png" />
    
    <title>Signet</title>
  </head>
        <App />
    </>
  );
}
