import { DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface BalanceCardProps {
  balance: number;
  loading?: boolean;
}

const sparklineData = [
  { value: 1000 },
  { value: 1050 },
  { value: 1100 },
  { value: 1080 },
  { value: 1150 },
  { value: 1200 },
  { value: 1234.56 },
];

const BalanceCard = ({ balance, loading = false }: BalanceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="hover-lift"
    >
      <Card className="relative overflow-hidden border-0 shadow-2xl liquid-glass-premium shimmer rounded-3xl">
        {/* Liquid glass background - black/white/gray only */}
        <div className="absolute inset-0 bg-black opacity-50" />
        
        {/* Subtle animated overlay */}
        <motion.div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
          }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full blur-sm"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 5 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          />
        ))}

        <CardContent className="relative pt-8 pb-10 px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <DollarSign className="h-5 w-5 text-white/90" />
              </motion.div>
              <p className="text-sm font-semibold text-white/90 tracking-wide uppercase">Available Balance</p>
            </div>
              <motion.div
                className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="text-xs font-medium" style={{ color: "rgba(255, 255, 255, 0.8)" }}>Live</span>
              </motion.div>
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
            <>
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
                  className="flex items-center gap-1"
                  style={{ color: "rgba(255, 255, 255, 0.7)" }}
                >
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">+2.5% this month</span>
                </motion.div>
              </motion.div>

              {/* Sparkline Chart */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 h-16"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="rgba(255, 255, 255, 0.7)" 
                      strokeWidth={2}
                      dot={false}
                      animationDuration={1500}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BalanceCard;
