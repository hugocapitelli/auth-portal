"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@eximia/auth";
import { Logo } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  const supabase = createClient({ cookieDomain });

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6 text-center">
          <Logo size="lg" />
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="text-green-400 text-lg font-medium mb-2">
              Email enviado
            </div>
            <p className="text-zinc-400 text-sm">
              Verifique sua caixa de entrada para o link de redefinição de senha.
            </p>
          </div>
          <Link href="/login" className="text-[#FDBF68] hover:underline text-sm">
            Voltar para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <Logo size="lg" />
          <p className="text-zinc-400 text-sm">
            Informe seu email para redefinir a senha
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FDBF68] focus:border-transparent transition-all"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#FDBF68] hover:bg-[#E5A850] text-zinc-900 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Enviar link de redefinição"}
          </button>
        </form>

        <p className="text-center text-zinc-400 text-sm">
          <Link href="/login" className="text-[#FDBF68] hover:underline">
            Voltar para login
          </Link>
        </p>
      </div>
    </div>
  );
}
