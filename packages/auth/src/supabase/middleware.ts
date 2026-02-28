import { createServerClient } from "@supabase/ssr";
import type { Database } from "./types";
import type { AppId } from "../rbac/types";

export interface AuthMiddlewareConfig {
  publicRoutes?: string[];
  authRoutes?: string[];
  loginUrl?: string;
  afterLoginUrl?: string;
  appId?: AppId;
  authPortalUrl?: string;
  cookieDomain?: string;
}

export interface MiddlewareHelpers {
  /** Factory para criar response "next" */
  createNextResponse: (request: unknown) => unknown;
  /** Redirect para uma URL */
  redirect: (url: string | URL) => unknown;
}

const DEFAULT_CONFIG: Required<AuthMiddlewareConfig> = {
  publicRoutes: ["/"],
  authRoutes: ["/login", "/register", "/signup", "/forgot-password", "/reset-password"],
  loginUrl: "/login",
  afterLoginUrl: "/",
  appId: "auth-portal",
  authPortalUrl: "https://auth.eximiaventures.com.br",
  cookieDomain: ".eximiaventures.com.br",
};

/**
 * Cria a lógica core do middleware de autenticação.
 * Retorna uma função que aceita um request e helpers do Next.js.
 *
 * Uso no middleware.ts do consumidor:
 * ```
 * import { NextResponse, type NextRequest } from "next/server";
 * import { createAuthMiddleware } from "@eximia/auth/server";
 *
 * const handleAuth = createAuthMiddleware({ appId: "my-app" });
 *
 * export async function middleware(request: NextRequest) {
 *   return handleAuth(request, {
 *     createNextResponse: (req) => NextResponse.next({ request: req as NextRequest }),
 *     redirect: (url) => NextResponse.redirect(url),
 *   });
 * }
 * ```
 */
export function createAuthMiddleware(userConfig?: AuthMiddlewareConfig) {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  return async function authMiddleware(
    request: {
      cookies: { getAll(): { name: string; value: string }[]; set(name: string, value: string): void };
      nextUrl: { pathname: string; clone(): URL; searchParams: URLSearchParams };
    },
    helpers: MiddlewareHelpers
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let supabaseResponse: any = helpers.createNextResponse(request);

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            supabaseResponse = helpers.createNextResponse(request);
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, {
                ...options,
                domain: config.cookieDomain,
                path: "/",
                sameSite: "lax",
                secure: true,
              })
            );
          },
        },
      }
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const pathname = request.nextUrl.pathname;

    const isPublicRoute = config.publicRoutes.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    );
    const isAuthRoute = config.authRoutes.some(
      (r) => pathname === r || pathname.startsWith(r + "/")
    );
    const isAuthCallback = pathname.startsWith("/auth/");
    const isStaticAsset =
      pathname.startsWith("/_next/") ||
      (pathname.includes(".") && !pathname.endsWith("/"));

    if (isStaticAsset || isAuthCallback) {
      return supabaseResponse;
    }

    if (isPublicRoute) {
      return supabaseResponse;
    }

    if (!user && !isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = config.loginUrl;
      url.searchParams.set("redirect", pathname);
      return helpers.redirect(url);
    }

    if (user && isAuthRoute) {
      const url = request.nextUrl.clone();
      const redirect = request.nextUrl.searchParams.get("redirect");
      url.pathname = redirect || config.afterLoginUrl;
      url.searchParams.delete("redirect");
      return helpers.redirect(url);
    }

    if (user && config.appId && config.appId !== "auth-portal") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("global_role")
        .eq("id", user.id)
        .single();

      if (profile && ["owner", "admin"].includes(profile.global_role)) {
        return supabaseResponse;
      }

      const { data: access } = await supabase
        .from("app_access")
        .select("role")
        .eq("user_id", user.id)
        .eq("app_id", config.appId)
        .single();

      if (!access) {
        const portalUrl = new URL(config.authPortalUrl + "/apps");
        portalUrl.searchParams.set("no_access", config.appId);
        return helpers.redirect(portalUrl.toString());
      }
    }

    return supabaseResponse;
  };
}
