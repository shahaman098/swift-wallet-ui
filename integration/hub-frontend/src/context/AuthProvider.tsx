import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthState = {
  token: string | null;
  userId: string | null;
  walletId: string | null;
};

type AuthPayload = {
  token: string;
  userId: string;
  walletId: string;
};

type AuthContextValue = AuthState & {
  isAuthenticated: boolean;
  setAuth: (auth: AuthPayload) => void;
  clearAuth: () => void;
};

const STORAGE_KEYS = {
  token: "authToken",
  userId: "userId",
  walletId: "walletId",
} as const;

const getStoredValue = (key: keyof typeof STORAGE_KEYS) => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEYS[key]);
};

const readAuthState = (): AuthState => ({
  token: getStoredValue("token"),
  userId: getStoredValue("userId"),
  walletId: getStoredValue("walletId"),
});

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const persistAuth = (auth: AuthPayload | null) => {
  if (typeof window === "undefined") return;
  if (!auth) {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    return;
  }

  localStorage.setItem(STORAGE_KEYS.token, auth.token);
  localStorage.setItem(STORAGE_KEYS.userId, auth.userId);
  localStorage.setItem(STORAGE_KEYS.walletId, auth.walletId);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>(() => readAuthState());

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncState = () => {
      setState(readAuthState());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === null || Object.values(STORAGE_KEYS).includes(event.key)) {
        syncState();
      }
    };

    window.addEventListener("storage", handleStorage);

    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);

    localStorage.setItem = (key: string, value: string) => {
      originalSetItem(key, value);
      if (Object.values(STORAGE_KEYS).includes(key)) {
        syncState();
      }
    };

    localStorage.removeItem = (key: string) => {
      originalRemoveItem(key);
      if (Object.values(STORAGE_KEYS).includes(key)) {
        syncState();
      }
    };

    return () => {
      window.removeEventListener("storage", handleStorage);
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  const setAuth = (auth: AuthPayload) => {
    persistAuth(auth);
    setState(auth);
  };

  const clearAuth = () => {
    persistAuth(null);
    setState({ token: null, userId: null, walletId: null });
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token),
      setAuth,
      clearAuth,
    }),
    [state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

