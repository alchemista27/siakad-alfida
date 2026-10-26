"use client";

import { useEffect, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { SiyaumAppShell } from "@/components/siyaum-app-shell";
import { getCurrentUser, hasSiyaumRole, type CurrentUser } from "@/lib/current-user";
import { SessionInputClient } from "./session-input-client";

export function MonitoringClient() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser).catch((reason) => setError(reason.message)).finally(() => setLoading(false));
  }, []);

  const canManageSessions = hasSiyaumRole(user, "admin_ymq", "pembina_ymq", "admin_kelompok");
  return <SiyaumAppShell user={user} active="monitoring"><div className="mx-auto max-w-6xl space-y-6"><header className="grid gap-4 border-b border-border pb-6 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Jurnal halaqah hari ini</p><h1 className="mt-2 font-heading text-4xl font-semibold tracking-[-0.03em] text-primary">Rekam pertemuan, jaga kesinambungan.</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-primary/70">Catat kehadiran dan progres kelompok pada satu sesi atomik. Pilih kelompok untuk memuat roster yang aktif.</p></div><p className="border-l-2 border-tertiary bg-tertiary/10 px-4 py-3 text-xs leading-5 text-primary/75">Data sesi membantu pembina membaca ritme, bukan sekadar mengisi administrasi.</p></header>{loading ? <LoadingState message="Memeriksa akses SIYAUM…" /> : error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : canManageSessions ? <SessionInputClient /> : <EmptyState title="Akses input belum tersedia" description="Pengawas, pimpinan, musyrif, dan peserta tidak dapat mengubah sesi pembelajaran." />}</div></SiyaumAppShell>;
}
