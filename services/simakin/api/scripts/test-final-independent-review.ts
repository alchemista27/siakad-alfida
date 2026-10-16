import assert from "node:assert/strict";

import { ExecutionActionItemController } from "../src/strategic/execution-action-item/execution-action-item.controller";
import { ExecutionActionItemService } from "../src/strategic/execution-action-item/execution-action-item.service";
import { ExecutionIssueService } from "../src/strategic/execution-issue/execution-issue.service";
import { ExecutionKpiService } from "../src/strategic/execution-kpi/execution-kpi.service";
import { ExecutionLogService } from "../src/strategic/execution-log/execution-log.service";
import { ExecutionMeetingController } from "../src/strategic/execution-meeting/execution-meeting.controller";
import { ExecutionMeetingService } from "../src/strategic/execution-meeting/execution-meeting.service";
import { ExecutionMilestoneController } from "../src/strategic/execution-milestone/execution-milestone.controller";
import { ExecutionMilestoneService } from "../src/strategic/execution-milestone/execution-milestone.service";
import { ExecutionTaskService } from "../src/strategic/execution-task/execution-task.service";
import { ExecutiveMonitoringCron } from "../src/strategic/executive/executive-monitoring.cron";
import { hasScopedRole } from "../src/strategic/workflow/strategic-permissions";

const ids = {
  programA: "00000000-0000-4000-8000-000000000001",
  programB: "00000000-0000-4000-8000-000000000002",
  taskA: "00000000-0000-4000-8000-000000000003",
  milestoneA: "00000000-0000-4000-8000-000000000004",
  milestoneB: "00000000-0000-4000-8000-000000000005",
  kpiA: "00000000-0000-4000-8000-000000000006",
  kpiB: "00000000-0000-4000-8000-000000000007",
  meetingB: "00000000-0000-4000-8000-000000000008",
  issueB: "00000000-0000-4000-8000-000000000009",
  picA: "00000000-0000-4000-8000-000000000010",
  picB: "00000000-0000-4000-8000-000000000011",
};

const biroAAdmin = { id: "00000000-0000-4000-8000-000000000012", roles: [{ role: "admin_biro", departmentId: "biro-a" }] };
const bidangAAdmin = { id: "00000000-0000-4000-8000-000000000013", roles: [{ role: "admin_bidang", departmentId: "bidang-a" }] };
const picWithoutTask = { id: ids.picA, roles: [{ role: "pic_program" }] };

function authorization() {
  return {
    assertBiroCanManage: async (_user: any, departmentId: string) => {
      if (departmentId !== "biro-a") throw new Error("forbidden bureau");
    },
    assertBidangCanReview: async (_user: any, departmentId: string) => {
      if (departmentId !== "biro-a") throw new Error("forbidden bidang");
    },
    assertPicOwnsTask: async (_user: any, taskId: string) => {
      if (taskId !== ids.taskA) throw new Error("task ownership required");
    },
    assertCanReadProgram: async (_user: any, programId: string) => {
      if (programId !== ids.programA) throw new Error("program out of scope");
    },
  };
}

async function roleScopeContract() {
  assert.equal(
    hasScopedRole({ id: "role-a", roles: [{ role: "admin_biro" }] }, "admin_biro", "biro-b"),
    false,
    "FAIL: an unscoped department role must not authorize an arbitrary department",
  );
}

async function actionItemContract() {
  const forwarded: any[] = [];
  const controller = new ExecutionActionItemController({ create: async (...args: any[]) => forwarded.push(args) } as any);
  await (controller as any).create({ description: "Follow up" }, { user: biroAAdmin });
  assert.deepEqual(forwarded, [[{ description: "Follow up" }, biroAAdmin]], "FAIL: action-item create forwards req.user to the service");

  const prisma = {
    executionActionItem: { create: async (args: any) => args },
    executionMeeting: { findUnique: async () => ({ id: ids.meetingB, program: { departmentId: "biro-b" } }) },
    executionIssue: { findUnique: async () => ({ id: ids.issueB, departmentId: "biro-b" }) },
    departmentMember: { findFirst: async () => ({ userId: ids.picB, departmentId: "biro-b" }) },
    departmentAdmin: { findFirst: async () => null },
  };
  const service = new (ExecutionActionItemService as any)(prisma, { forActionItems: async () => ({ where: {} }) }, authorization());
  await assert.rejects(
    () => service.create({ meetingId: ids.meetingB, issueId: ids.issueB, picId: ids.picB, description: "Cross-biro" }, biroAAdmin),
    /forbidden|scope|biro/i,
    "FAIL: action-item creation rejects meeting, issue, and PIC outside the caller's bureau/bidang scope",
  );
}

