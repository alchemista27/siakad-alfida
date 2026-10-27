import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { YmqRoleManagementService } from "../src/ymq-role-management/ymq-role-management.service";

const ids = {
  admin: "11111111-1111-4111-8111-111111111111",
  employee: "22222222-2222-4222-8222-222222222222",
};

async function main() {
  const calls: Array<{ operation: string; role: string }> = [];
  const broker = {
    list: async () => [{ userId: ids.employee, role: "peserta" }],
    assign: async (_actorId: string, _userId: string, role: string) => { calls.push({ operation: "assign", role }); return { changed: true }; },
    revoke: async (_actorId: string, _userId: string, role: string) => { calls.push({ operation: "revoke", role }); return { deleted: true }; },
  };
  const prisma = {
    user: {
      findUnique: async () => ({ id: ids.employee, isActive: true, sourceUpdatedAt: new Date() }),
      findMany: async () => [{ id: ids.employee, fullName: "Peserta Uji", email: "uji@example.test", unitId: null, unitName: null }],
    },
  };
  const service = new YmqRoleManagementService(prisma as any, broker as any);
  const admin = { id: ids.admin, roles: [{ app: "siyaum", role: "admin_ymq" }] };
  assert.equal((await service.assignParticipant(ids.employee, admin)).changed, true);
  await service.revokeParticipant(ids.employee, admin);
  assert.deepEqual(calls, [{ operation: "assign", role: "peserta" }, { operation: "revoke", role: "peserta" }]);
  assert.deepEqual(await service.listParticipants(admin), [{ id: ids.employee, fullName: "Peserta Uji", email: "uji@example.test", unitId: null, unitName: null }]);
  await assert.rejects(() => service.assignParticipant(ids.employee, { id: "other", roles: [] }), ForbiddenException);
  await assert.rejects(
    () => new YmqRoleManagementService({ user: { findUnique: async () => ({ id: ids.employee, isActive: true, sourceUpdatedAt: null }) } } as any, broker as any).assignParticipant(ids.employee, admin),
    BadRequestException,
  );
  console.log("SIYAUM YMQ role management contract passed");
}

void main();
