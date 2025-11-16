import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Link as LinkIcon, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { requestAPI } from "@/api/requests";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import ArcFinalityAnimation from "@/components/ArcFinalityAnimation";

const RequestPayment = () => {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [requestId, setRequestId] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();

  const handleGenerateLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { data } = await requestAPI.create({
        amount,
        description: note,
      });
      setGeneratedLink(data?.deepLink ?? "");
      setRequestId(data?.requestId ?? "");
      toast({
        title: "Payment request created",
        description: "Share the link to receive payment",
      });
    } catch (error) {
      console.error("Failed to create request:", error);
      toast({
        title: "Error",
        description: "Failed to create request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (generatedLink) {
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
              <CardContent className="pt-12 pb-12">
                <ArcFinalityAnimation />
                <h2 className="text-3xl font-bold mb-3 text-arc-gradient">
                  Request Created!
                </h2>
                
                <div className="space-y-2 mb-8">
                  <p className="text-5xl font-bold text-foreground">
                    ${parseFloat(amount).toFixed(2)}
                  </p>
                  {recipientName && (
                    <>
                      <p className="text-muted-foreground">requested from</p>
                      <p className="font-bold text-xl text-foreground">{recipientName}</p>
                    </>
                  )}
                  {note && (
                    <div className="mt-4 liquid-glass rounded-xl p-4 max-w-md mx-auto">
                      <p className="text-sm text-muted-foreground mb-1">Note:</p>
                      <p className="text-foreground">{note}</p>
                    </div>
                  )}
                </div>

                {/* Payment Link Display */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-4"
                >
                  <QRCodeDisplay link={generatedLink} className="mx-auto" />
                  <div className="liquid-glass p-6 rounded-2xl space-y-4">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <LinkIcon className="h-5 w-5" />
                      <span className="font-semibold">Payment Request Link</span>
                    </div>
                    
                    <div className="liquid-glass-premium p-4 rounded-xl break-all text-sm font-mono">
                      {generatedLink}
                    </div>
                    {requestId && (
                      <p className="text-xs text-muted-foreground">
                        Request ID: {requestId}
                      </p>
                    )}

                    <Button asChild className="w-full">
                      <a href={generatedLink} target="_blank" rel="noreferrer">
                        Open payment link
                      </a>
                    </Button>
                  </div>

                  <div className="flex gap-3 justify-center pt-4">
                    <Button
                      onClick={() => {
                        setGeneratedLink("");
                        setRequestId("");
                        setAmount("");
                        setNote("");
                        setRecipientName("");
                      }}
                      variant="outline"
                    >
                      Create Another
                    </Button>
                    <Button onClick={() => navigate("/dashboard")}>
                      Back to Dashboard
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
              <QrCode className="h-10 w-10" />
              Request Payment
            </h1>
            <p className="text-muted-foreground text-lg">
              Generate a payment link to request money
            </p>
          </div>

          <Card className="liquid-glass-premium border-0 shadow-xl hover-lift shimmer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <LinkIcon className="h-6 w-6 text-primary" />
                Payment Request Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerateLink} className="space-y-6">
                <div>
                  <Label htmlFor="recipient-name" className="text-base font-semibold">
                    Request From
                  </Label>
                  <Input
                    id="recipient-name"
                    type="text"
                    placeholder="Enter name or email"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-2 liquid-glass"
                  />
                </div>

                <div>
                  <Label htmlFor="amount" className="text-base font-semibold">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2 h-14 text-2xl font-bold text-center liquid-glass"
                  />
                </div>

                <div>
                  <Label htmlFor="note" className="text-base font-semibold">
                    Note (Optional)
                  </Label>
                  <Textarea
                    id="note"
                    placeholder="What's this payment for?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="mt-2 min-h-24 liquid-glass resize-none"
                  />
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
                      <LinkIcon className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <>
                      <LinkIcon className="h-5 w-5 mr-2" />
                      Generate Payment Link
                    </>
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

export default RequestPayment;