async function kpiContract() {
  const creates: any[] = [];
  const prisma = {
    workProgram: { findUnique: async () => ({ id: ids.programA, departmentId: "biro-a" }) },
    executionKPI: {
      create: async (args: any) => { creates.push(args); return args; },
      findUnique: async () => ({ id: ids.kpiA, programId: ids.programA, program: { departmentId: "biro-a" } }),
      update: async (args: any) => args,
    },
    executionEvidence: { findFirst: async () => ({ id: "evidence-b", programId: ids.programB, departmentId: "biro-b", kpiId: ids.kpiB }) },
  };
  const service = new ExecutionKpiService(prisma as any, authorization() as any, { forPrograms: async () => ({ where: {} }) } as any);
  await service.create({ programId: ids.programA, name: "KPI", indicatorType: "output", unit: "item", baselineStatus: "approved", verificationStatus: "verified" } as any, biroAAdmin);
  assert.equal(creates[0].data.baselineStatus, "draft", "FAIL: KPI create forces baselineStatus=draft instead of accepting a forged approval");
  assert.equal(creates[0].data.workflowStatus, "draft", "FAIL: KPI create forces draft workflow instead of accepting caller verification state");
  assert.equal("verificationStatus" in creates[0].data, false, "FAIL: KPI create strips caller-supplied verification values");
  await assert.rejects(
    () => service.verifyBaseline(ids.kpiA, bidangAAdmin, "approved", "forged"),
    /bukti|evidence|scope|program/i,
    "FAIL: Bidang baseline approval requires evidence linked to the KPI and its program scope",
  );
}

async function picTaskOwnershipAndRelationsContract() {
  const createdLogs: any[] = [];
  const prisma = {
    workProgram: { findUnique: async ({ where }: any) => ({ id: where.id, departmentId: where.id === ids.programA ? "biro-a" : "biro-b" }) },
    executionTask: { findUnique: async () => ({ programId: ids.programA }) },
    executionKPI: { findUnique: async () => ({ id: ids.kpiB, programId: ids.programB, baselineStatus: "approved" }) },
    executionIssue: { create: async (args: any) => args },
    $transaction: async (callback: any) => callback({
      executionKPI: { findUnique: async () => ({ id: ids.kpiB, programId: ids.programB, baselineStatus: "approved" }), update: async () => undefined },
      executionRealizationLog: { create: async (args: any) => { createdLogs.push(args); return args; } },
      executionEvidence: { findUnique: async () => null, update: async () => undefined },
    }),
  };
  const logs = new ExecutionLogService(prisma as any, authorization() as any, { forLogs: async () => ({ where: {} }), assertCanReadArtifact: async () => undefined } as any);
  const issues = new ExecutionIssueService(prisma as any, authorization() as any, { forIssues: async () => ({ where: {} }), assertCanReadArtifact: async () => undefined } as any);
  await assert.rejects(() => logs.create({ programId: ids.programA, activityDate: new Date().toISOString(), activityName: "No task" }, picWithoutTask), /tugas|task/i, "FAIL: pic_program cannot create a log without an assigned task");
  await assert.rejects(() => issues.create({ programId: ids.programA, title: "No task", description: "x" }, picWithoutTask), /tugas|task/i, "FAIL: pic_program cannot create an issue without an assigned task");
  await assert.rejects(() => logs.create({ programId: ids.programA, taskId: ids.taskA, kpiId: ids.kpiB, activityDate: new Date().toISOString(), activityName: "Cross program KPI" }, picWithoutTask), /KPI|program/i, "FAIL: realization logs reject KPIs from another program");
  assert.equal(createdLogs.length, 0, "FAIL: a cross-program KPI must not create a realization log");

  const taskPrisma = {
    workProgram: { findUnique: async () => ({ id: ids.programA, departmentId: "biro-a" }) },
    user: { findUnique: async () => ({ id: ids.picB, isActive: true }) },
    departmentMember: { findFirst: async () => null },
    executionMilestone: { findUnique: async () => ({ id: ids.milestoneB, programId: ids.programB }) },
    executionTask: { create: async (args: any) => args },
  };
  const tasks = new ExecutionTaskService(taskPrisma as any, authorization() as any, {} as any);
  await assert.rejects(() => tasks.create({ programId: ids.programA, assigneeId: ids.picB, description: "Wrong Biro" }, biroAAdmin), /biro|department|PIC/i, "FAIL: task assignee must belong to the program Biro");
  await assert.rejects(() => tasks.create({ programId: ids.programA, milestoneId: ids.milestoneB, description: "Wrong milestone" }, biroAAdmin), /milestone|program/i, "FAIL: task milestone must belong to the same program");
}

