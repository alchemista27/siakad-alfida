import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import "reflect-metadata";
import { DepartmentMembersSyncService } from "../src/strategic/organization-sync/department-members.service";

const id = "00000000-0000-4000-8000-000000000401";
const departmentId = "00000000-0000-4000-8000-000000000402";
const userId = "00000000-0000-4000-8000-000000000403";
const sourceUpdatedAt = "2026-10-20T23:20:00.000Z";

async function main() {
  const updates: unknown[] = [];
  const prisma = {
    departmentMember: {
      async updateMany(input: unknown) {
        updates.push(input);
        return { count: 1 };
      },
      async findUnique() {
        return { id };
      },
      async create() {
        throw new Error("create must not run when the source version is newer");
      },
    },
  };
  const service = new DepartmentMembersSyncService(prisma as never);
  await service.sync(id, { id, departmentId, userId, role: " Koordinator ", sourceUpdatedAt });

  assert.deepEqual(updates, [
    {
      where: { id, OR: [{ sourceUpdatedAt: null }, { sourceUpdatedAt: { lt: new Date(sourceUpdatedAt) } }] },
      data: { departmentId, userId, role: "Koordinator", sourceUpdatedAt: new Date(sourceUpdatedAt) },
    },
  ]);
  const stale = { id, role: "Versi terbaru", sourceUpdatedAt: "2026-10-20T23:21:00.000Z" };
  const stalePrisma = {
    departmentMember: {
      async updateMany() {
        return { count: 0 };
      },
      async findUnique() {
        return stale;
      },
      async create() {
        throw { code: "P2002" };
      },
    },
  };
  const staleService = new DepartmentMembersSyncService(stalePrisma as never);
  assert.equal(
    await staleService.sync(id, { id, departmentId, userId, role: null, sourceUpdatedAt }),
    stale,
    "a stale member projection must leave the newer row unchanged",
  );
  const crosswiredExisting = { id: "00000000-0000-4000-8000-000000000499", sourceUpdatedAt: null };
  const crosswiredUpdates: unknown[] = [];
  const crosswiredPrisma = {
    departmentMember: {
      async updateMany(input: any) {
        crosswiredUpdates.push(input);
        return { count: input.where.id === crosswiredExisting.id ? 1 : 0 };
      },
      async findUnique({ where }: any) {
        if (where.departmentId_userId) return crosswiredExisting;
        return where.id === crosswiredExisting.id ? crosswiredExisting : null;
      },
      async create() {
        throw { code: "P2002" };
      },
    },
  };
  const crosswiredService = new DepartmentMembersSyncService(crosswiredPrisma as never);
  assert.equal(
    await crosswiredService.sync(id, { id, departmentId, userId, role: null, sourceUpdatedAt }),
    crosswiredExisting,
    "a legacy row with the same department/user pair but another ID must be updated instead of causing a retry loop",
  );
  assert.equal(crosswiredUpdates.length, 2, "the compound-key recovery must update the existing member row");
  await assert.rejects(
    () => service.sync(id, { id: "00000000-0000-4000-8000-000000000404", departmentId, userId, role: null, sourceUpdatedAt }),
    /ID path dan body harus sama/,
  );

  const controller = readFileSync(resolve(__dirname, "../src/strategic/organization-sync/department-members.controller.ts"), "utf8");
  assert.match(controller, /@Controller\("strategic\/organization-sync\/department-members"\)/);
  assert.match(controller, /@UseGuards\(InternalServiceGuard\)/);
  assert.match(controller, /@Param\("id", new ZodValidationPipe\(z\.string\(\)\.uuid\(\)\)\)/);
  assert.match(controller, /role:\s*z\.string\(\)\.trim\(\)\.max\(50\)\.nullable\(\)/);
  assert.match(controller, /\.strict\(\)/);
  const schema = readFileSync(resolve(__dirname, "../prisma/schema.prisma"), "utf8");
  assert.match(schema, /model DepartmentMember \{[\s\S]*sourceUpdatedAt DateTime\? @map\("source_updated_at"\)/);
  const migration = readFileSync(
    resolve(__dirname, "../prisma/migrations/20261020232000_add_department_member_projection_version/migration.sql"),
    "utf8",
  );
  assert.match(migration, /ALTER TABLE "department_members"\s+ADD COLUMN IF NOT EXISTS "source_updated_at" TIMESTAMPTZ;/s);
  console.log("SIMAKIN department member projection contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
