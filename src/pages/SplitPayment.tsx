import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { ArrowLeft, UserPlus, Users, X, CheckCircle2, Percent } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import ArcFinalityAnimation from "@/components/ArcFinalityAnimation";
import { walletAPI } from "@/api/client";

interface Participant {
  id: string;
  name: string;
  amount: number;
}

const SplitPayment = () => {
  const [totalAmount, setTotalAmount] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([
    { id: "1", name: "", amount: 0 },
  ]);
  const [splitMode, setSplitMode] = useState<"equal" | "custom">("equal");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now().toString(), name: "", amount: 0 },
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((p) => p.id !== id));
    }
  };

  const updateParticipantName = (id: string, name: string) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, name } : p))
    );
  };

  const updateParticipantAmount = (id: string, amount: number) => {
    setParticipants(
      participants.map((p) => (p.id === id ? { ...p, amount } : p))
    );
  };

  const calculateSplit = () => {
    const total = parseFloat(totalAmount);
    if (splitMode === "equal") {
      const splitAmount = total / participants.length;
      return participants.map((p) => ({ ...p, amount: splitAmount }));
    }
    return participants;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid total amount.",
        variant: "destructive",
      });
      return;
    }

    const emptyNames = participants.filter((p) => !p.name.trim());
    if (emptyNames.length > 0) {
      toast({
        title: "Missing participant names",
        description: "Please enter names for all participants.",
        variant: "destructive",
      });
      return;
    }

    if (splitMode === "custom") {
      const customTotal = participants.reduce((sum, p) => sum + p.amount, 0);
      if (Math.abs(customTotal - parseFloat(totalAmount)) > 0.01) {
        toast({
          title: "Amounts don't match",
          description: `Custom amounts total $${customTotal.toFixed(
            2
          )}, but bill is $${parseFloat(totalAmount).toFixed(2)}`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Send payments to each participant
      const splitParticipants = calculateSplit();
      const paymentPromises = splitParticipants.map(participant =>
        walletAPI.send({
          recipient: participant.name,
          amount: participant.amount,
          note: `Split payment: ${participant.amount.toFixed(2)} of ${totalAmount}`
        })
      );

      await Promise.all(paymentPromises);
      
      setLoading(false);
      setSuccess(true);
      
      toast({
        title: "Split payment sent",
        description: `$${parseFloat(totalAmount).toFixed(2)} split between ${participants.length} people`,
      });
    } catch (error: any) {
      setLoading(false);
      toast({
        title: "Failed to send split payment",
        description: error.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (success) {
    const splitParticipants = calculateSplit();
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
              <CardContent className="pt-8 pb-12 relative">
                <ArcFinalityAnimation />
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8"
                >
                  <h2 className="text-3xl font-bold mb-3 text-arc-gradient">
                    Split Payment Sent!
                  </h2>
                  <div className="space-y-4 mb-6">
                    <p className="text-5xl font-bold text-foreground">
                      ${parseFloat(totalAmount).toFixed(2)}
                    </p>
                    <p className="text-muted-foreground">split between {participants.length} people</p>
                  </div>

                  <div className="space-y-3 max-w-md mx-auto">
                    {splitParticipants.map((participant) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="liquid-glass flex items-center justify-between p-4 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {participant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-semibold">{participant.name}</span>
                        </div>
                        <span className="text-xl font-bold text-primary">
                          ${participant.amount.toFixed(2)}
                        </span>
                      </motion.div>
                    ))}
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
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-6 gap-2 hover-lift"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-arc-gradient mb-2 flex items-center gap-3">
              <Users className="h-10 w-10" />
              Split Payment
            </h1>
            <p className="text-muted-foreground text-lg">
              Split a bill fairly among multiple people
            </p>
          </div>

          <Card className="liquid-glass-premium border-0 shadow-xl hover-lift shimmer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Percent className="h-6 w-6 text-primary" />
                Split Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Total Amount */}
                <div>
                  <Label htmlFor="total" className="text-base font-semibold">
                    Total Amount
                  </Label>
                  <Input
                    id="total"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    className="mt-2 h-14 text-2xl font-bold text-center liquid-glass"
                  />
                </div>

                {/* Split Mode Toggle */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={splitMode === "equal" ? "default" : "outline"}
                    onClick={() => setSplitMode("equal")}
                    className="flex-1 ripple-effect"
                  >
                    Equal Split
                  </Button>
                  <Button
                    type="button"
                    variant={splitMode === "custom" ? "default" : "outline"}
                    onClick={() => setSplitMode("custom")}
                    className="flex-1 ripple-effect"
                  >
                    Custom Amounts
                  </Button>
                </div>

                {/* Participants */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">
                      Participants ({participants.length})
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addParticipant}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Add Person
                    </Button>
                  </div>

                  <AnimatePresence mode="popLayout">
                    {participants.map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="liquid-glass p-4 rounded-xl space-y-3"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <Label htmlFor={`name-${participant.id}`} className="text-sm">
                              Person {index + 1}
                            </Label>
                            <Input
                              id={`name-${participant.id}`}
                              placeholder="Enter name or email"
                              value={participant.name}
                              onChange={(e) =>
                                updateParticipantName(participant.id, e.target.value)
                              }
                              className="mt-1"
                            />
                          </div>
                          {participants.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeParticipant(participant.id)}
                              className="mt-6 hover:bg-destructive/10 hover:text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {splitMode === "custom" && (
                          <div>
                            <Label htmlFor={`amount-${participant.id}`} className="text-sm">
                              Amount
                            </Label>
                            <Input
                              id={`amount-${participant.id}`}
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={participant.amount || ""}
                              onChange={(e) =>
                                updateParticipantAmount(
                                  participant.id,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                        )}

                        {splitMode === "equal" && totalAmount && (
                          <div className="text-right">
                            <span className="text-sm text-muted-foreground">
                              Will pay:{" "}
                            </span>
                            <span className="text-xl font-bold text-primary">
                              $
                              {(
                                parseFloat(totalAmount) / participants.length
                              ).toFixed(2)}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-lg ripple-effect"
                  disabled={loading}
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    "Split & Send"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default SplitPayment;
