import { getRegistrationStatusLabel } from "../src/lib/spmb-registration";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const base = { id: "reg-1", status: "verification" as const };

assert(
  getRegistrationStatusLabel({ ...base, dossierReviewStatus: "pending", documents: [] } as any) === "Berkas sedang diverifikasi panitia",
  "basic dossier queue must identify the pending staff review",
);
assert(
  getRegistrationStatusLabel({ ...base, dossierReviewStatus: "pending", documents: [{ type: "medical_result" }] } as any) === "Hasil kesehatan sedang diverifikasi panitia",
  "medical-result queue must identify the pending final review",
);
assert(
  getRegistrationStatusLabel({ ...base, dossierReviewStatus: "approved", documents: [{ type: "medical_result" }] } as any) === "Hasil kesehatan disetujui — siap memilih jadwal observasi",
  "approved medical result must visibly expose the observation-ready state",
);

console.log("SPMB registration status label contract passed");
