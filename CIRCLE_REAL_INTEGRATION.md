# Circle Wallets + CCTP Real Integration

## ✅ Implemented Features

### 1. Real Circle API Integration

**File**: `server/circle.js`

**Key Changes**:
- ✅ **API Key Validation**: Checks for `CIRCLE_API_KEY` on startup
- ✅ **Retry Logic**: Exponential backoff (3 retries, 1s → 2s → 4s)
- ✅ **Error Handling**: Proper 4xx vs 5xx error handling
- ✅ **Request/Response Logging**: All API calls logged
- ✅ **Idempotency Keys**: UUID-based keys for all operations

### 2. Enhanced Functions

#### `checkCircleConnection()`
- Verifies API key is valid
- Tests connection to Circle API
- Returns clear error messages

#### `getOrCreateWallet(userId, userEmail)`
- Creates real Circle Wallet (W3S Developer Wallets)
- Supports multiple blockchains
- Includes user metadata
- **Retry logic**: 3 attempts with exponential backoff

#### `getWalletBalance(walletId, chainKey)`
- Gets real USDC balances from Circle
- Supports multi-chain balances
- Handles 6-decimal USDC conversion
- **Retry logic**: 3 attempts

#### `createTransfer(walletId, destinationAddress, amount, blockchain)`
- Creates real on-chain transfer
- Returns actual transaction hash
- Includes error reasons
- **Retry logic**: 3 attempts
- **Persists**: Transaction hash, state, create/update dates

#### `initiateCCTPTransfer(walletId, destinationAddress, amount, sourceChain, destinationChain)`
- Initiates real CCTP cross-chain transfer
- Tracks burn/mint transaction hashes
- Returns settlement states
- **Retry logic**: 3 attempts
- **Persists**: Burn/mint hashes, settlement state, error reasons

#### `getCCTPTransferStatus(transferId)`
- Polls real Circle API for transfer status
- Maps Circle states to settlement states
- Returns transaction hashes when available
- **Retry logic**: 3 attempts

### 3. State Mapping

**Circle States → Settlement States**:
```javascript
'PENDING_RISK_SCREENING' → 'validating'
'INITIATED', 'PENDING'   → 'burning'
'CONFIRMED'              → 'confirmed'
'QUEUED'                 → 'pending'
'SENT'                   → 'settling'
'COMPLETE', 'COMPLETED'  → 'completed'
'FAILED', 'DENIED', 'CANCELLED' → 'failed'
```

### 4. Error Handling

**Smart Retry Logic**:
- **4xx errors**: Don't retry (client errors)
- **5xx errors**: Retry with exponential backoff
- **Network errors**: Retry with exponential backoff
- **Max 3 retries**: Initial delay 1s, max delay 10s

**Error Responses Include**:
- `errorReason`: From Circle API
- `status`: Current state
- `transactionHash`: If available
- `createDate`, `updateDate`: Timestamps

### 5. Logging

**All Operations Logged**:
```
[Circle API] POST /w3s/developer/wallets
[Circle API] 201 /w3s/developer/wallets
[Circle] Creating transfer: { amount: '100 USDC', from: 'wallet-123', to: '0x...', chain: 'ETH-SEPOLIA' }
[Circle] Create wallet failed (attempt 1/4), retrying in 1000ms...
```

## 🔧 Setup Instructions

### 1. Get Circle API Key

