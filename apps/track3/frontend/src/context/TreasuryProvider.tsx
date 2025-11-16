import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  TreasuryActions,
  TreasuryContextValue,
  TreasuryEvent,
  TreasuryState,
} from "@/lib/treasury/types";
import { mockTreasuryState } from "@/lib/treasury/mockData";

const STORAGE_KEY = "treasury-brain-state";

const persistState = (state: TreasuryState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist treasury state", error);
  }
};

const loadState = (): TreasuryState => {
  if (typeof window === "undefined") {
    return mockTreasuryState;
  }
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return mockTreasuryState;
    }
    const parsed = JSON.parse(saved) as TreasuryState;
    return {
      ...mockTreasuryState,
      ...parsed,
    };
  } catch (error) {
    console.error("Failed to load treasury state", error);
    return mockTreasuryState;
  }
};

const TreasuryContext = createContext<TreasuryContextValue | undefined>(undefined);

export const TreasuryProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<TreasuryState>(() => loadState());

  const updateState = useCallback((updater: (prev: TreasuryState) => TreasuryState) => {
    setState((prev) => {
      const next = updater(prev);
      persistState(next);
      return next;
    });
  }, []);

  const actions: TreasuryActions = useMemo(
    () => ({
      selectOrg: (orgId) => {
        updateState((prev) => ({ ...prev, selectedOrgId: orgId }));
      },
      toggleOrgActive: (orgId) => {
        updateState((prev) => ({
          ...prev,
          orgs: prev.orgs.map((org) =>
            org.id === orgId
              ? {
                  ...org,
                  active: !org.active,
                }
              : org
          ),
          events: [
            ...prev.events,
            {
              id: `evt-${Date.now()}`,
              orgId,
              type: prev.orgs.find((org) => org.id === orgId)?.active
                ? "OrgDeactivated"
                : "OrgUpdated",
              message: prev.orgs.find((org) => org.id === orgId)?.active
                ? "Org deactivated via dashboard"
                : "Org reactivated via dashboard",
              timestamp: Date.now(),
            } satisfies TreasuryEvent,
          ],
        }));
      },
      upsertDepartment: (department) => {
        updateState((prev) => {
          const exists = prev.departments.some((dept) => dept.id === department.id);
          const departments = exists
            ? prev.departments.map((dept) => (dept.id === department.id ? department : dept))
            : [...prev.departments, department];

          const vaultBalances = prev.vaultBalances.map((vault) => {
            if (vault.orgId !== department.orgId) return vault;
            const departmentsBalances = {
              ...vault.departments,
              [department.id]: department.balance,
            };
            return {
              ...vault,
              departments: departmentsBalances,
              orgBalance: Object.values(departmentsBalances).reduce((acc, value) => acc + value, 0),
              lastUpdated: Date.now(),
            };
          });

          return {
            ...prev,
            departments,
            vaultBalances,
            events: [
              ...prev.events,
              {
                id: `evt-${Date.now()}`,
                orgId: department.orgId,
                type: "OrgUpdated",
                message: exists
                  ? `Department ${department.name} updated`
                  : `Department ${department.name} created`,
                timestamp: Date.now(),
              },
            ],
          };
        });
      },
      recordAllocationExecution: (orgId, ruleId) => {
        updateState((prev) => ({
          ...prev,
          allocationRules: prev.allocationRules.map((rule) =>
            rule.id === ruleId
              ? {
                  ...rule,
                  active: rule.active,
                }
              : rule
          ),
          events: [
            ...prev.events,
            {
              id: `evt-${Date.now()}`,
              orgId,
              type: "AllocationExecuted",
              message: `Allocation rule #${ruleId} executed`,
              timestamp: Date.now(),
            },
          ],
        }));
      },
      recordDistributionExecution: (orgId, ruleId, confidential) => {
        updateState((prev) => ({
          ...prev,
          distributionRules: prev.distributionRules.map((rule) =>
            rule.id === ruleId
              ? {
                  ...rule,
                  lastExecuted: Date.now(),
                }
              : rule
          ),
          events: [
            ...prev.events,
            {
              id: `evt-${Date.now()}`,
              orgId,
              type: "DistributionExecuted",
              message: `Distribution rule #${ruleId} executed${confidential ? " with ZK proof" : ""}`,
              timestamp: Date.now(),
            },
          ],
        }));
      },
      runSchedule: (scheduleId) => {
        updateState((prev) => {
          const schedule = prev.schedules.find((item) => item.id === scheduleId);
          if (!schedule) return prev;
          const updatedSchedule = {
            ...schedule,
            lastExecuted: Date.now(),
          };
          return {
            ...prev,
            schedules: prev.schedules.map((item) => (item.id === scheduleId ? updatedSchedule : item)),
            events: [
              ...prev.events,
              {
                id: `evt-${Date.now()}`,
                orgId: schedule.orgId,
                type: "ScheduleExecuted",
                message: `Schedule #${scheduleId} executed via Arc automation`,
                timestamp: Date.now(),
              },
            ],
          };
        });
      },
      enqueueGatewayTransfer: (transfer) => {
        updateState((prev) => ({
          ...prev,
          gatewayTransfers: [...prev.gatewayTransfers, transfer],
        }));
      },
      updateGatewayTransferStatus: (id, status, txHash) => {
        updateState((prev) => ({
          ...prev,
          gatewayTransfers: prev.gatewayTransfers.map((transfer) =>
            transfer.id === id
              ? {
                  ...transfer,
                  status,
                  txHash: txHash ?? transfer.txHash,
                  updatedAt: Date.now(),
                }
              : transfer
          ),
        }));
      },
      recordCrossChainTransfer: (transfer) => {
        updateState((prev) => ({
          ...prev,
          crossChainTransfers: [...prev.crossChainTransfers, transfer],
          events: [
            ...prev.events,
            {
              id: `evt-${Date.now()}`,
              orgId: transfer.orgId,
              type: "CrossChainTransfer",
              message: `CCTP transfer ${transfer.amount.toLocaleString()} USDC from ${transfer.sourceChainId} to ${transfer.destinationChainId}`,
              timestamp: Date.now(),
            },
          ],
        }));
      },
      recordMlInsight: (insight) => {
        updateState((prev) => ({
          ...prev,
          mlInsights: [
            ...prev.mlInsights.filter((existing) => existing.orgId !== insight.orgId),
            insight,
          ],
          events: [
            ...prev.events,
            {
              id: `evt-${Date.now()}`,
              orgId: insight.orgId,
              type: "OrgUpdated",
              message: "New ML insight generated",
              timestamp: Date.now(),
            },
          ],
        }));
      },
      recordPayrollProof: (proof) => {
        updateState((prev) => ({
          ...prev,
          payrollProofs: [
            ...prev.payrollProofs.filter(
              (existing) => !(existing.orgId === proof.orgId && existing.period === proof.period)
            ),
            proof,
          ],
          events: [
            ...prev.events,
            {
              id: `evt-${Date.now()}`,
              orgId: proof.orgId,
              type: proof.verified ? "DistributionExecuted" : "AnomalyDetected",
              message: proof.verified
                ? `Verified ZK payroll proof for period ${proof.period}`
                : `Payroll proof for ${proof.period} failed verification`,
              timestamp: Date.now(),
            },
          ],
        }));
      },
      recordCheckpoint: (checkpoint) => {
        updateState((prev) => ({
          ...prev,
          checkpoints: [...prev.checkpoints, checkpoint],
          events: [
            ...prev.events,
            {
              id: `evt-${Date.now()}`,
              orgId: checkpoint.orgId,
              type: "CheckpointRecorded",
              message: `Checkpoint ${checkpoint.id} recorded`,
              timestamp: Date.now(),
            },
          ],
        }));
      },
    }),
    [updateState]
  );

  const selectedOrg = useMemo(
    () => state.orgs.find((org) => org.id === state.selectedOrgId),
    [state.orgs, state.selectedOrgId]
  );

  const departmentsForSelectedOrg = useMemo(
    () => state.departments.filter((dept) => dept.orgId === state.selectedOrgId),
    [state.departments, state.selectedOrgId]
  );

  const policiesForSelectedOrg = useMemo(
    () => state.policies.filter((policy) => policy.orgId === state.selectedOrgId),
    [state.policies, state.selectedOrgId]
  );

  const schedulesForSelectedOrg = useMemo(
    () => state.schedules.filter((schedule) => schedule.orgId === state.selectedOrgId),
    [state.schedules, state.selectedOrgId]
  );

  const allocationRulesForSelectedOrg = useMemo(
    () => state.allocationRules.filter((rule) => rule.orgId === state.selectedOrgId),
    [state.allocationRules, state.selectedOrgId]
  );

  const distributionRulesForSelectedOrg = useMemo(
    () => state.distributionRules.filter((rule) => rule.orgId === state.selectedOrgId),
    [state.distributionRules, state.selectedOrgId]
  );

  const vaultForSelectedOrg = useMemo(
    () => state.vaultBalances.find((vault) => vault.orgId === state.selectedOrgId),
    [state.vaultBalances, state.selectedOrgId]
  );

  const mlInsightForSelectedOrg = useMemo(
    () => state.mlInsights.find((insight) => insight.orgId === state.selectedOrgId),
    [state.mlInsights, state.selectedOrgId]
  );

  const value: TreasuryContextValue = useMemo(
    () => ({
      ...state,
      selectedOrg,
      departmentsForSelectedOrg,
      policiesForSelectedOrg,
      schedulesForSelectedOrg,
      allocationRulesForSelectedOrg,
      distributionRulesForSelectedOrg,
      vaultForSelectedOrg,
      mlInsightForSelectedOrg,
      actions,
    }),
    [
      state,
      selectedOrg,
      departmentsForSelectedOrg,
      policiesForSelectedOrg,
      schedulesForSelectedOrg,
      allocationRulesForSelectedOrg,
      distributionRulesForSelectedOrg,
      vaultForSelectedOrg,
      mlInsightForSelectedOrg,
      actions,
    ]
  );

  return <TreasuryContext.Provider value={value}>{children}</TreasuryContext.Provider>;
};

export const useTreasuryContext = () => {
  const context = useContext(TreasuryContext);
  if (!context) {
    throw new Error("useTreasuryContext must be used within TreasuryProvider");
  }
  return context;
};
