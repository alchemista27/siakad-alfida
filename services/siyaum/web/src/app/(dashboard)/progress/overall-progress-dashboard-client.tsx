"use client";

import { useEffect, useState } from "react";
import { Card, EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { SiyaumAppShell } from "@/components/siyaum-app-shell";
import { YmqCategoryRankings, type OverallCategoryRanking } from "@/components/ymq-category-rankings";
import { YmqHafalanRanking, type OverallHafalan } from "@/components/ymq-hafalan-ranking";
import { YmqOverallProgressPie, type OverallProgressPieItem } from "@/components/ymq-overall-progress-pie";
import { YmqUnitProgressBars, type OverallUnitProgress } from "@/components/ymq-unit-progress-bars";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, hasSiyaumRole, type CurrentUser } from "@/lib/current-user";

interface OverallProgressReport {
  appliedFilters: { unitId?: string };
  availableUnits: Array<{ id: string; name: string }>;
  roster: { activeParticipants: number; unclassifiedParticipantCount: number };
  progressPie: OverallProgressPieItem[];
  categoryRankings: OverallCategoryRanking[];
  hafalan: OverallHafalan;
  unitProgress: OverallUnitProgress[];
}

export function OverallProgressDashboardClient() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [report, setReport] = useState<OverallProgressReport | null>(null);
  const [unitId, setUnitId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (!hasSiyaumRole(currentUser, "admin_ymq", "pengawas", "pimpinan")) return;
      const suffix = unitId ? `?unitId=${encodeURIComponent(unitId)}` : "";
      const payload = await apiFetch<OverallProgressReport>(`/dashboard/ymq/progress${suffix}`);
      setReport(payload);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Dashboard pencapaian tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [unitId]);

  const canViewOverallProgress = hasSiyaumRole(user, "admin_ymq", "pengawas", "pimpinan");
  const selectedUnitName = report?.availableUnits.find((unit) => unit.id === unitId)?.name;

  return <SiyaumAppShell user={user} active="progress"><div className="mx-auto max-w-7xl space-y-6"><header className="border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Laporan operasional YMQ</p><h1 className="mt-1 font-heading text-3xl font-bold">Dashboard Pencapaian</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Ringkasan all-time peserta roster aktif berdasarkan progres pembelajaran dan setoran hafalan ziyadah yang sudah diverifikasi{selectedUnitName ? ` untuk ${selectedUnitName}` : " untuk seluruh unit kerja"}.</p></header>{loading ? <LoadingState message="Memuat dashboard pencapaian…" /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : !canViewOverallProgress ? <EmptyState title="Akses dashboard terbatas" description="Dashboard pencapaian tersedia untuk Admin YMQ, Pengawas, dan Pimpinan." /> : report ? <><Card className="shadow-none"><label className="block max-w-md text-sm font-semibold">Pilih unit kerja<select aria-label="Pilih unit kerja" value={unitId} onChange={(event) => setUnitId(event.target.value)} className="mt-1.5 block w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Seluruh unit kerja</option>{report.availableUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label></Card><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><Metric label="Peserta aktif" value={report.roster.activeParticipants} icon="groups" /><Metric label="Rata-rata hafalan" value={`${report.hafalan.averageVerifiedPages.toFixed(2)} halaman`} icon="auto_stories" /><Metric label="Total hafalan terverifikasi" value={`${report.hafalan.totalVerifiedPages} halaman`} icon="verified" /></section><YmqOverallProgressPie progressPie={report.progressPie} unclassifiedParticipantCount={report.roster.unclassifiedParticipantCount} /><YmqCategoryRankings rankings={report.categoryRankings} /><YmqHafalanRanking hafalan={report.hafalan} /><YmqUnitProgressBars units={report.unitProgress} /></> : null}</div></SiyaumAppShell>;
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return <section className="rounded-lg border border-border bg-surface p-5"><span className="material-symbols-rounded text-tertiary" aria-hidden="true">{icon}</span><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary/60">{label}</p><p className="mt-1 text-2xl font-bold text-primary">{value}</p></section>;
}
