import assert from "node:assert/strict";
import { SppInvoiceService } from "../src/spp/spp-invoice.service";

const invoices = {
  $transaction: async <T>(callback: (transaction: { findByEnrollmentAndPeriod: () => Promise<[]>; createMany: () => Promise<{ count: number }> }) => Promise<T>) => callback({
    findByEnrollmentAndPeriod: async () => [],
    createMany: async () => ({ count: 0 }),
  }),
  findById: async () => null,
  markPaid: async () => null,
  markPaidManually: async () => null,
  listInvoices: async () => ({ data: [], total: 0 }),
  getDashboard: async () => ({
    unpaid: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
  }),
};

async function main() {
  const service = new SppInvoiceService(invoices as never) as unknown as {
    listInvoices(input: unknown): Promise<{ data: unknown[]; meta: { total: number; page: number; limit: number; totalPages: number } }>;
    getDashboard(input: unknown): Promise<{ unpaid: { count: number; amount: number }; paid: { count: number; amount: number }; overdue: { count: number; amount: number } }>;
  };

  assert.equal(typeof service.listInvoices, "function", "finance list method must exist");
  assert.equal(typeof service.getDashboard, "function", "finance dashboard method must exist");

  const list = await service.listInvoices({ page: "1", limit: "20" });
  assert.deepEqual(list, { data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

  const dashboard = await service.getDashboard({});
  assert.deepEqual(dashboard, {
    unpaid: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    overdue: { count: 0, amount: 0 },
  });

  await assert.rejects(() => service.listInvoices({ page: "0" }), /page/);
  await assert.rejects(() => service.listInvoices({ limit: "101" }), /limit/);
  await assert.rejects(() => service.listInvoices({ status: "anything" }), /status/);

  console.log("SISKEU finance dashboard contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
