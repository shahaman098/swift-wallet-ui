export default function ConfigPreview({
  intervalSec,
  threshold,
  recipients
}: {
  intervalSec: number;
  threshold: string | number;
  recipients: { wallet: string; share: number }[];
}) {
  const total = recipients.reduce((a, b) => a + (b.share || 0), 0);
  return (
    <div className="border rounded-lg p-4 bg-white">
      <div className="text-sm text-slate-600 mb-2">Config Preview</div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="text-slate-500">Interval</div>
        <div className="font-semibold">{intervalSec}s</div>
        <div className="text-slate-500">Threshold</div>
        <div className="font-semibold">{String(threshold)} (USDC 6d)</div>
        <div className="text-slate-500">Recipients</div>
        <div className="font-semibold">{recipients.length}</div>
        <div className="text-slate-500">Allocated</div>
        <div className="font-semibold">{total}%</div>
      </div>
    </div>
  );
}


