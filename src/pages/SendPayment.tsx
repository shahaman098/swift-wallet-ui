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
import SettlementStatus from "@/components/SettlementStatus";
import { ArrowLeft, CheckCircle2, Sparkles, Send as SendIcon } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "@/hooks/use-window-size";
import { circleAPI } from "@/api/client";

const SendPayment = () => {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [blockchain, setBlockchain] = useState("ETH-SEPOLIA");
  const [destinationChain, setDestinationChain] = useState("ETH-SEPOLIA");
  const [useCCTP, setUseCCTP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transferId, setTransferId] = useState("");
  const [settlementState, setSettlementState] = useState("");
  const [burnTxHash, setBurnTxHash] = useState("");
  const [mintTxHash, setMintTxHash] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [paymentState, setPaymentState] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [circleStatus, setCircleStatus] = useState<string>("");
  const [circleState, setCircleState] = useState<string>("");
  const [circleErrorReason, setCircleErrorReason] = useState<string | null>(null);
  const [createDate, setCreateDate] = useState<string>("");
  const [updateDate, setUpdateDate] = useState<string>("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { width, height } = useWindowSize();


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

  useEffect(() => {
    // Auto-enable CCTP if chains are different
    if (blockchain !== destinationChain) {
      setUseCCTP(true);
    }
  }, [blockchain, destinationChain]);

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

    if (!recipient) {
      toast({
        title: "Recipient required",
        description: "Please enter a recipient wallet address.",
        variant: "destructive",
      });
      return;
    }

    // Basic address validation (should start with 0x for EVM chains)
    if (!recipient.startsWith('0x') || recipient.length !== 42) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid blockchain address (0x...).",
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

      // Send payment via Circle
      const response = await circleAPI.send({
        amount: parseFloat(amount),
        destinationAddress: recipient,
        sourceChain: blockchain,
        destinationChain: useCCTP ? destinationChain : blockchain,
        useCCTP: useCCTP && blockchain !== destinationChain,
        note,
      });

      // Extract REAL Circle data from response
      const data = response.data;
      
      setTransferId(data.transferId || "");
      setSettlementState(data.settlementState || "pending");
      setBurnTxHash(data.burnTxHash || "");
      setMintTxHash(data.mintTxHash || "");
      setPaymentId(data.paymentId || "");
      setPaymentState(data.paymentState || "pending");
      setCircleStatus(data.status || "");
      setCircleState(data.state || "");
      setCircleErrorReason(data.errorReason || null);
      setCreateDate(data.createDate || "");
      setUpdateDate(data.updateDate || "");

      console.log('[Circle] Transfer response:', {
        transferId: data.transferId,
        status: data.status,
        state: data.state,
        settlementState: data.settlementState,
        burnTxHash: data.burnTxHash,
        mintTxHash: data.mintTxHash,
        errorReason: data.errorReason,
      });

      // Check if payment is completed immediately
      if (response.data.settlementState === 'completed' || response.data.paymentState === 'completed') {
        setSuccess(true);
        toast({
          title: "Payment completed",
          description: `$${parseFloat(amount).toFixed(2)} USDC sent successfully`,
        });
        // Navigate after user sees success state (user initiated, not automatic)
        return;
      }

      // For cross-chain, poll settlement status
      if (useCCTP && blockchain !== destinationChain && response.data.transferId) {
        setSuccess(true);
        toast({
          title: "Payment initiated",
          description: `Cross-chain transfer in progress. Monitoring settlement...`,
        });
        pollSettlementStatus(response.data.transferId);
      } else if (response.data.paymentState === 'pending' || response.data.settlementState === 'pending') {
        setSuccess(true);
        toast({
          title: "Payment pending",
          description: `Payment is being processed. Please wait...`,
        });
      } else {
        setSuccess(true);
        toast({
          title: "Payment sent",
          description: `$${parseFloat(amount).toFixed(2)} USDC sent to ${recipient.substring(0, 6)}...${recipient.substring(38)}`,
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send payment";
      const errorReason = error.response?.data?.reason || 'unknown';
      const paymentState = error.response?.data?.paymentState || 'failed';

      setError(errorMessage);
      setPaymentState(paymentState);
      
      // Provide specific guidance based on error reason
      let description = errorMessage;
      if (errorReason === 'sanctions_screening') {
        description = 'Transaction blocked by sanctions screening. Please contact support.';
      } else if (errorReason === 'kyc_required') {
        description = 'Transaction requires KYC verification. Please verify your identity first.';
      } else if (errorReason === 'insufficient_funds') {
        description = 'Insufficient funds. Please add money to your account.';
      }

      toast({
        title: "Payment failed",
        description,
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const pollSettlementStatus = async (transferId: string) => {
    const maxAttempts = 30;
    let attempts = 0;

    const poll = async () => {
      if (attempts >= maxAttempts) return;

      try {
        const response = await circleAPI.getTransferStatus(transferId);
        setSettlementState(response.data.settlementState);
        setBurnTxHash(response.data.burnTxHash || '');
        setMintTxHash(response.data.mintTxHash || '');

        if (response.data.settlementState === 'completed') {
          toast({
            title: "Payment completed",
            description: "Cross-chain transfer has been settled successfully!",
          });
          return; // Stop polling
        }

        if (response.data.settlementState === 'failed') {
          setError('Cross-chain settlement failed');
          toast({
            title: "Settlement failed",
            description: "The cross-chain transfer could not be completed.",
            variant: "destructive",
          });
          return; // Stop polling
        }

        attempts++;
        setTimeout(poll, 3000); // Poll every 3 seconds
      } catch (error) {
        console.error('Failed to poll settlement status:', error);
      }
    };

    setTimeout(poll, 2000); // Start polling after 2 seconds
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
                    <p className="text-muted-foreground">USDC sent to</p>
                    <p className="font-bold text-sm text-foreground break-all">
                      {recipient}
                    </p>
                    {transferId && (
                      <div className="mt-4 p-3 bg-muted/50 rounded-lg space-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Circle Transfer ID:</p>
                          <p className="text-xs font-mono break-all text-primary">{transferId}</p>
                        </div>
                        
                        {/* Circle Status & State */}
                        {(circleStatus || circleState) && (
                          <div className="flex gap-4 justify-center">
                            {circleStatus && (
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">Status</p>
                                <p className="text-sm font-semibold text-accent">{circleStatus}</p>
                              </div>
                            )}
                            {circleState && (
                              <div className="text-center">
                                <p className="text-xs text-muted-foreground">State</p>
                                <p className="text-sm font-semibold text-primary">{circleState}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Transaction Hashes */}
                        {burnTxHash && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Burn Transaction:</p>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${burnTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-blue-500 hover:text-blue-400 underline break-all"
                            >
                              {burnTxHash.substring(0, 20)}...
                            </a>
                          </div>
                        )}
                        
                        {mintTxHash && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Mint Transaction:</p>
                            <a
                              href={`https://sepolia.etherscan.io/tx/${mintTxHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-mono text-green-500 hover:text-green-400 underline break-all"
                            >
                              {mintTxHash.substring(0, 20)}...
                            </a>
                          </div>
                        )}
                        
                        {/* Error Reason */}
                        {circleErrorReason && (
                          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
                            <p className="text-xs text-red-400 mb-1">Error:</p>
                            <p className="text-xs font-semibold text-red-300">{circleErrorReason}</p>
                          </div>
                        )}
                        
                        {/* Settlement Status for CCTP */}
                        {useCCTP && (
                          <SettlementStatus
                            state={settlementState}
                            sourceChain={blockchain}
                            destinationChain={destinationChain}
                            burnTxHash={burnTxHash}
                            mintTxHash={mintTxHash}
                          />
                        )}
                      </div>
                    )}
                  </div>
                  {note && (
                    <div className="bg-muted/50 rounded-xl p-4 mb-6">
                      <p className="text-sm text-muted-foreground mb-1">Note:</p>
                      <p className="font-medium">{note}</p>
                    </div>
                  )}
                  <Button
                    onClick={() => navigate('/dashboard')}
                    className="mt-6 bg-gradient-to-r from-[#4A44F2] to-[#31D2F7] hover:from-[#4A44F2]/90 hover:to-[#31D2F7]/90"
                  >
                    Return to Dashboard
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
            <CardHeader className="relative border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
              <CardTitle className="text-3xl font-bold text-arc-gradient flex items-center gap-2">
                <SendIcon className="h-8 w-8" />
                Send Payment
              </CardTitle>
              <CardDescription className="text-base">Transfer USDC via Circle CCTP</CardDescription>
            </CardHeader>
            <CardContent className="relative">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <InputField
                    label="Recipient Address"
                    placeholder="0x..."
                    value={recipient}
                    onChange={setRecipient}
                    required
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

                  <ChainSelector
                    value={blockchain}
                    onChange={setBlockchain}
                    label="Source Blockchain"
                  />

                  <ChainSelector
                    value={destinationChain}
                    onChange={setDestinationChain}
                    label="Destination Blockchain"
                  />

                  {blockchain !== destinationChain && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          id="useCCTP"
                          checked={useCCTP}
                          onChange={(e) => setUseCCTP(e.target.checked)}
                          className="rounded"
                        />
                        <label htmlFor="useCCTP" className="text-sm font-semibold">
                          Use CCTP for Cross-Chain Transfer
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Enable Circle's Cross-Chain Transfer Protocol to send USDC across different blockchains.
                      </p>
                    </div>
                  )}

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
                      <span className="font-bold text-[#3CF276]">
                        {useCCTP ? "CCTP Fee" : "Network Fee"}
                      </span>
                    </div>
                    {useCCTP && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Cross-chain via CCTP</span>
                        <span>{blockchain} → {destinationChain}</span>
                      </div>
                    )}
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
