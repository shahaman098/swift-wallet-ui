import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useTreasuryBrain } from "@/hooks/useTreasuryBrain";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  Bot,
  CheckCircle2,
  CircuitBoard,
  Clock3,
  Database,
  Globe2,
  Layers3,
  LineChart,
  ListChecks,
  Pencil,
  ShieldCheck,
  Sparkles,
  Wallet2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Department } from "@/lib/treasury/types";

const TreasuryBrain = () => {
  const navigate = useNavigate();
  const {
    orgs,
    selectedOrg,
    selectedOrgId,
    departmentsForSelectedOrg,
    allocationRulesForSelectedOrg,
    distributionRulesForSelectedOrg,
    policiesForSelectedOrg,
    schedulesForSelectedOrg,
    automationDueSchedules,
    vaultForSelectedOrg,
    mlInsightForSelectedOrg,
    gatewayTransfers,
    pendingGatewayTransfers,
    crossChainTransfers,
    chainConfigs,
    intents,
    checkpoints,
    events,
    confidentialRules,
    actions,
  } = useTreasuryBrain();
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [departmentDraft, setDepartmentDraft] = useState<Department | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleOrgChange = (value: string) => {
    actions.selectOrg(Number(value));
  };

  const handleDepartmentEdit = (department: Department) => {
    setDepartmentDraft({ ...department });
    setDialogOpen(true);
  };

  const handleDepartmentCreate = () => {
    if (!selectedOrg) return;
    const nextId = Math.max(0, ...departmentsForSelectedOrg.map((dept) => dept.id)) + 1;
    const randomFragment =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
        : Math.random().toString(16).slice(2, 14);
    setDepartmentDraft({
      id: nextId,
      orgId: selectedOrg.id,
      name: "New Department",
      nameHash: `0x${randomFragment}`,
      cap: 0,
      balance: 0,
      active: true,
    });
    setDialogOpen(true);
  };

  const saveDepartment = () => {
    if (!departmentDraft) return;
    actions.upsertDepartment(departmentDraft);
    setDialogOpen(false);
  };

  const vaultCoverage = useMemo(() => {
    if (!vaultForSelectedOrg) return 0;
    const departmentTotal = Object.values(vaultForSelectedOrg.departments).reduce(
      (acc, balance) => acc + balance,
      0
    );
    if (!departmentTotal) return 0;
    return Math.min(100, Math.round((departmentTotal / vaultForSelectedOrg.orgBalance) * 100));
  }, [vaultForSelectedOrg]);

  const selectedOrgEvents = useMemo(
    () => events.filter((event) => event.orgId === selectedOrgId).slice(-6).reverse(),
    [events, selectedOrgId]
  );

  const selectedOrgTransfers = useMemo(
    () => gatewayTransfers.filter((transfer) => transfer.orgId === selectedOrgId),
    [gatewayTransfers, selectedOrgId]
  );

  const chainConfigsForSelectedOrg = useMemo(
    () => chainConfigs.filter((config) => config.orgId === selectedOrgId),
    [chainConfigs, selectedOrgId]
  );

  if (!selectedOrg) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-arc-gradient">Treasury Brain</h1>
              <p className="text-muted-foreground text-lg mt-2 max-w-2xl">
                Unified treasury orchestration across Circle Gateway, Arc automation and policy-aware smart accounts.
              </p>
            </div>
            <div className="flex flex-col gap-4 w-full md:w-72">
              <div>
                <span className="block text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Active organisation
                </span>
                <Select value={String(selectedOrgId)} onValueChange={handleOrgChange}>
                  <SelectTrigger className="bg-card/80 backdrop-blur border border-white/10 text-left">
                    <SelectValue placeholder="Select organisation" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgs.map((org) => (
                      <SelectItem key={org.id} value={String(org.id)}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-white/5 p-4 border border-white/10">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Org status</p>
                  <p className="text-lg font-semibold flex items-center gap-2">
                    <span>{selectedOrg.active ? "Live" : "Paused"}</span>
                    {selectedOrg.active ? (
                      <Badge variant="outline" className="border-emerald-400/60 text-emerald-200 bg-emerald-500/10">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Policy compliant
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-amber-400/60 text-amber-200 bg-amber-500/10">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Paused
                      </Badge>
                    )}
                  </p>
                </div>
                <Switch
                  checked={selectedOrg.active}
                  onCheckedChange={() => actions.toggleOrgActive(selectedOrg.id)}
                  aria-label="Toggle org"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card className="liquid-glass-premium border border-white/10 shadow-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Wallet2 className="h-5 w-5 text-primary" /> Smart Org Account
              </CardTitle>
              <CardDescription>
                Minimal proxy smart account controlling Vault, Rule Engine and Automation Executor for {selectedOrg.name}.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Address</p>
                  <p className="font-mono text-xs break-all">{selectedOrg.smartAccount}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Config hash</p>
                  <p className="font-mono text-xs break-all">{selectedOrg.configHash}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Home chain</p>
                    <p className="font-semibold">Chain ID {selectedOrg.homeChainId}</p>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 border-primary/40 text-primary">
                    Multi-chain ready
                  </Badge>
                </div>
              </div>
              <Tabs defaultValue="chains" className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="chains">Chains</TabsTrigger>
                  <TabsTrigger value="intents">Execution intents</TabsTrigger>
                </TabsList>
                <TabsContent value="chains" className="mt-4 space-y-3">
                  {chainConfigsForSelectedOrg.length === 0 && (
                    <p className="text-sm text-muted-foreground">No chain configurations registered.</p>
                  )}
                  {chainConfigsForSelectedOrg.map((config) => (
                    <div key={`${config.orgId}-${config.chainId}`} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">Chain {config.chainId}</p>
                        <Badge variant="outline" className="text-xs">
                          Vault linked
                        </Badge>
                      </div>
                      <p className="font-mono text-[10px] text-muted-foreground break-all">
                        Smart account {config.smartAccount}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground break-all">
                        Vault {config.vault}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground break-all">
                        Rule engine {config.ruleEngine}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground break-all">
                        Automation {config.automationExecutor}
                      </p>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="intents" className="mt-4 space-y-3">
                  {intents.filter((intent) => intent.orgId === selectedOrg.id).length === 0 && (
                    <p className="text-sm text-muted-foreground">No intents registered</p>
                  )}
                  {intents
                    .filter((intent) => intent.orgId === selectedOrg.id)
                    .map((intent) => (
                      <div
                        key={intent.id}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{intent.id}</p>
                          <Badge variant="outline" className="text-xs">
                            {intent.executed ? "Executed" : "Pending"}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">
                          Payload {intent.payloadHash.slice(0, 16)}... valid until {formatDistanceToNow(intent.validUntil, { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="liquid-glass border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="h-5 w-5 text-primary" /> Vault status
              </CardTitle>
              <CardDescription>Real-time balances and departmental coverage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-4">
                <p className="text-sm text-muted-foreground">Org balance</p>
                <p className="text-3xl font-bold">
                  {(vaultForSelectedOrg?.orgBalance ?? 0).toLocaleString()} USDC
                </p>
                <p className="text-xs text-muted-foreground">
                  Last updated {vaultForSelectedOrg?.lastUpdated ? formatDistanceToNow(vaultForSelectedOrg.lastUpdated, { addSuffix: true }) : "n/a"}
                </p>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Department coverage</span>
                  <span>{vaultCoverage}%</span>
                </div>
                <Progress value={vaultCoverage} className="h-2 bg-white/10" />
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5">
                    <TableHead>Department</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departmentsForSelectedOrg.map((dept) => (
                    <TableRow key={dept.id} className="border-white/5">
                      <TableCell>
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{dept.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground">{dept.nameHash}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={dept.active ? "text-emerald-200 border-emerald-400/60" : "text-amber-200 border-amber-400/60"}>
                              {dept.active ? "Active" : "Paused"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-primary"
                              onClick={() => handleDepartmentEdit(dept)}
                              aria-label={`Edit ${dept.name}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {dept.balance.toLocaleString()} / Cap {dept.cap.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Dialog
                open={isDialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) {
                    setDepartmentDraft(null);
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-primary/40 text-primary" onClick={handleDepartmentCreate}>
                    Configure departments
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900/95 border-white/10">
                  <DialogHeader>
                    <DialogTitle>Department configuration</DialogTitle>
                    <DialogDescription>
                      Manage per-department caps and balances. Updates persist to the in-browser treasury twin.
                    </DialogDescription>
                  </DialogHeader>
                  {departmentDraft && (
                    <div className="space-y-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                          value={departmentDraft.name}
                          onChange={(event) =>
                            setDepartmentDraft({ ...departmentDraft, name: event.target.value })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Cap (USDC)</label>
                        <Input
                          type="number"
                          value={departmentDraft.cap}
                          onChange={(event) =>
                            setDepartmentDraft({ ...departmentDraft, cap: Number(event.target.value) })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Balance (USDC)</label>
                        <Input
                          type="number"
                          value={departmentDraft.balance}
                          onChange={(event) =>
                            setDepartmentDraft({ ...departmentDraft, balance: Number(event.target.value) })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Active</p>
                          <p className="text-xs text-muted-foreground">Department can receive allocations</p>
                        </div>
                        <Switch
                          checked={departmentDraft.active}
                          onCheckedChange={(checked) =>
                            setDepartmentDraft({ ...departmentDraft, active: checked })
                          }
                        />
                      </div>
                    </div>
                  )}
                  <DialogFooter className="mt-6">
                    <Button variant="ghost" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveDepartment} disabled={!departmentDraft}>
                      Save changes
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>

          <Card className="liquid-glass border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="h-5 w-5 text-primary" /> Policy modules
              </CardTitle>
              <CardDescription>Composable guard rails enforced by the PolicyEngine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {policiesForSelectedOrg.map((policy) => (
                <div key={policy.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{policy.name}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{policy.type}</p>
                    </div>
                    <Badge variant="outline" className={policy.enabled ? "border-emerald-400/60 text-emerald-200" : "border-amber-400/60 text-amber-200"}>
                      {policy.enabled ? "Enforced" : "Bypassed"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{policy.description}</p>
                  <pre className="text-xs bg-black/40 p-3 rounded-xl border border-white/5 overflow-x-auto">
                    {JSON.stringify(policy.config, null, 2)}
                  </pre>
                </div>
              ))}
              {policiesForSelectedOrg.length === 0 && (
                <p className="text-sm text-muted-foreground">No policy modules configured.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-7 mt-6">
          <Card className="liquid-glass border border-white/10 shadow-xl lg:col-span-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ListChecks className="h-5 w-5 text-primary" /> Rule engine
              </CardTitle>
              <CardDescription>Department allocations and distribution intents.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="allocations" className="w-full">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="allocations">Allocations</TabsTrigger>
                  <TabsTrigger value="distributions">Distributions</TabsTrigger>
                </TabsList>
                <TabsContent value="allocations" className="mt-4 space-y-3">
                  {allocationRulesForSelectedOrg.map((rule) => (
                    <div key={rule.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Rule #{rule.id}</p>
                        <Badge variant="outline" className="text-xs">{rule.allocationType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {rule.allocationType === "Percentage" && `${(rule.bps ?? 0) / 100}% from dept ${rule.sourceDept} → ${rule.targetDept}`}
                        {rule.allocationType === "FixedAmount" && `${rule.amount?.toLocaleString()} USDC from dept ${rule.sourceDept} → ${rule.targetDept}`}
                        {rule.allocationType === "Residual" && `Distribute remaining balance within dept ${rule.sourceDept}`}
                      </p>
                      {rule.cap && (
                        <p className="text-xs text-muted-foreground">Cap {rule.cap.toLocaleString()} USDC</p>
                      )}
                      <div className="flex justify-end mt-3">
                        <Button variant="ghost" size="sm" onClick={() => actions.recordAllocationExecution(selectedOrg.id, rule.id)}>
                          Simulate execute
                        </Button>
                      </div>
                    </div>
                  ))}
                  {allocationRulesForSelectedOrg.length === 0 && (
                    <p className="text-sm text-muted-foreground">No allocation rules configured.</p>
                  )}
                </TabsContent>
                <TabsContent value="distributions" className="mt-4 space-y-3">
                  {distributionRulesForSelectedOrg.map((rule) => (
                    <div key={rule.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">Rule #{rule.id}</p>
                        <Badge variant="outline" className="text-xs">
                          {rule.frequency}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Dept {rule.fromDept} → {rule.recipient} · {rule.amount ? `${rule.amount.toLocaleString()} USDC` : `${(rule.bps ?? 0) / 100}%`}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>Last executed {rule.lastExecuted ? formatDistanceToNow(rule.lastExecuted, { addSuffix: true }) : "never"}</span>
                        {rule.confidential && (
                          <Badge variant="outline" className="border-sky-400/60 text-sky-200">
                            ZK payroll
                          </Badge>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => actions.recordDistributionExecution(selectedOrg.id, rule.id, rule.confidential)}
                        >
                          Simulate payout
                        </Button>
                      </div>
                    </div>
                  ))}
                  {distributionRulesForSelectedOrg.length === 0 && (
                    <p className="text-sm text-muted-foreground">No distribution rules configured.</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="liquid-glass border border-white/10 shadow-xl lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bot className="h-5 w-5 text-primary" /> Automation executor
              </CardTitle>
              <CardDescription>Arc schedules driving onchain treasury operations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {schedulesForSelectedOrg.map((schedule) => {
                const due = automationDueSchedules.some((item) => item.id === schedule.id);
                return (
                  <div key={schedule.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Schedule #{schedule.id}</p>
                      <Badge variant="outline" className="text-xs">
                        Chain {schedule.chainId}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{schedule.automationMetadata}</p>
                    <p className="text-xs text-muted-foreground">
                      Last executed {schedule.lastExecuted ? formatDistanceToNow(schedule.lastExecuted, { addSuffix: true }) : "never"}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <Badge variant="outline" className={due ? "border-amber-400/60 text-amber-200" : "border-emerald-400/60 text-emerald-200"}>
                        {due ? "Due" : "On schedule"}
                      </Badge>
                      <span className="text-muted-foreground">
                        {schedule.allocationRuleIds.length} allocations · {schedule.distributionRuleIds.length} distributions
                      </span>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="ghost" size="sm" onClick={() => actions.runSchedule(schedule.id)}>
                        Simulate execution
                      </Button>
                    </div>
                  </div>
                );
              })}
              {schedulesForSelectedOrg.length === 0 && (
                <p className="text-sm text-muted-foreground">No automation schedules configured.</p>
              )}
              <div className="rounded-2xl border border-white/10 bg-primary/10 p-4 text-sm space-y-2">
                <p className="font-semibold flex items-center gap-2">
                  <Clock3 className="h-4 w-4" /> Due soon
                </p>
                {automationDueSchedules.length > 0 ? (
                  automationDueSchedules.map((schedule) => (
                    <p key={schedule.id} className="text-muted-foreground">
                      Schedule #{schedule.id} eligible for execution on chain {schedule.chainId}.
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground">All schedules are within configured intervals.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 mt-6">
          <Card className="liquid-glass border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ArrowRightLeft className="h-5 w-5 text-primary" /> Circle Gateway flows
              </CardTitle>
              <CardDescription>Track on/off-ramps and payouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedOrgTransfers.map((transfer) => (
                <div key={transfer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{transfer.direction === "inbound" ? "Inbound" : "Outbound"} · {transfer.amount.toLocaleString()} USDC</p>
                    <Badge
                      variant="outline"
                      className={
                        transfer.status === "completed"
                          ? "border-emerald-400/60 text-emerald-200"
                          : transfer.status === "failed"
                          ? "border-rose-400/60 text-rose-200"
                          : "border-amber-400/60 text-amber-200"
                      }
                    >
                      {transfer.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Circle ref {transfer.circleId ?? "pending"} · {transfer.metadata}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Updated {formatDistanceToNow(transfer.updatedAt, { addSuffix: true })}
                  </p>
                </div>
              ))}
              {selectedOrgTransfers.length === 0 && (
                <p className="text-sm text-muted-foreground">No Gateway activity yet.</p>
              )}
              {pendingGatewayTransfers.length > 0 && (
                <div className="rounded-2xl border border-amber-400/60 bg-amber-500/10 p-3 text-sm">
                  <p className="font-semibold flex items-center gap-2 text-amber-200">
                    <AlertTriangle className="h-4 w-4" /> Pending reconciliation
                  </p>
                  <p className="text-amber-100/80 text-xs">
                    {pendingGatewayTransfers.length} transfer(s) awaiting confirmation from Circle Gateway.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="liquid-glass border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Globe2 className="h-5 w-5 text-primary" /> Multi-chain telemetry
              </CardTitle>
              <CardDescription>CCTP transfers and chain-specific posture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {crossChainTransfers
                .filter((transfer) => transfer.orgId === selectedOrgId)
                .map((transfer) => (
                  <div key={transfer.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{transfer.amount.toLocaleString()} USDC</p>
                      <Badge variant="outline" className="text-xs">
                        {transfer.sourceChainId} → {transfer.destinationChainId}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Initiated {formatDistanceToNow(transfer.initiatedAt, { addSuffix: true })}</p>
                    <Badge
                      variant="outline"
                      className={
                        transfer.status === "completed"
                          ? "border-emerald-400/60 text-emerald-200"
                          : transfer.status === "failed"
                          ? "border-rose-400/60 text-rose-200"
                          : "border-amber-400/60 text-amber-200"
                      }
                    >
                      {transfer.status}
                    </Badge>
                  </div>
                ))}
              {crossChainTransfers.filter((transfer) => transfer.orgId === selectedOrgId).length === 0 && (
                <p className="text-sm text-muted-foreground">No cross-chain transfers yet.</p>
              )}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-muted-foreground space-y-2">
                <p className="font-semibold text-sm text-white">Home chain mapping</p>
                <ul className="space-y-1">
                  {orgs
                    .filter((org) => org.id === selectedOrgId)
                    .map((org) => (
                      <li key={org.id}>
                        Org #{org.id} anchored on chain {org.homeChainId} with CCTP-enabled vaults.
                      </li>
                    ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" /> ML intelligence
              </CardTitle>
              <CardDescription>Runway, anomalies and optimisation suggestions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {mlInsightForSelectedOrg ? (
                <>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-sky-400/60 text-sky-200 bg-sky-500/10">
                      Runway {mlInsightForSelectedOrg.runwayMonths} months
                    </Badge>
                    <Badge variant="outline" className="border-primary/60 text-primary">
                      Burn {mlInsightForSelectedOrg.burnRate.toLocaleString()} USDC/mo
                    </Badge>
                    <Badge variant="outline" className={
                      mlInsightForSelectedOrg.anomalyScore > 0.3
                        ? "border-amber-400/60 text-amber-200"
                        : "border-emerald-400/60 text-emerald-200"
                    }>
                      Anomaly score {mlInsightForSelectedOrg.anomalyScore.toFixed(2)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Generated {formatDistanceToNow(mlInsightForSelectedOrg.generatedAt, { addSuffix: true })}
                  </p>
                  <div className="space-y-2">
                    {mlInsightForSelectedOrg.recommendations.map((recommendation, index) => (
                      <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-3 flex gap-3">
                        <LineChart className="h-4 w-4 text-primary mt-0.5" />
                        <p>{recommendation}</p>
                      </div>
                    ))}
                  </div>
                  <Textarea
                    readOnly
                    value={JSON.stringify(mlInsightForSelectedOrg, null, 2)}
                    className="bg-black/40 border-white/5 text-xs font-mono"
                  />
                </>
              ) : (
                <p className="text-muted-foreground">No ML recommendations yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mt-6">
          <Card className="liquid-glass border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Layers3 className="h-5 w-5 text-primary" /> ZK payroll & confidentiality
              </CardTitle>
              <CardDescription>Confidential payroll proofs registered against distribution rules.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {confidentialRules.map((rule) => (
                <div key={rule.id} className="rounded-2xl border border-sky-400/40 bg-sky-500/10 p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Rule #{rule.id}</p>
                    <Badge variant="outline" className="border-white/30 text-white/80">
                      Dept {rule.fromDept}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Last executed {rule.lastExecuted ? formatDistanceToNow(rule.lastExecuted, { addSuffix: true }) : "never"}
                  </p>
                  <p className="text-sm">ZK proof required for each payroll cycle.</p>
                </div>
              ))}
              {confidentialRules.length === 0 && (
                <p className="text-sm text-muted-foreground">No confidential payroll rules configured.</p>
              )}
            </CardContent>
          </Card>

          <Card className="liquid-glass border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CircuitBoard className="h-5 w-5 text-primary" /> Checkpoints & observability
              </CardTitle>
              <CardDescription>Merkle snapshots and latest events.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {checkpoints
                  .filter((checkpoint) => checkpoint.orgId === selectedOrgId)
                  .slice(-3)
                  .reverse()
                  .map((checkpoint) => (
                    <div key={checkpoint.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
                      <p className="font-semibold">Checkpoint {checkpoint.id}</p>
                      <p className="font-mono text-[10px] text-muted-foreground break-all">{checkpoint.stateRoot}</p>
                      <p className="text-muted-foreground">
                        Recorded {formatDistanceToNow(checkpoint.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  ))}
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" /> Latest events
                </p>
                {selectedOrgEvents.map((event) => (
                  <div key={event.id} className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs uppercase tracking-widest">
                        {event.type}
                      </Badge>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(event.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                    <p>{event.message}</p>
                  </div>
                ))}
                {selectedOrgEvents.length === 0 && (
                  <p className="text-sm text-muted-foreground">No recent events.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default TreasuryBrain;
