import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/Loading";
import { ArrowLeft, History, Filter } from "lucide-react";
import { motion } from "framer-motion";
import { transactionAPI } from "@/api/client";

interface Transaction {
  id: string;
  type: 'deposit' | 'send' | 'receive' | 'split' | 'request' | 'allocation' | 'distribution';
  amount: number;
  recipient?: string;
  sender?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  note?: string;
  txHash?: string;
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    loadTransactions();
  }, [navigate, filter, page]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 20,
        offset: (page - 1) * 20,
      };
      
      if (filter !== 'all') {
        params.type = filter;
      }

      const response = await transactionAPI.getTransactions(params);
      setTransactions(response.data.transactions || []);
      setTotal(response.data.total || 0);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6 gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-5xl md:text-6xl font-bold text-arc-gradient mb-2 flex items-center gap-3">
            <History className="h-10 w-10" />
            Transaction History
          </h1>
          <p className="text-muted-foreground text-lg">
            View all your past transactions
          </p>
        </motion.div>

        {/* Filters */}
        <Card className="liquid-glass-premium border-0 shadow-xl mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 flex-wrap">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">Filter:</span>
              {['all', 'deposit', 'send', 'receive', 'allocation', 'distribution'].map((type) => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setFilter(type);
                    setPage(1);
                  }}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="liquid-glass-premium border-0 shadow-xl">
          <CardHeader>
            <CardTitle>
              Transactions ({total})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loading text="Loading transactions..." />
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="p-4 rounded-xl liquid-glass hover-lift">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${
                              transaction.type === 'deposit' || transaction.type === 'receive' 
                                ? 'bg-green-500/20' 
                                : 'bg-blue-500/20'
                            }`}>
                              {transaction.type === 'deposit' || transaction.type === 'receive' ? '↑' : '↓'}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold">
                                {transaction.type === 'deposit' && 'Money Added'}
                                {transaction.type === 'send' && `Sent to ${transaction.recipient || 'Unknown'}`}
                                {transaction.type === 'receive' && `Received from ${transaction.sender || 'Unknown'}`}
                                {transaction.type === 'allocation' && 'Allocation Executed'}
                                {transaction.type === 'distribution' && 'Distribution Executed'}
                                {transaction.type === 'split' && 'Split Payment'}
                                {transaction.type === 'request' && 'Payment Request'}
                              </p>
                              <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                            </div>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${
                                transaction.type === 'deposit' || transaction.type === 'receive'
                                  ? 'text-green-500'
                                  : 'text-blue-500'
                              }`}>
                                {transaction.type === 'deposit' || transaction.type === 'receive' ? '+' : '-'}
                                ${transaction.amount.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={transaction.status === 'completed' ? 'default' : transaction.status === 'pending' ? 'secondary' : 'destructive'}>
                            {transaction.status}
                          </Badge>
                          {transaction.txHash && (
                            <Badge variant="outline" className="font-mono text-xs">
                              {transaction.txHash.slice(0, 8)}...
                            </Badge>
                          )}
                        </div>
                      </div>
                      {transaction.note && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Note: {transaction.note}
                        </p>
                      )}
                      {transaction.sender && transaction.type === 'receive' && (
                        <p className="text-sm text-muted-foreground mt-1">
                          From: {transaction.sender}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">No transactions found</p>
              </div>
            )}

            {/* Pagination */}
            {total > 20 && (
              <div className="flex items-center justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {Math.ceil(total / 20)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TransactionHistory;

