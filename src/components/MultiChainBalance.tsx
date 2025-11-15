import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { chainAPI } from "@/api/client";
import Loading from "./Loading";

interface ChainBalance {
  [chainKey: string]: number;
}

interface MultiChainBalanceProps {
  className?: string;
}

const MultiChainBalance = ({ className = "" }: MultiChainBalanceProps) => {
  const [balances, setBalances] = useState<ChainBalance>({});
  const [totalBalance, setTotalBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedChain, setSelectedChain] = useState<string | null>(null);

  useEffect(() => {
    loadBalances();
  }, []);

  const loadBalances = async () => {
    try {
      const response = await chainAPI.getBalance();
      setBalances(response.data.balances || {});
      setTotalBalance(response.data.totalBalance || 0);
    } catch (error) {
      console.error('Failed to load balances:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={`liquid-glass-premium border-0 shadow-xl ${className}`}>
        <CardContent className="pt-6">
          <Loading text="Loading balances..." />
        </CardContent>
      </Card>
    );
  }

  const chainEntries = Object.entries(balances);
  const hasMultipleChains = chainEntries.length > 1;

  return (
    <Card className={`liquid-glass-premium border-0 shadow-xl ${className}`}>
      <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          Multi-Chain Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {/* Total Balance */}
        <div className="text-center pb-4 border-b border-border">
          <p className="text-sm text-muted-foreground mb-1">Total Balance (All Chains)</p>
          <p className="text-4xl font-bold text-arc-gradient">
            ${totalBalance.toFixed(2)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">USDC</p>
        </div>

        {/* Chain Balances */}
        {chainEntries.length > 0 ? (
          <div className="space-y-3">
            {chainEntries.map(([chainKey, balance], index) => (
              <motion.div
                key={chainKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedChain === chainKey
                    ? 'bg-primary/10 border-primary'
                    : 'bg-muted/30 border-border hover:bg-muted/50'
                }`}
                onClick={() => setSelectedChain(selectedChain === chainKey ? null : chainKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <Network className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{chainKey}</p>
                      <p className="text-xs text-muted-foreground">
                        {balance > 0 ? `${((balance / totalBalance) * 100).toFixed(1)}% of total` : 'No balance'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">${balance.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs mt-1">
                      USDC
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Network className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No balances found</p>
            <p className="text-xs mt-1">Deposit funds to see balances</p>
          </div>
        )}

        {hasMultipleChains && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Balances distributed across {chainEntries.length} chains</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MultiChainBalance;

