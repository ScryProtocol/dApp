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
      content="The DeathRoll smart contract is a PvP betting game where the outcome is determined by rolls."
    />
    <link rel="apple-touch-icon" href="./pub/logo.png" />
    
    <title>Death Roll</title>
  </head>
        <App />
    </>
  );
}
