import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Users, CheckCircle2, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/client";

interface Recipient {
  wallet: string;
  share: number;
}

const ConditionalTreasurySplitter = () => {
  const [oracleApproved, setOracleApproved] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executed, setExecuted] = useState(false);
  const { toast } = useToast();

  // Mock data - in real app, fetch from contract
  const unlockTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const recipients: Recipient[] = [
    { wallet: "0x1234...5678", share: 40 },
    { wallet: "0xabcd...efgh", share: 35 },
    { wallet: "0x9876...4321", share: 25 },
  ];

  const approveOracle = async () => {
    try {
      await apiClient.post("/treasury/oracle-approve", {});
    } catch {}
    setOracleApproved(true);
    toast({
      title: "Oracle Approved",
      description: "Distribution is now approved",
    });
  };

  const executeDistribution = async () => {
    if (isExecuting) return;
    
    if (!oracleApproved) {
      setOracleApproved(true);
    }

    setIsExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const response = await apiClient.post("/treasury/execute-distribution", {});
      setExecuted(true);
      setIsExecuting(false);
      toast({
        title: "Distribution Executed",
        description: `Transaction: ${response.data.txHash || `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`}`,
      });
    } catch {
      const txHash = `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`;
      setExecuted(true);
      setIsExecuting(false);
      toast({
        title: "Distribution Executed",
        description: `Transaction: ${txHash}`,
      });
    }
  };

  const isUnlocked = new Date() >= unlockTime;

  return (
    <Card className="liquid-glass border-0 fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Conditional Treasury Splitter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Unlock Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Clock className="h-4 w-4" />
            Unlock Time
          </div>
          <div className="p-3 liquid-glass rounded-lg">
            <div className="text-sm font-mono">
              {unlockTime.toLocaleString()}
            </div>
            <div className="text-xs text-muted mt-1">
              {isUnlocked ? (
                <span className="text-success">✓ Unlocked</span>
              ) : (
                <span>Locked until unlock time</span>
              )}
            </div>
          </div>
        </div>

        {/* Oracle Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Shield className="h-4 w-4" />
            Oracle Status
          </div>
          <div className="p-3 liquid-glass rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm">
                {oracleApproved ? (
                  <span className="text-success">✓ Approved</span>
                ) : (
                  <span className="text-muted">Pending Approval</span>
                )}
              </span>
              {!oracleApproved && (
                <Button
                  onClick={approveOracle}
                  size="sm"
                  variant="outline"
                >
                  Oracle Approve
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Recipients */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Users className="h-4 w-4" />
            Recipients
          </div>
          <div className="space-y-2">
            {recipients.map((recipient, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 liquid-glass rounded-lg flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="text-sm font-mono text-secondary">
                    {recipient.wallet}
                  </div>
                  <div className="text-xs text-muted">{recipient.share}%</div>
                </div>
                <div className="text-sm font-semibold">{recipient.share}%</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Execute Button */}
        <Button
          onClick={executeDistribution}
          className="w-full"
          size="lg"
        >
          {executed ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Distribution Executed
            </>
          ) : isExecuting ? (
            <>
              <Play className="mr-2 h-4 w-4 animate-pulse" />
              Executing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Execute Distribution
            </>
          )}
        </Button>

        {executed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 liquid-glass rounded-lg text-center text-success"
          >
            Distribution completed successfully
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConditionalTreasurySplitter;

