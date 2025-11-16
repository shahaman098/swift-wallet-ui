import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

type Snapshot = {
  balance: number;
  allocations: { name: string; value: number }[];
  lastDistributionTs?: number;
  intervalSec?: number;
};

export default function Track3Snapshot() {
  const [snap, setSnap] = useState<Snapshot>({
    balance: 0,
    allocations: [
      { name: "Ops", value: 40 },
      { name: "R&D", value: 35 },
      { name: "Marketing", value: 25 },
    ],
    lastDistributionTs: Math.floor(Date.now() / 1000) - 1200,
    intervalSec: 3600,
  });
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));

  const endpoint =
    (import.meta as any)?.env?.VITE_TRACK3_SNAPSHOT_URL || "";

  useEffect(() => {
    let cancelled = false;
    const tick = setInterval(
      () => setNow(Math.floor(Date.now() / 1000)),
      1000
    );
    const load = async () => {
      if (!endpoint) return;
      try {
        const res = await fetch(endpoint, { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setSnap((prev) => ({
          balance: Number(data?.balance ?? prev.balance),
          allocations:
            Array.isArray(data?.allocations) && data.allocations.length
              ? data.allocations
              : prev.allocations,
          lastDistributionTs: Number(
            data?.lastDistributionTs ?? prev.lastDistributionTs
          ),
          intervalSec: Number(data?.intervalSec ?? prev.intervalSec),
        }));
      } catch {
        // fallback silently
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

  const total = snap.allocations.reduce((a, b) => a + b.value, 0) || 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="hover-lift"
    >
      <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer">
        <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
          <CardTitle className="text-xl">Track 3 — Treasury Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-muted-foreground">Balance</div>
            <div className="font-semibold">{snap.balance.toLocaleString()} USDC</div>
            <div className="text-muted-foreground">Last Distribution</div>
            <div className="font-semibold">
              {snap.lastDistributionTs
                ? new Date((snap.lastDistributionTs as number) * 1000).toLocaleString()
                : "—"}
            </div>
            <div className="text-muted-foreground">Next Payout</div>
            <div className="font-semibold">
              {h}h {m}m {s}s
            </div>
            <div className="text-muted-foreground">Health</div>
            <div className={"font-semibold " + (health === "good" ? "text-emerald-400" : "text-amber-400")}>
              {health === "good" ? "Healthy" : "Needs Attention"}
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-3 rounded bg-muted overflow-hidden flex">
              {snap.allocations.map((d, i) => (
                <div
                  key={d.name + i}
                  className="h-3"
                  style={{
                    width: `${(d.value / total) * 100}%`,
                    background:
                      i % 3 === 0 ? "#60a5fa" : i % 3 === 1 ? "#34d399" : "#22d3ee",
                  }}
                  title={`${d.name}: ${d.value}%`}
                />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {snap.allocations.map((d, i) => (
                <div key={d.name + "l" + i} className="flex items-center gap-2">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{
                      background:
                        i % 3 === 0 ? "#60a5fa" : i % 3 === 1 ? "#34d399" : "#22d3ee",
                    }}
                  />
                  <span>{d.name}</span>
                  <span className="font-semibold">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


