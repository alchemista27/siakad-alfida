"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AppShell } from "@alfida/ui";
import { NotificationBell } from "@/components/strategic/notification-bell";

interface AuthRole {
  role?: string;
  departmentId?: string | null;
}

interface AuthUser {
  fullName: string;
  roles?: AuthRole[];
}

interface SimakinShellProps {
  children: React.ReactNode;
  activePath?: string;
  topbarActions?: React.ReactNode;
}

export function SimakinShell({ children, activePath = "/", topbarActions }: SimakinShellProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function fetchMe() {
      try {
        const response = await fetch("https://auth.alfida.or.id/api/auth/me", { credentials: "include" });
        if (response.ok) {
          const data = await response.json();
          if (data?.user) {
            setUser(data.user as AuthUser);
            setAuthLoading(false);
            return;
          }
        }
      } catch {
        // Redirect below keeps failed SSO sessions out of protected content.
      }
      window.location.href = `https://auth.alfida.or.id/login?return_to=${encodeURIComponent(window.location.href)}`;
    }
    void fetchMe();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("https://auth.alfida.or.id/api/auth/logout", { credentials: "include", method: "POST" });
    } catch {
      // The central login redirect still clears the local application state.
    }
    window.location.href = "https://auth.alfida.or.id/login";
  };

  const roleNames = useMemo(() => user?.roles?.map((role) => role.role).filter((role): role is string => Boolean(role)) || [], [user]);
  const hasRole = (role: string) => roleNames.includes(role) || roleNames.includes("super_admin");
  const isExecutive = hasRole("pimpinan") || hasRole("pengawas");
  const canManageBidang = hasRole("admin_bidang");
  const isPic = hasRole("pic_program") || hasRole("staff");
  const primaryRole = roleNames[0]?.replace(/_/g, " ").toUpperCase() || "STAFF";

  const sidebarGroups = [
    {
      title: "Kinerja & Workflow",
      items: [
        { label: "Dasbor & Matriks", href: "/", icon: "dashboard", active: activePath === "/" },
        { label: "Kotak Masuk", href: "/inbox", icon: "inbox", active: activePath === "/inbox" },
        ...(isPic ? [{ label: "Tugas Saya", href: "/my-tasks", icon: "assignment_ind", active: activePath === "/my-tasks" }] : []),
        ...(isExecutive ? [{ label: "Evaluasi Eksekutif (BPH)", href: "/executive", icon: "traffic", active: activePath === "/executive" }] : []),
        { label: "Program Kerja", href: "/programs", icon: "assignment", active: activePath === "/programs" },
        { label: "Indikator Capaian KPI", href: "/kpis", icon: "monitoring", active: activePath === "/kpis" },
        { label: "Struktur Bidang & Biro", href: "/departments", icon: "account_tree", active: activePath === "/departments" },
      ],
    },
    {
      title: "Rapat & Hambatan",
      items: [
        { label: "Notulensi & Aksi", href: "/meetings", icon: "groups", active: activePath === "/meetings" },
        { label: "Kendala & Masalah", href: "/issues", icon: "report_problem", active: activePath === "/issues" },
        { label: "Bukti Dukung (Evidence)", href: "/evidence", icon: "verified", active: activePath === "/evidence" },
      ],
    },
    { title: "Sistem", items: [{ label: "Portal Modul", href: "https://auth.alfida.or.id/modules", icon: "apps", active: false }] },
  ];

  return (
    <AppShell
      serviceName="SIMAKIN"
      userName={user?.fullName || "Memuat..."}
      userRole={primaryRole}
      onLogout={handleLogout}
      sidebarGroups={sidebarGroups}
      topbarActions={topbarActions || <div className="flex items-center gap-2"><NotificationBell /><a href="https://auth.alfida.or.id/modules" className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface px-2.5 py-1.5 text-xs font-semibold text-tertiary hover:bg-neutral"><span className="material-symbols-rounded text-[16px]">apps</span><span className="hidden sm:inline">Pilih Modul</span></a></div>}
    >
      {authLoading && !user ? (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
          <span className="material-symbols-rounded mb-3 animate-spin text-[36px] text-tertiary">progress_activity</span>
          <p className="text-xs font-medium text-gray-500">Memverifikasi sesi SSO Yayasan Alfida...</p>
        </div>
      ) : (
        children
      )}
    </AppShell>
  );
}
