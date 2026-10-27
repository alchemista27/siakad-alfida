import type { UserRoleScope } from "./roles";

export type SpmbEntryId = "parent" | "admin" | "observer";

export type SpmbEntry = {
  id: SpmbEntryId;
  path: "/parent" | "/admin" | "/observer";
  label: string;
  description: string;
  icon: string;
};

const PARENT_ENTRY: SpmbEntry = {
  id: "parent",
  path: "/parent",
  label: "SPMB — Pendaftaran Murid",
  description: "Daftarkan murid, unggah berkas, pantau pembayaran, observasi, dan hasil seleksi.",
  icon: "family_restroom",
};

const ADMIN_ENTRY: SpmbEntry = {
  id: "admin",
  path: "/admin",
  label: "SPMB — Panitia",
  description: "Kelola gelombang, verifikasi pendaftar, observasi, dan keputusan penerimaan.",
  icon: "admin_panel_settings",
};

const OBSERVER_ENTRY: SpmbEntry = {
  id: "observer",
  path: "/observer",
  label: "SPMB — Observer",
  description: "Lihat penugasan dan catat hasil observasi calon siswa.",
  icon: "rate_review",
};

function hasExactSpmbRole(roles: readonly UserRoleScope[], role: string): boolean {
  return roles.some((item) => item.app === "spmb" && item.role === role);
}

function hasSpmbTeamRole(roles: readonly UserRoleScope[]): boolean {
  return roles.some(
    (item) => item.app === "spmb" && (item.role === "tim_spmb" || item.role === "tim_ppdb"),
  );
}

function isCentralSuperAdmin(roles: readonly UserRoleScope[]): boolean {
  return roles.some(
    (item) => item.role === "super_admin" && (item.app === "*" || item.app === "auth" || item.app === "core"),
  );
}

export function getSpmbEntries(roles: readonly UserRoleScope[]): SpmbEntry[] {
  const entries: SpmbEntry[] = [];

  if (hasExactSpmbRole(roles, "orang_tua")) entries.push(PARENT_ENTRY);
  if (
    isCentralSuperAdmin(roles)
    || hasExactSpmbRole(roles, "admin_unit")
    || hasSpmbTeamRole(roles)
  ) {
    entries.push(ADMIN_ENTRY);
  }
  if (hasExactSpmbRole(roles, "observer")) entries.push(OBSERVER_ENTRY);

  return entries;
}
