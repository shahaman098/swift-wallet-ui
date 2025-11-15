import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, Send } from "lucide-react";
import { motion } from "framer-motion";

const ActionButtons = () => {
  const navigate = useNavigate();

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      y: -5,
      transition: { type: "spring" as const, stiffness: 400 }
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
        <Button 
          onClick={() => navigate('/add-money')}
          className="w-full h-auto py-8 flex flex-col gap-3 bg-gradient-to-br from-[#3CF276] to-[#2AB55E] hover:from-[#2AB55E] hover:to-[#3CF276] border-0 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <motion.div
            animate={{ rotate: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDownToLine className="h-7 w-7 relative z-10" />
          </motion.div>
          <span className="text-lg font-bold relative z-10">Add Money</span>
        </Button>
      </motion.div>
      
      <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
        <Button 
          onClick={() => navigate('/send-payment')}
          className="w-full h-auto py-8 flex flex-col gap-3 bg-gradient-to-br from-[#4A44F2] to-[#31D2F7] hover:from-[#31D2F7] hover:to-[#4A44F2] border-0 shadow-xl relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <motion.div
            animate={{ x: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Send className="h-7 w-7 relative z-10" />
          </motion.div>
          <span className="text-lg font-bold relative z-10">Send Payment</span>
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ActionButtons;
