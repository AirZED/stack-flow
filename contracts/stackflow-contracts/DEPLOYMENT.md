# StackFlow M1 Deployment Guide

## 🚀 Deployment Overview

This guide covers the deployment of the StackFlow M1 options trading contract to the Stacks blockchain.

## 📁 Deployment Files

### **✅ Working Deployment Script**
- **`deploy-m1-node.js`** - Successfully deployed M1 contract to testnet
  - Uses Node.js and @stacks/transactions
  - Handles contract compilation and deployment
  - Provides detailed deployment feedback

### **🗑️ Removed Files**
- ~~`deploy-node.js`~~ - Generic deployment script (removed)
- ~~`deploy-stx.sh`~~ - Shell script (removed)
- ~~`get-testnet-stx.sh`~~ - Utility script (removed)

## 🎯 Deployment Methods

### **Method 1: Node.js Script (Recommended)**
```bash
# Deploy M1 contract to testnet
node deploy-m1-node.js
```

**Advantages:**
- ✅ Proven to work
- ✅ Detailed error handling
- ✅ Clear deployment feedback
- ✅ Handles contract compilation

### **Method 2: Clarinet Deployment**
```bash
# Generate deployment plan
clarinet deployments generate --testnet --medium-cost

# Deploy to testnet
clarinet deployments apply --testnet
```

**Advantages:**
- ✅ Official Clarinet tool
- ✅ Integrated with development workflow
- ✅ Handles multiple contracts

## 📋 Prerequisites

### **Required Setup**
1. **STX Balance**: ~0.15 STX for gas fees
2. **Mnemonic**: Valid 24-word mnemonic in `settings/Testnet.toml`
3. **Network Access**: Testnet network connectivity
4. **Dependencies**: Node.js and npm packages installed

### **Configuration Files**
- **`settings/Testnet.toml`**: Testnet configuration with mnemonic
- **`deployments/default.testnet-plan.yaml`**: Clarinet deployment plan

## 🔧 Deployment Process

### **Step 1: Prepare Environment**
```bash
# Install dependencies
pnpm install

# Verify configuration
cat settings/Testnet.toml
```

### **Step 2: Deploy Contract**
```bash
# Using Node.js script (recommended)
node deploy-m1-node.js

# Or using Clarinet
clarinet deployments apply --testnet
```

### **Step 3: Verify Deployment**
```bash
# Check contract on explorer
# Contract Address: ST3F4WEX90KZQ6D25TWP09J90D6CSYGW1JX8WH3Y7.stackflow-options-m1
# Explorer: https://explorer.hiro.so/address/ST3F4WEX90KZQ6D25TWP09J90D6CSYGW1JX8WH3Y7?chain=testnet

# Run integration tests
pnpm run test:integration
```

## 📊 Deployment Results

### **✅ Successful Deployment**
- **Contract Address**: `ST3F4WEX90KZQ6D25TWP09J90D6CSYGW1JX8WH3Y7.stackflow-options-m1`
- **Network**: Stacks Testnet
- **Deployment Cost**: ~0.15 STX
- **Status**: Live and functional
- **Functions**: 7 public functions available

### **🔍 Verification**
- **Contract Source**: 9,622 characters
- **Function Availability**: All 7 functions working
- **API Access**: Read-only functions accessible
- **Integration Tests**: 100% passing

## 🚨 Troubleshooting

### **Common Issues**

#### **1. Insufficient STX Balance**
```
Error: Insufficient balance for transaction
```
**Solution**: Get testnet STX from faucet or transfer from another wallet

#### **2. Invalid Mnemonic**
```
Error: Invalid mnemonic
```
**Solution**: Check `settings/Testnet.toml` has valid 24-word mnemonic

#### **3. Network Connection**
```
Error: Network request failed
```
**Solution**: Check internet connection and testnet availability

#### **4. Contract Compilation**
```
Error: Contract compilation failed
```
**Solution**: Check contract syntax with `clarinet check`

## 📈 Post-Deployment

### **Testing**
```bash
# Run comprehensive tests
pnpm run test:all

# Run integration tests
pnpm run test:integration

# Run simulation
pnpm run simulate
```

### **Monitoring**
- **Explorer**: Monitor contract activity
- **API**: Check function availability
- **Tests**: Run regular integration tests

## 🔄 Redeployment

### **When to Redeploy**
- Contract code changes
- Configuration updates
- New contract versions

### **Redeployment Process**
1. Update contract code
2. Test locally with `clarinet check`
3. Deploy with `node deploy-m1-node.js`
4. Verify deployment
5. Run integration tests

## 📚 Additional Resources

### **Documentation**
- **Contract Source**: `contracts/stackflow-options-m1.clar`
- **Test Suite**: `tests/integration/`
- **Simulation**: `simulation/m1-simulation.ts`

### **External Links**
- **Stacks Explorer**: https://explorer.hiro.so
- **Stacks Documentation**: https://docs.stacks.co
- **Clarinet Documentation**: https://docs.hiro.so/clarinet

---

**StackFlow M1 Deployment Guide** - Reliable deployment for Bitcoin-secured options trading on Stacks
