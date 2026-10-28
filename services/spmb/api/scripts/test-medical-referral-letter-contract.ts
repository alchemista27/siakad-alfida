import assert from "node:assert/strict";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";
import { LettersService } from "../src/letters/letters.service";
import type { FoundationBrandingClient } from "../src/letters/foundation-branding.client";
import type { UnitLetterheadClient } from "../src/letters/unit-letterhead.client";

function expectRejects<T extends Error>(Type: new (...args: any[]) => T, action: () => Promise<unknown>) {
  return action().then(
    () => { throw new Error(`Expected ${Type.name}`); },
    (error) => assert(error instanceof Type, `Expected ${Type.name}, received ${(error as Error).name}`),
  );
}

const owner: SpmbPrincipal = { id: "parent-1", roles: [{ role: "orang_tua", app: "spmb", unitId: null }] };
const outsider: SpmbPrincipal = { id: "parent-2", roles: [{ role: "orang_tua", app: "spmb", unitId: null }] };
const registration: any = {
  id: "a1111111-1111-4111-8111-111111111111",
  registrationNumber: "SPMB-2026-SDIT-0001",
  parentId: "parent-1",
  status: "medical_pending",
  period: { unitId: "b2222222-2222-4222-8222-222222222222", unitName: "SDIT Alfida", label: "2026/2027" },
  studentData: { fullName: "Ahmad Fauzan", gender: "male", birthPlace: "Bekasi", birthDate: new Date("2019-04-10") },
  medicalReferral: null,
};
let issued: any = null;
const prisma: any = {
  registration: { findUnique: async ({ where }: any) => where.id === registration.id ? registration : null },
  medicalReferral: {
    upsert: async ({ create }: any) => {
      issued ||= { id: "ref-1", registrationId: registration.id, issuedAt: new Date("2026-10-28T00:00:00Z"), pdfUrl: null, ...create };
      return issued;
    },
  },
};
const unitClient = {
  getLetterhead: async () => ({ unitId: registration.period.unitId, unitName: "SDIT Alfida", logoUrl: "https://res.cloudinary.com/example/image/upload/simpeg/unit/b2222222-2222-4222-8222-222222222222/logo/logo.png", principalName: "Siti Aminah", principalSignatureUrl: "https://res.cloudinary.com/example/image/upload/simpeg/unit/b2222222-2222-4222-8222-222222222222/principal-signature/signature.png" }),
} as unknown as UnitLetterheadClient;
const foundationClient = { getBranding: async () => ({
  foundationName: "Yayasan Alfida",
  logoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/logo.png",
  chairmanName: "Ahmad Yusuf",
  chairmanSignatureUrl: "https://res.cloudinary.com/example/image/upload/foundation/chairman-signature/signature.png",
}) } as unknown as FoundationBrandingClient;

async function main() {
  const service = new LettersService(prisma, unitClient, foundationClient);
  const first = await service.getMedicalReferralLetter(registration.id, owner);
  const second = await service.getMedicalReferralLetter(registration.id, owner);
  assert.equal(first.referralNumber, second.referralNumber, "referral number must be durable");
  assert.equal(first.studentName, "Ahmad Fauzan");
  assert.equal(first.signatoryName, "Siti Aminah");
  assert.equal(first.signatoryTitle, "Kepala Sekolah");
  assert.equal(issued.pdfUrl, null, "generated PDF must not be persisted publicly");
  await expectRejects(NotFoundException, () => service.getMedicalReferralLetter(registration.id, outsider));
  registration.status = "documents_uploaded";
  await expectRejects(BadRequestException, () => service.getMedicalReferralLetter(registration.id, owner));
  registration.status = "medical_pending";
  const incompleteUnitClient = { getLetterhead: async () => ({ unitId: registration.period.unitId, unitName: "SDIT Alfida", logoUrl: null, principalName: null, principalSignatureUrl: null }) } as unknown as UnitLetterheadClient;
  const fallback = await new LettersService(prisma, incompleteUnitClient, foundationClient).getMedicalReferralLetter(registration.id, owner);
  assert.equal(fallback.unitLogoUrl, null, "foundation fallback must not impersonate a missing unit logo");
  assert.equal(fallback.signatoryName, "Ahmad Yusuf");
  assert.equal(fallback.signatoryTitle, "Ketua Yayasan");
  assert.equal(fallback.letterheadMode, "foundation_fallback");
  const incompleteFoundationClient = { getBranding: async () => ({ foundationName: "Yayasan Alfida", logoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/logo.png", chairmanName: null, chairmanSignatureUrl: null }) } as unknown as FoundationBrandingClient;
  await expectRejects(ConflictException, () => new LettersService(prisma, incompleteUnitClient, incompleteFoundationClient).getMedicalReferralLetter(registration.id, owner));
  console.log("SPMB medical referral letter contract passed");
}

void main();
