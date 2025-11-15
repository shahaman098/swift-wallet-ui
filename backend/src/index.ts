import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { treasuryRouter } from './api/treasury';
import { gatewayRouter } from './api/gateway';
import { mlRouter } from './api/ml';
import { authRouter } from './api/auth';
import { walletRouter } from './api/wallet';
import { activityRouter } from './api/activity';
import { transactionRouter } from './api/transactions';
import { smartContractService } from './services/smartContract';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/activity', activityRouter);
app.use('/api/transactions', transactionRouter);
app.use('/api/treasury', treasuryRouter);
app.use('/api/gateway', gatewayRouter);
app.use('/api/ml', mlRouter);

// Initialize database and smart contracts
const startServer = async () => {
  try {
    await connectDatabase();
    await smartContractService.initializeContracts();

    app.listen(PORT, () => {
      console.log(`🚀 Treasury Backend running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}`);
      console.log(`\n✅ Server is ready! You can now try logging in.`);
    });
  } catch (error: any) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

