import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { PeriodsService } from "../src/periods/periods.service";

function expectRejects<T extends Error>(Type: new (...args: any[]) => T, action: () => Promise<unknown>) {
  return action().then(
    () => { throw new Error(`Expected ${Type.name}`); },
    (error) => assert(error instanceof Type, `Expected ${Type.name}, received ${(error as Error).name}`),
  );
}

const unitId = "b2222222-2222-4222-8222-222222222222";
const principal: any = { id: "admin-1", roles: [{ role: "admin_unit", app: "spmb", unitId }] };
const periods = new Map<string, any>([
  ["period-open-empty", { id: "period-open-empty", unitId, label: "2026/2027", isOpen: true, quota: 60, fee: 250000, sourceAcademicYearId: null, opensAt: null, closesAt: null, bankName: null, bankNumber: null, bankHolder: null, _count: { registrations: 0, schedules: 0 } }],
  ["period-with-registration", { id: "period-with-registration", unitId, label: "2027/2028", isOpen: false, quota: 2, fee: 250000, sourceAcademicYearId: null, opensAt: null, closesAt: null, bankName: null, bankNumber: null, bankHolder: null, _count: { registrations: 2, schedules: 0 } }],
]);
const prisma: any = {
  admissionPeriod: {
    findUnique: async ({ where }: any) => periods.get(where.id) || null,
    findFirst: async ({ where }: any) => [...periods.values()].find((period) =>
      period.id !== where.id?.not
      && period.unitId === where.unitId
      && (where.isOpen === undefined || period.isOpen === where.isOpen)
      && (where.label === undefined || period.label === where.label)
    ) || null,
    update: async ({ where, data }: any) => {
      const period = periods.get(where.id);
      Object.assign(period, Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined)));
      return period;
    },
    delete: async ({ where }: any) => {
      const period = periods.get(where.id);
      periods.delete(where.id);
      return period;
    },
  },
};

async function main() {
  const service = new PeriodsService(prisma);
  const updated = await service.update("period-open-empty", { quota: 75, fee: 300000, bankName: "BSI" }, principal);
  assert.equal(updated.quota, 75);
  assert.equal(updated.fee, 300000);
  assert.equal(updated.bankName, "BSI");
  await service.remove("period-open-empty", principal);
  assert.equal(periods.has("period-open-empty"), false, "an empty open period must be deletable");
  await expectRejects(BadRequestException, () => service.remove("period-with-registration", principal));
  await expectRejects(BadRequestException, () => service.update("period-with-registration", { quota: 1 }, principal));
  console.log("SPMB period mutation contract passed");
}

void main();
