import dotenv from 'dotenv';
import { dbService } from '../src/lib/db.ts';

dotenv.config();

const STACKS_API_URL = process.env.VITE_STACKS_API_URL || 'https://api.mainnet.hiro.so';

/**
 * Curated whale addresses for initial seeding
 * Mix of known DeFi participants, large holders, and active traders
 */
const SEED_WHALES = [
  // Large DeFi participants
  'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE', // Known Stacks DeFi whale
  'SP2BE8TZATXEVPGZ8HAFZYE5GKZ02X0YJHB9MZ5G8', // Active trader
  'SP3MBWGMCVC9KZ5DTAYFMG1D0AEJCR7NENTM3FTK', // Large ALEX holder
  
  // Protocol participants (large stakers/LPs)
  'SP1QK1AZ24R132C0D84EEQ8Y2JDHARDR58SMAYMMW', // StackingDAO participant
  'SP2507VNQZC9VBXM7X7KB3QMKNZ4VQ3GXQPF8XKJY', // ALEX LP provider
  'SP1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRCBGD7R', // Velar trader
  
  // Known active addresses from explorer
  'SP3K3E8XD4Y9JXJ0DMWXH1S3H8QEKJTDBKWT5KYHY', // High volume trader
  'SP13BFK34Q1FMZF13E5F50Z6TSPXK4V8R8V7HH93Z', // NFT + DeFi whale
  'SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS', // Multi-protocol user
  'SP1JT8TTFMH4Y1WJXR0CQM8D6T2F8P82XEVBJKMZ6', // Active stacker
  
  // Additional diverse participants
  'SP3Y8M2WK1RS7YBF6FEB3Q1FG7YV29VPQ0CSB5MZJ', // Governance participant  
  'SP2F2KH0RVX6GF1Y9FWMMSR9RHG0TW3TP68BTF4F8', // Yield farmer
  'SP1QJE8YMB3M9STMR5ZA3NP5WBYY2K8Q6FH6S9KC6', // Trading bot operator
  'SP37QZFPJGT3NN3Z0MB9YS7EHRHMMW4X8G4BG4HCA', // Large institutional holder
  'SP2N3BAG4GBF8NHRPH7YP36M4BCBTPVG5H2X57C8E', // Active on-chain analyst
  
  // Cross-chain participants
  'SP1M3V3K9WG6GX2C9T8E4C5MDNP83CRBW7S8VPH0K', // sBTC bridge user
  'SP2KD6MCMWGZNK8B4QBKR8VQXBQ9V3H6C2TPWP2QY', // Bitcoin-Stacks arbitrageur
  'SP3GGPQWFWDJ9RX0CMVQ1CC5BE2H5DCJBF57W8XEK', // Multi-chain whale
  
  // Recent high-activity addresses
  'SP1KBVBP3AZP8KD4K7H8E5R2M6G8FQQGTPV5JXP3T', // New DeFi entrant
  'SP2RTRY5C8WMQE9T3GXJVHVBQDHQN8Z4F5HBKQYVN', // Recent ALEX/WELSH accumulator
];

/**
 * Known protocol contracts to track (not whales, but important for context)
 */
const PROTOCOL_CONTRACTS = {
  'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9': { name: 'ALEX DEX', type: 'defi' },
  'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR': { name: 'Arkadiko', type: 'defi' },
  'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1': { name: 'Velar', type: 'defi' },
  'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9': { name: 'Gamma', type: 'nft' },
  'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG': { name: 'StackingDAO', type: 'stacking' },
};

/**
 * SIP-010 tokens to track
 */
const TRACKED_TOKENS = {
  'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token': 'ALEX',
  'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token': 'WELSH',
  'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token': 'sBTC',
  'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token': 'DIKO',
  'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275.stackswap-token-v4b': 'STSW',
};

// Rate limiting
let lastApiCall = 0;
const MIN_API_INTERVAL = 300; // 300ms between API calls

