import { useState } from "react";
import AllocationChart from "../components/AllocationChart";
import ConfigPreview from "../components/ConfigPreview";

export default function Recipients() {
  const [contract, setContract] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [share, setShare] = useState<number>(0);
  const [intervalSec, setIntervalSec] = useState<number>(3600);
  const [threshold, setThreshold] = useState<string>("1000000");
  const [recipients, setRecipients] = useState<{ wallet: string; share: number }[]>([]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Recipients</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <label className="text-sm font-medium">Contract Address</label>
          <input className="mt-1 w-full border rounded px-2 py-1" value={contract} onChange={(e) => setContract(e.target.value)} placeholder="0x..." />
        </div>
        <div className="border rounded p-3 bg-white">
          <label className="text-sm font-medium">Recipient Address</label>
          <input className="mt-1 w-full border rounded px-2 py-1" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="0x..." />
        </div>
        <div className="border rounded p-3 bg-white">
          <label className="text-sm font-medium">% Share</label>
          <input type="number" className="mt-1 w-full border rounded px-2 py-1" value={share} onChange={(e) => setShare(Number(e.target.value))} />
        </div>
      </div>

      <p className="text-sm text-slate-600">
        Use Hardhat script to add a recipient:
      </p>
      <pre className="p-3 bg-slate-100 rounded text-sm overflow-auto">
        {`CONTRACT_ADDRESS=${contract}\nRECIPIENT_WALLET=${address}\nRECIPIENT_SHARE=${share}\n\nnpx hardhat run scripts/addRecipient.ts --network arc`}
      </pre>

      {/* UI-only: preview and charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="border rounded p-3 bg-white">
            <div className="text-sm font-medium mb-2">Local Preview (no write)</div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-slate-500">Interval (sec)</div>
              <input className="border rounded px-2 py-1" value={intervalSec} onChange={(e) => setIntervalSec(Number(e.target.value))} />
              <div className="text-slate-500">Threshold (USDC 6d)</div>
              <input className="border rounded px-2 py-1" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
            </div>
            <div className="mt-3 text-xs text-slate-500">
              Adjust values locally for visualization only. Use scripts to set real config on-chain.
            </div>
          </div>
          <ConfigPreview intervalSec={intervalSec} threshold={threshold} recipients={recipients} />
        </div>
        <div className="space-y-3">
          <AllocationChart recipients={recipients} />
          <div className="border rounded p-3 bg-white">
            <div className="text-sm font-medium mb-2">Add to Local Preview</div>
            <div className="grid grid-cols-3 gap-2">
              <input className="border rounded px-2 py-1 col-span-2" placeholder="0xrecipient…" value={address} onChange={(e) => setAddress(e.target.value)} />
              <input className="border rounded px-2 py-1" type="number" placeholder="%" value={share} onChange={(e) => setShare(Number(e.target.value))} />
            </div>
            <button
              className="mt-2 px-3 py-1 border rounded bg-slate-800 text-white text-sm"
              onClick={() => {
                if (!address || !share) return;
                setRecipients((prev) => [...prev, { wallet: address, share }]);
                setAddress("");
                setShare(0);
              }}
            >
              Add to Chart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


