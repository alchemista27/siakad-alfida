"use client";

import type { ReactNode } from "react";
import { AppShell, type NavGroup } from "@alfida/ui";
import type { CurrentUser } from "@/lib/current-user";
import { hasSiyaumRole, roleLabel } from "@/lib/current-user";

type ActivePage = "monitoring" | "groups" | "curriculum" | "executive" | "tilawah";

export function SiyaumAppShell({ user, active, children }: { user: CurrentUser | null; active: ActivePage; children: ReactNode }) {
  const canManageGroups = hasSiyaumRole(user, "admin_ymq");
  const canManageSessions = hasSiyaumRole(user, "admin_ymq", "pembina_ymq", "admin_kelompok");
  const canViewExecutive = hasSiyaumRole(user, "admin_ymq", "pengawas", "pimpinan");
  const sidebarGroups: NavGroup[] = [
    {
      title: "Pembinaan",
      items: [
        ...(canManageSessions ? [{ label: "Jurnal halaqah", href: "/monitoring", icon: "edit_note", active: active === "monitoring" }] : []),
        ...(canManageGroups ? [{ label: "Kelompok & penugasan", href: "/groups", icon: "groups", active: active === "groups" }] : []),
        ...(canManageGroups ? [{ label: "Kurikulum IWR", href: "/curriculum", icon: "menu_book", active: active === "curriculum" }] : []),
        ...(canViewExecutive ? [{ label: "Pandangan eksekutif", href: "/executive", icon: "monitoring", active: active === "executive" }] : []),
      ],
    },
    { title: "Tilawah", items: [{ label: "Tilawah harian", href: "/tilawah", icon: "menu_book", active: active === "tilawah" }] },
  ];

  return (
    <AppShell
      serviceName="SIYAUM"
      userName={user?.fullName || "Pengguna SIYAUM"}
      userRole={roleLabel(user)}
      sidebarGroups={sidebarGroups}
      className="mx-auto w-full max-w-6xl"
    >
      {children}
    </AppShell>
  );
}
