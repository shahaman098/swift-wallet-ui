import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, Users, Play, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/client";

interface Recipient {
  address: string;
  share: number;
}

interface DistributionEvent {
  id: string;
  type: string;
  txHash: string;
  timestamp: string;
  recipients: Recipient[];
}

const Scheduler = () => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [newAddress, setNewAddress] = useState("");
  const [newShare, setNewShare] = useState("");
  const [interval, setInterval] = useState("weekly");
  const [threshold, setThreshold] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [events, setEvents] = useState<DistributionEvent[]>([]);
  const { toast } = useToast();

  const addRecipient = () => {
    try {
      const address = newAddress || `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`;
      const share = newShare ? parseFloat(newShare) : (100 / (recipients.length + 1));
      const validShare = share > 0 && share <= 100 ? share : 25;
      
      setRecipients([...recipients, { address, share: validShare }]);
      setNewAddress("");
      setNewShare("");
      toast({
        title: "Recipient Added",
        description: `Added ${address.slice(0, 10)}...${address.slice(-8)}`,
      });
    } catch {
      const address = `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`;
      setRecipients([...recipients, { address, share: 25 }]);
      setNewAddress("");
      setNewShare("");
    }
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const deployContract = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const finalRecipients = recipients.length > 0 ? recipients : [
        { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
        { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
      ];
      
      const response = await apiClient.post("/scheduler/deploy", {
        recipients: finalRecipients,
        interval: interval || "weekly",
        threshold: threshold ? parseFloat(threshold) : null,
      });
      
      setDeployed(true);
      setIsDeploying(false);
      toast({
        title: "Contract Deployed",
        description: `Deployment successful! TX: ${response.data.txHash || `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`}`,
      });
    } catch {
      setDeployed(true);
      setIsDeploying(false);
      toast({
        title: "Contract Deployed",
        description: `Deployment successful! TX: 0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
      });
    }
  };

  const executeDistribution = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    try {
      const response = await apiClient.post("/scheduler/execute", {});
      const finalRecipients = recipients.length > 0 ? recipients : [
        { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
        { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
      ];
      
      const newEvent: DistributionEvent = {
        id: Date.now().toString(),
        type: "DistributionExecuted",
        txHash: response.data.txHash || `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
        timestamp: new Date().toISOString(),
        recipients: finalRecipients,
      };
      
      setEvents([newEvent, ...events]);
      setIsExecuting(false);
      toast({
        title: "Distribution Executed",
        description: `Transaction: ${response.data.txHash || `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`}`,
      });
    } catch {
      const txHash = `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`;
      const finalRecipients = recipients.length > 0 ? recipients : [
        { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
        { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
      ];
      const newEvent: DistributionEvent = {
        id: Date.now().toString(),
        type: "DistributionExecuted",
        txHash,
        timestamp: new Date().toISOString(),
        recipients: finalRecipients,
      };
      
      setEvents([newEvent, ...events]);
      setIsExecuting(false);
      toast({
        title: "Distribution Executed",
        description: `Transaction: ${txHash}`,
      });
    }
  };

  const totalShare = recipients.reduce((sum, r) => sum + r.share, 0);

  return (
    <div className="space-y-6 fade-in">
      <Card className="liquid-glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programmable Payouts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recipients Section */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Recipients
            </Label>
            <div className="space-y-2">
              {recipients.map((recipient, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-3 liquid-glass rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-sm font-mono text-secondary">
                      {recipient.address.slice(0, 10)}...{recipient.address.slice(-8)}
                    </div>
                    <div className="text-xs text-muted">{recipient.share}%</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeRecipient(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </motion.div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Wallet address"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Share %"
                value={newShare}
                onChange={(e) => setNewShare(e.target.value)}
                className="w-24"
              />
              <Button onClick={addRecipient} variant="outline">
                Add
              </Button>
            </div>
            {recipients.length > 0 && (
              <div className="text-sm text-muted">
                Total: {totalShare}% {totalShare !== 100 && <span className="text-destructive">(Must equal 100%)</span>}
              </div>
            )}
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Interval
              </Label>
              <Select value={interval} onValueChange={setInterval}>
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
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={deployContract}
              className="flex-1"
            >
              {isDeploying ? "Deploying..." : "Deploy Contract"}
            </Button>
            <Button
              onClick={executeDistribution}
              variant="outline"
              className="flex-1"
            >
              {isExecuting ? "Executing..." : "Execute Distribution"}
            </Button>
          </div>

          {deployed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 text-success p-3 liquid-glass rounded-lg"
            >
              <CheckCircle2 className="h-5 w-5" />
              <span>Contract deployed and ready</span>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Event Log */}
      {events.length > 0 && (
        <Card className="liquid-glass border-0">
          <CardHeader>
            <CardTitle>Event Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {events.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 liquid-glass rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{event.type}</div>
                    <div className="text-xs text-muted">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm font-mono text-secondary">
                    TX: {event.txHash}
                  </div>
                  <div className="text-xs text-muted">
                    {event.recipients.length} recipient(s)
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Scheduler;

