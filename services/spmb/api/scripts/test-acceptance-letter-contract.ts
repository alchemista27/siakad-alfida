import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";
import { LettersController } from "../src/letters/letters.controller";
import type { FoundationBrandingClient } from "../src/letters/foundation-branding.client";
import { LettersService } from "../src/letters/letters.service";
import type { UnitLetterheadClient } from "../src/letters/unit-letterhead.client";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function expectRejects<T extends Error>(
  label: string,
  Exception: new (...args: any[]) => T,
  action: () => Promise<unknown>,
) {
  try {
    await action();
  } catch (error) {
    assert(error instanceof Exception, `${label}: expected ${Exception.name}, got ${(error as Error)?.name}`);
    return;
  }
  throw new Error(`${label}: expected ${Exception.name} to be thrown`);
}

const ownerParent: SpmbPrincipal = { id: "parent-1", roles: [{ role: "orang_tua", unitId: null }] };
const otherParent: SpmbPrincipal = { id: "parent-2", roles: [{ role: "orang_tua", unitId: null }] };

const registrations = [
  {
    id: "reg-accepted",
    registrationNumber: "SPMB-2026-SDIT-0001",
    parentId: "parent-1",
    status: "accepted",
    period: { id: "period-1", unitId: "unit-1", unitName: "SDIT Alfida", label: "2026/2027" },
    studentData: { fullName: "Ahmad Fauzan", gender: "male", birthPlace: "Bekasi", birthDate: new Date("2019-04-10") },
    events: [{ toStatus: "accepted", note: "Diterima gelombang 1", createdAt: new Date("2026-06-01T08:00:00Z") }],
  },
  {
    id: "reg-rejected",
    registrationNumber: "SPMB-2026-SDIT-0002",
    parentId: "parent-1",
    status: "rejected",
    period: { id: "period-1", unitId: "unit-1", unitName: "SDIT Alfida", label: "2026/2027" },
    studentData: { fullName: "Budi", gender: "male", birthPlace: "Bekasi", birthDate: new Date("2019-05-10") },
    events: [],
  },
];

const prisma: any = {
  registration: {
    findUnique: async ({ where }: any) => registrations.find((r) => r.id === where.id) ?? null,
  },
};

const unitLetterheadClient = {
  getLetterhead: async (unitId: string) => ({
    unitId,
    unitName: "SDIT Alfida",
    address: "Jl. Pendidikan No. 1, Bekasi",
    phone: "021-123456",
    email: "sdit@example.test",
    logoUrl: "https://res.cloudinary.com/example/image/upload/spmb/unit/unit-1/logo.png",
  }),
} as unknown as UnitLetterheadClient;

const foundationBrandingClient = {
  getBranding: async () => ({
    foundationName: "Yayasan Alfida",
    address: "Jl. Yayasan No. 1, Bekasi",
    phone: "021-999999",
    email: "info@alfida.example",
    logoUrl: "https://res.cloudinary.com/example/image/upload/foundation/logo/alfida.png",
  }),
} as unknown as FoundationBrandingClient;

const wrongUnitClient = {
  getLetterhead: async () => ({
    unitId: "other-unit",
    unitName: "Sekolah Lain",
    address: null,
    phone: null,
    email: null,
    logoUrl: null,
  }),
} as unknown as UnitLetterheadClient;

async function main() {
  const service = new LettersService(prisma, unitLetterheadClient, foundationBrandingClient);
  const controller = new LettersController(service);

  // 1. Foreign parent gets 404
  await expectRejects("foreign parent gets 404", NotFoundException, () =>
    controller.getAcceptanceLetter("reg-accepted", { user: otherParent }),
  );

  // 2. Non-accepted registration cannot generate acceptance letter
  await expectRejects("rejected registration cannot get acceptance letter", BadRequestException, () =>
    controller.getAcceptanceLetter("reg-rejected", { user: ownerParent }),
  );

  // 3. Owner of accepted registration gets acceptance letter payload
  const letter = await controller.getAcceptanceLetter("reg-accepted", { user: ownerParent });
  assert(letter.registrationNumber === "SPMB-2026-SDIT-0001", "letter must include registrationNumber");
  assert(letter.studentName === "Ahmad Fauzan", "letter must include studentName");
  assert(letter.unitName === "SDIT Alfida", "letter must include unitName");
  assert(letter.unitAddress === "Jl. Pendidikan No. 1, Bekasi", "letter must include SIMPEG unit address");
  assert(letter.unitPhone === "021-123456", "letter must include SIMPEG unit phone");
  assert(letter.unitEmail === "sdit@example.test", "letter must include SIMPEG unit email");
  assert(letter.unitLogoUrl?.includes("/unit/unit-1/"), "letter must include the SIMPEG unit logo");
  assert(letter.letterheadKind === "unit", "complete unit profile must render a unit letterhead");
  assert(letter.foundationName === "Yayasan Alfida", "letter must include the Admin foundation name");
  assert(letter.foundationAddress === "Jl. Yayasan No. 1, Bekasi", "letter must include the Admin foundation address");
  assert(letter.foundationPhone === "021-999999", "letter must include the Admin foundation phone");
  assert(letter.foundationEmail === "info@alfida.example", "letter must include the Admin foundation email");
  assert(letter.foundationLogoUrl?.includes("/foundation/logo/"), "letter must include the Admin foundation logo");

  await expectRejects("mismatched SIMPEG unit cannot issue acceptance letter", ConflictException, () =>
    new LettersService(prisma, wrongUnitClient, foundationBrandingClient).getAcceptanceLetter("reg-accepted", ownerParent),
  );

  console.log("SPMB acceptance letter contract passed");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
