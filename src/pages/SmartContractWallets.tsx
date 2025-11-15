import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { smartContractAPI } from '@/api/client';
import ChainSelector from '@/components/ChainSelector';
import { Loader2, Wallet, Shield, Zap } from 'lucide-react';

interface SmartContractWallet {
  id: string;
  type: 'treasury' | 'safe';
  address: string;
  chain: string;
  chainId: number;
  deploymentTxHash?: string;
  owners?: string[];
  threshold?: number;
  createdAt: string;
}

export default function SmartContractWallets() {
  const { toast } = useToast();
  const [wallets, setWallets] = useState<SmartContractWallet[]>([]);
  const [loading, setLoading] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [selectedChain, setSelectedChain] = useState<string>('ETH-SEPOLIA');
  const [walletType, setWalletType] = useState<'treasury' | 'safe'>('treasury');
  const [ownerAddress, setOwnerAddress] = useState('');
  const [policyEngineAddress, setPolicyEngineAddress] = useState('');
  const [safeOwners, setSafeOwners] = useState<string[]>(['']);
  const [safeThreshold, setSafeThreshold] = useState(1);

  useEffect(() => {
    loadWallets();
  }, []);

  const loadWallets = async () => {
    try {
      setLoading(true);
      const response = await smartContractAPI.getWallets();
      setWallets(response.data.wallets || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to load wallets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeploy = async () => {
    try {
      setDeploying(true);
      const deployData: any = {
        walletType,
        chain: selectedChain,
      };

      if (walletType === 'treasury') {
        if (ownerAddress) deployData.ownerAddress = ownerAddress;
        if (policyEngineAddress) deployData.policyEngineAddress = policyEngineAddress;
      } else {
        deployData.owners = safeOwners.filter(o => o.trim());
        deployData.threshold = safeThreshold;
      }

      const response = await smartContractAPI.deployWallet(deployData);
      toast({
        title: 'Success',
        description: 'Smart contract wallet deployed successfully',
      });
      
      await loadWallets();
      
      // Reset form
      setOwnerAddress('');
      setPolicyEngineAddress('');
      setSafeOwners(['']);
      setSafeThreshold(1);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to deploy wallet',
        variant: 'destructive',
      });
    } finally {
      setDeploying(false);
    }
  };

  const addSafeOwner = () => {
    setSafeOwners([...safeOwners, '']);
  };

  const updateSafeOwner = (index: number, value: string) => {
    const updated = [...safeOwners];
    updated[index] = value;
    setSafeOwners(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <Navbar />
      <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Smart Contract Wallets</h1>
        <p className="text-muted-foreground">
          Deploy and manage treasury wallets and Safe wallets with policy engines
        </p>
      </div>

      <Tabs defaultValue="deploy" className="space-y-6">
        <TabsList>
          <TabsTrigger value="deploy">Deploy Wallet</TabsTrigger>
          <TabsTrigger value="wallets">My Wallets</TabsTrigger>
        </TabsList>

        <TabsContent value="deploy">
          <Card>
            <CardHeader>
              <CardTitle>Deploy Smart Contract Wallet</CardTitle>
              <CardDescription>
                Choose between a Treasury Wallet or Safe Wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Wallet Type</Label>
                <Select value={walletType} onValueChange={(v) => setWalletType(v as 'treasury' | 'safe')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="treasury">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Treasury Wallet
                      </div>
                    </SelectItem>
                    <SelectItem value="safe">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        Safe Wallet
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Blockchain</Label>
                <ChainSelector value={selectedChain} onChange={setSelectedChain} />
              </div>

              {walletType === 'treasury' && (
                <>
                  <div className="space-y-2">
                    <Label>Owner Address (optional)</Label>
                    <Input
                      value={ownerAddress}
                      onChange={(e) => setOwnerAddress(e.target.value)}
                      placeholder="0x..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Policy Engine Address (optional)</Label>
                    <Input
                      value={policyEngineAddress}
                      onChange={(e) => setPolicyEngineAddress(e.target.value)}
                      placeholder="0x..."
                    />
                  </div>
                </>
              )}

              {walletType === 'safe' && (
                <>
                  <div className="space-y-2">
                    <Label>Owners</Label>
                    {safeOwners.map((owner, index) => (
                      <Input
                        key={index}
                        value={owner}
                        onChange={(e) => updateSafeOwner(index, e.target.value)}
                        placeholder={`Owner ${index + 1} address`}
                        className="mb-2"
                      />
                    ))}
                    <Button type="button" variant="outline" onClick={addSafeOwner} size="sm">
                      Add Owner
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>Threshold (minimum signatures required)</Label>
                    <Input
                      type="number"
                      min="1"
                      max={safeOwners.length}
                      value={safeThreshold}
                      onChange={(e) => setSafeThreshold(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </>
              )}

              <Button onClick={handleDeploy} disabled={deploying} className="w-full">
                {deploying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Deploy Wallet
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallets">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : wallets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No smart contract wallets deployed yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {wallets.map((wallet) => (
                <Card key={wallet.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {wallet.type === 'safe' ? (
                          <Wallet className="h-5 w-5" />
                        ) : (
                          <Shield className="h-5 w-5" />
                        )}
                        <CardTitle className="capitalize">{wallet.type} Wallet</CardTitle>
                      </div>
                      <span className="text-sm text-muted-foreground">{wallet.chain}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Address</Label>
                      <p className="font-mono text-sm break-all">{wallet.address}</p>
                    </div>
                    {wallet.deploymentTxHash && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Deployment TX</Label>
                        <p className="font-mono text-sm break-all">{wallet.deploymentTxHash}</p>
                      </div>
                    )}
                    {wallet.type === 'safe' && wallet.owners && (
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          Owners ({wallet.threshold}/{wallet.owners.length} threshold)
                        </Label>
                        <div className="space-y-1">
                          {wallet.owners.map((owner, idx) => (
                            <p key={idx} className="font-mono text-xs break-all">{owner}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}

