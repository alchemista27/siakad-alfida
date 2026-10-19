import assert from "node:assert/strict";
import { ServiceUnavailableException } from "@nestjs/common";
import { SppBillingController } from "../src/spp-billing/spp-billing.controller";
import { SppBillingService } from "../src/spp-billing/spp-billing.service";

const parent = { id: "parent-1", roles: [{ role: "orang_tua", app: "siakad" }] };

function makePrisma() {
  return {
    enrollment: {
      async findMany() {
        return [
          { id: "enrollment-1", student: { fullName: "Alya" }, classroom: { name: "7A" } },
          { id: "enrollment-2", student: { fullName: "Bima" }, classroom: { name: "7B" } },
        ];
      },
    },
  };
}

async function main() {
  const originalUrl = process.env.SISKEU_API_URL;
  const originalToken = process.env.SISKEU_INTERNAL_SERVICE_TOKEN;
  process.env.SISKEU_API_URL = "https://siskeu.example.test";
  process.env.SISKEU_INTERNAL_SERVICE_TOKEN = "siskeu-contract-token";

  const requests: Array<{ input: string; init?: RequestInit }> = [];
  const fetchImplementation: typeof fetch = async (input, init) => {
    requests.push({ input: String(input), init });
    if (String(input).endsWith("/payment-session")) {
      return new Response(JSON.stringify({ invoiceId: "invoice-1", paymentUrl: "https://pay.example.test/session-1" }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({
      invoices: [
        { id: "invoice-1", enrollmentId: "enrollment-1", reference: "SPP-2026-0001", description: "SPP Oktober 2026", amount: 250000, currency: "IDR", dueDate: "2026-10-31", status: "unpaid", paymentUrl: null },
        { id: "foreign-invoice", enrollmentId: "not-owned", reference: "LEAK", description: "must be filtered", amount: 1, currency: "IDR", dueDate: "2026-10-31", status: "unpaid", paymentUrl: null },
      ],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  try {
    const service = new SppBillingService(makePrisma() as any, fetchImplementation);
    const controller = new SppBillingController(service);

    const listed = await controller.list(parent as any);
    assert.equal(listed.invoices.length, 1, "SIAKAD must never reveal SISKEU invoices outside the parent's enrollments");
    assert.equal(listed.invoices[0].id, "invoice-1");
    assert.equal(requests[0].input, "https://siskeu.example.test/api/internal/spp/invoices?enrollmentIds=enrollment-1%2Cenrollment-2");
    assert.equal((requests[0].init?.headers as Record<string, string>)["x-internal-service-key"], "siskeu-contract-token");

    const session = await controller.createPaymentSession(parent as any, "invoice-1");
    assert.equal(session.paymentUrl, "https://pay.example.test/session-1");
    assert.equal(requests[2].input, "https://siskeu.example.test/api/internal/spp/invoices/invoice-1/payment-session");
    assert.deepEqual(JSON.parse(String(requests[2].init?.body)), { enrollmentId: "enrollment-1" });

    await assert.rejects(() => controller.createPaymentSession(parent as any, "foreign-invoice"), /Tagihan SPP tidak ditemukan/, "SIAKAD must not create a payment session for a foreign bill");

    delete process.env.SISKEU_API_URL;
    await assert.rejects(() => service.listForParent(parent as any), ServiceUnavailableException, "the menu must fail closed when SISKEU integration is not configured");
  } finally {
    if (originalUrl === undefined) delete process.env.SISKEU_API_URL;
    else process.env.SISKEU_API_URL = originalUrl;
    if (originalToken === undefined) delete process.env.SISKEU_INTERNAL_SERVICE_TOKEN;
    else process.env.SISKEU_INTERNAL_SERVICE_TOKEN = originalToken;
  }

  console.log("SIAKAD SISKEU SPP billing contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
