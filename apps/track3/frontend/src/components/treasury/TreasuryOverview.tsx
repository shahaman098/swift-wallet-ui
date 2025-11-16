export default function TreasuryOverview({
  balance,
  allocations,
  lastStatus
}: {
  balance: number;
  allocations: { name: string; percent: number }[];
  lastStatus: string;
}) {
  return (
    <div className="border rounded-2xl p-4 bg-white">
      <div className="text-sm text-slate-600 mb-2">Treasury Overview</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-slate-500">USDC in Contract</div>
        <div className="font-semibold">{balance.toLocaleString()} USDC</div>
        <div className="text-slate-500">Allocations</div>
        <div className="font-semibold">
          {allocations.map((a) => a.name).join(", ")}
        </div>
        <div className="text-slate-500">Last Distribution</div>
        <div className="font-semibold">{lastStatus}</div>
      </div>
    </div>
  );
}


