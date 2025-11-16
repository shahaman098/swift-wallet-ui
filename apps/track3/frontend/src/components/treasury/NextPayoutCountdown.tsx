import { useEffect, useState } from "react";

export default function NextPayoutCountdown({
  lastRun,
  intervalSec
}: {
  lastRun: number;
  intervalSec: number;
}) {
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const next = lastRun + intervalSec;
  const remaining = Math.max(0, next - now);
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  return (
    <div className="border rounded-2xl p-4 bg-white">
      <div className="text-sm text-slate-600 mb-2">Next Payout</div>
      <div className="text-lg font-semibold">
        {h}h {m}m {s}s
      </div>
    </div>
  );
}


