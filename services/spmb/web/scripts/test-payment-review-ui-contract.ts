import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const required = [
  "src/components/admin/registration-review-panel.tsx",
  "src/components/admin/decision-panel.tsx",
  "src/components/admin/admin-notice.tsx",
  "src/app/admin/page.tsx",
];

for (const file of required) {
  assert(existsSync(resolve(root, file)), `missing payment/review UI file: ${file}`);
  const content = readFileSync(resolve(root, file), "utf8");
  assert(!content.includes("alert(") && !content.includes("confirm("), `file ${file} must not use native browser dialogs`);
}

const reviewPanel = readFileSync(resolve(root, "src/components/admin/registration-review-panel.tsx"), "utf8");
assert(reviewPanel.includes("verify-payment"), "review panel must support payment verification");
assert(reviewPanel.includes("verify-documents"), "review panel must support dossier verification");
assert(/const canVerifyDocuments\s*=\s*\(reg: ReviewableRegistration\)/.test(reviewPanel), "review panel must classify a registration before rendering dossier actions");
assert(/reg\.status\s*===\s*"verification"/.test(reviewPanel), "only verification registrations may be approved or returned for dossier revision");
assert(/canVerifyDocuments\(reg\)\s*&&/.test(reviewPanel), "dossier review controls must be hidden before the verification stage");
assert(/rejectionNote:\s*isApproved/.test(reviewPanel), "dossier revision must send the ReviewDossierDto rejectionNote field");
assert(!/revisionNote:\s*isApproved/.test(reviewPanel), "dossier revision must not send the obsolete revisionNote field");
assert(reviewPanel.includes("/api/documents/${encodeURIComponent(documentId)}/download-url"), "review panel must request authorized document download URLs");
assert(/reg\.documents\?\.map/.test(reviewPanel), "review panel must render metadata for every registration document");
assert(/const canVerifyPayment\s*=\s*\(reg: ReviewableRegistration\)/.test(reviewPanel), "review panel must classify a registration before rendering payment actions");
assert(/reg\.status\s*===\s*"payment_uploaded"/.test(reviewPanel), "only payment_uploaded registrations may be approved or rejected as payments");
assert(/canVerifyPayment\(reg\)\s*&&/.test(reviewPanel), "payment verification controls must be hidden before a proof is uploaded");
assert(/rejectionNote:\s*isApproved/.test(reviewPanel), "payment rejection must send the VerifyPaymentDto rejectionNote field");
assert(!/rejectionReason:\s*isApproved/.test(reviewPanel), "payment rejection must not send the obsolete rejectionReason field");

console.log("SPMB payment review UI contract passed");
