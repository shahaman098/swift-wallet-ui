import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import { Users, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { treasuryAPI } from "@/api/client";

const CreateDepartment = () => {
  const [name, setName] = useState("");
  const [cap, setCap] = useState("");
  const [loading, setLoading] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const org = searchParams.get('orgId');
    if (org) {
      setOrgId(org);
    } else {
      // Try to get from localStorage or create default
      const defaultOrg = localStorage.getItem('selectedOrgId');
      if (defaultOrg) {
        setOrgId(defaultOrg);
      } else {
        toast({
          title: "No organization selected",
          description: "Please select an organization first.",
          variant: "destructive",
        });
        navigate('/treasury');
      }
    }
  }, [searchParams, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a department name.",
        variant: "destructive",
      });
      return;
    }

    if (!cap || parseFloat(cap) <= 0) {
      toast({
        title: "Invalid cap",
        description: "Please enter a valid cap amount.",
        variant: "destructive",
      });
      return;
    }

    if (!orgId) {
      toast({
        title: "Organization required",
        description: "Please select an organization.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await treasuryAPI.createDepartment(orgId, {
        name,
        cap: parseFloat(cap)
      });
      
      toast({
        title: "Department created",
        description: `${name} has been created successfully.`,
      });
      
      setTimeout(() => {
        navigate('/treasury');
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Failed to create department",
        description: error.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/treasury')}
            className="mb-6 gap-2 hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Treasury
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="liquid-glass-premium border-0 shadow-2xl overflow-hidden hover-lift shimmer">
            <CardHeader className="relative border-b border-white/10 bg-gradient-to-br from-accent/5 to-transparent">
              <CardTitle className="text-3xl font-bold text-arc-gradient flex items-center gap-2">
                <Users className="h-8 w-8" />
                Create Department
              </CardTitle>
              <CardDescription className="text-base">
                Add a new department to manage funds
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                  label="Department Name"
                  placeholder="Engineering"
                  value={name}
                  onChange={setName}
                  required
                />

                <InputField
                  label="Cap Amount"
                  type="number"
                  placeholder="100000"
                  value={cap}
                  onChange={setCap}
                  required
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#4A44F2] to-[#31D2F7] hover:from-[#31D2F7] hover:to-[#4A44F2] border-0 shadow-xl"
                    disabled={loading}
                  >
                    {loading ? <Loading text="" /> : "Create Department"}
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateDepartment;

