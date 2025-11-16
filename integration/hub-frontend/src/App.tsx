import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ProtectedRoute from "@/components/ProtectedRoute";
import AddMoney from "@/pages/AddMoney";
import Dashboard from "@/pages/Dashboard";
import UnifiedDashboard from "@/pages/UnifiedDashboard";
import Wallet from "@/pages/Wallet";
import CrossChainBridge from "@/pages/CrossChainBridge";
import TreasuryAutomation from "@/pages/TreasuryAutomation";
import SmartContractsPlayground from "@/pages/SmartContractsPlayground";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import PaymentRequestView from "@/pages/PaymentRequestView";
import RequestPayment from "@/pages/RequestPayment";
import SendPayment from "@/pages/SendPayment";
import Signup from "@/pages/Signup";
import SplitPayment from "@/pages/SplitPayment";
import TreasuryBrain from "@/pages/TreasuryBrain";
import FeatureEmbed from "@/pages/FeatureEmbed";
import Welcome from "@/pages/Welcome";
import { AuthProvider } from "@/context/AuthProvider";
import { TreasuryProvider } from "@/context/TreasuryProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes, useParams } from "react-router-dom";
import GlassBackground from "@/components/GlassBackground";

const queryClient = new QueryClient();

const LegacyPayRedirect = () => {
  const { requestId } = useParams();
  return <Navigate to={`/request/${requestId ?? ""}`} replace />;
};

const LegacyRequestRedirect = () => <Navigate to="/request" replace />;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TreasuryProvider>
        <TooltipProvider>
          <GlassBackground />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Welcome landing route with auth-aware redirect handled inside <Welcome /> */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/unified"
                element={
                  <ProtectedRoute>
                    <UnifiedDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/bridge"
                element={
                  <ProtectedRoute>
                    <CrossChainBridge />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/treasury-automation"
                element={
                  <ProtectedRoute>
                    <TreasuryAutomation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/playground"
                element={
                  <ProtectedRoute>
                    <SmartContractsPlayground />
                  </ProtectedRoute>
                }
              />
              {/* Feature Embed Route */}
              <Route
                path="/feature"
                element={
                  <ProtectedRoute>
                    <FeatureEmbed />
                  </ProtectedRoute>
                }
              />
              {/* Quick access routes for features */}
              <Route
                path="/bridge"
                element={
                  <ProtectedRoute>
                    <Navigate to="/feature?app=bridge" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contracts"
                element={
                  <ProtectedRoute>
                    <Navigate to="/feature?app=contracts" replace />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/treasury"
                element={
                  <ProtectedRoute>
                    <TreasuryBrain />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add-money"
                element={
                  <ProtectedRoute>
                    <AddMoney />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/send-payment"
                element={
                  <ProtectedRoute>
                    <SendPayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/split-payment"
                element={
                  <ProtectedRoute>
                    <SplitPayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/request"
                element={
                  <ProtectedRoute>
                    <RequestPayment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/request/:requestId"
                element={
                  <ProtectedRoute>
                    <PaymentRequestView />
                  </ProtectedRoute>
                }
              />
              <Route path="/request-payment" element={<LegacyRequestRedirect />} />
              <Route path="/pay/:requestId" element={<LegacyPayRedirect />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TreasuryProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
