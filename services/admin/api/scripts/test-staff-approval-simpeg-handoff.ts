import assert from "node:assert/strict";
import { UsersService } from "../src/users/users.service";

const userId = "00000000-0000-4000-8000-000000000001";
const unitId = "00000000-0000-4000-8000-000000000002";

async function main() {
  const updates: Array<{ isActive: boolean }> = [];
  const handoffs: unknown[] = [];
  const user = {
    id: userId,
    fullName: "Guru Baru",
    email: "guru.baru@example.test",
    username: null,
    phone: "081234567890",
    avatarUrl: null,
    isActive: false,
    roles: [
      { app: "simpeg", role: "pegawai", unitId, departmentId: null },
      { app: "siakad", role: "guru", unitId, departmentId: null },
    ],
  };
  const prisma = {
    user: {
      findUnique: async () => user,
      update: async ({ data }: { data: { isActive: boolean } }) => {
        updates.push(data);
        return { ...user, ...data };
      },
    },
    session: { deleteMany: async () => ({ count: 0 }) },
  };
  const projection = {
    assertConfigured() {},
    async provision(payload: unknown) { handoffs.push(payload); },
  };
  const service = new UsersService(prisma as never, projection as never);

  await service.approveUser(userId);

  assert.deepEqual(updates, [{ isActive: true }], "approval must activate the Auth account only after the SIMPEG handoff is configured");
  assert.deepEqual(handoffs, [{
    id: userId,
    fullName: "Guru Baru",
    email: "guru.baru@example.test",
    username: null,
    phone: "081234567890",
    avatarUrl: null,
    unitId,
    employmentRole: "guru",
  }], "approval must hand off the requested unit and teacher classification to SIMPEG through the internal client");

  const failedUpdates: Array<{ isActive: boolean }> = [];
  const failedPrisma = {
    user: {
      findUnique: async () => user,
      update: async ({ data }: { data: { isActive: boolean } }) => {
        failedUpdates.push(data);
        return { ...user, ...data };
      },
    },
    session: { deleteMany: async () => ({ count: 0 }) },
  };
  const unavailableProjection = {
    assertConfigured() {},
    async provision() { throw new Error("SIMPEG unavailable"); },
  };
  const failingService = new UsersService(failedPrisma as never, unavailableProjection as never);
  await assert.rejects(() => failingService.approveUser(userId), /SIMPEG/i);
  assert.deepEqual(failedUpdates, [{ isActive: true }, { isActive: false }], "failed SIMPEG handoff must compensate by keeping the account pending");

  const statusHandoffs: unknown[] = [];
  const statusService = new UsersService({
    user: {
      findUnique: async () => user,
      update: async ({ data }: { data: { isActive: boolean } }) => ({ ...user, ...data }),
    },
    session: { deleteMany: async () => ({ count: 0 }) },
  } as never, {
    assertConfigured() {},
    async provision(payload: unknown) { statusHandoffs.push(payload); },
  } as never);
  await statusService.toggleUserStatus(userId, true);
  assert.equal(statusHandoffs.length, 1, "generic status activation must delegate pending staff to the audited SIMPEG approval handoff");

  console.log("Admin staff approval SIMPEG handoff contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
