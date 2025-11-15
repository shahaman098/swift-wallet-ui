import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddMoney from "./pages/AddMoney";
import SendPayment from "./pages/SendPayment";
import SplitPayment from "./pages/SplitPayment";
import RequestPayment from "./pages/RequestPayment";
import PaymentRequestView from "./pages/PaymentRequestView";
import TreasuryDashboard from "./pages/TreasuryDashboard";
import CreateOrg from "./pages/CreateOrg";
import CreateDepartment from "./pages/CreateDepartment";
import TreasuryRules from "./pages/TreasuryRules";
import TreasuryAutomation from "./pages/TreasuryAutomation";
import TreasuryAnalytics from "./pages/TreasuryAnalytics";
import TransactionHistory from "./pages/TransactionHistory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-money" element={<AddMoney />} />
          <Route path="/send-payment" element={<SendPayment />} />
          <Route path="/split-payment" element={<SplitPayment />} />
          <Route path="/request-payment" element={<RequestPayment />} />
          <Route path="/pay/:requestId" element={<PaymentRequestView />} />
          <Route path="/treasury" element={<TreasuryDashboard />} />
          <Route path="/treasury/create-org" element={<CreateOrg />} />
          <Route path="/treasury/create-department" element={<CreateDepartment />} />
          <Route path="/treasury/rules" element={<TreasuryRules />} />
          <Route path="/treasury/automation" element={<TreasuryAutomation />} />
          <Route path="/treasury/analytics" element={<TreasuryAnalytics />} />
          <Route path="/transactions" element={<TransactionHistory />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
