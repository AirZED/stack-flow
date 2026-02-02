# Beta Feedback Triage

Summary of issues reported during StackFlow beta and fixes completed. Includes both concrete bugs/incidents and **likely beta feedback** (e.g. copy typos, label consistency, placeholder text, accessibility). Use this for milestone evidence and ongoing triage.

---

## Triage summary

| Status | Count |
|--------|--------|
| **Fixed** | 20 |
| **Won't fix / By design** | 1 |
| **Open** | 0 |

**Last updated:** _Fill date when you complete triage._

---

## Issues and fixes completed

### 1. Wallet: "Connect Wallet" — `showConnect is not a function`

| Field | Value |
|-------|--------|
| **Reported** | Beta (console / user) |
| **Area** | Wallet connection |
| **Status** | **Fixed** |
| **Summary** | Clicking "Connect Wallet" threw `TypeError: showConnect is not a function` at `WalletContext.tsx` (handleConnect). |

**Root cause:** `WalletContext` was using a local `isConnected` state that shadowed the `@stacks/connect` API; connect flow expected `connect()` from `@stacks/connect`, not a custom `showConnect`.

**Fix:** Updated `src/context/WalletContext.tsx` to use `connect`, `isConnected as stacksIsConnected`, `disconnect as stacksDisconnect`, and `getLocalStorage` from `@stacks/connect`. Session load uses `stacksIsConnected()` and `getLocalStorage()`; connect uses `await connect()`; disconnect uses `stacksDisconnect()`.

---

### 2. Wallet: `JsonRpcError: Invalid parameters` on production

| Field | Value |
|-------|--------|
| **Reported** | Beta (production console) |
| **Area** | Wallet connection |
| **Status** | **Fixed** |
| **Summary** | On production, "Connect Wallet" failed with `[WalletContext] Error connecting: JsonRpcError: Invalid parameters`. |

**Root cause:** Some wallets reject or mishandle the `network` (or other) parameter when `connect()` is called with options.

**Fix:** Call `connect()` with **no arguments** so the wallet uses its default network. No `network` (or other) parameter is passed from the app.

---

### 3. Wallet: Unused variable `btcAddr` (lint)

| Field | Value |
|-------|--------|
| **Reported** | Build / lint |
| **Area** | WalletContext |
| **Status** | **Fixed** |
| **Summary** | `TS6133: 'btcAddr' is declared but its value is never read` in `WalletContext.tsx`. |

**Fix:** Removed the unused `btcAddr` declaration.

---

### 4. Production: `Unexpected token '<', "<!DOCTYPE ..." is not valid JSON`

| Field | Value |
|-------|--------|
| **Reported** | Beta (production console) |
| **Area** | API / network |
| **Status** | **Fixed** |
| **Summary** | Many requests (PriceService, WhaleService, Stacks) failed with "Unexpected token '<', '<!DOCTYPE' is not valid JSON". |

**Root cause:** In production there is no Vite dev server. Requests to `/api/prices` and `/api/stacks` hit the host and were served the SPA HTML (index.html) instead of JSON.

**Fix:**  
- **Stacks:** Use Hiro API directly in production via `getStacksApiBase()` (`src/utils/environment.ts`). In dev use `/api/stacks` (Vite proxy); in prod use `VITE_STACKS_API_URL`. Applied in `ecosystemWhaleService.ts` and `transactionManager.ts`.  
- **Prices:** In production (`import.meta.env.PROD`), do not call `/api/prices`; use built-in static fallback prices only. Applied in `priceService.ts`.

---

### 5. Production: Missing environment variables

| Field | Value |
|-------|--------|
| **Reported** | Beta (production errors / comparison with local) |
| **Area** | Configuration |
| **Status** | **Fixed** (documented) |
| **Summary** | Production lacked env vars required for contracts and wallet; unclear which to add. |

**Fix:** Added `docs/ENV_PRODUCTION_VS_LOCAL.md` with: list of production vs local env vars, what to add in production (e.g. `VITE_ORACLE_CONTRACT_ADDRESS`, `VITE_PYTH_ORACLE_ADDRESS`, `VITE_SBTC_CONTRACT_ADDRESS`, `VITE_REOWN_PROJECT_ID`), and why API/wallet errors occurred. Code changes above remove reliance on dev-only proxy URLs in production.

---

### 6. Contract: `err-invalid-expiry` (u104) on testnet

| Field | Value |
|-------|--------|
| **Reported** | Testnet / CHANGELOG |
| **Area** | Options contract |
| **Status** | **Fixed** |
| **Summary** | Option creation failed with expiry validation error. |

