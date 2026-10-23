import Link from "next/link";
import type { ReactNode } from "react";

type AppShellProps = { children: ReactNode; activePath: "/" | "/admin/unit-identity" };

const navigation = [
  { href: "/" as const, label: "Ruang Akademik", icon: "dashboard" },
  { href: "/admin/unit-identity" as const, label: "Identitas Unit", icon: "account_balance" },
];

export function AppShell({ children, activePath }: AppShellProps) {
  return <div className="min-h-screen bg-[#F7F8F8] text-[#454545] md:flex">
    <aside className="w-full border-b border-[#E3E8E7] bg-white md:fixed md:inset-y-0 md:w-[250px] md:border-b-0 md:border-r">
      <div className="border-b border-[#E3E8E7] px-5 py-5">
        <div className="flex items-center gap-3"><span className="material-symbols-rounded text-[25px] text-[#0f7f6d]" aria-hidden="true">school</span><div><p className="font-serif text-base font-semibold tracking-[0.04em] text-[#454545]">SIAKAD · AKADEMIK</p><p className="mt-0.5 text-[11px] text-[#454545]/65">Basis dokumen & pembelajaran</p></div></div>
      </div>
      <nav aria-label="Navigasi SIAKAD" className="p-3">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#454545]/50">Ruang kerja</p>
        <ul className="space-y-1">{navigation.map((item) => {
          const active = activePath === item.href;
          return <li key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} className={`flex items-center gap-3 border-l-[3px] px-3 py-3 text-sm font-medium transition-colors ${active ? "border-[#0f7f6d] bg-[#e6f4f1] text-[#0f7f6d]" : "border-transparent text-[#454545] hover:bg-[#F7F8F8] hover:text-[#0f7f6d]"}`}><span className="material-symbols-rounded text-[20px]" aria-hidden="true">{item.icon}</span>{item.label}</Link></li>;
        })}</ul>
      </nav>
      <div className="hidden border-t border-[#E3E8E7] px-5 py-4 text-xs leading-5 text-[#454545]/60 md:block">Informasi unit yang rapi membuat dokumen akademik tetap konsisten.</div>
    </aside>
    <div className="min-w-0 flex-1 md:ml-[250px]">
      <header className="sticky top-0 z-10 flex h-[60px] items-center justify-between border-b border-[#E3E8E7] bg-[#F7F8F8]/95 px-5 backdrop-blur md:px-8"><div><p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#0f7f6d]">Yayasan Alfida</p><p className="mt-0.5 text-sm text-[#454545]/70">Sistem Informasi Akademik</p></div><Link href="/admin/unit-identity" className="inline-flex items-center gap-2 border border-[#E3E8E7] bg-white px-3 py-2 text-xs font-semibold text-[#0f7f6d] hover:bg-[#e6f4f1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f7f6d]"><span className="material-symbols-rounded text-[18px]" aria-hidden="true">settings</span>Pengaturan unit</Link></header>
      <main className="mx-auto w-full max-w-6xl p-5 md:p-8">{children}</main>
    </div>
  </div>;
}
