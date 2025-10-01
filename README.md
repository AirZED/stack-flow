# StackFlow

**Ride the flow of capital and sentiment on Stacks**

StackFlow is a Bitcoin-secured DeFi and sentiment trading platform built on Stacks blockchain. Track whales, copy trades, and engage in meme-driven investing with professional trading strategies made simple.

## Features

- 🐋 **Copy Trading** - Automatically mirror successful whale and efficient trader wallets
- 🎯 **Capital Sentiment Strategies** - 12 proven strategies for bullish, bearish, volatile, and stable markets
- 🎪 **Meme-Driven Investing** - Community pools driven by viral content and social sentiment
- 🔐 **Self-Custody** - Your assets never leave your wallet
- ⚡ **Bitcoin Security** - Built on Stacks, secured by Bitcoin

## Documentation

- **[Whitepaper](./WHITEPAPER.md)** - Complete platform documentation
- **[Migration Plan](./STACKFLOW_MIGRATION_PLAN.md)** - Technical implementation details

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (we use pnpm, not npm)
- A Stacks wallet (Leather or Xverse)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp env.example .env

# Start development server
pnpm dev
```

### Build for Production

```bash
# Type check and build
pnpm build

# Preview production build
pnpm preview
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS
- **Blockchain**: Stacks (@stacks/connect, @stacks/transactions)
- **State Management**: React Context + TanStack Query
- **Routing**: React Router v7
- **Charts**: Lightweight Charts

## Project Structure

```
src/
├── components/
│   ├── app/          # Trading app components
│   ├── atoms/        # Basic UI components
│   ├── molecules/    # Composite components
│   ├── layout/       # Layout wrappers
│   └── pages/        # Page components
├── hooks/            # Custom React hooks
├── context/          # React context providers
├── utils/            # Utility functions
├── blockchain/       # Blockchain integration
└── lib/              # Shared libraries
```

## Environment Variables

Create a `.env` file based on `env.example`:

```env
VITE_STACKS_NETWORK=testnet
VITE_STACKS_API_URL=https://api.testnet.hiro.so
VITE_APP_NAME=StackFlow
VITE_APP_ICON=/src/assets/stackflow-icon.svg
```

## Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Security

- All smart contracts are audited before deployment
- Non-custodial architecture - you control your funds
- Open-source for community review
- Report security issues to: security@stackflow.io

## Community

- **Telegram**: [t.me/stackflow_io](https://t.me/stackflow_io)
- **Twitter**: [@StackFlow_io](https://x.com/StackFlow_io)
- **Website**: [stackflow.io](https://stackflow.io)

## License

MIT License - see LICENSE file for details

## Hackathon

Built for Stacks Hackathon - demonstrating Bitcoin-secured DeFi with sentiment trading.

---

*Built with Bitcoin. Powered by Stacks. Driven by Community.*
