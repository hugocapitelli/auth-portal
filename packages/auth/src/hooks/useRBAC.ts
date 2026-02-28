"use client";

import { useEffect, useState } from "react";
import { createClient } from "../supabase/client";
import type { AppId, AppRole, UserWithAccess } from "../rbac/types";
import { hasAppAccess, getAppRole, isGlobalAdmin } from "../rbac/helpers";
import { useAuth } from "./useAuth";
import type { EximiaClientOptions } from "../supabase/client";

export interface UseRBACReturn {
  /** Se o usuário tem acesso ao app */
  hasAccess: boolean;
  /** Role do usuário no app (ou global_admin) */
  role: AppRole | "global_admin" | null;
  /** Se o usuário é admin global (owner/admin) */
  isAdmin: boolean;
  /** Perfil completo com acesso */
  profile: UserWithAccess | null;
  /** Loading state */
  loading: boolean;
}

export function useRBAC(appId: AppId, options?: EximiaClientOptions): UseRBACReturn {
  const { user, loading: authLoading } = useAuth(options);
  const [profile, setProfile] = useState<UserWithAccess | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(options);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    async function fetchProfile() {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();

      const { data: accessData } = await supabase
        .from("app_access")
        .select("*")
        .eq("user_id", user!.id);

      if (profileData) {
        setProfile({
          ...profileData,
          app_access: accessData ?? [],
        } as UserWithAccess);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user, authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    hasAccess: profile ? hasAppAccess(profile, appId) : false,
    role: profile ? getAppRole(profile, appId) : null,
    isAdmin: profile ? isGlobalAdmin(profile.global_role) : false,
    profile,
    loading: authLoading || loading,
  };
}
