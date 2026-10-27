"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ParentRegistrationStepper } from "@/components/parent/parent-registration-stepper";
import {
  apiRequest,
  BASE_DOCUMENT_TYPES,
  DOCUMENT_LABELS,
  getStageRouteForRegistration,
  loadParentRegistration,
  uploadDocumentToCloudinary,
  type DocumentType,
  type ParentRegistration,
} from "@/lib/spmb-registration";

export default function ParentDocumentsPage() {
  const [registration, setRegistration] = useState<ParentRegistration | null>(null);
  const [files, setFiles] = useState<Partial<Record<DocumentType, File>>>({});
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
      .catch((err) => setNotice({ type: "error", message: err instanceof Error ? err.message : "Gagal memuat berkas." }))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (type: DocumentType) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setFiles((cur) => ({ ...cur, [type]: file }));
  };

  const handleSubmit = async () => {
    if (!registration) return;
    setBusy(true);
    setNotice(null);
    try {
      const uploaded = new Set(registration.documents.map((doc) => doc.type));
      for (const docType of BASE_DOCUMENT_TYPES) {
        if (files[docType]) {
          await uploadDocumentToCloudinary(registration.id, docType, files[docType] as File);
        } else if (!uploaded.has(docType)) {
          throw new Error(`Pilih dokumen wajib: ${DOCUMENT_LABELS[docType]}`);
        }
      }
      await apiRequest(`/api/documents/finalize/${encodeURIComponent(registration.id)}`, { method: "POST" });
      await refresh();
      setNotice({ type: "success", message: "Berkas wajib terunggah lengkap. Silakan lanjutkan tahap pemeriksaan kesehatan." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Gagal mengunggah berkas." });
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

  const canEdit = registration.status === "documents_uploaded";

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
          <h1 className="font-heading font-bold text-2xl">Tahap 3 — Unggah Berkas Persyaratan</h1>
          <p className="text-sm text-gray-600 mt-1">
            Format yang diterima: JPG, PNG (maks 2 MB) atau PDF (maks 5 MB). Berkas diunggah langsung ke Cloudinary.
          </p>

          {canEdit ? (
            <div className="mt-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {BASE_DOCUMENT_TYPES.map((type) => {
                  const existing = registration.documents.find((d) => d.type === type);
                  return (
                    <label key={type} className="block border border-border rounded-md p-4 bg-white text-xs">
                      <span className="font-semibold block mb-1">{DOCUMENT_LABELS[type]} *</span>
                      {existing && (
                        <span className="text-tertiary block mb-2">Terunggah: {existing.fileName}</span>
                      )}
                      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange(type)} className="w-full text-xs" />
                    </label>
                  );
                })}
              </div>
              <button type="button" onClick={handleSubmit} disabled={busy} className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] disabled:opacity-50 text-white rounded-sm text-xs font-semibold">
                {busy ? "Mengunggah..." : "Simpan & Finalisasi Berkas"}
              </button>
            </div>
          ) : (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm">
              <p>Berkas persyaratan telah difinalisasi.</p>
              <Link href={getStageRouteForRegistration(registration)} className="mt-3 inline-block text-xs font-semibold text-tertiary hover:underline">
                Buka Tahap Aktif Saat Ini
              </Link>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
