import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Clock, Flame, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface SettlementStatusProps {
  state: string;
  sourceChain?: string;
  destinationChain?: string;
  burnTxHash?: string;
  mintTxHash?: string;
  className?: string;
}

const SETTLEMENT_STATES = {
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-600', icon: Clock },
  burning: { label: 'Burning USDC', color: 'bg-orange-500/20 text-orange-600', icon: Flame },
  burned: { label: 'USDC Burned', color: 'bg-red-500/20 text-red-600', icon: Flame },
  attesting: { label: 'Attesting', color: 'bg-blue-500/20 text-blue-600', icon: Loader2 },
  attested: { label: 'Attested', color: 'bg-purple-500/20 text-purple-600', icon: Sparkles },
  minting: { label: 'Minting USDC', color: 'bg-green-500/20 text-green-600', icon: Loader2 },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-600', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'bg-red-500/20 text-red-600', icon: XCircle },
};

const SettlementStatus = ({
  state,
  sourceChain,
  destinationChain,
  burnTxHash,
  mintTxHash,
  className = "",
}: SettlementStatusProps) => {
  const status = SETTLEMENT_STATES[state as keyof typeof SETTLEMENT_STATES] || SETTLEMENT_STATES.pending;
  const Icon = status.icon;
  const isCrossChain = sourceChain && destinationChain && sourceChain !== destinationChain;
  const isAnimated = ['burning', 'attesting', 'minting'].includes(state);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Badge className={`${status.color} border-0`}>
          <Icon className={`h-3 w-3 mr-1 ${isAnimated ? 'animate-spin' : ''}`} />
          {status.label}
        </Badge>
        {isCrossChain && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="font-mono">{sourceChain}</span>
            <ArrowRight className="h-3 w-3" />
            <span className="font-mono">{destinationChain}</span>
          </div>
        )}
      </div>

      {(burnTxHash || mintTxHash) && (
        <div className="space-y-2 text-xs">
          {burnTxHash && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Flame className="h-3 w-3 text-orange-500" />
              <span className="text-muted-foreground">Burn:</span>
              <code className="text-xs font-mono break-all">{burnTxHash.substring(0, 20)}...</code>
            </div>
          )}
          {mintTxHash && (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
              <Sparkles className="h-3 w-3 text-green-500" />
              <span className="text-muted-foreground">Mint:</span>
              <code className="text-xs font-mono break-all">{mintTxHash.substring(0, 20)}...</code>
            </div>
          )}
        </div>
      )}

      {isCrossChain && (
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Cross-chain transfer via CCTP</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-border" />
            <span>CCTP Protocol</span>
            <div className="flex-1 h-px bg-border" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementStatus;

