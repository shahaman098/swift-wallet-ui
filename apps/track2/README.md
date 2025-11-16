# Best Cross-Chain USDC Experience — Arc × Circle Bridge Kit

This codebase now targets the "Best Cross-Chain USDC Experience" challenge. The goal is a TransferWise-style flow for USDC: the user starts with USDC on one supported chain, we move it through Circle's Bridge Kit, and they end with USDC on the destination chain without touching protocol details.

## What’s already useful

- **Frontend scaffold** (`src/App.tsx`, `src/SdkProvider.tsx`) already handles auth, wallet display, and transfer states—perfect for wiring Bridge Kit UI.
- **Backend shell** (`server/index.ts`, `server/routes/*`, `server/db.ts`) gives us Express routing and SQLite-backed auth we can reuse for session + transaction tracking.
- **Shared types & API helpers** (`src/types.ts`, `src/api.ts`) keep client/server contracts tight.

## Quickstart

1. **Install dependencies** – ensure Node 18+ is available (manage tooling with `uv` if you keep Python utilities alongside this project) and run:
   ```bash
   npm install
   ```
2. **Environment variables** – copy `.env.example` to `.env` and set:
   - `VITE_ARC_RPC_URL` – Arc RPC endpoint for frontend reads.
   - `ARC_RPC_URL` – Arc RPC endpoint for backend actions.
   - `CIRCLE_API_KEY` – Circle API key with Bridge Kit and CCTP permissions.
   - `SQLITE_DB_PATH` (optional) – override SQLite location (defaults to `data/app.db`).
3. **Initialize the local database**
   ```bash
   npm run db:setup
   ```
4. **Run the stack**
   ```bash
   npm run dev:server   # http://localhost:4000
   npm run dev:client   # http://localhost:5173
   ```

## Bridge Kit integration plan

1. **Signup flow** – extend `/api/auth/signup` to create (or attach) Arc wallets and hydrate Bridge Kit credentials per user.
2. **Transfer endpoint** – replace `/api/circle/cctp-transfer` with a Bridge Kit powered pipeline (`kit.bridge({ from, to, amount })`) supporting EVM⇄EVM and EVM⇄Solana routes.
3. **Wallet sync** – implement `/api/bridge/wallets` to fetch balances from Arc and destination networks post-transfer.
4. **UX polish** – reuse existing status components but emphasize Web2 language, clear progress steps, and error recovery powered by Bridge Kit’s smart retry data.

## Helpful links

- [Bridge Kit documentation](https://developers.circle.com/usdc/docs/bridge-kit)
- [Arc network overview](https://www.arc.tech/)

## Repository hygiene

- `data/`, `*.db`, and `.env` remain gitignored—each developer should keep private keys and API keys local.
- Prefer concise, single-file changes; no placeholder fallbacks unless absolutely required.

Next up: wire Bridge Kit SDK into the backend proxy and refresh the frontend flows to surface cross-chain transfers front-and-center.
