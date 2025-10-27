// Simple test to verify the deployed M1 contract is accessible
import https from 'https';

const contractAddress = 'ST3F4WEX90KZQ6D25TWP09J90D6CSYGW1JX8WH3Y7';
const contractName = 'stackflow-options-m1';

console.log('🧪 Testing Deployed M1 Contract');
console.log('================================');
console.log(`Contract: ${contractAddress}.${contractName}`);
console.log(`Network: Stacks Testnet`);
console.log('');

// Test 1: Check if contract exists via API
function testContractExists() {
  return new Promise((resolve) => {
    const url = `https://api.testnet.hiro.so/v2/contracts/call-read/${contractAddress}/${contractName}/get-stats`;
    
    console.log('📊 Testing contract accessibility...');
    console.log(`API URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ Contract is accessible!');
          console.log('📋 Contract stats:', result);
          resolve(true);
        } catch (error) {
          console.log('❌ Failed to parse response:', error.message);
          console.log('Raw response:', data);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ API request failed:', error.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Request timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test 2: Check contract source code
function testContractSource() {
  return new Promise((resolve) => {
    const url = `https://api.testnet.hiro.so/v2/contracts/source/${contractAddress}/${contractName}`;
    
    console.log('\n📄 Testing contract source code...');
    console.log(`API URL: ${url}`);
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.source) {
            console.log('✅ Contract source code is accessible!');
            console.log(`📏 Source length: ${result.source.length} characters`);
            console.log(`🔧 Clarity version: ${result.clarity_version || 'Unknown'}`);
            resolve(true);
          } else {
            console.log('❌ No source code found');
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Failed to parse source response:', error.message);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Source request failed:', error.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      console.log('❌ Source request timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Run tests
async function runTests() {
  console.log('🚀 Starting deployed contract verification...\n');
  
  const results = [];
  
  // Test 1: Contract accessibility
  results.push(await testContractExists());
  
  // Test 2: Contract source
  results.push(await testContractSource());
  
  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n📋 Test Summary');
  console.log('===============');
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${(passed/total*100).toFixed(1)}%`);
  
  if (passed === total) {
    console.log('🎉 Contract is deployed and accessible!');
    console.log('✅ Ready for real contract interactions');
  } else {
    console.log('⚠️  Contract may not be fully deployed yet');
    console.log('💡 Wait a few minutes and try again');
  }
  
  console.log('\n🔗 View contract on explorer:');
  console.log(`https://explorer.hiro.so/address/${contractAddress}?chain=testnet`);
}

// Run the tests
runTests().catch(console.error);
