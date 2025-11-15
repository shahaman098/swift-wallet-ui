import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BalanceCard from "@/components/BalanceCard";
import ActionButtons from "@/components/ActionButtons";
import TransactionItem from "@/components/TransactionItem";
import Loading from "@/components/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { TrendingUp, Activity, PieChartIcon } from "lucide-react";

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
  { name: 'Income', value: 2500, color: '#3CF276' },
  { name: 'Expenses', value: 1265.44, color: '#4A44F2' },
  { name: 'Savings', value: 1234.56, color: '#31D2F7' },
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden transition-colors duration-300">
      {/* Arc Network Background - Dark Mode Only */}
      <div className="dark:opacity-5 opacity-0 absolute inset-0 pointer-events-none transition-opacity duration-300">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 1000}
              cy={Math.random() * 1000}
              r="2"
              fill="#4A44F2"
              animate={{
                opacity: [0.2, 0.8, 0.2],
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
              stroke="#31D2F7"
              strokeWidth="0.5"
              opacity="0.1"
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
                  <CardHeader className="border-b border-border/30 bg-gradient-to-br from-primary/5 to-transparent">
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
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" fontSize={12} />
                        <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(var(--card), 0.95)', 
                            border: '1px solid rgba(var(--border), 0.5)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="amount" 
                          stroke="#6366F1" 
                          strokeWidth={3}
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
                  <CardHeader className="border-b border-border/30 bg-gradient-to-br from-accent/5 to-transparent">
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
                            background: 'rgba(var(--card), 0.95)', 
                            border: '1px solid rgba(var(--border), 0.5)',
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
                  <CardHeader className="border-b border-border/30 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Activity className="h-5 w-5 text-primary" />
                      Monthly Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={monthlyData}>
                        <XAxis dataKey="month" stroke="currentColor" className="text-muted-foreground" fontSize={12} />
                        <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            background: 'rgba(var(--card), 0.95)', 
                            border: '1px solid rgba(var(--border), 0.5)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            color: 'hsl(var(--foreground))'
                          }}
                        />
                        <Bar dataKey="income" fill="#10B981" radius={[8, 8, 0, 0]} animationDuration={1500} />
                        <Bar dataKey="expenses" fill="#6366F1" radius={[8, 8, 0, 0]} animationDuration={1500} />
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
              <CardHeader className="border-b border-border/30 bg-gradient-to-br from-primary/5 to-transparent">
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
