import { useState } from "react";
import { ArrowDownToLine, Send, Network, ArrowRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SettlementStatus from "./SettlementStatus";
import TransactionDetailsModal from "./TransactionDetailsModal";

interface TransactionItemProps {
  id: string;
  type: 'deposit' | 'send';
  amount: number;
  recipient?: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  chainKey?: string;
  sourceChain?: string;
  destinationChain?: string;
  settlementState?: string;
  burnTxHash?: string;
  mintTxHash?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TransactionItem = (props: TransactionItemProps) => {
  const { 
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
  } = props;

  const [showDetails, setShowDetails] = useState(false);
  const isDeposit = type === 'deposit';
  const isCrossChain = sourceChain && destinationChain && sourceChain !== destinationChain;
  
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        x: 5,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className="flex flex-col gap-3 p-4 rounded-2xl liquid-glass hover-lift border border-white/10 backdrop-blur-xl transition-all duration-300 group cursor-pointer"
      onClick={() => setShowDetails(true)}
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
        
        <div className="flex items-center gap-3">
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
                  : status === 'pending'
                  ? 'bg-yellow-500/20 text-yellow-500'
                  : 'bg-destructive/20 text-destructive'
              }`}
              animate={{ opacity: status === 'pending' ? [0.7, 1, 0.7] : 1 }}
              transition={{ duration: 2, repeat: status === 'pending' ? Infinity : 0 }}
            >
              {status}
            </motion.span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Info className="h-4 w-4" />
          </Button>
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

      {/* Transaction Details Modal */}
      <TransactionDetailsModal 
        transaction={props}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </motion.div>
  );
};

export default TransactionItem;
