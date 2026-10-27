"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  apiRequest,
  getStageRouteForRegistration,
  STATUS_LABELS,
  type ParentRegistration,
} from "@/lib/spmb-registration";

export default function ParentSpmbPage() {
  const [registrations, setRegistrations] = useState<ParentRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<ParentRegistration[]>("/api/registrations/parent")
      .then((result) => setRegistrations(Array.isArray(result) ? result : []))
      .catch((error) => setNotice(error instanceof Error ? error.message : "Gagal memuat daftar pendaftaran."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-neutral text-primary font-body"><span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span></div>;
  }

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">

      <SpmbTopbar /><main className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        <header className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-tertiary uppercase">Portal Orang Tua</p>
            <h1 className="font-heading font-bold text-3xl mt-1">Pendaftaran Putra/Putri</h1>
            <p className="mt-2 text-sm text-gray-600">Kelola setiap berkas SPMB secara terpisah, dari pemilihan unit sampai hasil seleksi.</p>
          </div>
          <Link href="/parent/select-unit" className="spmb-button-primary"><span className="material-symbols-rounded text-base">add</span>Mulai Pendaftaran Anak</Link>
        </header>

        {notice && <div className="spmb-notice-error mt-6">{notice}</div>}

        {registrations.length === 0 ? <section className="spmb-card mt-6 p-6"><h2 className="font-heading font-bold text-xl">Belum ada berkas pendaftaran</h2><p className="mt-2 text-sm text-gray-600">Mulai dengan memilih unit dan gelombang yang masih menerima pendaftaran.</p><Link href="/parent/select-unit" className="mt-4 inline-flex text-sm font-semibold text-tertiary hover:underline">Pilih unit pendaftaran</Link></section> : <section className="mt-6 space-y-4"><h2 className="font-heading font-bold text-xl">Berkas Pendaftaran</h2><div className="grid gap-4">{registrations.map((reg) => <article key={reg.id} className="spmb-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-heading font-bold text-lg">{reg.studentData?.fullName || "Calon Murid"}</h3><span className="font-mono text-xs bg-neutral border border-border px-2 py-0.5 rounded-sm">{reg.registrationNumber}</span><span className="text-xs font-semibold bg-[#e6f4f1] text-tertiary px-2 py-0.5 rounded-sm">{reg.period.unitName} · {reg.period.label}</span></div><p className="text-xs text-gray-600 mt-1.5">Status saat ini: <strong>{STATUS_LABELS[reg.status]}</strong></p></div><Link href={getStageRouteForRegistration(reg)} className="spmb-button-primary text-xs">Lanjutkan Tahapan</Link></article>)}</div></section>}
      </main>
    </div>
  );
}
