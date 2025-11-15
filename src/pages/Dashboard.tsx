import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BalanceCard from "@/components/BalanceCard";
import MultiChainBalance from "@/components/MultiChainBalance";
import ActionButtons from "@/components/ActionButtons";
import TransactionItem from "@/components/TransactionItem";
import ArcAccountLink from "@/components/ArcAccountLink";
import Loading from "@/components/Loading";
import KYCStatus from "@/components/KYCStatus";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Activity, PieChartIcon, Sparkles } from "lucide-react";
import { arcAPI, chainAPI, activityAPI } from "@/api/client";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  type: 'deposit' | 'send';
  amount: number;
  recipient?: string;
  date: string;
  status: 'completed' | 'pending';
  chainKey?: string;
  sourceChain?: string;
  destinationChain?: string;
  settlementState?: string;
  burnTxHash?: string;
  mintTxHash?: string;
}

// Chart data
const weeklyData = [
  { day: 'Mon', amount: 850 },
  { day: 'Tue', amount: 920 },
  { day: 'Wed', amount: 1050 },
  { day: 'Thu', amount: 980 },
  { day: 'Fri', amount: 1150 },
  { day: 'Sat', amount: 1100 },
  { day: 'Sun', amount: 1234.56 },
];

const categoryData = [
  { name: 'Income', value: 2500, color: 'hsl(152, 61%, 49%)' },
  { name: 'Expenses', value: 1265.44, color: 'hsl(228, 100%, 65%)' },
  { name: 'Savings', value: 1234.56, color: 'hsl(187, 85%, 53%)' },
];

const monthlyData = [
  { month: 'Jan', income: 2100, expenses: 1200 },
  { month: 'Feb', income: 2300, expenses: 1400 },
  { month: 'Mar', income: 2500, expenses: 1265.44 },
];

