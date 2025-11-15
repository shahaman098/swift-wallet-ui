import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { walletAPI, activityAPI } from "@/api/client";
import { formatDistanceToNow, parseISO } from "date-fns";

interface TreasuryStats {
  totalBalance: number;
  totalDeposits: number;
  totalSent: number;
  netChange: number;
  netChangePercent: number;
}

interface TreasuryTransaction {
  id: string;
  type: 'deposit' | 'send';
  amount: number;
  balanceAfter: number;
  recipient?: string;
  note?: string;
  createdAt: string;
}

const TreasuryBrain = () => {
  const [balance, setBalance] = useState(0);
  const [stats, setStats] = useState<TreasuryStats>({
    totalBalance: 0,
    totalDeposits: 0,
    totalSent: 0,
    netChange: 0,
    netChangePercent: 0,
  });
  const [transactions, setTransactions] = useState<TreasuryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchTreasuryData = async () => {
    try {
      setRefreshing(true);
      const [balanceResponse, activityResponse] = await Promise.all([
        walletAPI.getBalance(),
        activityAPI.getActivity({ limit: 100 }).catch(() => {
          // If activity fails, return empty array
          return { data: { transactions: [] } };
        })
      ]);

      const currentBalance = balanceResponse.data.balance;
      setBalance(currentBalance);

      // Calculate stats from transactions
      const allTransactions = activityResponse.data.transactions || [];
      const deposits = allTransactions.filter(tx => tx.type === 'deposit');
      const sends = allTransactions.filter(tx => tx.type === 'send');
      
      const totalDeposits = deposits.reduce((sum, tx) => sum + tx.amount, 0);
      const totalSent = sends.reduce((sum, tx) => sum + tx.amount, 0);
      const netChange = totalDeposits - totalSent;
      const netChangePercent = totalDeposits > 0 ? (netChange / totalDeposits) * 100 : 0;

      setStats({
        totalBalance: currentBalance,
        totalDeposits,
        totalSent,
        netChange,
        netChangePercent,
      });

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to fetch treasury data:', error);
      toast({
        title: "Error",
        description: "Failed to load treasury data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchTreasuryData();
  }, [navigate]);

  const handleRefresh = () => {
    fetchTreasuryData();
    toast({
      title: "Refreshed",
      description: "Treasury data has been updated.",
    });
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'deposit':
        navigate('/add-money');
        break;
      case 'send':
        navigate('/send-payment');
        break;
      case 'request':
        navigate('/request-payment');
        break;
      case 'split':
        navigate('/split-payment');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <Loading text="Loading treasury data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="gap-2 hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Treasury Brain
              </h1>
              <p className="text-muted-foreground">Manage and analyze your wallet portfolio</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="liquid-glass-premium border-0 shadow-xl hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Total Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${stats.totalBalance.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">Current available funds</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="liquid-glass-premium border-0 shadow-xl hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowUpRight className="h-4 w-4 text-success" />
                  Total Deposits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-success">${stats.totalDeposits.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">All-time deposits</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="liquid-glass-premium border-0 shadow-xl hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                  Total Sent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-destructive">${stats.totalSent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-1">All-time payments</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="liquid-glass-premium border-0 shadow-xl hover-lift">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {stats.netChange >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  Net Change
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stats.netChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.netChange >= 0 ? '+' : ''}${stats.netChange.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.netChangePercent >= 0 ? '+' : ''}{stats.netChangePercent.toFixed(1)}% overall
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your treasury with these quick actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleQuickAction('deposit')}
                    className="w-full h-auto py-6 flex flex-col gap-2 bg-gradient-to-br from-success to-success/80 hover:from-success/80 hover:to-success"
                  >
                    <ArrowUpRight className="h-6 w-6" />
                    <span className="font-semibold">Add Money</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleQuickAction('send')}
                    className="w-full h-auto py-6 flex flex-col gap-2 bg-gradient-to-br from-primary to-accent hover:from-accent hover:to-primary"
                  >
                    <ArrowDownRight className="h-6 w-6" />
                    <span className="font-semibold">Send Payment</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleQuickAction('request')}
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col gap-2"
                  >
                    <DollarSign className="h-6 w-6" />
                    <span className="font-semibold">Request</span>
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => handleQuickAction('split')}
                    variant="outline"
                    className="w-full h-auto py-6 flex flex-col gap-2"
                  >
                    <PieChart className="h-6 w-6" />
                    <span className="font-semibold">Split Bill</span>
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="liquid-glass-premium border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Portfolio Overview
                </CardTitle>
                <CardDescription>Your wallet performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Available Balance</span>
                    <span className="text-2xl font-bold">${balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Total Deposits</span>
                    <span className="text-xl font-semibold text-success">${stats.totalDeposits.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
                    <span className="text-sm font-medium">Total Payments</span>
                    <span className="text-xl font-semibold text-destructive">${stats.totalSent.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                    <span className="text-sm font-medium">Net Position</span>
                    <span className={`text-2xl font-bold ${stats.netChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {stats.netChange >= 0 ? '+' : ''}${stats.netChange.toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="liquid-glass-premium border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Activity Summary
                </CardTitle>
                <CardDescription>Recent treasury activity</CardDescription>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-12">
                    <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                    <p className="text-muted-foreground">No recent transactions</p>
                    <p className="text-sm text-muted-foreground mt-2">Start by adding money or sending a payment</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((tx) => (
                      <div
                        key={tx.id}
                        className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">
                            {tx.type === 'deposit' ? 'Deposit' : 'Payment'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {tx.recipient || 'Wallet'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold ${tx.type === 'deposit' ? 'text-success' : 'text-destructive'}`}>
                            {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(parseISO(tx.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default TreasuryBrain;

