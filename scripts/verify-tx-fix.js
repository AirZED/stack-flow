import stacksTransactions from '@stacks/transactions';
const { makeSTXTokenTransfer, AnchorMode } = stacksTransactions;
import { generateWallet } from '@stacks/wallet-sdk';
import dotenv from 'dotenv';
import { createHash } from 'crypto';

dotenv.config();

const {
  createStacksPublicKey,
  addressFromVersionHash,
  addressToString,
  AddressVersion,
} = stacksTransactions;

// Manual Testnet Address Generation
function getTestnetAddress(privateKey) {
    const pubKey = createStacksPublicKey(privateKey);
    const sha = createHash('sha256').update(pubKey.data).digest();
    const ripe = createHash('ripemd160').update(sha).digest();
    const addrObj = addressFromVersionHash(AddressVersion.TestnetSingleSig, ripe.toString('hex'));
    return addressToString(addrObj);
}

async function main() {
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.error('MNEMONIC not found in .env');
        process.exit(1);
    }

    const wallet = await generateWallet({ secretKey: mnemonic, password: 'password' });
    const deployerKey = wallet.accounts[0].stxPrivateKey;

    console.log('=== Testing Transaction Creation ===');
    console.log('Our manual address:', getTestnetAddress(deployerKey));

    // Create a test transaction with network: 'testnet' (the fix)
    const txOptions = {
        recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        amount: 1000000n,
        senderKey: deployerKey,
        network: 'testnet', // THE FIX
        nonce: 0n,
        anchorMode: AnchorMode.Any,
        fee: 500n,
    };

    console.log('\nCreating transaction with network: "testnet"...');
    const tx = await makeSTXTokenTransfer(txOptions);
    
    // Extract the actual sender address from the transaction
    console.log('\n=== Transaction Auth ===');
    console.log('Auth type:', tx.auth.authType);
    console.log('Auth spendingCondition:', tx.auth.spendingCondition);
    
    // The spendingCondition should contain the signer address
    if (tx.auth.spendingCondition && tx.auth.spendingCondition.signer) {
        const signerAddr = addressToString(tx.auth.spendingCondition.signer);
        console.log('Transaction signer address:', signerAddr);
        console.log('\nDoes it match our manual address?', signerAddr === getTestnetAddress(deployerKey));
    }

    // Also serialize and check first bytes
    const serialized = tx.serialize();
    console.log('\n=== Serialization ===');
    console.log('Type:', serialized.constructor.name);
    console.log('Length:', serialized.length);
    
    if (typeof serialized === 'string') {
        // Hex string
        const buf = Buffer.from(serialized, 'hex');
        console.log('First 20 bytes (hex):', buf.slice(0, 20).toString('hex'));
        console.log('Version byte:', buf[0], '(should be 128 for Testnet)');
    }
}

main().catch(console.error);
