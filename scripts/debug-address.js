import stacksTransactions from '@stacks/transactions';
const { getAddressFromPrivateKey } = stacksTransactions;
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

// Manual Testnet Address Generation (same as traffic-generator.js)
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

    console.log('DEPLOYER_KEY length:', deployerKey.length);
    console.log('DEPLOYER_KEY last 2 chars:', deployerKey.slice(-2));
    
    // Our manual method
    const ourAddress = getTestnetAddress(deployerKey);
    console.log('Our getTestnetAddress():', ourAddress);

    // Try stacks.js default method (might fail or return Mainnet)
    try {
        const stacksjsAddress = getAddressFromPrivateKey(deployerKey);
        console.log('stacks.js getAddressFromPrivateKey():', stacksjsAddress);
    } catch (e) {
        console.log('stacks.js getAddressFromPrivateKey() failed:', e.message);
    }

    // Also check the publicKey derivation
    const pubKey = createStacksPublicKey(deployerKey);
    console.log('Public Key hex:', pubKey.data.toString('hex').slice(0, 20) + '...');
}

main();
