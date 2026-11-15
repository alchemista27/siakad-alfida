import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const form = readFileSync(resolve(process.cwd(), "src/components/parent/parent-registration-form.tsx"), "utf8");
const page = readFileSync(resolve(process.cwd(), "src/app/parent/form-parents/page.tsx"), "utf8");

assert.match(form, /registration\.parentData\.find\(\(record\) => record\.type === "guardian"\)/, "guardian form must prefill an existing guardian record");
assert.match(form, /const requiresGuardian = registration\.studentData\?\.residenceStatus === "with_guardian";/, "guardian requirement must follow the persisted residence status");
assert.match(form, /const \[showGuardian, setShowGuardian\] = useState\(requiresGuardian \|\| Boolean\(guardianRecord\)\);/, "guardian UI must remain visible for an existing guardian or required residence status");
assert.match(form, /ParentFields title="Wali"/, "guardian UI must reuse the structured parent fields");
assert.match(form, /guardian: showGuardian \? guardian : undefined/, "guardian payload must remain additive and optional outside with_guardian residence");
assert.doesNotMatch(form, /\b(alert|confirm)\(/, "guardian form must not use native dialogs");
assert.match(page, /wali wajib diisi bila calon murid tinggal bersama wali/i, "parent page must explain the guardian residence rule");

console.log("SPMB guardian parent-form UI contract passed");
