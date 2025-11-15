// Contract interface types for TypeScript
export interface Vault {
  depositOrg(orgId: number, amount: bigint): Promise<any>;
  withdrawOrg(orgId: number, amount: bigint, to: string): Promise<any>;
  getOrgBalance(orgId: number): Promise<bigint>;
  getDeptBalance(orgId: number, deptId: number): Promise<bigint>;
}

