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
    update: async ({ data }: any) => {
      issued = { ...issued, ...data };
      return issued;
    },
  },
};
const unitClient = {
  getLetterhead: async () => ({
    unitId: registration.period.unitId,
    unitName: "SDIT Alfida",
    address: "Jl. Pendidikan No. 1",
    phone: "021-12345678",
    email: "admin@sdit.test",
    logoUrl: "https://res.cloudinary.com/example/image/upload/simpeg/unit/b2222222-2222-4222-8222-222222222222/logo/logo.png",
  }),
} as unknown as UnitLetterheadClient;
const foundationClient = { getBranding: async () => ({
  foundationName: "Yayasan Alfida",
  logoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/logo.png",
}) } as unknown as FoundationBrandingClient;

async function main() {
  const service = new LettersService(prisma, unitClient, foundationClient);
  const first = await service.getMedicalReferralLetter(registration.id, owner);
  const second = await service.getMedicalReferralLetter(registration.id, owner);
  assert.equal(first.referralNumber, second.referralNumber, "referral number must be durable");
  assert.equal(first.verificationToken, second.verificationToken, "verification token must be durable");
  assert.match(first.verificationToken, /^[a-f0-9]{64}$/i, "verification token must be opaque and high entropy");
  assert.equal(first.studentName, "Ahmad Fauzan");
  assert.equal(first.unitAddress, "Jl. Pendidikan No. 1");
  assert.equal(first.unitPhone, "021-12345678");
  assert.equal(first.unitEmail, "admin@sdit.test");
  assert.equal(issued.pdfUrl, null, "generated PDF must not be persisted publicly");
  assert.equal("signatoryName" in first, false, "medical referral must not expose a signatory name");
  assert.equal("signatorySignatureUrl" in first, false, "medical referral must not expose a signature asset");

  const assetlessUnitClient = {
    getLetterhead: async () => ({
      unitId: registration.period.unitId,
      unitName: "SDIT Alfida",
      address: null,
      phone: null,
      email: null,
      logoUrl: null,
    }),
  } as unknown as UnitLetterheadClient;
  const assetlessFoundationClient = {
    getBranding: async () => ({ foundationName: "Yayasan Alfida", logoUrl: null }),
  } as unknown as FoundationBrandingClient;
  const assetless = await new LettersService(prisma, assetlessUnitClient, assetlessFoundationClient)
    .getMedicalReferralLetter(registration.id, owner);
  assert.equal(assetless.unitLogoUrl, null, "missing unit logo must stay absent");
  assert.equal(assetless.foundationLogoUrl, null, "missing foundation logo must stay absent");
  assert.equal(assetless.unitAddress, null);
  assert.equal(assetless.unitPhone, null);
  assert.equal(assetless.unitEmail, null);

  const unavailable = await new LettersService(
    prisma,
    { getLetterhead: async () => { throw new Error("unavailable"); } } as unknown as UnitLetterheadClient,
    { getBranding: async () => { throw new Error("unavailable"); } } as unknown as FoundationBrandingClient,
  ).getMedicalReferralLetter(registration.id, owner);
  assert.equal(unavailable.unitName, registration.period.unitName, "unavailable optional profile must fall back to registration unit");
  assert.equal(unavailable.foundationName, "Yayasan Alfida", "unavailable branding must use a text fallback");
  assert.equal(unavailable.unitLogoUrl, null);
  assert.equal(unavailable.foundationLogoUrl, null);

  await expectRejects(ConflictException, () => new LettersService(
    prisma,
    { getLetterhead: async () => ({ unitId: "wrong-unit", unitName: "Lain", address: null, phone: null, email: null, logoUrl: null }) } as unknown as UnitLetterheadClient,
    assetlessFoundationClient,
  ).getMedicalReferralLetter(registration.id, owner));

  await expectRejects(NotFoundException, () => service.getMedicalReferralLetter(registration.id, outsider));
  registration.status = "documents_uploaded";
  await expectRejects(BadRequestException, () => service.getMedicalReferralLetter(registration.id, owner));
  registration.status = "medical_pending";
  console.log("SPMB medical referral letter contract passed");
}

void main();
