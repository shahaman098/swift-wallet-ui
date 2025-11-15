import { ArrowDownToLine, Send, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-full ${isDeposit ? 'bg-accent/10' : 'bg-primary/10'}`}>
            {isDeposit ? (
              <ArrowDownToLine className="h-5 w-5 text-accent" />
            ) : (
              <Send className="h-5 w-5 text-primary" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">
              {isDeposit ? 'Money Added' : `Sent to ${recipient}`}
            </p>
            <p className="text-sm text-muted-foreground">{date}</p>
          </div>
          
          <div className="text-right">
            <p className={`font-bold ${isDeposit ? 'text-accent' : 'text-foreground'}`}>
              {isDeposit ? '+' : '-'}${amount.toFixed(2)}
            </p>
            {status === 'completed' && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3 w-3" />
                <span>Completed</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionItem;
