import assert from "node:assert/strict";
import { renameSpmbTeamRole } from "../src/users/rename-spmb-team-role";

function createPrisma(countValue: number) {
  const calls: { updateMany: unknown[] } = { updateMany: [] };
  return {
    calls,
    prisma: {
      roleAssignment: {
        count: async () => countValue,
        updateMany: async (args: unknown) => {
          calls.updateMany.push(args);
          return { count: countValue };
        },
      },
    },
  };
}

async function main() {
  const dryRun = createPrisma(3);
  assert.deepEqual(await renameSpmbTeamRole(dryRun.prisma, false), {
    mode: "dry-run",
    affectedRoleAssignments: 3,
  });
  assert.equal(dryRun.calls.updateMany.length, 0, "dry-run must not update roles");

  const apply = createPrisma(2);
  assert.deepEqual(await renameSpmbTeamRole(apply.prisma, true), {
    mode: "apply",
    affectedRoleAssignments: 2,
  });
  assert.deepEqual(apply.calls.updateMany, [{
    where: { app: "spmb", role: "tim_ppdb" },
    data: { role: "tim_spmb" },
  }], "apply must update only legacy SPMB team assignments");

  const rerun = createPrisma(0);
  assert.deepEqual(await renameSpmbTeamRole(rerun.prisma, true), {
    mode: "apply",
    affectedRoleAssignments: 0,
  });
  assert.equal(rerun.calls.updateMany.length, 0, "rerun after migration must remain idempotent");

  console.log("SPMB team role migration contract passed");
}

void main();
