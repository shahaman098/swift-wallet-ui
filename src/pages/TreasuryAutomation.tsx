import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowLeft, Play, Pause, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Loading from "@/components/Loading";

interface Schedule {
  id: string;
  name: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly';
  lastExecuted: string;
  nextExecution: string;
  active: boolean;
  allocationRules: number;
  distributionRules: number;
}

const TreasuryAutomation = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      // Mock data - replace with actual API calls
      setSchedules([
        {
          id: 'schedule-1',
          name: 'Monthly Close',
          frequency: 'Monthly',
          lastExecuted: '2024-01-15T10:00:00Z',
          nextExecution: '2024-02-15T10:00:00Z',
          active: true,
          allocationRules: 3,
          distributionRules: 5
        },
        {
          id: 'schedule-2',
          name: 'Weekly Payroll',
          frequency: 'Weekly',
          lastExecuted: '2024-01-20T09:00:00Z',
          nextExecution: '2024-01-27T09:00:00Z',
          active: true,
          allocationRules: 0,
          distributionRules: 12
        }
      ]);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Loading text="Loading automation schedules..." />
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
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-arc-gradient mb-2 flex items-center gap-3">
                <TrendingUp className="h-10 w-10" />
                Automation
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage automated schedules and workflows
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="liquid-glass-premium border-0 shadow-xl hover-lift">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{schedule.name}</CardTitle>
                  <Badge variant={schedule.active ? "default" : "secondary"}>
                    {schedule.active ? 'Active' : 'Paused'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Frequency</div>
                    <div className="font-semibold">{schedule.frequency}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Last Executed</div>
                    <div className="font-semibold">
                      {new Date(schedule.lastExecuted).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-muted-foreground">Next Execution</div>
                    <div className="font-semibold">
                      {new Date(schedule.nextExecution).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 text-sm">
                    <span className="text-muted-foreground">
                      {schedule.allocationRules} allocation rules
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {schedule.distributionRules} distribution rules
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      {schedule.active ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Execute Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {schedules.length === 0 && (
          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">No automation schedules yet</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Schedule
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default TreasuryAutomation;

