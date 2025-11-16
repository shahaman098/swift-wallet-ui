export type OrgId = number;
export type DeptId = number;
export type RuleId = number;
export type ScheduleId = number;
export type IntentId = string;

export interface Org {
  id: OrgId;
  name: string;
  smartAccount: string;
  configHash: string;
  active: boolean;
  createdAt: number;
  homeChainId: number;
}

export interface OrgChainConfig {
  orgId: OrgId;
  chainId: number;
  smartAccount: string;
  vault: string;
  ruleEngine: string;
  automationExecutor: string;
}

export type PolicyType =
  | "spendingLimit"
  | "recipientWhitelist"
  | "scheduleEnforcement"
  | "role";

export interface PolicyModule {
  id: string;
  orgId: OrgId;
  type: PolicyType;
  name: string;
  description: string;
  config: Record<string, unknown>;
  enabled: boolean;
}

export interface Department {
  id: DeptId;
  orgId: OrgId;
  name: string;
  nameHash: string;
  cap: number;
  balance: number;
  active: boolean;
}

export type AllocationType = "Percentage" | "FixedAmount" | "Residual";

export interface AllocationRule {
  id: RuleId;
  orgId: OrgId;
  allocationType: AllocationType;
  sourceDept: DeptId;
  targetDept: DeptId;
  bps?: number;
  amount?: number;
  cap?: number;
  active: boolean;
}

export type DistributionFrequency = "None" | "Daily" | "Weekly" | "Monthly" | "Custom";

export interface DistributionRule {
  id: RuleId;
  orgId: OrgId;
  fromDept: DeptId;
  recipient: string;
  amount?: number;
  bps?: number;
  frequency: DistributionFrequency;
  lastExecuted?: number;
  confidential: boolean;
  active: boolean;
  metadata?: string;
}

export interface VaultBalance {
  orgId: OrgId;
  orgBalance: number;
  departments: Record<DeptId, number>;
  lastUpdated: number;
}

export interface ExecutionIntent {
  id: IntentId;
  orgId: OrgId;
  distributionRuleIds: RuleId[];
  payloadHash: string;
  validUntil: number;
  createdAt: number;
  executed: boolean;
}

export interface Schedule {
  id: ScheduleId;
  orgId: OrgId;
  allocationRuleIds: RuleId[];
  distributionRuleIds: RuleId[];
  interval: number;
  lastExecuted?: number;
  chainId: number;
  active: boolean;
  automationMetadata?: string;
}

export interface GatewayTransfer {
  id: string;
  orgId: OrgId;
  deptId?: DeptId;
  direction: "inbound" | "outbound";
  amount: number;
  status: "initiated" | "processing" | "completed" | "failed";
  createdAt: number;
  updatedAt: number;
  circleId?: string;
  txHash?: string;
  metadata?: string;
}

export interface CrossChainTransfer {
  id: string;
  orgId: OrgId;
  sourceChainId: number;
  destinationChainId: number;
  amount: number;
  status: "pending" | "completed" | "failed";
  initiatedBy: string;
  initiatedAt: number;
  completedAt?: number;
}

export interface MlInsight {
  orgId: OrgId;
  generatedAt: number;
  runwayMonths: number;
  burnRate: number;
  anomalyScore: number;
  recommendations: string[];
}

export interface PayrollProof {
  orgId: OrgId;
  deptId: DeptId;
  totalAmount: number;
  period: string;
  ruleId: RuleId;
  proofHash: string;
  verified: boolean;
  submittedAt: number;
}

export interface Checkpoint {
  id: string;
  orgId: OrgId;
  stateRoot: string;
  timestamp: number;
}

export interface TreasuryEvent {
  id: string;
  orgId: OrgId;
  type:
    | "OrgCreated"
    | "OrgUpdated"
    | "OrgDeactivated"
    | "AllocationExecuted"
    | "DistributionExecuted"
    | "ScheduleExecuted"
    | "GatewayMismatchDetected"
    | "AnomalyDetected"
    | "IntentRegistered"
    | "IntentExecuted"
    | "CheckpointRecorded"
    | "CrossChainTransfer";
  message: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface TreasuryState {
  orgs: Org[];
  chainConfigs: OrgChainConfig[];
  policies: PolicyModule[];
  departments: Department[];
  allocationRules: AllocationRule[];
  distributionRules: DistributionRule[];
  vaultBalances: VaultBalance[];
  schedules: Schedule[];
  intents: ExecutionIntent[];
  gatewayTransfers: GatewayTransfer[];
  crossChainTransfers: CrossChainTransfer[];
  mlInsights: MlInsight[];
  payrollProofs: PayrollProof[];
  checkpoints: Checkpoint[];
  events: TreasuryEvent[];
  selectedOrgId: OrgId;
}

export interface TreasuryActions {
  selectOrg: (orgId: OrgId) => void;
  toggleOrgActive: (orgId: OrgId) => void;
  upsertDepartment: (department: Department) => void;
  recordAllocationExecution: (orgId: OrgId, ruleId: RuleId) => void;
  recordDistributionExecution: (orgId: OrgId, ruleId: RuleId, confidential: boolean) => void;
  runSchedule: (scheduleId: ScheduleId) => void;
  enqueueGatewayTransfer: (transfer: GatewayTransfer) => void;
  updateGatewayTransferStatus: (id: string, status: GatewayTransfer["status"], txHash?: string) => void;
  recordCrossChainTransfer: (transfer: CrossChainTransfer) => void;
  recordMlInsight: (insight: MlInsight) => void;
  recordPayrollProof: (proof: PayrollProof) => void;
  recordCheckpoint: (checkpoint: Checkpoint) => void;
}

export interface TreasuryContextValue extends TreasuryState {
  actions: TreasuryActions;
  selectedOrg?: Org;
  departmentsForSelectedOrg: Department[];
  policiesForSelectedOrg: PolicyModule[];
  schedulesForSelectedOrg: Schedule[];
  allocationRulesForSelectedOrg: AllocationRule[];
  distributionRulesForSelectedOrg: DistributionRule[];
  vaultForSelectedOrg?: VaultBalance;
  mlInsightForSelectedOrg?: MlInsight;
}
