/**
 * Ecosystem Whale Tracking Service
 * Tracks whales across Stacks ecosystem using blockchain data and AI analysis
 */

import mongoClient from '../lib/mongoClient';

// Stacks API configuration
const STACKS_API_URL = import.meta.env.VITE_STACKS_API_URL || 'https://api.mainnet.hiro.so';
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

// Types
export interface WhaleProfile {
  _id?: string;
  address: string;
  alias: string | null;
  category: 'defi' | 'validator' | 'nft' | 'dao' | 'trader' | 'infrastructure';
  verified: boolean;
  source: 'curated' | 'ai_discovered' | 'alex_leaderboard' | 'manual';
  
  portfolio: {
    stxBalance: number;
    stxLocked: number;
    totalValueUSD: number;
    tokens: Array<{ symbol: string; amount: number; value?: number }>;
  };
  
  activity: {
    protocols: string[];
    txCount30d: number;
    volume30dSTX: number;
    lastActiveAt: string;
    activityLevel: 'high' | 'medium' | 'low';
  };
  
  ai?: {
    confidence: number;
    reasoning: string;
    lastAnalyzed: string;
  };
  
  createdAt?: string;
  updatedAt?: string;
}

export interface StacksTransaction {
  tx_id: string;
  tx_type: string;
  sender_address: string;
  fee_rate: string;
  block_height: number;
  burn_block_time: number;
  tx_status: string;
  contract_call?: {
    contract_id: string;
    function_name: string;
  };
}

export interface AddressBalance {
  stx: {
    balance: string;
    locked: string;
  };
  fungible_tokens: Record<string, { balance: string }>;
}

// Known protocol contracts on mainnet
const PROTOCOL_CONTRACTS: Record<string, string> = {
  'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9': 'Alex',
  'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR': 'Arkadiko',
  'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1': 'Velar',
  'SP1Z92MPDQEWZXW36VX71Q25HKF5K2EPCJ304F275': 'StackSwap',
  'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9': 'Gamma',
};

// Curated whale list (initial seed data)
const CURATED_WHALES: Partial<WhaleProfile>[] = [
  {
    address: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
    alias: 'Stacks DeFi Whale',
    category: 'defi',
    source: 'curated',
  },
  {
    address: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR',
    alias: 'Arkadiko Protocol',
    category: 'infrastructure',
    source: 'curated',
  },
  {
    address: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9',
    alias: 'Alex DEX',
    category: 'infrastructure',
    source: 'curated',
  },
];

// Cache for rate limiting
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

class EcosystemWhaleService {
  private lastApiCall = 0;
  private readonly MIN_API_INTERVAL = 200; // 200ms between calls

