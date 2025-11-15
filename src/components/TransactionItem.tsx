import { ArrowDownToLine, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.02, x: 5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border border-border/50 hover:border-primary/30 transition-all shadow-sm hover:shadow-xl backdrop-blur-sm bg-card/50">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity" />
        
        <CardContent className="p-5 relative">
          <div className="flex items-center gap-4">
            <motion.div 
              className={`p-3 rounded-2xl relative ${
                isDeposit 
                  ? 'bg-gradient-to-br from-[#3CF276]/20 to-[#2AB55E]/10' 
                  : 'bg-gradient-to-br from-[#4A44F2]/20 to-[#31D2F7]/10'
              }`}
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              {isDeposit ? (
                <ArrowDownToLine className="h-6 w-6 text-[#3CF276]" />
              ) : (
                <Send className="h-6 w-6 text-[#4A44F2]" />
              )}
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground truncate text-base">
                {isDeposit ? 'Money Added' : `Sent to ${recipient}`}
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">{date}</p>
            </div>
            
            <div className="text-right">
              <motion.p 
                className={`font-bold text-lg ${isDeposit ? 'text-[#3CF276]' : 'text-foreground'}`}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                {isDeposit ? '+' : '-'}${amount.toFixed(2)}
              </motion.p>
              {status === 'completed' && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#3CF276]" />
                  <span className="font-medium">Completed</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TransactionItem;
