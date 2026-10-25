import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");

for (const file of [
  "src/app/parent/select-unit/page.tsx",
  "src/app/parent/form-student/page.tsx",
  "src/app/parent/form-parents/page.tsx",
  "src/components/parent/student-registration-form.tsx",
  "src/components/parent/parent-registration-form.tsx",
]) {
  assert(existsSync(resolve(root, file)), `missing parent parity route/component: ${file}`);
}

const unit = read("src/app/parent/select-unit/page.tsx");
assert(unit.includes("/api/periods/public"), "unit selection must load public periods");
assert(unit.includes("/api/registrations/online"), "unit selection must create a period-selected draft");
assert(!unit.includes("applicantFullName"), "unit selection must not collect child biodata");

const student = read("src/components/parent/student-registration-form.tsx");
for (const field of ["nickname", "religion", "nisn", "siblingsCount", "transportation"]) {
  assert(student.includes(field), `student form must render monolith-parity field: ${field}`);
}

const parents = read("src/components/parent/parent-registration-form.tsx");
for (const field of ["nik", "birthPlace", "birthDate", "education", "occupation", "incomeRange", "phone", "address"]) {
  assert(parents.includes(field), `parent form must render monolith-parity field: ${field}`);
}

const home = read("src/app/parent/page.tsx");
assert(home.includes('href="/parent/select-unit"'), "parent home must link to dedicated unit selection");
assert(!home.includes("applicantBirthDate"), "parent home must not contain the old mixed create form");

console.log("SPMB parent-form parity UI contract passed");
