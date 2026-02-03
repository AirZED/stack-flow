import { createHash } from 'crypto';
import stacksTransactions from '@stacks/transactions';
const { addressFromVersionHash, addressToString, AddressVersion } = stacksTransactions;

// The signer hash from the transaction
const signerHash = '2d7c72f488df2bf33b9957370266c801072bf289';

console.log('Transaction signer hash:', signerHash);

// Convert to Testnet address
const addrObj = addressFromVersionHash(AddressVersion.TestnetSingleSig, signerHash);
const address = addressToString(addrObj);

console.log('Converted to address:', address);
console.log('Expected address:', 'ST181M24VMPQWDSP5WNBZ3M1722QPYFWJ1212SJ01');
console.log('Match:', address === 'ST181M24VMPQWDSP5WNBZ3M1722QPYFWJ1212SJ01');
