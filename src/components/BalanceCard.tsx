import { DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface BalanceCardProps {
  balance: number;
  loading?: boolean;
}

const BalanceCard = ({ balance, loading = false }: BalanceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F2D] via-[#4A44F2] to-[#31D2F7]" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm" />
        
        {/* Animated glow effect */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-2xl opacity-30 blur-xl"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <CardContent className="relative pt-8 pb-10 px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-3"
          >
            <DollarSign className="h-5 w-5 text-white/90" />
            <p className="text-sm font-semibold text-white/90 tracking-wide uppercase">Available Balance</p>
          </motion.div>
          
          {loading ? (
            <div className="space-y-3">
              <motion.div 
                className="h-14 w-48 bg-white/20 rounded-xl"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  background: "linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0.1) 100%)",
                  backgroundSize: "200% 100%",
                }}
              />
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            >
              <p className="text-6xl font-bold text-white tracking-tight mb-2">
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-1 text-[#3CF276]"
              >
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-semibold">+2.5% this month</span>
              </motion.div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BalanceCard;
