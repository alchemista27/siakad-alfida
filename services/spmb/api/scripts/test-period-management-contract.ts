import { BadRequestException, ForbiddenException, NotFoundException } from "@nestjs/common";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";
import { PeriodsController } from "../src/periods/periods.controller";
import { PeriodsService } from "../src/periods/periods.service";

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
    throw new Error(`${label}: unexpectedly succeeded`);
  } catch (error) {
    if (!(error instanceof Exception)) throw error;
  }
}

const unitA = "11111111-1111-4111-8111-111111111111";
const unitB = "22222222-2222-4222-8222-222222222222";
const yearA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const adminA: SpmbPrincipal = {
  id: "admin-a",
  roles: [{ app: "spmb", role: "admin_unit", unitId: unitA }],
};
const timPpdbA: SpmbPrincipal = {
  id: "tim-a",
  roles: [{ app: "spmb", role: "tim_ppdb", unitId: unitA }],
};
const superAdmin: SpmbPrincipal = {
  id: "super-1",
  roles: [{ app: "auth", role: "super_admin", unitId: null }],
};

async function run() {
  // 1. tim_ppdb is read-only for period mutations
  const roService = new PeriodsService({
    admissionPeriod: {
      findUnique: async () => ({ id: "period-1", unitId: unitA, isOpen: true }),
    },
  } as any);
  await expectRejects("tim_ppdb create period", ForbiddenException, () =>
    roService.create(
      {
        unitId: unitA,
        unitName: "SD",
        unitSlug: "sd",
        label: "2026/2027",
        sourceAcademicYearId: yearA,
      },
      timPpdbA,
    ),
  );
  await expectRejects("tim_ppdb update period", ForbiddenException, () =>
    roService.update("period-1", { label: "2026/2027" }, timPpdbA),
  );
  await expectRejects("tim_ppdb open period", ForbiddenException, () =>
    (roService as any).openPeriod("period-1", timPpdbA),
  );
  await expectRejects("tim_ppdb close period", ForbiddenException, () =>
    (roService as any).closePeriod("period-1", timPpdbA),
  );

  // 2. admin_unit derives unit from principal and cannot forge body unitId
  let createdData: any = null;
  const createService = new PeriodsService({
    admissionPeriod: {
      findFirst: async () => null,
      create: async ({ data }: any) => {
        createdData = data;
        return { id: "period-created", ...data };
      },
    },
  } as any);
  await createService.create(
    {
      unitId: unitB, // forged foreign unitId
      unitName: "SDIT",
      unitSlug: "sdit",
      label: "2026/2027",
      sourceAcademicYearId: yearA,
      opensAt: "2026-01-01",
      closesAt: "2026-03-01",
    },
    adminA,
  );
  assert(createdData?.unitId === unitA, "admin_unit period creation must derive unitId from single scoped principal");
  assert(createdData?.sourceAcademicYearId === yearA, "period creation must persist sourceAcademicYearId");

  // 3. opensAt must precede closesAt
  await expectRejects("invalid open/close dates", BadRequestException, () =>
    createService.create(
      {
        unitName: "SDIT",
        unitSlug: "sdit",
        label: "2026/2027",
        sourceAcademicYearId: yearA,
        opensAt: "2026-05-01",
        closesAt: "2026-03-01",
      } as any,
      adminA,
    ),
  );

  // 4. super_admin must provide explicit valid UUID unitId
  await expectRejects("super_admin missing unitId", BadRequestException, () =>
    createService.create(
      {
        unitId: "",
        unitName: "SDIT",
        unitSlug: "sdit",
        label: "2026/2027",
        sourceAcademicYearId: yearA,
      },
      superAdmin,
    ),
  );

  // 5. One active open period per unit / sourceAcademicYearId
  const duplicateActiveService = new PeriodsService({
    admissionPeriod: {
      findFirst: async () => ({ id: "existing-open", unitId: unitA, isOpen: true }),
    },
  } as any);
  await expectRejects("duplicate open period for unit", BadRequestException, () =>
    duplicateActiveService.create(
      {
        unitId: unitA,
        unitName: "SDIT",
        unitSlug: "sdit",
        label: "2026/2027 Gel 2",
        sourceAcademicYearId: yearA,
        isOpen: true,
      },
      adminA,
    ),
  );

  // 6. Explicit open and close endpoints + foreign unit concealment
  let openState = false;
  const lifecycleService = new PeriodsService({
    admissionPeriod: {
      findUnique: async ({ where }: any) =>
        where.id === "foreign"
          ? { id: "foreign", unitId: unitB, isOpen: false }
          : { id: "period-1", unitId: unitA, isOpen: openState, sourceAcademicYearId: yearA },
      findFirst: async () => null,
      update: async ({ data }: any) => {
        if (typeof data.isOpen === "boolean") openState = data.isOpen;
        return { id: "period-1", unitId: unitA, isOpen: openState };
      },
    },
  } as any);

  await expectRejects("foreign openPeriod", NotFoundException, () =>
    (lifecycleService as any).openPeriod("foreign", adminA),
  );

  const opened = await (lifecycleService as any).openPeriod("period-1", adminA);
  assert(opened.isOpen === true, "openPeriod must set isOpen=true");
  const closed = await (lifecycleService as any).closePeriod("period-1", adminA);
  assert(closed.isOpen === false, "closePeriod must set isOpen=false");

  const controller = new PeriodsController(lifecycleService);
  assert(typeof (controller as any).open === "function", "PeriodsController must expose POST :id/open");
  assert(typeof (controller as any).close === "function", "PeriodsController must expose POST :id/close");

  console.log("SPMB period management contract passed");
}

run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