1. Go to [Circle Console](https://console.circle.com/)
2. Sign up or log in
3. Create a new project
4. Generate API key
5. Copy the API key

### 2. Configure Environment Variables

Create a `.env` file in project root:

```env
# Circle API Configuration
CIRCLE_API_KEY=your_circle_api_key_here
CIRCLE_API_BASE=https://api.circle.com/v1

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Install Dependencies

Already installed:
- `axios` - For API calls
- `dotenv` - For environment variables

### 4. Start Server

```bash
npm run server
```

**Expected Output**:
```
Initializing local database...
✅ Local database initialized
Initializing database schema...
✅ All database tables created successfully
✅ Database ready
Checking Circle API configuration...
✅ Circle API key found
[Circle API] GET /configuration
[Circle API] 200 /configuration
✅ Circle API connection verified
✅ Swift Wallet backend listening on port 3000
```

## 📊 Database Schema

**Transaction Hashes Stored**:
```sql
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  amount REAL NOT NULL,
  recipient TEXT,
  source_chain TEXT,
  destination_chain TEXT,
  settlement_state TEXT DEFAULT 'completed',
  cctp_transfer_id TEXT,           -- Circle transfer ID
  burn_tx_hash TEXT,                -- Blockchain burn tx hash
  mint_tx_hash TEXT,                -- Blockchain mint tx hash
  attestation TEXT,                 -- CCTP attestation
  sanctions_screened INTEGER DEFAULT 0,
  sanctions_result TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🔄 Transfer Flow

### Same-Chain Transfer
1. User initiates transfer
2. `createTransfer()` called
3. Circle creates blockchain transaction
4. **Transaction hash persisted**
5. Transaction confirmed on blockchain
6. Balance updated
7. Status updated to 'completed'

### Cross-Chain Transfer (CCTP)
1. User initiates cross-chain transfer
2. `initiateCCTPTransfer()` called
3. **Burn transaction on source chain**
   - Burn tx hash persisted
   - Settlement state: 'burning'
4. Circle processes attestation
   - Settlement state: 'confirmed'
5. **Mint transaction on destination chain**
   - Mint tx hash persisted
   - Settlement state: 'settling'
6. Transaction completes
   - Settlement state: 'completed'
7. Balance updated on destination chain

## 🎯 Real vs Mock Comparison

### Before (Mock)
```javascript
// Fake balance update
await store.updateChainBalance(userId, chain, amount);

// No real transaction
return { success: true };
```

### After (Real)
```javascript
// Real Circle API call
const transfer = await createTransfer(
  walletId, 
  recipientAddress, 
  amount, 
  blockchain
);

// Persist real transaction hash
await store.addTransaction({
  userId,
  type: 'send',
  amount,
  recipient,
  sourceChain: blockchain,
  settlementState: transfer.status,
  cctpTransferId: transfer.transferId,
  burnTxHash: transfer.transactionHash,
  // ... other fields
});

// Return real transaction data
return {
  transferId: transfer.transferId,
  transactionHash: transfer.transactionHash,
  status: transfer.status,
  errorReason: transfer.errorReason,
};
```

## 📈 Status Polling

For CCTP transfers, poll status:

```javascript
async function pollSettlementStatus(transferId) {
  const interval = setInterval(async () => {
    try {
      const status = await getCCTPTransferStatus(transferId);
      
      // Update UI with real status
      setSettlementState(status.settlementState);
      setBurnTxHash(status.burnTxHash);
      setMintTxHash(status.mintTxHash);
      
      if (status.settlementState === 'completed' || 
          status.settlementState === 'failed') {
        clearInterval(interval);
      }
    } catch (error) {
      console.error('Failed to poll status:', error);
    }
  }, 3000); // Poll every 3 seconds
}
```

## ⚠️ Important Notes

### API Rate Limits
- Circle has rate limits
- Retry logic respects backoff
- Don't poll too frequently

### Testnet vs Mainnet
- Current: Testnet (Sepolia, Fuji, etc.)
- For mainnet: Change blockchain names
- Update `CIRCLE_API_BASE` if needed

### Idempotency
- All operations use UUID-based idempotency keys
- Safe to retry
- Prevents duplicate transactions

### Error Messages
- Always include `errorReason` from Circle
- Show to users for debugging
- Log for support team

## 🚀 Next Steps

1. **Add to frontend** (already partially done):
   - Show real transaction hashes
   - Display settlement states
   - Link to blockchain explorers
   - Show error reasons

2. **Background job** (recommended):
   - Poll pending CCTP transfers
   - Update database with latest status
   - Notify users on completion

3. **Webhook integration** (optional):
   - Receive Circle webhooks
   - Update status immediately
   - No need for polling

## 🔒 Security

- ✅ API key in environment variables (not code)
- ✅ Never log API key
- ✅ Request logging (no sensitive data)
- ✅ Error messages sanitized
- ✅ Retry logic prevents hammering API

## 📝 Testing

**Without Circle API Key**:
- Server starts with warning
- Mock mode (use fake data)

**With Circle API Key**:
- Server verifies connection
- Real transfers created
- Real transaction hashes
- Real blockchain confirmations

**Test Transfers**:
1. Get testnet USDC from faucet
2. Create transfer
3. Check transaction hash on explorer
4. Verify balance updated

## ✅ Checklist

- [x] Circle API key validation
- [x] Retry logic with exponential backoff
- [x] Request/response logging
- [x] Error handling (4xx vs 5xx)
- [x] Transaction hash persistence
- [x] Settlement state tracking
- [x] CCTP burn/mint hash tracking
- [x] Error reason capture
- [x] Idempotency keys
- [ ] Frontend integration (next step)
- [ ] Background polling job (recommended)
- [ ] Webhook integration (optional)

**Status**: ✅ **Core Circle integration complete! Ready for real transfers.**

