"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { SpmbNavbar } from "@/components/SpmbNavbar";
import { ParentRegistrationStepper } from "@/components/parent/parent-registration-stepper";
import {
  apiRequest,
  getStageRouteForRegistration,
  loadParentRegistration,
  type ParentRegistration,
} from "@/lib/spmb-registration";

export default function ParentPaymentPage() {
  const [registration, setRegistration] = useState<ParentRegistration | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const refresh = async () => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const regId = params?.get("registrationId");
    const reg = await loadParentRegistration(regId);
    setRegistration(reg);
    if (reg?.payment?.proofUrl) setProofUrl(reg.payment.proofUrl);
  };

  useEffect(() => {
    refresh()
      .catch((err) => setNotice({ type: "error", message: err instanceof Error ? err.message : "Gagal memuat data." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!registration) return;
    if (!proofUrl.trim()) {
      setNotice({ type: "error", message: "Masukkan referensi/tautan bukti pembayaran terlebih dahulu." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await apiRequest(`/api/registrations/${encodeURIComponent(registration.id)}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proofUrl: proofUrl.trim(),
          amount: Number(registration.period.fee),
        }),
      });
      await refresh();
      setNotice({ type: "success", message: "Bukti pembayaran berhasil dikirim dan menunggu verifikasi panitia." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal mengirim pembayaran." });
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-neutral"><span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span></div>;
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-neutral text-primary font-body">
        <SpmbNavbar />
        <main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-surface border border-border rounded-lg p-6">
            <p className="text-sm text-gray-600">Data pendaftaran tidak ditemukan.</p>
            <Link href="/parent" className="mt-4 inline-block text-xs font-semibold text-tertiary hover:underline">Kembali ke Daftar Pendaftaran</Link>
          </div>
        </main>
      </div>
    );
  }

  const canUpload = registration.status === "pending_payment";

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">
      <SpmbNavbar />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <ParentRegistrationStepper registration={registration} />

        {notice && (
          <div className={`mt-6 border rounded-md p-4 text-sm ${notice.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-[#e6f4f1] border-[#b9ded7] text-[#0b6355]"}`}>
            {notice.message}
          </div>
        )}

        <section className="mt-6 bg-surface border border-border rounded-lg p-6">
          <h1 className="font-heading font-bold text-2xl">Tahap 1 — Pembayaran Formulir</h1>
          <p className="text-sm text-gray-600 mt-1">
            Biaya formulir: <strong>Rp {Number(registration.period.fee).toLocaleString("id-ID")}</strong>
            {registration.period.bankName ? ` · ${registration.period.bankName} ${registration.period.bankNumber || ""} a.n. ${registration.period.bankHolder || "-"}` : ""}
          </p>

          {registration.payment?.rejectionNote && (
            <div className="mt-4 border border-red-200 bg-red-50 text-red-800 rounded-md p-3 text-xs">
              <strong>Catatan Penolakan Pembayaran:</strong> {registration.payment.rejectionNote}
            </div>
          )}

          {canUpload ? (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4 max-w-xl">
              <label className="block text-xs">
                <span className="font-semibold block mb-1">Referensi / Tautan Bukti Transfer *</span>
                <input
                  type="text"
                  required
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm"
                  placeholder="Masukkan nomor referensi atau URL bukti transfer"
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-xs font-semibold"
              >
                {busy ? "Mengirim..." : "Kirim Bukti Pembayaran"}
              </button>
            </form>
          ) : (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm">
              <p>Status pembayaran saat ini: <strong>{registration.payment?.status || registration.status}</strong></p>
              <Link
                href={getStageRouteForRegistration(registration)}
                className="mt-3 inline-block text-xs font-semibold text-tertiary hover:underline"
              >
                Buka Tahap Aktif Saat Ini
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
