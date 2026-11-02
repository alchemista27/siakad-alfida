import assert from "node:assert/strict";
import { UsersService } from "../src/users/users.service";

const userId = "00000000-0000-4000-8000-000000000001";
const oldUnitId = "00000000-0000-4000-8000-000000000002";
const newUnitId = "00000000-0000-4000-8000-000000000003";

async function main() {
  const role = { id: "00000000-0000-4000-8000-000000000004", userId, app: "simpeg", role: "pegawai", unitId: oldUnitId, departmentId: null };
  let invalidatedSessions = 0;
  const prisma: any = {
    user: { async findUnique() { return { id: userId, fullName: "Pegawai Aktif", isActive: true }; } },
    roleAssignment: {
      async findMany() { return [{ ...role }]; },
      async update({ where, data }: any) { assert.equal(where.id, role.id); Object.assign(role, data); return { ...role }; },
    },
    session: { async deleteMany({ where }: any) { assert.equal(where.userId, userId); invalidatedSessions += 1; return { count: 2 }; } },
    async $transaction(callback: any) { return callback({ roleAssignment: this.roleAssignment, session: this.session }); },
  };
  const service = new UsersService(prisma);
  const result = await service.syncEmployeePrimaryUnitRole({ userId, unitId: newUnitId });
  assert.deepEqual(result, { userId, unitId: newUnitId, changed: true });
  assert.equal(role.unitId, newUnitId);
  assert.equal(invalidatedSessions, 1, "changing role scope must invalidate stale session claims");
  assert.deepEqual(await service.syncEmployeePrimaryUnitRole({ userId, unitId: newUnitId }), { userId, unitId: newUnitId, changed: false });
  assert.equal(invalidatedSessions, 1, "idempotent sync must preserve sessions when scope is already current");
  console.log("Employee primary-unit Auth role sync contract passed");
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
