import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import ArcFinalityAnimation from "@/components/ArcFinalityAnimation";
import { ArrowLeft, CheckCircle2, Sparkles, Send as SendIcon } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { walletAPI } from "@/api/client";

const SendPayment = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const sendAmount = parseFloat(amount);
    if (!amount || sendAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    if (!recipient) {
      toast({
        title: "Recipient required",
        description: "Please enter a recipient email or username.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await walletAPI.send({
        amount: sendAmount,
        recipient: recipient.trim(),
        note: note.trim() || undefined,
      });
      
      setLoading(false);
      setSuccess(true);
      toast({
        title: "Payment sent",
        description: `$${sendAmount.toFixed(2)} sent to ${recipient}. Your new balance is $${response.data.balance.toFixed(2)}.`,
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    } catch (error) {
      setLoading(false);
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      const description =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Unable to send payment. Please try again.";

      toast({
        title: "Payment failed",
        description,
        variant: "destructive",
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Card className="backdrop-blur-sm bg-card/80 border-0 shadow-2xl text-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[#4A44F2]/10 via-transparent to-[#31D2F7]/10" />
              <CardContent className="pt-16 pb-12 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-24 h-24 bg-gradient-to-br from-[#4A44F2] to-[#31D2F7] rounded-full flex items-center justify-center mb-6 shadow-xl"
                >
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#4A44F2] to-[#31D2F7] bg-clip-text text-transparent">
                    Payment Sent!
                  </h2>
                  <div className="space-y-2 mb-4">
                    <p className="text-5xl font-bold text-foreground">
                      ${parseFloat(amount).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">sent to</p>
                    <p className="font-bold text-xl text-foreground">{recipient}</p>
                  </div>
                  {note && (
                    <div className="bg-muted/50 rounded-xl p-4 mb-6">
                      <p className="text-sm text-muted-foreground mb-1">Note:</p>
                      <p className="font-medium">{note}</p>
                    </div>
                  )}
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>Redirecting to dashboard...</span>
                  </motion.div>
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
      
      <main className="container mx-auto px-4 py-8 max-w-md">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="liquid-glass-premium border-0 shadow-2xl overflow-hidden hover-lift shimmer">
            <CardHeader className="relative border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
              <CardTitle className="text-3xl font-bold text-arc-gradient flex items-center gap-2">
                <SendIcon className="h-8 w-8" />
                Send Payment
              </CardTitle>
              <CardDescription className="text-base">Transfer money via Gateway instantly</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <InputField
                    label="Recipient"
                    placeholder="Email or username"
                    value={recipient}
                    onChange={setRecipient}
                    required
                  />

                  <InputField
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={setAmount}
                    required
                  />

                  <InputField
                    label="Note (Optional)"
                    placeholder="What's this for?"
                    value={note}
                    onChange={setNote}
                  />
                </div>

                <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-0">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Send amount</span>
                      <span className="font-bold">
                        ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Transfer fee</span>
                      <span className="font-bold text-[#3CF276]">Free</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-primary">${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
                    </div>
                  </CardContent>
                </Card>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#4A44F2] to-[#31D2F7] hover:from-[#31D2F7] hover:to-[#4A44F2] border-0 shadow-xl"
                    disabled={loading}
                  >
                    {loading ? <Loading text="" /> : "Send Payment"}
                  </Button>
                </motion.div>

                <p className="text-xs text-center text-muted-foreground">
                  💡 Payment will be sent instantly
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default SendPayment;
