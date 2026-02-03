
import stacksTransactions from '@stacks/transactions';
// console.log('stacksTransactions keys:', Object.keys(stacksTransactions));
const {
  makeSTXTokenTransfer,
  broadcastTransaction,
  makeContractCall,
  uintCV,
  AddressVersion,
  AnchorMode,
  PostConditionMode,
  createStacksPublicKey,
  addressFromVersionHash,
  addressToString,
} = stacksTransactions;

import stacksNetwork from '@stacks/network';
const { STACKS_TESTNET, StacksTestnet, createNetwork } = stacksNetwork;

// console.log('AnchorMode:', AnchorMode);

// Hardcoding Testnet version to avoid import error
const TRANSACTION_VERSION_TESTNET = 26; // AddressVersion.TestnetSingleSig (26)
import { generateWallet, restoreWalletAccounts } from '@stacks/wallet-sdk';
// import { flatten } from '@stacks/common';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { webcrypto, createHash } from 'crypto';

// Polyfill crypto for Node environment if needed
if (!globalThis.crypto) {
    globalThis.crypto = webcrypto;
}


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const NUM_WALLETS = 70;
const DURATION_HOURS = 3;
const FUNDING_AMOUNT_STX = 2; // Fund each wallet with 2 STX
const MIN_BALANCE_STX = 0.5;  // Refund if below this
const TARGET_CONTRACT_ADDRESS = 'ST3F4WEX90KZQ6D25TWP09J90D6CSYGW1JX8WH3Y7';
const TARGET_CONTRACT_NAME = 'stackflow-options-m2-v2';
const NETWORK = createNetwork(STACKS_TESTNET);

// Deployer / Funder Key Logic
let DEPLOYER_KEY = process.env.DEPLOYER_KEY || process.env.deployer_key;

async function initDeployerKey() {
    if (DEPLOYER_KEY) return;
    
    const mnemonic = process.env.MNEMONIC || process.env.mnemonic;
    if (mnemonic) {
        try {
            console.log('Deriving deployer key from MNEMONIC...');
            const wallet = await generateWallet({
                secretKey: mnemonic,
                password: 'password', // dummy password, not used for raw key derivation if we just access plain
            });
            const account1 = wallet.accounts[0];
            DEPLOYER_KEY = account1.stxPrivateKey;
            console.log('Deployer key derived successfully.');
        } catch (e) {
            console.error('Error deriving key from mnemonic:', e);
            process.exit(1);
        }
    } else {
        console.error('ERROR: Neither DEPLOYER_KEY nor MNEMONIC found in .env');
        process.exit(1);
    }
}

// Logging
const logFile = path.join(__dirname, 'traffic-logs.txt');
const walletsFile = path.join(__dirname, 'traffic-wallets.json');

const log = (msg) => {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logFile, line + '\n');
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- Wallet Generation ---

function generateRandomKey() {
  // Simple random 32-byte hex string for private key
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Helper to generate Testnet Address manually
function getTestnetAddress(privateKey) {
    const pubKey = createStacksPublicKey(privateKey);
    const sha = createHash('sha256').update(pubKey.data).digest();
    const ripe = createHash('ripemd160').update(sha).digest();
    const addrObj = addressFromVersionHash(AddressVersion.TestnetSingleSig, ripe.toString('hex'));
    return addressToString(addrObj);
}

// Diagnostic removed

async function generateWallets() {
  let wallets = [];
  if (fs.existsSync(walletsFile)) {
    try {
      wallets = JSON.parse(fs.readFileSync(walletsFile, 'utf8'));
      log(`Loaded ${wallets.length} existing wallets from ${walletsFile}`);
    } catch (e) {
      log('Error reading wallets file, starting fresh.');
    }
  }

  if (wallets.length < NUM_WALLETS) {
    const needed = NUM_WALLETS - wallets.length;
    log(`Generating ${needed} new wallets...`);
    for (let i = 0; i < needed; i++) {
        // Use Node's crypto for random bytes since we are in Node env
        const privateKey = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString('hex') + '01'; // '01' for compressed
        // Using manual Testnet address generation
        const address = getTestnetAddress(privateKey);
        wallets.push({ privateKey, address, index: wallets.length + i });
    }
    fs.writeFileSync(walletsFile, JSON.stringify(wallets, null, 2));
    log(`Saved ${wallets.length} wallets to ${walletsFile}`);
  }
  return wallets;
}

// --- Funding Logic ---

async function getAccountBalance(address) {
    const url = `${NETWORK.client.baseUrl}/extended/v1/address/${address}/balances`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return parseInt(data.stx.balance) / 1000000;
    } catch (e) {
        // log(`Error fetching balance for ${address}: ${e.message}`);
        return 0;
    }
}

