import { BadRequestException } from "@nestjs/common";
import { RegistrationsService } from "../src/registrations/registrations.service";

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
const student = {
  fullName: "Ahmad Fauzi",
  nickname: "Ahmad",
  gender: "male",
  religion: "Islam",
  birthPlace: "Bandung",
  birthDate: "2019-05-10",
  nisn: "",
  siblingsCount: 2,
  transportation: "Diantar orang tua",
  nik: "3273010101010001",
  birthCertificateNumber: "AKTA-2019-001",
  familyCardNumber: "3273010101010002",
  streetAddress: "Jalan Melati Nomor 10",
  rt: "1",
  rw: "2",
  hamlet: "",
  village: "Cipedes",
  subdistrict: "Sukajadi",
  city: "Bandung",
  province: "Jawa Barat",
  postalCode: "40162",
  residenceStatus: "with_parents",
  specialNeeds: "",
  pipEligible: false,
  kipNumber: "",
  previousSchoolName: "",
  previousSchoolNpsn: "",
  graduationDocumentNumber: "",
};

function createService(educationLevel: "tk" | "sd" | "smp" | "sma" | null, writes: any[]) {
  const registration = { id: registrationId, parentId, periodId: "period-1", status: "payment_verified", period: { educationLevel, tkGroup: null, sourceAcademicYearId: null, unitId: "unit-1", label: "2027/2028" } };
  const tx = {
    registration: {
      findUnique: async () => registration,
      findFirst: async () => null,
      update: async () => registration,
    },
    studentData: { upsert: async ({ update, create }: any) => { writes.push({ update, create }); return {}; } },
    registrationEvent: { create: async () => ({}) },
  };
  return new RegistrationsService({ ...tx, $transaction: async (callback: any) => callback(tx) } as any);
}

async function run() {
  const writes: any[] = [];
  const service = createService("sd", writes);
  await (service as any).submitStudentData(registrationId, parentId, student);
  assert(writes.length === 1, "valid Dapodik student payload must persist once");
  assert(writes[0].create.nik === student.nik, "NIK must be persisted");
  assert(writes[0].create.familyCardNumber === student.familyCardNumber, "family-card number must be persisted");
  assert(writes[0].create.streetAddress === student.streetAddress, "structured address must be persisted");
  assert(writes[0].create.address === "Jalan Melati Nomor 10, RT 001/RW 002, Cipedes, Sukajadi, Bandung, Jawa Barat, 40162", "legacy address must be formatted server-side");

  const legacyWrites: any[] = [];
  await expectBadRequest("period without configured level", () => (createService(null, legacyWrites) as any).submitStudentData(registrationId, parentId, student));
  assert(legacyWrites.length === 0, "unconfigured period must reject before student-data persistence");

  await expectBadRequest(
    "SMP requires prior-school data",
    () => (createService("smp", []) as any).submitStudentData(registrationId, parentId, student),
  );
  await expectBadRequest(
    "PIP eligibility requires KIP number",
    () => (createService("sd", []) as any).submitStudentData(registrationId, parentId, { ...student, pipEligible: true, kipNumber: "" }),
  );

  await expectBadRequest(
    "TK requires the parent to choose group A or B",
    () => (createService("tk", []) as any).submitStudentData(registrationId, parentId, student),
  );
  const tkWrites: any[] = [];
  await (createService("tk", tkWrites) as any).submitStudentData(registrationId, parentId, { ...student, tkGroup: "b" });
  assert(tkWrites[0].create.tkGroup === "b", "the parent-selected TK group must be persisted with student data");

  console.log("SPMB Dapodik student persistence contract passed");
}

void run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
