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

  const canManageSessions = hasSiyaumRole(user, "admin_ymq", "pembina_ymq", "admin_kelompok", "musyrif");
  return <SiyaumAppShell user={user} active="monitoring">
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Operasional pembelajaran</p><h1 className="mt-1 font-heading text-3xl font-bold text-primary">Input sesi YMQ</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Catat kehadiran dan progres kelompok dalam satu sesi atomik. Pilih kelompok sebelum memuat roster aktif.</p></header>
      {loading ? <LoadingState message="Memeriksa akses SIYAUM…" /> : error ? <ErrorState message={error} onRetry={() => window.location.reload()} /> : canManageSessions ? <SessionInputClient /> : <EmptyState title="Akses input belum tersedia" description="Pengawas, pimpinan, dan peserta tidak dapat mengubah sesi pembelajaran." />}
    </div>
  </SiyaumAppShell>;
}
