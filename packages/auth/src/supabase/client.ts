import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export interface EximiaClientOptions {
  cookieDomain?: string;
}

/**
 * Cria o Supabase browser client com cookie domain compartilhado.
 * O SSO funciona porque o cookie é setado com domain=".eximiaventures.com.br",
 * permitindo que todos os subdomínios compartilhem a sessão.
 */
export function createEximiaClient(
  url: string,
  anonKey: string,
  options?: EximiaClientOptions
) {
  const targetDomain = options?.cookieDomain ?? ".eximiaventures.com.br";

  // Only set cookie domain if the current hostname matches the target domain.
  // This prevents cookie rejection when accessing via EasyPanel or other URLs.
  const isMatchingDomain =
    typeof window !== "undefined" &&
    window.location.hostname.endsWith(targetDomain.replace(/^\./, ""));

  const cookieOptions: Record<string, unknown> = {
    path: "/",
    sameSite: "lax",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
  };

  if (isMatchingDomain) {
    cookieOptions.domain = targetDomain;
  }

  return createBrowserClient<Database>(url, anonKey, {
    cookieOptions,
  });
}

/**
 * Cria o browser client usando variáveis de ambiente padrão.
 * Espera NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.
 */
export function createClient(options?: EximiaClientOptions) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createEximiaClient(url, anonKey, options);
}
