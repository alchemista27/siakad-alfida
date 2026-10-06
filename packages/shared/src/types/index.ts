export type Role =
  | "super_admin"
  | "admin_bidang"
  | "admin_unit"
  | "admin_unit_nondik"
  | "admin_biro"
  | "pengawas_yayasan"
  | "guru"
  | "karyawan"
  | "murobbi"
  | "supervisor_kesiswaan"
  | "tim_ppdb"
  | "observer"
  | "orang_tua";

export const SYSTEM_ROLES: Role[] = [
  "super_admin",
  "admin_bidang",
  "admin_unit",
  "admin_unit_nondik",
  "admin_biro",
  "pengawas_yayasan",
  "guru",
  "karyawan",
  "murobbi",
  "supervisor_kesiswaan",
  "tim_ppdb",
  "observer",
  "orang_tua",
];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin_bidang: "Admin Bidang / Yayasan",
  admin_unit: "Admin Unit Pendidikan",
  admin_unit_nondik: "Admin Unit Non-Pendidikan",
  admin_biro: "Admin Biro / Subdepartemen",
  pengawas_yayasan: "Pengawas Yayasan",
  guru: "Guru / Pengajar",
  karyawan: "Karyawan / Staf",
  murobbi: "Murobbi BPI",
  supervisor_kesiswaan: "Supervisor Kesiswaan",
  tim_ppdb: "Tim PPDB",
  observer: "Observer",
  orang_tua: "Orang Tua / Wali",
};

export interface RoleCategoryGroup {
  category: string;
  roles: { role: Role; label: string; description: string }[];
}

export const ROLE_CATEGORY_GROUPS: RoleCategoryGroup[] = [
  {
    category: "Manajerial & Yayasan",
    roles: [
      { role: "super_admin", label: "Super Admin", description: "Akses penuh seluruh sistem" },
      { role: "admin_bidang", label: "Admin Bidang / Yayasan", description: "Akses departemen & kepegawaian yayasan" },
      { role: "admin_biro", label: "Admin Biro / Subdepartemen", description: "Akses perencanaan & eksekusi biro" },
      { role: "pengawas_yayasan", label: "Pengawas Yayasan", description: "Monitoring audit & performa institusi" },
    ],
  },
  {
    category: "Administrasi Unit",
    roles: [
      { role: "admin_unit", label: "Admin Unit Pendidikan", description: "Kelola TK, SD, SMP, SMA, Pesantren" },
      { role: "admin_unit_nondik", label: "Admin Unit Non-Pendidikan", description: "Kelola Lazis, Asrama, Kantor Unit" },
      { role: "tim_ppdb", label: "Tim PPDB", description: "Operasional penerimaan santri/siswa baru" },
    ],
  },
  {
    category: "Pendidik & Tenaga Kependidikan",
    roles: [
      { role: "guru", label: "Guru / Tenaga Pendidik", description: "Akses akademik, mutabaah, & presensi" },
      { role: "karyawan", label: "Karyawan / Staf", description: "Akses kepegawaian umum & presensi" },
      { role: "murobbi", label: "Murobbi BPI", description: "Pembinaan kelompok halaqah & mutabaah" },
      { role: "supervisor_kesiswaan", label: "Supervisor Kesiswaan", description: "Supervisi kesiswaan & mutabaah santri" },
    ],
  },
  {
    category: "Akses Publik & Pengamat",
    roles: [
      { role: "orang_tua", label: "Orang Tua / Wali", description: "Portal wali santri/siswa" },
      { role: "observer", label: "Observer", description: "Observasi & evaluasi asesmen" },
    ],
  },
];

export type UnitLevel = "tk" | "sd" | "smp" | "sma" | "pesantren" | "kantor_yayasan" | "non_pendidikan";

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  roles: {
    role: Role;
    unitId: string | null;
  }[];
}

export type RegistrationStatus =
  | "pending_payment"
  | "payment_uploaded"
  | "payment_verified"
  | "form_filling"
  | "documents_uploaded"
  | "medical_pending"
  | "medical_uploaded"
  | "verification"
  | "observation_scheduled"
  | "observation_done"
  | "accepted"
  | "rejected"
  | "enrolled";

export const DayOfWeek = {
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
} as const;

export type DayOfWeek = typeof DayOfWeek[keyof typeof DayOfWeek];
