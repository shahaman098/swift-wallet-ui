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
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-[#0A0F2D] via-[#1a1f3d] to-[#0A0F2D]">
      {/* Animated background blobs */}
      <motion.div
        className="absolute top-20 left-20 w-96 h-96 bg-[#4A44F2] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
        className="absolute bottom-20 right-20 w-96 h-96 bg-[#31D2F7] rounded-full mix-blend-multiply filter blur-3xl opacity-20"
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
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-[#3CF276] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
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

      {/* Arc-Inspired Background Elements */}
      
      {/* Rotating Arc Halo behind card */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ perspective: "1000px" }}
      >
        <motion.div
          className="absolute w-[600px] h-[600px] rounded-full border-2 border-cyan-400/5 blur-sm"
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] rounded-full border-2 border-blue-400/8 blur-sm"
          animate={{ rotate: -360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] rounded-full border border-violet-400/6 blur-sm"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* Blockchain Network Nodes - Top Left */}
      <svg className="absolute top-10 left-10 w-64 h-64 opacity-5 md:opacity-8 pointer-events-none" viewBox="0 0 200 200">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        {/* Nodes */}
        <motion.circle cx="50" cy="50" r="4" fill="#31D2F7" filter="url(#glow)"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle cx="100" cy="40" r="3" fill="#4A44F2" filter="url(#glow)"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.circle cx="150" cy="60" r="3.5" fill="#31D2F7" filter="url(#glow)"
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.circle cx="80" cy="100" r="3" fill="#9D4EDD" filter="url(#glow)"
          animate={{ opacity: [0.4, 0.7, 0.4], scale: [1, 1.2, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        <motion.circle cx="130" cy="120" r="4" fill="#31D2F7" filter="url(#glow)"
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.1, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        {/* Connecting Lines */}
        <motion.line x1="50" y1="50" x2="100" y2="40" stroke="#31D2F7" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.line x1="100" y1="40" x2="150" y2="60" stroke="#4A44F2" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <motion.line x1="50" y1="50" x2="80" y2="100" stroke="#31D2F7" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.line x1="80" y1="100" x2="130" y2="120" stroke="#9D4EDD" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        <motion.line x1="150" y1="60" x2="130" y2="120" stroke="#31D2F7" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.23, 0.1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
      </svg>

      {/* Blockchain Network Nodes - Bottom Right */}
      <svg className="absolute bottom-10 right-10 w-56 h-56 opacity-5 md:opacity-8 pointer-events-none" viewBox="0 0 200 200">
        {/* Nodes */}
        <motion.circle cx="60" cy="140" r="3.5" fill="#31D2F7" filter="url(#glow)"
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.circle cx="110" cy="150" r="4" fill="#4A44F2" filter="url(#glow)"
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.circle cx="140" cy="120" r="3" fill="#9D4EDD" filter="url(#glow)"
          animate={{ opacity: [0.4, 0.75, 0.4], scale: [1, 1.1, 1] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
        <motion.circle cx="90" cy="100" r="3.5" fill="#31D2F7" filter="url(#glow)"
          animate={{ opacity: [0.3, 0.65, 0.3], scale: [1, 1.18, 1] }}
          transition={{ duration: 4.3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        {/* Connecting Lines */}
        <motion.line x1="60" y1="140" x2="110" y2="150" stroke="#31D2F7" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.24, 0.1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
        />
        <motion.line x1="110" y1="150" x2="140" y2="120" stroke="#4A44F2" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.22, 0.1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
        <motion.line x1="90" y1="100" x2="140" y2="120" stroke="#9D4EDD" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 3.9, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
        <motion.line x1="60" y1="140" x2="90" y2="100" stroke="#31D2F7" strokeWidth="0.5" opacity="0.15"
          animate={{ opacity: [0.1, 0.23, 0.1] }}
          transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>

      {/* Data Flow Streams - Top Right Corner */}
      <motion.div 
        className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none"
        animate={{ x: [0, 20, 0], y: [0, -10, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg className="w-full h-full" viewBox="0 0 300 300">
          <motion.path
            d="M 250 50 Q 200 80, 180 120 T 150 200"
            stroke="#31D2F7"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
            filter="url(#glow)"
            animate={{ pathLength: [0, 1, 0], opacity: [0.05, 0.15, 0.05] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.path
            d="M 280 80 Q 230 100, 200 140 T 160 220"
            stroke="#4A44F2"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
            filter="url(#glow)"
            animate={{ pathLength: [0, 1, 0], opacity: [0.05, 0.12, 0.05] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.path
            d="M 260 30 Q 220 65, 190 110 T 140 190"
            stroke="#9D4EDD"
            strokeWidth="0.8"
            fill="none"
            opacity="0.08"
            filter="url(#glow)"
            animate={{ pathLength: [0, 1, 0], opacity: [0.04, 0.1, 0.04] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
        </svg>
      </motion.div>

      {/* Data Flow Streams - Bottom Left Corner */}
      <motion.div 
        className="absolute bottom-0 left-0 w-96 h-96 opacity-5 pointer-events-none"
        animate={{ x: [0, -15, 0], y: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg className="w-full h-full" viewBox="0 0 300 300">
          <motion.path
            d="M 50 250 Q 80 220, 100 180 T 150 100"
            stroke="#31D2F7"
            strokeWidth="1"
            fill="none"
            opacity="0.1"
            filter="url(#glow)"
            animate={{ pathLength: [0, 1, 0], opacity: [0.05, 0.14, 0.05] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.path
            d="M 30 270 Q 70 230, 110 190 T 170 110"
            stroke="#9D4EDD"
            strokeWidth="0.9"
            fill="none"
            opacity="0.08"
            filter="url(#glow)"
            animate={{ pathLength: [0, 1, 0], opacity: [0.04, 0.11, 0.04] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
        </svg>
      </motion.div>

      {/* Concentric Arc Rings */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ scale: [1, 1.05, 1], opacity: [0.03, 0.06, 0.03] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative w-[700px] h-[700px]">
          <div className="absolute inset-0 rounded-full border border-cyan-400/5 blur-md" />
          <div className="absolute inset-8 rounded-full border border-blue-400/6 blur-md" />
          <div className="absolute inset-16 rounded-full border border-violet-400/4 blur-md" />
          <div className="absolute inset-24 rounded-full border border-cyan-400/5 blur-md" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="backdrop-blur-2xl bg-white/10 border border-white/20 shadow-2xl">
          <CardHeader className="space-y-6 text-center pb-8">
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
              <CardTitle className="text-3xl font-bold text-white">Welcome back</CardTitle>
              <CardDescription className="text-white/70 mt-2 text-base">
                Sign in to continue to PayWallet
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
              <div className="space-y-4">
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
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-[#4A44F2] to-[#31D2F7] hover:from-[#31D2F7] hover:to-[#4A44F2] border-0 shadow-xl"
                  disabled={loading}
                >
                  {loading ? <Loading text="" /> : "Sign In"}
                </Button>
              </motion.div>

              <p className="text-center text-sm text-white/70">
                Don't have an account?{" "}
                <Link to="/signup" className="text-[#31D2F7] hover:text-[#4A44F2] font-semibold transition-colors">
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
