"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ParentRegistrationStepper } from "@/components/parent/parent-registration-stepper";
import {
  getStageRouteForRegistration,
  loadParentRegistration,
  SpmbApiError,
  uploadPaymentProofToCloudinary,
  type ParentRegistration,
} from "@/lib/spmb-registration";

type RegistrationLoadState =
  | { kind: "loading" }
  | { kind: "ready"; registration: ParentRegistration }
  | { kind: "not_found"; message: string }
  | { kind: "error"; message: string };

export default function ParentPaymentPage() {
  const [loadState, setLoadState] = useState<RegistrationLoadState>({ kind: "loading" });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const refresh = async () => {
    setLoadState({ kind: "loading" });
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const regId = params?.get("registrationId");
    try {
      const registration = await loadParentRegistration(regId);
      if (!registration) {
        setLoadState({ kind: "not_found", message: "Pendaftaran tidak ditemukan atau belum tersedia." });
        return;
      }
      setLoadState({ kind: "ready", registration });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memuat data pendaftaran.";
      setLoadState(
        error instanceof SpmbApiError && error.status === 404
          ? { kind: "not_found", message: "Pendaftaran tidak ditemukan atau tidak dapat diakses." }
          : { kind: "error", message },
      );
    }
  };

  useEffect(() => {
    void refresh().finally(() => setLoading(false));
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;
    const maximumSize = file.type === "application/pdf" ? 5 * 1024 * 1024 : 2 * 1024 * 1024;
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type) || file.size > maximumSize) {
      setProofFile(null);
      setNotice({ type: "error", message: "Gunakan JPG/PNG maksimal 2 MB atau PDF maksimal 5 MB." });
      event.target.value = "";
      return;
    }
    setNotice(null);
    setProofFile(file);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (loadState.kind !== "ready") return;
    const registration = loadState.registration;
    if (!proofFile) {
      setNotice({ type: "error", message: "Pilih berkas bukti pembayaran terlebih dahulu." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await uploadPaymentProofToCloudinary(registration.id, proofFile);
      await refresh();
      setNotice({ type: "success", message: "Bukti pembayaran berhasil dikirim dan menunggu verifikasi panitia." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal mengirim pembayaran." });
    } finally {
      setBusy(false);
    }
  };

  if (loading || loadState.kind === "loading") {
    return <div className="min-h-screen grid place-items-center bg-neutral"><span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span></div>;
  }

  if (loadState.kind === "not_found") {
    return (
      <div className="min-h-screen bg-neutral text-primary font-body">

        <SpmbTopbar /><main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-surface border border-border rounded-lg p-6">
            <p className="text-sm text-gray-600">{loadState.message}</p>
            <Link href="/parent" className="mt-4 inline-block text-xs font-semibold text-tertiary hover:underline">Kembali ke Daftar Pendaftaran</Link>
          </div>
        </main>
      </div>
    );
  }

  if (loadState.kind === "error") {
    return (
      <div className="min-h-screen bg-neutral text-primary font-body">

        <SpmbTopbar /><main className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-surface border border-red-200 rounded-lg p-6">
            <h1 className="font-heading font-bold text-xl">Data pendaftaran belum dapat dimuat</h1>
            <p className="mt-2 text-sm text-red-800">{loadState.message}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => void refresh()} className="spmb-button-primary">Coba Lagi</button>
              <Link href="/parent" className="inline-flex items-center px-4 py-2 border border-border rounded-sm text-xs font-semibold text-tertiary hover:bg-neutral">Kembali ke Daftar Pendaftaran</Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const registration = loadState.registration;
  const canUpload = registration.status === "pending_payment";

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">

      <SpmbTopbar /><main className="max-w-5xl mx-auto px-4 py-8">
        <ParentRegistrationStepper registration={registration} />

        {notice && (
          <div className={notice.type === "error" ? "mt-6 border rounded-md p-4 text-sm bg-red-50 border-red-200 text-red-800" : "mt-6 border rounded-md p-4 text-sm bg-[#e6f4f1] border-[#b9ded7] text-[#0b6355]"}>
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
                <span className="font-semibold block mb-1">Bukti Transfer *</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  required
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-border rounded-sm bg-white text-sm"
                />
                <span className="mt-1 block text-gray-500">JPG/PNG maksimal 2 MB atau PDF maksimal 5 MB. Berkas diunggah langsung ke Cloudinary.</span>
                {proofFile && <span className="mt-1 block text-tertiary">Dipilih: {proofFile.name}</span>}
              </label>
              <button
                type="submit"
                disabled={busy}
                className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-xs font-semibold"
              >
                {busy ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
              </button>
            </form>
          ) : (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm">
              <p>Status pembayaran saat ini: <strong>{registration.payment?.status || registration.status}</strong></p>
              {registration.payment?.proofFileName && <p className="mt-1 text-xs text-tertiary">Bukti privat: {registration.payment.proofFileName}</p>}
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
