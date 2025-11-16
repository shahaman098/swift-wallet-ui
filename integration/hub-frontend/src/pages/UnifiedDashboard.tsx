import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Scheduler from "@/components/Scheduler";
import Bridging from "@/components/Bridging";
import ConditionalTreasurySplitter from "@/components/ConditionalTreasurySplitter";
import EventFeed from "@/components/EventFeed";
import BalanceCard from "@/components/BalanceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, ArrowRightLeft, Calendar, Shield, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import { apiClient } from "@/api/client";
import { useToast } from "@/hooks/use-toast";

interface UnifiedEvent {
  id: string;
  type: string;
  txHash: string;
  timestamp: string;
  status: "completed" | "pending";
  details?: string;
  source: "scheduler" | "bridge" | "treasury" | "payment";
}

const UnifiedDashboard = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [allEvents, setAllEvents] = useState<UnifiedEvent[]>([]);
  const { walletId } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBalance();
    // Poll for events every 5 seconds
    const interval = setInterval(() => {
      fetchEvents();
    }, 5000);
    return () => clearInterval(interval);
  }, [walletId]);

  const fetchBalance = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    try {
      const response = await apiClient.get("/wallet/balance");
      const numericBalance = parseFloat(response.data?.balance ?? "1243.0");
      setBalance(Number.isFinite(numericBalance) ? numericBalance : 1243.0);
    } catch {
      setBalance(1243.0);
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/events");
      setAllEvents(response.data.events || []);
    } catch {
      setAllEvents([]);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-shapes" />
      
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-2 fade-in" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Noah's Arc
          </h1>
          <p className="text-lg fade-in" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Unified Liquid Glass Dashboard — All Tracks Integrated
          </p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
          className="mb-8"
        >
          <BalanceCard balance={balance} loading={loading} />
        </motion.div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="scheduler" className="space-y-6">
          <TabsList className="liquid-glass border-0 w-full justify-start">
            <TabsTrigger value="scheduler" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Track 1: Scheduler
            </TabsTrigger>
            <TabsTrigger value="bridge" className="flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Track 2: Bridge
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Track 3/4: Payments
            </TabsTrigger>
            <TabsTrigger value="treasury" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Treasury Splitter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduler" className="fade-in">
            <Scheduler />
          </TabsContent>

          <TabsContent value="bridge" className="fade-in">
            <Bridging />
          </TabsContent>

          <TabsContent value="payments" className="fade-in">
            <div className="space-y-6">
              <Card className="liquid-glass border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Embedded Wallet & Payments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => navigate("/send-payment")}
                      className="liquid-glass border-0 h-24 flex flex-col items-center justify-center gap-2"
                      variant="outline"
                    >
                      <Wallet className="h-6 w-6" />
                      <span>Send Payment</span>
                    </Button>
                    <Button
                      onClick={() => navigate("/request")}
                      className="liquid-glass border-0 h-24 flex flex-col items-center justify-center gap-2"
                      variant="outline"
                    >
                      <Activity className="h-6 w-6" />
                      <span>Request Payment</span>
                    </Button>
                    <Button
                      onClick={() => navigate("/split-payment")}
                      className="liquid-glass border-0 h-24 flex flex-col items-center justify-center gap-2"
                      variant="outline"
                    >
                      <Shield className="h-6 w-6" />
                      <span>Split Payment</span>
                    </Button>
                  </div>
                  <div className="p-4 liquid-glass rounded-lg">
                    <p className="text-sm" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                      Access full payment features including sending, requesting, and splitting payments.
                      All transactions are processed instantly with simulated backend responses.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="treasury" className="fade-in">
            <ConditionalTreasurySplitter />
          </TabsContent>
        </Tabs>

        {/* Unified Event Feed */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.25 }}
          className="mt-8"
        >
          <EventFeed events={allEvents} />
        </motion.div>
      </main>
    </div>
  );
};

export default UnifiedDashboard;

