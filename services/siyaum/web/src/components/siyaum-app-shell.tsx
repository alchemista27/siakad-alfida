"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { CurrentUser } from "@/lib/current-user";
import { hasSiyaumRole, roleLabel } from "@/lib/current-user";

type ActivePage = "monitoring" | "groups" | "curriculum" | "executive" | "tilawah";
type NavItem = { label: string; href: string; icon: string; active: boolean };

export function SiyaumAppShell({ user, active, children }: { user: CurrentUser | null; active: ActivePage; children: ReactNode }) {
  const canManageGroups = hasSiyaumRole(user, "admin_ymq");
  const canManageSessions = hasSiyaumRole(user, "admin_ymq", "pembina_ymq", "admin_kelompok", "musyrif");
  const canViewExecutive = hasSiyaumRole(user, "admin_ymq", "pengawas", "pimpinan");
  const monitoring: NavItem[] = [
    ...(canManageSessions ? [{ label: "Jurnal halaqah", href: "/monitoring", icon: "edit_note", active: active === "monitoring" }] : []),
    ...(canManageGroups ? [{ label: "Kelompok & penugasan", href: "/groups", icon: "groups", active: active === "groups" }] : []),
    ...(canManageGroups ? [{ label: "Kurikulum IWR", href: "/curriculum", icon: "menu_book", active: active === "curriculum" }] : []),
    ...(canViewExecutive ? [{ label: "Pandangan eksekutif", href: "/executive", icon: "monitoring", active: active === "executive" }] : []),
  ];
  const renderItem = (item: NavItem) => <li key={item.href}><Link href={item.href} aria-current={item.active ? "page" : undefined} className={`flex items-center gap-3 border-l-[3px] px-3 py-3 text-sm font-medium transition-colors ${item.active ? "border-[#0f7f6d] bg-[#e6f4f1] text-[#0f7f6d]" : "border-transparent text-[#454545] hover:bg-[#F7F8F8] hover:text-[#0f7f6d]"}`}><span className="material-symbols-rounded text-[20px]" aria-hidden="true">{item.icon}</span>{item.label}</Link></li>;

  return <div className="min-h-screen bg-[#F7F8F8] text-[#454545] md:flex">
    <aside className="w-full border-b border-[#E3E8E7] bg-white md:fixed md:inset-y-0 md:w-[270px] md:border-b-0 md:border-r">
      <div className="border-b border-[#E3E8E7] px-5 py-5"><div className="flex items-center gap-3"><span className="material-symbols-rounded text-[25px] text-[#0f7f6d]" aria-hidden="true">auto_stories</span><div><p className="font-serif text-lg font-semibold tracking-[0.05em]">SIYAUM</p><p className="text-[11px] text-[#454545]/65">Ritme pembinaan & tilawah</p></div></div></div>
      <nav aria-label="Navigasi SIYAUM" className="p-3"><p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#454545]/50">Pembinaan</p><ul className="space-y-1">{monitoring.map(renderItem)}</ul><p className="px-3 pb-3 pt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#454545]/50">Tilawah</p><ul>{renderItem({ label: "Tilawah harian", href: "/tilawah", icon: "menu_book", active: active === "tilawah" })}</ul></nav>
      <div className="hidden border-t border-[#E3E8E7] px-5 py-4 md:block"><p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#0f7f6d]">Cakupan peran</p><p className="mt-1 text-sm font-medium text-[#454545]">{roleLabel(user)}</p><p className="mt-1 text-xs leading-5 text-[#454545]/60">{user?.fullName || "Pengguna SIYAUM"}</p></div>
    </aside>
    <div className="min-w-0 flex-1 md:ml-[270px]"><header className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-[#E3E8E7] bg-[#F7F8F8]/95 px-5 backdrop-blur md:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#0f7f6d]">Ritme pembinaan</p><p className="mt-0.5 text-sm text-[#454545]/70">YMQ · Yayasan Alfida</p></div><a href="https://auth.alfida.or.id/modules" className="inline-flex items-center gap-2 border border-[#E3E8E7] bg-white px-3 py-2 text-xs font-semibold text-[#0f7f6d] hover:bg-[#e6f4f1]"><span className="material-symbols-rounded text-[17px]" aria-hidden="true">apps</span>Modul</a></header><main className="mx-auto w-full max-w-6xl p-5 md:p-8">{children}</main></div>
  </div>;
}
