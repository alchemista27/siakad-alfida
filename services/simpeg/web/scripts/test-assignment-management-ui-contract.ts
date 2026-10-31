import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(import.meta.dirname, "../src/app/page.tsx"), "utf8");
const confirmModal = readFileSync(
  resolve(import.meta.dirname, "../src/components/organization/confirm-action-modal.tsx"),
  "utf8",
);

assert.match(page, /ConfirmActionModal/, "assignment deletion must reuse the shared confirmation modal");
assert.match(page, /handleUpdateAssignment/, "assignment UI must update an existing assignment");
assert.match(page, /handleDeleteAssignment/, "assignment UI must delete an unwanted assignment");
assert.match(page, /handleMutateAssignment/, "assignment UI must support unit mutation");
assert.match(page, /\/api\/assignments\/\$\{(?:editingAssignment|assignment)\.id\}/, "assignment UI must address one assignment record");
assert.match(page, /\/api\/assignments\/\$\{(?:mutatingAssignment|assignment)\.id\}\/mutate/, "assignment UI must call the mutation endpoint");
assert.match(page, /Edit Penugasan/);
assert.match(page, /Mutasi Unit/);
assert.match(page, /Hapus Penugasan/);
assert.match(page, /Riwayat Mutasi/);
assert.match(page, /responseMessage/, "assignment mutations must safely parse proxy/API errors");
assert.match(page, /EmployeeSuggestionPicker/, "the add-assignment modal must reuse the shared staff search picker");
assert.match(page, /selectedAssignmentEmployee/, "selected staff must be held separately from the assignment form");
assert.match(page, /userId:\s*employee\?\.id\s*\?\?\s*""/, "only the selected candidate ID may enter the assignment payload");
assert.match(page, /resetNewAssignmentEmployee/, "opening, cancelling, and saving must clear stale staff selections");
assert.doesNotMatch(page, /<select\s+value=\{newAssignment\.userId\}/, "the assignment employee field must not be a prefetched dropdown");
assert.doesNotMatch(page, /window\.(?:alert|confirm)\s*\(/);
assert.match(confirmModal, /role="dialog"/);

console.log("SIMPEG assignment management UI contract passed");
