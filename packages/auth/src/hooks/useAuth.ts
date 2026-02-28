"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "../supabase/client";
import type { EximiaClientOptions } from "../supabase/client";

export interface UseAuthReturn {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
}

export function useAuth(options?: EximiaClientOptions): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient(options);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Carregamento inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    [supabase] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const signUp = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    [supabase] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error?.message ?? null };
    },
    [supabase] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return { user, session, loading, signIn, signUp, signOut, resetPassword };
}
