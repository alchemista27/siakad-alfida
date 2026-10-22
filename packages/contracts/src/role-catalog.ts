export const ROLE_CATALOG = {
  auth: ["super_admin", "admin_users"],
  simakin: ["admin_bidang", "admin_biro", "pengawas", "pimpinan", "pic_program"],
  simpeg: ["admin_kepegawaian", "admin_unit", "admin_unit_nondik", "murobbi", "pegawai"],
  siyaum: ["admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan", "peserta", "musyrif"],
  spmb: ["admin_unit", "tim_ppdb", "observer", "orang_tua"],
  siakad: ["admin_unit", "guru", "wali_kelas", "supervisor_kesiswaan", "orang_tua"],
  siskeu: ["admin_keuangan", "bendahara", "pimpinan"],
  sisarpras: ["admin_sarpras", "staff_sarpras"],
  sisurat: ["admin_sekretariat", "staff_tata_usaha"],
  core: ["super_admin", "admin_unit", "pimpinan"],
} as const;

export type RoleCatalogApp = keyof typeof ROLE_CATALOG;
export type RoleCatalogRole = (typeof ROLE_CATALOG)[RoleCatalogApp][number];

export const UNIT_SCOPED_ROLE_KEYS = new Set<string>([
  "simpeg:admin_unit",
  "simpeg:admin_unit_nondik",
  "spmb:admin_unit",
  "siakad:admin_unit",
]);

export const DEPARTMENT_SCOPED_ROLE_KEYS = new Set<string>([
  "simakin:admin_bidang",
]);
