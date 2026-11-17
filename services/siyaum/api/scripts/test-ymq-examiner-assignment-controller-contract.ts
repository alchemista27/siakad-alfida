import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/examiner-assignments/examiner-assignments.controller.ts"), "utf8");

assert.match(source, /@Controller\("examiner-assignments"\)/);
assert.match(source, /@UseGuards\(ServiceJwtAuthGuard, YmqRolesGuard\)/);
assert.match(source, /@YmqRoles\("admin_ymq"\)/);
assert.match(source, /@Get\(\)/);
assert.match(source, /@Post\(\)/);
assert.match(source, /@Delete\(":id"\)/);
assert.match(source, /examinerAssignmentsService\.list\(academicYear, req\.user\)/);
assert.match(source, /examinerAssignmentsService\.assign\(dto, req\.user\)/);
assert.match(source, /examinerAssignmentsService\.revoke\(id, req\.user\)/);

console.log("SIYAUM YMQ examiner assignment controller contract passed");
