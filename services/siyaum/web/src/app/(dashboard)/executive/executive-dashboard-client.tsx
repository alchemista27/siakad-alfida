"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorState, LoadingState } from "@alfida/ui";
import { apiFetch, queryString } from "@/lib/api";
import { getCurrentUser, hasSiyaumRole, type CurrentUser } from "@/lib/current-user";
import { SiyaumAppShell } from "@/components/siyaum-app-shell";
import { YmqProgressPie } from "@/components/ymq-progress-pie";
import { YmqGroupProgressTable, type GeneralGroupSummary } from "@/components/ymq-group-progress-table";
import { YmqParticipantRanking, type ParticipantRanking } from "@/components/ymq-participant-ranking";

interface Unit { id: string; name: string; }
interface FilterGroup extends GeneralGroupSummary { unitId?: string | null; pembinaUserId?: string | null; }
interface Overview { roster: { activeParticipants: number; unclassifiedParticipantCount: number }; attendance: { weeklyRate: number | null; monthlyRate: number | null }; progressPie: Array<{ key: "iwr_1" | "iwr_2" | "quran"; label: "IWR 1" | "IWR 2" | "Qur'an"; participants: number; percentage: number }>; groups: GeneralGroupSummary[]; sessionsHeld?: number; }

function isoDate(date: Date) { return date.toISOString().slice(0, 10); }
function initialPeriod() { const to = new Date(); const from = new Date(to); from.setDate(to.getDate() - 29); return { from: isoDate(from), to: isoDate(to) }; }

