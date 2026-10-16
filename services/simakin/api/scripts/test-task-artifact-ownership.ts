import assert from "node:assert/strict";

import { ExecutionIssueService } from "../src/strategic/execution-issue/execution-issue.service";
import { ExecutionLogService } from "../src/strategic/execution-log/execution-log.service";

const staff = { id: "staff-a", roles: [{ role: "staff" }] };
const programId = "00000000-0000-4000-8000-000000000001";
const taskId = "00000000-0000-4000-8000-000000000002";

async function main() {
  const createdLogs: any[] = [];
  const authorization = { assertPicOwnsTask: async () => undefined, assertCanReadProgram: async () => undefined };
  const access = { forLogs: async () => ({ where: {} }), forIssues: async () => ({ where: {} }), assertCanReadArtifact: async () => undefined };
  const prisma = {
    workProgram: { findUnique: async () => ({ id: programId, departmentId: "biro-a" }) },
    executionTask: { findUnique: async () => ({ programId }) },
    executionKPI: { findUnique: async () => null },
    executionIssue: { create: async (args: any) => args },
    $transaction: async (callback: any) => callback({
      executionKPI: { findUnique: async () => null, update: async () => undefined },
      executionRealizationLog: { create: async (args: any) => { createdLogs.push(args); return { id: "log-a" }; } },
      executionEvidence: { findUnique: async () => null, update: async () => undefined },
    }),
  };
  const logs = new ExecutionLogService(prisma as any, authorization as any, access as any);
  const issues = new ExecutionIssueService(prisma as any, authorization as any, access as any);

  await assert.rejects(() => logs.create({ programId, activityDate: new Date().toISOString(), activityName: "Progress" }, staff), /tugas/i, "FAIL: staff cannot submit a progress log without an assigned task");
  await logs.create({ programId, taskId, activityDate: new Date().toISOString(), activityName: "Progress" }, staff);
  assert.equal(createdLogs[0].data.taskId, taskId, "FAIL: staff progress retains the assigned task relation");
  await assert.rejects(() => issues.create({ programId, title: "Kendala", description: "x" } as any, staff), /tugas/i, "FAIL: staff cannot create an issue without an assigned task");
  await issues.create({ programId, taskId, title: "Kendala", description: "x" } as any, staff);
  console.log("Task artifact ownership contract passed");
}

main().catch((error: unknown) => { throw error; });
