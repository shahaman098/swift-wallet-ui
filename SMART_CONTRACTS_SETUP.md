# Smart Contracts Setup Guide

## Overview

The backend integrates with smart contracts for:
- Vault operations (deposits, withdrawals)
- Rule execution (allocations, distributions)
- Organization registry

## Contract Addresses

Set these in `backend/.env`:

```env
VAULT_CONTRACT_ADDRESS=0x...
RULE_ENGINE_CONTRACT_ADDRESS=0x...
ORG_REGISTRY_CONTRACT_ADDRESS=0x...
```

## RPC Configuration

### Testnet (Sepolia)
```env
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

### Mainnet
```env
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

## Private Key

**⚠️ SECURITY WARNING**: Never commit private keys to git!

Set in `backend/.env`:
```env
PRIVATE_KEY=your-private-key-without-0x-prefix
```

## Contract Interaction

The `SmartContractService` handles:
- Depositing to vault
- Getting balances
- Executing allocations
- Executing distributions

## Deployment

1. Deploy contracts using Hardhat or Foundry
2. Update contract addresses in `.env`
3. Fund the signer wallet with ETH for gas
4. Test interactions on testnet first

## Testing

Contracts are optional - the app works without them but with limited functionality:
- ✅ Database operations work
- ✅ API endpoints work
- ⚠️ Onchain operations require deployed contracts

## Error Handling

If contracts aren't deployed:
- App continues to work
- Database operations succeed
- Contract calls fail gracefully
- Errors logged to console

