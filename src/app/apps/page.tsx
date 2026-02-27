import { redirect } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { createServerClientFromEnv } from "@eximia/auth/server";
import type { AppId } from "@eximia/auth";
import { APP_IDS } from "@eximia/auth";
import { Logo } from "@/components/Logo";

interface AppCardData {
  id: AppId;
  name: string;
  description: string;
  url: string;
  hasAccess: boolean;
}

const APP_URLS: Record<AppId, string> = {
  "auth-portal": "",
  "biblical-minds":
    process.env.NODE_ENV === "production"
      ? "https://biblical.eximiaventures.com.br"
      : "http://localhost:3000",
  "eximia-os":
    process.env.NODE_ENV === "production"
      ? "https://jarvis.eximiaventures.com.br"
      : "http://localhost:3000",
  "psyche-dashboard":
    process.env.NODE_ENV === "production"
      ? "https://psique.eximiaventures.com.br"
      : "http://localhost:3200",
};

function AppIcon({ appId, className }: { appId: AppId; className?: string }) {
  const cls = className ?? "w-6 h-6";
  switch (appId) {
    case "biblical-minds":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          <path d="M8 7h6" />
          <path d="M8 11h4" />
        </svg>
      );
    case "eximia-os":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" />
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 8h2" />
          <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "psyche-dashboard":
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a8 8 0 0 0-8 8c0 3.4 2.1 6.3 5 7.4V20a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2.6c2.9-1.1 5-4 5-7.4a8 8 0 0 0-8-8Z" />
          <path d="M10 22h4" />
          <path d="M9 9c0-1 .6-2 2-2.5" />
        </svg>
      );
    default:
      return (
        <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
        </svg>
      );
  }
}

export default async function AppsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClientFromEnv(cookieStore, {
    cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: accessList } = await supabase
    .from("app_access")
    .select("*")
    .eq("user_id", user.id);

  const isGlobalAdmin =
    profile && ["owner", "admin"].includes(profile.global_role);

  const apps: AppCardData[] = (
    Object.entries(APP_IDS) as [AppId, { name: string; description: string }][]
  )
    .filter(([id]) => id !== "auth-portal")
    .map(([id, info]) => ({
      id,
      name: info.name,
      description: info.description,
      url: APP_URLS[id],
      hasAccess:
        isGlobalAdmin || (accessList?.some((a) => a.app_id === id) ?? false),
    }));

  const params = await searchParams;
  const noAccessApp =
    typeof params.no_access === "string" ? params.no_access : null;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Logo size="sm" />
            <div className="flex items-center gap-4">
              {isGlobalAdmin && (
                <Link
                  href="/admin/users"
                  className="text-sm text-zinc-400 hover:text-[#FDBF68] transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {profile?.full_name || user.email}
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 flex flex-col items-center text-center">
          <Logo size="lg" />
          <p className="text-zinc-400 mt-3 text-sm">
            Acesse as aplicações do ecossistema
          </p>
        </div>

        {noAccessApp && (
          <div className="mb-6 p-3 text-sm text-[#FDBF68] bg-[#FDBF68]/5 border border-[#FDBF68]/20 rounded-lg">
            Você não tem acesso ao app{" "}
            <strong className="font-semibold">{noAccessApp}</strong>. Solicite
            acesso a um administrador.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </main>
    </div>
  );
}

function AppCard({ app }: { app: AppCardData }) {
  if (!app.hasAccess) {
    return (
      <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-lg opacity-40 select-none">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800/50 text-zinc-600">
            <AppIcon appId={app.id} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-500">
              {app.name}
            </h3>
            <p className="text-xs text-zinc-600">Sem acesso</p>
          </div>
        </div>
        <p className="text-xs text-zinc-600 leading-relaxed">
          {app.description}
        </p>
      </div>
    );
  }

  return (
    <a
      href={app.url}
      className="group block p-6 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-[#FDBF68]/30 transition-all"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-[#FDBF68]/10 group-hover:text-[#FDBF68] transition-colors">
          <AppIcon appId={app.id} className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white group-hover:text-[#FDBF68] transition-colors">
            {app.name}
          </h3>
          <p className="text-xs text-zinc-500">Abrir aplicação</p>
        </div>
      </div>
      <p className="text-xs text-zinc-400 leading-relaxed">
        {app.description}
      </p>
    </a>
  );
}
