import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BalanceCard from "@/components/BalanceCard";
import ActionButtons from "@/components/ActionButtons";
import TransactionItem from "@/components/TransactionItem";
import Loading from "@/components/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTreasuryBrain } from "@/hooks/useTreasuryBrain";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Activity, PieChartIcon, Bot, Sparkles } from "lucide-react";

interface Transaction {
  id: string;
  type: 'deposit' | 'send';
  amount: number;
  recipient?: string;
  date: string;
  status: 'completed' | 'pending';
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

const Dashboard = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const treasury = useTreasuryBrain();
  const treasuryOrg = treasury.selectedOrg;
  const runway = treasury.mlInsightForSelectedOrg?.runwayMonths ?? null;
  const dueSchedules = treasury.automationDueSchedules.length;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setBalance(1234.56);
      setTransactions([
        {
          id: '1',
          type: 'deposit',
          amount: 500.00,
          date: 'Today, 2:30 PM',
          status: 'completed',
        },
        {
          id: '2',
          type: 'send',
          amount: 150.00,
          recipient: 'John Smith',
          date: 'Yesterday, 4:15 PM',
          status: 'completed',
        },
        {
          id: '3',
          type: 'deposit',
          amount: 1000.00,
          date: 'Dec 10, 10:00 AM',
          status: 'completed',
        },
      ]);
      setLoading(false);
    }, 800);
  }, [navigate]);

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
          
          <ActionButtons />

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

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="hover-lift"
            >
              <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer">
                <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Arc Treasury Brain Snapshot
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-3 text-sm">
                    <p className="text-muted-foreground">
                      {treasuryOrg ? (
                        <>
                          Active org <span className="font-semibold text-foreground">{treasuryOrg.name}</span> operating on
                          chain {treasuryOrg.homeChainId}.
                        </>
                      ) : (
                        "Select an organisation in Treasury Brain to view detailed telemetry."
                      )}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Bot className="h-4 w-4 text-primary" />
                      {dueSchedules > 0
                        ? `${dueSchedules} automation schedule${dueSchedules > 1 ? "s" : ""} ready for execution.`
                        : "All automation schedules are on cadence."}
                    </p>
                    {runway !== null && (
                      <p className="text-muted-foreground">
                        ML runway estimate: <span className="font-semibold text-foreground">{runway} months</span> remaining.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end mt-6">
                    <Button
                      variant="outline"
                      className="border-primary/40 text-primary"
                      onClick={() => navigate("/treasury")}
                    >
                      Open Treasury Brain
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
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
