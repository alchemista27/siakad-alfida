import { BadRequestException } from "@nestjs/common";
import { ACTIVE_REGISTRATION_POLICY } from "../src/common/registration-policy";
import { RegistrationsService } from "../src/registrations/registrations.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  assert(
    ACTIVE_REGISTRATION_POLICY === "multiple_child_applications",
    "active registration policy must be multiple_child_applications",
  );

  if (ACTIVE_REGISTRATION_POLICY !== ("single_parent_application" as string)) {
    console.log("SKIPPED: product policy not selected (one-parent-one-active-application)");
  }

  const createdRegistrations: any[] = [];
  const createdStudents: any[] = [];
  const parent = { id: "parent-multi", email: "parent@example.test", fullName: "Orang Tua" };

  const service = new RegistrationsService({
    $transaction: async (callback: any) =>
      callback({
        user: { upsert: async () => ({ id: parent.id }) },
        admissionPeriod: {
          findUnique: async () => ({
            id: "period-1",
            unitSlug: "sd",
            label: "2026/2027",
            isOpen: true,
            quota: 10,
            fee: 250000,
          }),
        },
        registration: {
          findFirst: async ({ where }: any) => {
            return createdRegistrations.find((reg) => {
              if (reg.parentId !== where?.parentId || reg.periodId !== where?.periodId) return false;
              if (where?.studentData?.fullName?.equals) {
                return reg.studentFullName?.toLowerCase() === String(where.studentData.fullName.equals).toLowerCase();
              }
              return true;
            }) ?? null;
          },
          count: async () => createdRegistrations.length,
          create: async ({ data }: any) => {
            const record = { id: `reg-${createdRegistrations.length + 1}`, ...data };
            createdRegistrations.push(record);
            return record;
          },
        },
        studentData: {
          create: async ({ data }: any) => {
            createdStudents.push(data);
            const reg = createdRegistrations.find((r) => r.id === data.registrationId);
            if (reg) reg.studentFullName = data.fullName;
            return data;
          },
        },
        payment: { create: async () => ({}) },
        registrationEvent: { create: async () => ({}) },
      }),
  } as any);

  // Case: one-parent-many-child-applications
  // 1. Missing child identity must be rejected
  let missingChildRejected = false;
  try {
    await (service as any).createOnline(parent, { periodId: "period-1" });
  } catch (error) {
    missingChildRejected = error instanceof BadRequestException;
  }
  assert(missingChildRejected, "multiple_child_applications must require applicant/child identity on registration");

  // 2. First child registration succeeds
  const firstChild = await (service as any).createOnline(parent, {
    periodId: "period-1",
    applicantFullName: "Ahmad Fauzi",
    applicantGender: "male",
    applicantBirthPlace: "Bandung",
    applicantBirthDate: "2019-05-10",
  });
  assert(firstChild.id === "reg-1", "first child registration must succeed");

  // 3. Second sibling registration under same parent in same period succeeds
  const secondChild = await (service as any).createOnline(parent, {
    periodId: "period-1",
    applicantFullName: "Siti Aminah",
    applicantGender: "female",
    applicantBirthPlace: "Bandung",
    applicantBirthDate: "2020-08-15",
  });
  assert(secondChild.id === "reg-2", "second sibling registration must succeed under multiple_child_applications");
  assert(createdStudents.length === 2, "each child application must persist its initial student identity");

  // 4. Duplicate active application for the same child in the same period is rejected
  let duplicateChildRejected = false;
  try {
    await (service as any).createOnline(parent, {
      periodId: "period-1",
      applicantFullName: "Ahmad Fauzi",
      applicantGender: "male",
      applicantBirthPlace: "Bandung",
      applicantBirthDate: "2019-05-10",
    });
  } catch (error) {
    duplicateChildRejected = error instanceof BadRequestException;
  }
  assert(duplicateChildRejected, "duplicate active application for the same child in the same period must be rejected");

  console.log("SPMB parent registration policy contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
