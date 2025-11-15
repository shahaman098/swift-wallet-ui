import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BalanceCardProps {
  balance: number;
  loading?: boolean;
}

const BalanceCard = ({ balance, loading = false }: BalanceCardProps) => {
  return (
    <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-elevated">
      <CardContent className="pt-6 pb-8">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <DollarSign className="h-5 w-5" />
          <p className="text-sm font-medium">Available Balance</p>
        </div>
        {loading ? (
          <div className="h-12 w-32 bg-primary-foreground/20 rounded animate-pulse" />
        ) : (
          <p className="text-5xl font-bold tracking-tight">
            ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
