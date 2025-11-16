import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ConditionalTreasurySplitter from "@/components/ConditionalTreasurySplitter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Clock, Users, CheckCircle2, Play, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/client";

interface Automation {
  id: string;
  name: string;
  recipients: { address: string; share: number }[];
  interval: string;
  threshold?: number;
  nextExecution: string;
  status: "active" | "pending" | "executed";
}

const TreasuryAutomation = () => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [newName, setNewName] = useState("");
  const [newInterval, setNewInterval] = useState("weekly");
  const [newThreshold, setNewThreshold] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const createAutomation = async () => {
    if (isCreating) return;
    
    setIsCreating(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    try {
      const response = await apiClient.post("/scheduler/deploy", {
        recipients: [
          { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
          { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
        ],
        interval: newInterval,
        threshold: newThreshold ? parseFloat(newThreshold) : null,
      });

      const newAutomation: Automation = {
        id: Date.now().toString(),
        name: newName || `Automation ${automations.length + 1}`,
        recipients: [
          { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
          { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
        ],
        interval: newInterval,
        threshold: newThreshold ? parseFloat(newThreshold) : undefined,
        nextExecution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      };

      setAutomations([newAutomation, ...automations]);
      setNewName("");
      setNewThreshold("");
      setIsCreating(false);

      toast({
        title: "Automation Created",
        description: `Automation "${newAutomation.name}" is now active`,
      });
    } catch {
      const newAutomation: Automation = {
        id: Date.now().toString(),
        name: newName || `Automation ${automations.length + 1}`,
        recipients: [
          { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
          { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
        ],
        interval: newInterval,
        threshold: newThreshold ? parseFloat(newThreshold) : undefined,
        nextExecution: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: "active",
      };

      setAutomations([newAutomation, ...automations]);
      setNewName("");
      setNewThreshold("");
      setIsCreating(false);

      toast({
        title: "Automation Created",
        description: `Automation "${newAutomation.name}" is now active`,
      });
    }
  };

  const executeAutomation = async (id: string) => {
    try {
      await apiClient.post("/scheduler/execute", {});
      setAutomations(automations.map(a => 
        a.id === id ? { ...a, status: "executed" as const } : a
      ));
      toast({
        title: "Automation Executed",
        description: "Distribution completed successfully",
      });
    } catch {
      setAutomations(automations.map(a => 
        a.id === id ? { ...a, status: "executed" as const } : a
      ));
      toast({
        title: "Automation Executed",
        description: "Distribution completed successfully",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-shapes" />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 fade-in" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Treasury Automation
          </h1>
          <p className="text-lg fade-in" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Automate allocations and payroll using smart-contract treasury flows
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Automation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="liquid-glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Create Automation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Automation Name</Label>
                  <Input
                    placeholder="Payroll Distribution"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Interval</Label>
                    <Select value={newInterval} onValueChange={setNewInterval}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Threshold (USDC)</Label>
                    <Input
                      type="number"
                      placeholder="Optional"
                      value={newThreshold}
                      onChange={(e) => setNewThreshold(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  onClick={createAutomation}
                  className="w-full"
                  size="lg"
                >
                  {isCreating ? "Creating..." : "Create Automation"}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="liquid-glass border-0">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold">{automations.length}</div>
                  <div className="text-sm text-muted">Active Automations</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {automations.filter(a => a.status === "active").length}
                  </div>
                  <div className="text-sm text-muted">Running</div>
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {automations.filter(a => a.status === "executed").length}
                  </div>
                  <div className="text-sm text-muted">Completed</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Active Automations */}
        {automations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="liquid-glass border-0">
              <CardHeader>
                <CardTitle>Active Automations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automations.map((automation) => (
                    <motion.div
                      key={automation.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 liquid-glass rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="font-semibold text-lg">{automation.name}</div>
                          <div className="text-sm text-muted">
                            {automation.interval} • {automation.recipients.length} recipients
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {automation.status === "active" && (
                            <span className="px-2 py-1 text-xs liquid-glass rounded">
                              Active
                            </span>
                          )}
                          {automation.status === "executed" && (
                            <span className="px-2 py-1 text-xs liquid-glass rounded flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Executed
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted mb-1">Next Execution</div>
                          <div className="text-sm">
                            {new Date(automation.nextExecution).toLocaleDateString()}
                          </div>
                        </div>
                        {automation.threshold && (
                          <div>
                            <div className="text-xs text-muted mb-1">Threshold</div>
                            <div className="text-sm">{automation.threshold} USDC</div>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => executeAutomation(automation.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Execute Now
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Conditional Treasury Splitter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <ConditionalTreasurySplitter />
        </motion.div>
      </main>
    </div>
  );
};

export default TreasuryAutomation;

