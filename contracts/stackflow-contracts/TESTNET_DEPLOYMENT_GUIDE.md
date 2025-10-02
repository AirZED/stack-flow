# Testnet Deployment Guide
## StackFlow Options V1

**Contract:** stackflow-options-v1.clar  
**Network:** Stacks Testnet  
**Date:** October 2, 2025

---

## 🎯 Deployment Steps

### Step 1: Get Testnet STX (REQUIRED) ✅

**Your Testnet Address:**
```
ST1CS6D7VNBJD300QT2S2SKXG9C36TV1KAT63222S
```

**Get Free Testnet STX:**
1. Go to: https://explorer.hiro.so/sandbox/faucet?chain=testnet
2. Enter address: `ST1CS6D7VNBJD300QT2S2SKXG9C36TV1KAT63222S`
3. Request STX (you'll get ~500 testnet STX)
4. Wait 1-2 minutes for confirmation

**Verify Balance:**
https://explorer.hiro.so/address/ST1CS6D7VNBJD300QT2S2SKXG9C36TV1KAT63222S?chain=testnet

---

### Step 2: Generate Deployment Plan

```bash
cd /Users/abba/Desktop/stack-flow/contracts/stackflow-contracts
clarinet deployments generate --testnet
```

This creates `deployments/default.testnet-plan.yaml`

---

### Step 3: Deploy to Testnet

```bash
clarinet deployments apply --testnet
```

**Expected Output:**
```
Deploying on testnet...
✔ Contract deployed: stackflow-options-v1
  Transaction ID: 0x...
  Contract Address: ST1CS6D7VNBJD300QT2S2SKXG9C36TV1KAT63222S.stackflow-options-v1
```

---

### Step 4: Verify Deployment

**Check on Explorer:**
https://explorer.hiro.so/txid/[TRANSACTION_ID]?chain=testnet

**Verify Contract:**
https://explorer.hiro.so/address/ST1CS6D7VNBJD300QT2S2SKXG9C36TV1KAT63222S?chain=testnet

---

## 🧪 Test the Contract on Testnet

### Using Clarinet Console:

```bash
clarinet console --testnet
```

### Test Commands:

```clarity
;; Create a CALL option
(contract-call? .stackflow-options-v1 create-call-option 
  u10000000    ;; 10 STX
  u623000      ;; $0.623 strike (current price)
  u700000      ;; 0.7 STX premium
  u1100        ;; ~7.6 days from now
)

;; Get option details
(contract-call? .stackflow-options-v1 get-option u1)

;; Get protocol stats
(contract-call? .stackflow-options-v1 get-stats)
```

---

## 📝 Important Information

### Contract Details:
- **Contract Name:** `stackflow-options-v1`
- **Network:** Testnet
- **Deployer:** `ST1CS6D7VNBJD300QT2S2SKXG9C36TV1KAT63222S`
- **Size:** 119 lines
- **Functions:** 12 public, 3 read-only, 4 private

### Deployment Costs:
- **Contract Deployment:** ~1-2 STX (testnet)
- **Transaction Fee:** ~0.01 STX
- **Total:** ~1-2 STX (you'll get 500 from faucet)

---

## 🔍 Post-Deployment Checklist

After successful deployment:

- [ ] Verify contract on explorer
- [ ] Note contract address
- [ ] Test create-call-option
- [ ] Test create-strap-option
- [ ] Test create-bull-call-spread
- [ ] Test create-bull-put-spread
- [ ] Verify gas costs
- [ ] Update frontend config with contract address

---

## 🚀 Next Steps After Testnet

Once testnet deployment is verified:

1. **Update Frontend (Phase 3)**
   - Add contract address to `.env`
   - Create transaction manager
   - Update TradeSummary component
   
2. **Test Integration**
   - Connect Leather wallet (testnet mode)
   - Create test options from UI
   - Verify transactions

3. **Prepare for Mainnet**
   - Security audit
   - Gas cost verification
   - Mainnet deployment

---

## 📞 Troubleshooting

**If deployment fails:**

1. **"Insufficient balance"**
   - Get more testnet STX from faucet
   - Wait for faucet transaction to confirm

2. **"Nonce error"**
   - Wait a few blocks
   - Retry deployment

3. **"Contract already exists"**
   - Check if already deployed
   - Use different contract name or version

---

## 🎯 Deployment Checklist

Pre-Deployment:
- [x] Contract compiles without errors
- [x] All tests passing (10/10)
- [x] Testnet wallet configured
- [ ] Testnet STX in wallet (>2 STX)

Deployment:
- [ ] Generate deployment plan
- [ ] Review deployment plan
- [ ] Apply deployment
- [ ] Wait for confirmation

Post-Deployment:
- [ ] Note transaction ID
- [ ] Note contract address
- [ ] Verify on explorer
- [ ] Test contract functions
- [ ] Update documentation
- [ ] Update frontend config

---

**Ready to deploy once you have testnet STX!** 🚀

**Quick Start:**
```bash
# 1. Get testnet STX from faucet
# 2. Then run:
cd /Users/abba/Desktop/stack-flow/contracts/stackflow-contracts
clarinet deployments generate --testnet
clarinet deployments apply --testnet
```

---

*Last Updated: October 2, 2025*

