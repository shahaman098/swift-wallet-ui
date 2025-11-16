export default function TreasuryEventLog({
  items
}: {
  items: { type: string; at: string; data?: any }[];
}) {
  return (
    <div className="border rounded-2xl p-4 bg-white">
      <div className="text-sm text-slate-600 mb-2">Treasury Events</div>
      <div className="space-y-2 max-h-64 overflow-auto text-xs">
        {items.length === 0 ? (
          <div className="text-slate-500">No events yet…</div>
        ) : (
          items.map((it, i) => (
            <div key={i} className="border rounded p-2 bg-slate-50">
              <div className="font-semibold">{it.type}</div>
              <div className="text-slate-500">{it.at}</div>
              {it.data && (
                <pre className="mt-1 whitespace-pre-wrap break-all">
                  {JSON.stringify(it.data, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}


