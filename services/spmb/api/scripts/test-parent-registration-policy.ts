import { BadRequestException } from "@nestjs/common";
import { ACTIVE_REGISTRATION_POLICY } from "../src/common/registration-policy";
import { RegistrationsService } from "../src/registrations/registrations.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const periodId = "11111111-1111-4111-8111-111111111111";
const parent = { id: "parent-multi", email: "parent@example.test", fullName: "Orang Tua" };
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

async function run() {
  assert(
    ACTIVE_REGISTRATION_POLICY === "multiple_child_applications",
    "active registration policy must be multiple_child_applications",
  );

  const registrations: any[] = [];
  const tx = {
    user: { upsert: async () => ({ id: parent.id }) },
    admissionPeriod: {
      findUnique: async () => ({ id: periodId, unitSlug: "sd", label: "2026/2027", isOpen: true, quota: 10, fee: 250000 }),
    },
    registration: {
      findFirst: async ({ where }: any) => {
        return registrations.find((record) => {
          if (record.parentId !== where?.parentId || record.periodId !== where?.periodId) return false;
          if (where?.studentData?.is === null) return !record.studentData;
          if (where?.studentData?.is?.fullName?.equals) {
            return record.studentData?.fullName?.toLowerCase() === String(where.studentData.is.fullName.equals).toLowerCase()
              && record.status !== "rejected";
          }
          return true;
        }) ?? null;
      },
      create: async ({ data }: any) => {
        const record = { id: `reg-${registrations.length + 1}`, ...data };
        registrations.push(record);
        return record;
      },
      findUnique: async ({ where }: any) => registrations.find((record) => record.id === where.id) ?? null,
      update: async ({ where, data }: any) => {
        const record = registrations.find((item) => item.id === where.id);
        Object.assign(record, data);
        return record;
      },
    },
    studentData: {
      upsert: async ({ where, update, create }: any) => {
        const record = registrations.find((item) => item.id === where.registrationId);
        record.studentData = { ...(record.studentData || {}), ...(record.studentData ? update : create) };
        return record.studentData;
      },
    },
    payment: { create: async () => ({}) },
    registrationEvent: { create: async () => ({}) },
  };

  const service = new RegistrationsService(
    {
      ...tx,
      $transaction: async (callback: any) => callback(tx),
    } as any,
    { allocateRegistrationNumber: async () => ({ registrationNumber: `PPDB-SD-2026-${String(registrations.length + 1).padStart(4, "0")}` }) } as any,
  );

  const firstDraft = await (service as any).createOnline(parent, { periodId });
  assert(firstDraft.id === "reg-1", "first anonymous draft must succeed");
  assert(!registrations[0].studentData, "creating a draft must not persist fake student data");

  let duplicateDraftRejected = false;
  try {
    await (service as any).createOnline(parent, { periodId });
  } catch (error) {
    duplicateDraftRejected = error instanceof BadRequestException;
  }
  assert(duplicateDraftRejected, "a parent may have only one anonymous pending-payment draft per period");

  registrations[0].status = "payment_verified";
  await (service as any).submitStudentData(firstDraft.id, parent.id, student);
  assert(registrations[0].studentData?.fullName === student.fullName, "student identity must be persisted after payment verification");

  const secondDraft = await (service as any).createOnline(parent, { periodId });
  assert(secondDraft.id === "reg-2", "a second child draft must be allowed after the first child is identified");

  registrations[1].status = "payment_verified";
  let duplicateChildRejected = false;
  try {
    await (service as any).submitStudentData(secondDraft.id, parent.id, { ...student, fullName: "ahmad fauzi" });
  } catch (error) {
    duplicateChildRejected = error instanceof BadRequestException;
  }
  assert(duplicateChildRejected, "duplicate active child names must be rejected case-insensitively during student submission");

  console.log("SPMB parent registration policy contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
