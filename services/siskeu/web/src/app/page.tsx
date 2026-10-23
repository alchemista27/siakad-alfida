"use client";

import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@alfida/ui";
import { FinanceSummaryCards } from "@/components/finance-summary";
import { SiskeuAppShell } from "@/components/siskeu-app-shell";
import { getDashboard, type FinanceSummary, type SiskeuUser } from "@/lib/api";
import { getCurrentSiskeuUser, redirectToLogin } from "@/lib/current-user";

export default function SiskeuDashboardPage() {
  const [user, setUser] = useState<SiskeuUser | null>(null);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setError(null);
    try {
      const currentUser = await getCurrentSiskeuUser();
      setUser(currentUser);
      setSummary(await getDashboard());
    } catch (caught) {
      if (caught instanceof Error && caught.message === "AUTHENTICATION_REQUIRED") {
        redirectToLogin();
        return;
      }
      setError(caught instanceof Error ? caught.message : "Gagal memuat ringkasan keuangan.");
    }
  };

  useEffect(() => { void load(); }, []);

  return <SiskeuAppShell user={user} active="dashboard"><main className="mx-auto max-w-7xl space-y-6"><header className="border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Operasional keuangan</p><h1 className="mt-1 font-heading text-3xl font-bold text-primary">Ringkasan tagihan SPP</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Pantau tagihan, pembayaran yang tercatat, dan kewajiban yang melewati jatuh tempo. SISKEU tetap menjadi satu-satunya penulis invoice SPP.</p></header>{error ? <ErrorState message={error} onRetry={load} /> : !summary ? <LoadingState message="Memuat ringkasan keuangan..." /> : <><FinanceSummaryCards summary={summary} /><section className="rounded-lg border border-border bg-surface p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-heading text-xl font-bold text-primary">Tindak lanjut keuangan</h2><p className="mt-1 text-sm text-primary/70">Gunakan daftar tagihan untuk memeriksa status pembayaran dan referensi tagihan.</p></div><a href="/invoices" className="inline-flex items-center justify-center rounded-sm bg-tertiary px-3 py-2 text-sm font-semibold text-white hover:bg-[#0b6355]">Buka Tagihan SPP</a></div></section></>}</main></SiskeuAppShell>;
}
