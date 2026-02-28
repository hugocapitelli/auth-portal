import type { AppId } from "./types";

export const APP_IDS: Record<AppId, { name: string; description: string }> = {
  "auth-portal": {
    name: "Auth Portal",
    description: "Central de autenticação e administração",
  },
  "biblical-minds": {
    name: "Biblical Minds",
    description: "Chat com agentes bíblicos",
  },
  "eximia-os": {
    name: "eximIA OS",
    description: "Dashboard principal J.A.R.V.I.S.",
  },
  "psyche-dashboard": {
    name: "Psyche Dashboard",
    description: "Análise de profundidade psicológica",
  },
};

export const GLOBAL_ADMIN_ROLES = ["owner", "admin"] as const;
