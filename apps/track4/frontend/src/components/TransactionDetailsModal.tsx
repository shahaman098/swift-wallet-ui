import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useMemo } from "react";

type Tx = {
  id: string;
  type: "deposit" | "send" | string;
  amount: number;
  recipient?: string;
  date: string;
  status: string;
  raw?: any;
};

export default function TransactionDetailsModal({
  open,
  onOpenChange,
  tx
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tx: Tx | null;
}) {
  const pretty = useMemo(() => {
    if (!tx) return "";
    try {
      return JSON.stringify(tx.raw ?? tx, null, 2);
    } catch {
      return "";
    }
  }, [tx]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
        </DialogHeader>
        {!tx ? (
          <div className="text-sm text-muted-foreground">No transaction selected.</div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm">
              <div className="font-medium">Type</div>
              <div className="text-muted-foreground">{tx.type}</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Amount</div>
              <div className="text-muted-foreground">{tx.amount} USDC</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Date</div>
              <div className="text-muted-foreground">{tx.date}</div>
            </div>
            <div className="text-sm">
              <div className="font-medium">Status</div>
              <div className="text-muted-foreground">{tx.status}</div>
            </div>
            {tx.recipient && (
              <div className="text-sm">
                <div className="font-medium">Counterparty</div>
                <div className="text-muted-foreground break-all">{tx.recipient}</div>
              </div>
            )}
            {pretty && (
              <div className="text-sm">
                <div className="font-medium mb-1">Raw</div>
                <pre className="p-3 rounded bg-muted overflow-auto text-xs">{pretty}</pre>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


