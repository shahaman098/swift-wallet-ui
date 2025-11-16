import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

type Preview = {
  label: string;
  nextRunEta: string;
  status: "scheduled" | "pending" | "ok";
};

export default function UpcomingAutomationPreview() {
  const [items, setItems] = useState<Preview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      // Read-only, env-driven preview (no backend coupling)
      const preview: Preview[] = [
        { label: "Programmable Distribution (Track 1)", nextRunEta: "≈ 2h 15m", status: "scheduled" },
        { label: "Treasury Engine Cycle (Track 3)", nextRunEta: "≈ 6h 40m", status: "pending" }
      ];
      if (!cancelled) {
        setItems(preview);
        setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer">
      <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="text-xl">Upcoming Automation</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading schedule…</div>
        ) : (
          <div className="space-y-3">
            {items.map((it, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * i }}
                className="flex items-center justify-between rounded-xl border bg-card/60 px-4 py-3"
              >
                <div className="text-sm">
                  <div className="font-medium">{it.label}</div>
                  <div className="text-xs text-muted-foreground">Next run: {it.nextRunEta}</div>
                </div>
                <span
                  className={
                    "text-xs font-semibold px-2 py-1 rounded " +
                    (it.status === "ok"
                      ? "bg-emerald-500/15 text-emerald-500"
                      : it.status === "pending"
                      ? "bg-amber-500/15 text-amber-500"
                      : "bg-primary/15 text-primary")
                  }
                >
                  {it.status}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


