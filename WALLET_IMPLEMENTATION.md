# Stacks Wallet Implementation

## Overview
This document describes the clean wallet connection implementation for StackFlow, following the official Stacks documentation and Context7 recommendations.

## Changes Made

### 1. Removed Old Implementation
- **Deleted**: `src/hooks/useStacksWallet.ts` - Old custom wallet hook
- **Deleted**: `src/utils/stacks.ts` - Old utility functions

### 2. New WalletContext (`src/context/WalletContext.tsx`)

The new implementation follows the official Stacks documentation patterns:

#### Key Features:
- **Single UserSession Instance**: Creates one shared `UserSession` instance
- **Proper AppConfig**: Uses `["store_write"]` scope as recommended
- **Clean State Management**: React Context with TypeScript types
- **Automatic Auth Handling**: Handles pending sign-ins on mount
- **Address Extraction**: Provides STX and BTC addresses

#### API:
```typescript
interface WalletContextType {
  userData: UserData | undefined;
  userSession: UserSession;
  isLoading: boolean;
  isConnecting: boolean;
  connectWallet: () => void;
  disconnectWallet: () => void;
  address: string | null;          // Primary STX address
  stxAddress: string | null;        // Stacks address
  btcAddress: string | null;        // Bitcoin address
}
```

### 3. Updated ConnectButton (`src/components/atoms/ConnectButton.tsx`)

Simplified button component that:
- Uses `useWallet()` hook
- Shows "Connect Wallet" when not connected
- Displays address and balance when connected
- Supports custom onClick for trading actions

### 4. Main App Integration (`src/main.tsx`)

Added `WalletProvider` wrapper:
```tsx
<WalletProvider>
  <App />
</WalletProvider>
```

### 5. Updated All Components

Updated the following components to use `useWallet()` instead of `useStacksWallet()`:
- `src/components/pages/referral.tsx`
- `src/components/pages/history.tsx`
- `src/components/molecules/ReferralModal.tsx`
- `src/components/app/trade-summary.tsx`

**Migration Pattern:**
```typescript
// OLD
import { useStacksWallet } from "../../hooks/useStacksWallet";
const { userData } = useStacksWallet();
const address = userData?.address;

// NEW
import { useWallet } from "../../context/WalletContext";
const { address } = useWallet();
```

## Best Practices Followed

1. **Official Stacks Patterns**: Uses `connect()` from `@stacks/connect` v8.2.0 API
2. **TypeScript Safety**: Proper types for all wallet data
3. **Context Pattern**: Single source of truth for wallet state
4. **Network Agnostic**: Automatically handles testnet/mainnet based on user's wallet
5. **Error Handling**: Graceful error handling for connection failures
6. **Loading States**: Proper loading and connecting states

## Environment Configuration

The wallet uses the following environment variables (from `env.example`):
```env
VITE_APP_NAME=StackFlow
VITE_APP_ICON=http://localhost:5173/stackflow-icon.svg
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://api.testnet.hiro.so
```

## Dependencies

Required packages (already in `package.json`):
- `@stacks/connect`: ^8.2.0
- `@stacks/network`: ^7.2.0
- `@stacks/transactions`: ^7.2.0

## Testing

To test the wallet connection:

1. Install a Stacks wallet (e.g., Leather wallet browser extension)
2. Run the development server: `pnpm dev`
3. Click "Connect Stacks Wallet"
4. Approve the connection in your wallet
5. Verify your address appears in the UI
6. **Refresh the page** - your address should still be displayed
7. Click the address to disconnect
8. Verify the "Connect Wallet" button appears again

## State Persistence

The wallet state persists across page refreshes using @stacks/connect v8's built-in localStorage:
- **Storage Key**: `@stacks/connect`
- **Check Connection**: `isConnected()`
- **Get Data**: `getLocalStorage()`
- **Clear Data**: `disconnect()`

See `WALLET_PERSISTENCE_FIX.md` for detailed implementation.

## Future Enhancements

1. **Balance Fetching**: Implement real STX balance queries
2. **Network Detection**: Add network indicator (mainnet/testnet)
3. **Multiple Wallets**: Support for different wallet providers
4. **Transaction Signing**: Implement contract calls and STX transfers
5. **Account Switching**: Handle wallet account changes

## References

- [Stacks Documentation](https://docs.stacks.co/)
- [Stacks Connect Guide](https://docs.stacks.co/build/guides/frontend/authentication-with-stacks-js)
- [@stacks/connect on GitHub](https://github.com/hirosystems/connect)

