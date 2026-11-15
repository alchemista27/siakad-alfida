import { BadRequestException } from "@nestjs/common";
import { DocumentsService } from "../src/documents/documents.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectBadRequest(label: string, action: () => Promise<unknown>) {
  try {
    await action();
    throw new Error(`${label}: unexpectedly succeeded`);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("unexpectedly succeeded")) throw error;
    if (!(error instanceof BadRequestException)) throw error;
  }
}

const registrationId = "11111111-1111-4111-8111-111111111111";
const parentId = "22222222-2222-4222-8222-222222222222";
const health = { heightCm: 108.5, weightKg: 18.2, headCircumferenceCm: 50.5, immunizationStatus: "complete" };

function serviceFor(level: "tk" | "sd", updates: any[]) {
  const registration = {
    id: registrationId,
    parentId,
    status: "medical_uploaded",
    period: { educationLevel: level },
    documents: [{ type: "medical_result" }],
  };
  return new DocumentsService({
    registration: { findUnique: async () => registration, update: async ({ data }: any) => { updates.push({ kind: "registration", data }); return registration; } },
    studentData: { update: async ({ data }: any) => { updates.push({ kind: "student", data }); return {}; } },
    registrationEvent: { create: async () => ({}) },
    $transaction: async (items: any[]) => Promise.all(items),
  } as any);
}

async function run() {
  const tkUpdates: any[] = [];
  await serviceFor("tk", tkUpdates).markMedicalDone(registrationId, parentId, health as any);
  const studentUpdate = tkUpdates.find((entry) => entry.kind === "student");
  assert(studentUpdate?.data.heightCm === health.heightCm, "TK height must persist on medical completion");
  assert(studentUpdate?.data.immunizationStatus === health.immunizationStatus, "TK immunization status must persist on medical completion");

  await expectBadRequest("TK requires structured health data", () => serviceFor("tk", []).markMedicalDone(registrationId, parentId, undefined as any));
  await expectBadRequest("non-TK cannot write TK health", () => serviceFor("sd", []).markMedicalDone(registrationId, parentId, health as any));

  console.log("SPMB TK health contract passed");
}

void run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
