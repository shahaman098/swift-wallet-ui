import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Send, Users, QrCode, Brain } from "lucide-react";
import { motion } from "framer-motion";

const ActionButtons = () => {
  const navigate = useNavigate();

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      y: -8,
      transition: { type: "spring" as const, stiffness: 400, damping: 10 }
    },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="space-y-4"
    >
      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <div className="liquid-glass-premium rounded-3xl p-[1px] shimmer liquid-wave">
            <Button 
              onClick={() => navigate('/add-money')}
              className="w-full h-auto py-8 flex flex-col gap-3 bg-gradient-to-br from-success to-success/80 hover:from-success/80 hover:to-success border-0 shadow-xl relative overflow-hidden group rounded-3xl ripple-effect"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              />
              
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  y: [0, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowDownToLine className="h-7 w-7 relative z-10" />
              </motion.div>
              <span className="text-lg font-bold relative z-10">Add Money</span>
            </Button>
          </div>
        </motion.div>
        
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <div className="liquid-glass-premium rounded-3xl p-[1px] shimmer liquid-wave">
            <Button 
              onClick={() => navigate('/send-payment')}
              className="w-full h-auto py-8 flex flex-col gap-3 bg-gradient-to-br from-primary to-accent hover:from-accent hover:to-primary border-0 shadow-xl relative overflow-hidden group rounded-3xl ripple-effect"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "200%" }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
              />
              
              <motion.div
                animate={{ 
                  x: [0, 5, 0],
                  rotate: [0, 15, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Send className="h-7 w-7 relative z-10" />
              </motion.div>
              <span className="text-lg font-bold relative z-10">Send Payment</span>
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div 
          variants={buttonVariants} 
          whileHover="hover" 
          whileTap="tap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="liquid-glass rounded-2xl p-[1px]">
            <Button 
              onClick={() => navigate('/split-payment')}
              variant="outline"
              className="w-full h-auto py-6 flex flex-col gap-2 bg-card/50 hover:bg-card border-primary/20 rounded-2xl"
            >
              <Users className="h-6 w-6 text-primary" />
              <span className="text-sm font-semibold">Split Payment</span>
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          variants={buttonVariants} 
          whileHover="hover" 
          whileTap="tap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="liquid-glass rounded-2xl p-[1px]">
            <Button 
              onClick={() => navigate('/request-payment')}
              variant="outline"
              className="w-full h-auto py-6 flex flex-col gap-2 bg-card/50 hover:bg-card border-accent/20 rounded-2xl"
            >
              <QrCode className="h-6 w-6 text-accent" />
              <span className="text-sm font-semibold">Request Payment</span>
            </Button>
          </div>
        </motion.div>

        <motion.div 
          variants={buttonVariants} 
          whileHover="hover" 
          whileTap="tap"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="liquid-glass rounded-2xl p-[1px]">
            <Button 
              onClick={() => navigate('/treasury')}
              variant="outline"
              className="w-full h-auto py-6 flex flex-col gap-2 bg-card/50 hover:bg-card border-[#4A44F2]/20 rounded-2xl"
            >
              <Brain className="h-6 w-6 text-[#4A44F2]" />
              <span className="text-sm font-semibold">Treasury</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ActionButtons;
