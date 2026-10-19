export type SiakadAuthRole = string | {
  app?: string | null;
  role?: string | null;
  unitId?: string | null;
};

const SIAKAD_ROLES = new Set(["admin_unit", "guru", "wali_kelas", "supervisor_kesiswaan", "orang_tua"]);
const GLOBAL_ADMIN_APPS = new Set(["*", "auth", "core"]);

export function canAccessSiakad(roles: unknown): boolean {
  if (!Array.isArray(roles)) return false;

  return roles.some((entry) => {
    const app = typeof entry === "string" ? "*" : entry?.app;
    const role = typeof entry === "string" ? entry : entry?.role;
    if (role === "admin_unit_nondik") return false;
    if (role === "super_admin" && GLOBAL_ADMIN_APPS.has(app || "")) return true;
    return (app === "*" || app === "siakad") && typeof role === "string" && SIAKAD_ROLES.has(role);
  });
}