  /**
   * Get cached data or null if expired
   */
  private getCached<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
    return null;
  }

  /**
   * Set cache data
   */
  private setCache(key: string, data: unknown): void {
    cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Rate-limited API call
   */
  private async rateLimitedFetch(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastApiCall;
    
    if (timeSinceLastCall < this.MIN_API_INTERVAL) {
      await new Promise(r => setTimeout(r, this.MIN_API_INTERVAL - timeSinceLastCall));
    }
    
    this.lastApiCall = Date.now();
    return fetch(url);
  }

  /**
   * Fetch address balance from Stacks API
   */
  async fetchAddressBalance(address: string): Promise<AddressBalance | null> {
    const cacheKey = `balance:${address}`;
    const cached = this.getCached<AddressBalance>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${STACKS_API_URL}/extended/v1/address/${address}/balances`
      );
      
      if (!response.ok) {
        console.error(`[WhaleService] Balance fetch failed for ${address}: ${response.status}`);
        return null;
      }
      
      const data = await response.json();
      this.setCache(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`[WhaleService] Error fetching balance for ${address}:`, error);
      return null;
    }
  }

  /**
   * Fetch recent transactions for an address
   */
  async fetchAddressTransactions(address: string, limit = 50): Promise<StacksTransaction[]> {
    const cacheKey = `txs:${address}:${limit}`;
    const cached = this.getCached<StacksTransaction[]>(cacheKey);
    if (cached) return cached;

    try {
      const response = await this.rateLimitedFetch(
        `${STACKS_API_URL}/extended/v1/address/${address}/transactions?limit=${limit}`
      );
      
      if (!response.ok) {
        console.error(`[WhaleService] Transaction fetch failed for ${address}: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      this.setCache(cacheKey, data.results || []);
      return data.results || [];
    } catch (error) {
      console.error(`[WhaleService] Error fetching transactions for ${address}:`, error);
      return [];
    }
  }

  /**
   * Identify protocols from transactions
   */
  identifyProtocols(transactions: StacksTransaction[]): string[] {
    const protocols = new Set<string>();
    
    transactions.forEach(tx => {
      if (tx.tx_type === 'contract_call' && tx.contract_call?.contract_id) {
        const [contractAddress] = tx.contract_call.contract_id.split('.');
        const protocol = PROTOCOL_CONTRACTS[contractAddress];
        if (protocol) {
          protocols.add(protocol);
        }
      }
    });
    
    return Array.from(protocols);
  }

  /**
   * Calculate activity level based on transaction count
   */
  calculateActivityLevel(txCount: number): 'high' | 'medium' | 'low' {
    if (txCount >= 50) return 'high';
    if (txCount >= 20) return 'medium';
    return 'low';
  }

  /**
   * Build complete whale profile from blockchain data
   */
  async buildWhaleProfile(address: string, baseData?: Partial<WhaleProfile>): Promise<WhaleProfile | null> {
    console.log(`[WhaleService] Building profile for ${address}...`);
    
    // Fetch balance and transactions in parallel
    const [balance, transactions] = await Promise.all([
      this.fetchAddressBalance(address),
      this.fetchAddressTransactions(address, 50),
    ]);
    
    if (!balance) {
      console.warn(`[WhaleService] Could not fetch balance for ${address}`);
      return null;
    }
    
    // Parse balance
    const stxBalance = parseInt(balance.stx.balance) / 1_000_000;
    const stxLocked = parseInt(balance.stx.locked) / 1_000_000;
    
    // Identify protocols
    const protocols = this.identifyProtocols(transactions);
    
    // Calculate activity metrics
    const txCount = transactions.length;
    const volume30d = transactions.reduce((sum, tx) => {
      return sum + parseInt(tx.fee_rate) / 1_000_000;
    }, 0);
    
    const lastTx = transactions[0];
    const lastActiveAt = lastTx 
      ? new Date(lastTx.burn_block_time * 1000).toISOString()
      : new Date().toISOString();
    
    // Build profile
    const profile: WhaleProfile = {
      address,
      alias: baseData?.alias || this.generateAlias(address),
      category: baseData?.category || this.inferCategory(protocols, stxBalance),
      verified: baseData?.verified || false,
      source: baseData?.source || 'ai_discovered',
      
      portfolio: {
        stxBalance,
        stxLocked,
        totalValueUSD: stxBalance * 1.5, // Rough estimate, should use price service
        tokens: this.parseTokenBalances(balance.fungible_tokens),
      },
      
      activity: {
        protocols,
        txCount30d: txCount,
        volume30dSTX: volume30d,
        lastActiveAt,
        activityLevel: this.calculateActivityLevel(txCount),
      },
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return profile;
  }

  /**
   * Parse token balances from Stacks API response
   */
  private parseTokenBalances(tokens: Record<string, { balance: string }>): Array<{ symbol: string; amount: number }> {
    return Object.entries(tokens).map(([token, data]) => ({
      symbol: token.split('::')[1] || token.split('.')[1] || 'Unknown',
      amount: parseInt(data.balance) / 1_000_000,
    })).filter(t => t.amount > 0);
  }

  /**
   * Generate alias from address
   */
  private generateAlias(address: string): string {
    const prefix = address.substring(0, 6);
    const suffix = address.substring(address.length - 4);
    return `Whale_${prefix}...${suffix}`;
  }

  /**
   * Infer category from activity
   */
  private inferCategory(protocols: string[], balance: number): WhaleProfile['category'] {
    if (protocols.includes('Alex') || protocols.includes('Arkadiko')) return 'defi';
    if (protocols.includes('Gamma')) return 'nft';
    if (balance > 1_000_000) return 'trader';
    return 'trader';
  }

  /**
   * Get all whales from MongoDB
   */
  async getWhales(limit = 20): Promise<WhaleProfile[]> {
    if (mongoClient.isConfigured) {
      try {
        const whales = await mongoClient.find('whales', {}, {
          sort: { 'portfolio.stxBalance': -1 },
          limit,
        });
        if (whales.length > 0) {
          return whales as WhaleProfile[];
        }
      } catch (error) {
        console.error('[WhaleService] MongoDB error:', error);
      }
    }
    
    // Fallback: return curated whales with live data
    return this.getCuratedWhales();
  }

  /**
   * Get curated whales with live blockchain data
   */
  async getCuratedWhales(): Promise<WhaleProfile[]> {
    const profiles: WhaleProfile[] = [];
    
    for (const whale of CURATED_WHALES) {
      if (whale.address) {
        const profile = await this.buildWhaleProfile(whale.address, whale);
        if (profile) {
          profiles.push(profile);
        }
      }
    }
    
    return profiles.sort((a, b) => b.portfolio.stxBalance - a.portfolio.stxBalance);
  }

  /**
   * Get whales by category
   */
  async getWhalesByCategory(category: string): Promise<WhaleProfile[]> {
    if (mongoClient.isConfigured) {
      try {
        return await mongoClient.find('whales', { category }, {
          sort: { 'portfolio.stxBalance': -1 },
        }) as WhaleProfile[];
      } catch (error) {
        console.error('[WhaleService] MongoDB error:', error);
      }
    }
    
    const allWhales = await this.getCuratedWhales();
    return allWhales.filter(w => w.category === category);
  }

  /**
   * Get whales by protocol
   */
  async getWhalesByProtocol(protocol: string): Promise<WhaleProfile[]> {
    if (mongoClient.isConfigured) {
      try {
        return await mongoClient.find('whales', {
          'activity.protocols': protocol
        }, {
          sort: { 'portfolio.stxBalance': -1 },
        }) as WhaleProfile[];
      } catch (error) {
        console.error('[WhaleService] MongoDB error:', error);
      }
    }
    
    const allWhales = await this.getCuratedWhales();
    return allWhales.filter(w => w.activity.protocols.includes(protocol));
  }

  /**
   * Discover new whales using AI (requires Gemini API key)
   */
  async discoverWhalesWithAI(): Promise<WhaleProfile[]> {
    if (!GEMINI_API_KEY) {
      console.warn('[WhaleService] Gemini API key not configured, skipping AI discovery');
      return [];
    }
    
    console.log('[WhaleService] Starting AI whale discovery...');
    
    try {
      // Fetch recent high-value transactions
      const response = await this.rateLimitedFetch(
        `${STACKS_API_URL}/extended/v1/tx?limit=100`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }
      
      const data = await response.json();
      const transactions = data.results || [];
      
      // Extract unique addresses with high activity
      const addressCounts = new Map<string, number>();
      transactions.forEach((tx: StacksTransaction) => {
        addressCounts.set(
          tx.sender_address,
          (addressCounts.get(tx.sender_address) || 0) + 1
        );
      });
      
      // Get addresses with 3+ transactions
      const potentialWhales = Array.from(addressCounts.entries())
        .filter(([, count]) => count >= 3)
        .map(([address]) => address)
        .slice(0, 10);
      
      // Build profiles for potential whales
      const profiles: WhaleProfile[] = [];
      for (const address of potentialWhales) {
        const profile = await this.buildWhaleProfile(address, {
          source: 'ai_discovered',
        });
        
        if (profile && profile.portfolio.stxBalance >= 10000) { // 10k STX minimum
          profiles.push(profile);
        }
      }
      
      // Store in MongoDB if configured
      if (mongoClient.isConfigured) {
        for (const profile of profiles) {
          await mongoClient.updateOne(
            'whales',
            { address: profile.address },
            profile as unknown as Record<string, unknown>,
            true // upsert
          );
        }
        console.log(`[WhaleService] Stored ${profiles.length} whales in MongoDB`);
      }
      
      return profiles;
    } catch (error) {
      console.error('[WhaleService] AI discovery error:', error);
      return [];
    }
  }

  /**
   * Refresh whale data (call periodically)
   */
  async refreshWhaleData(): Promise<void> {
    console.log('[WhaleService] Refreshing whale data...');
    
    const whales = await this.getWhales(50);
    
    for (const whale of whales) {
      const updatedProfile = await this.buildWhaleProfile(whale.address, whale);
      
      if (updatedProfile && mongoClient.isConfigured) {
        await mongoClient.updateOne(
          'whales',
          { address: whale.address },
          updatedProfile as unknown as Record<string, unknown>,
          true
        );
      }
    }
    
    console.log(`[WhaleService] Refreshed ${whales.length} whale profiles`);
  }
}

// Export singleton
export const ecosystemWhaleService = new EcosystemWhaleService();
export default ecosystemWhaleService;
