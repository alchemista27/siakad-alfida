"use client";

import { AppShell } from "@alfida/ui";
import type { CurrentUser } from "@/lib/current-user";
import { hasSiyaumRole, roleLabel } from "@/lib/current-user";

export function SiyaumAppShell({ user, active, children }: { user: CurrentUser | null; active: "monitoring" | "groups" | "curriculum" | "executive" | "tilawah"; children: React.ReactNode }) {
  const canManageGroups = hasSiyaumRole(user, "admin_ymq");
  const canManageSessions = hasSiyaumRole(user, "admin_ymq", "pembina_ymq", "admin_kelompok", "musyrif");
  const canViewExecutive = hasSiyaumRole(user, "admin_ymq", "pengawas", "pimpinan");

  const sidebarGroups = [
    {
      title: "Monitoring YMQ",
      items: [
        ...(canManageSessions ? [{ label: "Input Sesi", href: "/monitoring", icon: "edit_note", active: active === "monitoring" }] : []),
        ...(canManageGroups ? [{ label: "Kelompok & Penugasan", href: "/groups", icon: "groups", active: active === "groups" }] : []),
        ...(canManageGroups ? [{ label: "Kurikulum IWR", href: "/curriculum", icon: "menu_book", active: active === "curriculum" }] : []),
        ...(canViewExecutive ? [{ label: "Dashboard Eksekutif", href: "/executive", icon: "monitoring", active: active === "executive" }] : []),
      ],
    },
    {
      title: "Tilawah",
      items: [{ label: "Tilawah Harian", href: "/tilawah", icon: "auto_stories", active: active === "tilawah" }],
    },
  ];

  return (
    <AppShell
      serviceName="SIYAUM"
      userName={user?.fullName || "Pengguna SIYAUM"}
      userRole={roleLabel(user)}
      sidebarGroups={sidebarGroups}
      onLogout={() => { window.location.href = `${process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id"}/login`; }}
      topbarActions={<a href="https://auth.alfida.or.id/modules" className="inline-flex items-center gap-1 rounded-sm bg-[#e6f4f1] px-2.5 py-1 text-xs font-semibold text-tertiary"><span className="material-symbols-rounded text-base">apps</span>Modul</a>}
    >
      {children}
    </AppShell>
  );
}
