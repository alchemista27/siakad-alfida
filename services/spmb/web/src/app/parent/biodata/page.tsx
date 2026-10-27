"use client";

import { SpmbTopbar } from "@/components/SpmbTopbar";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadParentRegistration } from "@/lib/spmb-registration";

export default function ParentBiodataCompatibilityPage() {
  const [message, setMessage] = useState("Mengarahkan ke formulir pendaftaran...");

  useEffect(() => {
    const registrationId = new URLSearchParams(window.location.search).get("registrationId");
    if (!registrationId) {
      setMessage("Pendaftaran tidak dipilih.");
      return;
    }
    loadParentRegistration(registrationId)
      .then((registration) => {
        if (!registration) {
          setMessage("Pendaftaran tidak ditemukan.");
          return;
        }
        const path = registration.studentDataComplete === true
          ? "/parent/form-parents"
          : "/parent/form-student";
        window.location.replace(`${path}?registrationId=${encodeURIComponent(registration.id)}`);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Gagal membuka formulir pendaftaran."));
  }, []);

  return (
    <div className="min-h-screen bg-neutral text-primary font-body">

      <SpmbTopbar /><main className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-sm text-gray-600">{message}</p>
        <Link href="/parent" className="mt-4 inline-block text-sm font-semibold text-tertiary hover:underline">Kembali ke pendaftaran</Link>
      </main>
    </div>
  );
}
