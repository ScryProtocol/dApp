
# GhostTag
GhostTag is an npm package for tagging, streaming and filtering Ethereum blockchain transactions that contain specific tags. It includes classes to facilitate tagging transactions and parsing tagged data.
<p align="center">
  <img src="./ghostTag.png" alt="GhostTag">
</p>

## Installation

You can install the package using npm:

```sh
npm install ghosttag ethers
```

## Usage

### Streaming Transactions

To stream transactions with a specific tag:

```javascript
const { GhostTagStreamer, TaggedContract } = require('ghosttag');
const { ethers } = require('ethers');

const rpcUrl = 'https://1rpc.io/holesky';
const tag = 'mytag';//can be empty for no tag filter
const dataKeys = ['tag1', 'tag2'];//can be empty for no keys and just use tag
const silent =false


const transactions = [];
const streamer = new GhostTagStreamer(rpcUrl, tag, dataKeys,silent);

// Add filters if needed
// Example filter: only include transactions from a specific address
// streamer.addFilter((tx, data) => tx.from === '0xYourAddress');

// Add a filter for a specific tag key
//streamer.addTagKeyFilter('tag1');
// Start watching transactions and update the transactions array
streamer.start((tx) => {
    transactions.push(tx);
    console.log('Transaction:', tx);
});
```

### Sending Tagged Transactions

To send tagged transactions using a TaggedContract:

```javascript
const { ethers } = require('ethers');
const { TaggedContract } = require('ghosttag');

async function main() {
    const rpcUrl = 'https://1rpc.io/holesky';
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

    const ContractABI = [
        "function myfn(address to, uint256 newAmount) external"
    ];

    const ContractAddress = '0xYourContractAddress';

    const contract = new ethers.Contract(ContractAddress, ContractABI, wallet);
    let taggedContract = new TaggedContract(contract);

    // Example data object to be used as a tag
    const data = { tag1: 'boop', tag2: 'lol' };
    let addrs = '0x0000000000071821e8033345a7be174647be0706';
    let am = 1;

    // Send transaction with a string tag
    let tx = await taggedContract.myfn(addrs, am).tag(JSON.stringify(data));
    await tx.wait();
    console.log('Transaction mined:', tx.hash);

    // Send transaction with a hex tag
    tx = await taggedContract.myfn(addrs, am).hextag('1337');
    await tx.wait();
    console.log('Transaction mined:', tx.hash);

    
    // Send transaction with a tag for filter and data
    tx = await taggedContract.myfn(addrs, am).tag('lol'+JSON.stringify(data));
    await tx.wait();
    console.log('Transaction mined:', tx.hash);
}

main();
```

## API

### GhostTagStreamer

#### constructor

```javascript
constructor(rpcUrl, tag = '', dataKeys = [], silent = false)
```

- **rpcUrl** (string): The RPC URL of the Ethereum network.
- **tag** (string, optional): The tag to watch for in transactions. Defaults to an empty string.
- **dataKeys** (array, optional): Keys to identify values in the transaction data. Defaults to an empty array.
- **silent** (boolean, optional): If true, suppresses console output. Defaults to false.

#### addFilter

```javascript
addFilter(filterFn)
```

- **filterFn** (function): A function to filter transactions. Receives the transaction and data as arguments.

#### addTagKeyFilter

```javascript
addTagKeyFilter(tagKey)
```

- **tagKey** (string): The key to filter transactions by.

#### start

```javascript
start(callback)
```

**callback** (function): A callback function to handle the parsed data.
callback (function): A callback function to handle the parsed data. Receives an object containing the following details:
blockNumber: The block number containing the transaction.
txHash: The hash of the transaction.
from: The sender address.
to: The recipient address.
value: The value of the transaction.
timestamp: The timestamp of the block containing the transaction.
dataHex: The hex-encoded data after the tag.
dataStr: The string-encoded data after the tag.
parsedData: The parsed key-value pairs from the data.

### TaggedTransaction

#### tag

```javascript
tag(tag)
```

- **tag** (string): A string tag to be appended to the transaction data.

#### hextag

```javascript
hextag(tag)
```

- **tag** (string): A hex string tag to be appended to the transaction data.

### TaggedContract

#### constructor

```javascript
constructor(contract)
```

- **contract** (object): An instance of an ethers.js contract.

## License

MIT

## Disclaimer

This software is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software.