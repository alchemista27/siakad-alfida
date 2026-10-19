"use client";

import { FormEvent, useEffect, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type Unit = { unitId: string; unitName: string; attendance?: { recordedCount: number; presentCount: number; presentRate: number }; grades?: { recordedCount: number; expectedEntryCount: number; completionRate: number }; journals?: { recordedCount: number; scheduledCount: number; completionRate: number }; lhbs?: { reportCount: number; publishedCount: number; publishRate: number }; extracurricular?: { activityCount: number; membershipCount: number; gradedMembershipCount: number; gradeCompletionRate: number } };
type Monitoring = { academicYearId: string | null; units: Unit[] };
const percent = (value: number) => `${Math.round(value * 100)}%`;

export default function AcademicMonitoringPage() {
  const [academicYearId, setAcademicYearId] = useState("");
  const [report, setReport] = useState<Monitoring | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load(yearId = academicYearId) {
    setLoading(true); setError(null);
    try { setReport(await siakadApiFetch<Monitoring>(`/monitoring/academic${yearId.trim() ? `?academicYearId=${encodeURIComponent(yearId.trim())}` : ""}`)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal memuat monitoring akademik."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(""); }, []);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void load(); }

  return <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-5 md:p-8"><header><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#0f7f6d]">Administrasi unit</p><h1 className="mt-2 font-heading text-3xl text-[#454545]">Monitoring akademik</h1><p className="mt-2 text-sm text-[#454545]/75">Agregat hanya menampilkan unit yang berada dalam cakupan akses akun Anda.</p></header><form onSubmit={submit} className="flex flex-wrap gap-3 rounded-lg border border-[#E3E8E7] bg-white p-4"><label className="grid gap-1 text-sm">ID tahun ajaran (opsional)<input value={academicYearId} onChange={(event) => setAcademicYearId(event.target.value)} className="rounded-sm border border-[#E3E8E7] px-3 py-2" /></label><button className="self-end rounded-sm bg-[#0f7f6d] px-4 py-2 text-sm font-semibold text-white">Muat monitoring</button></form>{error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{loading && <p className="text-sm text-[#454545]/70">Memuat monitoring akademik…</p>}{!loading && !error && report?.units.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada data unit dalam cakupan monitoring Anda.</p>}{!loading && report?.units.map((unit) => <section key={unit.unitId} className="rounded-lg border border-[#E3E8E7] bg-white p-5"><h2 className="font-heading text-xl">{unit.unitName}</h2><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{unit.attendance && <article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">Kehadiran</p><p className="mt-1 font-semibold">{unit.attendance.recordedCount} catatan · {percent(unit.attendance.presentRate)} hadir</p></article>}{unit.grades && <article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">Nilai</p><p className="mt-1 font-semibold">{unit.grades.recordedCount}/{unit.grades.expectedEntryCount} · {percent(unit.grades.completionRate)}</p></article>}{unit.journals && <article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">Jurnal</p><p className="mt-1 font-semibold">{unit.journals.recordedCount}/{unit.journals.scheduledCount} · {percent(unit.journals.completionRate)}</p></article>}{unit.lhbs && <article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">LHBS</p><p className="mt-1 font-semibold">{unit.lhbs.publishedCount}/{unit.lhbs.reportCount} · {percent(unit.lhbs.publishRate)}</p></article>}{unit.extracurricular && <article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">Ekstrakurikuler</p><p className="mt-1 font-semibold">{unit.extracurricular.gradedMembershipCount}/{unit.extracurricular.membershipCount} · {percent(unit.extracurricular.gradeCompletionRate)}</p></article>}</div>{!unit.attendance && !unit.grades && !unit.journals && !unit.lhbs && !unit.extracurricular && <p className="mt-3 text-sm text-[#454545]/70">Belum ada sumber akademik untuk diringkas.</p>}</section>)}</main>;
}
