export type AppId =
  | "auth-portal"
  | "biblical-minds"
  | "eximia-os"
  | "psyche-dashboard";

export type GlobalRole = "owner" | "admin" | "member" | "viewer";

export type AppRole = "admin" | "editor" | "viewer";

export interface EximiaUser {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  global_role: GlobalRole;
}

export interface AppAccess {
  id: string;
  user_id: string;
  app_id: AppId;
  role: AppRole;
  granted_at: string;
  granted_by: string | null;
}

export interface UserWithAccess extends EximiaUser {
  app_access: AppAccess[];
}
