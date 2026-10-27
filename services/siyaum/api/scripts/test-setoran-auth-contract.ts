import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ForbiddenException } from "@nestjs/common";
import { SetoranService } from "../src/setoran/setoran.service";
import type { YmqPrincipal } from "../src/ymq/ymq-access.policy";

const root = resolve(import.meta.dirname, "..");
const controller = readFileSync(resolve(root, "src/setoran/setoran.controller.ts"), "utf8");
const serviceSource = readFileSync(resolve(root, "src/setoran/setoran.service.ts"), "utf8");

assert.match(controller, /@UseGuards\(ServiceJwtAuthGuard,\s*YmqRolesGuard\)/);
assert.match(
  controller,
  /@Post\("my"\)[\s\S]*?@YmqRoles\("admin_ymq",\s*"pembina_ymq",\s*"admin_kelompok",\s*"peserta"\)/,
  "Only participants and operational YMQ roles may submit personal setoran",
);
assert.match(
  controller,
  /@Get\("my"\)[\s\S]*?@YmqRoles\("admin_ymq",\s*"pembina_ymq",\s*"admin_kelompok",\s*"peserta"\)/,
  "Observer and leadership roles are report-only, not personal setoran users",
);
assert.match(controller, /@Get\("pending"\)[\s\S]*?@YmqRoles\("admin_ymq",\s*"pembina_ymq"\)/);
assert.match(controller, /@Post\(":id\/verify"\)[\s\S]*?@YmqRoles\("admin_ymq",\s*"pembina_ymq"\)/);
assert.doesNotMatch(controller, /musyrif/);
assert.doesNotMatch(serviceSource, /musyrifId|musyrif/);
assert.match(serviceSource, /pembinaUserId/);
assert.match(serviceSource, /leftAt:\s*null/);

const principal = (id: string, role: string): YmqPrincipal => ({ id, roles: [{ app: "siyaum", role }] });
const dto = { status: "verified" as const, catatanPembina: "Baik" };

function createPrisma(assignedGroup: { id: string } | null) {
  const updateCalls: unknown[] = [];
  return {
    updateCalls,
    prisma: {
      ymqSetoran: {
        findUnique: async () => ({ id: "setoran-1", userId: "peserta-1" }),
        update: async (args: unknown) => { updateCalls.push(args); return args; },
      },
      ymqGroup: { findFirst: async () => assignedGroup, findMany: async () => assignedGroup ? [{ members: [{ userId: "peserta-1" }] }] : [] },
    },
  };
}

async function run() {
  const assigned = createPrisma({ id: "group-1" });
  await new SetoranService(assigned.prisma as never).verify("setoran-1", principal("pembina-1", "pembina_ymq"), dto);
  assert.equal((assigned.updateCalls[0] as { data: { verifiedById: string; catatanPembina: string } }).data.verifiedById, "pembina-1");
  assert.equal((assigned.updateCalls[0] as { data: { catatanPembina: string } }).data.catatanPembina, "Baik");

  await assert.rejects(
    () => new SetoranService(createPrisma(null).prisma as never).verify("setoran-1", principal("other", "pembina_ymq"), dto),
    ForbiddenException,
  );
  await assert.rejects(
    () => new SetoranService(createPrisma(null).prisma as never).verify("setoran-1", principal("participant", "peserta"), dto),
    ForbiddenException,
  );
  const administrator = createPrisma(null);
  await new SetoranService(administrator.prisma as never).verify("setoran-1", principal("admin-1", "admin_ymq"), dto);
  assert.equal((administrator.updateCalls[0] as { data: { verifiedById: string } }).data.verifiedById, "admin-1");

  console.log("SIYAUM setoran auth contract passed");
}

void run();
