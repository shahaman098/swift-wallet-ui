import { useMemo } from "react";
import { useTreasuryContext } from "@/context/TreasuryProvider";

export const useTreasuryBrain = () => {
  const context = useTreasuryContext();

  const automationDueSchedules = useMemo(() => {
    const now = Date.now();
    return context.schedulesForSelectedOrg.filter((schedule) =>
      schedule.active && (!schedule.lastExecuted || now - schedule.lastExecuted >= schedule.interval)
    );
  }, [context.schedulesForSelectedOrg]);

  const pendingGatewayTransfers = useMemo(
    () =>
      context.gatewayTransfers.filter(
        (transfer) => transfer.orgId === context.selectedOrgId && transfer.status !== "completed"
      ),
    [context.gatewayTransfers, context.selectedOrgId]
  );

  const confidentialRules = useMemo(
    () => context.distributionRulesForSelectedOrg.filter((rule) => rule.confidential),
    [context.distributionRulesForSelectedOrg]
  );

  return {
    ...context,
    automationDueSchedules,
    pendingGatewayTransfers,
    confidentialRules,
  };
};

export type TreasuryBrainHook = ReturnType<typeof useTreasuryBrain>;
