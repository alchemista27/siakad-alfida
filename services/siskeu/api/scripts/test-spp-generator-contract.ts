import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import { SppInvoiceService, deterministicReference } from "../src/spp/spp-invoice.service";
import { assertSiskeuFinanceRole } from "../src/auth/siskeu-roles.guard";

const unitId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const academicYearId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const enrollmentA = "11111111-1111-4111-8111-111111111111";
const enrollmentB = "22222222-2222-4222-8222-222222222222";

async function main() {
  assert.equal(deterministicReference(enrollmentA, "2026-10"), "SPP-202610-11111111111141118111111111111111");
  assert.doesNotThrow(() => assertSiskeuFinanceRole({ roles: [{ app: "siskeu", role: "admin_keuangan" }] }));
  assert.doesNotThrow(() => assertSiskeuFinanceRole({ roles: [{ app: "*", role: "super_admin" }] }));
  assert.throws(() => assertSiskeuFinanceRole({ roles: [{ app: "siakad", role: "admin_keuangan" }] }), ForbiddenException);

  const created: Array<Record<string, unknown>> = [];
  const service = new SppInvoiceService({
    $transaction: async (callback) => callback({
      findByEnrollmentAndPeriod: async () => [{ enrollmentId: enrollmentA, billingPeriod: "2026-10" }],
      createMany: async ({ data }) => {
        created.push(...data);
        return { count: data.length };
      },
    }),
    findById: async () => null,
    markPaid: async () => null,
  });

  const result = await service.generate({
    unitId,
    academicYearId,
    billingPeriod: "2026-10",
    dueDate: "2026-10-10",
    invoices: [
      { enrollmentId: enrollmentA, studentName: "Sudah Ada", amount: 250000 },
      { enrollmentId: enrollmentB, studentName: "Baru", amount: 275000, description: "SPP Oktober" },
    ],
  });
  assert.deepEqual(result, { generated: 1, skipped: 1 });
  assert.equal(created.length, 1);
  assert.equal(created[0].enrollmentId, enrollmentB);
  assert.equal(created[0].reference, deterministicReference(enrollmentB, "2026-10"));
  await assert.rejects(() => service.generate({ ...{ unitId, academicYearId, billingPeriod: "2026-10", dueDate: "2026-10-10" }, invoices: [{ enrollmentId: enrollmentA, studentName: "Bad", amount: 0 }] }));
  await assert.rejects(() => service.generate({ ...{ unitId, academicYearId, billingPeriod: "2026-10", dueDate: "2026-10-10" }, invoices: [{ enrollmentId: enrollmentA, studentName: "Duplicate", amount: 1 }, { enrollmentId: enrollmentA, studentName: "Duplicate", amount: 1 }] }));

  console.log("SISKEU generator/RBAC contract passed");
}

void main();
