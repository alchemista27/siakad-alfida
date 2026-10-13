import { z } from "zod";

export const APP_NAMES = [
  "auth",
  "simakin",
  "simpeg",
  "siyaum",
  "spmb",
  "siakad",
  "siskeu",
  "sisarpras",
  "sisurat",
  "core",
] as const;

export type AppName = (typeof APP_NAMES)[number];

export const APP_ROLES = {
  auth: ["super_admin", "admin_users"],
  simakin: ["admin_bidang", "admin_biro", "pengawas", "pimpinan", "pic_program"],
  simpeg: ["admin_kepegawaian", "admin_unit", "murobbi", "pegawai"],
  siyaum: ["admin_ymq", "musyrif", "peserta"],
  spmb: ["admin_unit", "tim_ppdb", "observer", "orang_tua"],
  siakad: ["admin_unit", "guru", "wali_kelas", "supervisor_kesiswaan", "orang_tua"],
  siskeu: ["admin_keuangan", "bendahara", "pimpinan"],
  sisarpras: ["admin_sarpras", "staff_sarpras"],
  sisurat: ["admin_sekretariat", "staff_tata_usaha"],
  core: ["super_admin", "admin_unit", "pimpinan"],
} as const;

export type AppRoleMap = typeof APP_ROLES;

export interface UserRoleScope {
  role: string;
  app: AppName | "*";
  unitId?: string | null;
  departmentId?: string | null;
}

export const UserRoleScopeSchema = z.object({
  role: z.string(),
  app: z.string(),
  unitId: z.string().uuid().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
});

export function hasRole(
  userRoles: UserRoleScope[],
  app: AppName,
  role: string,
  options?: { unitId?: string | null; departmentId?: string | null }
): boolean {
  return userRoles.some((r) => {
    // Global super_admin has access to all apps
    if (r.role === "super_admin" && (r.app === "*" || r.app === "auth")) {
      return true;
    }

    if (r.app !== "*" && r.app !== app) {
      return false;
    }

    if (r.role !== role) {
      return false;
    }

    if (options?.unitId && r.unitId && r.unitId !== options.unitId) {
      return false;
    }

    if (options?.departmentId && r.departmentId && r.departmentId !== options.departmentId) {
      return false;
    }

    return true;
  });
}
