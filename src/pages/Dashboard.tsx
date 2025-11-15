import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BalanceCard from "@/components/BalanceCard";
import ActionButtons from "@/components/ActionButtons";
import TransactionItem from "@/components/TransactionItem";
import Loading from "@/components/Loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Transaction {
  id: string;
  type: 'deposit' | 'send';
  amount: number;
  recipient?: string;
  date: string;
  status: 'completed' | 'pending';
}

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
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Manage your money with ease</p>
          </div>

          <BalanceCard balance={balance} loading={loading} />
          
          <ActionButtons />

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Loading text="Loading transactions..." />
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <TransactionItem key={transaction.id} {...transaction} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">Start by adding money to your account</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
