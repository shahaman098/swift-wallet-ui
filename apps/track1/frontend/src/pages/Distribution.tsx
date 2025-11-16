import { useState } from "react";
import DistributionTimeline from "../components/DistributionTimeline";
import NextRunCountdown from "../components/NextRunCountdown";
import EventStream from "../components/EventStream";

export default function Distribution() {
  const [contract, setContract] = useState<string>("");
  const [lastRun, setLastRun] = useState<number>(Math.floor(Date.now() / 1000) - 1800);
  const [intervalSec, setIntervalSec] = useState<number>(3600);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Execute Distribution</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="border rounded p-3 bg-white">
          <label className="text-sm font-medium">Contract Address</label>
          <input className="mt-1 w-full border rounded px-2 py-1" value={contract} onChange={(e) => setContract(e.target.value)} placeholder="0x..." />
        </div>
      </div>

      <p className="text-sm text-slate-600">
        Check eligibility and execute via Hardhat script:
      </p>
      <pre className="p-3 bg-slate-100 rounded text-sm overflow-auto">
        {`CONTRACT_ADDRESS=${contract}\n\nnpx hardhat run scripts/executeDistribution.ts --network arc`}
      </pre>

      <p className="text-sm text-slate-600">Fund the contract with USDC (6 decimals):</p>
      <pre className="p-3 bg-slate-100 rounded text-sm overflow-auto">
        {`CONTRACT_ADDRESS=${contract}\nFUND_AMOUNT=5.0\n\nnpx hardhat run scripts/fundContract.ts --network arc`}
      </pre>

      {/* UI-only enhancements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timeline and countdown expect interval + lastRun, which would be read in a real integration.
            For hackathon UI we allow manual entry for preview. */}
        <div className="space-y-3">
          <div className="border rounded p-3 bg-white">
            <label className="text-sm font-medium">Last Run (epoch seconds)</label>
            <input className="mt-1 w-full border rounded px-2 py-1" placeholder="e.g. 1710000000" value={lastRun} onChange={(e)=> setLastRun(Number(e.target.value))} />
          </div>
          <div className="border rounded p-3 bg-white">
            <label className="text-sm font-medium">Interval (seconds)</label>
            <input className="mt-1 w-full border rounded px-2 py-1" placeholder="e.g. 3600" value={intervalSec} onChange={(e)=> setIntervalSec(Number(e.target.value))} />
          </div>
          <DistributionTimeline lastRun={lastRun} intervalSec={intervalSec} />
          <NextRunCountdown lastRun={lastRun} intervalSec={intervalSec} />
        </div>
        <div className="space-y-3">
          {/* Placeholders; in a full wiring we’d read from contract and pass real numbers */}
          <div className="text-sm text-slate-500">
            Use the Recipients page to configure allocations. This page focuses on execution and timing visuals.
          </div>
          {contract && <EventStream contract={contract as any} />}
        </div>
      </div>
    </div>
  );
}


