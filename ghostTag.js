const { ethers } = require('ethers');

// GhostTagStreamer Class
class GhostTagStreamer {
    constructor(rpcUrl, tag, dataKeys = [], silent = false) {
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.tag = tag;
        this.tagHex = this.toHex(tag).slice(2); // Remove '0x' from the start
        this.filters = [];
        this.dataKeys = dataKeys; // Store keys to identify values in extracted data
        this.silent = silent;
    }

    // Convert a string to hex
    toHex(str) {
        return '0x' + Buffer.from(str, 'utf8').toString('hex');
    }

    // Convert hex to string
    hexToString(hex) {
        return Buffer.from(hex, 'hex').toString('utf8');
    }

    // Add a filter function
    addFilter(filterFn) {
        this.filters.push(filterFn);
    }

    // Add a filter function for specific tag key
    addTagKeyFilter(tagKey) {
        this.addFilter((tx, data) => {
            const parsedData = this.parseTaggedData(data);
            return parsedData.hasOwnProperty(tagKey);
        });
    }

    // Start streaming transactions
    start(callback) {
        if (!this.silent) {
            console.log(`Tag in hex: 0x${this.tagHex}`);
            console.log('Watching for transactions with specific tags...');
        }

        this.provider.on('block', async (blockNumber) => {
            const blockNumberHex = '0x' + blockNumber.toString(16);
            if (!this.silent) {
                console.log(`New Block: ${blockNumber} (0x${blockNumberHex})`);
            }
            const block = await this.provider.send('eth_getBlockByNumber', [blockNumberHex, true]);

            if (block && block.transactions) {
                block.transactions.forEach((tx) => {
                    const data = tx.input;
                    const tagIndex = data.indexOf('67686f7374746167' + this.tagHex); // 'ghosttag' + custom tag

                    if (tagIndex !== -1) {
                        const dataAfterTag = data.substring(tagIndex + 16 + this.tagHex.length); // Skip 'ghosttag' and custom tag length
                        const dataAfterTagStr = this.hexToString(dataAfterTag);

                        let includeTx = true;
                        for (const filter of this.filters) {
                            if (!filter(tx, dataAfterTagStr)) {
                                includeTx = false;
                                break;
                            }
                        }

                        if (includeTx) {
                            if (!this.silent) {
                                console.log(`Transaction with tag found in block ${blockNumber}:`);
                                console.log(`Transaction Hash: ${tx.hash}, from: ${tx.from}, to: ${tx.to}`);
                                console.log(`Data after tag hex: 0x${dataAfterTag}`);
                                console.log(`Data after tag str: ${dataAfterTagStr}`);
                            }

                            // Parse and display key-value pairs from data
                            const parsedData = this.parseTaggedData(dataAfterTagStr);
                            if (!this.silent) {
                                console.log('Parsed Data:', parsedData);
                            }

                            // Callback to handle the parsed data
                            if (callback) {
                                callback({
                                    blockNumber,
                                    txHash: tx.hash,
                                    from: tx.from,
                                    to: tx.to,
                                    value: Number(ethers.formatEther(tx.value)),
                                    timestamp: Number(block.timestamp),
                                    dataHex: `0x${dataAfterTag}`,
                                    dataStr: dataAfterTagStr,
                                    parsedData,
                                });
                            }
                        }
                    }
                });
            }
        });
    }

    // Parse the tagged data into key-value pairs
    parseTaggedData(dataStr) {
        const result = {};
        let remainingStr = dataStr;

        // Attempt to parse as JSON if it appears to be valid JSON
        if (remainingStr.startsWith('{') && remainingStr.endsWith('}')) {
            try {
                const jsonData = JSON.parse(remainingStr);
                this.dataKeys.forEach((key) => {
                    if (jsonData.hasOwnProperty(key)) {
                        result[key] = jsonData[key];
                    }
                });
            } catch (error) {
                if (!this.silent) {
                    console.error('Error parsing tagged data as JSON:', error);
                }
            }
        } else {
            // Handle non-JSON data
            this.dataKeys.forEach((key) => {
                const keyIndex = remainingStr.indexOf(key);
                if (keyIndex !== -1) {
                    const valueStart = keyIndex + key.length;
                    const valueEnd = remainingStr.indexOf(',', valueStart) !== -1 ? remainingStr.indexOf(',', valueStart) : remainingStr.length;
                    result[key] = remainingStr.substring(valueStart, valueEnd);
                }
            });
        }

        return result;
    }
}

// TaggedTransaction and TaggedContract Classes
class TaggedTransaction {
    constructor(promise, contract, fnName, args) {
        this.promise = promise;
        this.contract = contract;
        this.fnName = fnName;
        this.args = args;
    }

    async tag(tag) {
        const resolvedTx = await this.promise;

        // Encode the function data
        const data = this.contract.interface.encodeFunctionData(this.fnName, this.args);

        // Append the predefined tag and the custom tag
        const predefinedTagHex = '67686f7374746167'; // 'ghosttag' in hex
        const taggedData = data + predefinedTagHex + this.toHex(tag).slice(2);

        // Send the transaction with the tagged data
        const tx = await this.contract.runner.sendTransaction({
            to: await this.contract.getAddress(),
            data: taggedData,
            value: resolvedTx.value || 0n,
        });

        return tx;
    }

    async hextag(tag) {
        const resolvedTx = await this.promise;

        // Encode the function data
        const data = this.contract.interface.encodeFunctionData(this.fnName, this.args);

        // Append the predefined tag and the hex tag directly
        const predefinedTagHex = '67686f7374746167'; // 'ghosttag' in hex
        const taggedData = data + predefinedTagHex + tag;

        // Send the transaction with the tagged data
        const tx = await this.contract.runner.sendTransaction({
            to: await this.contract.getAddress(),
            data: taggedData,
            value: resolvedTx.value || 0n,
        });

        return tx;
    }

    // Function to convert a string to hex
    toHex(str) {
        return '0x' + Buffer.from(str, 'utf8').toString('hex');
    }
}

class TaggedContract {
    constructor(contract) {
        this.contract = contract;
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (typeof target.contract[prop] === 'function') {
                    return (...args) => {
                        const promise = target.contract[prop](...args);
                        return new TaggedTransaction(promise, target.contract, prop, args);
                    };
                }
                return Reflect.get(target, prop, receiver);
            }
        });
    }
}

module.exports = { GhostTagStreamer, TaggedContract };
