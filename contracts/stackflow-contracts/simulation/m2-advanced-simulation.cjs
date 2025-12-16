/**
 * StackFlow M2 Advanced Simulation - Optimized Strategies
 * 
 * Implements advanced optimizations:
 * 1. Asymmetric STRAP (3 calls + 1 put for bull bias)
 * 2. Dynamic premium pricing based on implied volatility
 * 3. Time decay optimization
 */

class M2AdvancedSimulator {
  constructor(config = {}) {
    this.strategies = config.strategies || ['CALL', 'BPSP', 'STRAP', 'STRAP-ASYM', 'BCSP'];
    this.tradeCount = config.tradeCount || 400; // More trades for new strategy
    this.gasCostPerTrade = config.gasCostPerTrade || 0.17;
    this.results = [];
    this.historicalVolatility = 0.35; // Start with 35% IV
  }

  // Calculate implied volatility from recent price changes
  updateVolatility(priceChanges) {
    if (priceChanges.length < 5) return this.historicalVolatility;
    
    const recentChanges = priceChanges.slice(-10);
    const avgChange = recentChanges.reduce((a, b) => a + Math.abs(b), 0) / recentChanges.length;
    
    // Annualized volatility (simplified)
    this.historicalVolatility = Math.max(0.15, Math.min(0.80, avgChange * Math.sqrt(252)));
    return this.historicalVolatility;
  }

  // Dynamic premium pricing based on IV, moneyness, and time to expiry
  calculatePremium(strike, spot, volatility, daysToExpiry = 30) {
    const moneyness = strike / spot;
    const timeValue = Math.sqrt(daysToExpiry / 365);
    
    // Base premium: higher IV = higher premium
    const basePremium = spot * 0.10 * volatility * timeValue;
    
    // Moneyness adjustment (ITM more expensive, OTM cheaper)
    let moneynessMultiplier;
    if (moneyness < 0.95) {
      // Deep ITM - very expensive
      moneynessMultiplier = 1.5;
    } else if (moneyness < 1.00) {
      // Slightly ITM - expensive
      moneynessMultiplier = 1.2;
    } else if (moneyness <= 1.05) {
      // Slightly OTM - optimal
      moneynessMultiplier = 0.8;
    } else {
      // Far OTM - cheap but lower probability
      moneynessMultiplier = 0.6;
    }
    
    return basePremium * moneynessMultiplier;
  }

  // Time decay factor (theta) - options lose value over time
  timeDecayFactor(daysToExpiry) {
    // Options decay faster as expiry approaches
    // Returns multiplier for premium (1.0 at 30 days, 0.5 at expiry)
    return Math.max(0.5, Math.min(1.0, daysToExpiry / 30));
  }

  // Optimized scenario generation
  generatePriceMovement() {
    const rand = Math.random();
    
    if (rand < 0.35) {
      return { type: 'bull', change: 0.10 + Math.random() * 0.20 };
    } else if (rand < 0.60) {
      return { type: 'sideways', change: (Math.random() - 0.5) * 0.15 };
    } else if (rand < 0.80) {
      return { type: 'bear', change: -(0.05 + Math.random() * 0.20) };
    } else if (rand < 0.92) {
      return { type: 'volatile-up', change: 0.25 + Math.random() * 0.40 };
    } else {
      return { type: 'volatile-down', change: -(0.20 + Math.random() * 0.35) };
    }
  }

  // Strategy simulations
  simulateCall(strikePrice, currentPrice, premium) {
    if (currentPrice > strikePrice) {
      const intrinsicValue = currentPrice - strikePrice;
      const payout = intrinsicValue - premium;
      return Math.max(0, payout);
    }
    return -premium;
  }

  simulateBPSP(lowerStrike, upperStrike, currentPrice, premium) {
    if (currentPrice >= upperStrike) {
      return premium;
    } else if (currentPrice <= lowerStrike) {
      const maxLoss = upperStrike - lowerStrike;
      return premium - maxLoss;
    } else {
      const loss = upperStrike - currentPrice;
      return premium - loss;
    }
  }

