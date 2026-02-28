"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useAuth, type UseAuthReturn } from "../hooks/useAuth";
import type { EximiaClientOptions } from "../supabase/client";

const AuthContext = createContext<UseAuthReturn | null>(null);

export interface AuthProviderProps {
  children: ReactNode;
  options?: EximiaClientOptions;
}

export function AuthProvider({ children, options }: AuthProviderProps) {
  const auth = useAuth(options);

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): UseAuthReturn {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside <AuthProvider>");
  }
  return ctx;
}
