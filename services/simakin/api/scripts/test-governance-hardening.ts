import assert from "node:assert/strict";

import { assertAllowedDepartmentWrite } from "../src/strategic/strategic-department/department-write.policy";
import { isAllowedEvidenceUrl } from "../src/strategic/execution-evidence/cloudinary-evidence.policy";
import { createNotificationHref } from "../src/strategic/notifications/notification-href.policy";
import { canReadTask } from "../src/strategic/workflow/strategic-access.policy";

const taskA = { id: "task-a", assigneeId: "staff-a", departmentId: "biro-a" };
const taskB = { id: "task-b", assigneeId: "staff-b", departmentId: "biro-b" };

assert.throws(
  () => assertAllowedDepartmentWrite({ route: "generic", user: { roles: [{ role: "admin_bidang", departmentId: "bidang-a" }] } }),
  /forbidden/i,
  "FAIL: generic SIMAKIN department write is forbidden for a root Bidang",
);
assert.throws(
  () => assertAllowedDepartmentWrite({ route: "generic", user: { roles: [{ role: "admin_biro", departmentId: "biro-a" }] } }),
  /forbidden/i,
  "FAIL: generic SIMAKIN department write is forbidden for an Admin Biro",
);
assert.equal(canReadTask({ id: "staff-a", roles: [{ role: "staff" }] }, taskA), true, "FAIL: staff assigned to task A can submit a task A log/evidence/issue");
assert.equal(canReadTask({ id: "staff-a", roles: [{ role: "staff" }] }, taskB), false, "FAIL: staff assigned to task A cannot list or fetch task B");
assert.equal(canReadTask({ id: "biro-a-admin", roles: [{ role: "admin_biro", departmentId: "biro-a" }] }, taskB), false, "FAIL: Admin Biro A cannot read artifacts belonging to Biro B");
assert.equal(isAllowedEvidenceUrl("https://example.com/evidence.pdf"), false, "FAIL: non-Cloudinary evidence URL is rejected");
assert.equal(isAllowedEvidenceUrl("https://res.cloudinary.com/hb1ropwm/raw/upload/evidence.pdf"), true);
assert.equal(canReadTask({ id: "biro-a-admin", roles: [{ role: "admin_biro", departmentId: "biro-a" }] }, { ...taskA, departmentId: "biro-b" }), false, "FAIL: Admin Biro cannot batch-import into another Biro");
assert.equal(createNotificationHref({ resourceType: "work_program", resourceId: "00000000-0000-4000-8000-000000000001" }), "/inbox?resourceType=work_program&resourceId=00000000-0000-4000-8000-000000000001", "FAIL: workflow notification href is an existing UI route");

console.log("Governance hardening contract passed");