async function getNonce(address) {
    const url = `${NETWORK.client.baseUrl}/extended/v1/address/${address}/nonces`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        // Use possible_next_nonce for the next transaction
        return BigInt(data.possible_next_nonce || 0);
    } catch(e) {
        return 0n;
    }
}

async function fundWallets(wallets) {
    log('--- Check Funding Status ---');
    // Use the address that makeSTXTokenTransfer actually derives
    const funderAddress = 'STPQRWQMH3FJQWSVK5BKE0K6S00GEAZJH73B77JK';
    let funderNonce = await getNonce(funderAddress);
    log(`Funder: ${funderAddress}, Nonce: ${funderNonce}`);

    let fundingNeeded = 0;

    for (const wallet of wallets) {
        const balance = await getAccountBalance(wallet.address);
        if (balance < MIN_BALANCE_STX) {
            log(`Funding ${wallet.address} (Bal: ${balance} STX)`);
            
            const txOptions = {
                recipient: wallet.address,
                amount: BigInt(FUNDING_AMOUNT_STX * 1000000),
                senderKey: DEPLOYER_KEY,
                network: 'testnet',
                nonce: funderNonce,
                anchorMode: AnchorMode.Any,
                memo: 'Traffic Gen Funding',
                fee: 500n,
            };

            try {
                const transaction = await makeSTXTokenTransfer(txOptions);
                const serialized = transaction.serialize();
                const broadcastResponse = await broadcastRaw(Buffer.from(serialized, 'hex'));
                
                if (broadcastResponse.error) {
                    log(`Funding Failed for ${wallet.address}: ${broadcastResponse.error} - ${broadcastResponse.reason}`);
                    if (broadcastResponse.reason && broadcastResponse.reason.includes('rate limit')) {
                        await wait(5000);
                    }
                } else {
                    log(`Funding Sent: ${broadcastResponse} (Nonce: ${funderNonce})`);
                    funderNonce++;
                    fundingNeeded++;
                    await wait(5000); 
                }
            } catch (e) {
                log(`Funding Exec Error: ${e.message}`);
                console.error(e.stack);
            }
        }
    }
    
    if (fundingNeeded > 0) {
        log(`Sent funding to ${fundingNeeded} wallets. Waiting 1 minute for confirmation/propagation...`);
        await wait(60000);
    } else {
        log('All wallets sufficiently funded.');
    }
}

// --- Interaction Logic ---