export function ExecutiveDashboardClient() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [groups, setGroups] = useState<FilterGroup[]>([]);
  const [rankings, setRankings] = useState<ParticipantRanking[]>([]);
  const [filters, setFilters] = useState({ ...initialPeriod(), unitId: "", level: "", pembinaUserId: "", groupId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canViewExecutive = hasSiyaumRole(user, "admin_ymq", "pengawas", "pimpinan");
  const params = useMemo(() => queryString(filters), [filters]);
  const load = async () => {
    setLoading(true); setError(null);
    try {
      const [currentUser, overviewData, groupData, rankingData] = await Promise.all([
        getCurrentUser(),
        apiFetch<Overview>(`/dashboard/ymq/executive/overview${params}`),
        apiFetch<FilterGroup[]>(`/dashboard/ymq/executive/groups${params}`),
        apiFetch<ParticipantRanking[]>(`/dashboard/ymq/executive/rankings${params}`),
      ]);
      setUser(currentUser); setOverview(overviewData); setGroups(groupData); setRankings(rankingData);
      setUnits((current) => current.length ? current : Array.from(new Map(groupData.filter((group) => group.unitId && group.unitName).map((group) => [group.unitId!, { id: group.unitId!, name: group.unitName! }])).values()));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Dashboard eksekutif tidak dapat dimuat."); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, [params]);
  const pembinaOptions = useMemo(() => Array.from(new Map(groups.filter((group) => group.pembinaUserId && group.pembinaName).map((group) => [group.pembinaUserId!, group.pembinaName!])).entries()), [groups]);
  const groupOptions = useMemo(() => groups.filter((group) => !filters.pembinaUserId || group.pembinaUserId === filters.pembinaUserId), [groups, filters.pembinaUserId]);
  const setFilter = (key: keyof typeof filters, value: string) => { setFilters((current) => key === "unitId" ? { ...current, unitId: value, pembinaUserId: "", groupId: "" } : key === "pembinaUserId" ? { ...current, pembinaUserId: value, groupId: "" } : { ...current, [key]: value }); };

  return <SiyaumAppShell user={user} active="executive"><div className="mx-auto max-w-7xl space-y-6"><header className="border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Pengawasan & pimpinan</p><h1 className="mt-1 font-heading text-3xl font-bold">Dashboard eksekutif YMQ</h1><p className="mt-2 text-sm leading-6 text-primary/70">Laporan read-only berdasarkan sesi pembelajaran dan proyeksi unit kerja SIMPEG. Periode {filters.from} sampai {filters.to}.</p></header>{loading ? <LoadingState message="Memuat ringkasan eksekutif…" /> : error ? <ErrorState message={error} onRetry={load} /> : !canViewExecutive ? <section className="rounded-lg border border-border bg-surface p-5"><h2 className="font-heading text-xl font-bold">Akses dashboard terbatas</h2><p className="mt-2 text-sm text-primary/70">Pengawas dan Pimpinan dapat melihat dashboard ini tanpa kontrol perubahan data.</p></section> : <><section className="rounded-lg border border-border bg-surface p-5"><h2 className="font-heading text-xl font-bold">Filter laporan</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5"><label className="text-sm font-medium">Dari<input type="date" value={filters.from} onChange={(event) => setFilter("from", event.target.value)} className="mt-1 block w-full rounded-sm border border-border px-3 py-2" /></label><label className="text-sm font-medium">Sampai<input type="date" value={filters.to} onChange={(event) => setFilter("to", event.target.value)} className="mt-1 block w-full rounded-sm border border-border px-3 py-2" /></label><label className="text-sm font-medium">Unit kerja SIMPEG<select value={filters.unitId} onChange={(event) => setFilter("unitId", event.target.value)} className="mt-1 block w-full rounded-sm border border-border px-3 py-2"><option value="">Semua unit</option>{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label><label className="text-sm font-medium">Level<select value={filters.level} onChange={(event) => setFilter("level", event.target.value)} className="mt-1 block w-full rounded-sm border border-border px-3 py-2"><option value="">Semua level</option><option value="pra_tahsin">Pra Tahsin</option><option value="tahsin">Tahsin</option><option value="tahfiz">Tahfiz</option></select></label><label className="text-sm font-medium">Pembina<select value={filters.pembinaUserId} onChange={(event) => setFilter("pembinaUserId", event.target.value)} className="mt-1 block w-full rounded-sm border border-border px-3 py-2"><option value="">Semua pembina</option>{pembinaOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label className="text-sm font-medium xl:col-span-1">Kelompok<select value={filters.groupId} onChange={(event) => setFilter("groupId", event.target.value)} className="mt-1 block w-full rounded-sm border border-border px-3 py-2"><option value="">Semua kelompok</option>{groupOptions.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}</select></label></div></section>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Peserta aktif" value={overview?.roster.activeParticipants ?? 0} icon="groups" /><Metric label="Sesi dalam periode" value={overview?.sessionsHeld ?? overview?.groups.reduce((total, group) => total + group.sessionsHeld, 0) ?? 0} icon="event" /><Metric label="Kehadiran mingguan" value={overview?.attendance.weeklyRate == null ? "—" : `${overview.attendance.weeklyRate.toFixed(1)}%`} icon="calendar_month" /><Metric label="Kehadiran bulanan" value={overview?.attendance.monthlyRate == null ? "—" : `${overview.attendance.monthlyRate.toFixed(1)}%`} icon="fact_check" /></section>
    <YmqGroupProgressTable groups={overview?.groups || groups} /><div className="grid gap-5 xl:grid-cols-[.9fr_1.1fr]"><YmqProgressPie progressPie={overview?.progressPie || []} unclassifiedParticipantCount={overview?.roster.unclassifiedParticipantCount || 0} /><YmqParticipantRanking rankings={rankings} /></div></>}</div></SiyaumAppShell>;
}

function Metric({ label, value, icon }: { label: string; value: string | number; icon: string }) { return <section className="rounded-lg border border-border bg-surface p-5"><span className="material-symbols-rounded text-tertiary" aria-hidden="true">{icon}</span><p className="mt-3 text-xs font-semibold uppercase tracking-wide text-primary/60">{label}</p><p className="mt-1 text-2xl font-bold text-primary">{value}</p></section>; }
