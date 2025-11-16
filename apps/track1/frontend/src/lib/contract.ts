import { createConfig, http } from "wagmi";
import { createPublicClient, getContract, http as viemHttp } from "viem";
import { defineChain } from "viem/utils";

export const arcTestnet = defineChain({
  id: 70700,
  name: "Arc Testnet",
  nativeCurrency: { name: "ARC", symbol: "ARC", decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_ARC_RPC_URL || ""] },
    public: { http: [import.meta.env.VITE_ARC_RPC_URL || ""] }
  }
});

export const wagmiConfig = createConfig({
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(import.meta.env.VITE_ARC_RPC_URL || "")
  }
});

export const publicClient = createPublicClient({
  chain: arcTestnet,
  transport: viemHttp(import.meta.env.VITE_ARC_RPC_URL || "")
});


