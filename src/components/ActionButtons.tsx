import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Send } from "lucide-react";
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
      className="grid grid-cols-2 gap-4"
    >
      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
        <div className="liquid-glass-premium rounded-3xl p-[1px] shimmer liquid-wave">
          <Button 
            onClick={() => navigate('/add-money')}
            className="w-full h-auto py-8 flex flex-col gap-3 bg-gradient-to-br from-green-500 to-emerald-600 dark:from-[#3CF276] dark:to-[#2AB55E] hover:from-emerald-600 hover:to-green-500 dark:hover:from-[#2AB55E] dark:hover:to-[#3CF276] border-0 shadow-xl relative overflow-hidden group rounded-3xl ripple-effect transition-colors duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Animated shimmer overlay */}
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
            className="w-full h-auto py-8 flex flex-col gap-3 bg-gradient-to-br from-indigo-500 to-blue-600 dark:from-[#4A44F2] dark:to-[#31D2F7] hover:from-blue-600 hover:to-indigo-500 dark:hover:from-[#31D2F7] dark:hover:to-[#4A44F2] border-0 shadow-xl relative overflow-hidden group rounded-3xl ripple-effect transition-colors duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Animated shimmer overlay */}
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
    </motion.div>
  );
};

export default ActionButtons;
