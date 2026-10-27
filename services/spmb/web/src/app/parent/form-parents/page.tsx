"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ParentRegistrationStepper } from "@/components/parent/parent-registration-stepper";
import { ParentRegistrationForm } from "@/components/parent/parent-registration-form";
import { getStageRouteForRegistration, loadParentRegistration, type ParentRegistration } from "@/lib/spmb-registration";

export default function ParentParentsFormPage() {
  const [registration, setRegistration] = useState<ParentRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const registrationId = new URLSearchParams(window.location.search).get("registrationId");
    loadParentRegistration(registrationId)
      .then(setRegistration)
      .catch((error) => setNotice(error instanceof Error ? error.message : "Gagal memuat data pendaftaran."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen grid place-items-center bg-neutral"><span className="material-symbols-rounded animate-spin text-tertiary text-3xl">progress_activity</span></div>;

  if (!registration) {
    return <div className="min-h-screen bg-neutral text-primary font-body"><SpmbTopbar /><main className="max-w-3xl mx-auto px-4 py-12"><p className="text-sm text-red-700">{notice || "Pendaftaran tidak ditemukan."}</p><Link href="/parent" className="mt-4 inline-block text-sm font-semibold text-tertiary hover:underline">Kembali ke pendaftaran</Link></main></div>;
  }

  const studentComplete = registration.studentDataComplete === true;
  const canEdit = registration.status === "form_filling" && studentComplete;
  const studentHref = `/parent/form-student?registrationId=${encodeURIComponent(registration.id)}`;

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">

      <SpmbTopbar /><main className="max-w-5xl mx-auto px-4 py-8">
        <ParentRegistrationStepper registration={registration} />
        <section className="mt-6 bg-surface border border-border rounded-lg p-6">
          <p className="text-xs font-semibold tracking-wider text-tertiary uppercase">Tahap 4</p>
          <h1 className="font-heading font-bold text-2xl mt-1">Formulir Data Orang Tua</h1>
          <p className="text-sm text-gray-600 mt-2">Lengkapi data ayah dan ibu sesuai dokumen resmi.</p>
          {canEdit ? <ParentRegistrationForm registration={registration} /> : !studentComplete ? <div className="mt-5 border border-amber-300 bg-amber-50 text-amber-900 rounded-md p-4 text-sm"><p>Lengkapi formulir data murid terlebih dahulu.</p><Link href={studentHref} className="mt-3 inline-block text-xs font-semibold text-tertiary hover:underline">Kembali ke formulir murid</Link></div> : <div className="mt-5 border border-border bg-neutral rounded-md p-4 text-sm"><p>Formulir orang tua belum dapat diubah pada tahap ini.</p><Link href={getStageRouteForRegistration(registration)} className="mt-3 inline-block text-xs font-semibold text-tertiary hover:underline">Buka tahap aktif</Link></div>}
        </section>
      </main>
    </div>
  );
}
