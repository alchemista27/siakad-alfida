import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NotFoundException } from "@nestjs/common";
import { UsersService } from "../src/users/users.service";

const staffId = "00000000-0000-4000-8000-000000000001";
const parentId = "00000000-0000-4000-8000-000000000002";
const calls: Array<{ method: string; args: unknown }> = [];
const staff = { id: staffId, fullName: "Guru Aktif", email: "guru@example.test", avatarUrl: null };

const prisma = {
  user: {
    async findMany(args: any) {
      calls.push({ method: "findMany", args });
      return [staff];
    },
    async findFirst(args: any) {
      calls.push({ method: "findFirst", args });
      return args.where.id === staffId ? staff : null;
    },
  },
};

async function main() {
  const controllerPath = resolve(import.meta.dirname, "../src/users/internal-staff-candidates.controller.ts");
  assert.ok(existsSync(controllerPath), "internal staff-candidate controller must exist");
  const controller = readFileSync(controllerPath, "utf8");
  assert.match(controller, /@Controller\("users\/internal-staff-candidates"\)/);
  assert.match(controller, /@UseGuards\(InternalOrganizationRolesGuard\)/);
  assert.match(controller, /@Get\(":userId"\)/);

  const service = new UsersService(prisma as never);
  const candidates = await (service as any).findInternalStaffCandidates("  Guru  ");
  assert.deepEqual(candidates, [staff]);
  assert.equal(calls[0]?.method, "findMany");
  const searchQuery = calls[0]?.args as any;
  assert.equal(searchQuery.where.isActive, true);
  assert.deepEqual(searchQuery.where.roles, {
    some: {
      OR: [
        { app: "simpeg", role: "pegawai" },
        { app: "siakad", role: "guru" },
      ],
    },
  });
  assert.equal(searchQuery.where.OR[0].fullName.contains, "Guru");
  assert.equal(searchQuery.take, 10);
  assert.deepEqual(searchQuery.orderBy, { fullName: "asc" });
  assert.deepEqual(searchQuery.select, { id: true, fullName: true, email: true, avatarUrl: true });

  await (service as any).findInternalStaffCandidates("x".repeat(101));
  const boundedQuery = calls[1]?.args as any;
  assert.equal(boundedQuery.where.OR[0].fullName.contains.length, 100, "search must be bounded to 100 characters");
  assert.deepEqual(await (service as any).findInternalStaffCandidates("   "), [], "blank search must not query Auth users");
  assert.equal(calls.length, 2, "blank search must not query Auth users");

  assert.deepEqual(await (service as any).requireInternalStaffCandidate(staffId), staff);
  const validationQuery = calls[2]?.args as any;
  assert.equal(validationQuery.where.id, staffId);
  assert.equal(validationQuery.where.isActive, true);
  assert.deepEqual(validationQuery.where.roles, searchQuery.where.roles);
  await assert.rejects(
    () => (service as any).requireInternalStaffCandidate(parentId),
    (error: unknown) => error instanceof NotFoundException && error.message === "Pegawai aktif tidak ditemukan.",
    "parent-only users must not qualify as staff candidates",
  );

  console.log("Auth internal staff candidates contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
