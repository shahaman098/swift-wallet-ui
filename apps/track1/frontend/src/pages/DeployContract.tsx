import { useState } from "react";
import { publicClient } from "../lib/contract";
import { parseAbi } from "viem";

export default function DeployContract() {
  const [usdc, setUsdc] = useState<string>(import.meta.env.VITE_ARC_USDC_ADDRESS || "");
  const [interval, setInterval] = useState<number>(3600);
  const [threshold, setThreshold] = useState<string>("1000000"); // 1 USDC (6 decimals)
  const [status, setStatus] = useState<string>("");

  const handleInfo = async () => {
    setStatus("This page is informational. Use Hardhat script to deploy (scripts/deploy.ts).");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Deploy Contract</h2>
      <p className="text-sm text-slate-600">
        Deployment is handled by Hardhat to ensure proper bytecode and configuration. Fill the fields for reference and run:
      </p>
      <pre className="p-3 bg-slate-100 rounded text-sm overflow-auto">
        {`npx hardhat run scripts/deploy.ts --network arc`}
      </pre>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="border rounded p-3 bg-white">
          <label className="text-sm font-medium">USDC Address</label>
          <input className="mt-1 w-full border rounded px-2 py-1" value={usdc} onChange={(e) => setUsdc(e.target.value)} />
        </div>
        <div className="border rounded p-3 bg-white">
          <label className="text-sm font-medium">Distribution Interval (sec)</label>
          <input type="number" className="mt-1 w-full border rounded px-2 py-1" value={interval} onChange={(e) => setInterval(Number(e.target.value))} />
        </div>
        <div className="border rounded p-3 bg-white">
          <label className="text-sm font-medium">Threshold (USDC 6d)</label>
          <input className="mt-1 w-full border rounded px-2 py-1" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
        </div>
      </div>

      <button onClick={handleInfo} className="px-4 py-2 bg-black text-white rounded hover:bg-slate-800">
        Acknowledge & Show Deploy Command
      </button>

      {status && <p className="text-sm text-slate-700">{status}</p>}
    </div>
  );
}


