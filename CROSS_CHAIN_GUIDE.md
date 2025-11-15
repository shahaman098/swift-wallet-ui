# Cross-Chain Capabilities Guide

This application now supports full cross-chain operations with multi-chain balances, CCTP integration, and chain-aware transaction processing.

## Features

### Multi-Chain Balances
- **Chain-Specific Balances**: Each chain maintains its own USDC balance
- **Total Balance**: Aggregated balance across all chains
- **Chain ID Awareness**: All operations are aware of chain IDs and network information
- **Real-time Sync**: Balances sync with Circle wallet balances

### CCTP Integration
- **Burn & Mint Operations**: Proper USDC burn on source chain and mint on destination
- **Attestation Tracking**: Circle attestation for cross-chain transfers
- **Settlement States**: Real-time tracking of transfer settlement states
- **Transaction Hashes**: Separate tracking for burn and mint transaction hashes

### Chain Selectors
- **Source Chain Selection**: Choose which chain to send from
- **Destination Chain Selection**: Choose which chain to send to
- **Chain Information**: Display chain IDs, network types, and native currencies
- **Auto CCTP Detection**: Automatically enables CCTP for cross-chain transfers

### Settlement States
- **Pending**: Initial state
- **Burning**: USDC being burned on source chain
- **Burned**: USDC successfully burned
- **Attesting**: Waiting for Circle attestation
- **Attested**: Attestation received
- **Minting**: USDC being minted on destination chain
- **Completed**: Transfer fully completed
- **Failed**: Transfer failed at any stage

## Supported Chains

| Chain Key | Chain ID | Network | Native Currency | CCTP Domain |
|-----------|----------|---------|------------------|-------------|
| ETH-SEPOLIA | 11155111 | Testnet | ETH | 0 |
| AVAX-FUJI | 43113 | Testnet | AVAX | 1 |
| MATIC-AMOY | 80002 | Testnet | MATIC | 7 |
| BASE-SEPOLIA | 84532 | Testnet | ETH | 6 |

## API Endpoints

### Multi-Chain Balance Endpoints

**Get All Chain Balances**
```
GET /api/wallet/balance
Response: {
  balances: { 'ETH-SEPOLIA': 100, 'AVAX-FUJI': 50 },
  totalBalance: 150,
  legacyBalance: 150
}
```

**Get Specific Chain Balance**
```
GET /api/wallet/balance?chain=ETH-SEPOLIA
Response: {
  chain: 'ETH-SEPOLIA',
  balance: 100,
  chainId: 11155111
}
```

**Get Circle Wallet Balances**
```
GET /api/circle/wallet/balance
GET /api/circle/wallet/balance?chain=ETH-SEPOLIA
Response: {
  balances: { 'ETH-SEPOLIA': 100, 'AVAX-FUJI': 50 },
  walletId: '...'
}
```

**Get Supported Chains**
```
GET /api/chains
Response: {
  chains: [
    {
      key: 'ETH-SEPOLIA',
      chainId: 11155111,
      name: 'Ethereum Sepolia',
      network: 'testnet',
      nativeCurrency: 'ETH',
      cctpDomain: 0
    },
    ...
  ]
}
```

### Cross-Chain Transfer Endpoints

**Send Payment (Chain-Aware)**
```
POST /api/circle/wallet/send
Body: {
  amount: 100,
  destinationAddress: '0x...',
  sourceChain: 'ETH-SEPOLIA',
  destinationChain: 'AVAX-FUJI',
  useCCTP: true,  // Auto-enabled if chains differ
  note: 'Optional note'
}
Response: {
  transferId: '...',
  status: 'pending',
  settlementState: 'burning',
  sourceChain: 'ETH-SEPOLIA',
  destinationChain: 'AVAX-FUJI',
  burnTxHash: '0x...',
  mintTxHash: null,
  transaction: {...}
}
```

**Get Transfer Settlement Status**
```
GET /api/circle/transfer/:transferId
Response: {
  transferId: '...',
  status: 'pending',
  settlementState: 'minting',
  burnTxHash: '0x...',
  mintTxHash: '0x...',
  sourceChain: 'ETH-SEPOLIA',
  destinationChain: 'AVAX-FUJI',
  attestation: '...'
}
```

