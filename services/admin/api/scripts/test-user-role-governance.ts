import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { UsersService } from "../src/users/users.service";
import { parseAddRoleDto } from "../src/users/dto/users.dto";
import { validateRoleAssignment } from "../src/users/role-catalog";

const userId = "00000000-0000-4000-8000-000000000001";
const roleId = "00000000-0000-4000-8000-000000000002";
const unitId = "00000000-0000-4000-8000-000000000003";
const departmentId = "00000000-0000-4000-8000-000000000004";

async function expectRejects(action: () => Promise<unknown> | unknown, pattern: RegExp) {
  await assert.rejects(async () => action(), pattern);
}

async function main() {
  assert.throws(
    () => parseAddRoleDto({ app: "simpeg", role: "pegawai", unexpected: true }),
    BadRequestException,
  );
  assert.deepEqual(parseAddRoleDto({ app: "simpeg", role: "pegawai" }), { app: "simpeg", role: "pegawai" });
  assert.throws(() => validateRoleAssignment({ app: "unknown", role: "admin" }), /tidak dikenal/i);
  assert.throws(() => validateRoleAssignment({ app: "simpeg", role: "admin_unit" }), /unitId/i);
  assert.throws(() => validateRoleAssignment({ app: "simakin", role: "admin_bidang" }), /departmentId/i);
  assert.throws(
    () => validateRoleAssignment({ app: "simpeg", role: "pegawai", unitId, departmentId }),
    /tidak boleh memiliki unitId atau departmentId/i,
  );

  const events: string[] = [];
  const prisma = {
    user: {
      findUnique: async () => ({ id: userId, fullName: "Administrator" }),
      findFirst: async () => null,
    },
    session: { deleteMany: async ({ where }: { where: { userId: string } }) => events.push(`sessions:${where.userId}`) },
    roleAssignment: {
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        events.push(`find:${where.app}:${where.role}`);
        return null;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => ({ ...data, id: roleId }),
      findUnique: async () => ({ id: roleId, userId, app: "auth", role: "super_admin", unitId: null, departmentId: null }),
      count: async () => 2,
      delete: async ({ where }: { where: { id: string } }) => events.push(`delete:${where.id}`),
    },
  };
  const service = new UsersService(prisma as never);

  const added = await service.addRole(userId, { app: "simpeg", role: "pegawai" });
  assert.equal(added.role.id, roleId);
  assert(events.includes(`sessions:${userId}`), "new role must invalidate user sessions");

  events.length = 0;
  (prisma.roleAssignment.findFirst as any) = async () => ({
    id: roleId,
    userId,
    app: "simpeg",
    role: "pegawai",
    unitId: null,
    departmentId: null,
  });
  const duplicate = await service.addRole(userId, { app: "simpeg", role: "pegawai" });
  assert.equal(duplicate.role.id, roleId, "identical role must be returned idempotently");
  assert.equal(events.some((event) => event.startsWith("sessions:")), false, "unchanged role must not invalidate sessions");

  await expectRejects(
    () => service.addRole(userId, { app: "simpeg", role: "admin_unit", unitId }),
    /Kelola peran berscope dari menu Struktur Organisasi SIMPEG/i,
  );
  await expectRejects(
    () => service.createUserManual({
      fullName: "Scoped User",
      email: "scoped@example.test",
      password: "password-aman",
      roles: [{ app: "simakin", role: "admin_bidang", departmentId }],
    }),
    /Kelola peran berscope dari menu Struktur Organisasi SIMPEG/i,
  );
  const scopedImport = await service.batchImportUsers({
    users: [{ fullName: "Scoped Import", email: "import@example.test", app: "simpeg", role: "admin_unit", unitId }],
  });
  assert.equal(scopedImport.successCount, 0, "scoped import must not create a direct assignment");
  assert.equal(scopedImport.failedCount, 1, "scoped import must be reported as failed");
  assert.match(scopedImport.errors[0] || "", /Kelola peran berscope dari menu Struktur Organisasi SIMPEG/i);

  events.length = 0;
  await service.removeRole(roleId);
  assert(events.includes(`delete:${roleId}`), "role must be deleted");
  assert(events.includes(`sessions:${userId}`), "role removal must invalidate user sessions");

  (prisma.roleAssignment.count as any) = async () => 1;
  await expectRejects(() => service.removeRole(roleId), /super_admin terakhir/i);

  console.log("Admin user role governance contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
