"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ParentRegistrationStepper } from "@/components/parent/parent-registration-stepper";
import {
  loadParentRegistration,
  STATUS_LABELS,
  type ParentRegistration,
} from "@/lib/spmb-registration";

export default function ParentResultPage() {
  const [registration, setRegistration] = useState<ParentRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    loadParentRegistration(params?.get("registrationId"))
      .then(setRegistration)
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat pengumuman."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-neutral"><span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span></div>;
  }

  if (!registration) {
    return (
      <div className="min-h-screen bg-neutral text-primary font-body">

        <SpmbTopbar /><main className="max-w-3xl mx-auto px-4 py-12">
          {error && <p className="text-sm text-red-700 mb-3">{error}</p>}
          <Link href="/parent" className="text-xs font-semibold text-tertiary hover:underline">Kembali ke Daftar Pendaftaran</Link>
        </main>
      </div>
    );
  }

  const decisionEvent = [...(registration.events || [])]
    .reverse()
    .find((ev) => ev.toStatus === "accepted" || ev.toStatus === "rejected");
  const persistedDecisionNote = registration.rejectionReason || decisionEvent?.note || null;

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">

      <SpmbTopbar /><main className="max-w-5xl mx-auto px-4 py-8">
        <ParentRegistrationStepper registration={registration} />

        <section className="mt-6 bg-surface border border-border rounded-lg p-6">
          <h1 className="font-heading font-bold text-2xl">Tahap 6 — Pengumuman & Keputusan Seleksi</h1>
          <p className="text-sm text-gray-600 mt-1">
            Status Pendaftaran: <strong>{STATUS_LABELS[registration.status]}</strong>
          </p>

          {(registration.status === "accepted" || registration.status === "enrolled") && (
            <div className="mt-5 border border-[#b9ded7] bg-[#e6f4f1] text-[#0b6355] rounded-md p-5 space-y-3">
              <h2 className="font-heading font-bold text-lg">
                Selamat, {registration.studentData?.fullName || "Calon Murid"} dinyatakan DITERIMA
              </h2>
              {persistedDecisionNote && <p className="text-xs">{persistedDecisionNote}</p>}
              <div>
                <a
                  href={`/api/pdf/acceptance?registrationId=${encodeURIComponent(registration.id)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded-sm text-xs font-semibold"
                >
                  Unduh Surat Keterangan Diterima
                </a>
              </div>
            </div>
          )}

          {registration.status === "rejected" && (
            <div className="mt-5 border border-red-200 bg-red-50 text-red-900 rounded-md p-5 space-y-2">
              <h2 className="font-heading font-bold text-lg">Hasil Seleksi: Belum Diterima</h2>
              {persistedDecisionNote && (
                <p className="text-sm" data-testid="decision-rejection-note">
                  Catatan Keputusan Panitia: {persistedDecisionNote}
                </p>
              )}
            </div>
          )}

          {!["accepted", "rejected", "enrolled"].includes(registration.status) && (
            <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm text-gray-600">
              Keputusan akhir seleksi belum diterbitkan oleh panitia unit.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
