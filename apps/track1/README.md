# Track 1 — SmartPay Scheduler (Arc Testnet)

Advanced programmable stablecoin system demonstrating:
- Multi-recipient allocations with strict 100% total allocation
- Time-based automation (interval, last execution)
- Threshold-based automation (min USDC balance)
- Manual execution guarded by rules
- Full CRUD for recipients
- Event-rich telemetry for judges

USDC (Arc Testnet) used: `0x1f6C2d595c94F44aA7Be0A49afA7292117fE13e6`

## What it does
SmartPayScheduler holds USDC, lets the owner define recipients with percentages, and executes distributions only when:
1) enough time passed since last run (interval),
2) balance >= threshold,
3) total allocations equal exactly 100%.

## Why this is advanced programmable stablecoin logic
It encodes policy (time windows + thresholds + allocations) directly in the contract. The contract won’t release funds unless all policy checks pass, showcasing automated, programmable money behavior.

## Hardhat — Setup

```sh
cd apps/track1
npm install
```

Create `.env` from `.env.example`:

```
ARC_RPC_URL=
ARC_PRIVATE_KEY=
ARC_CHAIN_ID=70700
ARC_USDC_ADDRESS=0x1f6C2d595c94F44aA7Be0A49afA7292117fE13e6
```

## Compile
```sh
npx hardhat compile
```

## Deploy (Arc testnet)
```sh
npx hardhat run scripts/deploy.ts --network arc
```

## Add recipients
```sh
CONTRACT_ADDRESS=<deployed_address> \
RECIPIENT_WALLET=<recipient1> \
RECIPIENT_SHARE=50 \
npx hardhat run scripts/addRecipient.ts --network arc

CONTRACT_ADDRESS=<deployed_address> \
RECIPIENT_WALLET=<recipient2> \
RECIPIENT_SHARE=50 \
npx hardhat run scripts/addRecipient.ts --network arc
```

## Fund the contract with USDC
```sh
CONTRACT_ADDRESS=<deployed_address> \
FUND_AMOUNT=10.0 \
npx hardhat run scripts/fundContract.ts --network arc
```

## Execute distribution
```sh
CONTRACT_ADDRESS=<deployed_address> \
npx hardhat run scripts/executeDistribution.ts --network arc
```

## Frontend (reference)
This project ships a lightweight Vite + React UI for demo/navigation:
```sh
cd apps/track1/frontend
npm i
npm run dev
```

Pages:
- Home: Overview and quick actions
- Deploy: Instructions to deploy via Hardhat
- Recipients: Helper to craft addRecipient calls
- Distribution: Helper to craft executeDistribution calls
- Events: Notes on reading emitted events

## Why this is a strong Track 1 submission
- Explicit programmable policy (time/threshold/allocations)
- Safe execution with reentrancy guard
- Clear event signals for all actions
- Uses official Arc USDC on testnet


