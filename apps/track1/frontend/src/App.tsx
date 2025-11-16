import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import DeployContract from "./pages/DeployContract";
import Recipients from "./pages/Recipients";
import Distribution from "./pages/Distribution";
import Events from "./pages/Events";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <nav className="border-b bg-white">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="font-bold">SmartPay Scheduler</Link>
            <div className="flex gap-3 text-sm">
              <Link to="/deploy">Deploy</Link>
              <Link to="/recipients">Recipients</Link>
              <Link to="/distribution">Distribution</Link>
              <Link to="/events">Events</Link>
            </div>
          </div>
        </nav>
        <main className="max-w-5xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/deploy" element={<DeployContract />} />
            <Route path="/recipients" element={<Recipients />} />
            <Route path="/distribution" element={<Distribution />} />
            <Route path="/events" element={<Events />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}


