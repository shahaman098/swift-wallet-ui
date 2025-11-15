import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import ArcFinalityAnimation from "@/components/ArcFinalityAnimation";
import ChainSelector from "@/components/ChainSelector";
import { ArrowLeft, CheckCircle2, Sparkles, Network, Copy, Check } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { circleAPI } from "@/api/client";

const AddMoney = () => {
  const [amount, setAmount] = useState("");
  const [blockchain, setBlockchain] = useState("ETH-SEPOLIA");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [depositAddress, setDepositAddress] = useState("");
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  const quickAmounts = [50, 100, 250, 500];

  useEffect(() => {
    // Ensure wallet exists on mount
    const ensureWallet = async () => {
      try {
        await circleAPI.createWallet();
      } catch (error) {
        // Wallet might already exist, that's okay
      }
    };
    ensureWallet();
  }, []);

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

    try {
      // Ensure wallet exists
      try {
        await circleAPI.createWallet();
      } catch (error) {
        // Wallet might already exist
      }

      // Create deposit address via Circle
      const response = await circleAPI.deposit({
        amount: parseFloat(amount),
        blockchain,
      });

      setDepositAddress(response.data.depositAddress);
      setSuccess(true);
      
      toast({
        title: "Deposit address created",
        description: "Send USDC to the address below. Your balance will update once confirmed.",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to create deposit address";
      toast({
        title: "Deposit failed",
        description: errorMessage,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Deposit address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
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
                    Deposit Address Ready!
                  </h2>
                  <div className="space-y-4 mb-6">
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Send USDC to:</p>
                      <div className="bg-muted/50 rounded-lg p-4 flex items-center gap-2">
                        <code className="flex-1 text-xs break-all text-left">
                          {depositAddress}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={copyToClipboard}
                          className="shrink-0"
                        >
                          {copied ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Amount: <span className="font-bold text-foreground">${parseFloat(amount).toFixed(2)} USDC</span></p>
                      <p>Network: <span className="font-bold text-foreground">{blockchain}</span></p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your balance will update automatically once the transaction is confirmed on the blockchain.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="flex-1"
                      size="lg"
                    >
                      Back to Dashboard
                    </Button>
                    <Button
                      onClick={() => {
                        setSuccess(false);
                        setDepositAddress("");
                        setAmount("");
                      }}
                      variant="outline"
                      className="flex-1"
                      size="lg"
                    >
                      New Deposit
                    </Button>
                  </div>
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
              <CardDescription className="text-base">Deposit USDC via Circle CCTP</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-5">
                  <ChainSelector
                    value={blockchain}
                    onChange={setBlockchain}
                    label="Blockchain Network"
                  />

                  <InputField
                    label="Amount (USDC)"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={setAmount}
                    required
                    step="0.01"
                    min="0.01"
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
