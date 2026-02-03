import stacksTransactions from '@stacks/transactions';
const { makeSTXTokenTransfer, broadcastTransaction } = stacksTransactions;
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

    console.log('Creating a test transaction to see which address it uses...');
    
    // Create a test transaction with network: 'testnet'
    const testTx = await makeSTXTokenTransfer({
        recipient: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // dummy
        amount: 1000n,
        senderKey: deployerKey,
        network: 'testnet',
        nonce: 0n,
        fee: 500n,
    });

    // Extract sender from the transaction
    const signerHash = testTx.auth.spendingCondition.signer;
    console.log('\nSigner hash from transaction:', signerHash);
    
    // Now send STX from ST181... to derived address
    console.log('\n=== Preparing Transfer ===');
    console.log('This will transfer funds from your funded wallet to the address that makeSTXTokenTransfer uses');
    
    // We need to manually construct from ST181... or use a different approach
    // Since ST181... has funds, let's use that key to send to the derived address
    
    // Actually, we need to find which key generates ST181...
    // The issue is: wallet.accounts[0].stxPrivateKey generates STPQRW...
    // But we funded ST181... 
    
    // Let me check what address corresponds to STPQRW...
    console.log('\nChecking balance of derived address...');
    const derivedAddr = 'STPQRWQMH3FJQWSVK5BKE0K6S00GEAZJH4MDGND4'; // From earlier debug
    
    const balanceCheck = await fetch(`https://api.testnet.hiro.so/extended/v1/address/${derivedAddr}/balances`);
    const balData = await balanceCheck.json();
    console.log('Derived address balance:', parseInt(balData.stx.balance) / 1000000, 'STX');
    
    console.log('\n=== Solution ===');
    console.log('The deployer key generates:', derivedAddr);
    console.log('But you funded:', 'ST181M24VMPQWDSP5WNBZ3M1722QPYFWJ1212SJ01');
    console.log('\nYou need to fund:', derivedAddr);
    console.log('via the testnet faucet at: https://explorer.hiro.so/sandbox/faucet?chain=testnet');
}

main().catch(console.error);
