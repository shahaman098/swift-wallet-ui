import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { smartContractAPI } from '@/api/client';
import ChainSelector from '@/components/ChainSelector';
import { Loader2, Shield, Plus } from 'lucide-react';

interface Policy {
  id: string;
  name: string;
  address: string;
  chain: string;
  config: any;
  transactionHash?: string;
  createdAt: string;
}

export default function PolicyManagement() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [creating, setCreating] = useState(false);
  
  // Policy engine deployment
  const [policyEngineChain, setPolicyEngineChain] = useState('ETH-SEPOLIA');
  const [policyEngineAddress, setPolicyEngineAddress] = useState('');
  
  // Policy creation
  const [policyName, setPolicyName] = useState('');
  const [policyConfig, setPolicyConfig] = useState('');
  const [selectedChain, setSelectedChain] = useState('ETH-SEPOLIA');

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const response = await smartContractAPI.getPolicies();
      setPolicies(response.data.policies || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load policies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeployPolicyEngine = async () => {
    try {
      setDeploying(true);
      const response = await smartContractAPI.deployPolicyEngine({ chain: policyEngineChain });
      setPolicyEngineAddress(response.data.policyEngine.contractAddress);
      toast({
        title: 'Success',
        description: 'Policy engine deployed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deploy policy engine',
        variant: 'destructive',
      });
    } finally {
      setDeploying(false);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      if (!policyName || !policyEngineAddress) {
        toast({
          title: 'Error',
          description: 'Policy name and policy engine address are required',
          variant: 'destructive',
        });
        return;
      }

      setCreating(true);
      let config;
      try {
        config = policyConfig ? JSON.parse(policyConfig) : {};
      } catch (e) {
        toast({
          title: 'Error',
          description: 'Invalid JSON configuration',
          variant: 'destructive',
        });
        return;
      }

      await smartContractAPI.createPolicy({
        name: policyName,
        config,
        policyEngineAddress,
        chain: selectedChain,
      });

      toast({
        title: 'Success',
        description: 'Policy created successfully',
      });
      
      await loadPolicies();
      setPolicyName('');
      setPolicyConfig('');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create policy',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Policy Management</h1>
        <p className="text-muted-foreground">
          Deploy policy engines and create allocation/distribution policies
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Deploy Policy Engine</CardTitle>
            <CardDescription>
              Deploy a policy engine contract to manage treasury policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Blockchain</Label>
              <ChainSelector value={policyEngineChain} onChange={setPolicyEngineChain} />
            </div>

            {policyEngineAddress && (
              <div className="p-4 bg-muted rounded-lg">
                <Label className="text-xs text-muted-foreground">Policy Engine Address</Label>
                <p className="font-mono text-sm break-all mt-1">{policyEngineAddress}</p>
              </div>
            )}

            <Button onClick={handleDeployPolicyEngine} disabled={deploying} className="w-full">
              {deploying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Deploy Policy Engine
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Policy</CardTitle>
            <CardDescription>
              Create a new policy for allocations and distributions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Policy Name</Label>
              <Input
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                placeholder="Monthly allocation limit"
              />
            </div>

            <div className="space-y-2">
              <Label>Policy Engine Address</Label>
              <Input
                value={policyEngineAddress}
                onChange={(e) => setPolicyEngineAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div className="space-y-2">
              <Label>Blockchain</Label>
              <ChainSelector value={selectedChain} onChange={setSelectedChain} />
            </div>

            <div className="space-y-2">
              <Label>Policy Configuration (JSON)</Label>
              <Textarea
                value={policyConfig}
                onChange={(e) => setPolicyConfig(e.target.value)}
                placeholder='{"maxAmount": 10000, "allowedRecipients": ["0x..."], "timeRestrictions": {}}'
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Define policy rules in JSON format (optional)
              </p>
            </div>

            <Button onClick={handleCreatePolicy} disabled={creating} className="w-full">
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Policy
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>My Policies</CardTitle>
          <CardDescription>View and manage your policies</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : policies.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No policies created yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {policies.map((policy) => (
                <Card key={policy.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{policy.name}</h3>
                        <span className="text-sm text-muted-foreground">{policy.chain}</span>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Policy Address</Label>
                        <p className="font-mono text-sm break-all">{policy.address}</p>
                      </div>
                      {policy.transactionHash && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Transaction Hash</Label>
                          <p className="font-mono text-xs break-all">{policy.transactionHash}</p>
                        </div>
                      )}
                      {policy.config && Object.keys(policy.config).length > 0 && (
                        <div>
                          <Label className="text-xs text-muted-foreground">Configuration</Label>
                          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                            {JSON.stringify(policy.config, null, 2)}
                          </pre>
                        </div>
                      )}
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

