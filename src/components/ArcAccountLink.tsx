import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import { Link2, CheckCircle2, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { arcAPI } from "@/api/client";

interface ArcAccount {
  accountId: string;
  walletAddress: string;
  status: string;
  linkedAt: string;
  balance: number;
}

const ArcAccountLink = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<ArcAccount | null>(null);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkArcAccount();
  }, []);

  const checkArcAccount = async () => {
    try {
      const response = await arcAPI.getAccount();
      setAccount(response.data);
    } catch (error: any) {
      // Account not linked yet
      if (error.response?.status === 404) {
        setAccount(null);
      }
    } finally {
      setChecking(false);
    }
  };

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletAddress || !walletAddress.startsWith('0x') || walletAddress.length !== 42) {
      toast({
        title: "Invalid address",
        description: "Please enter a valid blockchain address (0x...).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await arcAPI.linkAccount(walletAddress);
      setAccount({
        accountId: response.data.accountId,
        walletAddress: response.data.walletAddress,
        status: response.data.status,
        linkedAt: new Date().toISOString(),
        balance: 0,
      });
      
      toast({
        title: "Account linked successfully",
        description: "Your Arc account is now connected!",
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to link account";
      toast({
        title: "Link failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <Card className="liquid-glass-premium border-0 shadow-xl">
        <CardContent className="pt-6">
          <Loading text="Checking Arc account..." />
        </CardContent>
      </Card>
    );
  }

  if (account) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="liquid-glass-premium border-0 shadow-xl overflow-hidden">
          <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Arc Account Linked
            </CardTitle>
            <CardDescription>Your wallet is connected to Arc analytics</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account ID:</span>
                <span className="font-mono text-xs">{account.accountId.substring(0, 20)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Wallet:</span>
                <span className="font-mono text-xs">
                  {account.walletAddress.substring(0, 6)}...{account.walletAddress.substring(38)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="font-semibold text-green-500 capitalize">{account.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Activity className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Analytics and insights are now available
              </span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="liquid-glass-premium border-0 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Link2 className="h-5 w-5 text-primary" />
            Link Arc Account
          </CardTitle>
          <CardDescription>
            Connect your wallet to unlock Arc analytics and insights
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLink} className="space-y-4">
            <InputField
              label="Wallet Address"
              placeholder="0x..."
              value={walletAddress}
              onChange={setWalletAddress}
              required
            />
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Benefits of linking:</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1 ml-6 list-disc">
                <li>Advanced transaction analytics</li>
                <li>Spending insights and trends</li>
                <li>Account recommendations</li>
                <li>Enhanced security monitoring</li>
              </ul>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loading text="" /> : "Link Account"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ArcAccountLink;

