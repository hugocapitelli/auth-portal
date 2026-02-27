"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient, APP_IDS, type AppId, type AppRole, type GlobalRole } from "@eximia/auth";
import { Logo } from "@/components/Logo";

interface UserRow {
  id: string;
  email: string;
  full_name: string | null;
  global_role: string;
  app_access: {
    id: string;
    app_id: string;
    role: string;
  }[];
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
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

      // Verificar se é admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("global_role")
        .eq("id", user.id)
        .single();

      if (!profile || !["owner", "admin"].includes(profile.global_role)) {
        router.push("/apps");
        return;
      }

      setIsAdmin(true);

      // Carregar todos os usuários
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("id, email, full_name, global_role")
        .order("created_at", { ascending: true });

      if (allUsers) {
        // Carregar acessos para cada user
        const { data: allAccess } = await supabase
          .from("app_access")
          .select("id, user_id, app_id, role");

        const usersWithAccess = allUsers.map((u) => ({
          ...u,
          app_access: allAccess?.filter((a) => a.user_id === u.id) ?? [],
        }));

        setUsers(usersWithAccess);
      }

      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGrantAccess = async (
    userId: string,
    appId: AppId,
    role: AppRole
  ) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("app_access").upsert(
      {
        user_id: userId,
        app_id: appId,
        role,
        granted_by: user?.id,
      },
      { onConflict: "user_id,app_id" }
    );

    if (!error) {
      // Atualizar state local
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          const existing = u.app_access.findIndex((a) => a.app_id === appId);
          const newAccess = [...u.app_access];
          if (existing >= 0) {
            newAccess[existing] = { ...newAccess[existing], role };
          } else {
            newAccess.push({ id: crypto.randomUUID(), app_id: appId, role });
          }
          return { ...u, app_access: newAccess };
        })
      );
    }
  };

  const handleRevokeAccess = async (userId: string, appId: AppId) => {
    const { error } = await supabase
      .from("app_access")
      .delete()
      .eq("user_id", userId)
      .eq("app_id", appId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u;
          return {
            ...u,
            app_access: u.app_access.filter((a) => a.app_id !== appId),
          };
        })
      );
    }
  };

  const handleChangeGlobalRole = async (userId: string, newRole: GlobalRole) => {
    const { error } = await supabase
      .from("profiles")
      .update({ global_role: newRole })
      .eq("id", userId);

    if (!error) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, global_role: newRole } : u
        )
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-zinc-500">
        Carregando...
      </div>
    );
  }

  if (!isAdmin) return null;

  const appIds = Object.keys(APP_IDS).filter(
    (id) => id !== "auth-portal"
  ) as AppId[];

  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/apps">
                <Logo size="sm" />
              </Link>
              <span className="text-zinc-500 text-sm">/</span>
              <span className="text-zinc-300 text-sm font-medium">Admin</span>
            </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold text-white mb-2">
          Gerenciar Usuários
        </h1>
        <p className="text-zinc-400 mb-8">
          {users.length} usuário{users.length !== 1 ? "s" : ""} registrado
          {users.length !== 1 ? "s" : ""}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800 text-left">
                <th className="pb-3 text-sm font-medium text-zinc-400">
                  Usuário
                </th>
                <th className="pb-3 text-sm font-medium text-zinc-400">
                  Role Global
                </th>
                {appIds.map((id) => (
                  <th
                    key={id}
                    className="pb-3 text-sm font-medium text-zinc-400 text-center"
                  >
                    {APP_IDS[id].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/30"
                >
                  <td className="py-4">
                    <div className="text-white text-sm font-medium">
                      {user.full_name || "—"}
                    </div>
                    <div className="text-zinc-500 text-xs">{user.email}</div>
                  </td>
                  <td className="py-4">
                    <select
                      value={user.global_role}
                      onChange={(e) =>
                        handleChangeGlobalRole(user.id, e.target.value as GlobalRole)
                      }
                      className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-sm rounded px-2 py-1"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="member">Member</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  {appIds.map((appId) => {
                    const access = user.app_access.find(
                      (a) => a.app_id === appId
                    );
                    const isGA = ["owner", "admin"].includes(user.global_role);

                    if (isGA) {
                      return (
                        <td
                          key={appId}
                          className="py-4 text-center text-xs text-[#FDBF68]"
                        >
                          Global Admin
                        </td>
                      );
                    }

                    return (
                      <td key={appId} className="py-4 text-center">
                        {access ? (
                          <div className="flex items-center gap-1 justify-center">
                            <select
                              value={access.role}
                              onChange={(e) =>
                                handleGrantAccess(
                                  user.id,
                                  appId,
                                  e.target.value as AppRole
                                )
                              }
                              className="bg-zinc-900 border border-zinc-700 text-zinc-300 text-xs rounded px-1 py-0.5"
                            >
                              <option value="admin">Admin</option>
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() =>
                                handleRevokeAccess(user.id, appId)
                              }
                              className="text-red-400/60 hover:text-red-400 text-xs ml-1"
                              title="Revogar acesso"
                            >
                              &times;
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              handleGrantAccess(user.id, appId, "viewer")
                            }
                            className="text-xs text-zinc-600 hover:text-[#FDBF68] transition-colors"
                          >
                            + Conceder
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
