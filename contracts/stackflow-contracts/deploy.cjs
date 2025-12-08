#!/usr/bin/env node

/**
 * StackFlow M2 - Secure Testnet Deployment Script
 * 
 * Uses environment variables for sensitive data (mnemonics)
 * Ensures .env is not committed to git
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvironment() {
  log('\n🔍 Checking deployment environment...', 'cyan');
  
  // Check if .env exists
  if (!fs.existsSync('.env')) {
    log('❌ Error: .env file not found!', 'red');
    log('📝 Please copy .env.example to .env and fill in your mnemonics:', 'yellow');
    log('   cp .env.example .env', 'cyan');
    process.exit(1);
  }
  
  // Load environment variables
  require('dotenv').config();
  
  // Check required variables
  const required = ['DEPLOYER_MNEMONIC', 'NETWORK'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    log(`❌ Error: Missing required environment variables: ${missing.join(', ')}`, 'red');
    log('📝 Please update your .env file with these values', 'yellow');
    process.exit(1);
  }
  
  // Verify .env is in .gitignore
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (!gitignore.includes('.env')) {
    log('⚠️  Warning: .env is not in .gitignore!', 'yellow');
    log('Adding .env to .gitignore...', 'cyan');
    fs.appendFileSync('.gitignore', '\n# Environment variables (contains secrets)\n.env\n');
    log('✅ Added .env to .gitignore', 'green');
  }
  
  log('✅ Environment check passed', 'green');
}

function generateDeploymentConfig() {
  log('\n📝 Generating deployment configuration...', 'cyan');
  
  const network = process.env.NETWORK || 'testnet';
  const settingsPath = `settings/${network.charAt(0).toUpperCase() + network.slice(1)}.toml`;
  
  const config = `[network]
name = "${network}"
${network === 'testnet' ? 'stacks_node_rpc_address = "https://api.testnet.hiro.so"' : ''}
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "${process.env.DEPLOYER_MNEMONIC}"

${process.env.WALLET_1_MNEMONIC ? `[accounts.wallet_1]
mnemonic = "${process.env.WALLET_1_MNEMONIC}"
` : ''}

${process.env.WALLET_2_MNEMONIC ? `[accounts.wallet_2]
mnemonic = "${process.env.WALLET_2_MNEMONIC}"
` : ''}
`;
  
  // Ensure settings directory exists
  if (!fs.existsSync('settings')) {
    fs.mkdirSync('settings');
  }
  
  fs.writeFileSync(settingsPath, config);
  log(`✅ Generated ${settingsPath}`, 'green');
  
  return settingsPath;
}

function deployContracts() {
  const network = process.env.NETWORK || 'testnet';
  
  try {
    log(`\n🚀 Deploying to ${network}...`, 'cyan');
    
    // Generate deployment plan
    log('Generating deployment plan...', 'blue');
    execSync(`clarinet deployments generate --testnet --medium-cost`, { stdio: 'inherit' });
    
    // Apply deployment (no cost flag for apply)
    log('\nApplying deployment...', 'blue');
    const output = execSync(`clarinet deployments apply --testnet`, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    log(output, 'reset');
    log('\n✅ Deployment successful!', 'green');
    
    // Extract contract addresses from output
    const addressRegex = /([A-Z0-9]{28,41}\.[a-z0-9-]+)/g;
    const addresses = output.match(addressRegex) || [];
    
    if (addresses.length > 0) {
      log('\n📋 Deployed Contract Addresses:', 'cyan');
      addresses.forEach(addr => log(`   ${addr}`, 'green'));
      
      // Save addresses to file
      const addressFile = `deployed-addresses-${network}.txt`;
      fs.writeFileSync(addressFile, addresses.join('\n'));
      log(`\n💾 Addresses saved to ${addressFile}`, 'blue');
    }
    
  } catch (error) {
    log('\n❌ Deployment failed!', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

function cleanup() {
  log('\n🧹 Cleaning up temporary files...', 'cyan');
  
  const network = process.env.NETWORK || 'testnet';
  const settingsPath = `settings/${network.charAt(0).toUpperCase() + network.slice(1)}.toml`;
  
  // Remove generated settings file (contains mnemonic)
  if (fs.existsSync(settingsPath)) {
    fs.unlinkSync(settingsPath);
    log(`✅ Removed ${settingsPath}`, 'green');
  }
}

function configureContracts() {
  log('\n⚙️  Post-deployment configuration...', 'cyan');
  
  log('\n📝 Run these commands to configure your contracts:', 'yellow');
  log('1. Set oracle contract:', 'blue');
  log('   clarinet run --testnet "contract-call? .stackflow-options-m2 set-oracle-contract <ORACLE-ADDRESS>"');
  
  log('\n2. Set sBTC contract:', 'blue');
  log('   clarinet run --testnet "contract-call? .stackflow-options-m2 set-sbtc-contract <SBTC-ADDRESS>"');
  
  log('\n3. Initialize oracle prices:', 'blue');
  log('   clarinet run --testnet "contract-call? .stackflow-oracle-mock initialize-test-prices"');
  
  log('\n4. Verify deployment:', 'blue');
  log('   Visit: https://explorer.hiro.so/?chain=testnet', 'cyan');
}

// Main execution
async function main() {
  log('╔════════════════════════════════════════╗', 'cyan');
  log('║  StackFlow M2 Secure Deployment Tool  ║', 'cyan');
  log('╚════════════════════════════════════════╝', 'cyan');
  
  try {
    // Pre-deployment checks
    checkEnvironment();
    
    // Generate config from env vars
    generateDeploymentConfig();
    
    // Deploy contracts
    deployContracts();
    
    // Cleanup sensitive files
    cleanup();
    
    // Show post-deployment steps
    configureContracts();
    
    log('\n🎉 Deployment complete!', 'green');
    
  } catch (error) {
    log('\n❌ Deployment failed with error:', 'red');
    log(error.message, 'red');
    
    // Cleanup on error
    cleanup();
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n\n⚠️  Deployment interrupted by user', 'yellow');
  cleanup();
  process.exit(0);
});

main();
