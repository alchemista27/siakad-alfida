"use client";

import { useEffect, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type Child = {
  student: { id: string; fullName: string; nis: string | null };
  academicYear: { id: string; name: string } | null;
  classroom: { id: string; name: string } | null;
  schedule: { dayOfWeek: number; startTime: string; endTime: string; subjectName: string }[];
  attendance: { recordedCount: number; presentCount: number; presentRate: number };
  gradeCompleteness: { assignedSubjectCount: number; gradedSubjectCount: number; completionRate: number };
  extracurricular: { name: string; semester: number; grade: string; notes: string | null }[];
  publishedLhbs: { id: string; semester: number; publishedAt: string; summary: unknown }[];
};
type Overview = { children: Child[] };
const days = ["", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function ParentDashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load() {
    setLoading(true); setError(null);
    try { setOverview(await siakadApiFetch<Overview>("/parent-portal/overview")); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal memuat ringkasan anak."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  return <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-5 md:p-8">
    <header><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#0f7f6d]">Portal orang tua</p><h1 className="mt-2 font-heading text-3xl text-[#454545]">Ringkasan akademik anak</h1><p className="mt-2 text-sm text-[#454545]/75">Data anak diturunkan dari keterkaitan akun orang tua dan hanya dapat dibaca.</p></header>
    {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading && <p className="text-sm text-[#454545]/70">Memuat ringkasan akademik…</p>}
    {!loading && !error && overview?.children.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada anak yang terhubung ke akun ini.</p>}
    {!loading && overview?.children.map((child) => <section key={child.student.id} className="space-y-4 rounded-lg border border-[#E3E8E7] bg-white p-5">
      <div><h2 className="font-heading text-2xl text-[#454545]">{child.student.fullName}</h2><p className="mt-1 text-sm text-[#454545]/70">{child.academicYear?.name ?? "Belum ada tahun ajaran aktif"} · {child.classroom?.name ?? "Belum ditempatkan"}</p></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">Kehadiran</p><p className="mt-1 font-semibold">{child.attendance.presentCount}/{child.attendance.recordedCount} hadir ({Math.round(child.attendance.presentRate * 100)}%)</p></article><article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">Kelengkapan nilai</p><p className="mt-1 font-semibold">{child.gradeCompleteness.gradedSubjectCount}/{child.gradeCompleteness.assignedSubjectCount} mapel ({Math.round(child.gradeCompleteness.completionRate * 100)}%)</p></article><article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">Ekstrakurikuler</p><p className="mt-1 font-semibold">{child.extracurricular.length} kegiatan</p></article><article className="rounded-sm border border-[#E3E8E7] p-3"><p className="text-xs text-[#454545]/65">LHBS terbit</p><p className="mt-1 font-semibold">{child.publishedLhbs.length} laporan</p></article></div>
      <div className="grid gap-4 lg:grid-cols-2"><article><h3 className="font-semibold">Jadwal</h3>{child.schedule.length === 0 ? <p className="mt-2 text-sm text-[#454545]/70">Belum ada jadwal aktif.</p> : <ul className="mt-2 space-y-1 text-sm">{child.schedule.map((item) => <li key={`${item.dayOfWeek}-${item.startTime}-${item.subjectName}`}>{days[item.dayOfWeek]} · {item.startTime}–{item.endTime} · {item.subjectName}</li>)}</ul>}</article><article><h3 className="font-semibold">Ekstrakurikuler</h3>{child.extracurricular.length === 0 ? <p className="mt-2 text-sm text-[#454545]/70">Belum ada ringkasan kegiatan.</p> : <ul className="mt-2 space-y-1 text-sm">{child.extracurricular.map((item) => <li key={`${item.name}-${item.semester}`}>{item.name} · Semester {item.semester}: {item.grade}</li>)}</ul>}</article></div>
      {child.publishedLhbs.length > 0 && <p className="text-sm text-[#0f7f6d]">LHBS semester {child.publishedLhbs.map((report) => report.semester).join(", ")} sudah dipublikasikan.</p>}
    </section>)}
  </main>;
}
