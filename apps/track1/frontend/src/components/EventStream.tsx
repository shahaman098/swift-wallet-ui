import { useEffect, useState } from "react";
import { publicClient } from "../lib/contract";
import { SmartPaySchedulerAbi } from "../abi/SmartPayScheduler";
import { Address } from "viem";

type Item = { type: string; data: any; at: string };

export default function EventStream({ contract }: { contract: Address }) {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    let unwatch: any;
    (async () => {
      try {
        unwatch = await publicClient.watchContractEvent({
          address: contract,
          abi: SmartPaySchedulerAbi as any,
          onLogs: (logs) => {
            const mapped: Item[] = logs.map((l: any) => ({
              type: String(l.eventName || l?.event || "Event"),
              data: l.args,
              at: new Date().toLocaleString()
            }));
            setItems((prev) => [...mapped, ...prev].slice(0, 50));
          }
        });
      } catch {
        // ignore
      }
    })();
    return () => {
      try {
        unwatch?.();
      } catch {
        // ignore
      }
    };
  }, [contract]);

  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-sm text-slate-600 mb-2">Event Stream</div>
      <div className="space-y-2 max-h-64 overflow-auto text-xs">
        {items.length === 0 ? (
          <div className="text-slate-500">No events yet…</div>
        ) : (
          items.map((it, i) => (
            <div key={i} className="border rounded p-2 bg-slate-50">
              <div className="font-semibold">{it.type}</div>
              <div className="text-slate-500">{it.at}</div>
              <pre className="mt-1 whitespace-pre-wrap break-all">
                {JSON.stringify(it.data, null, 2)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


