# Managed Bridge Setup Guide

This guide explains how the managed bridge feature works and how to configure it.

## Overview

The application now supports two bridge modes:

1. **Self-Managed (MetaMask)**: User signs all transactions with their injected wallet
2. **Managed Bridge**: Backend handles the complexity using Circle Wallets API

## Architecture

### Self-Managed Flow
- User connects MetaMask
- Frontend creates Bridge Kit adapter from wallet provider
- User approves and signs all transactions (approve, burn, mint)
- Transactions execute directly from user's wallet

### Managed Bridge Flow
- User connects MetaMask (for address only)
- User submits bridge request to backend
- Backend uses Circle Wallets to sign transactions
- Backend executes Bridge Kit flow with custodial wallet
- Frontend polls for status updates

## Setup Steps

### 1. Generate Entity Secret

```bash
npx ts-node register-entity-secret.ts
```

This will:
- Generate a 32-byte entity secret
- Register it with Circle
- Save recovery file to `circle-entity-secret-recovery.json`
- Output the secret to add to `.env`

### 2. Create Wallet Set and Wallets

```bash
npx ts-node create-wallets.ts
```

This will:
- Create a wallet set in Circle
- Create EOA wallets on Arc Testnet and Polygon Amoy
- Output wallet IDs and addresses to add to `.env`

### 3. Configure Environment

Update `.env` with the values from the scripts above:

```bash
# Circle Wallets Configuration
CIRCLE_API_KEY="your_api_key"
CIRCLE_ENTITY_SECRET="ff86b4b457a77859eca491790b1e68cb2d549b64b5a10caff22da8de921dc4da"
CIRCLE_WALLET_SET_ID="a47ef2de-93b8-588a-a454-2586c451dfc4"

# Managed Wallets
ARC_MANAGED_WALLET_ID="7c899bb9-292f-5835-bf58-0d95bd3280b5"
ARC_MANAGED_WALLET_ADDRESS="0x4d83b3b8eb6a5016bf62328c0105f5fbded52e7d"
POLYGON_MANAGED_WALLET_ID="d6b9187b-a3e8-59de-a562-7c5ac4cb1eb2"
POLYGON_MANAGED_WALLET_ADDRESS="0x4d83b3b8eb6a5016bf62328c0105f5fbded52e7d"

# RPC Endpoints
ARC_RPC_URL="https://your-quicknode-url"
POLYGON_RPC_URL="https://rpc-amoy.polygon.technology"

# Self-Managed Wallet (for backend signing)
SELF_MANAGED_PK="0x194313476f5d11122884620fbb2b548c4ca4de25a417e5a86216df5f07500ab3"
```

### 4. Fund Managed Wallets

The managed wallets need:
- **Native gas tokens** (ARC on Arc Testnet, POL on Polygon Amoy)
- **USDC** on the source chain for bridging

Send test tokens to `0x4d83b3b8eb6a5016bf62328c0105f5fbded52e7d`

### 5. Initialize Database

```bash
npm run db:setup
```

This creates the `bridge_jobs` and `bridge_job_events` tables.

### 6. Start the Application

```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev
```

## API Endpoints

### Submit Managed Bridge

```
POST /api/managed-bridge/submit
Content-Type: application/json

{
  "userSourceAddress": "0x...",
  "userDestAddress": "0x...",
  "amount": "10.00",
  "fromChain": "Base_Sepolia",
  "toChain": "Arc_Testnet"
}

Response:
{
  "jobId": "uuid",
  "status": "pending"
}
```

### Get Bridge Status

```
GET /api/managed-bridge/:jobId

Response:
{
  "id": "uuid",
  "status": "pending|processing|completed|failed",
  "userSourceAddress": "0x...",
  "userDestAddress": "0x...",
  "amount": "10.00",
  "fromChain": "Base_Sepolia",
  "toChain": "Arc_Testnet",
  "depositTxHash": null,
  "approveTxHash": null,
  "burnTxHash": "0x...",
  "attestation": null,
  "mintTxHash": "0x...",
  "payoutTxHash": null,
  "errorMessage": null,
  "createdAt": "2025-01-15T12:00:00Z",
  "updatedAt": "2025-01-15T12:01:00Z"
}
```

## Database Schema

### bridge_jobs

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (UUID) |
| user_source_address | TEXT | User's source chain address |
| user_dest_address | TEXT | User's destination chain address |
| amount | TEXT | USDC amount to bridge |
| from_chain | TEXT | Source blockchain |
| to_chain | TEXT | Destination blockchain |
| status | TEXT | pending, processing, completed, failed |
| deposit_tx_hash | TEXT | Deposit transaction hash (if applicable) |
| approve_tx_hash | TEXT | Approval transaction hash |
| burn_tx_hash | TEXT | Burn transaction hash |
| attestation | TEXT | CCTP attestation |
| mint_tx_hash | TEXT | Mint transaction hash |
| payout_tx_hash | TEXT | Payout transaction hash (if applicable) |
| error_message | TEXT | Error message if failed |
| created_at | TEXT | Job creation timestamp |
| updated_at | TEXT | Last update timestamp |

### bridge_job_events

| Column | Type | Description |
|--------|------|-------------|
| id | TEXT | Primary key (UUID) |
| job_id | TEXT | Foreign key to bridge_jobs |
| event_type | TEXT | Event type (e.g., "status_change") |
| event_data | TEXT | JSON event data |
| created_at | TEXT | Event timestamp |

## Security Considerations

1. **Entity Secret**: Store securely, never commit to git
2. **Recovery File**: Keep `circle-entity-secret-recovery.json` in a safe location
3. **Private Keys**: The `SELF_MANAGED_PK` is only for hackathon demo purposes
4. **Production**: Use proper key management (HSM, KMS) for production deployments

## Troubleshooting

### "CIRCLE_API_KEY and CIRCLE_ENTITY_SECRET must be set"
- Ensure `.env` has both values set
- Restart the backend server after updating `.env`

### "Job stays in 'pending' status"
- Check backend logs for errors
- Ensure managed wallets have sufficient gas and USDC
- Verify RPC endpoints are accessible

### "Failed to submit managed bridge"
- Check network connectivity
- Verify backend is running on port 4000
- Check browser console for detailed error messages

## Next Steps

- Add webhook notifications for job status updates
- Implement deposit monitoring for user-to-custodial transfers
- Add liquidity management and rebalancing
- Implement fee calculation and collection