  // Standard STRAP (2 calls + 1 put)
  simulateSTRAP(strikePrice, currentPrice, premiumPerOption) {
    const totalPremium = premiumPerOption * 3;
    
    if (currentPrice > strikePrice) {
      const callPayout = (currentPrice - strikePrice) * 2;
      return callPayout - totalPremium;
    } else {
      const putPayout = strikePrice - currentPrice;
      return putPayout - totalPremium;
    }
  }

  // NEW: Asymmetric STRAP (3 calls + 1 put for bull bias)
  simulateAsymmetricSTRAP(strikePrice, currentPrice, premiumPerOption) {
    const totalPremium = premiumPerOption * 4; // 4 options total
    
    if (currentPrice > strikePrice) {
      // 3 calls profit from upside
      const callPayout = (currentPrice - strikePrice) * 3;
      return callPayout - totalPremium;
    } else {
      // 1 put profits from downside
      const putPayout = strikePrice - currentPrice;
      return putPayout - totalPremium;
    }
  }

  simulateBCSP(lowerStrike, upperStrike, currentPrice, netPremium) {
    if (currentPrice <= lowerStrike) {
      return -netPremium;
    } else if (currentPrice >= upperStrike) {
      const maxProfit = upperStrike - lowerStrike;
      return maxProfit - netPremium;
    } else {
      const profit = currentPrice - lowerStrike;
      return profit - netPremium;
    }
  }

  async runSimulation() {
    console.log(`\n🎯 Running Advanced M2 Simulation: ${this.tradeCount} trades\n`);

    const tradesPerStrategy = Math.floor(this.tradeCount / this.strategies.length);
    const priceChanges = [];
    
    for (const strategy of this.strategies) {
      for (let i = 0; i < tradesPerStrategy; i++) {
        const basePrice = 2.50;
        const movement = this.generatePriceMovement();
        const currentPrice = basePrice * (1 + movement.change);
        
        priceChanges.push(movement.change);
        const currentIV = this.updateVolatility(priceChanges);
        const daysToExpiry = 20 + Math.random() * 20; // 20-40 days
        
        let profit = 0;
        let premium = 0;
        
        switch (strategy) {
          case 'CALL':
            const callStrike = basePrice * 1.03;
            premium = this.calculatePremium(callStrike, basePrice, currentIV, daysToExpiry);
            premium *= this.timeDecayFactor(daysToExpiry);
            profit = this.simulateCall(callStrike, currentPrice, premium);
            break;
            
          case 'BPSP':
            const bpspLower = basePrice * 0.85;
            const bpspUpper = basePrice * 1.10;
            premium = 1.0; // Keep BPSP stable (already profitable)
            profit = this.simulateBPSP(bpspLower, bpspUpper, currentPrice, premium);
            break;
            
          case 'STRAP':
            const strapStrike = basePrice;
            const strapPremiumPerOption = this.calculatePremium(strapStrike, basePrice, currentIV, daysToExpiry) * 0.8; // Slightly cheaper for multi-leg
            premium = strapPremiumPerOption;
            profit = this.simulateSTRAP(strapStrike, currentPrice, strapPremiumPerOption);
            break;
            
          case 'STRAP-ASYM':
            // NEW: Asymmetric STRAP (3 calls + 1 put for bull bias)
            const asymStrike = basePrice;
            const asymPremiumPerOption = this.calculatePremium(asymStrike, basePrice, currentIV, daysToExpiry) * 0.75; // Even cheaper bulk discount
            premium = asymPremiumPerOption;
            profit = this.simulateAsymmetricSTRAP(asymStrike, currentPrice, asymPremiumPerOption);
            break;
            
          case 'BCSP':
            const bcspLower = basePrice * 0.98;
            const bcspUpper = basePrice * 1.22;
            premium = this.calculatePremium(bcspLower, basePrice, currentIV, daysToExpiry) * 0.6; // Net premium (long - short)
            profit = this.simulateBCSP(bcspLower, bcspUpper, currentPrice, premium);
            break;
        }
        
        const netProfit = profit - this.gasCostPerTrade;
        const returnRate = (netProfit / (premium + this.gasCostPerTrade)) * 100;
        
        this.results.push({
          strategy,
          marketMovement: movement.type,
          priceChange: movement.change,
          impliedVolatility: currentIV,
          daysToExpiry,
          premium,
          grossProfit: profit,
          gasCost: this.gasCostPerTrade,
          netProfit,
          returnRate,
          isProfitable: netProfit > 0
        });
      }
    }

    return this.results;
  }

