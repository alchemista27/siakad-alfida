"use client";

import { AppShell } from "@alfida/ui";
import type { SiskeuUser } from "@/lib/api";

export function SiskeuAppShell({ user, active, children }: { user: SiskeuUser | null; active: "dashboard" | "invoices"; children: React.ReactNode }) {
  const role = user?.roles?.[0]?.role?.replaceAll("_", " ").toUpperCase() || "KEUANGAN";
  const sidebarGroups = [
    {
      title: "Keuangan Yayasan",
      items: [
        { label: "Ringkasan Keuangan", href: "/", icon: "account_balance", active: active === "dashboard" },
        { label: "Tagihan SPP", href: "/invoices", icon: "receipt_long", active: active === "invoices" },
      ],
    },
    {
      title: "Sistem",
      items: [{ label: "Portal Modul", href: "https://auth.alfida.or.id/modules", icon: "apps" }],
    },
  ];

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      window.location.href = "https://auth.alfida.or.id/login";
    }
  };

  return (
    <AppShell
      serviceName="SISKEU"
      userName={user?.fullName || "Memuat akun..."}
      userRole={role}
      sidebarGroups={sidebarGroups}
      onLogout={logout}
      topbarActions={<span className="inline-flex items-center gap-1 rounded-sm border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-tertiary"><span className="material-symbols-rounded text-base">account_balance</span>Keuangan</span>}
    >
      {children}
    </AppShell>
  );
}
