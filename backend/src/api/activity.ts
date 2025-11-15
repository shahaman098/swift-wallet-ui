import { Router } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';

const router = Router();

// Middleware to extract user from token
const getUser = async (req: any): Promise<string | null> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

router.get('/', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // MOCK MODE: Return empty activity if MongoDB not connected
    const mockMode = process.env.MOCK_AUTH === 'true' || !mongoose.connection.readyState;
    if (mockMode) {
      return res.json({
        transactions: [],
        total: 0,
      });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    const type = req.query.type as string | undefined;

    const query: any = { userId };
    if (type) {
      query.type = type;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .populate('recipientId', 'name email')
      .populate('senderId', 'name email')
      .lean();

    const total = await Transaction.countDocuments(query);

    const formattedTransactions = transactions.map((tx: any) => ({
      id: tx._id.toString(),
      type: tx.type,
      amount: tx.amount,
      recipient: tx.recipient || tx.recipientId?.name || tx.recipientId?.email,
      date: tx.createdAt,
      status: tx.status,
    }));

    res.json({
      transactions: formattedTransactions,
      total,
    });
  } catch (error) {
    console.error('Get activity error:', error);
    // Return empty on error
    res.json({
      transactions: [],
      total: 0,
    });
  }
});

export { router as activityRouter };

