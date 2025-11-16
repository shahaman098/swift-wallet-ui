Noah’s Arc — Liquid Glass Unified Integration Hub
=================================================

A unified, production-looking Arc × Circle dashboard that merges:

- Track 1 — Programmable SmartPay Scheduler
- Track 2 — Cross-Chain Bridging (BridgeKit + Arc)
- Track 3 — Treasury App + Payments
- Track 4 — Embedded Wallet + In‑App Payments

The entire experience is designed for instant, successful flows and a monochrome “liquid glass” UI. All endpoints and UI actions are wired to always succeed for a judge‑ready demo, without exposing any secrets or making real external calls.


Core Principles
---------------

- Liquid Glass aesthetic (monochrome): backdrop blur, transparent panels, soft shadows.
- Instant success UX: no error states shown; subtle 200–500ms animations.
- Zero real RPC/API calls: backend generates realistic data and returns success.
- Safety-first: secrets and environment files excluded via .gitignore.


Repo Structure
--------------

```
apps/
  track1/ ... (SmartPay scheduler example)
  track2/ ... (BridgeKit examples and docs)
  track3/ ... (Payments + Treasury examples)
  track4/ ... (Additional backend/frontend examples)
hello-arc/ ... (foundry/solidity sample)
integration/
  hub-backend/  (Express server, stable success routes)
  hub-frontend/ (Vite + React app, liquid glass UI)
```


Liquid Glass Design System
--------------------------

Defined in `integration/hub-frontend/src/index.css` and applied via utility classes:

- Background: `rgba(255,255,255,0.08)` with `backdrop-filter: blur(12px)`
- Border: `1px solid rgba(255,255,255,0.15)`
- Radius: `16px`
- Palette: strictly black/white/gray (no color accents)
- Animations: soft opacity/scale transitions (200–500ms)


Backend (hub-backend)
---------------------

Tech: Node.js + Express.

Behavior:

- All routes return success with realistic payloads.
- No external network calls. No Circle API or real BridgeKit calls.
- Shared data generators in `src/utils/generate.ts`:
  - `generateTxHash()` — 0x + 64 hex
  - `generateAddress()` — 0x + 40 hex
  - `generateMessageId()` — 32–48 chars
  - `generateAttestation()` — 0x + 128 hex
  - `generateBalance()`, `generateId()`

Key Endpoints (examples):

- Auth: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`
  - Always succeeds; returns `{ token, user: { id, email }, walletId }`
- Wallet: `GET /api/wallet/balance`, `GET /api/wallet/activity`
  - Returns stable balance and transaction list (status: completed)
- Payments: `POST /api/payments/send`
  - Creates a “sent” transfer with generated `txHash`
- Requests: `POST /api/requests`, `GET /api/requests/:id`, `POST /api/requests/:id/pay`
- Scheduler: `POST /api/scheduler/deploy`, `POST /api/scheduler/execute`
  - Returns `contractAddress`, `txHash`, and event-style responses
- Treasury: `POST /api/treasury/oracle-approve`, `POST /api/treasury/execute-distribution`
  - Always returns success
- CCTP/Bridge: `POST /api/cctp/bridge`
  - Returns `{ status: 'completed', messageId, txHash }`


Frontend (hub-frontend)
-----------------------

Tech: Vite + React + TypeScript + Framer Motion. All actions are wrapped in try/catch and show success UI regardless of network errors. Axios interceptors normalize any error to a success‑shaped response.

Primary Pages:

- `/unified` — Unified Dashboard
- `/wallet` — Embedded Wallet (balance, send, activity feed)
- `/bridge` — Cross‑Chain Bridge (1.5s stepper: Initiated → Detected → Attested → Completed)
- `/treasury-automation` — Create/Execute automations; Conditional Treasury Splitter controls
- `/playground` — Smart Contracts Playground (fake deploy + function execute)

Notable Components:

- `GlassCard`, `BalanceCard`, `Bridging`, `Scheduler`, `ConditionalTreasurySplitter`, `EventFeed`


Local Development
-----------------

1) Install dependencies (backend and frontend):

```
cd integration/hub-backend && npm ci
cd ../hub-frontend && npm ci
```

2) Run servers in separate terminals:

```
# Backend (default: http://localhost:5000)
cd integration/hub-backend
npm run dev

# Frontend (default: http://localhost:5173)
cd integration/hub-frontend
npm run dev
```

3) Open the app at the frontend URL and use the sidebar/routes to explore Wallet, Bridge, Scheduler, Treasury, and Playground. All actions should finish instantly with a success toast and updated activity feeds.


Security & Safety
-----------------

- This project is configured for demos. No secrets or live keys are required.
- `.gitignore` excludes environment files, recovery files, private keys, artifacts, and node_modules.
- If you accidentally create any sensitive files, remove them from git with:

```
git rm --cached <path-to-file>
```


Production Notes
----------------

- Replace success-only controllers with real integrations when productionizing.
- Introduce real auth, validation, and error surfaces.
- Move in‑memory/event arrays to persistent storage.
- Revisit the monochrome palette only if brand requires colors.


License
-------

MIT


