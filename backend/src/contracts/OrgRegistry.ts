// Contract interface types for TypeScript
export interface OrgRegistry {
  createOrg(smartAccount: string, configHash: string): Promise<number>;
  getOrg(orgId: number): Promise<{ id: number; smartAccount: string; configHash: string; active: boolean }>;
}

