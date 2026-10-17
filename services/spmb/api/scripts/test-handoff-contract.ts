import { BadRequestException } from "@nestjs/common";
import { HandoffService } from "../src/handoff/handoff.service";

const originalUrl = process.env.INTERNAL_SIAKAD_API_URL;
const originalSecret = process.env.INTERNAL_SERVICE_SECRET;
const originalFetch = globalThis.fetch;

const principal = {
  id: "admin-1",
  roles: [{ app: "spmb", role: "admin_unit", unitId: "a54e3031-3837-4a5f-9cbe-2493524dded9" }],
};

const registration = {
  id: "reg-1",
  registrationNumber: "PPDB-UNIT-2026-0001",
  status: "accepted",
  parent: { id: "6a63ac4f-0221-4f00-9f9d-4a1ba2e294ee", fullName: "Parent", email: "parent@example.test", phone: null },
  studentData: { id: "student-1", fullName: "Student", nickname: null, gender: "male", birthPlace: "Jakarta", birthDate: new Date("2018-01-01"), nisn: null, address: "Alamat" },
  parentData: [],
  period: { label: "2026/2027", unitId: "a54e3031-3837-4a5f-9cbe-2493524dded9" },
};

function createService(updates: unknown[]) {
  return new HandoffService({
    registration: {
      findUnique: async () => registration,
      update: async ({ data }: any) => {
        updates.push(data);
        return registration;
      },
    },
    registrationEvent: { create: async () => ({}) },
  } as any);
}

async function run() {
  try {
    delete process.env.INTERNAL_SIAKAD_API_URL;
    delete process.env.INTERNAL_SERVICE_SECRET;
    globalThis.fetch = (async () => { throw new Error("fetch must not run without configuration"); }) as typeof fetch;
    try {
      await createService([]).syncSingle(principal, { registrationId: registration.id });
      throw new Error("missing handoff configuration unexpectedly succeeded");
    } catch (error) {
      if (!(error instanceof BadRequestException) || !error.message.toLowerCase().includes("konfigurasi")) throw error;
    }

    process.env.INTERNAL_SIAKAD_API_URL = "https://siakad.example.test";
    process.env.INTERNAL_SERVICE_SECRET = "test-secret";
    const rejectedUpdates: unknown[] = [];
    globalThis.fetch = (async () => new Response(JSON.stringify({ success: true }), { status: 200 })) as typeof fetch;
    const rejected = await createService(rejectedUpdates).syncSingle(principal, { registrationId: registration.id });
    if (rejected.success !== false || !(rejectedUpdates[0] as any)?.handoffStatus || (rejectedUpdates[0] as any).handoffStatus !== "failed") {
      throw new Error("handoff must fail without destination confirmation");
    }

    const successfulUpdates: unknown[] = [];
    globalThis.fetch = (async () => new Response(JSON.stringify({ success: true, destinationRegistrationId: "siakad-reg-1" }), { status: 200 })) as typeof fetch;
    const successful = await createService(successfulUpdates).syncSingle(principal, { registrationId: registration.id });
    if (successful.success !== true || (successfulUpdates[0] as any)?.handoffStatus !== "done") {
      throw new Error("confirmed handoff must be marked done");
    }

    console.log("SPMB handoff sender contract passed");
  } finally {
    if (originalUrl === undefined) delete process.env.INTERNAL_SIAKAD_API_URL;
    else process.env.INTERNAL_SIAKAD_API_URL = originalUrl;
    if (originalSecret === undefined) delete process.env.INTERNAL_SERVICE_SECRET;
    else process.env.INTERNAL_SERVICE_SECRET = originalSecret;
    globalThis.fetch = originalFetch;
  }
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
