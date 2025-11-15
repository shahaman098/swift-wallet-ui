import axios from 'axios';

export interface ArcWorkflow {
  workflowId: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  steps: ArcStep[];
}

export interface ArcStep {
  stepId: string;
  name: string;
  type: 'rpc' | 'api' | 'contract' | 'condition';
  config: any;
}

export class ArcService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ARC_API_KEY || '';
    this.baseUrl = process.env.ARC_API_URL || 'https://api.arc.xyz/v1';
  }

  async createWorkflow(name: string, steps: ArcStep[]): Promise<ArcWorkflow> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/workflows`,
        { name, steps },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Arc workflow creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Arc workflow');
    }
  }

  async executeWorkflow(workflowId: string, input: any): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/workflows/${workflowId}/execute`,
        { input },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Arc workflow execution error:', error.response?.data || error.message);
      throw new Error('Failed to execute Arc workflow');
    }
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/workflows/${workflowId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Arc workflow status error:', error.response?.data || error.message);
      throw new Error('Failed to get Arc workflow status');
    }
  }

  // Monthly close workflow
  async createMonthlyCloseWorkflow(orgId: string): Promise<ArcWorkflow> {
    const steps: ArcStep[] = [
      {
        stepId: 'read-balances',
        name: 'Read Onchain Balances',
        type: 'rpc',
        config: {
          method: 'eth_call',
          contract: process.env.VAULT_CONTRACT_ADDRESS,
          function: 'getOrgBalance',
          params: [orgId],
        },
      },
      {
        stepId: 'ml-analysis',
        name: 'ML Engine Analysis',
        type: 'api',
        config: {
          url: `${process.env.BACKEND_URL}/api/ml/orgs/${orgId}/recommendations`,
          method: 'GET',
        },
      },
      {
        stepId: 'execute-allocations',
        name: 'Execute Allocations',
        type: 'contract',
        config: {
          contract: process.env.RULE_ENGINE_CONTRACT_ADDRESS,
          function: 'executeAllocations',
          params: [orgId],
        },
      },
      {
        stepId: 'execute-distributions',
        name: 'Execute Distributions',
        type: 'contract',
        config: {
          contract: process.env.RULE_ENGINE_CONTRACT_ADDRESS,
          function: 'executeDistributions',
          params: [orgId],
        },
      },
    ];

    return this.createWorkflow(`Monthly Close - Org ${orgId}`, steps);
  }
}

export const arcService = new ArcService();

