import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

type Snapshot = {
  recipients: number;
  totalAllocation: number; // 0-100
  lastDistributionTs?: number; // epoch seconds
  intervalSec?: number;
};

export default function Track1Snapshot() {
  const [snap, setSnap] = useState<Snapshot>({
    recipients: 0,
    totalAllocation: 0,
    lastDistributionTs: Math.floor(Date.now() / 1000) - 1800,
    intervalSec: 3600,
  });
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  // Optional env endpoint for read-only snapshot (safe)
  const endpoint =
    (import.meta as any)?.env?.VITE_TRACK1_SNAPSHOT_URL || "";

  useEffect(() => {
    let cancelled = false;
    const tick = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000
    );
    const load = async () => {
      if (!endpoint) return; // use defaults
      try {
        const res = await fetch(endpoint, { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setSnap((prev) => ({
          recipients: Number(data?.recipients ?? prev.recipients),
          totalAllocation: Number(data?.totalAllocation ?? prev.totalAllocation),
          lastDistributionTs: Number(
            data?.lastDistributionTs ?? prev.lastDistributionTs
          ),
          intervalSec: Number(data?.intervalSec ?? prev.intervalSec),
        }));
      } catch {
        // fall back silently
      }
    };
    load();
    const id = setInterval(load, 30000);
    return () => {
      clearInterval(id);
      clearInterval(tick);
      cancelled = true;
    };
  }, [endpoint]);

  const nextTs = (snap.lastDistributionTs ?? 0) + (snap.intervalSec ?? 0);
  const remaining = Math.max(0, nextTs - now);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;

  const health: "good" | "warn" = useMemo(() => {
    if (remaining < 300) return "warn";
    return "good";
  }, [remaining]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="hover-lift"
    >
      <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer">
        <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
          <CardTitle className="text-xl">Track 1 — Next Distribution</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-muted-foreground">Recipients</div>
            <div className="font-semibold">{snap.recipients}</div>
            <div className="text-muted-foreground">Total Allocation</div>
            <div className="font-semibold">{snap.totalAllocation}%</div>
            <div className="text-muted-foreground">Last Distribution</div>
            <div className="font-semibold">
              {snap.lastDistributionTs
                ? new Date((snap.lastDistributionTs as number) * 1000).toLocaleString()
                : "—"}
            </div>
            <div className="text-muted-foreground">Next Run</div>
            <div className="font-semibold">
              {h}h {m}m {s}s
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-muted rounded overflow-hidden">
            <div
              className={
                "h-2 " +
                (health === "good" ? "bg-emerald-500" : "bg-amber-500")
              }
              style={{
                width: `${Math.min(
                  100,
                  ((snap.intervalSec
                    ? (now - (snap.lastDistributionTs || 0)) /
                      (snap.intervalSec || 1)
                    : 0) * 100)
                )}%`,
                transition: "width 0.2s ease",
              }}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Status indicator turns amber as next distribution approaches.
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


