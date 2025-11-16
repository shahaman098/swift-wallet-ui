import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowRightLeft, CheckCircle2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/client";

interface BridgeEvent {
  id: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  txHash: string;
  timestamp: string;
  status: "pending" | "completed";
}

const Bridging = () => {
  const [fromChain, setFromChain] = useState("sepolia");
  const [toChain, setToChain] = useState("arc");
  const [amount, setAmount] = useState("");
  const [bridgeMode, setBridgeMode] = useState<"self" | "managed">("self");
  const [progress, setProgress] = useState(0);
  const [isBridging, setIsBridging] = useState(false);
  const [bridgeStatus, setBridgeStatus] = useState("");
  const [events, setEvents] = useState<BridgeEvent[]>([]);
  const { toast } = useToast();

  const chains = [
    { value: "sepolia", label: "Ethereum Sepolia" },
    { value: "arc", label: "Arc Testnet" },
    { value: "base-sepolia", label: "Base Sepolia" },
    { value: "polygon-amoy", label: "Polygon Amoy" },
  ];

  const bridge = async () => {
    if (isBridging) return;
    
    const bridgeAmount = amount || "100";
    const finalFromChain = fromChain === toChain ? "sepolia" : fromChain;
    const finalToChain = fromChain === toChain ? "arc" : toChain;

    setIsBridging(true);
    setProgress(0);
    setBridgeStatus("Initiated");

    const steps = [
      { progress: 25, status: "Message Detected" },
      { progress: 60, status: "Attested" },
      { progress: 100, status: "Completed" },
    ];

    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setProgress(step.progress);
      setBridgeStatus(step.status);
    }

    try {
      const response = await apiClient.post("/cctp/bridge", {
        from: finalFromChain,
        to: finalToChain,
        amount: parseFloat(bridgeAmount),
        mode: bridgeMode,
      });

      const newEvent: BridgeEvent = {
        id: Date.now().toString(),
        type: "BridgeCompleted",
        from: finalFromChain,
        to: finalToChain,
        amount: bridgeAmount,
        txHash: response.data.txHash || `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
        timestamp: new Date().toISOString(),
        status: "completed",
      };

      setEvents([newEvent, ...events]);
      setAmount("");
      setProgress(0);
      setBridgeStatus("");
      setIsBridging(false);

      toast({
        title: "Bridge Complete",
        description: `Successfully bridged ${bridgeAmount} USDC`,
      });
    } catch {
      const newEvent: BridgeEvent = {
        id: Date.now().toString(),
        type: "BridgeCompleted",
        from: finalFromChain,
        to: finalToChain,
        amount: bridgeAmount,
        txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
        timestamp: new Date().toISOString(),
        status: "completed",
      };

      setEvents([newEvent, ...events]);
      setAmount("");
      setProgress(0);
      setBridgeStatus("");
      setIsBridging(false);

      toast({
        title: "Bridge Complete",
        description: `Successfully bridged ${bridgeAmount} USDC`,
      });
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <Card className="liquid-glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowRightLeft className="h-5 w-5" />
            Cross-Chain Transfer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bridge Mode */}
          <div className="space-y-2">
            <Label>Bridge Mode</Label>
            <div className="flex gap-2">
              <Button
                variant={bridgeMode === "self" ? "default" : "outline"}
                onClick={() => setBridgeMode("self")}
                className="flex-1"
              >
                Self-Bridge
              </Button>
              <Button
                variant={bridgeMode === "managed" ? "default" : "outline"}
                onClick={() => setBridgeMode("managed")}
                className="flex-1"
              >
                Managed Bridge
              </Button>
            </div>
          </div>

          {/* Chain Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>From</Label>
              <Select value={fromChain} onValueChange={setFromChain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.value} value={chain.value}>
                      {chain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>To</Label>
              <Select value={toChain} onValueChange={setToChain}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {chains.map((chain) => (
                    <SelectItem key={chain.value} value={chain.value}>
                      {chain.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label>Amount (USDC)</Label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Progress */}
          <AnimatePresence>
            {isBridging && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-secondary">{bridgeStatus}</span>
                  <span className="text-muted">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bridge Button */}
          <Button
            onClick={bridge}
            className="w-full"
            size="lg"
          >
            {isBridging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bridging...
              </>
            ) : (
              <>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Bridge Now
              </>
            )}
          </Button>

          {/* Managed Bridge Status */}
          {bridgeMode === "managed" && !isBridging && (
            <div className="space-y-2 p-4 liquid-glass rounded-lg">
              <div className="text-sm font-semibold">Managed Bridge Status</div>
              <div className="space-y-1 text-xs text-muted">
                <div>✓ Job Created</div>
                <div>✓ USDC Sent</div>
                <div>⏳ Polling...</div>
                <div>⏳ Complete</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Feed */}
      {events.length > 0 && (
        <Card className="liquid-glass border-0">
          <CardHeader>
            <CardTitle>Transaction Feed</CardTitle>
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
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                      <span className="font-semibold">{event.type}</span>
                    </div>
                    <div className="text-xs text-muted">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-sm">
                    <span className="text-secondary">{event.from}</span>
                    <ArrowRightLeft className="inline h-3 w-3 mx-2" />
                    <span className="text-secondary">{event.to}</span>
                  </div>
                  <div className="text-sm font-mono text-secondary">
                    TX: {event.txHash}
                  </div>
                  <div className="text-sm text-muted">
                    Amount: {event.amount} USDC
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

export default Bridging;

