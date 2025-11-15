// Contract interface types for TypeScript
export interface RuleEngine {
  executeAllocation(orgId: number, ruleId: number): Promise<any>;
  executeDistributions(orgId: number, ruleIds: number[], zkProof: string): Promise<any>;
}

