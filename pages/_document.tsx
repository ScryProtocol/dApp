import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
        <title>Veryfi</title>
        <meta name="description" content="Verify that you own any NFTs, ERCs, are staking or any other ownership that uses balanceOf, for any other network! Veryfi lets you easily check membership and ownership for your community/project!" />
        <link rel="icon" href="/veryfi.png" />
      </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
