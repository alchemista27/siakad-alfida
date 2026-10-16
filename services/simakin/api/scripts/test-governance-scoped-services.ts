import assert from "node:assert/strict";

import { ExecutionActionItemService } from "../src/strategic/execution-action-item/execution-action-item.service";
import { ExecutionKpiController } from "../src/strategic/execution-kpi/execution-kpi.controller";
import { ExecutionKpiService } from "../src/strategic/execution-kpi/execution-kpi.service";

const user = { id: "staff-a", roles: [{ role: "pic_program" }] };
const biroAdmin = { id: "biro-admin", roles: [{ role: "admin_biro", departmentId: "biro-a" }] };
const bidangAdmin = { id: "bidang-admin", roles: [{ role: "admin_bidang", departmentId: "bidang-a" }] };

async function actionItemContract() {
  const accessCalls: string[] = [];
  const queryCalls: any[] = [];
  const prisma = {
    executionActionItem: {
      findMany: async (args: any) => { queryCalls.push(args); return []; },
      findUnique: async () => ({ id: "action-a", picId: user.id }),
      update: async (args: any) => args,
      delete: async (args: any) => args,
    },
  };
  const access = {
    forActionItems: async (actor: any) => ({ where: { picId: actor.id } }),
    assertCanReadActionItem: async (_actor: any, id: string) => { accessCalls.push(id); },
  };
  const service = new ExecutionActionItemService(prisma as any, access as any);

  await service.findAll(user);
  assert.deepEqual(queryCalls[0].where, { picId: user.id }, "FAIL: action-item lists are caller-scoped");
  await service.findOne("action-a", user);
  await service.update("action-a", { status: "completed" } as any, user);
  await service.remove("action-a", user);
  assert.deepEqual(accessCalls, ["action-a", "action-a", "action-a"], "FAIL: action-item detail, update, and delete are caller-scoped");
}

async function kpiServiceContract() {
  const created: any[] = [];
  const authorizationCalls: string[] = [];
  const prisma = {
    workProgram: {
      findMany: async () => [{ id: "program-a", title: "Program A", departmentId: "biro-a" }],
    },
    user: { findMany: async () => [] },
    executionKPI: {
      create: async (args: any) => { created.push(args); return args; },
      findUnique: async () => ({ id: "kpi-a", programId: "program-a", picId: user.id, program: { departmentId: "biro-a" } }),
      update: async (args: any) => args,
      delete: async (args: any) => args,
      findMany: async () => [],
    },
    executionEvidence: {
      findUnique: async () => ({ id: "evidence-a", programId: "program-a", departmentId: "biro-a", kpiId: "kpi-a", ownerId: user.id }),
      findFirst: async () => ({ id: "evidence-a", programId: "program-a", departmentId: "biro-a", kpiId: "kpi-a", ownerId: user.id }),
      update: async (args: any) => args,
    },
    $transaction: async (callback: any) => callback({
      executionKPI: {
        findUnique: async () => ({ id: "kpi-a", programId: "program-a", picId: user.id, program: { departmentId: "biro-a" } }),
        update: async (args: any) => args,
      },
      executionEvidence: {
        findUnique: async () => ({ id: "evidence-a", programId: "program-a", ownerId: user.id }),
        update: async (args: any) => args,
      },
    }),
  };
  const authorization = {
    assertBiroCanManage: async (_actor: any, departmentId: string) => { authorizationCalls.push(`biro:${departmentId}`); },
    assertBidangCanReview: async (_actor: any, departmentId: string) => { authorizationCalls.push(`bidang:${departmentId}`); },
  };
  const access = {
    forPrograms: async () => ({ where: { departmentId: "biro-a" } }),
    assertCanReadProgram: async () => undefined,
    assertCanReadArtifact: async () => undefined,
  };
  const service = new ExecutionKpiService(prisma as any, authorization as any, access as any);

  await assert.rejects(
    () => service.batchImport([
      { programTitle: "Program A", name: "Valid KPI" },
      { programTitle: "Program Lain", name: "KPI Tidak Boleh Sebagian" },
    ], biroAdmin),
    /program/i,
    "FAIL: KPI batch import rejects an invalid row before any write",
  );
  assert.equal(created.length, 0, "FAIL: KPI batch import is atomic when any row is invalid or out of scope");

  await service.submitBaseline("kpi-a", "evidence-a", biroAdmin);
  await service.verifyBaseline("kpi-a", bidangAdmin, "approved", "verified");
  await service.remove("kpi-a", bidangAdmin);
  assert.deepEqual(
    authorizationCalls,
    ["biro:biro-a", "bidang:biro-a", "bidang:biro-a"],
    "FAIL: KPI baseline submission, verification, and deletion enforce the caller's bureau/reviewer scope",
  );
}

async function kpiControllerContract() {
  const calls: any[] = [];
  const controller = new ExecutionKpiController({
    exportExcelByDepartment: async (...args: any[]) => { calls.push(["export", ...args]); },
    submitBaseline: async (...args: any[]) => { calls.push(["submit", ...args]); },
    verifyBaseline: async (...args: any[]) => { calls.push(["verify", ...args]); },
    remove: async (...args: any[]) => { calls.push(["remove", ...args]); },
  } as any);
  const response = {} as any;

  await (controller as any).exportExcel("biro-a", { user: biroAdmin }, response);
  await (controller as any).submitBaseline("kpi-a", { evidenceId: "evidence-a" }, { user });
  await (controller as any).verifyBaseline("kpi-a", { user: bidangAdmin }, { status: "approved", notes: "ok" });
  await (controller as any).remove("kpi-a", { user: bidangAdmin });
  assert.deepEqual(calls, [
    ["export", "biro-a", biroAdmin, response],
    ["submit", "kpi-a", "evidence-a", user],
    ["verify", "kpi-a", bidangAdmin, "approved", "ok"],
    ["remove", "kpi-a", bidangAdmin],
  ], "FAIL: KPI controller forwards the authenticated caller to every scoped operation");
}

async function main() {
  await actionItemContract();
  await kpiServiceContract();
  await kpiControllerContract();
  console.log("Scoped action-item and KPI service contracts passed");
}

main().catch((error: unknown) => { throw error; });
