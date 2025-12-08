#!/usr/bin/env node

const bip39 = require('bip39');
const { generateWallet } = require('@stacks/wallet-sdk');
const { getAddressFromPrivateKey } = require('@stacks/transactions');
const fs = require('fs');

async function generateTestnetWallet() {
  const mnemonic = bip39.generateMnemonic(256);
  
  console.log('\n🔄 Generating testnet wallet...\n');
  
  const wallet = await generateWallet({ secretKey: mnemonic, password: '' });
  const account = wallet.accounts[0];
  
  // Transaction version: 0x80 = Testnet (ST prefix), 0x16 = Mainnet (SP prefix)
  const testnetAddress = getAddressFromPrivateKey(account.stxPrivateKey, 0x80);
  
  console.log('✅ TESTNET WALLET GENERATED\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Mnemonic (24 words):');
  console.log(mnemonic);
  console.log('\n📬 Testnet Address:');
  console.log(testnetAddress);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (testnetAddress.startsWith('ST')) {
    console.log('✅ SUCCESS: Valid ST testnet address!\n');
  } else {
    console.log(`⚠️  Got ${testnetAddress.substring(0,2)} prefix instead of ST\n`);
  }
  
  const envContent = `# StackFlow M2 Testnet Wallet
# NEVER commit this file to git!

NETWORK=testnet

# Deployer wallet credentials
DEPLOYER_MNEMONIC="${mnemonic}"
DEPLOYER_ADDRESS="${testnetAddress}"

# Optional additional wallets
WALLET_1_MNEMONIC=""
WALLET_2_MNEMONIC=""

# Contract addresses (populated after deployment)
ORACLE_CONTRACT_ADDRESS=""
SBTC_CONTRACT_ADDRESS=""
M2_CONTRACT_ADDRESS=""
`;
  
  fs.writeFileSync('.env', envContent);
  console.log('✅ Saved credentials to .env file\n');
  
  console.log('📝 NEXT STEPS:\n');
  console.log(`1. Fund this address with testnet STX:`);
  console.log(`   ${testnetAddress}\n`);
  console.log(`   Faucet: https://explorer.hiro.so/sandbox/faucet?chain=testnet&address=${testnetAddress}\n`);
  console.log('2. Wait 1-2 minutes, then check balance:');
  console.log(`   https://explorer.hiro.so/address/${testnetAddress}?chain=testnet\n`);
  console.log('3. Once funded, deploy contracts:');
  console.log('   node deploy.js\n');
  
  return { mnemonic, testnetAddress };
}

generateTestnetWallet().catch(e => {
  console.error('\n❌ Error generating wallet:', e.message);
  process.exit(1);
});
