import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";

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
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast({
        title: "Money added successfully",
        description: `$${parseFloat(amount).toFixed(2)} has been added to your account.`,
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen premium-gradient relative overflow-hidden">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
        
        {/* Arc-themed background - visible in dark mode */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none">
          <div className="absolute inset-0">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/30 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        </div>
        
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-md relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Card className="liquid-glass-premium hover-lift text-center overflow-hidden border-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
              <CardContent className="pt-16 pb-12 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1, rotate: 360 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-24 h-24 bg-gradient-to-br from-[#3CF276] to-[#2AB55E] rounded-full flex items-center justify-center mb-6 shadow-xl"
                >
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-[#3CF276] to-[#2AB55E] bg-clip-text text-transparent">
                    Money Added!
                  </h2>
                  <div className="space-y-2 mb-6">
                    <p className="text-5xl font-bold text-foreground">
                      ${parseFloat(amount).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">has been added to your account</p>
                  </div>
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
    <div className="min-h-screen premium-gradient relative overflow-hidden">
      {/* Arc-themed background - visible in dark mode */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none">
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>
      
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl relative z-10">
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
          transition={{ duration: 0.5 }}
        >
          <Card className="liquid-glass-premium hover-lift shimmer border-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
            <CardHeader className="relative">
              <CardTitle className="text-3xl font-bold text-arc-gradient">
                Add Money
              </CardTitle>
              <CardDescription className="text-base">Deposit funds to your account instantly</CardDescription>
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
                    <div className="grid grid-cols-2 gap-3">
                      {quickAmounts.map((quickAmount) => (
                        <motion.button
                          key={quickAmount}
                          type="button"
                          onClick={() => setAmount(quickAmount.toString())}
                          whileHover={{ scale: 1.05, y: -4 }}
                          whileTap={{ scale: 0.95 }}
                          className="liquid-glass hover-lift ripple-effect px-6 py-4 rounded-xl border border-border/30 hover:border-primary/50 hover:bg-primary/10 transition-all font-semibold text-foreground"
                        >
                          ${quickAmount}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-14 text-lg font-semibold arc-gradient hover-lift ripple-effect shadow-xl border-0 text-white"
                >
                  {loading ? <Loading text="" /> : "Add Money"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default AddMoney;