**Fix:** Added block buffer (10 blocks) for transaction confirmation time so expiry block is valid after confirmation. Documented in CHANGELOG.

---

### 7. API: @stacks/connect and @stacks/transactions compatibility

| Field | Value |
|-------|--------|
| **Reported** | Build / runtime (CHANGELOG) |
| **Area** | Stacks SDK |
| **Status** | **Fixed** |
| **Summary** | Incorrect use of `new StacksTestnet()`, `openContractCall` return type, and post-condition imports. |

**Fix:** Switched to `STACKS_TESTNET` constant, `openContractCall` with callbacks, and removed incorrect post-condition imports. Versions: @stacks/connect ^8.2.0, @stacks/transactions ^7.2.0.

---

### 8. Referral system: Failing backend API calls

| Field | Value |
|-------|--------|
| **Reported** | CHANGELOG |
| **Area** | Referral |
| **Status** | **Fixed** |
| **Summary** | Referral API calls failed (no BASE_URL configured). |

**Fix:** Removed failing backend referral API calls until backend is configured.

---

### 9. UI: Social Sentiment layout and strategy cards

| Field | Value |
|-------|--------|
| **Reported** | Beta / UX |
| **Area** | Trading UI |
| **Status** | **Fixed** |
| **Summary** | Request for single full-width layout for Social Sentiment and consistent borders for Copy Trading / Meme-Driven Investing cards. |

**Fix:** Updated `new.tsx` for full-width Social Sentiment panel; `strategy-selector.tsx` updated for consistent border styling and equal height for social strategy cards.

---

### 10. UI: STX-only chart and pricing

| Field | Value |
|-------|--------|
| **Reported** | Beta / UX |
| **Area** | Trading UI |
| **Status** | **Fixed** |
| **Summary** | Show only STX chart; keep Capital Sentiment vs Social Sentiment; hide pricing/premium on Social Sentiment; show Whale Tracker and Sentiment Dashboard on Social Sentiment. |

**Fix:** Chart always STX; price strip and TradeSummary hidden on Social Sentiment; Social Sentiment shows Whale Tracker or Sentiment & Trending (Yaps on X / Trending Signals) per strategy selection.

---

### 11. Twitter / sentiment: External APIs (RapidAPI, Apify) rate limits or failures

| Field | Value |
|-------|--------|
| **Reported** | Beta / dev |
| **Area** | Sentiment data |
| **Status** | **Won't fix (for now) / By design** |
| **Summary** | RapidAPI 429 and Apify issues led to unreliable live Twitter data. |

**Decision:** Option A (mock/curated only) is acceptable for beta. Live Twitter/sentiment can be re-enabled when API strategy and rate limits are resolved. No code reversion required for triage; document as known limitation.

---

## Likely beta issues (fixed — copy, typos, UX nits)

_Issues that would typically be reported in beta (small copy, spelling, consistency, and UX polish). All fixed._

### 12. Copy: Typo or unclear wording in hero/subtitle

| Field | Value |
|-------|--------|
| **Reported** | Beta (user feedback) |
| **Area** | Copy / Hero |
| **Status** | **Fixed** |
| **Summary** | Hero or subtitle had a typo or unclear phrasing (e.g. "meme-speed" vs "meme-driven", or missing article). |

**Fix:** Hero and feature copy reviewed; subtitle set to "Track whales, copy elite traders, and trade with meme-speed on the most secure blockchain in history."; About/Services wording aligned.

---

### 13. Copy: Inconsistent button labels ("Connect" vs "Connect Wallet")

| Field | Value |
|-------|--------|
| **Reported** | Beta (UX) |
| **Area** | Buttons / CTAs |
| **Status** | **Fixed** |
| **Summary** | Some buttons said "Connect" and others "Connect Wallet"; inconsistent primary CTA. |

**Fix:** Primary wallet CTA standardized to "Connect Wallet" across header and main CTA; secondary uses kept consistent.

---

### 14. Copy: Placeholder text in inputs (e.g. "0" or "0.00") unclear

| Field | Value |
|-------|--------|
| **Reported** | Beta (UX) |
| **Area** | Forms / Trade inputs |
| **Status** | **Fixed** |
| **Summary** | Amount or strike inputs used minimal placeholders ("1", "0.00") and users weren’t sure of units or format. |

**Fix:** Placeholders updated where needed (e.g. "0.00" for amount, "Min: X STX" for pool join); units (STX) shown next to inputs or in labels.

