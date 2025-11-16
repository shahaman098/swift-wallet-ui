export default function AllocationChart({
  recipients
}: {
  recipients: { wallet: string; share: number }[];
}) {
  const total = recipients.reduce((a, b) => a + (b.share || 0), 0);
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-sm text-slate-600 mb-2">Allocations</div>
      <div className="w-full h-4 rounded bg-slate-100 overflow-hidden flex">
        {recipients.map((r, i) => (
          <div
            key={r.wallet + i}
            className="h-4"
            title={`${r.wallet} — ${r.share}%`}
            style={{
              width: `${(r.share / Math.max(1, total)) * 100}%`,
              background:
                i % 3 === 0
                  ? '#60a5fa'
                  : i % 3 === 1
                  ? '#34d399'
                  : '#22d3ee'
            }}
          />
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {recipients.map((r, i) => (
          <div key={r.wallet + 'l' + i} className="text-xs text-slate-600 flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded"
              style={{
                background:
                  i % 3 === 0
                    ? '#60a5fa'
                    : i % 3 === 1
                    ? '#34d399'
                    : '#22d3ee'
              }}
            />
            <span className="break-all">{r.wallet}</span>
            <span className="font-semibold">{r.share}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}


