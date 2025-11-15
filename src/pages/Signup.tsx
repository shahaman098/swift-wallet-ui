import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { authAPI } from "@/api/client";

const Signup = () => {
  const location = useLocation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Pre-fill email and password if coming from login page
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
    if (location.state?.password) {
      setPassword(location.state.password);
      setConfirmPassword(location.state.password);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.signup({ name, email, password });
      const token = response?.data?.token;

      if (token) {
        localStorage.setItem("authToken", token);
      }
    
      toast({
        title: "Account created",
        description: response?.data?.message || "Welcome to PayWallet!",
      });
      
      navigate("/dashboard");
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      const description =
        axiosError.response?.data?.message ||
        axiosError.message ||
        "Unable to create account. Please try again.";

      toast({
        title: "Signup failed",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#0A0F2D] via-[#1a1f3d] to-[#0A0F2D]">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-20 right-20 w-96 h-96 bg-[#31D2F7] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 left-20 w-96 h-96 bg-[#4A44F2] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="space-y-6 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-[#4A44F2] to-[#31D2F7] rounded-2xl flex items-center justify-center shadow-xl"
            >
              <Wallet className="h-8 w-8 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold text-white">Create account</CardTitle>
              <CardDescription className="text-white/70 mt-2 text-base">
                Join PayWallet today
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <InputField
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={setName}
                required
              />

              <InputField
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={setEmail}
                required
              />
              
              <InputField
                label="Password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={setPassword}
                required
              />

              <InputField
                label="Confirm Password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                required
              />

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#4A44F2] to-[#31D2F7] hover:from-[#31D2F7] hover:to-[#4A44F2] border-0 shadow-xl mt-2"
                  disabled={loading}
                >
                  {loading ? <Loading text="" /> : "Create Account"}
                </Button>
              </motion.div>

              <p className="text-center text-sm text-white/70">
                Already have an account?{" "}
                <Link to="/login" className="text-[#31D2F7] hover:text-[#4A44F2] font-semibold transition-colors">
                  Sign in
                </Link>
              </p>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Signup;
