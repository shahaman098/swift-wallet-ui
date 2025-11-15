import { ArrowDownToLine, Send } from "lucide-react";
import { motion } from "framer-motion";

interface TransactionItemProps {
  type: 'deposit' | 'send';
  amount: number;
  recipient?: string;
  date: string;
  status: 'completed' | 'pending';
}

const TransactionItem = ({ type, amount, recipient, date, status }: TransactionItemProps) => {
  const isDeposit = type === 'deposit';
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        x: 5,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className="flex items-center justify-between p-4 rounded-2xl liquid-glass hover-lift border border-white/10 backdrop-blur-xl transition-all duration-300 group"
    >
      <div className="flex items-center gap-4">
        <motion.div 
          className={`p-3 rounded-xl relative overflow-hidden ${
            isDeposit 
              ? 'bg-gradient-to-br from-accent/20 to-accent/10' 
              : 'bg-gradient-to-br from-primary/20 to-primary/10'
          }`}
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6 }}
          />
          {isDeposit ? (
            <ArrowDownToLine className={`h-5 w-5 relative z-10 ${
              isDeposit ? 'text-accent' : 'text-primary'
            }`} />
          ) : (
            <Send className={`h-5 w-5 relative z-10 ${
              isDeposit ? 'text-accent' : 'text-primary'
            }`} />
          )}
        </motion.div>
        
        <div>
          <motion.p 
            className="font-semibold text-foreground group-hover:text-primary transition-colors"
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
          >
            {isDeposit ? 'Money Added' : `Sent to ${recipient}`}
          </motion.p>
          <p className="text-sm text-muted-foreground">{date}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-1">
        <motion.p 
          className={`font-bold text-lg ${
            isDeposit ? 'text-accent' : 'text-primary'
          }`}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
        >
          {isDeposit ? '+' : '-'}${amount.toFixed(2)}
        </motion.p>
        <motion.span 
          className={`text-xs px-2 py-1 rounded-full ${
            status === 'completed' 
              ? 'bg-accent/20 text-accent' 
              : 'bg-yellow-500/20 text-yellow-500'
          }`}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {status}
        </motion.span>
      </div>
    </motion.div>
  );
};

export default TransactionItem;
