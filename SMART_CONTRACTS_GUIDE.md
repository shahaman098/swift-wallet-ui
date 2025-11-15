# Smart Contract Wallets & Treasury Automation Guide

This application now includes smart contract wallet deployment, treasury automation, and policy engine integration for managing allocations and distributions.

## Features

### Smart Contract Wallets
- **Treasury Wallets**: Deploy custom treasury wallet contracts with policy engine support
- **Safe Wallets**: Deploy Safe (Gnosis Safe) multi-sig wallets with configurable owners and thresholds
- **Multi-chain Support**: Deploy wallets on Ethereum Sepolia, Avalanche Fuji, and Polygon Amoy

### Treasury Automation
- **Automated Allocations**: Schedule single-recipient payments
- **Automated Distributions**: Schedule multi-recipient payments
- **Policy Enforcement**: Integrate policies to control automation behavior
- **Manual Triggering**: Execute automations on-demand

### Policy Engine
- **Policy Deployment**: Deploy policy engine contracts
- **Policy Creation**: Create custom policies for allocations and distributions
- **Policy Configuration**: Configure policies with JSON rules (amount limits, recipient whitelists, time restrictions, etc.)

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# Deployer private key for smart contract deployment
DEPLOYER_PRIVATE_KEY=your_private_key_here

# Optional: Custom RPC URLs (defaults provided)
ETH_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
AVAX_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
MATIC_AMOY_RPC_URL=https://rpc-amoy.polygon.technology
```

**⚠️ Security Note**: Never commit your private key to version control. Use environment variables or a secure key management service.

### 2. Install Dependencies

The smart contract functionality requires `ethers.js`:

```bash
npm install ethers
```

### 3. Compile Smart Contracts (Optional)

If you want to compile the Solidity contracts:

```bash
npm install --save-dev hardhat @openzeppelin/contracts
npx hardhat compile
```

## Smart Contract Architecture

### Treasury Wallet Contract

Located in `contracts/TreasuryWallet.sol`:

- **Owner-based Access Control**: Single owner or multi-sig
- **Policy Engine Integration**: Enforce policies before executing operations
- **Allocation Function**: Send funds to a single recipient
- **Distribution Function**: Send funds to multiple recipients
- **USDC Support**: Works with USDC token (6 decimals)

### Policy Engine Contract

Located in `contracts/PolicyEngine.sol`:

- **Policy Creation**: Deploy individual policy contracts
- **Policy Evaluation**: Check if operations comply with policies
- **Policy Updates**: Modify policy configurations
- **Configurable Rules**: JSON-based policy configuration

## API Endpoints

### Smart Contract Wallets

#### Deploy Wallet
```http
POST /api/smart-contracts/wallet/deploy
```

**Request Body:**
```json
{
  "walletType": "treasury" | "safe",
  "chain": "ETH-SEPOLIA",
  "ownerAddress": "0x...", // Optional for treasury
  "policyEngineAddress": "0x...", // Optional for treasury
  "owners": ["0x..."], // Required for safe
  "threshold": 1 // Required for safe
}
```

#### Get Wallets
```http
GET /api/smart-contracts/wallets
```

### Policy Engine

#### Deploy Policy Engine
```http
POST /api/smart-contracts/policy-engine/deploy
```

**Request Body:**
```json
{
  "chain": "ETH-SEPOLIA"
}
```

#### Create Policy
```http
POST /api/smart-contracts/policy/create
```

**Request Body:**
```json
{
  "name": "Monthly allocation limit",
  "policyEngineAddress": "0x...",
  "chain": "ETH-SEPOLIA",
  "config": {
    "maxAmount": 10000,
    "allowedRecipients": ["0x..."],
    "timeRestrictions": {}
  }
}
```

#### Get Policies
```http
GET /api/smart-contracts/policies
```

### Treasury Operations

#### Execute Allocation
```http
POST /api/smart-contracts/treasury/allocate
```

**Request Body:**
```json
{
  "contractAddress": "0x...",
  "chain": "ETH-SEPOLIA",
  "recipient": "0x...",
  "amount": 100,
  "reason": "Payment for services"
}
```

#### Execute Distribution
```http
POST /api/smart-contracts/treasury/distribute
```

**Request Body:**
```json
{
  "contractAddress": "0x...",
  "chain": "ETH-SEPOLIA",
  "recipients": ["0x...", "0x..."],
  "amounts": [50, 50]
}
```

### Treasury Automation

#### Create Automation
```http
POST /api/smart-contracts/treasury/automation
```

**Request Body:**
```json
{
  "name": "Monthly payroll",
  "type": "allocation" | "distribution",
  "contractAddress": "0x...",
  "chain": "ETH-SEPOLIA",
  "recipients": ["0x..."],
  "amounts": [100],
  "active": true,
  "schedule": {},
  "conditions": {}
}
```

#### Get Automations
```http
GET /api/smart-contracts/treasury/automations
```

#### Trigger Automation
```http
POST /api/smart-contracts/treasury/automation/{automationId}
```

**Request Body:**
```json
{
  "action": "trigger"
}
```

#### Update Automation
```http
POST /api/smart-contracts/treasury/automation/{automationId}
```

**Request Body:**
```json
{
  "active": false,
  "schedule": {},
  "conditions": {}
}
```

#### Get Treasury Balance
```http
GET /api/smart-contracts/treasury/balance/{contractAddress}?chain=ETH-SEPOLIA
```

## Frontend Usage

### Smart Contract Wallets Page

Navigate to `/smart-contracts` to:
- Deploy treasury wallets or Safe wallets
- View deployed wallets
- See wallet addresses and deployment transactions

### Treasury Automation Page

Navigate to `/treasury-automation` to:
- Create automation rules
- View and manage automations
- Trigger automations manually
- Enable/disable automations

### Policy Management Page

Navigate to `/policy-management` to:
- Deploy policy engines
- Create policies with custom rules
- View policy configurations

### Treasury Operations Page

Navigate to `/treasury-operations` to:
- Execute allocations manually
- Execute distributions manually
- View transaction results

## Frontend API Client

```typescript
import { smartContractAPI } from '@/api/client';

