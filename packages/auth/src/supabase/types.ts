import type { AppId, AppRole, GlobalRole } from "../rbac/types";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: string;
          global_role: GlobalRole;
          preferences: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: string;
          global_role?: GlobalRole;
        };
        Update: {
          full_name?: string | null;
          avatar_url?: string | null;
          global_role?: GlobalRole;
          updated_at?: string;
        };
        Relationships: [];
      };
      app_access: {
        Row: {
          id: string;
          user_id: string;
          app_id: AppId;
          role: AppRole;
          granted_at: string;
          granted_by: string | null;
        };
        Insert: {
          user_id: string;
          app_id: AppId;
          role: AppRole;
          granted_by?: string | null;
        };
        Update: {
          role?: AppRole;
        };
        Relationships: [
          {
            foreignKeyName: "app_access_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "app_access_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      has_app_access: {
        Args: { target_app_id: string };
        Returns: boolean;
      };
      get_app_role: {
        Args: { target_app_id: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
