import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import Loading from "@/components/Loading";
import { mlAPI } from "@/api/client";

const TreasuryAnalytics = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Mock analytics data - replace with actual API calls
      setAnalytics({
        totalBalance: 1250000,
        monthlySpend: 85000,
        runway: 14.7,
        departments: [
          { name: 'Engineering', balance: 500000, spend: 40000 },
          { name: 'Marketing', balance: 300000, spend: 25000 },
          { name: 'Operations', balance: 450000, spend: 20000 }
        ],
        monthlyTrend: [
          { month: 'Oct', balance: 1100000, spend: 75000 },
          { month: 'Nov', balance: 1150000, spend: 80000 },
          { month: 'Dec', balance: 1200000, spend: 82000 },
          { month: 'Jan', balance: 1250000, spend: 85000 }
        ],
        allocationBreakdown: [
          { name: 'Engineering', value: 40 },
          { name: 'Marketing', value: 24 },
          { name: 'Operations', value: 36 }
        ]
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Loading text="Loading analytics..." />
        </main>
      </div>
    );
  }

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
            onClick={() => navigate('/treasury')}
            className="mb-6 gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Treasury
          </Button>
          
          <h1 className="text-5xl md:text-6xl font-bold text-arc-gradient mb-2 flex items-center gap-3">
            <DollarSign className="h-10 w-10" />
            Analytics
          </h1>
          <p className="text-muted-foreground text-lg">
            Treasury insights and financial metrics
          </p>
        </motion.div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${analytics?.totalBalance.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Monthly Spend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${analytics?.monthlySpend.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Runway
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                {analytics?.runway} months
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Monthly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics?.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(228, 100%, 65%)" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="hsl(187, 85%, 53%)" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="balance" 
                    stroke="hsl(228, 100%, 65%)" 
                    fill="url(#colorBalance)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle>Department Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.departments}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="spend" fill="hsl(228, 100%, 65%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Breakdown */}
        <Card className="liquid-glass-premium border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Department Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics?.departments.map((dept: any, i: number) => (
                <div key={i} className="p-4 rounded-xl liquid-glass">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{dept.name}</span>
                    <span className="text-2xl font-bold">${dept.balance.toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Monthly spend: ${dept.spend.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TreasuryAnalytics;

