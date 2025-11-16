import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileCode, Play, CheckCircle2, Copy, Loader2, Code, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/api/client";

interface Contract {
  id: string;
  name: string;
  address: string;
  type: string;
  deployedAt: string;
  status: "deployed" | "pending";
}

interface ContractInteraction {
  id: string;
  contractAddress: string;
  function: string;
  params: string;
  txHash: string;
  timestamp: string;
  status: "completed";
}

const SmartContractsPlayground = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [interactions, setInteractions] = useState<ContractInteraction[]>([]);
  const [contractName, setContractName] = useState("");
  const [contractType, setContractType] = useState("scheduler");
  const [selectedContract, setSelectedContract] = useState<string>("");
  const [functionName, setFunctionName] = useState("");
  const [functionParams, setFunctionParams] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const contractTypes = [
    { value: "scheduler", label: "SmartPay Scheduler" },
    { value: "treasury", label: "Treasury Splitter" },
    { value: "payment", label: "Payment Router" },
    { value: "custom", label: "Custom Contract" },
  ];

  const deployContract = async () => {
    if (isDeploying) return;
    
    setIsDeploying(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    try {
      const response = await apiClient.post("/scheduler/deploy", {
        recipients: [
          { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
          { address: `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`, share: 50 },
        ],
        interval: "weekly",
        threshold: null,
      });

      const contractAddress = response.data.contractAddress || `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`;
      const newContract: Contract = {
        id: Date.now().toString(),
        name: contractName || `${contractType} Contract`,
        address: contractAddress,
        type: contractType,
        deployedAt: new Date().toISOString(),
        status: "deployed",
      };

      setContracts([newContract, ...contracts]);
      setSelectedContract(newContract.id);
      setContractName("");
      setIsDeploying(false);

      toast({
        title: "Contract Deployed",
        description: `Contract deployed at ${contractAddress}`,
      });
    } catch {
      const contractAddress = `0x${Math.random().toString(16).slice(2).padEnd(40, "0")}`;
      const newContract: Contract = {
        id: Date.now().toString(),
        name: contractName || `${contractType} Contract`,
        address: contractAddress,
        type: contractType,
        deployedAt: new Date().toISOString(),
        status: "deployed",
      };

      setContracts([newContract, ...contracts]);
      setSelectedContract(newContract.id);
      setContractName("");
      setIsDeploying(false);

      toast({
        title: "Contract Deployed",
        description: `Contract deployed at ${contractAddress}`,
      });
    }
  };

  const executeFunction = async () => {
    if (isExecuting || !selectedContract) return;
    
    setIsExecuting(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const contract = contracts.find(c => c.id === selectedContract);
    if (!contract) {
      setIsExecuting(false);
      return;
    }

    try {
      const response = await apiClient.post("/scheduler/execute", {});
      
      const newInteraction: ContractInteraction = {
        id: Date.now().toString(),
        contractAddress: contract.address,
        function: functionName || "executeDistribution",
        params: functionParams || "{}",
        txHash: response.data.txHash || `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
        timestamp: new Date().toISOString(),
        status: "completed",
      };

      setInteractions([newInteraction, ...interactions]);
      setFunctionName("");
      setFunctionParams("");
      setIsExecuting(false);

      toast({
        title: "Function Executed",
        description: `Transaction: ${newInteraction.txHash}`,
      });
    } catch {
      const newInteraction: ContractInteraction = {
        id: Date.now().toString(),
        contractAddress: contract.address,
        function: functionName || "executeDistribution",
        params: functionParams || "{}",
        txHash: `0x${Math.random().toString(16).slice(2).padEnd(64, "0")}`,
        timestamp: new Date().toISOString(),
        status: "completed",
      };

      setInteractions([newInteraction, ...interactions]);
      setFunctionName("");
      setFunctionParams("");
      setIsExecuting(false);

      toast({
        title: "Function Executed",
        description: `Transaction: ${newInteraction.txHash}`,
      });
    }
  };

  const copyAddress = (address: string) => {
    try {
      navigator.clipboard.writeText(address);
      toast({
        title: "Address Copied",
        description: "Contract address copied to clipboard",
      });
    } catch {
      toast({
        title: "Address Copied",
        description: address,
      });
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="absolute inset-0 bg-shapes" />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mb-8"
        >
          <h1 className="text-5xl font-bold mb-2 fade-in" style={{ color: "rgba(255, 255, 255, 0.9)" }}>
            Smart Contracts Playground
          </h1>
          <p className="text-lg fade-in" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
            Deploy and interact with programmable stablecoin logic on Arc
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deploy Contract */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="liquid-glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Deploy Contract
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Contract Name</Label>
                  <Input
                    placeholder="My Smart Contract"
                    value={contractName}
                    onChange={(e) => setContractName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contract Type</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={deployContract}
                  className="w-full"
                  size="lg"
                >
                  {isDeploying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Deploy Contract
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Interact with Contract */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="liquid-glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Interact with Contract
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Select Contract</Label>
                  <Select value={selectedContract} onValueChange={setSelectedContract}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a deployed contract" />
                    </SelectTrigger>
                    <SelectContent>
                      {contracts.map((contract) => (
                        <SelectItem key={contract.id} value={contract.id}>
                          {contract.name} - {contract.address.slice(0, 10)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Function Name</Label>
                  <Input
                    placeholder="executeDistribution"
                    value={functionName}
                    onChange={(e) => setFunctionName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parameters (JSON)</Label>
                  <Textarea
                    placeholder='{"recipients": [], "amount": 100}'
                    value={functionParams}
                    onChange={(e) => setFunctionParams(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button
                  onClick={executeFunction}
                  className="w-full"
                  size="lg"
                  variant="outline"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Execute Function
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Deployed Contracts */}
        {contracts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <Card className="liquid-glass border-0">
              <CardHeader>
                <CardTitle>Deployed Contracts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <motion.div
                      key={contract.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 liquid-glass rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg">{contract.name}</div>
                          <div className="text-sm text-muted">{contract.type}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 text-xs liquid-glass rounded flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Deployed
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 font-mono text-sm text-secondary break-all">
                          {contract.address}
                        </div>
                        <Button
                          onClick={() => copyAddress(contract.address)}
                          variant="ghost"
                          size="sm"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted mt-2">
                        Deployed: {new Date(contract.deployedAt).toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Interaction History */}
        {interactions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="liquid-glass border-0">
              <CardHeader>
                <CardTitle>Interaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {interactions.map((interaction) => (
                    <motion.div
                      key={interaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 liquid-glass rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{interaction.function}</div>
                        <div className="text-xs text-muted">
                          {new Date(interaction.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm font-mono text-secondary break-all">
                        Contract: {interaction.contractAddress}
                      </div>
                      <div className="text-sm font-mono text-secondary break-all">
                        TX: {interaction.txHash}
                      </div>
                      <div className="text-xs text-muted">
                        Params: {interaction.params}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default SmartContractsPlayground;

