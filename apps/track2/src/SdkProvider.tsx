import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { loginRequest, signupRequest } from './api'
import type { AuthState, AuthUser, WalletPreview } from './types'

type CircleContextValue = {
  auth: AuthState
  signup: (email: string, password: string) => Promise<AuthUser>
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
  wallets: WalletPreview[]
  setWallets: (next: WalletPreview[]) => void
}

const defaultAuthState: AuthState = {
  user: null,
  isLoading: false,
}

const CircleContext = createContext<CircleContextValue | undefined>(undefined)

const STORAGE_KEY = 'arc-circle-auth-user'

const loadStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthUser
  } catch (error) {
    console.error('[auth] failed to parse stored user', error)
    return null
  }
}

const persistUser = (user: AuthUser | null) => {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY)
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
}

export const SdkProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>(() => ({
    user: typeof window !== 'undefined' ? loadStoredUser() : null,
    isLoading: false,
  }))
  const [wallets, setWalletState] = useState<WalletPreview[]>([])

  const setUser = useCallback((user: AuthUser | null) => {
    persistUser(user)
    setAuth((prev) => ({ ...prev, user, isLoading: false }))
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    setAuth((prev) => ({ ...prev, isLoading: true }))
    const user = await signupRequest(email, password)
    setUser(user)
    return user
  }, [setUser])

  const login = useCallback(async (email: string, password: string) => {
    setAuth((prev) => ({ ...prev, isLoading: true }))
    const user = await loginRequest(email, password)
    setUser(user)
    return user
  }, [setUser])

  const logout = useCallback(() => {
    setUser(null)
    setWalletState([])
  }, [setUser])

  const value = useMemo<CircleContextValue>(
    () => ({
      auth,
      signup,
      login,
      logout,
      wallets,
      setWallets: setWalletState,
    }),
    [auth, signup, login, logout, wallets]
  )

  return <CircleContext.Provider value={value}>{children}</CircleContext.Provider>
}

export const useSdk = () => {
  const context = useContext(CircleContext)
  if (!context) {
    throw new Error('useSdk must be used within SdkProvider')
  }
  return context
}
