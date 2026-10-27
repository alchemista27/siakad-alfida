"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest, type PeriodSummary } from "@/lib/spmb-registration";

export default function ParentSelectUnitPage() {
  const [periods, setPeriods] = useState<PeriodSummary[]>([]);
  const [selectedPeriodId, setSelectedPeriodId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);

  useEffect(() => {
    apiRequest<PeriodSummary[]>("/api/periods/public")
      .then((result) => setPeriods(Array.isArray(result) ? result : []))
      .catch((error) => setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal memuat unit pendaftaran." }))
      .finally(() => setLoading(false));
  }, []);

  const createDraft = async () => {
    if (!selectedPeriodId) {
      setNotice({ type: "error", message: "Pilih unit dan gelombang pendaftaran terlebih dahulu." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const created = await apiRequest<{ id?: unknown }>("/api/registrations/online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ periodId: selectedPeriodId }),
      });
      if (typeof created.id !== "string" || !created.id.trim()) {
        throw new Error("Server belum mengembalikan ID pendaftaran. Silakan coba lagi.");
      }
      window.location.assign(`/parent/payment?registrationId=${encodeURIComponent(created.id)}`);
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal membuat draft pendaftaran." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">

      <SpmbTopbar /><main className="max-w-5xl mx-auto px-4 py-8 sm:py-10">
        <Link href="/parent" className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary hover:underline"><span className="material-symbols-rounded text-base">arrow_back</span>Kembali ke pendaftaran</Link>
        <header className="mt-5 border-b border-border pb-6">
          <p className="text-xs font-semibold tracking-wider text-tertiary uppercase">Tahap 1</p>
          <h1 className="font-heading font-bold text-3xl mt-1">Pilih Unit dan Gelombang</h1>
          <p className="mt-2 text-sm text-gray-600">Pilih satu unit yang tersedia. Data calon murid diisi setelah pembayaran diverifikasi.</p>
        </header>

        {notice && <div className={`mt-6 ${notice.type === "error" ? "spmb-notice-error" : "spmb-notice-success"}`}>{notice.message}</div>}

        {loading ? <div className="py-16 grid place-items-center"><span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span></div> : periods.length === 0 ? <section className="spmb-card mt-6 p-6 text-sm text-gray-600">Belum ada periode pendaftaran yang dibuka saat ini.</section> : <>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {periods.map((period) => {
              const selected = selectedPeriodId === period.id;
              return <button key={period.id} type="button" disabled={period.isFull} onClick={() => setSelectedPeriodId(period.id)} className={`spmb-card text-left p-5 transition-colors disabled:cursor-not-allowed ${period.isFull ? "bg-neutral opacity-60" : selected ? "border-tertiary bg-[#e6f4f1]" : "hover:border-[#b9ded7]"}`}>
                <div className="flex items-start justify-between gap-3"><div><h2 className="font-heading font-bold text-xl">{period.unitName}</h2><p className="text-sm text-tertiary font-semibold mt-1">{period.label}</p></div>{period.isFull && <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-sm">Penuh</span>}</div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs"><div><dt className="text-gray-500">Biaya formulir</dt><dd className="mt-1 font-semibold">Rp {Number(period.fee).toLocaleString("id-ID")}</dd></div><div><dt className="text-gray-500">Kapasitas tersedia</dt><dd className="mt-1 font-semibold">{period.availableSlots} dari {period.quota} kursi</dd></div></dl>
              </button>;
            })}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3"><button type="button" disabled={busy || !selectedPeriodId} onClick={createDraft} className="spmb-button-primary"><span className="material-symbols-rounded text-base">arrow_forward</span>{busy ? "Memproses..." : "Lanjut ke Pembayaran"}</button><p className="text-xs text-gray-500">Unit dan gelombang tidak dapat diubah setelah draft dibuat.</p></div>
        </>}
      </main>
    </div>
  );
}
