import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, ArrowRightLeft, PiggyBank, FileCode } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";

const FeaturePreviewCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="hover-lift"
    >
      <Card className="liquid-glass-premium border-0 shadow-xl rounded-3xl overflow-hidden shimmer h-full">
        <CardHeader className="border-b border-white/10 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="mt-1">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Preview only. Access from dashboard after login.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const Welcome = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 relative overflow-hidden">
      {/* Subtle animated Arc background */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 1000 1000">
          {[...Array(20)].map((_, i) => (
            <motion.circle
              key={i}
              cx={Math.random() * 1000}
              cy={Math.random() * 1000}
              r="2"
              className="fill-primary"
              animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.5, 1] }}
              transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <motion.line
              key={`line-${i}`}
              x1={Math.random() * 1000}
              y1={Math.random() * 1000}
              x2={Math.random() * 1000}
              y2={Math.random() * 1000}
              className="stroke-accent"
              strokeWidth="0.5"
              opacity="0.2"
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
            />
          ))}
        </svg>
      </div>

      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl relative z-10">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src="/arc.svg" alt="Arc" className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl md:text-6xl font-extrabold text-arc-gradient">
              Finance that runs itself
            </h1>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Bring USDC from any chain, automate payouts and treasury rules, and pay in‑app — all powered by Arc’s USDC‑as‑gas and Circle Wallets, CCTP, and Gateway.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Button size="lg" className="px-8 py-6 text-lg font-semibold" asChild>
              <Link to="/login">Get Started</Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights (previews only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <FeaturePreviewCard
            icon={Wallet}
            title="Embedded Wallet"
            description="Email signup → wallet ready. No seed phrases. USDC-as-gas on Arc."
          />
          <FeaturePreviewCard
            icon={ArrowRightLeft}
            title="Add Money (Cross‑Chain)"
            description="Guided CCTP flow: Initiated → Message detected → Attestation → Minted on Arc."
          />
          <FeaturePreviewCard
            icon={PiggyBank}
            title="Treasury Engine"
            description="Rules like 10% taxes, 5% emergency, 2% donations — scheduled and auditable."
          />
          <FeaturePreviewCard
            icon={FileCode}
            title="Programmable Money Studio"
            description="Track 1: set recipient shares and frequency; contract executes automated splits."
          />
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          Powered by <span className="font-medium text-foreground">Arc</span> •{" "}
          <span className="font-medium text-foreground">Circle Wallets</span> •{" "}
          <span className="font-medium text-foreground">CCTP</span> •{" "}
          <span className="font-medium text-foreground">Gateway</span>
        </div>
      </main>
    </div>
  );
};

export default Welcome;


