import { useState, useEffect } from "react";
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
import { walletAPI } from "@/api/client";

const PaymentRequestView = () => {
  const { requestId } = useParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  const [requestData, setRequestData] = useState({
    amount: 150.00,
    note: "Dinner split from last night",
    requestedBy: "John Smith",
    requestedByEmail: "john@example.com",
  });

  useEffect(() => {
    // In production, fetch payment request from API using requestId
    // For now, using mock data
  }, [requestId]);

  const handlePayment = async () => {
    setLoading(true);

    try {
      // Send payment to requester
      const response = await walletAPI.send({
        recipient: requestData.requestedByEmail,
        amount: requestData.amount,
        note: requestData.note || `Payment for request ${requestId}`
      });

      setLoading(false);
      setSuccess(true);
      
      toast({
        title: "Payment sent",
        description: `$${requestData.amount.toFixed(2)} sent to ${requestData.requestedBy}. New balance: $${response.data.newBalance.toFixed(2)}`,
      });
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Failed to send payment",
        description: error.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

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
                      ${requestData.amount.toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">sent to</p>
                    <p className="font-bold text-xl text-foreground">
                      {requestData.requestedBy}
                    </p>
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
                    {requestData.requestedBy}
                  </p>
                  <p className="text-muted-foreground">{requestData.requestedByEmail}</p>
                </div>

                {/* Amount */}
                <div className="liquid-glass-premium p-8 rounded-2xl text-center space-y-2">
                  <p className="text-muted-foreground font-semibold">Amount</p>
                  <p className="text-6xl font-bold text-gradient">
                    ${requestData.amount.toFixed(2)}
                  </p>
                </div>

                {/* Note */}
                {requestData.note && (
                  <div className="liquid-glass p-6 rounded-2xl">
                    <p className="text-sm text-muted-foreground font-semibold mb-2">
                      Note
                    </p>
                    <p className="text-foreground text-lg">{requestData.note}</p>
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
                    disabled={loading}
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
                    ) : (
                      <>
                        <DollarSign className="h-5 w-5 mr-2" />
                        Pay ${requestData.amount.toFixed(2)}
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
