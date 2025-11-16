# Swift Wallet UI

## Environment Setup

Create a `.env` file inside `backend/` (or copy `backend/env.example`) and provide:

```
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_WALLET_ENTITY_SECRET=your_entity_secret
CIRCLE_API_BASE=https://api.circle.com/v1
CIRCLE_WEBHOOK_SECRET=your_webhook_secret
ARC_RPC_URL=https://rpc.arc.net/testnet
ARC_CHAIN_ID=arc-testnet
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
FRONTEND_URL=http://localhost:8080
```

These values are required for Circle wallet creation, webhook verification, and Arc settlement.

## Running Locally

```
cd backend && npm install && npm run dev
cd frontend && npm install && npm run dev
```

