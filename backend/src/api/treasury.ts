import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Organization } from '../models/Organization';
import { Department } from '../models/Department';
import { Transaction } from '../models/Transaction';
import { smartContractService } from '../services/smartContract';
import { arcService } from '../services/arc';

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

// Get all orgs for user
router.get('/orgs', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const orgs = await Organization.find({ userId }).lean();

    res.json(orgs.map((org: any) => ({
      id: org._id.toString(),
      name: org.name,
      smartAccount: org.smartAccount,
      active: org.active,
    })));
  } catch (error) {
    console.error('Get orgs error:', error);
    res.status(500).json({ error: 'Failed to get orgs' });
  }
});

// Org Management
router.post('/orgs', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, smartAccount } = z.object({
      name: z.string(),
      smartAccount: z.string().min(1)
    }).parse(req.body);

    // Create org in MongoDB
    const org = new Organization({
      name,
      smartAccount,
      active: true,
      userId,
    });
    await org.save();

    // Optionally register on blockchain
    try {
      // This would call OrgRegistry.createOrg on-chain
      // For now, we'll just store in database
    } catch (contractError) {
      console.error('Smart contract registration failed:', contractError);
      // Continue even if contract interaction fails
    }

    res.json({
      id: org._id.toString(),
      name: org.name,
      smartAccount: org.smartAccount,
      active: org.active,
    });
  } catch (error) {
    console.error('Create org error:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.get('/orgs/:orgId', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const org = await Organization.findOne({
      _id: req.params.orgId,
      userId, // Ensure user owns the org
    });

    if (!org) {
      return res.status(404).json({ error: 'Org not found' });
    }

    // Get onchain balance if contract is available
    let onchainBalance = null;
    try {
      // Convert orgId to number for contract call
      const orgIdNum = parseInt(org._id.toString().slice(-8), 16) % 1000000;
      onchainBalance = await smartContractService.getOrgBalance(orgIdNum);
    } catch (error) {
      // Contract not available or not deployed
    }

    res.json({
      id: org._id.toString(),
      name: org.name,
      smartAccount: org.smartAccount,
      active: org.active,
      onchainBalance,
    });
  } catch (error) {
    console.error('Get org error:', error);
    res.status(500).json({ error: 'Failed to get org' });
  }
});

// Department Management
router.post('/orgs/:orgId/departments', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify org exists and user owns it
    const org = await Organization.findOne({
      _id: req.params.orgId,
      userId,
    });

    if (!org) {
      return res.status(404).json({ error: 'Org not found' });
    }

    const { name, cap } = z.object({
      name: z.string(),
      cap: z.number().positive()
    }).parse(req.body);

    const dept = new Department({
      name,
      cap,
      balance: 0,
      active: true,
      orgId: org._id,
    });
    await dept.save();

    res.json({
      id: dept._id.toString(),
      name: dept.name,
      cap: dept.cap,
      balance: dept.balance,
      active: dept.active,
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

router.get('/orgs/:orgId/departments', async (req, res) => {
  try {
    const userId = await getUser(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify org exists and user owns it
    const org = await Organization.findOne({
      _id: req.params.orgId,
      userId,
    });

    if (!org) {
      return res.status(404).json({ error: 'Org not found' });
    }

    const depts = await Department.find({ orgId: org._id });

    // Get onchain balances if contracts are available
    const deptsWithBalances = await Promise.all(
      depts.map(async (dept: any) => {
        let onchainBalance = null;
        try {
          const orgIdNum = parseInt(org._id.toString().slice(-8), 16) % 1000000;
          const deptIdNum = parseInt(dept._id.toString().slice(-8), 16) % 1000000;
          onchainBalance = await smartContractService.getDeptBalance?.(orgIdNum, deptIdNum) ?? null;
        } catch (error) {
          // Contract not available
        }

        return {
          id: dept._id.toString(),
          name: dept.name,
          cap: dept.cap,
          balance: dept.balance,
          active: dept.active,
          onchainBalance,
        };
      })
    );

    res.json(deptsWithBalances);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to get departments' });
  }
});

// Allocation Rules
router.post('/orgs/:orgId/allocation-rules', (_req, res) => {
  res.status(501).json({ error: 'Allocation rule management is not implemented. Persist rules in the database and update this endpoint.' });
});

router.post('/orgs/:orgId/distribution-rules', (_req, res) => {
  res.status(501).json({ error: 'Distribution rule management is not implemented. Persist rules in the database and update this endpoint.' });
});

router.post('/orgs/:orgId/execute-allocations', (_req, res) => {
  res.status(501).json({ error: 'Allocation execution is not implemented. Implement smart contract calls before enabling this endpoint.' });
});

export { router as treasuryRouter };

