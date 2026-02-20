# ZeroGate

**Local-first content paywall. No accounts. No tracking. Powered by Polkadot.**

🔗 **Live Demo**: [https://v0id-one.vercel.app](https://v0id-one.vercel.app)

ZeroGate replaces the "Create Account" wall with a single, permissionless on-chain payment. Creators receive 100% of funds directly. Users own content forever — no subscriptions, no data harvesting.

---

## The Problem

| Web2 (Today)                        | ZeroGate (Web3)                     |
| ----------------------------------- | ----------------------------------- |
| "Sign in with Google" — data trade  | Connect wallet — zero data shared   |
| $15/month subscription for 1 article | 0.1 PAS one-time micro-payment     |
| Platform takes 30% cut              | Creator receives 100%               |
| Content locked behind centralized servers | Decryption key stored locally in browser |
| Requires email, password, cookies   | No account. No cookies. No tracking |

## How It Works

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Browser    │────▶│  Smoldot Light  │────▶│  Paseo Relay  │
│  (Next.js)   │     │  Client (WASM)  │     │    Chain      │
└──────┬───────┘     └─────────────────┘     └──────────────┘
       │                                            │
       │  1. User clicks "Unlock"                   │
       │  2. Signs tx via Polkadot extension        │
       │  3. Smoldot verifies on-chain (no RPC!)    │
       │  4. Backend returns decryption key         │
       │  5. Key stored in localStorage forever     │
       ▼                                            │
┌──────────────┐                                    │
│  localStorage │◀───────── decryption key ─────────┘
│  (IndexedDB)  │
└──────────────┘
```

**Key innovation**: Smoldot runs entirely in the browser as a WASM light client, verifying transactions directly against the Polkadot Relay Chain. No centralized RPC providers (Infura/Alchemy). True decentralization.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Blockchain**: Polkadot (Paseo Testnet)
- **Light Client**: Smoldot (in-browser WASM)
- **API**: polkadot-api (PAPI) with typed descriptors
- **Wallet**: @polkadot/extension-dapp (Polkadot.js, Talisman, SubWallet)
- **UI**: Tailwind CSS v4, Framer Motion, Lucide Icons
- **Storage**: localStorage (persistent unlock)

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3010
```

## Live Demo Flow

1. Open the app → see a **blurred, locked article**
2. Click "Sign in with Google" → error toast shows data harvesting
3. Click "Connect Polkadot Wallet" → select your Paseo account
4. Click "Unlock Article — 0.1 PAS" → sign transaction
5. Watch the **3×3 grid flip animation** reveal unlocked content
6. Refresh the page → **content stays unlocked** (localStorage)

## Architecture

```
app/
├── page.tsx          # Main UI — article paywall, Web2/Web3 comparison
├── layout.tsx        # Root layout with Playfair Display + Inter fonts
├── globals.css       # Moonbirds color palette CSS variables
├── api/
│   └── verify-payment/route.ts   # Server-side tx verification
components/
├── WalletConnect.tsx  # Polkadot wallet hook (dynamic import for SSR)
├── UnlockCard.tsx     # Standalone unlock card component
lib/
├── papi.ts           # Polkadot API client + transaction logic
├── smoldot.ts        # Smoldot WebWorker light client initialization
├── store.ts          # Zustand global wallet state
```

## License

MIT
