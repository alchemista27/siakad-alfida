import assert from "node:assert/strict";
import { LettersService } from "../src/letters/letters.service";

const token = "a".repeat(64);
const referredRegistration = {
  id: "a1111111-1111-4111-8111-111111111111",
  status: "medical_pending",
  period: { unitName: "SDIT Alfida", label: "2026/2027" },
  studentData: { fullName: "Ahmad Fauzan" },
};
const referral = {
  id: "ref-1",
  verificationToken: token,
  referralNumber: "SPMB-MED-2026-ABC12345",
  issuedAt: new Date("2026-10-28T00:00:00Z"),
  registration: referredRegistration,
};
const prisma: any = {
  medicalReferral: {
    findUnique: async ({ where }: any) => where.verificationToken === token ? referral : null,
  },
};

async function main() {
  const service = new LettersService(prisma);
  assert.deepEqual(await service.verifyMedicalReferral("not-a-token"), { valid: false });
  assert.deepEqual(await service.verifyMedicalReferral("f".repeat(64)), { valid: false });
  assert.deepEqual(await service.verifyMedicalReferral(token), {
    valid: true,
    studentName: "Ahmad Fauzan",
    unitName: "SDIT Alfida",
    academicYearLabel: "2026/2027",
    referralNumber: "SPMB-MED-2026-ABC12345",
    issuedAt: "2026-10-28T00:00:00.000Z",
  });
  referredRegistration.status = "rejected";
  assert.deepEqual(await service.verifyMedicalReferral(token), { valid: false });
  console.log("SPMB medical referral verification contract passed");
}

void main();
