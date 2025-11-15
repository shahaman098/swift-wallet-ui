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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#4A44F2] via-[#31D2F7] to-[#4A44F2] bg-clip-text text-transparent mb-2">
            Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">Manage your money with ease</p>
        </motion.div>

        <div className="space-y-8">
          <BalanceCard balance={balance} loading={loading} />
          
          <ActionButtons />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card className="backdrop-blur-sm bg-card/50 border border-border/50 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <motion.div
                    className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full"
                    animate={{ scaleY: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Loading text="Loading transactions..." />
                ) : transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
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
