// Browser client
export { createEximiaClient, createClient } from "./supabase/client";
export type { EximiaClientOptions } from "./supabase/client";

// Database types
export type { Database } from "./supabase/types";

// RBAC types
export type {
  AppId,
  GlobalRole,
  AppRole,
  EximiaUser,
  AppAccess,
  UserWithAccess,
} from "./rbac/types";

// RBAC helpers
export {
  isGlobalAdmin,
  hasAppAccess,
  getAppRole,
  hasAppRole,
} from "./rbac/helpers";

// RBAC constants
export { APP_IDS, GLOBAL_ADMIN_ROLES } from "./rbac/constants";