async function scopedMilestoneAndMeetingContract() {
  const accessCalls: string[] = [];
  const milestoneQueries: any[] = [];
  const milestonePrisma = {
    executionMilestone: {
      findMany: async (args: any) => { milestoneQueries.push(args); return []; },
      findUnique: async () => ({ id: ids.milestoneA, programId: ids.programA, program: { departmentId: "biro-a" } }),
      create: async (args: any) => args,
      update: async (args: any) => args,
      delete: async (args: any) => args,
    },
    workProgram: { findUnique: async () => ({ id: ids.programA, departmentId: "biro-a" }) },
  };
  const milestoneAccess = {
    forMilestones: async () => ({ where: { programId: ids.programA } }),
    assertCanReadMilestone: async (_user: any, id: string) => { accessCalls.push(`milestone:${id}`); },
  };
  const milestones = new (ExecutionMilestoneService as any)(milestonePrisma, authorization(), milestoneAccess);
  await milestones.findAll(biroAAdmin);
  await milestones.findOne(ids.milestoneA, biroAAdmin);
  await milestones.create({ programId: ids.programA, name: "M" }, biroAAdmin);
  await milestones.update(ids.milestoneA, { name: "M2" }, biroAAdmin);
  await milestones.remove(ids.milestoneA, biroAAdmin);
  assert.deepEqual(milestoneQueries[0].where, { programId: ids.programA }, "FAIL: milestone lists are scoped to caller-visible programs");
  assert.deepEqual(accessCalls, [`milestone:${ids.milestoneA}`], "FAIL: milestone detail validates caller scope");

  const milestoneControllerCalls: any[] = [];
  const milestoneController = new ExecutionMilestoneController({ findAll: async (...args: any[]) => milestoneControllerCalls.push(["list", ...args]), findOne: async (...args: any[]) => milestoneControllerCalls.push(["one", ...args]), create: async (...args: any[]) => milestoneControllerCalls.push(["create", ...args]), update: async (...args: any[]) => milestoneControllerCalls.push(["update", ...args]), remove: async (...args: any[]) => milestoneControllerCalls.push(["remove", ...args]) } as any);
  await (milestoneController as any).findAll({ user: biroAAdmin });
  await (milestoneController as any).findOne(ids.milestoneA, { user: biroAAdmin });
  await (milestoneController as any).create({ programId: ids.programA, name: "M" }, { user: biroAAdmin });
  await (milestoneController as any).update(ids.milestoneA, { name: "M2" }, { user: biroAAdmin });
  await (milestoneController as any).remove(ids.milestoneA, { user: biroAAdmin });
  assert.equal(milestoneControllerCalls.every((call) => call.at(-1) === biroAAdmin), true, "FAIL: milestone controller forwards the caller for list/detail/create/update/delete");

  const meetingQueries: any[] = [];
  const meetingPrisma = {
    executionMeeting: {
      findMany: async (args: any) => { meetingQueries.push(args); return []; },
      findUnique: async () => ({ id: ids.meetingB, programId: ids.programB, program: { departmentId: "biro-b" } }),
      create: async (args: any) => args,
      update: async (args: any) => args,
      delete: async (args: any) => args,
    },
    workProgram: { findUnique: async ({ where }: any) => ({ id: where.id, departmentId: where.id === ids.programA ? "biro-a" : "biro-b" }) },
  };
  const meetingAccess = {
    forMeetings: async () => ({ where: { programId: ids.programA } }),
    assertCanReadMeeting: async (_user: any, id: string) => { accessCalls.push(`meeting:${id}`); },
  };
  const meetings = new (ExecutionMeetingService as any)(meetingPrisma, authorization(), meetingAccess);
  await meetings.findAll(biroAAdmin);
  await meetings.findOne(ids.meetingB, biroAAdmin);
  await assert.rejects(() => meetings.create({ programId: ids.programB, title: "Cross", agenda: "x", meetingDate: new Date().toISOString() }, biroAAdmin), /forbidden|scope|biro/i, "FAIL: meeting create is scoped to the caller's bureau/bidang");
  assert.deepEqual(meetingQueries[0].where, { programId: ids.programA }, "FAIL: meeting lists are scoped to caller-visible programs");
  assert.ok(accessCalls.includes(`meeting:${ids.meetingB}`), "FAIL: meeting detail validates caller scope");

  const meetingControllerCalls: any[] = [];
  const meetingController = new ExecutionMeetingController({ findAll: async (...args: any[]) => meetingControllerCalls.push(["list", ...args]), findOne: async (...args: any[]) => meetingControllerCalls.push(["one", ...args]), create: async (...args: any[]) => meetingControllerCalls.push(["create", ...args]), update: async (...args: any[]) => meetingControllerCalls.push(["update", ...args]), remove: async (...args: any[]) => meetingControllerCalls.push(["remove", ...args]) } as any);
  await (meetingController as any).findAll({ user: biroAAdmin });
  await (meetingController as any).findOne(ids.meetingB, { user: biroAAdmin });
  await (meetingController as any).create({ programId: ids.programA }, { user: biroAAdmin });
  await (meetingController as any).update(ids.meetingB, {}, { user: biroAAdmin });
  await (meetingController as any).remove(ids.meetingB, { user: biroAAdmin });
  assert.equal(meetingControllerCalls.every((call) => call.at(-1) === biroAAdmin), true, "FAIL: meeting controller forwards the caller for list/detail/create/update/delete");
}