async function rateLimitedFetch(url) {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < MIN_API_INTERVAL) {
    await new Promise(r => setTimeout(r, MIN_API_INTERVAL - timeSinceLastCall));
  }
  
  lastApiCall = Date.now();
  return fetch(url);
}

/**
 * Fetch complete address data including SIP-010 tokens
 */
async function fetchAddressData(address) {
  try {
    console.log(`[Seeder] Fetching data for ${address.slice(0, 8)}...`);
    
    const response = await rateLimitedFetch(
      `${STACKS_API_URL}/extended/v1/address/${address}/balances`
    );
    
    if (!response.ok) {
      console.error(`[Seeder] Failed to fetch ${address}: ${response.status}`);
      return null;
    }
    
    const data = await response.json();
    
    // Parse STX balance
    const stxBalance = parseInt(data.stx.balance) / 1_000_000;
    const stxLocked = parseInt(data.stx.locked) / 1_000_000;
    
    // Parse SIP-010 tokens
    const tokens = [];
    const fungibleTokens = data.fungible_tokens || {};
    
    for (const [contract, tokenData] of Object.entries(fungibleTokens)) {
      const symbol = TRACKED_TOKENS[contract] || contract.split('.')[1]?.slice(0, 10) || 'UNKNOWN';
      const balance = parseInt(tokenData.balance) / 1_000_000; // Assume 6 decimals for most
      
      if (balance > 0) {
        tokens.push({
          contract,
          symbol,
          balance,
          valueUSD: 0 // Will be calculated with price feeds later
        });
      }
    }
    
    return {
      address,
      stxBalance,
      stxLocked,
      tokens
    };
    
  } catch (error) {
    console.error(`[Seeder] Error fetching ${address}:`, error.message);
    return null;
  }
}

/**
 * Fetch recent transactions to calculate activity
 */
async function fetchActivityMetrics(address) {
  try {
    const response = await rateLimitedFetch(
      `${STACKS_API_URL}/extended/v1/address/${address}/transactions?limit=50`
    );
    
    if (!response.ok) return { txCount: 0, protocols: [] };
    
    const data = await response.json();
    const transactions = data.results || [];
    
    // Filter to last 30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const recentTxs = transactions.filter(tx => 
      tx.burn_block_time && (tx.burn_block_time * 1000) > thirtyDaysAgo
    );
    
    // Identify protocols
    const protocols = new Set();
    transactions.forEach(tx => {
      if (tx.tx_type === 'contract_call' && tx.contract_call?.contract_id) {
        const [contractAddr] = tx.contract_call.contract_id.split('.');
        const protocol = PROTOCOL_CONTRACTS[contractAddr];
        if (protocol) {
          protocols.add(protocol.name);
        }
      }
    });
    
    return {
      txCount30d: recentTxs.length,
      txCount90d: transactions.length,
      protocols: Array.from(protocols),
      lastActiveAt: transactions[0]?.burn_block_time 
        ? new Date(transactions[0].burn_block_time * 1000).toISOString()
        : new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`[Seeder] Error fetching activity for ${address}:`, error.message);
    return { txCount30d: 0, txCount90d: 0, protocols: [], lastActiveAt: new Date().toISOString() };
  }
}

function calculateScore(whale) {
  const balanceScore = Math.min(100, (whale.portfolio.stxBalance / 1_000_000) * 10);
  const activityScore = Math.min(100, (whale.stats?.txCount30d || 0) * 2);
  const diversityScore = Math.min(100, (whale.stats?.protocolsUsed?.length || 0) * 20);
  const tokenScore = Math.min(100, (whale.portfolio?.tokens?.length || 0) * 10);
  
  return {
    composite: Math.round(balanceScore * 0.40 + activityScore * 0.25 + diversityScore * 0.20 + tokenScore * 0.15),
    balance: Math.round(balanceScore),
    activity: Math.round(activityScore),
    diversity: Math.round(diversityScore),
    tokens: Math.round(tokenScore)
  };
}

