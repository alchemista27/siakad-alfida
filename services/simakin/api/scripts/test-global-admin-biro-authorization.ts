import assert from "node:assert/strict";
import { canReadTask } from "../src/strategic/workflow/strategic-access.policy";
import { StrategicAccessQueryService } from "../src/strategic/workflow/strategic-access-query.service";
import { canActOnDepartment, hasScopedRole } from "../src/strategic/workflow/strategic-permissions";

const biroA = "00000000-0000-4000-8000-0000000000a1";
const biroB = "00000000-0000-4000-8000-0000000000b1";
const globalBiroAdmin = { id: "global-biro-admin", roles: [{ app: "simakin", role: "admin_biro" }] };
const scopedBidangAdmin = { id: "bidang-admin", roles: [{ app: "simakin", role: "admin_bidang", departmentId: biroA }] };

async function main() {
  assert.equal(hasScopedRole(globalBiroAdmin, "admin_biro", biroA), true, "global admin_biro must match every department");
  assert.equal(hasScopedRole(globalBiroAdmin, "admin_biro", biroB), true, "global admin_biro must match another department");
  assert.equal(canActOnDepartment(globalBiroAdmin, biroA, "manage_biro"), true);
  assert.equal(canActOnDepartment(globalBiroAdmin, biroB, "manage_biro"), true, "global admin_biro must manage resources across departments");
  assert.equal(
    canReadTask(globalBiroAdmin, { assigneeId: "another-user", departmentId: biroB }),
    true,
    "global admin_biro must read task artifacts across departments",
  );

  assert.equal(canActOnDepartment(scopedBidangAdmin, biroA, "review_bidang"), true);
  assert.equal(
    canActOnDepartment(scopedBidangAdmin, biroB, "review_bidang"),
    false,
    "admin_bidang must remain department-scoped",
  );

  const access = new StrategicAccessQueryService({} as never);
  assert.deepEqual(await access.forPrograms(globalBiroAdmin), { where: {} }, "global admin_biro must list all programs");
  assert.deepEqual(await access.forTasks(globalBiroAdmin), { where: {} }, "global admin_biro must list all tasks");
  assert.deepEqual(await access.forActionItems(globalBiroAdmin), { where: {} }, "global admin_biro must list all action items");

  console.log("Global SIMAKIN admin_biro authorization contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
