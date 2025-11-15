import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { smartContractAPI } from '@/api/client';
import ChainSelector from '@/components/ChainSelector';
import { Loader2, Zap, Play, Pause } from 'lucide-react';

interface Automation {
  id: string;
  name: string;
  type: 'allocation' | 'distribution';
  contractAddress: string;
  chain: string;
  schedule: any;
  conditions: any;
  recipients: string[];
  amounts: number[];
  active: boolean;
  createdAt: string;
}

export default function TreasuryAutomation() {
  const { toast } = useToast();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [triggering, setTriggering] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'allocation' | 'distribution'>('allocation');
  const [contractAddress, setContractAddress] = useState('');
  const [chain, setChain] = useState('ETH-SEPOLIA');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [recipients, setRecipients] = useState<string[]>(['']);
  const [amounts, setAmounts] = useState<string[]>(['']);
  const [active, setActive] = useState(true);

  useEffect(() => {
    loadAutomations();
  }, []);

  const loadAutomations = async () => {
    try {
      setLoading(true);
      const response = await smartContractAPI.getAutomations();
      setAutomations(response.data.automations || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load automations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!name || !contractAddress) {
        toast({
          title: 'Error',
          description: 'Name and contract address are required',
          variant: 'destructive',
        });
        return;
      }

      setCreating(true);
      const automationData: any = {
        name,
        type,
        contractAddress,
        chain,
        active,
        recipients: type === 'allocation' ? [recipient] : recipients.filter(r => r.trim()),
        amounts: type === 'allocation' ? [parseFloat(amount)] : amounts.map(a => parseFloat(a) || 0),
      };

      await smartContractAPI.createAutomation(automationData);
      toast({
        title: 'Success',
        description: 'Automation created successfully',
      });
      
      await loadAutomations();
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create automation',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleTrigger = async (automationId: string) => {
    try {
      setTriggering(automationId);
      await smartContractAPI.triggerAutomation(automationId);
      toast({
        title: 'Success',
        description: 'Automation triggered successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to trigger automation',
        variant: 'destructive',
      });
    } finally {
      setTriggering(null);
    }
  };

  const handleToggleActive = async (automationId: string, currentActive: boolean) => {
    try {
      await smartContractAPI.updateAutomation(automationId, { active: !currentActive });
      toast({
        title: 'Success',
        description: `Automation ${!currentActive ? 'activated' : 'deactivated'}`,
      });
      await loadAutomations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update automation',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setName('');
    setContractAddress('');
    setRecipient('');
    setAmount('');
    setReason('');
    setRecipients(['']);
    setAmounts(['']);
    setActive(true);
  };

  const addRecipient = () => {
    setRecipients([...recipients, '']);
    setAmounts([...amounts, '']);
  };

  const updateRecipient = (index: number, value: string) => {
    const updated = [...recipients];
    updated[index] = value;
    setRecipients(updated);
  };

  const updateAmount = (index: number, value: string) => {
    const updated = [...amounts];
    updated[index] = value;
    setAmounts(updated);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Treasury Automation</h1>
        <p className="text-muted-foreground">
          Configure automated allocations and distributions for your treasury wallets
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Create Automation</CardTitle>
            <CardDescription>Set up automated treasury operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Monthly payroll"
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'allocation' | 'distribution')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allocation">Allocation (Single Recipient)</SelectItem>
                  <SelectItem value="distribution">Distribution (Multiple Recipients)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contract Address</Label>
              <Input
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div className="space-y-2">
              <Label>Blockchain</Label>
              <ChainSelector value={chain} onChange={setChain} />
            </div>

            {type === 'allocation' ? (
              <>
                <div className="space-y-2">
                  <Label>Recipient Address</Label>
                  <Input
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="0x..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount (USDC)</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reason (optional)</Label>
                  <Textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Payment for services"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Recipients & Amounts</Label>
                  {recipients.map((rec, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={rec}
                        onChange={(e) => updateRecipient(index, e.target.value)}
                        placeholder="Recipient address"
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={amounts[index]}
                        onChange={(e) => updateAmount(index, e.target.value)}
                        placeholder="Amount"
                        className="w-32"
                      />
                    </div>
                  ))}
                  <Button type="button" variant="outline" onClick={addRecipient} size="sm">
                    Add Recipient
                  </Button>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={active}
                onCheckedChange={setActive}
              />
              <Label htmlFor="active">Active</Label>
            </div>

            <Button onClick={handleCreate} disabled={creating} className="w-full">
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Create Automation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Automations</CardTitle>
            <CardDescription>Manage your treasury automations</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : automations.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No automations created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {automations.map((automation) => (
                  <Card key={automation.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">{automation.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">
                            {automation.type} • {automation.chain}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(automation.id, automation.active)}
                          >
                            {automation.active ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTrigger(automation.id)}
                            disabled={triggering === automation.id || !automation.active}
                          >
                            {triggering === automation.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Contract: </span>
                          <span className="font-mono text-xs break-all">{automation.contractAddress}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Recipients: </span>
                          <span>{automation.recipients.length}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Total Amount: </span>
                          <span>{automation.amounts.reduce((sum, a) => sum + a, 0).toFixed(2)} USDC</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Status: </span>
                          <span className={automation.active ? 'text-green-600' : 'text-gray-500'}>
                            {automation.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

