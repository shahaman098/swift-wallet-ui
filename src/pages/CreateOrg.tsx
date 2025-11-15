import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import { Building2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { treasuryAPI } from "@/api/client";

const CreateOrg = () => {
  const [name, setName] = useState("");
  const [smartAccount, setSmartAccount] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter an organization name.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await treasuryAPI.createOrg({
        name,
        smartAccount: smartAccount || "0x0000000000000000000000000000000000000000"
      });
      
      toast({
        title: "Organization created",
        description: `${name} has been created successfully.`,
      });
      
      setTimeout(() => {
        navigate('/treasury');
      }, 1500);
    } catch (error: any) {
      toast({
        title: "Failed to create organization",
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
            <CardHeader className="relative border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
              <CardTitle className="text-3xl font-bold text-arc-gradient flex items-center gap-2">
                <Building2 className="h-8 w-8" />
                Create Organization
              </CardTitle>
              <CardDescription className="text-base">
                Set up a new organization for treasury management
              </CardDescription>
            </CardHeader>
            <CardContent className="relative pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <InputField
                  label="Organization Name"
                  placeholder="Acme Corporation"
                  value={name}
                  onChange={setName}
                  required
                />

                <InputField
                  label="Smart Account Address (Optional)"
                  placeholder="0x0000000000000000000000000000000000000000"
                  value={smartAccount}
                  onChange={setSmartAccount}
                />

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button 
                    type="submit" 
                    className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#4A44F2] to-[#31D2F7] hover:from-[#31D2F7] hover:to-[#4A44F2] border-0 shadow-xl"
                    disabled={loading}
                  >
                    {loading ? <Loading text="" /> : "Create Organization"}
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

export default CreateOrg;

