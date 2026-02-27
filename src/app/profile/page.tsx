"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, type EximiaUser } from "@eximia/auth";
import { Logo } from "@/components/Logo";

export default function ProfilePage() {
  const [profile, setProfile] = useState<EximiaUser | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  const supabase = createClient({ cookieDomain });

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data as EximiaUser);
        setFullName(data.full_name || "");
      }
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", profile.id);

    if (error) {
      setMessage("Erro ao salvar: " + error.message);
    } else {
      setMessage("Perfil atualizado");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/apps">
              <Logo size="sm" />
            </Link>
            <form action="/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-zinc-500 hover:text-red-400 transition-colors"
              >
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-white mb-8">Meu Perfil</h1>

        <form onSubmit={handleSave} className="space-y-6">
          {message && (
            <div
              className={`p-3 text-sm rounded-lg ${
                message.startsWith("Erro")
                  ? "text-red-400 bg-red-400/10 border border-red-400/20"
                  : "text-green-400 bg-green-400/10 border border-green-400/20"
              }`}
            >
              {message}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ""}
              disabled
              className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-zinc-300 mb-1">
              Nome completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#FDBF68] focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Papel global
            </label>
            <div className="px-4 py-3 bg-zinc-900/50 border border-zinc-800 rounded-lg text-zinc-400 capitalize">
              {profile?.global_role || "member"}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-[#FDBF68] hover:bg-[#E5A850] text-zinc-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <Link
              href="/apps"
              className="px-6 py-3 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              Voltar
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
