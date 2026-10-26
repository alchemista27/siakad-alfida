import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const requiredFiles = [
  "src/app/parent/page.tsx",
  "src/app/parent/select-unit/page.tsx",
  "src/app/parent/payment/page.tsx",
  "src/app/parent/form-student/page.tsx",
  "src/app/parent/form-parents/page.tsx",
  "src/app/parent/biodata/page.tsx",
  "src/app/parent/documents/page.tsx",
  "src/app/parent/medical/page.tsx",
  "src/app/parent/observation/page.tsx",
  "src/app/parent/result/page.tsx",
  "src/components/parent/parent-registration-stepper.tsx",
  "src/lib/spmb-registration.ts",
];

for (const file of requiredFiles) {
  assert(existsSync(resolve(root, file)), `missing SPMB parent route file: ${file}`);
}

for (const file of requiredFiles) {
  const content = readFileSync(resolve(root, file), "utf8");
  assert(!content.includes("events.some("), `parent file ${file} must not derive stage authorization from events.some(...)`);
  assert(!content.includes("alert(") && !content.includes("confirm("), `parent file ${file} must not use native browser dialogs`);
}

const parentHome = readFileSync(resolve(root, "src/app/parent/page.tsx"), "utf8");
assert(parentHome.includes("/api/registrations/parent"), "parent dashboard must load owner-scoped registrations");
assert(parentHome.includes('href="/parent/select-unit"'), "parent dashboard must link to dedicated unit selection");
assert(!parentHome.includes("applicantFullName"), "parent dashboard must not collect child biodata before unit selection");

const selection = readFileSync(resolve(root, "src/app/parent/select-unit/page.tsx"), "utf8");
assert(selection.includes("/api/periods/public"), "unit selection must load public periods");
assert(selection.includes("/api/registrations/online"), "unit selection must create a server-owned draft");
assert(!selection.includes("applicantFullName"), "unit selection must not collect child biodata");
assert(
  /typeof created\.id !== "string" \|\| !created\.id\.trim\(\)/.test(selection),
  "unit selection must refuse a malformed create response before redirecting",
);
assert(
  /\/parent\/payment\?registrationId=\$\{encodeURIComponent\(created\.id\)\}/.test(selection),
  "unit selection must redirect using the server-owned registration id",
);

const paymentPage = readFileSync(resolve(root, "src/app/parent/payment/page.tsx"), "utf8");
assert(/type RegistrationLoadState\s*=/.test(paymentPage), "payment page must distinguish loading, not-found, and API-error states");
assert(/kind:\s*"not_found"/.test(paymentPage), "payment page must render an explicit not-found state");
assert(/kind:\s*"error"/.test(paymentPage), "payment page must render an API/access error state instead of an empty registration");
assert(/Coba Lagi/.test(paymentPage), "payment API-error state must offer a retry action");
assert(/uploadPaymentProofToCloudinary/.test(paymentPage), "payment page must upload a payment proof directly to Cloudinary instead of accepting a manual URL");
assert(/type="file"/.test(paymentPage), "payment page must render a payment-proof file picker");
assert(!/Referensi \/ Tautan Bukti Transfer/.test(paymentPage), "payment page must not ask parents for a manually pasted proof URL");

const registrationLib = readFileSync(resolve(root, "src/lib/spmb-registration.ts"), "utf8");
assert(/export class SpmbApiError extends Error/.test(registrationLib), "API client must preserve non-OK response status");
assert(/new SpmbApiError\(/.test(registrationLib), "API client must throw structured errors for non-OK responses");
assert(/uploadPaymentProofToCloudinary/.test(registrationLib), "client library must upload payment proofs through Cloudinary before recording them");
assert(/uploadDocumentToCloudinary/.test(registrationLib), "client library must upload every parent dossier file through Cloudinary");
assert(!/payment-proof\/presign/.test(registrationLib), "client library must not request an S3 payment-proof presign URL");
assert(!/\/api\/documents\/presign/.test(registrationLib), "client library must not request an S3 document presign URL");

for (const stagePage of [
  "src/app/parent/payment/page.tsx",
  "src/app/parent/form-student/page.tsx",
  "src/app/parent/form-parents/page.tsx",
  "src/app/parent/biodata/page.tsx",
  "src/app/parent/documents/page.tsx",
  "src/app/parent/medical/page.tsx",
  "src/app/parent/observation/page.tsx",
  "src/app/parent/result/page.tsx",
]) {
  const content = readFileSync(resolve(root, stagePage), "utf8");
  assert(content.includes("/api/registrations/parent/") || content.includes("loadParentRegistration"), `stage page ${stagePage} must load owner-scoped registration via /api/registrations/parent/:id`);
}

console.log("SPMB parent route contract passed");
