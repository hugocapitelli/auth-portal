// Server client (Next.js only)
export {
  createEximiaServerClient,
  createServerClientFromEnv,
} from "./supabase/server";
export type { EximiaServerClientOptions } from "./supabase/server";

// Middleware
export { createAuthMiddleware } from "./supabase/middleware";
export type { AuthMiddlewareConfig } from "./supabase/middleware";

// Re-export types for convenience
export type { Database } from "./supabase/types";
