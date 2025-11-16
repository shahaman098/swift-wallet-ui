import { useMemo } from "react";

export default function DistributionTimeline({
  lastRun,
  intervalSec
}: {
  lastRun: number;
  intervalSec: number;
}) {
  const now = Date.now() / 1000;
  const next = lastRun + intervalSec;
  const pct = useMemo(() => {
    if (!lastRun || !intervalSec) return 0;
    const elapsed = Math.max(0, now - lastRun);
    return Math.min(100, (elapsed / intervalSec) * 100);
  }, [now, lastRun, intervalSec]);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-sm text-slate-600 mb-2">Distribution Timeline</div>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
        <span>Last: {new Date(lastRun * 1000).toLocaleString()}</span>
        <span>Next: {new Date(next * 1000).toLocaleString()}</span>
      </div>
      <div className="w-full h-2 rounded bg-slate-100 overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-sky-400 to-teal-400 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}


