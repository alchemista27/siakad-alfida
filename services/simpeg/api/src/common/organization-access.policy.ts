export type ScopedRole = {
  app?: string;
  role?: string;
  unitId?: string | null;
  departmentId?: string | null;
};

export type UnitCategory = "pendidikan" | "nondik";
export type UnitAdminApp = "siakad" | "spmb" | "simpeg";

export function deriveUnitAdminRole(category: string): "admin_unit" | "admin_unit_nondik" {
  return category === "nondik" ? "admin_unit_nondik" : "admin_unit";
}

export function isAllowedUnitAdminApp(app: string, category: string): app is UnitAdminApp {
  if (app === "simpeg") return true;
  return category === "pendidikan" && (app === "siakad" || app === "spmb");
}

export function canManageUnit(entries: unknown, unitId: string): boolean {
  if (!Array.isArray(entries)) return false;

  return entries.some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    const { app, role, unitId: assignedUnitId } = entry as ScopedRole;

    if (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app || "")) return true;
    if (app === "simpeg" && role === "admin_kepegawaian") return true;

    return app === "simpeg"
      && (role === "admin_unit" || role === "admin_unit_nondik")
      && assignedUnitId === unitId;
  });
}
