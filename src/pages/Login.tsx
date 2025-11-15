import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import { Wallet } from "lucide-react";
import { motion } from "framer-motion";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      localStorage.setItem('authToken', 'demo-token-' + Date.now());
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen premium-gradient relative flex items-center justify-center p-4 overflow-hidden">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-30 opacity-10"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-30 opacity-10"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl dark:opacity-20 opacity-5"
        animate={{
          x: [-50, 50, -50],
          y: [-50, 50, -50],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Arc-Inspired Background - visible in dark mode */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 pointer-events-none">
        {/* Animated Expanding Arc Rings */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute w-[300px] h-[300px] rounded-full border-2 border-primary/20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [0.8, 2.5, 2.5],
                opacity: [0, 0.15, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 2.5,
              }}
              style={{ filter: "blur(1px)" }}
            />
          ))}
        </div>

        {/* Rotating Arc Halo */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full border-2 border-primary/5 blur-sm"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full border-2 border-primary/8 blur-sm"
            animate={{ rotate: -360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="liquid-glass-premium hover-lift shimmer border-0 shadow-2xl">
          <CardHeader className="space-y-6 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 arc-gradient rounded-2xl flex items-center justify-center shadow-xl"
            >
              <Wallet className="h-8 w-8 text-white" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CardTitle className="text-3xl font-bold text-foreground">Welcome back</CardTitle>
              <CardDescription className="text-muted-foreground mt-2 text-base">
                Sign in to your account
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
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
                placeholder="Enter your password"
                value={password}
                onChange={setPassword}
                required
              />

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-14 text-lg font-semibold arc-gradient hover-lift ripple-effect shadow-xl border-0 text-white"
              >
                {loading ? <Loading text="" /> : "Sign In"}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors underline">
                  Sign up
                </Link>
              </p>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
