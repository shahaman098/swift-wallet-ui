import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, Copy, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
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

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Blockchain explorer URLs
const EXPLORER_URLS: Record<string, string> = {
  'ETH-SEPOLIA': 'https://sepolia.etherscan.io',
  'AVAX-FUJI': 'https://testnet.snowtrace.io',
  'MATIC-AMOY': 'https://amoy.polygonscan.com',
  'ARB-SEPOLIA': 'https://sepolia.arbiscan.io',
};

const TransactionDetailsModal = ({ transaction, open, onOpenChange }: TransactionDetailsModalProps) => {
  const { toast } = useToast();

  if (!transaction) return null;

  const getExplorerUrl = (chain: string, txHash?: string) => {
    const baseUrl = EXPLORER_URLS[chain];
    if (!baseUrl) return null;
    if (!txHash) return baseUrl;
    return `${baseUrl}/tx/${txHash}`;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: 'default',
      pending: 'secondary',
      failed: 'destructive',
    };

    return (
      <Badge variant={variants[status] || 'outline'} className="capitalize">
        {status}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto liquid-glass-premium">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Complete information about this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Transaction ID */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-muted-foreground">Transaction ID</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-muted/50 p-3 rounded-lg break-all font-mono">
                {transaction.id}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Amount & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Amount</label>
              <p className="text-2xl font-bold">${transaction.amount.toFixed(2)} USDC</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Status</label>
              <div className="flex items-center gap-2">
                {getStatusIcon(transaction.status)}
                {getStatusBadge(transaction.status)}
              </div>
            </div>
          </div>

          {/* Type & Settlement State */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Type</label>
              <p className="text-lg font-semibold capitalize">{transaction.type}</p>
            </div>
            {transaction.settlementState && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground">Settlement State</label>
                <Badge variant="outline" className="capitalize">
                  {transaction.settlementState}
                </Badge>
              </div>
            )}
          </div>

          <Separator />

          {/* Counterparty Details */}
          {transaction.recipient && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Recipient Address</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-muted/50 p-3 rounded-lg break-all font-mono">
                  {transaction.recipient}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(transaction.recipient!, 'Recipient address')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Note */}
          {transaction.note && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">Note</label>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">{transaction.note}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Chain Information */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground">Blockchain Details</label>
            
            {transaction.sourceChain && (
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Source Chain</p>
                  <p className="font-semibold">{transaction.sourceChain}</p>
                </div>
                {getExplorerUrl(transaction.sourceChain) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(transaction.sourceChain!), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {transaction.destinationChain && transaction.destinationChain !== transaction.sourceChain && (
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Destination Chain</p>
                  <p className="font-semibold">{transaction.destinationChain}</p>
                </div>
                {getExplorerUrl(transaction.destinationChain) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(transaction.destinationChain!), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}

            {transaction.chainKey && !transaction.sourceChain && (
              <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Chain</p>
                  <p className="font-semibold">{transaction.chainKey}</p>
                </div>
                {getExplorerUrl(transaction.chainKey) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(transaction.chainKey!), '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Transaction Hashes */}
          {(transaction.burnTxHash || transaction.mintTxHash) && (
            <>
              <Separator />
              <div className="space-y-3">
                <label className="text-sm font-semibold text-muted-foreground">Settlement Proof</label>
                
                {transaction.burnTxHash && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Burn Transaction</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted/50 p-3 rounded-lg break-all font-mono">
                        {transaction.burnTxHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.burnTxHash!, 'Burn transaction hash')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {transaction.sourceChain && getExplorerUrl(transaction.sourceChain, transaction.burnTxHash) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getExplorerUrl(transaction.sourceChain!, transaction.burnTxHash), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {transaction.mintTxHash && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Mint Transaction</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-xs bg-muted/50 p-3 rounded-lg break-all font-mono">
                        {transaction.mintTxHash}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.mintTxHash!, 'Mint transaction hash')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      {transaction.destinationChain && getExplorerUrl(transaction.destinationChain, transaction.mintTxHash) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(getExplorerUrl(transaction.destinationChain!, transaction.mintTxHash), '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Timestamps */}
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            {transaction.createdAt && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Created At</label>
                <p className="text-sm font-mono">{new Date(transaction.createdAt).toLocaleString()}</p>
              </div>
            )}
            {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Updated At</label>
                <p className="text-sm font-mono">{new Date(transaction.updatedAt).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Date (fallback) */}
          {!transaction.createdAt && transaction.date && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Date</label>
              <p className="text-sm font-mono">{transaction.date}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;

