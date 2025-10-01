# Wallet State Persistence Fix - Using @stacks/connect v8 Storage API

## Problem
After successfully connecting the wallet, the page still showed "Connect Wallet" button instead of displaying the connected address. The wallet state was not persisting across page refreshes.

## Root Cause
The previous implementation:
1. ❌ Relied on deprecated `UserSession` for state management
2. ❌ Used `window.location.reload()` after connection
3. ❌ Did not utilize v8's built-in localStorage storage
4. ❌ Did not check connection state on mount

## Solution: Use @stacks/connect v8 Storage API

### Key v8 Storage Functions Used:

```typescript
import {
  connect,         // Connect wallet and store addresses
  isConnected,     // Check if user has connected wallet
  getLocalStorage, // Get stored wallet data
  disconnect,      // Clear wallet connection
} from "@stacks/connect";
```

### How v8 Storage Works

When you call `connect()`, it automatically:
1. Shows wallet selection UI
2. Gets addresses from the wallet
3. **Stores addresses in localStorage** under key `@stacks/connect`
4. Returns the addresses

The data structure stored:
```typescript
{
  addresses: {
    stx: [{ address: "SP...", symbol: "STX", ... }],
    btc: [{ address: "bc1...", purpose: "payment", ... }]
  },
  updatedAt: timestamp,
  version: "0.0.1"
}
```

## Implementation

### Updated WalletContext.tsx

**Key Changes:**

1. **Import v8 Storage Functions:**
```typescript
import {
  connect,
  isConnected,
  getLocalStorage,
  disconnect as disconnectWallet,
} from "@stacks/connect";
```

2. **Load State on Mount:**
```typescript
useEffect(() => {
  const loadWalletState = () => {
    try {
      // Check if user is connected using v8 API
      if (isConnected()) {
        const storageData = getLocalStorage();
        if (storageData && storageData.addresses) {
          setAddresses({
            stx: storageData.addresses.stx || [],
            btc: storageData.addresses.btc || [],
          });
        }
      }
    } catch (error) {
      console.error("Error loading wallet state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  loadWalletState();
}, []);
```

3. **Connect Without Page Reload:**
```typescript
const handleConnect = async () => {
  setIsConnecting(true);
  try {
    // This automatically stores in localStorage
    const result = await connect();
    
    if (result && result.addresses) {
      // Separate STX and BTC addresses
      const stxAddrs: AddressData[] = [];
      const btcAddrs: AddressData[] = [];
      
      result.addresses.forEach((addr) => {
        if (addr.address.startsWith('S')) {
          stxAddrs.push(addr);
        } else {
          btcAddrs.push(addr);
        }
      });
      
      // Update state immediately - NO PAGE RELOAD!
      setAddresses({ stx: stxAddrs, btc: btcAddrs });
    }
  } catch (error) {
    console.error("Error connecting wallet:", error);
  } finally {
    setIsConnecting(false);
  }
};
```

4. **Proper Disconnect:**
```typescript
const handleDisconnect = () => {
  // Use v8's built-in disconnect function
  disconnectWallet(); // Clears localStorage
  setAddresses({ stx: [], btc: [] });
  userSession.signUserOut();
};
```

## Benefits of This Approach

✅ **No Page Reloads**: State updates instantly after connection  
✅ **Persistent State**: Works across page refreshes and sessions  
✅ **Built-in Storage**: Uses official v8 localStorage management  
✅ **Type Safe**: Proper TypeScript types for all data  
✅ **Multiple Addresses**: Supports both STX and BTC addresses  
✅ **Clean API**: Simple `isConnected()` and `getLocalStorage()` checks  

## Context Pattern Best Practices

### 1. **Single Source of Truth**
The `WalletContext` is the only place that manages wallet state.

### 2. **Automatic State Loading**
On mount, automatically check localStorage and restore state.

### 3. **Immediate UI Updates**
After connection, update state immediately without reload.

### 4. **Global Access**
Any component can use `useWallet()` hook to access wallet state.

### 5. **Proper Cleanup**
Disconnect properly clears both localStorage and React state.

## Usage in Components

### Before (Old Way):
```typescript
// Had to check userData object
const { userData } = useStacksWallet();
const address = userData?.address;
```

### After (New Way):
```typescript
// Direct access to addresses
const { address, stxAddress, btcAddress, addresses } = useWallet();

// Check connection status
if (address) {
  // User is connected
}
```

## Testing the Fix

1. **Connect Wallet:**
   - Click "Connect Stacks Wallet"
   - Approve in your wallet
   - Address should appear immediately

2. **Refresh Page:**
   - Refresh the browser
   - Address should still be displayed
   - No need to reconnect

3. **Disconnect:**
   - Click the connected address button
   - Should return to "Connect Wallet" button
   - localStorage should be cleared

4. **Check localStorage:**
   ```javascript
   // Open browser console
   localStorage.getItem('@stacks/connect')
   ```

## Data Flow

```
1. User clicks "Connect Wallet"
   ↓
2. connect() shows wallet UI
   ↓
3. User approves in wallet
   ↓
4. connect() returns addresses
   ↓
5. Addresses stored in localStorage automatically
   ↓
6. React state updated with addresses
   ↓
7. UI shows connected address

On page load:
1. WalletContext mounts
   ↓
2. useEffect checks isConnected()
   ↓
3. If true, load from getLocalStorage()
   ↓
4. Set React state
   ↓
5. UI shows connected address
```

## Key Differences from v7

| Feature | v7 (Old) | v8 (New) |
|---------|----------|----------|
| Storage | Manual UserSession | Automatic localStorage |
| API | `showConnect()` | `connect()` |
| State Check | `userSession.isUserSignedIn()` | `isConnected()` |
| Get Data | `userSession.loadUserData()` | `getLocalStorage()` |
| Callbacks | `onFinish`, `onCancel` | async/await with Promise |
| Cleanup | Manual | `disconnect()` function |

## References

- [@stacks/connect v8 Storage API](./node_modules/@stacks/connect/dist/types/storage.d.ts)
- [localStorage Key: `@stacks/connect`]
- [Official Stacks Docs](https://docs.stacks.co/)

## Next Steps

Consider implementing:
1. **Real STX Balance Fetching** - Query Stacks API for actual balance
2. **Network Indicator** - Show if on mainnet or testnet
3. **Account Switcher** - Handle multiple connected accounts
4. **Token Balances** - Show SIP-010 token balances

