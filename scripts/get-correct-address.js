import stacksTransactions from '@stacks/transactions';
const { makeSTXTokenTransfer, getAddressFromPrivateKey } = stacksTransactions;
import { generateWallet } from '@stacks/wallet-sdk';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic) {
        console.error('MNEMONIC not found');
        process.exit(1);
    }

    const wallet = await generateWallet({ secretKey: mnemonic, password: 'password' });
    const deployerKey = wallet.accounts[0].stxPrivateKey;

    console.log('=== Method 1: Using getAddressFromPrivateKey ===');
    try {
        const addr1 = getAddressFromPrivateKey(deployerKey);
        console.log('Mainnet:', addr1);
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('\n=== Method 2: From actual transaction ===');
    // Create a real transaction
    const tx = await makeSTXTokenTransfer({
        recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
        amount: 1000n,
        senderKey: deployerKey,
        network: 'testnet',
        nonce: 0n,
        fee: 500n,
    });

    // Serialize and inspect
    const serialized = tx.serialize();
    const buf = Buffer.from(serialized, 'hex');
    
    console.log('Transaction version byte:', buf[0], '(should be 128 for testnet)');
    
    // The spending condition contains the address
    // Let's manually extract it from the serialized transaction
    // Structure: version(1) | chainId(4) | auth...
    // Auth structure for standard: type(1) | hashmode(1) | signer(20) | nonce(8) | fee(8) | ...
    
    const version = buf[0];
    const authTypeOffset = 5; // After version(1) + chainID(4)
    const hashModeOffset = 6;
    const signerOffset = 7;
    
    const signerHash = buf.slice(signerOffset, signerOffset + 20).toString('hex');
    console.log('Signer hash from serialized tx:', signerHash);
    
    // Now use stacks.js to properly convert this to c32
    const { addressFromVersionHash, addressToString, AddressVersion } = stacksTransactions;
    const testnetAddr = addressToString(addressFromVersionHash(AddressVersion.TestnetSingleSig, signerHash));
    console.log('Testnet address (c32):', testnetAddr);
    
    // Verify it
    console.log('\n=== Verification ===');
    const balanceCheck = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${testnetAddr}/balances`);
    if (balanceCheck.ok) {
        const data = await balanceCheck.json();
        console.log('✓ Address is valid');
        console.log('Balance:', parseInt(data.stx.balance) / 1000000, 'STX');
    } else {
        console.log('✗ Address validation failed');
    }
    
    console.log('\n=== FUND THIS ADDRESS ===');
    console.log(testnetAddr);
}

main().catch(console.error);
