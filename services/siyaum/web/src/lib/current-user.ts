import { apiFetch } from "./api";

export type SiyaumRole =
  | "admin_ymq"
  | "pembina_ymq"
  | "admin_kelompok"
  | "pengawas"
  | "pimpinan"
  | "peserta"
  | "super_admin";

export interface CurrentUser {
  id: string;
  fullName: string;
  email?: string;
  roles: Array<{ app?: string; role: SiyaumRole | string }>;
}

function isGlobalSuperAdmin(app: string | undefined, role: string): boolean {
  return role === "super_admin" && ["*", "auth", "core"].includes(app || "");
}

export function hasSiyaumRole(user: CurrentUser | null | undefined, ...roles: SiyaumRole[]): boolean {
  return Boolean(user?.roles.some(({ app, role }) =>
    isGlobalSuperAdmin(app, role) || ((app === "siyaum" || app === "*" || !app) && roles.includes(role as SiyaumRole)),
  ));
}

export function roleLabel(user: CurrentUser | null | undefined): string {
  const role = user?.roles.find(({ app, role }) => isGlobalSuperAdmin(app, role))?.role
    || user?.roles.find(({ app }) => app === "siyaum" || app === "*")?.role;
  return (role || "peserta").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const payload = await apiFetch<CurrentUser | { user: CurrentUser }>("/auth/me");
  return "user" in payload ? payload.user : payload;
}
