"use client";

import { useState } from "react";

export interface ReviewableRegistration {
  id: string;
  registrationNumber: string;
  status: string;
  dossierReviewStatus?: string;
  dossierRevisionNote?: string | null;
  guardianName: string;
  guardianPhone: string;
  studentData?: { fullName: string; gender: string } | null;
  payment?: { status: string; amount: number; proofUrl: string | null; proofFileName?: string | null } | null;
}

export function RegistrationReviewPanel({
  registrations,
  onChanged,
  onNotify,
}: {
  registrations: ReviewableRegistration[];
  onChanged: () => Promise<void>;
  onNotify: (type: "success" | "error", message: string) => void;
}) {
  const [revisionNoteById, setRevisionNoteById] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const canVerifyPayment = (reg: ReviewableRegistration) => (
    reg.status === "payment_uploaded" && reg.payment?.status === "uploaded"
  );

  const verifyPayment = async (regId: string, isApproved: boolean) => {
    setBusyId(regId);
    try {
      const res = await fetch(`/api/registrations/${encodeURIComponent(regId)}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isApproved,
          rejectionNote: isApproved ? undefined : (revisionNoteById[regId] || "Bukti transfer tidak sesuai."),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal memproses verifikasi pembayaran.");
      await onChanged();
      onNotify("success", isApproved ? "Pembayaran diverifikasi." : "Pembayaran ditolak untuk perbaikan.");
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal memproses pembayaran.");
    } finally {
      setBusyId(null);
    }
  };

  const verifyDocuments = async (regId: string, isApproved: boolean) => {
    setBusyId(regId);
    try {
      const res = await fetch(`/api/registrations/${encodeURIComponent(regId)}/verify-documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isApproved,
          revisionNote: isApproved ? undefined : (revisionNoteById[regId] || "Mohon perbaiki berkas yang kurang jelas."),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Gagal memproses verifikasi berkas.");
      await onChanged();
      onNotify("success", isApproved ? "Berkas disetujui dan siap pilih jadwal observasi." : "Permintaan revisi berkas dikirim.");
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal memproses berkas.");
    } finally {
      setBusyId(null);
    }
  };

  const viewPaymentProof = async (regId: string) => {
    try {
      const res = await fetch(`/api/registrations/${encodeURIComponent(regId)}/payment-proof/download-url`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.downloadUrl !== "string") {
        throw new Error(data.message || "Bukti pembayaran privat tidak dapat dibuka.");
      }
      const proofWindow = window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
      if (!proofWindow) throw new Error("Browser memblokir tab bukti pembayaran. Izinkan pop-up lalu coba lagi.");
    } catch (error) {
      onNotify("error", error instanceof Error ? error.message : "Gagal membuka bukti pembayaran.");
    }
  };

  return (
    <section className="bg-white border border-[#E3E8E7] rounded-lg p-5 space-y-4">
      <div>
        <h3 className="font-heading font-bold text-base text-[#454545]">Verifikasi Pembayaran & Berkas Pendaftar</h3>
        <p className="text-xs text-gray-500 mt-1">
          Setujui bukti bayar atau berkas pendaftar, atau kirim catatan revisi tanpa menggunakan dialog browser.
        </p>
      </div>
      <div className="space-y-3">
        {registrations.map((reg) => (
          <div key={reg.id} className="border border-[#E3E8E7] rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-[#454545]">
                {reg.registrationNumber} · {reg.studentData?.fullName || "Calon Murid"}
              </p>
              <p className="text-gray-500">Status: {reg.status} · Wali: {reg.guardianName}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <input
                placeholder="Catatan tolak / revisi"
                value={revisionNoteById[reg.id] || ""}
                onChange={(e) => setRevisionNoteById((prev) => ({ ...prev, [reg.id]: e.target.value }))}
                className="px-2.5 py-1 border border-[#E3E8E7] rounded text-xs"
              />
              {reg.payment?.proofFileName && (
                <button
                  type="button"
                  disabled={busyId === reg.id}
                  onClick={() => void viewPaymentProof(reg.id)}
                  className="px-2.5 py-1 border border-[#0f7f6d] text-[#0f7f6d] rounded font-semibold"
                >
                  Lihat Bukti
                </button>
              )}
              {canVerifyPayment(reg) && (
                <>
                  <button
                    type="button"
                    disabled={busyId === reg.id}
                    onClick={() => verifyPayment(reg.id, true)}
                    className="px-2.5 py-1 bg-[#0f7f6d] text-white rounded font-semibold"
                  >
                    Setujui Bayar
                  </button>
                  <button
                    type="button"
                    disabled={busyId === reg.id}
                    onClick={() => verifyPayment(reg.id, false)}
                    className="px-2.5 py-1 border border-red-200 text-red-700 rounded font-semibold"
                  >
                    Tolak Bayar
                  </button>
                </>
              )}
              <button
                type="button"
                disabled={busyId === reg.id}
                onClick={() => verifyDocuments(reg.id, true)}
                className="px-2.5 py-1 bg-[#e6f4f1] text-[#0f7f6d] rounded font-semibold"
              >
                Setujui Berkas
              </button>
              <button
                type="button"
                disabled={busyId === reg.id}
                onClick={() => verifyDocuments(reg.id, false)}
                className="px-2.5 py-1 border border-amber-300 text-amber-800 rounded font-semibold"
              >
                Revisi Berkas
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
