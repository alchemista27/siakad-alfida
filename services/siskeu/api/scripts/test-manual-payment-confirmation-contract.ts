import assert from "node:assert/strict";
import { ConflictException } from "@nestjs/common";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SppInvoiceService } from "../src/spp/spp-invoice.service";

const invoiceId = "11111111-1111-4111-8111-111111111111";

async function main() {
  let current = { id: invoiceId, status: "unpaid", paymentProviderReference: null as string | null };
  const persistedReferences: string[] = [];
  const service = new SppInvoiceService({
    $transaction: async (callback) => callback({
      findByEnrollmentAndPeriod: async () => [],
      createMany: async () => ({ count: 0 }),
    }),
    findById: async () => current,
    markPaid: async () => null,
    markPaidManually: async (_id: string, reference: string) => {
      persistedReferences.push(reference);
      if (current.status !== "unpaid") return null;
      current = { id: invoiceId, status: "paid", paymentProviderReference: reference };
      return current;
    },
  });

  const result = await service.markPaidManually(invoiceId, { manualReference: "BANK-20261020-0001" });
  assert.deepEqual(result, {
    invoiceId,
    status: "paid",
    paymentMethod: "manual_transfer",
    manualReference: "BANK-20261020-0001",
  });
  assert.deepEqual(persistedReferences, ["manual_transfer:BANK-20261020-0001"], "the manual reference must be persisted with an auditable method marker");

  const retried = await service.markPaidManually(invoiceId, { manualReference: "BANK-20261020-0001" });
  assert.deepEqual(retried, result, "replaying the same finance confirmation must be idempotent");
  await assert.rejects(() => service.markPaidManually(invoiceId, { manualReference: "OTHER-REFERENCE" }), ConflictException);
  await assert.rejects(() => service.markPaidManually(invoiceId, { manualReference: "" }));

  current = { id: invoiceId, status: "pending", paymentProviderReference: null };
  await assert.rejects(() => service.markPaidManually(invoiceId, { manualReference: "BANK-20261020-0002" }), ConflictException, "only an unpaid invoice can be manually confirmed");

  const controller = await readFile(resolve(import.meta.dirname, "../src/spp/spp-invoice.controller.ts"), "utf8");
  assert.match(controller, /@Post\(":id\/manual-payment"\)\s+@UseGuards\(SiskeuAuthGuard, SiskeuRolesGuard\)\s+@SiskeuFinanceRoles\(\)\s+markPaidManually/s, "manual confirmation must be a finance-only route");
  assert.doesNotMatch(controller, /@Post\(":id\/manual-payment"\)\s+@UseGuards\(ProviderWebhookGuard\)/s, "manual confirmation must not use the provider webhook guard");

  console.log("SISKEU manual payment confirmation contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
