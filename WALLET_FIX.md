# Stacks Wallet Connection Fix

## Issue
When clicking "Connect Stacks Wallet" on the landing page, the app threw an error:
```
TypeError: showConnect is not a function
```

## Root Cause
The project is using `@stacks/connect` version **8.2.0**, but the code was trying to use `showConnect()` which was **removed/renamed** in this version.

## API Changes in v8.2.0
- ❌ **Old API (v7.x)**: `showConnect(options)`
- ✅ **New API (v8.x)**: `connect(options)`

## Fix Applied

### Changed in `/src/context/WalletContext.tsx`:

**Before:**
```typescript
import { showConnect } from "@stacks/connect";

const connectWallet = () => {
  setIsConnecting(true);
  try {
    showConnect({
      appDetails,
      onFinish: () => {
        setIsConnecting(false);
        window.location.reload();
      },
      onCancel: () => {
        setIsConnecting(false);
      },
      userSession,
    });
  } catch (error) {
    console.error("Error connecting wallet:", error);
    setIsConnecting(false);
  }
};
```

**After:**
```typescript
import { connect } from "@stacks/connect";

const connectWallet = async () => {
  setIsConnecting(true);
  try {
    // Use the new connect() API from @stacks/connect v8
    const result = await connect();
    
    if (result && result.addresses) {
      // Store addresses and reload to update state
      window.location.reload();
    }
    setIsConnecting(false);
  } catch (error) {
    console.error("Error connecting wallet:", error);
    setIsConnecting(false);
  }
};
```

## Key Differences in v8 API

1. **Function Name**: `showConnect()` → `connect()`
2. **Return Type**: `void` → `Promise<GetAddressesResult>`
3. **Callbacks**: No more `onFinish`/`onCancel` callbacks - use try/catch instead
4. **Parameters**: Simpler parameter structure, focuses on `ConnectRequestOptions`

## New v8 API Features

The new `connect()` function returns a promise that resolves with:
```typescript
{
  addresses: Array<{
    address: string;
    publicKey: string;
    symbol: string;
    purpose?: 'payment' | 'ordinal';
  }>;
}
```

## Testing

To test the fix:
1. Make sure you have a Stacks wallet installed (e.g., Leather wallet)
2. Run `pnpm dev`
3. Click "Connect Stacks Wallet"
4. The wallet connection modal should now appear correctly
5. Approve the connection in your wallet
6. Your address should display in the UI

## Additional Notes

- The `connect()` function automatically shows the wallet selection UI
- It's an alias for `request('getAddresses', { forceWalletSelect: true })`
- The function properly handles both STX and BTC addresses
- Local storage caching is enabled by default in v8

## References

- [@stacks/connect v8 NPM](https://www.npmjs.com/package/@stacks/connect)
- [Stacks Documentation](https://docs.stacks.co/)
- [Package TypeScript Definitions](./node_modules/@stacks/connect/dist/types/)

