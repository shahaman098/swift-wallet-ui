import { Router } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { Organization } from '../models/Organization';
import { Department } from '../models/Department';
import { Transaction } from '../models/Transaction';
import { smartContractService } from '../services/smartContract';
import { arcService } from '../services/arc';

const router = Router();

// In-memory storage for rules (TODO: Move to MongoDB)
interface AllocationRule {
  id: string;
  orgId: string;
  allocationType: 'Percentage' | 'FixedAmount' | 'Residual';
  sourceDept: string;
  targetDept: string;
  bps: number;
  amount: number;
  cap: number;
  active: boolean;
}

interface DistributionRule {
  id: string;
  orgId: string;
  fromDept: string;
  recipient: string;
  amount: number;
  bps: number;
  frequency: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  confidential: boolean;
  lastExecuted: number;
  active: boolean;
}

const allocationRules = new Map<string, AllocationRule>();
const distributionRules = new Map<string, DistributionRule>();

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
      smartAccount: z.string()
    }).parse(req.body);

    // Create org in MongoDB
    const org = new Organization({
      name,
      smartAccount: smartAccount || '0x0000000000000000000000000000000000000000',
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
          onchainBalance = await smartContractService.getOrgBalance(orgIdNum);
          // In production, would call getDeptBalance
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
router.post('/orgs/:orgId/allocation-rules', async (req, res) => {
  try {
    const data = z.object({
      allocationType: z.enum(['Percentage', 'FixedAmount', 'Residual']),
      sourceDept: z.string(),
      targetDept: z.string(),
      bps: z.number().min(0).max(10000),
      amount: z.number().optional(),
      cap: z.number().optional()
    }).parse(req.body);

    const ruleId = `alloc-${Date.now()}`;
    const rule: AllocationRule = {
      id: ruleId,
      orgId: req.params.orgId,
      ...data,
      amount: data.amount || 0,
      cap: data.cap || 0,
      active: true
    };
    allocationRules.set(ruleId, rule);

    res.json(rule);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Distribution Rules
router.post('/orgs/:orgId/distribution-rules', async (req, res) => {
  try {
    const data = z.object({
      fromDept: z.string(),
      recipient: z.string(),
      amount: z.number().optional(),
      bps: z.number().min(0).max(10000).optional(),
      frequency: z.enum(['None', 'Daily', 'Weekly', 'Monthly']),
      confidential: z.boolean().optional()
    }).parse(req.body);

    const ruleId = `dist-${Date.now()}`;
    const rule: DistributionRule = {
      id: ruleId,
      orgId: req.params.orgId,
      ...data,
      amount: data.amount || 0,
      bps: data.bps || 0,
      confidential: data.confidential || false,
      lastExecuted: 0,
      active: true
    };
    distributionRules.set(ruleId, rule);

    res.json(rule);
  } catch (error) {
    res.status(400).json({ error: 'Invalid request' });
  }
});

// Execute Rules
router.post('/orgs/:orgId/execute-allocations', async (req, res) => {
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

    const { ruleIds } = z.object({
      ruleIds: z.array(z.string())
    }).parse(req.body);

    const results = [];

    for (const ruleId of ruleIds) {
      try {
        // Execute on smart contract
        const orgIdNum = parseInt(org._id.toString().slice(-8), 16) % 1000000;
        const ruleIdNum = parseInt(ruleId.slice(-8), 16) % 1000000;
        
        const txHash = await smartContractService.executeAllocation(orgIdNum, ruleIdNum);

        // Create transaction record
        const transaction = new Transaction({
          userId,
          orgId: org._id,
          type: 'allocation',
          amount: 0, // Would calculate from contract
          status: 'completed',
          txHash,
          ruleId,
        });
        await transaction.save();

        results.push({ ruleId, success: true, txHash });
      } catch (error: any) {
        console.error(`Failed to execute rule ${ruleId}:`, error);
        results.push({ 
          ruleId, 
          success: false, 
          error: error.message || 'Execution failed' 
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Execute allocations error:', error);
    res.status(400).json({ error: 'Invalid request' });
  }
});

export { router as treasuryRouter };

