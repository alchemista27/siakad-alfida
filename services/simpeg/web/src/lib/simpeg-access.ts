export type SimpegRole = { app?: string | null; role?: string | null; unitId?: string | null } | string;

function roleName(entry: SimpegRole): string | null {
  return typeof entry === "string" ? entry : entry?.role ?? null;
}

function appName(entry: SimpegRole): string {
  return typeof entry === "string" ? "*" : entry?.app ?? "*";
}

export function hasSimpegManagementAccess(roles: SimpegRole[] | undefined): boolean {
  return (roles ?? []).some((entry) => {
    const role = roleName(entry);
    const app = appName(entry);
    if (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app)) return true;
    return (app === "*" || app === "simpeg") && [
      "admin_kepegawaian",
      "admin_bidang",
      "admin_unit",
      "admin_unit_nondik",
    ].includes(role ?? "");
  });
}

export function hasSimpegAssignmentWriteAccess(roles: SimpegRole[] | undefined): boolean {
  return (roles ?? []).some((entry) => {
    const role = roleName(entry);
    const app = appName(entry);
    if (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app)) return true;
    return (app === "*" || app === "simpeg") && role === "admin_kepegawaian";
  });
}

export function isPegawaiRole(roles: SimpegRole[] | undefined): boolean {
  return (roles ?? []).some((entry) => {
    const role = roleName(entry);
    const app = appName(entry);
    return role === "pegawai" && (app === "*" || app === "simpeg");
  });
}

export function canViewSimpegAttendanceReports(roles: SimpegRole[] | undefined): boolean {
  return (roles ?? []).some((entry) => {
    const role = roleName(entry);
    const app = appName(entry);
    if (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app)) return true;
    if (role === "admin_kepegawaian") return app === "*" || app === "simpeg";
    return app === "simpeg" && (role === "admin_unit" || role === "admin_unit_nondik");
  });
}

export function simpegLandingTab(roles: SimpegRole[] | undefined): "reports" | "assignments" | "attendance" {
  if (canViewSimpegAttendanceReports(roles)) return "reports";
  return hasSimpegManagementAccess(roles) ? "assignments" : "attendance";
}
