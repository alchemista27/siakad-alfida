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
      avatarUrl={user?.avatarUrl}
      profileHref="https://auth.alfida.or.id/profile?return_to=https%3A%2F%2Fsiyaum.alfida.or.id"
      topbarActions={
        <a
          href="https://auth.alfida.or.id/modules"
          aria-label="Pilih modul"
          className="inline-flex items-center gap-1.5 rounded-sm border border-[#E3E8E7] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#0f7f6d] transition-colors hover:bg-[#eef7f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f7f6d]"
        >
          <span className="material-symbols-rounded text-[17px]">apps</span>
          <span className="hidden sm:inline">Modul</span>
        </a>
      }
      sidebarGroups={sidebarGroups}
      className="mx-auto w-full max-w-6xl"
    >
      {children}
    </AppShell>
  );
}