async function overdueHrefContract() {
  const notifications: any[] = [];
  const cron = new ExecutiveMonitoringCron(
    { attentionQueue: async () => ({ overdue_pic_tasks: [{ id: ids.taskA, assigneeId: ids.picA }], overdue_biro_reviews: [], overdue_bidang_reviews: [] }) } as any,
    { create: async (...args: any[]) => notifications.push(args) } as any,
    { strategicNotification: { findFirst: async () => null } } as any,
  );
  await cron.notifyOverdue();
  assert.equal(notifications[0][4], `/my-tasks?taskId=${ids.taskA}`, "FAIL: overdue task notifications use the notification-href policy's valid task route");
}

async function main() {
  const contracts: Array<[string, () => Promise<void>]> = [
    ["unscoped-role", roleScopeContract],
    ["action-item", actionItemContract],
    ["kpi", kpiContract],
    ["pic-task-and-relations", picTaskOwnershipAndRelationsContract],
    ["scoped-milestones-and-meetings", scopedMilestoneAndMeetingContract],
    ["overdue-href", overdueHrefContract],
  ];
  const failures: string[] = [];
  for (const [name, contract] of contracts) {
    try {
      await contract();
    } catch (error) {
      failures.push(`${name}: ${(error as Error).message}`);
    }
  }
  assert.deepEqual(failures, [], `Final independent-review contract failures:\n${failures.join("\n")}`);
  console.log("Final independent-review contract passed");
}

main().catch((error: unknown) => { throw error; });
