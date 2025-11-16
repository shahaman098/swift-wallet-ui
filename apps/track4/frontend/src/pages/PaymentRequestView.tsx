import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { DollarSign, User } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import ArcFinalityAnimation from "@/components/ArcFinalityAnimation";
import { requestAPI } from "@/api/requests";
import Loading from "@/components/Loading";
import { useAuth } from "@/context/AuthProvider";

const PaymentRequestView = () => {
  const { requestId } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [request, setRequest] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();
  const { userId } = useAuth();

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) {
        setInitializing(false);
        return;
      }
      try {
        const { data } = await requestAPI.get(requestId);
        setRequest(data?.request);
        setCreator(data?.creator);
      } catch (error) {
        console.error("Failed to load request:", error);
        toast({
          title: "Invalid request",
          description: "This payment link is no longer available.",
          variant: "destructive",
        });
      } finally {
        setInitializing(false);
      }
    };
    fetchRequest();
  }, [requestId, toast]);

  const isCreator = useMemo(
    () => request && userId && request.creatorUserId === userId,
    [request, userId],
  );
  const isPaid = request?.status === "paid";
  const amountDisplay = request ? parseFloat(request.amount).toFixed(2) : "0.00";

  const handlePayment = async () => {
    if (!requestId || isCreator || isPaid) return;
    try {
      setLoading(true);
      const { data } = await requestAPI.pay(requestId);
      setTxHash(data?.txHash ?? null);
      setSuccess(true);
      toast({
        title: "Payment sent",
        description: `Paid $${amountDisplay} to ${creator?.name ?? creator?.email ?? "requester"}`,
      });
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Payment failed:", error);
      toast({
        title: "Payment failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl flex justify-center">
          <Loading text="Loading request..." />
        </main>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl text-center space-y-4">
          <h1 className="text-3xl font-bold">Request not found</h1>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </main>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Card className="liquid-glass-premium border-0 shadow-2xl text-center overflow-hidden">
              <CardContent className="pt-8 pb-12">
                <ArcFinalityAnimation />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <h2 className="text-3xl font-bold mb-3 text-arc-gradient">
                    Payment Complete!
                  </h2>
                  <div className="space-y-2 mb-6">
                    <p className="text-5xl font-bold text-foreground">
                      ${amountDisplay}
                    </p>
                    <p className="text-muted-foreground">sent to</p>
                    <p className="font-bold text-xl text-foreground">
                      {creator?.name ?? creator?.email}
                    </p>
                    {txHash && (
                      <p className="text-xs break-all text-muted-foreground">Tx Hash: {txHash}</p>
                    )}
                  </div>

                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="mt-8 px-8"
                    size="lg"
                  >
                    Back to Dashboard
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center mb-4 shadow-glow"
            >
              <DollarSign className="h-10 w-10 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold text-arc-gradient mb-2">
              Payment Request
            </h1>
            <p className="text-muted-foreground">
              Request ID: {requestId}
            </p>
          </div>

          <Card className="liquid-glass-premium border-0 shadow-xl hover-lift">
            <CardContent className="pt-8 pb-8">
              <div className="space-y-6">
                {/* Requested By */}
                <div className="liquid-glass p-6 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground mb-3">
                    <User className="h-5 w-5" />
                    <span className="text-sm font-semibold">Requested by</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {creator?.name ?? "Unknown"}
                  </p>
                  <p className="text-muted-foreground">{creator?.email}</p>
                </div>

                {/* Amount */}
                <div className="liquid-glass-premium p-8 rounded-2xl text-center space-y-2">
                  <p className="text-muted-foreground font-semibold">Amount</p>
                  <p className="text-6xl font-bold text-gradient">
                    ${amountDisplay}
                  </p>
                  <p className="text-sm uppercase tracking-wide text-muted-foreground">
                    Status: {request.status}
                  </p>
                </div>

                {/* Note */}
                {request.description && (
                  <div className="liquid-glass p-6 rounded-2xl">
                    <p className="text-sm text-muted-foreground font-semibold mb-2">
                      Note
                    </p>
                    <p className="text-foreground text-lg">{request.description}</p>
                  </div>
                )}

                {/* Notices */}
                {(isPaid || isCreator) && (
                  <div className="text-center text-sm text-muted-foreground bg-black/5 rounded-xl py-3">
                    {isPaid
                      ? "This request has already been paid."
                      : "You created this request and cannot pay it."}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handlePayment}
                    size="lg"
                    className="flex-1 h-14 text-lg ripple-effect"
                    disabled={loading || isCreator || isPaid}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="flex items-center gap-2"
                      >
                        <DollarSign className="h-5 w-5" />
                        <span>Processing...</span>
                      </motion.div>
                    ) : isPaid ? (
                      "Already paid"
                    ) : isCreator ? (
                      "You created this request"
                    ) : (
                      <>
                        <DollarSign className="h-5 w-5 mr-2" />
                        Pay ${amountDisplay}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default PaymentRequestView;
