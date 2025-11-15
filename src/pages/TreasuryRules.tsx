import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { treasuryAPI } from "@/api/client";
import Loading from "@/components/Loading";

interface AllocationRule {
  id: string;
  allocationType: 'Percentage' | 'FixedAmount' | 'Residual';
  sourceDept: string;
  targetDept: string;
  bps: number;
  amount: number;
  cap: number;
  active: boolean;
}

interface DistributionRule {
  id: string;
  fromDept: string;
  recipient: string;
  amount: number;
  bps: number;
  frequency: 'None' | 'Daily' | 'Weekly' | 'Monthly';
  confidential: boolean;
  active: boolean;
}

const TreasuryRules = () => {
  const [allocationRules, setAllocationRules] = useState<AllocationRule[]>([]);
  const [distributionRules, setDistributionRules] = useState<DistributionRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      // Backend endpoints are not implemented yet; surface clear messaging instead of mock data.
      await treasuryAPI.getOrgs();
      setAllocationRules([]);
      setDistributionRules([]);
      setError('Rule management is not implemented. Connect backend storage before using this page.');
    } catch (err) {
      console.error('Failed to load rules:', err);
      setError('Unable to load rules. Ensure the treasury backend is running with rule storage enabled.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Loading text="Loading rules..." />
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
            <Settings className="h-10 w-10" />
            Manage Rules
          </h1>
          <p className="text-muted-foreground text-lg">
            Configure allocation and distribution rules
          </p>
        </motion.div>

        <Tabs defaultValue="allocations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="allocations">Allocation Rules</TabsTrigger>
            <TabsTrigger value="distributions">Distribution Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="allocations">
            <Card className="liquid-glass-premium border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Allocation Rules</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <p className="text-muted-foreground text-center py-8">{error}</p>
                ) : allocationRules.length > 0 ? (
                  <div className="space-y-4">
                    {allocationRules.map((rule) => (
                      <div key={rule.id} className="p-4 rounded-xl liquid-glass">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold">{rule.allocationType}</span>
                            <Badge className="ml-2">{rule.active ? 'Active' : 'Inactive'}</Badge>
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>Source: Dept {rule.sourceDept}</div>
                          <div>Target: Dept {rule.targetDept}</div>
                          {rule.allocationType === 'Percentage' && (
                            <div>Percentage: {rule.bps / 100}%</div>
                          )}
                          {rule.allocationType === 'FixedAmount' && (
                            <div>Amount: ${rule.amount.toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No allocation rules yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="distributions">
            <Card className="liquid-glass-premium border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Distribution Rules</CardTitle>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {error ? (
                  <p className="text-muted-foreground text-center py-8">{error}</p>
                ) : distributionRules.length > 0 ? (
                  <div className="space-y-4">
                    {distributionRules.map((rule) => (
                      <div key={rule.id} className="p-4 rounded-xl liquid-glass">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="font-semibold">Distribution</span>
                            <Badge className="ml-2">{rule.active ? 'Active' : 'Inactive'}</Badge>
                            {rule.confidential && (
                              <Badge variant="secondary" className="ml-2">Confidential</Badge>
                            )}
                          </div>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>From: Dept {rule.fromDept}</div>
                          <div>Recipient: {rule.recipient}</div>
                          <div>Amount: ${rule.amount.toLocaleString()}</div>
                          <div>Frequency: {rule.frequency}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    No distribution rules yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default TreasuryRules;

