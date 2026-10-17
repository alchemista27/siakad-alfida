import { NotFoundException } from "@nestjs/common";
import { RegistrationsController } from "../src/registrations/registrations.controller";
import { RegistrationsService } from "../src/registrations/registrations.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectNotFound(action: () => Promise<unknown>) {
  try {
    await action();
    throw new Error("an unowned registration was returned");
  } catch (error) {
    if (!(error instanceof NotFoundException)) throw error;
  }
}

async function run() {
  const calls: Array<Record<string, unknown>> = [];
  const registration = {
    id: "registration-1",
    registrationNumber: "PPDB-SD-2026-0001",
    parentId: "parent-1",
    period: {
      unitName: "SD Alfida",
      unitSlug: "sd",
      label: "2026/2027",
      fee: 250000,
      bankName: "Bank Alfida",
      bankNumber: "123",
      bankHolder: "Yayasan Alfida",
    },
    studentData: { fullName: "Anak Pemilik" },
    payment: { status: "uploaded", amount: 250000, proofUrl: "https://private.example/proof.png" },
    observationBooking: null,
    observationResult: null,
    handoffStatus: "pending",
    status: "payment_uploaded",
    source: "online",
    events: [],
  };
  const ownerService = new RegistrationsService({
    registration: {
      findFirst: async (args: Record<string, unknown>) => {
        calls.push(args);
        return registration;
      },
    },
  } as any);

  const ownerResult = await ownerService.trackByNumber(" ppdb-sd-2026-0001 ", "parent-1");
  assert(ownerResult.studentName === "Anak Pemilik", "the owner should receive their own registration");
  assert(calls.length === 1, "owner lookup should execute exactly one scoped query");
  assert(
    JSON.stringify(calls[0]).includes('"parentId":"parent-1"'),
    "tracking lookup must scope the registration number to the authenticated parent",
  );
  assert(
    JSON.stringify(calls[0]).includes('"registrationNumber":"PPDB-SD-2026-0001"'),
    "tracking lookup must normalize the registration number before querying",
  );

  const otherParentService = new RegistrationsService({
    registration: { findFirst: async () => null },
  } as any);
  await expectNotFound(() => otherParentService.trackByNumber("PPDB-SD-2026-0001", "parent-2"));

  const received: Array<[string, string]> = [];
  const controller = new RegistrationsController({
    trackByNumber: async (registrationNumber: string, parentId: string) => {
      received.push([registrationNumber, parentId]);
      return { registrationNumber };
    },
  } as any);
  await controller.trackByNumber("PPDB-SD-2026-0001", { user: { id: "parent-1" } });
  assert(
    JSON.stringify(received) === JSON.stringify([["PPDB-SD-2026-0001", "parent-1"]]),
    "controller must pass the authenticated parent identity to the tracking service",
  );

  console.log("SPMB registration tracking access contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
