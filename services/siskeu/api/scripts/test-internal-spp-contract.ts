import assert from "node:assert/strict";
import { ServiceUnavailableException } from "@nestjs/common";
import {
  InternalSppService,
  parseEnrollmentIds,
} from "../src/internal/internal-spp.service";

const enrollmentA = "11111111-1111-4111-8111-111111111111";
const enrollmentB = "22222222-2222-4222-8222-222222222222";

async function main() {
  assert.deepEqual(parseEnrollmentIds(`${enrollmentA},${enrollmentB}`), [enrollmentA, enrollmentB]);
  assert.throws(() => parseEnrollmentIds(`${enrollmentA},${enrollmentA}`));
  assert.throws(() => parseEnrollmentIds("not-an-enrollment"));
  assert.throws(() => parseEnrollmentIds(Array.from({ length: 101 }, (_, index) => `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`).join(",")));

  const service = new InternalSppService({
    findByEnrollmentIds: async () => [
      {
        id: "invoice-a",
        enrollmentId: enrollmentA,
        reference: "SPP-202610-A",
        description: "SPP Oktober",
        amount: 250000,
        currency: "IDR",
        dueDate: new Date("2026-10-10T00:00:00.000Z"),
        status: "unpaid",
      },
      {
        id: "invoice-not-requested",
        enrollmentId: "33333333-3333-4333-8333-333333333333",
        reference: "SPP-202610-C",
        description: "Tidak boleh bocor",
        amount: 250000,
        currency: "IDR",
        dueDate: new Date("2026-10-10T00:00:00.000Z"),
        status: "unpaid",
      },
    ],
    findById: async () => ({
      id: "invoice-a",
      enrollmentId: enrollmentA,
      reference: "SPP-202610-A",
      description: "SPP Oktober",
      amount: 250000,
      currency: "IDR",
      dueDate: new Date("2026-10-10T00:00:00.000Z"),
      status: "unpaid",
    }),
  });

  const listed = await service.list(`${enrollmentA},${enrollmentB}`);
  assert.deepEqual(listed.invoices.map((invoice) => invoice.enrollmentId), [enrollmentA]);
  const originalTemplate = process.env.SISKEU_PAYMENT_URL_TEMPLATE;
  const originalPaymentMode = process.env.SISKEU_PAYMENT_MODE;
  const originalInstructions = process.env.SISKEU_MANUAL_TRANSFER_INSTRUCTIONS;
  delete process.env.SISKEU_PAYMENT_URL_TEMPLATE;
  delete process.env.SISKEU_PAYMENT_MODE;
  delete process.env.SISKEU_MANUAL_TRANSFER_INSTRUCTIONS;
  await assert.rejects(() => service.createPaymentSession("invoice-a", enrollmentA), ServiceUnavailableException);

  process.env.SISKEU_PAYMENT_URL_TEMPLATE = "https://payments.example.test/pay/{invoiceId}?reference={reference}";
  const gatewaySession = await service.createPaymentSession("invoice-a", enrollmentA);
  assert.deepEqual(gatewaySession, {
    invoiceId: "invoice-a",
    paymentMethod: "gateway",
    paymentUrl: "https://payments.example.test/pay/invoice-a?reference=SPP-202610-A",
    instructions: null,
    reference: "SPP-202610-A",
    amount: 250000,
    currency: "IDR",
  });

  process.env.SISKEU_PAYMENT_MODE = "manual_transfer";
  process.env.SISKEU_MANUAL_TRANSFER_INSTRUCTIONS = "Transfer sesuai instruksi resmi sekolah, lalu simpan bukti pembayaran.";
  const manualSession = await service.createPaymentSession("invoice-a", enrollmentA);
  assert.deepEqual(manualSession, {
    invoiceId: "invoice-a",
    paymentMethod: "manual_transfer",
    paymentUrl: null,
    instructions: "Transfer sesuai instruksi resmi sekolah, lalu simpan bukti pembayaran.",
    reference: "SPP-202610-A",
    amount: 250000,
    currency: "IDR",
  });
  process.env.SISKEU_MANUAL_TRANSFER_INSTRUCTIONS = "   ";
  await assert.rejects(() => service.createPaymentSession("invoice-a", enrollmentA), ServiceUnavailableException);
  process.env.SISKEU_PAYMENT_MODE = "unsupported";
  await assert.rejects(() => service.createPaymentSession("invoice-a", enrollmentA), ServiceUnavailableException);

  await assert.rejects(() => service.createPaymentSession("invoice-a", enrollmentB));
  delete process.env.SISKEU_PAYMENT_MODE;
  process.env.SISKEU_PAYMENT_URL_TEMPLATE = "http://payments.example.test/{invoiceId}";
  await assert.rejects(() => service.createPaymentSession("invoice-a", enrollmentA));
  if (originalTemplate === undefined) delete process.env.SISKEU_PAYMENT_URL_TEMPLATE;
  else process.env.SISKEU_PAYMENT_URL_TEMPLATE = originalTemplate;
  if (originalPaymentMode === undefined) delete process.env.SISKEU_PAYMENT_MODE;
  else process.env.SISKEU_PAYMENT_MODE = originalPaymentMode;
  if (originalInstructions === undefined) delete process.env.SISKEU_MANUAL_TRANSFER_INSTRUCTIONS;
  else process.env.SISKEU_MANUAL_TRANSFER_INSTRUCTIONS = originalInstructions;

  console.log("SISKEU internal SPP contract passed");
}

void main();
