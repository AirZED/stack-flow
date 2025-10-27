import { readFileSync } from 'fs';
import transactionsPkg from '@stacks/transactions';
import { STACKS_TESTNET } from '@stacks/network';

const { makeContractDeploy, broadcastTransaction, AnchorMode } = transactionsPkg;

// Read the StackFlow M1 contract code
const contractCode = readFileSync('./contracts/stackflow-options-m1.clar', 'utf8');

// Deployment configuration
const contractName = 'stackflow-options-m1';
const network = STACKS_TESTNET;
const senderAddress = 'SP3F4WEX90KZQ6D25TWP09J90D6CSYGW1JWXN5YF4';
const privateKey = 'dd02c152b0271dcc080ef642a972ab8d6fb81f9e6e308e435d7fbe5fd3bf351101';

console.log('🚀 Deploying StackFlow Options M1 to Stacks Testnet...\n');

console.log('Contract Details:');
console.log(`Name: ${contractName}`);
console.log(`Network: Testnet`);
console.log(`Sender: ${senderAddress}`);
console.log(`Private Key: ${privateKey.substring(0, 8)}...${privateKey.substring(-8)}`);

// Deployment options
const txOptions = {
  contractName: contractName,
  codeBody: contractCode,
  senderKey: privateKey,
  network: network,
  anchorMode: AnchorMode.Any,
  fee: 500000n, // 0.5 STX fee (higher for complex contract)
};

async function deployContract() {
  try {
    console.log('\n📝 Creating StackFlow M1 contract deployment transaction...');
    
    const transaction = await makeContractDeploy(txOptions);
    
    console.log('✅ Transaction created successfully!');
    console.log('\n🌐 Broadcasting transaction to network...');
    
    const broadcastResponse = await broadcastTransaction({ transaction, network });
    
    if (broadcastResponse.error) {
      console.error('\n❌ Deployment failed:');
      console.error(broadcastResponse);
      process.exit(1);
    }
    
    console.log('\n🎉 StackFlow Options M1 deployed successfully!');
    console.log(`📋 Transaction ID: ${broadcastResponse.txid}`);
    console.log(`🔗 View transaction: https://explorer.hiro.so/txid/${broadcastResponse.txid}?chain=testnet`);
    console.log(`\n📄 Contract address: ${senderAddress}.${contractName}`);
    console.log(`\n⏳ Transaction status: Pending confirmation`);
    console.log(`📝 Note: Wait for transaction confirmation (usually 1-2 blocks, ~10-20 minutes)`);
    console.log(`\n🎯 Once confirmed, your contract will be live at: ${senderAddress}.${contractName}`);
    console.log(`\n🔧 StackFlow M1 Features:`);
    console.log(`   - CALL Options: Bitcoin-secured call options`);
    console.log(`   - Bull Put Spread (BPSP): Advanced options strategies`);
    console.log(`   - Protocol Fee Management: 10 bps default fee`);
    console.log(`   - Pause/Unpause: Emergency controls`);
    console.log(`   - Oracle Integration: Price feed support`);
    console.log(`   - Settlement System: Automated option settlement`);
    console.log(`\n📝 Next Steps:`);
    console.log(`   1. Update frontend .env file with new contract name: ${contractName}`);
    console.log(`   2. Update frontend contract address: ${senderAddress}`);
    console.log(`   3. Test the frontend to ensure everything works correctly`);
    console.log(`   4. Verify contract functions using Stacks Explorer`);
    console.log(`\n🔍 Contract Functions Available:`);
    console.log(`   - create-call-option: Create Bitcoin call options`);
    console.log(`   - create-bull-put-spread: Create BPSP strategies`);
    console.log(`   - exercise-option: Exercise profitable options`);
    console.log(`   - settle-expired: Settle expired options`);
    console.log(`   - get-option: Read option details`);
    console.log(`   - get-user-options: Get user's options`);
    console.log(`   - get-stats: Get protocol statistics`);
    
  } catch (error) {
    console.error('\n❌ Error deploying StackFlow M1 contract:');
    console.error(error);
    process.exit(1);
  }
}

deployContract();