**Deposit (Chain-Aware)**
```
POST /api/circle/wallet/deposit
Body: {
  amount: 100,
  blockchain: 'ETH-SEPOLIA',
  note: 'Optional note'
}
Response: {
  depositAddress: '0x...',
  blockchain: 'ETH-SEPOLIA',
  chainId: 11155111,
  amount: 100,
  transactionId: '...'
}
```

## Data Model

### User Balances
```json
{
  "id": "user-id",
  "balance": 150,  // Legacy total (sum of all chains)
  "balances": {
    "ETH-SEPOLIA": 100,
    "AVAX-FUJI": 50
  },
  "circleWalletId": "...",
  "arcAccountId": "..."
}
```

### Transaction with Chain Info
```json
{
  "id": "tx-id",
  "type": "send",
  "amount": 50,
  "chainKey": "ETH-SEPOLIA",
  "sourceChain": "ETH-SEPOLIA",
  "destinationChain": "AVAX-FUJI",
  "settlementState": "minting",
  "cctpTransferId": "...",
  "burnTxHash": "0x...",
  "mintTxHash": "0x...",
  "attestation": "...",
  "recipient": "0x...",
  "balanceAfter": 50,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:05:00Z"
}
```

## CCTP Flow

1. **Initiate Transfer**: User initiates cross-chain transfer
2. **Burn Phase**: USDC burned on source chain
   - Settlement state: `burning` → `burned`
   - `burnTxHash` recorded
3. **Attestation Phase**: Circle provides attestation
   - Settlement state: `attesting` → `attested`
   - `attestation` recorded
4. **Mint Phase**: USDC minted on destination chain
   - Settlement state: `minting` → `completed`
   - `mintTxHash` recorded

## UI Components

### ChainSelector
- Dropdown selector for blockchain networks
- Shows chain ID and network type
- Used in AddMoney and SendPayment pages

### MultiChainBalance
- Displays balances for all chains
- Shows total balance
- Click to view individual chain details

### SettlementStatus
- Visual indicator of transfer settlement state
- Shows burn/mint transaction hashes
- Displays cross-chain flow information

## Frontend Usage

```typescript
import { chainAPI, circleAPI } from '@/api/client';
import ChainSelector from '@/components/ChainSelector';
import MultiChainBalance from '@/components/MultiChainBalance';
import SettlementStatus from '@/components/SettlementStatus';

// Get all balances
const balances = await chainAPI.getBalance();
// { balances: {...}, totalBalance: 150 }

// Get specific chain balance
const ethBalance = await chainAPI.getBalance('ETH-SEPOLIA');
// { chain: 'ETH-SEPOLIA', balance: 100, chainId: 11155111 }

// Cross-chain transfer
const transfer = await circleAPI.send({
  amount: 50,
  destinationAddress: '0x...',
  sourceChain: 'ETH-SEPOLIA',
  destinationChain: 'AVAX-FUJI',
  useCCTP: true,
});

// Poll settlement status
const status = await circleAPI.getTransferStatus(transfer.transferId);
```

## Key Differences from Simple Balance Model

### Before (Simple)
- Single `balance` number
- Simple addition/subtraction
- No chain awareness
- No cross-chain support

### After (Multi-Chain)
- `balances` object: `{ 'ETH-SEPOLIA': 100, 'AVAX-FUJI': 50 }`
- Chain-specific operations
- Full chain ID awareness
- CCTP burn/mint tracking
- Settlement state monitoring
- Cross-chain bridge support

## Benefits

1. **True Cross-Chain**: Actual USDC burns and mints across chains
2. **Chain Awareness**: All operations know which chain they're on
3. **Settlement Tracking**: Real-time visibility into transfer states
4. **Multi-Chain Portfolio**: View and manage balances across all chains
5. **CCTP Integration**: Native Circle CCTP protocol support
6. **Transaction Transparency**: Full visibility into burn/mint hashes

## Notes

- Balances are stored per-chain, not as simple additions
- Cross-chain transfers use CCTP burn/mint, not simple balance transfers
- Settlement states are tracked and updated in real-time
- Chain IDs are validated and used throughout the system
- All transactions include chain context

