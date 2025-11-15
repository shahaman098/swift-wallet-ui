import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import ArcFinalityAnimation from "@/components/ArcFinalityAnimation";
import { ArrowLeft, CheckCircle2, Sparkles, Network } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { walletAPI } from "@/api/client";

const AddMoney = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  const quickAmounts = [50, 100, 250, 500];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const depositAmount = parseFloat(amount);
    if (!amount || depositAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await walletAPI.deposit({ 
        amount: depositAmount,
        note: `Deposit of $${depositAmount.toFixed(2)}`
      });
      
      setLoading(false);
      setSuccess(true);
      toast({
        title: "Money added successfully",
        description: `$${depositAmount.toFixed(2)} has been added to your account. Your new balance is $${response.data.balance.toFixed(2)}.`,
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
        "Unable to add money. Please try again.";

      toast({
        title: "Deposit failed",
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
            <Card className="liquid-glass-premium border-0 shadow-2xl text-center overflow-hidden">
              <CardContent className="pt-8 pb-12 relative">
                <ArcFinalityAnimation />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8"
                >
                  <h2 className="text-3xl font-bold mb-3 text-arc-gradient">
                    Money Added!
                  </h2>
                  <div className="space-y-2 mb-6">
                    <p className="text-5xl font-bold text-foreground">
                      ${parseFloat(amount).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">has been added to your account</p>
                  </div>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    className="mt-4 px-8"
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
            <CardHeader className="relative border-b border-white/10 bg-gradient-to-br from-success/5 to-transparent">
              <CardTitle className="text-3xl font-bold text-arc-gradient flex items-center gap-2">
                <Network className="h-8 w-8" />
                Add Money
              </CardTitle>
              <CardDescription className="text-base">Deposit funds via CCTP instantly</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <InputField
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={setAmount}
                    required
                  />

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Quick amounts</p>
                    <div className="grid grid-cols-4 gap-3">
                      {quickAmounts.map((quickAmount) => (
                        <motion.div key={quickAmount} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setAmount(quickAmount.toString())}
                            className="h-14 w-full font-bold border-2 hover:border-primary hover:bg-primary/10"
                          >
                            ${quickAmount}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <Card className="bg-gradient-to-br from-muted/50 to-muted/30 border-0">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deposit amount</span>
                      <span className="font-bold">
                        ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing fee</span>
                      <span className="font-bold text-[#3CF276]">Free</span>
                    </div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between font-bold text-lg">
                      <span>You'll receive</span>
                      <span className="text-[#3CF276]">${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
                    </div>
                  </CardContent>
                </Card>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#3CF276] to-[#2AB55E] hover:from-[#2AB55E] hover:to-[#3CF276] border-0 shadow-xl"
                    disabled={loading}
                  >
                    {loading ? <Loading text="" /> : "Add Money"}
                  </Button>
                </motion.div>

                <p className="text-xs text-center text-muted-foreground">
                  💡 Funds will be available instantly in your account
                </p>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AddMoney;
