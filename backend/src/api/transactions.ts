import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET environment variable');
}

// Middleware to extract user from token
const getUser = async (req: any): Promise<string | null> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Get all transactions for user
router.get('/', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const limit = parseInt(req.query.limit as string) || 50;
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

    // Format transactions for frontend
    const formattedTransactions = transactions.map((tx: any) => ({
      id: tx._id.toString(),
      type: tx.type,
      amount: tx.amount,
      recipient: tx.recipient || tx.recipientId?.name || tx.recipientId?.email,
      sender: tx.sender || tx.senderId?.name || tx.senderId?.email,
      date: tx.createdAt,
      status: tx.status,
      note: tx.note,
      txHash: tx.txHash,
    }));

    res.json({
      transactions: formattedTransactions,
      total,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId,
    })
      .populate('recipientId', 'name email')
      .populate('senderId', 'name email')
      .lean();

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({
      id: transaction._id.toString(),
      type: transaction.type,
      amount: transaction.amount,
      recipient: transaction.recipient || (transaction.recipientId as any)?.name,
      sender: transaction.sender || (transaction.senderId as any)?.name,
      date: transaction.createdAt,
      status: transaction.status,
      note: transaction.note,
      txHash: transaction.txHash,
    });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

export { router as transactionRouter };

