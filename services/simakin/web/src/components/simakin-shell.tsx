"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@alfida/ui";

interface SimakinShellProps {
  children: React.ReactNode;
  activePath?: string;
  topbarActions?: React.ReactNode;
}

export function SimakinShell({
  children,
  activePath = "/",
  topbarActions,
}: SimakinShellProps) {
  const [user, setUser] = useState<{ fullName: string; role: string; roles?: any[] } | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            const primaryRole = data.user.roles?.[0]?.role
              ? data.user.roles[0].role.replace(/_/g, " ").toUpperCase()
              : "STAFF";
            setUser({
              fullName: data.user.fullName,
              role: primaryRole,
              roles: data.user.roles || [],
            });
            setAuthLoading(false);
            return;
          }
        }
        // Jika 401 Unauthorized atau user tidak ditemukan, arahkan ke login SSO
        const authUrl = "https://auth.alfida.or.id/login";
        window.location.href = `${authUrl}?return_to=${encodeURIComponent(window.location.href)}`;
      } catch (e) {
        const authUrl = "https://auth.alfida.or.id/login";
        window.location.href = `${authUrl}?return_to=${encodeURIComponent(window.location.href)}`;
      }
    }
    fetchMe();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("https://auth.alfida.or.id/api/auth/logout", {
        credentials: "include",
        method: "POST",
      });
    } catch (e) {}
    window.location.href = "https://auth.alfida.or.id/login";
  };

  const isSuperAdmin = user?.roles?.some((r: any) => r.role === "super_admin");
  const isAdminBidang = user?.roles?.some((r: any) => r.role === "admin_bidang") || isSuperAdmin;
  const isExecutive = user?.roles?.some((r: any) => r.role === "pimpinan" || r.role === "pengawas") || isSuperAdmin;

  const sidebarGroups = [
    {
      title: "Kinerja & Proker",
      items: [
        {
          label: "Dasbor & Matriks",
          href: "/",
          icon: "dashboard",
          active: activePath === "/",
        },
        ...(isExecutive
          ? [
              {
                label: "Evaluasi Eksekutif (BPH)",
                href: "/executive",
                icon: "traffic",
                active: activePath === "/executive",
              },
            ]
          : []),
        {
          label: "Program Kerja",
          href: "/programs",
          icon: "assignment",
          active: activePath === "/programs",
        },
        {
          label: "Indikator Capaian KPI",
          href: "/kpis",
          icon: "monitoring",
          active: activePath === "/kpis",
        },
        ...(isAdminBidang
          ? [
              {
                label: "Struktur Bidang & Biro",
                href: "/departments",
                icon: "account_tree",
                active: activePath === "/departments",
              },
            ]
          : []),
      ],
    },
    {
      title: "Rapat & Hambatan",
      items: [
        {
          label: "Notulensi & Aksi",
          href: "/meetings",
          icon: "groups",
          active: activePath === "/meetings",
        },
        {
          label: "Kendala & Masalah",
          href: "/issues",
          icon: "report_problem",
          active: activePath === "/issues",
        },
        {
          label: "Bukti Dukung (Evidence)",
          href: "/evidence",
          icon: "verified",
          active: activePath === "/evidence",
        },
      ],
    },
    {
      title: "Sistem",
      items: [
        {
          label: "Portal Modul",
          href: "https://auth.alfida.or.id/modules",
          icon: "apps",
          active: false,
        },
      ],
    },
  ];

  return (
    <AppShell
      serviceName="SIMAKIN"
      userName={user?.fullName || "Memuat..."}
      userRole={user?.role || ""}
      onLogout={handleLogout}
      sidebarGroups={sidebarGroups}
      topbarActions={
        topbarActions || (
          <a
            href="https://auth.alfida.or.id/modules"
            className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e6f4f1]"
          >
            <span className="material-symbols-rounded text-[16px]">apps</span>
            <span className="hidden sm:inline">Pilih Modul</span>
          </a>
        )
      }
    >
      {authLoading && !user ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-8">
          <span className="material-symbols-rounded animate-spin text-[36px] text-tertiary mb-3">
            progress_activity
          </span>
          <p className="text-xs text-gray-500 font-medium">Memverifikasi sesi SSO Yayasan Alfida...</p>
        </div>
      ) : (
        children
      )}
    </AppShell>
  );
}
