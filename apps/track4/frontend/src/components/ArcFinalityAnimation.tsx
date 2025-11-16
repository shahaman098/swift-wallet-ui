import { motion } from "framer-motion";
import { CheckCircle2, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface ArcFinalityAnimationProps {
  onComplete?: () => void;
}

const ArcFinalityAnimation = ({ onComplete }: ArcFinalityAnimationProps) => {
  const [finalityTime, setFinalityTime] = useState(0);
  const [isFinalized, setIsFinalized] = useState(false);

  useEffect(() => {
    // Simulate Arc's sub-second finality (90-200ms)
    const targetTime = 90 + Math.random() * 110; // Random between 90-200ms
    const interval = setInterval(() => {
      setFinalityTime((prev) => {
        if (prev >= targetTime) {
          clearInterval(interval);
          setIsFinalized(true);
          if (onComplete) {
            setTimeout(onComplete, 1000);
          }
          return targetTime;
        }
        return prev + 10;
      });
    }, 10);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-8">
      {/* Pulsating Arc Ring Animation */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-64 h-64 rounded-full bg-gradient-to-r from-primary via-accent to-primary"
          style={{ filter: "blur(40px)" }}
        />
      </div>

      {/* Finality Timer and Badge */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="relative z-10 flex flex-col items-center gap-4"
      >
        {/* Timer Display */}
        <div className="liquid-glass-premium px-8 py-4 rounded-2xl border border-primary/20">
          <motion.div
            animate={{
              scale: isFinalized ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3"
          >
            <Zap className="h-6 w-6 text-accent" />
            <div className="text-center">
              <div className="text-sm text-muted-foreground font-medium mb-1">
                Transaction Finality
              </div>
              <div className="text-3xl font-bold text-gradient">
                {finalityTime.toFixed(0)}ms
              </div>
            </div>
          </motion.div>
        </div>

        {/* Finalized Badge */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ 
            y: isFinalized ? 0 : 20, 
            opacity: isFinalized ? 1 : 0 
          }}
          transition={{ delay: 0.3 }}
          className="liquid-glass-premium px-6 py-3 rounded-full border-2 border-primary/30 flex items-center gap-2 shadow-glow"
        >
          <motion.div
            animate={{
              scale: isFinalized ? [1, 1.2, 1] : 1,
              rotate: isFinalized ? [0, 360] : 0,
            }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircle2 className="h-5 w-5 text-success" />
          </motion.div>
          <span className="font-bold text-arc-gradient">Finalized on Arc</span>
        </motion.div>

        {/* Floating Arc Logo/Badge */}
        <motion.div
          animate={{
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
        >
          <span className="text-xs font-semibold text-muted-foreground tracking-wider">
            POWERED BY ARC BLOCKCHAIN
          </span>
        </motion.div>
      </motion.div>

      {/* Animated Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 2) * 40}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2 + i * 0.3,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
};

export default ArcFinalityAnimation;
