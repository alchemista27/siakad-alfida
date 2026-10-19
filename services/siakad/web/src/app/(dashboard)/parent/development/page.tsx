"use client";

import { useEffect, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type RecordSummary = { id: string; studentId: string; studentName: string; kind: string; occurredAt: string; summary: string };
const labels: Record<string, string> = { character: "Karakter", violation: "Pelanggaran", bpi: "BPI" };

export default function ParentDevelopmentPage() {
  const [records, setRecords] = useState<RecordSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  async function load() {
    setLoading(true); setError(null);
    try { setRecords(await siakadApiFetch<RecordSummary[]>("/student-development/parent")); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Gagal memuat catatan perkembangan."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  return <main className="mx-auto min-h-screen max-w-5xl space-y-6 p-5 md:p-8">
    <header><p className="text-xs font-semibold uppercase tracking-[.08em] text-[#0f7f6d]">Portal orang tua</p><h1 className="mt-2 font-heading text-3xl text-[#454545]">Perkembangan anak</h1><p className="mt-2 text-sm text-[#454545]/75">Hanya ringkasan catatan yang telah disetujui wali kelas ditampilkan.</p></header>
    {error && <p role="alert" className="rounded-sm border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}{loading && <p className="text-sm text-[#454545]/70">Memuat catatan perkembangan…</p>}
    {!loading && !error && records.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada catatan perkembangan yang disetujui.</p>}
    {!loading && records.length > 0 && <section className="rounded-lg border border-[#E3E8E7] bg-white"><ul className="divide-y divide-[#E3E8E7]">{records.map((record) => <li key={record.id} className="p-4"><p className="font-semibold text-[#454545]">{record.studentName} · {labels[record.kind] ?? record.kind}</p><p className="mt-1 text-sm text-[#454545]/70">{new Date(record.occurredAt).toLocaleDateString("id-ID")} · {record.summary}</p></li>)}</ul></section>}
  </main>;
}
