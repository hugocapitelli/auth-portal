"use client";

import { type ReactNode } from "react";
import { useRequireAuth, type UseRequireAuthOptions } from "../hooks/useRequireAuth";

export interface ProtectedRouteProps {
  children: ReactNode;
  /** Componente para exibir durante loading */
  fallback?: ReactNode;
  /** Opções de autenticação */
  options?: UseRequireAuthOptions;
}

/**
 * Guard component para rotas protegidas.
 * Redireciona para login se não autenticado.
 * Funciona com React Router (Vite) e qualquer outro router.
 */
export function ProtectedRoute({
  children,
  fallback,
  options,
}: ProtectedRouteProps) {
  const { user, loading } = useRequireAuth(options);

  if (loading) {
    return (
      fallback ?? (
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          color: "#a1a1aa",
        }}>
          Carregando...
        </div>
      )
    );
  }

  if (!user) return null;

  return <>{children}</>;
}
