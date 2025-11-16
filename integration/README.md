## Noah’s Arc — Integrated Experience (Tracks 1–4)

This document ties together all four tracks into one cohesive, judge‑friendly narrative and explains how the apps in this repo combine into a single integrated product called “Noah’s Arc.” Use this as your landing brief for submissions, the pitch deck, and the live walkthrough.


### Why Arc + Circle

- **Stablecoins as gas (USDC/EURC)**: predictable costs and simple UX on Arc.
- **Sub‑second finality**: Malachite BFT confirms instantly — ideal for real‑time finance.
- **Selective privacy**: opt into confidentiality while remaining compliant.
- **Circle platform integration**: Wallets, Contracts, CCTP, Gateway, Paymaster, and more for global liquidity and best‑in‑class dev tooling.

References: [Arc Concepts](https://docs.arc.network/arc/concepts/welcome-to-arc), [Circle for Developers](https://www.circle.com/developer)


---

## 🌟 User Story — “Maya’s Journey with Noah’s Arc”

Maya runs a small creative studio. She pays freelancers, receives payments from clients, and manages a tight monthly budget. She’s heard about stablecoins, but every app feels too technical, fragmented, or confusing.

One morning, she opens **Noah’s Arc** — a platform that promises “finance that runs itself.”


### 1) Instant Wallet, No Web3 Overload

- Maya signs up with just an email — no seed phrase, no chain selection.
- Behind the scenes, a **Circle Wallet** is created for her on Arc.


### 2) Bringing Money In, Across Chains

- A client sends USDC from another network.
- Maya taps **“Add Money”** and a stepper guides the flow:
  - Initiate transfer → Message detected → Attestation received → Funds bridged to Arc
- Her balance updates automatically — no blockchain jargon required.


### 3) Payments That Run Themselves (Track 1: Programmable Money Studio)

- Freelancers: Emma (40%), Luis (40%), Zara (20%).
- She sets allocations and frequency; a simulation shows the next run.
- When it executes, the contract splits USDC automatically — precise and hands‑free.


### 4) Treasury Automation Like a Real Business (Track 3: Treasury Engine)

- She schedules: 10% taxes monthly, 5% emergency fund, 2% donations.
- Smart contracts automate allocations and distributions on-chain.


### 5) A Single Control Center (Tracks 2 + 4 + Integrations)

The **Command Bridge** shows:

- Live wallet balance
- Recent payments and upcoming distributions
- Cross‑chain transfers and statuses (CCTP)
- Treasury events and scheduled automations

Everything in one place — clean, simple, beautiful.


### 6) Finance That Feels Futuristic

Under the hood: Arc’s sub‑second finality + Circle Wallets, CCTP, and Gateway orchestrate a modern fintech UX. To Maya, it feels like magic.


---

## Repo Map — How the Tracks Fit Together

- `apps/track1/` — Programmable Money Studio
  - Smart contracts for scheduled/ratio splits (e.g., payroll/recipient allocations).
  - Frontend UI for creating, simulating, and executing distributions.

- `apps/track2/` — Cross‑Chain Experience
  - Circle CCTP + Bridge flows (initiate → detect message → receive attestation → mint/complete).
  - Backend helpers for wallet creation and orchestration.

- `apps/track3/` — Treasury Engine
  - Backend + frontend for business‑style allocations (tax, reserves, donations) and scheduled ops.

- `apps/track4/` — Embedded Wallet + Gateway
  - Circle Wallets embedded UX, unified USDC balance via Gateway, and in‑app payments.

- `integration/hub-frontend/` — Command Bridge UI
  - Unifies balances, transfers, distributions, and treasury events into one surface.

- `integration/hub-backend/` — Orchestration API
  - Proxies/coordinates wallet lifecycle, CCTP steps, treasury jobs, and contract calls across tracks.


---

## Quickstart — Run the Integrated App

1) Install dependencies

```bash
cd "/Users/efi/Noah’s Arc"
npm -v >/dev/null 2>&1 || echo "Please use Node 18+ and npm"
```

2) Start the orchestration backend

```bash
cd "/Users/efi/Noah’s Arc/integration/hub-backend"
npm install
npm run build || true
npm run dev
```

3) Start the Command Bridge (integration UI)

```bash
cd "/Users/efi/Noah’s Arc/integration/hub-frontend"
npm install
npm run dev
```

4) Optional: run individual track apps (for deep dives)

```bash
# Track 1
cd "/Users/efi/Noah’s Arc/apps/track1"
npm install
npm run dev

# Track 2
cd "/Users/efi/Noah’s Arc/apps/track2"
npm install
npm run dev

# Track 3
cd "/Users/efi/Noah’s Arc/apps/track3/frontend"
npm install
npm run dev

# Track 4
cd "/Users/efi/Noah’s Arc/apps/track4/frontend"
npm install
npm run dev
```


---

## Evaluation Walkthrough (5–7 minutes)

1) Sign up as Maya → instant wallet creation (Track 4 + Integration).
2) “Add Money” with cross‑chain USDC via CCTP (Track 2).
3) Configure freelancer split (40/40/20) and run a distribution (Track 1).
4) Schedule treasury rules: 10% taxes, 5% reserves, 2% donations (Track 3).
5) Open Command Bridge and show unified: balance, transfers, distributions, treasury events (Integration).

Close by reinforcing how Arc’s USDC‑as‑gas and sub‑second finality make this feel like a modern fintech app, not a web3 dashboard.

---

## Verification Checklist (for judges)

- Deployed contracts and/or services on Arc with addresses and endpoints documented
- Cross‑chain USDC flow using Circle CCTP visible in the UI and activity feed
- Embedded wallet creation and in‑app payments verified end‑to‑end
- Treasury automation shows scheduled allocations and resulting ledger entries
- Gas shown and paid in USDC; fees and statuses clearly surfaced to users
- README setup commands work out‑of‑the‑box on Node 18+ per Quickstart above


---

## Judge‑Friendly One‑Liner

“Noah’s Arc turns web3 complexity into ‘finance that runs itself’: users receive USDC from anywhere, automate payroll and treasury, and manage everything from one control center — powered by Arc + Circle.”


---

## Citations

- Arc Concepts: https://docs.arc.network/arc/concepts/welcome-to-arc
- Circle for Developers: https://www.circle.com/developer


---

## Notes for Extensibility

- Add Paymaster to enable full gas‑in‑USDC flows end‑to‑end.
- Expand privacy‑aware views for sensitive events using Arc’s configurable privacy.
- Plug in StableFX for automated multi‑currency treasury rebalancing.


