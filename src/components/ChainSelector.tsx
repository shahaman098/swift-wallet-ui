import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Network, Check } from "lucide-react";
import { chainAPI } from "@/api/client";

interface Chain {
  key: string;
  chainId: number;
  name: string;
  network: string;
  nativeCurrency: string;
}

interface ChainSelectorProps {
  value?: string;
  onChange: (chainKey: string) => void;
  label?: string;
  showChainId?: boolean;
  className?: string;
}

const ChainSelector = ({ 
  value, 
  onChange, 
  label = "Blockchain Network",
  showChainId = true,
  className = "" 
}: ChainSelectorProps) => {
  const [chains, setChains] = useState<Chain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChains();
  }, []);

  const loadChains = async () => {
    try {
      const response = await chainAPI.getSupportedChains();
      setChains(response.data.chains);
    } catch (error) {
      // Fallback to default chains if API fails
      setChains([
        { key: 'ETH-SEPOLIA', chainId: 11155111, name: 'Ethereum Sepolia', network: 'testnet', nativeCurrency: 'ETH' },
        { key: 'AVAX-FUJI', chainId: 43113, name: 'Avalanche Fuji', network: 'testnet', nativeCurrency: 'AVAX' },
        { key: 'MATIC-AMOY', chainId: 80002, name: 'Polygon Amoy', network: 'testnet', nativeCurrency: 'MATIC' },
        { key: 'BASE-SEPOLIA', chainId: 84532, name: 'Base Sepolia', network: 'testnet', nativeCurrency: 'ETH' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && <label className="text-sm font-semibold text-foreground">{label}</label>}
        <div className="h-12 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Network className="h-4 w-4" />
          {label}
        </label>
      )}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-12">
          <SelectValue placeholder="Select chain" />
        </SelectTrigger>
        <SelectContent>
          {chains.map((chain) => (
            <SelectItem key={chain.key} value={chain.key}>
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{chain.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {chain.network}
                  </Badge>
                </div>
                {showChainId && (
                  <span className="text-xs text-muted-foreground ml-4">
                    Chain ID: {chain.chainId}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ChainSelector;

