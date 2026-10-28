"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ParentRegistrationStepper } from "@/components/parent/parent-registration-stepper";
import {
  apiRequest,
  getStageRouteForRegistration,
  loadParentRegistration,
  uploadDocumentToCloudinary,
  type ParentRegistration,
} from "@/lib/spmb-registration";

export default function ParentMedicalPage() {
  const [registration, setRegistration] = useState<ParentRegistration | null>(null);
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const refresh = async () => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const reg = await loadParentRegistration(params?.get("registrationId"));
    setRegistration(reg);
  };

  useEffect(() => {
    refresh()
      .catch((err) => setNotice({ type: "error", message: err instanceof Error ? err.message : "Gagal memuat data kesehatan." }))
      .finally(() => setLoading(false));
  }, []);

  const handleUploadMedical = async () => {
    if (!registration) return;
    if (!medicalFile) {
      setNotice({ type: "error", message: "Pilih file hasil pemeriksaan kesehatan terlebih dahulu." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      await uploadDocumentToCloudinary(registration.id, "medical_result", medicalFile);
      await apiRequest(`/api/documents/medical-done/${encodeURIComponent(registration.id)}`, { method: "POST" });
      await refresh();
      setNotice({ type: "success", message: "Hasil kesehatan berhasil dikirim dan menunggu verifikasi panitia." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal mengunggah hasil kesehatan." });
    } finally {
      setBusy(false);
    }
  };

  const handleMarkDone = async () => {
    if (!registration) return;
    setBusy(true);
    setNotice(null);
    try {
      await apiRequest(`/api/documents/medical-done/${encodeURIComponent(registration.id)}`, { method: "POST" });
      await refresh();
      setNotice({ type: "success", message: "Pemeriksaan kesehatan selesai dan masuk antrean verifikasi panitia." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal memproses tahap kesehatan." });
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

        <SpmbTopbar /><main className="max-w-3xl mx-auto px-4 py-12">
          <Link href="/parent" className="text-xs font-semibold text-tertiary hover:underline">Kembali ke Daftar Pendaftaran</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">

      <SpmbTopbar /><main className="max-w-5xl mx-auto px-4 py-8">
        <ParentRegistrationStepper registration={registration} />

        {notice && (
          <div className={`mt-6 border rounded-md p-4 text-sm ${notice.type === "error" ? "bg-red-50 border-red-200 text-red-800" : "bg-[#e6f4f1] border-[#b9ded7] text-[#0b6355]"}`}>
            {notice.message}
          </div>
        )}

        <section className="mt-6 bg-surface border border-border rounded-lg p-6">
          <h1 className="font-heading font-bold text-2xl">Tahap 4 — Pemeriksaan Kesehatan (IMC)</h1>
          {["medical_pending", "medical_uploaded"].includes(registration.status) && (
            <div className="mt-5 rounded-md border border-border bg-neutral p-4">
              <p className="text-sm text-slate-700">Unduh surat pengantar pemeriksaan kesehatan sebelum membawa calon murid ke fasilitas kesehatan. Surat ini memuat QR untuk memverifikasi bahwa calon murid terdaftar sebagai peserta SPMB.</p>
              <a href={`/api/pdf/medical-referral?registrationId=${encodeURIComponent(registration.id)}`} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex rounded-sm border border-tertiary bg-white px-4 py-2 text-xs font-semibold text-tertiary hover:bg-[#eef7f5]">
                Surat Pengantar Pemeriksaan Kesehatan
              </a>
            </div>
          )}
          {registration.status === "medical_pending" && (
            <div className="mt-5 space-y-4 max-w-xl">
              <label className="block border border-border rounded-md p-4 bg-white text-xs">
                <span className="font-semibold block mb-1">File Hasil Pemeriksaan Kesehatan (IMC) *</span>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setMedicalFile(e.target.files?.[0] || null)}
                  className="w-full text-xs"
                />
              </label>
              <button type="button" onClick={handleUploadMedical} disabled={busy} className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-xs font-semibold">
                {busy ? "Mengunggah..." : "Unggah & Ajukan Verifikasi"}
              </button>
            </div>
          )}

          {registration.status === "medical_uploaded" && (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-gray-600">Dokumen hasil kesehatan telah terunggah. Klik tombol di bawah untuk mengirim berkas ke antrean verifikasi panitia.</p>
              <button type="button" onClick={handleMarkDone} disabled={busy} className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-xs font-semibold">
                {busy ? "Memproses..." : "Kirim ke Verifikasi Panitia"}
              </button>
            </div>
          )}

          {registration.status === "verification" && (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm">
              <p>
                Status Verifikasi Berkas:{" "}
                <strong>{registration.dossierReviewStatus === "approved" ? "Disetujui" : "Sedang Diperiksa Panitia"}</strong>
              </p>
              {registration.dossierReviewStatus === "approved" && (
                <Link
                  href={`/parent/observation?registrationId=${encodeURIComponent(registration.id)}`}
                  className="mt-3 inline-block px-4 py-2 bg-tertiary text-white rounded-sm text-xs font-semibold"
                >
                  Pilih Jadwal Observasi
                </Link>
              )}
            </div>
          )}

          {!["medical_pending", "medical_uploaded", "verification"].includes(registration.status) && (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm">
              <Link href={getStageRouteForRegistration(registration)} className="text-xs font-semibold text-tertiary hover:underline">
                Buka Tahap Aktif Saat Ini
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
