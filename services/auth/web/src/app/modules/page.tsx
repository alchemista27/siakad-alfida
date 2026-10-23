"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@alfida/ui";

interface UserInfo {
  id: string;
  email: string;
  fullName: string;
  roles?: Array<{ app: string; role: string; unitId?: string | null }>;
}

interface ModuleItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  url: string;
  isActive: boolean;
  badge?: string;
  external?: boolean;
}

export default function ModulesPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          router.push("/login?return_to=/modules");
        }
      } catch (err) {
        router.push("/login?return_to=/modules");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  const roles = user?.roles || [];
  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  const primaryRole = roles[0]?.role ? roles[0].role.replace(/_/g, " ").toUpperCase() : "STAFF";
  const SERVICE_URL = {
    spmb: "https://spmb.alfida.or.id/admin",
    simakin: "https://simakin.alfida.or.id",
    simpeg: "https://simpeg.alfida.or.id",
    siyaum: "https://siyaum.alfida.or.id",
    siakad: "https://siakad.alfida.or.id",
    siskeu: "https://siskeu.alfida.or.id",
  } as const;

  const sidebarGroups = [
    {
      title: "Navigasi",
      items: [
        {
          label: "Pilih Modul",
          href: "/modules",
          icon: "apps",
          active: true,
        },
        ...(isSuperAdmin
          ? [
              {
                label: "Admin Yayasan & Pengguna",
                href: "https://admin.alfida.or.id/users",
                icon: "admin_panel_settings",
                active: false,
              },
            ]
          : []),
      ],
    },
    {
      title: "Layanan Aktif",
      items: [
        {
          label: "SPMB (Siswa Baru)",
          href: SERVICE_URL.spmb,
          icon: "school",
        },
        {
          label: "SIMAKIN (Kinerja)",
          href: SERVICE_URL.simakin,
          icon: "trending_up",
        },
        {
          label: "SIMPEG (Kepegawaian)",
          href: SERVICE_URL.simpeg,
          icon: "badge",
        },
        {
          label: "SIYAUM (Tilawah Quran)",
          href: SERVICE_URL.siyaum,
          icon: "menu_book",
        },
        {
          label: "SIAKAD (Akademik)",
          href: SERVICE_URL.siakad,
          icon: "auto_stories",
        },
        {
          label: "SISKEU (Keuangan & SPP)",
          href: SERVICE_URL.siskeu,
          icon: "payments",
        },
      ],
    },
  ];

  const modules: ModuleItem[] = [
    ...(isSuperAdmin
      ? [
          {
            id: "admin",
            title: "Admin Yayasan (Pusat Tata Kelola)",
            description: "Identitas yayasan (logo & favicon), rekening pusat, persetujuan staf dan tata kelola akun.",
            icon: "admin_panel_settings",
            url: "https://admin.alfida.or.id",
            isActive: true,
            badge: "Pusat",
            external: true,
          },
        ]
      : []),
    {
      id: "spmb",
      title: "SPMB (Penerimaan Siswa Baru)",
      description: "Pendaftaran, berkas, pembayaran, observasi, dan pengumuman seleksi murid baru.",
      icon: "school",
      url: SERVICE_URL.spmb,
      isActive: true,
      badge: "Aktif",
      external: true,
    },
    {
      id: "simakin",
      title: "SIMAKIN (Manajemen Kinerja)",
      description: "Perencanaan strategis, program kerja, monitoring KPI, dan log realisasi kegiatan.",
      icon: "trending_up",
      url: SERVICE_URL.simakin,
      isActive: true,
      badge: "Aktif",
      external: true,
    },
    {
      id: "simpeg",
      title: "SIMPEG (Kepegawaian & SDM)",
      description: "Data kepegawaian, penugasan unit, presensi GPS, pengajuan cuti, dan mentoring BPI.",
      icon: "badge",
      url: SERVICE_URL.simpeg,
      isActive: true,
      badge: "Aktif",
      external: true,
    },
    {
      id: "siyaum",
      title: "SIYAUM (Yaum Ma'al Quran)",
      description: "Pencatatan setoran tilawah Al-Quran harian serta rekapan kelompok halaqah YMQ.",
      icon: "menu_book",
      url: SERVICE_URL.siyaum,
      isActive: true,
      badge: "Aktif",
      external: true,
    },
    {
      id: "siakad",
      title: "SIAKAD (Akademik & Sekolah)",
      description: "Jadwal mengajar, jurnal kelas, absensi siswa, dan input nilai raport pendidikan.",
      icon: "auto_stories",
      url: SERVICE_URL.siakad,
      isActive: true,
      badge: "Aktif",
      external: true,
    },
    {
      id: "siskeu",
      title: "SISKEU (Keuangan & SPP)",
      description: "Tagihan SPP, status pembayaran, rekonsiliasi, dan laporan keuangan yayasan.",
      icon: "payments",
      url: SERVICE_URL.siskeu,
      isActive: true,
      badge: "Aktif",
      external: true,
    },
    {
      id: "sisarpras",
      title: "SISARPRAS (Sarana & Aset)",
      description: "Manajemen inventaris sarana dan prasarana sekolah serta pemeliharaan aset.",
      icon: "inventory_2",
      url: "#",
      isActive: false,
      badge: "Segera Hadir",
    },
    {
      id: "sisurat",
      title: "SISURAT (Administrasi Surat)",
      description: "Penomoran surat otomatis, disposisi digital, dan pengarsipan tata usaha.",
      icon: "mail",
      url: "#",
      isActive: false,
      badge: "Segera Hadir",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral text-primary">
        <div className="inline-flex items-center gap-3 bg-white px-5 py-3 rounded-lg shadow-sm border border-border">
          <span className="material-symbols-rounded animate-spin text-tertiary">
            progress_activity
          </span>
          <span className="text-sm font-medium">Memuat portal modul...</span>
        </div>
      </div>
    );
  }

  return (
    <AppShell
      serviceName="Portal Modul"
      userName={user?.fullName || "Pengguna Alfida"}
      userRole={primaryRole}
      onLogout={handleLogout}
      sidebarGroups={sidebarGroups}
    >
      <div className="max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold font-heading text-primary">
            Pilih Modul Layanan
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Selamat datang, <span className="font-semibold text-gray-800">{user?.fullName || "Pengguna"}</span>. Silakan pilih sistem informasi yang ingin Anda akses.
          </p>
        </div>

        {/* Grid Modul */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((mod) => (
            <div
              key={mod.id}
              className={`bg-white border rounded-lg p-5 flex flex-col justify-between transition-all ${
                mod.isActive
                  ? "border-border hover:border-tertiary hover:shadow-md"
                  : "border-gray-200 opacity-60 bg-gray-50/50"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      mod.isActive
                        ? "bg-[#e6f4f1] text-tertiary"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <span className="material-symbols-rounded text-[28px] select-none">
                      {mod.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      mod.isActive
                        ? "bg-emerald-50 text-tertiary border border-emerald-200"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {mod.badge}
                  </span>
                </div>

                <h3 className="text-base font-bold font-heading text-primary mb-1.5">
                  {mod.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">
                  {mod.description}
                </p>
              </div>

              <div>
                {mod.isActive ? (
                  <a
                    href={mod.url}
                    className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded border border-tertiary text-tertiary hover:bg-tertiary hover:text-white font-semibold text-xs transition-colors"
                  >
                    <span>Buka Modul</span>
                    <span className="material-symbols-rounded text-[16px]">
                      open_in_new
                    </span>
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-4 rounded bg-gray-100 text-gray-400 font-medium text-xs cursor-not-allowed text-center"
                  >
                    Belum Tersedia
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Note / Annotation */}
        <div className="mt-8 p-3.5 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center gap-2 text-xs text-gray-600">
          <span className="material-symbols-rounded text-tertiary text-[18px]">
            info
          </span>
          <span>
            Aksesibilitas menu dan fitur di dalam masing-masing modul disesuaikan secara otomatis berdasarkan hak akses SSO Anda.
          </span>
        </div>
      </div>
    </AppShell>
  );
}
