import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";

export default function GlobalWalletPreview() {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const { apiClient } = await import("@/api/client");
        const { data } = await apiClient.get("/wallet/balance");
        if (cancelled) return;
        const value = Number(data?.balance ?? 0);
        setBalance(Number.isFinite(value) ? value : 0);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load");
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

  const health = useMemo<"good" | "warn" | "error">(() => {
    if (error) return "error";
    if (balance === null || loading) return "warn";
    if ((balance ?? 0) >= 10) return "good";
    return "warn";
  }, [balance, loading, error]);

  return (
    <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer">
      <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-xl">Global Wallet Preview</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border p-4 bg-card/60"
          >
            <div className="text-sm text-muted-foreground">USDC Balance</div>
            <div className="text-3xl font-bold mt-1">
              {loading ? "…" : error ? "—" : `${(balance ?? 0).toLocaleString()} USDC`}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="rounded-2xl border p-4 bg-card/60"
          >
            <div className="text-sm text-muted-foreground">Wallet Health</div>
            <div className="flex items-center gap-2 mt-1">
              {health === "good" ? (
                <>
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <span className="font-semibold">Healthy</span>
                </>
              ) : health === "warn" ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <span className="font-semibold">Needs Attention</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <span className="font-semibold">Unavailable</span>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="rounded-2xl border p-4 bg-card/60"
          >
            <div className="text-sm text-muted-foreground">Trend</div>
            <div className="flex items-center gap-2 mt-1">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-semibold">Stable</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Realtime updates every 15s</div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}


