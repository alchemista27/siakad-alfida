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
