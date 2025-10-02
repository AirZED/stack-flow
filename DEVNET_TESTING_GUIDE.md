# 🧪 Devnet Testing Guide
## Test StackFlow Locally with Clarinet Devnet

**Status:** ✅ Devnet Running  
**Date:** October 2, 2025

---

## ✅ **Devnet is LIVE!**

Your local Stacks blockchain is running:
- **API:** http://localhost:3999
- **Explorer:** http://localhost:3000 (if available)
- **Contract:** Auto-deployed to devnet

---

## 🎯 **How to Test**

### Step 1: Check Your Frontend is Running

Visit: http://localhost:5176/trade

Your Vite server should show:
- Real STX price ($0.623)
- All 4 bullish strategies
- Premium calculations working

---

### Step 2: Connect Wallet to Devnet

**Using Leather Wallet:**
1. Open Leather wallet extension
2. Click Settings → Network
3. Select "Devnet" or "Custom Network"
4. Set RPC URL: `http://localhost:3999`

**Pre-Funded Devnet Accounts:**
```
Deployer:
  Address: ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM
  Balance: 100,000,000 STX (100M STX for testing!)

Wallet 1:
  Address: ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5
  Balance: 100,000,000 STX
  
Wallet 2:
  Address: ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG
  Balance: 100,000,000 STX
```

---

### Step 3: Test All 4 Strategies

#### Test 1: Create CALL Option
1. Select "Capital Sentiment"
2. Choose "Bullish" sentiment
3. Select "Call" strategy
4. Amount: 10 STX
5. Period: 14 days
6. Click "Buy this strategy"
7. Sign transaction in wallet
8. ✅ Option created!

#### Test 2: Create STRAP Option
1. Select "Strap" strategy
2. Amount: 10 STX
3. Period: 14 days
4. ✅ Higher premium (2 calls + 1 put)

#### Test 3: Create Bull Call Spread
1. Select "Bull Call Spread"
2. Amount: 10 STX
3. Period: 14 days
4. ✅ Lower premium (budget option)

#### Test 4: Create Bull Put Spread
1. Select "Bull Put Spread"
2. Amount: 10 STX
3. Period: 14 days
4. ✅ Receive premium upfront!

---

## 🔍 **Verify Transactions**

### Check Contract State:

```bash
cd /Users/abba/Desktop/stack-flow/contracts/stackflow-contracts
clarinet console
```

**In Clarinet Console:**
```clarity
;; Get option details
(contract-call? .stackflow-options-v1 get-option u1)

;; Get protocol stats
(contract-call? .stackflow-options-v1 get-stats)

;; Get user's options
(contract-call? .stackflow-options-v1 get-user-options 'ST1SJ3DTE5DN7X54YDH5D64R3BCB6A2AG2ZQ8YPD5)
```

### Check API:

```bash
# Get option count
curl http://localhost:3999/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/stackflow-options-v1/get-stats

# Get specific option
curl http://localhost:3999/v2/contracts/call-read/ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM/stackflow-options-v1/get-option
```

---

## 🐛 **Troubleshooting**

### "Cannot connect to wallet"
- Switch wallet to Devnet mode
- Or use custom RPC: `http://localhost:3999`

### "Transaction failed"
- Check devnet is running: `docker ps`
- Check logs: `cd contracts/stackflow-contracts && clarinet devnet logs`

### "Contract not found"
- Devnet auto-deploys on start
- Check: `ls .cache/stacks-devnet-*/deployment.yaml`

---

## ✅ **Success Criteria**

Test is successful when:
- [ ] Can create CALL option
- [ ] Can create STRAP option
- [ ] Can create Bull Call Spread
- [ ] Can create Bull Put Spread
- [ ] Transactions confirm instantly
- [ ] Success modal appears
- [ ] No errors in console

---

## 🎉 **What You're Testing**

**The Complete StackFlow System:**
1. ✅ Real price oracle → CoinGecko
2. ✅ Premium calculator → Black-Scholes
3. ✅ Smart contract → All 4 strategies
4. ✅ Transaction manager → Wallet integration
5. ✅ User interface → Beautiful UI
6. ✅ **END-TO-END FLOW!** 🚀

**This is a REAL options trading platform!** 💪

---

**Happy Testing!** 🧪

