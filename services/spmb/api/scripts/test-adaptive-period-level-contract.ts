import { BadRequestException } from "@nestjs/common";
import type { SpmbPrincipal } from "../src/common/spmb-scope-policy";
import { PeriodsService } from "../src/periods/periods.service";

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

const unitId = "11111111-1111-4111-8111-111111111111";
const admin: SpmbPrincipal = { id: "admin", roles: [{ app: "spmb", role: "admin_unit", unitId }] };

async function run() {
  let created: any = null;
  const service = new PeriodsService({
    admissionPeriod: {
      findFirst: async () => null,
      create: async ({ data }: any) => {
        created = data;
        return { id: "period-1", ...data };
      },
    },
  } as any);

  const base = { unitName: "TK Auladuna", unitSlug: "tk-auladuna", label: "2027/2028" };
  await expectBadRequest("missing education level", () => service.create(base as any, admin));
  await service.create({ ...base, educationLevel: "tk" } as any, admin);
  assert(created?.educationLevel === "tk" && created?.tkGroup === null, "TK period without fixed group must let parents choose A or B later");
  await expectBadRequest("non-TK with group", () => service.create({ ...base, educationLevel: "sd", tkGroup: "a" } as any, admin));

  await service.create({ ...base, educationLevel: "tk", tkGroup: "b" } as any, admin);
  assert(created?.educationLevel === "tk" && created?.tkGroup === "b", "a fixed TK group remains supported for a dedicated period");

  let updateCalled = false;
  const periodWithRegistration = new PeriodsService({
    admissionPeriod: {
      findUnique: async () => ({ id: "period-1", unitId, isOpen: false, opensAt: null, closesAt: null, educationLevel: "sd", tkGroup: null, _count: { registrations: 1, schedules: 0 } }),
      update: async () => {
        updateCalled = true;
        return {};
      },
    },
  } as any);
  await expectBadRequest("level update after registration", () => periodWithRegistration.update("period-1", { educationLevel: "smp" } as any, admin));
  assert(!updateCalled, "period level must be immutable after registrations exist");

  console.log("SPMB adaptive period-level contract passed");
}

void run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