/**
 * Determine activity level
 */
function getActivityLevel(txCount) {
  if (txCount >= 50) return 'high';
  if (txCount >= 20) return 'medium';
  return 'low';
}

/**
 * Main seeding function
 */
async function seedWhales() {
  console.log('[Seeder] 🌱 Starting whale seeding process...');
  console.log(`[Seeder] Processing ${SEED_WHALES.length} addresses`);
  
  // Connect to MongoDB
  try {
    await dbService.connect();
    console.log('[Seeder] ✅ Connected to MongoDB');
  } catch (error) {
    console.error('[Seeder] ❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
  
  const whales = [];
  let processed = 0;
  
  for (const address of SEED_WHALES) {
    processed++;
    console.log(`[Seeder] [${processed}/${SEED_WHALES.length}] Processing ${address.slice(0, 12)}...`);
    
    // Fetch balance and activity data
    const [balanceData, activityData] = await Promise.all([
      fetchAddressData(address),
      fetchActivityMetrics(address)
    ]);
    
    if (!balanceData) {
      console.log(`[Seeder] ⚠️  Skipping ${address} - failed to fetch data`);
      continue;
    }
    
    // Build whale profile
    const whale = {
      address,
      discoveredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      
      portfolio: {
        stxBalance: balanceData.stxBalance,
        stxLocked: balanceData.stxLocked,
        tokens: balanceData.tokens,
        totalValueUSD: balanceData.stxBalance * 1.5 // Rough estimate, will update with real prices
      },
      
      stats: {
        txCount30d: activityData.txCount30d,
        txCount90d: activityData.txCount90d,
        volume30dSTX: 0, // Will calculate from transaction values later
        protocolsUsed: activityData.protocols,
        lastActiveAt: activityData.lastActiveAt,
        activityLevel: getActivityLevel(activityData.txCount30d)
      },
      
      classification: {
        type: 'whale', // Manual seed assumed to be whales
        confidence: 0.9,
        tags: activityData.protocols.map(p => p.toLowerCase().replaceAll(' ', '_'))
      },
      
      source: 'manual_seed',
      verified: false,
      alias: null
    };
    
    // Calculate scores
    whale.scores = calculateScore(whale);
    
    whales.push(whale);
    
    console.log(`[Seeder] ✓ ${address.slice(0, 12)}: ${whale.portfolio.stxBalance.toLocaleString()} STX, ${whale.portfolio.tokens.length} tokens, Score: ${whale.scores.composite}`);
  }
  
  // Store in MongoDB
  console.log(`\n[Seeder] 💾 Storing ${whales.length} whales in MongoDB...`);
  
  try {
    const collection = dbService.getCollection('whales');
    
    for (const whale of whales) {
      await collection.updateOne(
        { address: whale.address },
        { $set: whale },
        { upsert: true }
      );
    }
    
    console.log('[Seeder] ✅ Successfully seeded whales');
    
    // Print summary
    console.log('\n[Seeder] 📊 Summary:');
    console.log(`   Total whales: ${whales.length}`);
    console.log(`   Avg STX balance: ${(whales.reduce((sum, w) => sum + w.portfolio.stxBalance, 0) / whales.length).toLocaleString()}`);
    console.log(`   Total tokens tracked: ${whales.reduce((sum, w) => sum + w.portfolio.tokens.length, 0)}`);
    console.log(`   High activity: ${whales.filter(w => w.stats.activityLevel === 'high').length}`);
    console.log(`   Medium activity: ${whales.filter(w => w.stats.activityLevel === 'medium').length}`);
    console.log(`   Low activity: ${whales.filter(w => w.stats.activityLevel === 'low').length}`);
    
  } catch (error) {
    console.error('[Seeder] ❌ Error storing whales:', error);
    process.exit(1);
  }
  
  await dbService.close();
  console.log('\n[Seeder] 🎉 Seeding complete!');
  process.exit(0);
}

// Run the seeder
seedWhales();
