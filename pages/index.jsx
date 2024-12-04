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
      content="A fully public, immutable, transparent and onchain knowledge base where anyone can contribute and information's backed by real stake
      "
    />
    <link rel="apple-touch-icon" href="/sl.png" />
    
    <title>Source</title>
  </head>
  
  <script
      async
      src="https://www.googletagmanager.com/gtag/js?id=G-L8YDH0NR8C" >
    </script>
        <App />
    </>
  );
}
