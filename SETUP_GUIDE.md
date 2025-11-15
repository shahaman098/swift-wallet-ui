# Setup Guide - Treasury Management System

## Prerequisites

- Node.js 18+ and npm
- Git
- (Optional) Hardhat or Foundry for smart contracts
- (Optional) PostgreSQL for production database

## Step-by-Step Setup

### 1. Clone and Install

```bash
# Already in the repo, just install dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template
cp .env.example .env

# Edit .env with your settings:
# - JWT_SECRET (generate a random string)
# - DATABASE_URL (if using database)
# - CIRCLE_API_KEY (when ready)
```

### 3. Start Backend

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:3000`

### 4. Start Frontend

In a new terminal:

```bash
# From root directory
npm run dev
```

Frontend will run on `http://localhost:8080`

### 5. Access the Application

- **Main Dashboard**: http://localhost:8080/dashboard
- **Treasury Dashboard**: http://localhost:8080/treasury
- **Backend Health**: http://localhost:3000/health

## First Steps

1. **Sign Up**: Create an account at `/signup`
2. **Login**: Use your credentials at `/login`
3. **Explore Wallet**: Try adding money, sending payments
4. **Explore Treasury**: Go to Treasury dashboard, create an org

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify Node.js version: `node --version` (should be 18+)
- Check backend/.env exists

### Frontend won't connect to backend
- Verify backend is running on port 3000
- Check browser console for CORS errors
- Verify VITE_API_URL in frontend (defaults to http://localhost:3000)

### Smart Contracts
- Contracts are ready but need deployment
- Use Hardhat or Foundry to deploy
- Update backend with contract addresses

## Next Steps

1. Deploy smart contracts to testnet
2. Set up database (replace in-memory storage)
3. Configure Circle Gateway API keys
4. Set up Arc workflows
5. Implement ML models

See `README_TREASURY.md` for full feature list and architecture.

