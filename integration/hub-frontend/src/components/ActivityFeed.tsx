import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

type Tx = {
  id: string;
  type: string;
  amount: number;
  timestamp?: string;
  createdAt?: string;
  status?: string;
};

export default function ActivityFeed() {
  const [items, setItems] = useState<Tx[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const { apiClient } = await import("@/api/client");
        const { data } = await apiClient.get("/wallet/activity");
        if (cancelled) return;
        const txs: Tx[] = (data?.transactions ?? []).slice(0, 10);
        setItems(txs);
      } catch {
        // fail silently; UI will show empty list
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer">
      <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-xl">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading activity…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent activity yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((tx, i) => (
              <motion.div
                key={tx.id ?? i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-center justify-between rounded-xl border bg-card/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="text-sm">
                    <div className="font-medium capitalize">{tx.type || "transaction"}</div>
                    <div className="text-muted-foreground text-xs">
                      {tx.status || "confirmed"} • {new Date(tx.timestamp ?? tx.createdAt ?? Date.now()).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-semibold">{Number(tx.amount ?? 0).toLocaleString()} USDC</div>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


