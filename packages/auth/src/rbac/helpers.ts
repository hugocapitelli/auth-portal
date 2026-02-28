import type { AppId, AppRole, GlobalRole, UserWithAccess } from "./types";
import { GLOBAL_ADMIN_ROLES } from "./constants";

export function isGlobalAdmin(globalRole: GlobalRole): boolean {
  return (GLOBAL_ADMIN_ROLES as readonly string[]).includes(globalRole);
}

export function hasAppAccess(
  user: UserWithAccess,
  appId: AppId
): boolean {
  if (isGlobalAdmin(user.global_role)) return true;
  return user.app_access.some((a) => a.app_id === appId);
}

export function getAppRole(
  user: UserWithAccess,
  appId: AppId
): AppRole | "global_admin" | null {
  if (isGlobalAdmin(user.global_role)) return "global_admin";
  const access = user.app_access.find((a) => a.app_id === appId);
  return access?.role ?? null;
}

export function hasAppRole(
  user: UserWithAccess,
  appId: AppId,
  requiredRole: AppRole
): boolean {
  if (isGlobalAdmin(user.global_role)) return true;

  const role = getAppRole(user, appId);
  if (!role || role === "global_admin") return role === "global_admin";

  const hierarchy: AppRole[] = ["admin", "editor", "viewer"];
  return hierarchy.indexOf(role) <= hierarchy.indexOf(requiredRole);
}
