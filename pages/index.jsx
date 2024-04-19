//import styles from "../styles/Home.module.css";
import App from "../components/App";
//import "../styles/global.css";

export default function Home() {
  return (<>  
<head>
    <meta charset="utf-8" />
    <link rel="icon" href="/sl.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta
      name="description"
      content="Spot a Friend. Allow friends to borrow tokens from your wallet, no locking tokens, no interest, no fees.
      "
    />
    <link rel="apple-touch-icon" href="/sl.png" />
    
    <title>Spot</title>
  </head>
        <App />
    </>
  );
}
