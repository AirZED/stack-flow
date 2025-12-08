# STACKFI HACKATHON PRD

## Project Name
**StackFlow**

## Tagline
*"Ride the flow of capital and sentiment on Stacks."*

**Built on:** Stacks Blockchain with Bitcoin security

---

## Overview
StackFlow is a Bitcoin-secured DeFi and sentiment trading platform built on Stacks. It combines capital market strategies, social sentiment signals, and AI-powered whale tracking into a single experience. Users can track, copy, and act on the moves of whales and efficient traders, while also engaging in meme-driven investing and structured capital strategies (bullish, bearish, high volatility, low volatility).

The vision is to make sophisticated trading simple and social, where anyone can leverage the flow of capital and sentiment in real time.

---

## Actors in the System

### 1. End Users (Retail Traders)
- Browse dashboard of whale wallets, memes, and capital strategies.
- Subscribe to copy trading signals.
- Execute trades directly or opt into auto-micro-trades.
- Share meme-based investment ideas with the community.
- View PnL, alerts, and educational videos.

### 2. Whales / Efficient Traders
- Their wallet activity is tracked in real time.
- Provide implicit trading signals (no manual input).
- Optionally register to monetize their signals (future version).

### 3. Developers (Hackathon Team)
- Build responsive UI with smooth UX.
- Implement copy trading & meme investing modules.
- Deploy at least one capital sentiment strategy.
- Ensure security in contract interactions.

### 4. Smart Contracts (On-Chain Actors)
- **Signal Contracts:** record whale trades and sentiment events.
- **Execution Contracts:** manage user funds for auto-trading.
- **Strategy Contracts:** implement bullish, bearish, volatility strategies.

### 5. AI & Off-Chain Services
- Whale detection & ranking system (efficient wallet analysis).
- Sentiment engine for memes, viral content, and news signals.
- Oracles for price feeds and volatility measures.

### 6. Community
- Social layer of users who share memes, trade ideas, and signals.
- Contribute to meme-driven investing pool.

---

## Core Features

### Capital Sentiments

#### Bullish Strategies
- **Call:** High profits if the price rises sharply.
- **Strap:** High profits if the price rises sharply, reasonable profits if the price falls.
- **Bull Call Spread:** Low cost, decent profits if the price rises to a certain level.
- **Bull Put Spread:** Low cost, decent profits if the price stays at a certain level or rises.

#### Bearish Strategies
- **Put:** High profits if the price falls sharply.
- **Strip:** High profits if the price falls sharply, reasonable profits if the price rises.
- **Bear Put Spread:** Low cost, decent profits if the price falls to a certain level.
- **Bear Call Spread:** Low cost, decent profits if the price stays at a certain level or falls.

#### High Volatility
- **Straddle:** High profits if the price rises or falls sharply during the period of holding (10% discount).
- **Strangle:** Low cost, very high profits if the price rises or falls significantly.

#### Low Volatility
- **Long Butterfly:** Low cost, high profits if the price is about a strike price.
- **Long Condor:** Decent profits if the price changes slightly.

### Social Sentiments
- **Copy Trading** → Automatically mirror whale and efficient trader wallets.
- **Meme-Driven Investing** → Community pools driven by viral content and meme culture.
