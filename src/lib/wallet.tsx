import { createAppKit } from '@reown/appkit/react';

// Get Project ID from environment
export const projectId = import.meta.env.VITE_REOWN_PROJECT_ID || '5423def4a6d894310da27a68b0f97ab5';

// Define Stacks networks for Reown
export const stacksMainnet = {
  id: '1',
  caipNetworkId: 'stacks:1',
  name: 'Stacks Mainnet',
  chainNamespace: 'stacks',
  rpcUrl: '/api/stacks', // Route through our proxy
  explorerUrl: 'https://explorer.stacks.co',
  currency: 'STX',
};

export const stacksTestnet = {
  id: '2147483648',
  caipNetworkId: 'stacks:2147483648',
  name: 'Stacks Testnet',
  chainNamespace: 'stacks',
  rpcUrl: 'https://api.testnet.hiro.so',
  explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
  currency: 'STX',
};

// Metadata for the app
const metadata = {
  name: import.meta.env.VITE_APP_NAME || 'StackFlow',
  description: 'StackFlow - Premium Stacks Trading & Market Intel',
  url: window.location.origin,
  icons: [import.meta.env.VITE_APP_ICON || window.location.origin + '/icon.svg']
};

// Initialize AppKit
export const modal = createAppKit({
  adapters: [], // Universal adapter for Stacks
  networks: [stacksMainnet, stacksTestnet] as any,
  projectId,
  metadata,
  themeMode: 'dark',
  features: {
    analytics: false,
    onramp: false,
    email: false,
  },
  themeVariables: {
    '--w3m-accent': '#37F741',
  },
  // Specific Stacks namespace configuration as per context7 pattern
  // @ts-ignore
  optionalNamespaces: {
    stacks: {
      methods: [
        'stx_signTransaction',
        'stx_transferStx',
        'stx_callContract',
        'stx_signMessage',
        'stx_contractDeploy'
      ],
      chains: ['stacks:1', 'stacks:2147483648'],
      events: ['addressesChanged', 'chainChanged']
    }
  }
});
