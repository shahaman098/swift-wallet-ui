export default function AllocationPieChart({
  data
}: {
  data: { name: string; value: number }[];
}) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  return (
    <div className="border rounded-2xl p-4 bg-white">
      <div className="text-sm text-slate-600 mb-2">Allocation Split</div>
      <div className="w-full h-4 rounded bg-slate-100 overflow-hidden flex">
        {data.map((d, i) => (
          <div
            key={d.name + i}
            className="h-4"
            style={{
              width: `${(d.value / total) * 100}%`,
              background:
                i % 3 === 0 ? '#60a5fa' : i % 3 === 1 ? '#34d399' : '#22d3ee'
            }}
            title={`${d.name}: ${d.value}%`}
          />
        ))}
      </div>
      <div className="mt-2 space-y-1">
        {data.map((d, i) => (
          <div key={d.name + 'l' + i} className="text-xs text-slate-600 flex items-center gap-2">
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
            <span>{d.name}</span>
            <span className="font-semibold">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}


