"use client";

import { useEffect } from "react";
import { useAuth } from "./useAuth";
import type { EximiaClientOptions } from "../supabase/client";

export interface UseRequireAuthOptions extends EximiaClientOptions {
  /** URL para redirecionar se não autenticado (default: /login) */
  loginUrl?: string;
  /** Usar window.location (Vite) ou next/router (Next.js) */
  redirectMode?: "location" | "router";
}

/**
 * Hook que redireciona para login se o usuário não estiver autenticado.
 * Compatível com Vite (window.location) e Next.js.
 */
export function useRequireAuth(options?: UseRequireAuthOptions) {
  const { loginUrl = "/login", redirectMode = "location", ...clientOpts } = options ?? {};
  const auth = useAuth(clientOpts);

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${loginUrl}?redirect=${encodeURIComponent(currentPath)}`;

      if (redirectMode === "location") {
        window.location.href = redirectUrl;
      }
    }
  }, [auth.loading, auth.user, loginUrl, redirectMode]);

  return auth;
}