// Deploy wallet
await smartContractAPI.deployWallet({
  walletType: 'treasury',
  chain: 'ETH-SEPOLIA',
  ownerAddress: '0x...',
});

// Get wallets
const { data } = await smartContractAPI.getWallets();

// Deploy policy engine
await smartContractAPI.deployPolicyEngine({ chain: 'ETH-SEPOLIA' });

// Create policy
await smartContractAPI.createPolicy({
  name: 'Monthly limit',
  policyEngineAddress: '0x...',
  chain: 'ETH-SEPOLIA',
  config: { maxAmount: 10000 },
});

// Execute allocation
await smartContractAPI.allocate({
  contractAddress: '0x...',
  chain: 'ETH-SEPOLIA',
  recipient: '0x...',
  amount: 100,
  reason: 'Payment',
});

// Execute distribution
await smartContractAPI.distribute({
  contractAddress: '0x...',
  chain: 'ETH-SEPOLIA',
  recipients: ['0x...', '0x...'],
  amounts: [50, 50],
});

// Create automation
await smartContractAPI.createAutomation({
  name: 'Payroll',
  type: 'allocation',
  contractAddress: '0x...',
  chain: 'ETH-SEPOLIA',
  recipients: ['0x...'],
  amounts: [100],
});

// Trigger automation
await smartContractAPI.triggerAutomation(automationId);
```

## Policy Configuration Examples

### Amount Limit Policy
```json
{
  "maxAmount": 10000,
  "minAmount": 1
}
```

### Recipient Whitelist Policy
```json
{
  "allowedRecipients": [
    "0x1234567890123456789012345678901234567890",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd"
  ]
}
```

### Time Restrictions Policy
```json
{
  "allowedDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "allowedHours": {
    "start": 9,
    "end": 17
  }
}
```

### Combined Policy
```json
{
  "maxAmount": 10000,
  "allowedRecipients": ["0x..."],
  "timeRestrictions": {
    "allowedDays": ["monday", "friday"],
    "maxPerDay": 5000
  }
}
```

## Security Considerations

1. **Private Key Management**: Never expose deployer private keys. Use environment variables or secure key management services.

2. **Access Control**: Treasury wallets use owner-based access control. Ensure proper key management for owners.

3. **Policy Validation**: Always validate policies before executing operations.

4. **Testnet Usage**: The current implementation is configured for testnets. Update chain configurations for mainnet deployment.

5. **Contract Audits**: Before deploying to mainnet, conduct thorough security audits of smart contracts.

## Troubleshooting

### "Deployer private key not configured"
- Ensure `DEPLOYER_PRIVATE_KEY` is set in your `.env` file
- Restart the backend server after adding the environment variable

### "RPC URL not configured"
- Check that RPC URLs are set in `server/chains.js` or via environment variables
- Verify RPC endpoints are accessible

### "Insufficient balance"
- Ensure the treasury wallet has sufficient USDC balance
- Check that you're using the correct chain

### "Policy evaluation failed"
- Verify policy configuration is valid JSON
- Check that policy engine address is correct
- Ensure policy is active and properly configured

## Next Steps

1. **Scheduled Automation**: Implement cron jobs or scheduled tasks for automatic execution
2. **Event Monitoring**: Add event listeners for on-chain events
3. **Multi-sig Support**: Enhance Safe wallet integration with full multi-sig functionality
4. **Gas Optimization**: Optimize contract gas usage
5. **Mainnet Deployment**: Update configurations for mainnet deployment

## Notes

- Smart contracts are currently simplified implementations. For production use, consider using audited contracts like OpenZeppelin's contracts.
- Safe wallet integration uses a simplified version. For full functionality, integrate the Safe SDK.
- Policy engine evaluation is simplified. Enhance with more sophisticated rule evaluation in production.

