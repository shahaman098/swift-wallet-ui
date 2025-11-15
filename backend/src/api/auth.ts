import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import mongoose from 'mongoose';
import { User } from '../models/User';
import { Wallet } from '../models/Wallet';

const router = Router();

const signupSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

router.post('/signup', async (req, res) => {
  try {
    // Validate input with better error handling
    const validationResult = signupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        error: validationResult.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }

    const { name, email, password } = validationResult.data;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create user in MongoDB
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    });
    await user.save();

    // Create wallet for user with initial balance of $1326
    const wallet = new Wallet({
      userId: user._id,
      balance: 1326,
      currency: 'USD',
    });
    await wallet.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000 || error.message?.includes('duplicate')) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    
    // Return detailed error message
    const errorMessage = error?.message || 'Signup failed. Please try again.';
    res.status(500).json({ error: errorMessage });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    
    // MOCK MODE: Allow any login if MOCK_AUTH is enabled or MongoDB is not connected
    const mockMode = process.env.MOCK_AUTH === 'true' || !mongoose.connection.readyState;
    
    if (mockMode) {
      console.log('🔓 Mock login mode: Allowing login without database');
      // Generate a mock user ID
      const mockUserId = 'mock-user-' + Date.now();
      const mockName = email.split('@')[0] || 'User';
      
      const token = jwt.sign(
        { userId: mockUserId, email: email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      return res.json({
        token,
        user: { id: mockUserId, name: mockName, email: email }
      });
    }
    
    // REAL MODE: Check database
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: error?.message || 'Login failed' });
  }
});

export { router as authRouter };

