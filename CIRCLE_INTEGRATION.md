# Circle Wallet (CCTP) Integration Guide

This application now integrates Circle's Programmable Wallets and Cross-Chain Transfer Protocol (CCTP) for USDC deposits and payments.

## Setup

### 1. Get Circle API Key

1. Sign up at [Circle Console](https://console.circle.com/)
2. Create a new application
3. Copy your API key from the dashboard

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Circle API Configuration
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_API_BASE=https://api.circle.com/v1

# For testnet/sandbox, use:
# CIRCLE_API_BASE=https://api-sandbox.circle.com/v1

# Frontend API URL
VITE_API_URL=http://localhost:3000
```

### 3. Restart Servers

After setting up environment variables, restart both servers:

```bash
# Backend (in one terminal)
npm run server

# Frontend (in another terminal)
npm run dev
```

## Features

### Add Money (Deposits)

- **Blockchain Selection**: Choose from supported testnets (Ethereum Sepolia, Avalanche Fuji, Polygon Amoy)
- **Deposit Address Generation**: Automatically creates a unique deposit address for each transaction
- **USDC Support**: All deposits are in USDC
- **Auto Wallet Creation**: Circle wallet is automatically created for new users

### Send Payments

- **Cross-Chain Transfers**: Send USDC across different blockchains using CCTP
- **Same-Chain Transfers**: Regular transfers on the same blockchain
- **Address Validation**: Validates recipient addresses before sending
- **Transfer Tracking**: Each transfer gets a unique transfer ID

## Supported Blockchains (Testnet)

- **Ethereum Sepolia** (`ETH-SEPOLIA`)
- **Avalanche Fuji** (`AVAX-FUJI`)
- **Polygon Amoy** (`MATIC-AMOY`)

## API Endpoints

### Backend Endpoints

- `POST /api/circle/wallet/create` - Create a Circle wallet
- `GET /api/circle/wallet/balance` - Get wallet balance
- `POST /api/circle/wallet/deposit-address` - Generate deposit address
- `POST /api/circle/wallet/deposit` - Initiate deposit
- `POST /api/circle/wallet/send` - Send payment (supports CCTP)

### Frontend API Client

```typescript
import { circleAPI } from '@/api/client';

// Create wallet
await circleAPI.createWallet();

// Get balance
await circleAPI.getBalance();

// Create deposit address
await circleAPI.createDepositAddress('ETH-SEPOLIA');

// Deposit
await circleAPI.deposit({ amount: 100, blockchain: 'ETH-SEPOLIA' });

// Send payment
await circleAPI.send({
  amount: 50,
  destinationAddress: '0x...',
  blockchain: 'ETH-SEPOLIA',
  destinationChain: 'AVAX-FUJI',
  useCCTP: true,
  note: 'Payment note'
});
```

## How It Works

### Deposits

1. User enters amount and selects blockchain
2. System creates/retrieves Circle wallet for user
3. Deposit address is generated for the selected blockchain
4. User sends USDC to the deposit address
5. Balance updates automatically once transaction is confirmed

### Payments

1. User enters recipient address, amount, and blockchain info
2. If source and destination chains differ, CCTP is automatically suggested
3. Transfer is initiated via Circle API
4. Transaction is recorded in the database
5. Transfer ID is returned for tracking

## CCTP (Cross-Chain Transfer Protocol)

CCTP enables seamless USDC transfers across different blockchains:

- **Burn on Source Chain**: USDC is burned on the originating blockchain
- **Attestation**: Circle provides a signed attestation
- **Mint on Destination**: USDC is minted on the target blockchain

This eliminates the need for wrapped tokens or liquidity pools.

## Notes

- Currently configured for **testnet** environments
- For production, update blockchain values to mainnet chains
- Circle API requires proper authentication
- Webhook integration recommended for real-time balance updates
- All amounts are in USDC (6 decimal places)

## Troubleshooting

### "Circle wallet not found"
- Ensure wallet creation endpoint is called first
- Check that user has a valid authentication token

### "Failed to create Circle wallet"
- Verify `CIRCLE_API_KEY` is set correctly
- Check API key permissions in Circle Console
- Ensure you're using the correct API base URL (sandbox vs production)

### "Invalid address"
- Recipient addresses must be valid blockchain addresses
- For EVM chains, addresses should start with `0x` and be 42 characters long

## Resources

- [Circle Developer Documentation](https://developers.circle.com/)
- [CCTP Documentation](https://developers.circle.com/cross-chain-transfer-protocol)
- [Circle Console](https://console.circle.com/)

