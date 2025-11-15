import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Wallet } from '../models/Wallet';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { smartContractService } from '../services/smartContract';

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

router.get('/balance', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    res.json({ balance: wallet.balance });
  } catch (error) {
    console.error('Balance error:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

router.post('/deposit', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount } = z.object({ amount: z.number().positive() }).parse(req.body);
    
    // Update wallet balance
    const wallet = await Wallet.findOneAndUpdate(
      { userId },
      { $inc: { balance: amount } },
      { new: true, upsert: true }
    );

    // Create transaction record
    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount,
      status: 'completed',
    });
    await transaction.save();

    // Optionally interact with smart contract
    let txHash = undefined;
    try {
      // If user has an org, deposit to vault
      // This would require orgId - for now, just record the transaction
    } catch (contractError) {
      console.error('Smart contract interaction failed:', contractError);
      // Continue even if contract interaction fails
    }

    res.json({
      success: true,
      newBalance: wallet.balance,
      transactionId: transaction._id.toString(),
      txHash,
    });
  } catch (error) {
    console.error('Deposit error:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.post('/send', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { recipient, amount, note } = z.object({
      recipient: z.string(),
      amount: z.number().positive(),
      note: z.string().optional()
    }).parse(req.body);

    // Check balance
    const wallet = await Wallet.findOne({ userId });
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Find recipient user
    const recipientUser = await User.findOne({ 
      $or: [{ email: recipient }, { name: recipient }] 
    });

    // Update sender balance
    wallet.balance -= amount;
    await wallet.save();

    // Update recipient balance if found
    if (recipientUser) {
      await Wallet.findOneAndUpdate(
        { userId: recipientUser._id },
        { $inc: { balance: amount } },
        { new: true, upsert: true }
      );

      // Create receive transaction for recipient
      const receiveTransaction = new Transaction({
        userId: recipientUser._id,
        type: 'receive',
        amount,
        sender: (await User.findById(userId))?.name || 'Unknown',
        senderId: userId,
        status: 'completed',
        note,
      });
      await receiveTransaction.save();
    }

    // Create send transaction
    const transaction = new Transaction({
      userId,
      type: 'send',
      amount,
      recipient,
      recipientId: recipientUser?._id,
      status: 'completed',
      note,
    });
    await transaction.save();

    res.json({
      success: true,
      transactionId: transaction._id.toString(),
      newBalance: wallet.balance
    });
  } catch (error) {
    console.error('Send error:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

export { router as walletRouter };

