import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">SmartPay Scheduler</h1>
        <p className="text-slate-600">
          Advanced programmable stablecoin contract on Arc Testnet. Supports multi-recipient allocations,
          time-based and threshold-based automation, and rich event telemetry.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/deploy" className="border rounded-lg p-4 bg-white hover:shadow">
          <h3 className="font-semibold">Deploy Contract</h3>
          <p className="text-sm text-slate-600">Set interval and threshold, deploy to Arc testnet.</p>
        </Link>
        <Link to="/recipients" className="border rounded-lg p-4 bg-white hover:shadow">
          <h3 className="font-semibold">Manage Recipients</h3>
          <p className="text-sm text-slate-600">Add, update, remove and list recipients with % allocations.</p>
        </Link>
        <Link to="/distribution" className="border rounded-lg p-4 bg-white hover:shadow">
          <h3 className="font-semibold">Execute Distribution</h3>
          <p className="text-sm text-slate-600">Check eligibility and run distributions when conditions are met.</p>
        </Link>
        <Link to="/events" className="border rounded-lg p-4 bg-white hover:shadow">
          <h3 className="font-semibold">View Events</h3>
          <p className="text-sm text-slate-600">Explore deposits, recipient changes and executed distributions.</p>
        </Link>
      </div>
    </div>
  );
}