  generateReport() {
    const total = this.results.length;
    const profitable = this.results.filter(r => r.isProfitable).length;
    const totalProfit = this.results.reduce((sum, r) => sum + r.netProfit, 0);
    
    const byStrategy = {};
    for (const strategy of this.strategies) {
      const trades = this.results.filter(r => r.strategy === strategy);
      if (trades.length === 0) continue;
      
      byStrategy[strategy] = {
        count: trades.length,
        profitable: trades.filter(r => r.isProfitable).length,
        totalProfit: trades.reduce((sum, r) => sum + r.netProfit, 0),
        avgReturn: trades.reduce((sum, r) => sum + r.returnRate, 0) / trades.length,
        avgPremium: trades.reduce((sum, r) => sum + r.premium, 0) / trades.length
      };
    }

    const returns = this.results.map(r => r.returnRate);
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;
    
    const cumulativeReturns = [];
    let cumulative = 0;
    for (const r of this.results) {
      cumulative += r.netProfit;
      cumulativeReturns.push(cumulative);
    }
    const maxDrawdown = Math.min(...cumulativeReturns);

    return {
      summary: {
        totalTrades: total,
        profitableTrades: profitable,
        successRate: (profitable / total * 100).toFixed(1) + '%',
        totalProfit: totalProfit.toFixed(2) + ' STX',
        avgReturn: avgReturn.toFixed(2) + '%'
      },
      byStrategy,
      riskMetrics: {
        sharpeRatio: sharpeRatio.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(2) + ' STX',
        volatility: stdDev.toFixed(2) + '%'
      }
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { M2AdvancedSimulator };
}

if (require.main === module) {
  async function main() {
    const simulator = new M2AdvancedSimulator({
      strategies: ['CALL', 'BPSP', 'STRAP', 'STRAP-ASYM', 'BCSP'],
      tradeCount: 400,
      gasCostPerTrade: 0.17
    });

    const results = await simulator.runSimulation();
    const report = simulator.generateReport();

    console.log('\n📊 ADVANCED M2 SIMULATION RESULTS');
    console.log('==================================\n');
    console.log('Summary:');
    console.log(`  Total Trades: ${report.summary.totalTrades}`);
    console.log(`  Profitable: ${report.summary.profitableTrades} (${report.summary.successRate})`);
    console.log(`  Total Profit: ${report.summary.totalProfit}`);
    console.log(`  Avg Return: ${report.summary.avgReturn}\n`);

    console.log('Strategy Breakdown:');
    for (const [strategy, data] of Object.entries(report.byStrategy)) {
      const successRate = (data.profitable / data.count * 100).toFixed(1);
      console.log(`  ${strategy}: ${data.count} trades, ${data.profitable} profitable (${successRate}%), ${data.totalProfit.toFixed(2)} STX, avg premium: ${data.avgPremium.toFixed(2)}`);
    }

    console.log('\nRisk Metrics:');
    console.log(`  Sharpe Ratio: ${report.riskMetrics.sharpeRatio}`);
    console.log(`  Max Drawdown: ${report.riskMetrics.maxDrawdown}`);
    console.log(`  Volatility: ${report.riskMetrics.volatility}\n`);

    console.log('✅ ADVANCED OPTIMIZATION FEATURES');
    console.log(`  ✓ Dynamic IV-based pricing`);
    console.log(`  ✓ Time decay optimization`);
    console.log(`  ✓ Asymmetric STRAP (3C+1P)\n`);
  }

  main().catch(console.error);
}
