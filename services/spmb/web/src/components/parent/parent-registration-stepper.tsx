"use client";

import Link from "next/link";
import {
  getStepIndexForRegistration,
  STATUS_LABELS,
  type ParentRegistration,
} from "@/lib/spmb-registration";

const STEPS = [
  { label: "Pilih Unit", path: "/parent/select-unit" },
  { label: "Pembayaran", path: "/parent/payment" },
  { label: "Data Murid", path: "/parent/form-student" },
  { label: "Data Orang Tua", path: "/parent/form-parents" },
  { label: "Berkas", path: "/parent/documents" },
  { label: "Kesehatan", path: "/parent/medical" },
  { label: "Verifikasi", path: "/parent/medical" },
  { label: "Observasi", path: "/parent/observation" },
  { label: "Hasil", path: "/parent/result" },
] as const;

export function ParentRegistrationStepper({
  registration,
}: {
  registration: ParentRegistration;
}) {
  const activeStep = getStepIndexForRegistration(registration);
  const query = `?registrationId=${encodeURIComponent(registration.id)}`;

  return (
    <section className="spmb-card mt-6 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-bold text-lg text-primary">
              {registration.studentData?.fullName || "Calon Murid"}
            </h2>
            <span className="font-mono text-xs bg-neutral border border-border px-2.5 py-0.5 rounded-sm text-primary">
              {registration.registrationNumber}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{STATUS_LABELS[registration.status]}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold bg-[#e6f4f1] text-tertiary px-2.5 py-1 rounded-sm">
            {registration.period.unitName} · {registration.period.label}
          </span>
          <Link
            href="/parent"
            className="spmb-button-secondary px-2 py-1 text-xs"
          >
            Semua Pendaftaran
          </Link>
        </div>
      </div>

      {registration.dossierReviewStatus === "revision_required" && registration.rejectionReason && (
        <div className="mb-4 border border-amber-300 bg-amber-50 text-amber-900 rounded-md p-3 text-xs">
          <strong>Catatan Revisi Berkas dari Panitia:</strong> {registration.rejectionReason}
        </div>
      )}

      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-3">
        {STEPS.map((step, index) => {
          const completed = index < activeStep;
          const current = index === activeStep;
          return (
            <li key={step.label} className="flex gap-2 sm:block">
              <Link
                href={`${step.path}${query}`}
                className="group inline-flex sm:block items-center gap-2"
              >
                <span
                  className={`inline-flex shrink-0 h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    completed
                      ? "bg-tertiary text-white"
                      : current
                        ? "bg-[#e6f4f1] text-tertiary border border-tertiary"
                        : "bg-neutral text-gray-400 border border-border"
                  }`}
                >
                  {completed ? "✓" : index + 1}
                </span>
                <span
                  className={`text-xs sm:block sm:mt-2 group-hover:underline ${
                    index <= activeStep ? "font-semibold text-primary" : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
