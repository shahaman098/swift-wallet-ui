import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { treasuryAPI, mlAPI } from "@/api/client";
import { Building2, TrendingUp, Users, Settings, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import Loading from "@/components/Loading";

interface Org {
  id: string;
  name: string;
  smartAccount: string;
  active: boolean;
}

interface Department {
  id: string;
  name: string;
  cap: number;
  balance: number;
  active: boolean;
}

interface Recommendation {
  runway: { months: number; confidence: number };
  anomalies: any[];
  allocationSuggestions: Array<{ deptId: string; suggestedCap: number; reason: string }>;
  riskFlags: any[];
}

const TreasuryDashboard = () => {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load initial data
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      const orgsResponse = await treasuryAPI.getOrgs();
      const fetchedOrgs: Org[] = Array.isArray(orgsResponse.data) ? orgsResponse.data : [];
      setOrgs(fetchedOrgs);

      if (fetchedOrgs.length === 0) {
        setDepartments([]);
        setRecommendations(null);
        setSelectedOrg(null);
        localStorage.removeItem('selectedOrgId');
        return;
      }

      const storedOrgId = localStorage.getItem('selectedOrgId');
      const validOrgId = storedOrgId && fetchedOrgs.some((org) => org.id === storedOrgId)
        ? storedOrgId
        : fetchedOrgs[0].id;

      setSelectedOrg(validOrgId);
      localStorage.setItem('selectedOrgId', validOrgId);

      const deptsResponse = await treasuryAPI.getDepartments(validOrgId);
      setDepartments(Array.isArray(deptsResponse.data) ? deptsResponse.data : []);

      const recResponse = await mlAPI.getRecommendations(validOrgId);
      setRecommendations(recResponse.data);
    } catch (error) {
      console.error('Failed to load treasury data:', error);
      setDepartments([]);
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Loading text="Loading treasury dashboard..." />
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
          <h1 className="text-5xl md:text-6xl font-bold text-arc-gradient mb-2">
            Treasury Management
          </h1>
          <p className="text-muted-foreground text-lg">
            Multi-tenant, multi-chain treasury with Circle Gateway & Arc
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Organizations */}
          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Organizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {orgs.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  No organizations available. Create one to get started.
                </p>
              )}
              {orgs.map((org) => (
                <div
                  key={org.id}
                  className="p-4 rounded-xl liquid-glass mb-2 cursor-pointer hover-lift"
                  onClick={() => setSelectedOrg(org.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{org.name}</span>
                    <Badge variant={org.active ? "default" : "secondary"}>
                      {org.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              ))}
              <Button
                className="w-full mt-4"
                onClick={() => navigate('/treasury/create-org')}
              >
                Create Organization
              </Button>
            </CardContent>
          </Card>

          {/* Departments */}
          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                Departments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <div key={dept.id} className="p-4 rounded-xl liquid-glass mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{dept.name}</span>
                      <Badge>{dept.active ? "Active" : "Inactive"}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Balance: ${dept.balance.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Cap: ${dept.cap.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No departments found for the selected organization.
                </p>
              )}
              <Button
                className="w-full mt-4"
                onClick={() => {
                  if (selectedOrg) {
                    navigate(`/treasury/create-department?orgId=${selectedOrg}`);
                  } else {
                    navigate('/treasury/create-department');
                  }
                }}
                disabled={!selectedOrg}
              >
                Create Department
              </Button>
            </CardContent>
          </Card>

          {/* ML Recommendations */}
          <Card className="liquid-glass-premium border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recommendations ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl liquid-glass">
                    <div className="text-sm text-muted-foreground mb-1">Runway</div>
                    <div className="text-2xl font-bold">
                      {recommendations.runway.months} months
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(recommendations.runway.confidence * 100)}% confidence
                    </div>
                  </div>
                  
                  {recommendations.allocationSuggestions.length > 0 && (
                    <div className="p-4 rounded-xl liquid-glass">
                      <div className="text-sm font-semibold mb-2">Suggestions</div>
                      {recommendations.allocationSuggestions.map((suggestion, i) => (
                        <div key={i} className="text-xs text-muted-foreground mb-1">
                          • {suggestion.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Treasury intelligence is unavailable. Ensure analytics services are configured.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="liquid-glass-premium border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/treasury/rules')}
              >
                <Settings className="h-6 w-6" />
                Manage Rules
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/treasury/automation')}
              >
                <TrendingUp className="h-6 w-6" />
                Automation
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => navigate('/treasury/analytics')}
              >
                <DollarSign className="h-6 w-6" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default TreasuryDashboard;