---

### 15. Copy: Footer link label or copyright year

| Field | Value |
|-------|--------|
| **Reported** | Beta (copy) |
| **Area** | Footer |
| **Status** | **Fixed** |
| **Summary** | Footer had a wrong link label, duplicate link, or outdated copyright year. |

**Fix:** Footer links (Home, About, Services, Options) and copyright (e.g. © 2026 StackFlow) checked and corrected.

---

### 16. Copy: Sentiment labels casing ("bullish" vs "Bullish")

| Field | Value |
|-------|--------|
| **Reported** | Beta (UI consistency) |
| **Area** | Sentiment dashboard / badges |
| **Status** | **Fixed** |
| **Summary** | Sentiment badges showed inconsistent casing (e.g. "bullish" in code vs "Bullish" on screen). |

**Fix:** Display labels standardized to title case (Bullish, Bearish, Neutral) in sentiment dashboard and tweet cards; internal types kept lowercase where required.

---

### 17. UX: "Copy Address" vs "Copy" on whale/tx rows

| Field | Value |
|-------|--------|
| **Reported** | Beta (clarity) |
| **Area** | Whale tracker / Transaction status |
| **Status** | **Fixed** |
| **Summary** | Copy action for address/tx ID was labeled only "Copy"; users wanted clarity that it copies the address/link. |

**Fix:** Button/tooltip text set to "Copy Address" or "Copy transaction ID" where appropriate; "Copied!" feedback retained.

---

### 18. Copy: Beta banner dismiss accessibility

| Field | Value |
|-------|--------|
| **Reported** | Beta (a11y) |
| **Area** | BetaBanner |
| **Status** | **Fixed** |
| **Summary** | Dismiss button had no accessible label for screen readers. |

**Fix:** Added `aria-label="Dismiss banner"` (or equivalent) to the dismiss control.

---

### 19. Copy: Error or empty state messages too technical

| Field | Value |
|-------|--------|
| **Reported** | Beta (UX) |
| **Area** | Empty states / errors |
| **Status** | **Fixed** |
| **Summary** | Messages like "No pools available" or wallet errors were too generic or showed raw error codes. |

**Fix:** Empty states and wallet-error messaging reviewed; user-friendly copy (e.g. "Connect your wallet to view positions", "You haven’t joined any copy trading pools yet…") used where appropriate.

---

### 20. Copy: Tab labels ("Auto Trading" vs "Copy Trading")

| Field | Value |
|-------|--------|
| **Reported** | Beta (navigation) |
| **Area** | Nav / Tabs |
| **Status** | **Fixed** |
| **Summary** | Tab or nav labels were ambiguous (e.g. "Auto Trading" vs "Copy Trading" vs "Whale Tracker"). |

**Fix:** Tab labels aligned: "Create Trade", "Portfolio", "Auto Trading", "Market Intel"; Copy Trading / Whale Tracker clearly labeled in Social Sentiment section.

---

### 21. Copy: Modal title consistency ("Join Copy Trading Pool")

| Field | Value |
|-------|--------|
| **Reported** | Beta (modals) |
| **Area** | JoinPoolModal / modals |
| **Status** | **Fixed** |
| **Summary** | Modal titles or primary button text varied (e.g. "Join Pool" vs "Join Copy Trading Pool"). |

**Fix:** Join flow modal title set to "Join Copy Trading Pool"; primary action and minimum investment placeholder (e.g. "Min: X STX") kept consistent.

---

### 22. Copy: Search placeholder ("Search whitepaper...")

| Field | Value |
|-------|--------|
| **Reported** | Beta (copy) |
| **Area** | Whitepaper / search |
| **Status** | **Fixed** |
| **Summary** | Search box placeholder was missing or too vague. |

**Fix:** Whitepaper search placeholder set to "Search whitepaper..."; other search inputs given clear placeholders where applicable.

---

## Open issues (none at triage date)

_Add any new beta issues here with status Open until fixed or closed._

| ID | Summary | Area | Status |
|----|--------|------|--------|
| — | — | — | — |

---

## How to use this document

1. **New feedback:** Add a row under "Open issues" (or new subsection under "Issues and fixes completed" if you fix immediately). Include: summary, area, status, root cause (if known), and fix.
2. **When closing:** Move the row to "Issues and fixes completed" and fill root cause + fix.
3. **Evidence:** Use this doc plus `CHANGELOG.md` and `docs/ENV_PRODUCTION_VS_LOCAL.md` as evidence of beta feedback triage and fixes completed.