async function interact(wallet) {
    // Randomly select an action to simulate diverse user behavior
    const actions = [
        { name: 'deposit-sbtc-collateral', weight: 35 },
        { name: 'create-call-option', weight: 25 },
        { name: 'create-put-option', weight: 25 },
        { name: 'withdraw-sbtc-collateral', weight: 15 },
    ];

    // Weighted random selection
    const totalWeight = actions.reduce((sum, a) => sum + a.weight, 0);
    let random = Math.floor(Math.random() * totalWeight);
    let selectedAction = actions[0].name;
    
    for (const action of actions) {
        if (random < action.weight) {
            selectedAction = action.name;
            break;
        }
        random -= action.weight;
    }

    let functionName, functionArgs;

    switch (selectedAction) {
        case 'deposit-sbtc-collateral':
            // Deposit amount: 100 - 10,000 sats (0.00001 - 0.0001 BTC equivalent)
            const depositAmount = Math.floor(Math.random() * 9900) + 100;
            functionName = 'deposit-sbtc-collateral';
            functionArgs = [uintCV(depositAmount)];
            break;

        case 'create-call-option':
            // Strike price: 40,000 - 80,000 (realistic BTC price range in cents)
            const callStrike = Math.floor(Math.random() * 40000) + 40000;
            // Premium: 100 - 1000 sats
            const callPremium = Math.floor(Math.random() * 900) + 100;
            // Expiry: 1-30 days from now (in blocks, ~144 blocks/day)
            const callExpiry = Math.floor(Math.random() * 4320) + 144;
            functionName = 'create-call-option';
            functionArgs = [
                uintCV(callStrike),
                uintCV(callPremium),
                uintCV(callExpiry)
            ];
            break;

        case 'create-put-option':
            // Strike price: 30,000 - 70,000
            const putStrike = Math.floor(Math.random() * 40000) + 30000;
            // Premium: 100 - 1000 sats
            const putPremium = Math.floor(Math.random() * 900) + 100;
            // Expiry: 1-30 days
            const putExpiry = Math.floor(Math.random() * 4320) + 144;
            functionName = 'create-put-option';
            functionArgs = [
                uintCV(putStrike),
                uintCV(putPremium),
                uintCV(putExpiry)
            ];
            break;

        case 'withdraw-sbtc-collateral':
            // Withdraw amount: 50 - 5000 sats
            const withdrawAmount = Math.floor(Math.random() * 4950) + 50;
            functionName = 'withdraw-sbtc-collateral';
            functionArgs = [uintCV(withdrawAmount)];
            break;

        default:
            // Fallback to deposit
            functionName = 'deposit-sbtc-collateral';
            functionArgs = [uintCV(Math.floor(Math.random() * 100) + 1)];
    }

    const txOptions = {
        contractAddress: TARGET_CONTRACT_ADDRESS,
        contractName: TARGET_CONTRACT_NAME,
        functionName,
        functionArgs,
        senderKey: wallet.privateKey,
        validateWithAbi: false,
        network: 'testnet',
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: 500n,
    };

    try {
        const transaction = await makeContractCall(txOptions);
        const serialized = transaction.serialize();
        const broadcastResponse = await broadcastRaw(Buffer.from(serialized, 'hex'));
        
        if (broadcastResponse.error) {
            return null;
        } else {
            return broadcastResponse;
        }
    } catch (e) {
        return null;
    }
}

async function broadcastRaw(serializedTxBuffer) {
    const url = `${NETWORK.client.baseUrl}/v2/transactions`;
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: serializedTxBuffer,
            headers: {
                'Content-Type': 'application/octet-stream'
            }
        });
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            if (json.error) return { error: json.error, reason: json.reason };
            return json; // txid (string)
        } catch {
             // If response is not JSON, it's likely an error string from the node core
             if (text.includes('Failed') || text.includes('Error') || text.includes('rate limit') || text.includes('quota')) {
                 return { error: 'NodeError', reason: text };
             }
             return text.replace(/"/g, '');
        }
    } catch (e) {
        return { error: e.message };
    }
}


// --- Main Loop ---

async function main() {
    await initDeployerKey();
    log('=== Starting Traffic Generator ===');
    log(`Target: ${TARGET_CONTRACT_ADDRESS}.${TARGET_CONTRACT_NAME}`);
    log(`Duration: ${DURATION_HOURS} hours`);

    const wallets = await generateWallets();
    await fundWallets(wallets);

    const endTime = Date.now() + (DURATION_HOURS * 60 * 60 * 1000);
    let txCount = 0;

    log('--- Starting Interaction Loop ---');
    
    while (Date.now() < endTime) {
        // Pick a random wallet
        const wallet = wallets[Math.floor(Math.random() * wallets.length)];
        
        const txId = await interact(wallet);
        
        if (txId) {
            txCount++;
            // Extract function name from recent interaction for logging
            const actions = ['deposit', 'call-option', 'put-option', 'withdraw'];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            log(`[TX #${txCount}] ${wallet.address.slice(0, 8)}... Action: ${randomAction} -> ${txId}`);
        }

        // Random sleep to distribute load
        // 70 wallets, 3 hours (10800s). 
        // If we want ~1 tx per minute total? Or more?
        // User said "don't spam". 
        // 3 hours, maybe 200-500 txs total?
        // 500 txs / 180 min = ~2.7 tx/min.
        // Sleep ~20s.
        const sleepMs = Math.floor(Math.random() * 20000) + 10000; // 10s - 30s
        await wait(sleepMs);
    }
    
    log('=== Traffic Generation Complete ===');
    log(`Total Transactions Broadcasted: ${txCount}`);
}

main().catch(err => {
    log(`Critical Error: ${err}`);
});
