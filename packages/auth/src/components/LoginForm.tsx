"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "../hooks/useAuth";
import type { EximiaClientOptions } from "../supabase/client";

export interface LoginFormProps {
  /** Callback após login bem-sucedido */
  onSuccess?: () => void;
  /** URL para redirecionar após login (alternativa a onSuccess) */
  redirectTo?: string;
  /** Mostrar link para signup */
  showSignupLink?: boolean;
  /** URL da página de signup */
  signupUrl?: string;
  /** URL da página de forgot password */
  forgotPasswordUrl?: string;
  /** Classes CSS adicionais para o form */
  className?: string;
  /** Opções do client Supabase */
  clientOptions?: EximiaClientOptions;
}

export function LoginForm({
  onSuccess,
  redirectTo,
  showSignupLink = true,
  signupUrl = "/signup",
  forgotPasswordUrl = "/forgot-password",
  className = "",
  clientOptions,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth(clientOptions);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError(signInError);
      setLoading(false);
      return;
    }

    if (onSuccess) {
      onSuccess();
    } else if (redirectTo) {
      window.location.href = redirectTo;
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {error && (
        <div
          style={{
            padding: "0.75rem",
            fontSize: "0.875rem",
            color: "#f87171",
            backgroundColor: "rgba(248, 113, 113, 0.1)",
            border: "1px solid rgba(248, 113, 113, 0.2)",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="eximia-login-email"
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#d4d4d8",
            marginBottom: "0.25rem",
          }}
        >
          Email
        </label>
        <input
          id="eximia-login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="seu@email.com"
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "0.5rem",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="eximia-login-password"
          style={{
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: "#d4d4d8",
            marginBottom: "0.25rem",
          }}
        >
          Senha
        </label>
        <input
          id="eximia-login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="••••••••"
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            backgroundColor: "#18181b",
            border: "1px solid #27272a",
            borderRadius: "0.5rem",
            color: "#fff",
            fontSize: "1rem",
            outline: "none",
          }}
        />
      </div>

      {forgotPasswordUrl && (
        <div style={{ textAlign: "right", marginBottom: "1rem" }}>
          <a
            href={forgotPasswordUrl}
            style={{ fontSize: "0.875rem", color: "#FDBF68" }}
          >
            Esqueceu a senha?
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          width: "100%",
          padding: "0.75rem 1rem",
          backgroundColor: "#FDBF68",
          color: "#18181b",
          fontWeight: 600,
          borderRadius: "0.5rem",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.5 : 1,
          fontSize: "1rem",
        }}
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      {showSignupLink && signupUrl && (
        <p
          style={{
            textAlign: "center",
            color: "#a1a1aa",
            marginTop: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          Não tem conta?{" "}
          <a href={signupUrl} style={{ color: "#FDBF68" }}>
            Criar conta
          </a>
        </p>
      )}
    </form>
  );
}
