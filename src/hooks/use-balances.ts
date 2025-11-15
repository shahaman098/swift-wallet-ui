import * as React from "react";

export type SupportedChain = "ethereum" | "base" | "arbitrum" | "arc";

export interface ChainBalance {
  chain: SupportedChain;
  symbol: "USDC";
  amount: number;
}

export interface BalancesState {
  totalUsd: number;
  changePct: number;
  perChain: ChainBalance[];
}

interface UseBalancesResult {
  data: BalancesState | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

// TODO: replace simulated data with real Circle / Arc balance queries.
const DUMMY_BALANCES: BalancesState = {
  totalUsd: 1234.56,
  changePct: 2.5,
  perChain: [
    { chain: "ethereum", symbol: "USDC", amount: 350.12 },
    { chain: "base", symbol: "USDC", amount: 420.33 },
    { chain: "arbitrum", symbol: "USDC", amount: 210.11 },
    { chain: "arc", symbol: "USDC", amount: 254.0 },
  ],
};

export function useBalances(): UseBalancesResult {
  const [data, setData] = React.useState<BalancesState | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchBalances = React.useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      // Simulate network latency while the real Bridge Kit / backend is not wired.
      await new Promise((resolve) => setTimeout(resolve, 600));

      // TODO: replace with real balances call, e.g.
      // const result = await walletAPI.getBalance();
      // setData(transformToBalancesState(result));
      setData(DUMMY_BALANCES);
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Failed to load balances");
      setIsError(true);
      setError(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchBalances,
  };
}