interface ArcAnalytics {
  timeframe: string;
  transactions: {
    total: number;
    count: number;
    average: number;
  };
  volume: {
    total: number;
    incoming: number;
    outgoing: number;
  };
  trends: Array<{ date: string; value: number }>;
  insights: Array<{ type: string; message: string }>;
}

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [arcAnalytics, setArcAnalytics] = useState<ArcAnalytics | null>(null);
  const [arcLoading, setArcLoading] = useState(false);
  const [hasArcAccount, setHasArcAccount] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    loadDashboardData();
    checkArcAccount();
  }, [navigate]);

  const loadDashboardData = async () => {
    try {
      // Load multi-chain balances
      const balanceResponse = await chainAPI.getBalance();
      const totalBalance = balanceResponse.data.totalBalance || 0;
      setBalance(totalBalance);

      // Load transactions
      const activityResponse = await activityAPI.getActivity({ limit: 20 });
      const txns = activityResponse.data.transactions || [];
      
      // Format transactions with chain info
      const formattedTransactions = txns.map((tx: any) => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        recipient: tx.recipient,
        date: new Date(tx.createdAt).toLocaleString(),
        status: tx.settlementState === 'completed' ? 'completed' : 'pending',
        chainKey: tx.chainKey,
        sourceChain: tx.sourceChain,
        destinationChain: tx.destinationChain,
        settlementState: tx.settlementState,
        burnTxHash: tx.burnTxHash,
        mintTxHash: tx.mintTxHash,
      }));

      setTransactions(formattedTransactions);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to mock data
      setBalance(1234.56);
      setTransactions([]);
      setLoading(false);
    }
  };

  const checkArcAccount = async () => {
    try {
      await arcAPI.getAccount();
      setHasArcAccount(true);
      loadArcAnalytics();
    } catch (error: any) {
      if (error.response?.status !== 404) {
        // Only set to false if it's a 404, otherwise might be other error
        setHasArcAccount(false);
      }
    }
  };

  const loadArcAnalytics = async () => {
    setArcLoading(true);
    try {
      const response = await arcAPI.getAnalytics('30d');
      setArcAnalytics(response.data);
      
      // Track dashboard view event
      await arcAPI.trackEvent('dashboard_viewed', {
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      // Analytics might not be available yet
      console.log('Arc analytics not available:', error.message);
    } finally {
      setArcLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden">
      {/* Arc Network Background */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 1000}
              cy={Math.random() * 1000}
              r="2"
              className="fill-primary"
              animate={{
                opacity: [0.3, 0.7, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
          {/* Connecting lines */}
          {[...Array(10)].map((_, i) => (
            <motion.line
              key={`line-${i}`}
              x1={Math.random() * 1000}
              y1={Math.random() * 1000}
              x2={Math.random() * 1000}
              y2={Math.random() * 1000}
              className="stroke-accent"
              strokeWidth="0.5"
              opacity="0.2"
              animate={{
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </svg>
      </div>

      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-arc-gradient mb-2 animate-fade-in">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Manage your money with Arc-powered insights</p>
        </motion.div>

        <div className="space-y-8">
          <BalanceCard balance={balance} loading={loading} />
          
          {/* Multi-Chain Balances */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <MultiChainBalance />
          </motion.div>
          
          <ActionButtons />

          {/* KYC/KYB Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <KYCStatus />
          </motion.div>

          {/* Arc Account Linkage */}
          {!hasArcAccount && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <ArcAccountLink />
            </motion.div>
          )}

          {/* Arc Analytics Section */}
          {hasArcAccount && arcAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-1.5 h-10 bg-gradient-to-b from-primary via-accent to-primary rounded-full"
                  animate={{ scaleY: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <h2 className="text-3xl font-bold text-arc-gradient">Arc Analytics</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="liquid-glass-premium border-0 shadow-xl">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Transactions</p>
                      <p className="text-3xl font-bold">{arcAnalytics.transactions.count}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg: ${arcAnalytics.transactions.average.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="liquid-glass-premium border-0 shadow-xl">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Total Volume</p>
                      <p className="text-3xl font-bold">${arcAnalytics.volume.total.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">
                        In: ${arcAnalytics.volume.incoming.toFixed(2)} | Out: ${arcAnalytics.volume.outgoing.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="liquid-glass-premium border-0 shadow-xl">
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Timeframe</p>
                      <p className="text-3xl font-bold capitalize">{arcAnalytics.timeframe}</p>
                      <p className="text-xs text-muted-foreground">
                        Last 30 days
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {arcAnalytics.insights && arcAnalytics.insights.length > 0 && (
                <Card className="liquid-glass-premium border-0 shadow-xl">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Insights & Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {arcAnalytics.insights.map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + index * 0.1 }}
                          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
                        >
                          <p className="text-sm font-semibold mb-1 capitalize">{insight.type}</p>
                          <p className="text-sm text-muted-foreground">{insight.message}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Financial Insights Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <motion.div
                className="w-1.5 h-10 bg-gradient-to-b from-primary via-accent to-primary rounded-full"
                animate={{ scaleY: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <h2 className="text-3xl font-bold text-arc-gradient">Financial Insights</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Trend Chart */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="hover-lift"
              >
                <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer h-full">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      Weekly Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <AreaChart data={weeklyData}>
                        <defs>
                          <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(228, 100%, 65%)" stopOpacity={0.5}/>
                            <stop offset="95%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="day" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          opacity={0.7}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          opacity={0.7}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="hsl(228, 100%, 65%)" 
                          strokeWidth={2.5}
                          fillOpacity={1} 
                          fill="url(#colorAmount)"
                          animationDuration={1500}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Category Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="hover-lift"
              >
                <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer h-full">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-br from-accent/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <PieChartIcon className="h-5 w-5 text-accent" />
                      Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          animationDuration={1500}
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-4">
                      {categoryData.map((cat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                          <span className="text-sm text-muted-foreground">{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Monthly Comparison */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="lg:col-span-2 hover-lift"
              >
                <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer">
                  <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Activity className="h-5 w-5 text-primary" />
                      Monthly Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={monthlyData}>
                        <XAxis 
                          dataKey="month" 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          opacity={0.7}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))" 
                          fontSize={12}
                          opacity={0.7}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'hsl(var(--card))', 
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Bar dataKey="income" fill="hsl(152, 61%, 49%)" radius={[8, 8, 0, 0]} animationDuration={1500} />
                        <Bar dataKey="expenses" fill="hsl(228, 100%, 65%)" radius={[8, 8, 0, 0]} animationDuration={1500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="hover-lift"
          >
            <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer">
              <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <motion.div
                    className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"
                    animate={{ scaleY: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loading ? (
                  <Loading text="Loading transactions..." />
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <TransactionItem {...transaction} />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">💸</span>
                    </div>
                    <p className="text-muted-foreground text-lg">No transactions yet</p>
                    <p className="text-sm text-muted-foreground mt-2">Start by adding money to your account</p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
