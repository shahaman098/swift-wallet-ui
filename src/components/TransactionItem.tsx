import { ArrowDownToLine, Send, Network, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import SettlementStatus from "./SettlementStatus";

interface TransactionItemProps {
  type: 'deposit' | 'send';
  amount: number;
  recipient?: string;
  date: string;
  status: 'completed' | 'pending';
  chainKey?: string;
  sourceChain?: string;
  destinationChain?: string;
  settlementState?: string;
  burnTxHash?: string;
  mintTxHash?: string;
}

const TransactionItem = ({ 
  type, 
  amount, 
  recipient, 
  date, 
  status,
  chainKey,
  sourceChain,
  destinationChain,
  settlementState,
  burnTxHash,
  mintTxHash,
}: TransactionItemProps) => {
  const isDeposit = type === 'deposit';
  const isCrossChain = sourceChain && destinationChain && sourceChain !== destinationChain;
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        x: 5,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className="flex flex-col gap-3 p-4 rounded-2xl liquid-glass hover-lift border border-white/10 backdrop-blur-xl transition-all duration-300 group"
    >
      <div className="flex items-center justify-between">
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
              {isDeposit ? 'Money Added' : `Sent to ${recipient?.substring(0, 8)}...${recipient?.substring(34)}`}
            </motion.p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-muted-foreground">{date}</p>
              {chainKey && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <Badge variant="outline" className="text-xs">
                    <Network className="h-3 w-3 mr-1" />
                    {chainKey}
                  </Badge>
                </>
              )}
            </div>
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
      </div>

      {/* Cross-chain info */}
      {isCrossChain && (
        <div className="pt-2 border-t border-border/50">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
            <Network className="h-3 w-3" />
            <span>Cross-chain transfer</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono">{sourceChain}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono">{destinationChain}</span>
          </div>
          {settlementState && (
            <SettlementStatus
              state={settlementState}
              sourceChain={sourceChain}
              destinationChain={destinationChain}
              burnTxHash={burnTxHash}
              mintTxHash={mintTxHash}
            />
          )}
        </div>
      )}
    </motion.div>
  );
};

export default TransactionItem;
