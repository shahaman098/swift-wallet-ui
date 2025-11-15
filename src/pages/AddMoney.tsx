import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import InputField from "@/components/InputField";
import Loading from "@/components/Loading";
import Navbar from "@/components/Navbar";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

const AddMoney = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const quickAmounts = [50, 100, 250, 500];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      toast({
        title: "Money added successfully",
        description: `$${parseFloat(amount).toFixed(2)} has been added to your account.`,
      });
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-md">
          <Card className="shadow-elevated text-center">
            <CardContent className="pt-12 pb-8">
              <div className="mx-auto w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Money Added!</h2>
              <p className="text-muted-foreground mb-4">
                ${parseFloat(amount).toFixed(2)} has been added to your account
              </p>
              <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-md">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="shadow-elevated">
          <CardHeader>
            <CardTitle className="text-2xl">Add Money</CardTitle>
            <CardDescription>Deposit funds to your account instantly</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <InputField
                  label="Amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={setAmount}
                  required
                />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Quick amounts</p>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <Button
                        key={quickAmount}
                        type="button"
                        variant="outline"
                        onClick={() => setAmount(quickAmount.toString())}
                        className="h-12"
                      >
                        ${quickAmount}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Deposit amount</span>
                  <span className="font-medium">
                    ${amount ? parseFloat(amount).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing fee</span>
                  <span className="font-medium text-accent">Free</span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between font-semibold">
                  <span>You'll receive</span>
                  <span>${amount ? parseFloat(amount).toFixed(2) : '0.00'}</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-accent hover:bg-accent/90"
                disabled={loading}
              >
                {loading ? <Loading text="" /> : "Add Money"}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Funds will be available instantly in your account
              </p>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AddMoney;
