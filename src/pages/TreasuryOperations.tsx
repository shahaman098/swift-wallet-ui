import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { smartContractAPI } from '@/api/client';
import ChainSelector from '@/components/ChainSelector';
import { Loader2, Send, Users } from 'lucide-react';

export default function TreasuryOperations() {
  const { toast } = useToast();
  const [executing, setExecuting] = useState(false);
  
  // Allocation state
  const [allocContractAddress, setAllocContractAddress] = useState('');
  const [allocChain, setAllocChain] = useState('ETH-SEPOLIA');
  const [allocRecipient, setAllocRecipient] = useState('');
  const [allocAmount, setAllocAmount] = useState('');
  const [allocReason, setAllocReason] = useState('');

  // Distribution state
  const [distContractAddress, setDistContractAddress] = useState('');
  const [distChain, setDistChain] = useState('ETH-SEPOLIA');
  const [distRecipients, setDistRecipients] = useState<string[]>(['']);
  const [distAmounts, setDistAmounts] = useState<string[]>(['']);

  const handleAllocation = async () => {
    try {
      if (!allocContractAddress || !allocRecipient || !allocAmount) {
        toast({
          title: 'Error',
          description: 'Contract address, recipient, and amount are required',
          variant: 'destructive',
        });
        return;
      }

      setExecuting(true);
      await smartContractAPI.allocate({
        contractAddress: allocContractAddress,
        chain: allocChain,
        recipient: allocRecipient,
        amount: parseFloat(allocAmount),
        reason: allocReason,
      });

      toast({
        title: 'Success',
        description: 'Allocation executed successfully',
      });

      // Reset form
      setAllocRecipient('');
      setAllocAmount('');
      setAllocReason('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to execute allocation',
        variant: 'destructive',
      });
    } finally {
      setExecuting(false);
    }
  };

  const handleDistribution = async () => {
    try {
      if (!distContractAddress || distRecipients.length === 0 || distAmounts.length === 0) {
        toast({
          title: 'Error',
          description: 'Contract address, recipients, and amounts are required',
          variant: 'destructive',
        });
        return;
      }

      const amounts = distAmounts.map(a => parseFloat(a) || 0);
      if (amounts.some(a => a <= 0)) {
        toast({
          title: 'Error',
          description: 'All amounts must be greater than zero',
          variant: 'destructive',
        });
        return;
      }

      setExecuting(true);
      await smartContractAPI.distribute({
        contractAddress: distContractAddress,
        chain: distChain,
        recipients: distRecipients.filter(r => r.trim()),
        amounts,
      });

      toast({
        title: 'Success',
        description: 'Distribution executed successfully',
      });

      // Reset form
      setDistRecipients(['']);
      setDistAmounts(['']);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to execute distribution',
        variant: 'destructive',
      });
    } finally {
      setExecuting(false);
    }
  };

  const addDistributionRecipient = () => {
    setDistRecipients([...distRecipients, '']);
    setDistAmounts([...distAmounts, '']);
  };

  const updateDistributionRecipient = (index: number, value: string) => {
    const updated = [...distRecipients];
    updated[index] = value;
    setDistRecipients(updated);
  };

  const updateDistributionAmount = (index: number, value: string) => {
    const updated = [...distAmounts];
    updated[index] = value;
    setDistAmounts(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Treasury Operations</h1>
        <p className="text-muted-foreground">
          Execute allocations and distributions on your treasury wallets
        </p>
      </div>

      <Tabs defaultValue="allocation" className="space-y-6">
        <TabsList>
          <TabsTrigger value="allocation">
            <Send className="mr-2 h-4 w-4" />
            Allocation
          </TabsTrigger>
          <TabsTrigger value="distribution">
            <Users className="mr-2 h-4 w-4" />
            Distribution
          </TabsTrigger>
        </TabsList>

        <TabsContent value="allocation">
          <Card>
            <CardHeader>
              <CardTitle>Execute Allocation</CardTitle>
              <CardDescription>
                Send funds to a single recipient from your treasury wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contract Address</Label>
                <Input
                  value={allocContractAddress}
                  onChange={(e) => setAllocContractAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>

              <div className="space-y-2">
                <Label>Blockchain</Label>
                <ChainSelector value={allocChain} onChange={setAllocChain} />
              </div>

              <div className="space-y-2">
                <Label>Recipient Address</Label>
                <Input
                  value={allocRecipient}
                  onChange={(e) => setAllocRecipient(e.target.value)}
                  placeholder="0x..."
                />
              </div>

              <div className="space-y-2">
                <Label>Amount (USDC)</Label>
                <Input
                  type="number"
                  value={allocAmount}
                  onChange={(e) => setAllocAmount(e.target.value)}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label>Reason (optional)</Label>
                <Textarea
                  value={allocReason}
                  onChange={(e) => setAllocReason(e.target.value)}
                  placeholder="Payment for services"
                  rows={3}
                />
              </div>

              <Button onClick={handleAllocation} disabled={executing} className="w-full">
                {executing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Execute Allocation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>Execute Distribution</CardTitle>
              <CardDescription>
                Send funds to multiple recipients from your treasury wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Contract Address</Label>
                <Input
                  value={distContractAddress}
                  onChange={(e) => setDistContractAddress(e.target.value)}
                  placeholder="0x..."
                />
              </div>

              <div className="space-y-2">
                <Label>Blockchain</Label>
                <ChainSelector value={distChain} onChange={setDistChain} />
              </div>

              <div className="space-y-2">
                <Label>Recipients & Amounts</Label>
                {distRecipients.map((recipient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={recipient}
                      onChange={(e) => updateDistributionRecipient(index, e.target.value)}
                      placeholder="Recipient address"
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={distAmounts[index]}
                      onChange={(e) => updateDistributionAmount(index, e.target.value)}
                      placeholder="Amount"
                      className="w-32"
                    />
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addDistributionRecipient} size="sm">
                  Add Recipient
                </Button>
              </div>

              <Button onClick={handleDistribution} disabled={executing} className="w-full">
                {executing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Users className="mr-2 h-4 w-4" />
                    Execute Distribution
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

