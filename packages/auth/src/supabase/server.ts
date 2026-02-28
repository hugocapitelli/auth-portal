import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";

export interface EximiaServerClientOptions {
  cookieDomain?: string;
}

export interface CookieStore {
  getAll(): { name: string; value: string }[];
  set(name: string, value: string, options?: Record<string, unknown>): void;
}

/**
 * Cria o Supabase server client a partir de um cookie store.
 * Cookie domain compartilhado garante SSO entre subdomínios.
 *
 * Uso:
 * ```
 * import { cookies } from "next/headers";
 * const cookieStore = await cookies();
 * const supabase = createEximiaServerClient(url, key, cookieStore);
 * ```
 */
export function createEximiaServerClient(
  url: string,
  anonKey: string,
  cookieStore: CookieStore,
  options?: EximiaServerClientOptions
) {
  const domain = options?.cookieDomain ?? ".eximiaventures.com.br";

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options: cookieOpts }) =>
            cookieStore.set(name, value, {
              ...cookieOpts,
              domain,
              path: "/",
              sameSite: "lax",
              secure: true,
            })
          );
        } catch {
          // Server Components não podem setar cookies
        }
      },
    },
  });
}

/**
 * Cria o server client usando variáveis de ambiente padrão.
 * Requer cookieStore do next/headers.
 */
export function createServerClientFromEnv(
  cookieStore: CookieStore,
  options?: EximiaServerClientOptions
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createEximiaServerClient(url, anonKey, cookieStore, options);
}
