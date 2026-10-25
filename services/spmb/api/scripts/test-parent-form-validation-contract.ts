import { BadRequestException } from "@nestjs/common";
import {
  CreateSpmbDraftSchema,
  ParentRegistrationFormSchema,
  StudentRegistrationFormSchema,
} from "@alfida/contracts";
import { RegistrationsService } from "../src/registrations/registrations.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const student = {
  fullName: "Ahmad Fauzi",
  nickname: "Ahmad",
  gender: "male",
  religion: "Islam",
  birthPlace: "Bandung",
  birthDate: "2019-05-10",
  nisn: "",
  siblingsCount: 2,
  address: "Jl. Melati Nomor 10, Bandung",
  transportation: "Diantar orang tua",
};

const parent = {
  fullName: "Budi Santoso",
  nik: "3273010101010001",
  birthPlace: "Bandung",
  birthDate: "1980-01-01",
  education: "SMA",
  occupation: "Wiraswasta",
  incomeRange: "Rp 3.000.000 - Rp 5.000.000",
  phone: "081234567890",
  address: "Jl. Melati Nomor 10, Bandung",
};

async function rejects(fn: () => Promise<unknown>, message: string) {
  let rejected = false;
  try {
    await fn();
  } catch (error) {
    rejected = error instanceof BadRequestException;
  }
  assert(rejected, message);
}

async function run() {
  assert(!CreateSpmbDraftSchema.safeParse({}).success, "draft must require periodId");
  assert(!StudentRegistrationFormSchema.safeParse({ ...student, religion: "" }).success, "student religion must be required");
  assert(!StudentRegistrationFormSchema.safeParse({ ...student, nickname: "" }).success, "student nickname must be required");
  assert(!StudentRegistrationFormSchema.safeParse({ ...student, transportation: "" }).success, "student transportation must be required");
  assert(!StudentRegistrationFormSchema.safeParse({ ...student, siblingsCount: -1 }).success, "siblings count must be non-negative");
  assert(!ParentRegistrationFormSchema.safeParse({ father: { ...parent, nik: "123" }, mother: parent }).success, "NIK must contain exactly sixteen digits");

  const registration = {
    id: "reg-1",
    parentId: "parent-1",
    periodId: "11111111-1111-4111-8111-111111111111",
    status: "payment_verified",
  };
  const service = new RegistrationsService({
    registration: {
      findUnique: async () => registration,
      findFirst: async () => null,
    },
    studentData: { upsert: async () => ({}) },
    parentData: { deleteMany: async () => ({}), create: async () => ({}) },
    registrationEvent: { create: async () => ({}) },
    $transaction: async (callback: any) => callback({}),
  } as any);

  await rejects(
    () => (service as any).submitStudentData(registration.id, registration.parentId, { ...student, religion: "" }),
    "service must reject an incomplete student payload before persistence",
  );
  await rejects(
    () => (service as any).submitParentData(registration.id, registration.parentId, { father: parent }),
    "service must reject a missing mother payload before persistence",
  );

  registration.status = "form_filling";
  (registration as any).studentData = {
    ...student,
    nickname: null,
    birthDate: new Date(student.birthDate),
  };
  await rejects(
    () => (service as any).submitParentData(registration.id, registration.parentId, { father: parent, mother: parent }),
    "service must reject parent submission until every required student field is complete",
  );

  console.log("SPMB parent-form validation contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
