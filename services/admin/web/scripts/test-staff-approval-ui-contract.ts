import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const users = readFileSync(resolve(process.cwd(), "src/app/users/page.tsx"), "utf8");
const approvals = readFileSync(resolve(process.cwd(), "src/app/approvals/page.tsx"), "utf8");

assert.match(approvals, /fetch\("\/api\/admin\/users\/units"/, "approval screen must load unit names for the applicant's requested placement");
assert.match(approvals, /\/api\/admin\/users\/\$\{id\}\/approve/, "pending staff approval must use the dedicated approval endpoint");
assert.match(approvals, /ConfirmActionModal/, "approval and rejection must use the designed confirmation modal");
assert.doesNotMatch(approvals, /\bconfirm\(/, "approval screen must not use a native browser confirmation dialog");
assert.match(approvals, /unitNames\[unitId\]/, "approval screen must show the requested unit name from the live catalog");
assert.match(users, /Setujui Penugasan/, "users list must make pending staff visibly distinct from ordinary inactive accounts");
assert.match(users, /unitLabel\(r\.unitId\)/, "users list must show the requested unit name beside the role");

console.log("Admin staff approval UI contract passed");
