import assert from "node:assert/strict";
import { ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { AcademicYearsService } from "../src/academic-years/academic-years.service";

function makeMockPrisma(state: { academicYears: any[] }) {
  return {
    academicYear: {
      findMany: async (args?: any) => {
        let list = [...state.academicYears];
        if (args?.where?.unitId) {
          if (typeof args.where.unitId === "string") {
            list = list.filter((y) => y.unitId === args.where.unitId);
          } else if (args.where.unitId.in) {
            list = list.filter((y) => args.where.unitId.in.includes(y.unitId));
          }
        }
        if (args?.where?.status) {
          list = list.filter((y) => y.status === args.where.status);
        }
        return list;
      },
      findUnique: async (args: any) => {
        if (args.where?.id) {
          return state.academicYears.find((y) => y.id === args.where.id) ?? null;
        }
        if (args.where?.unitId_name) {
          return (
            state.academicYears.find(
              (y) => y.unitId === args.where.unitId_name.unitId && y.name === args.where.unitId_name.name,
            ) ?? null
          );
        }
        return null;
      },
      create: async (args: any) => {
        const newItem = { id: `ay-${state.academicYears.length + 1}`, ...args.data };
        state.academicYears.push(newItem);
        return newItem;
      },
      update: async (args: any) => {
        const idx = state.academicYears.findIndex((y) => y.id === args.where.id);
        if (idx === -1) throw new Error("not found");
        state.academicYears[idx] = { ...state.academicYears[idx], ...args.data };
        return state.academicYears[idx];
      },
    },
  } as any;
}

async function main() {
  const state = {
    academicYears: [
      {
        id: "ay-1",
        unitId: "unit-1",
        name: "2026/2027",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2027-06-30"),
        status: "draft",
      },
      {
        id: "ay-2",
        unitId: "unit-2",
        name: "2026/2027",
        startDate: new Date("2026-07-01"),
        endDate: new Date("2027-06-30"),
        status: "active",
      },
    ],
  };

  const prisma = makeMockPrisma(state);
  const service = new AcademicYearsService(prisma);

  const unit1Admin: SiakadPrincipal = {
    id: "admin-1",
    roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }],
  };
  const unit2Admin: SiakadPrincipal = {
    id: "admin-2",
    roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }],
  };
  const superAdmin: SiakadPrincipal = {
    id: "super-1",
    roles: [{ app: "auth", role: "super_admin" }],
  };

  // 1. unit1Admin only sees unit-1 years
  const unit1List = await service.list(unit1Admin);
  assert.equal(unit1List.length, 1);
  assert.equal(unit1List[0].unitId, "unit-1");

  // 2. superAdmin sees all
  const superList = await service.list(superAdmin);
  assert.equal(superList.length, 2);

  // 3. unit1Admin cannot mutate unit-2 year
  await assert.rejects(
    () =>
      service.updateStatus(unit1Admin, "ay-2", {
        status: "closed",
      }),
    ForbiddenException,
  );

  // 4. unit1Admin can create year for unit-1
  const created = await service.create(unit1Admin, {
    unitId: "unit-1",
    name: "2027/2028",
    startDate: "2027-07-01T00:00:00.000Z",
    endDate: "2028-06-30T00:00:00.000Z",
    status: "draft",
  });
  assert.equal(created.name, "2027/2028");

  // 5. Duplicate name in same unit throws BadRequest
  await assert.rejects(
    () =>
      service.create(unit1Admin, {
        unitId: "unit-1",
        name: "2027/2028",
        startDate: "2027-07-01T00:00:00.000Z",
        endDate: "2028-06-30T00:00:00.000Z",
        status: "draft",
      }),
    BadRequestException,
  );

  // 6. unit1Admin cannot create year for unit-2
  await assert.rejects(
    () =>
      service.create(unit1Admin, {
        unitId: "unit-2",
        name: "2028/2029",
        startDate: "2028-07-01T00:00:00.000Z",
        endDate: "2029-06-30T00:00:00.000Z",
        status: "draft",
      }),
    ForbiddenException,
  );

  // 7. Transition status from draft -> active
  const activated = await service.updateStatus(unit1Admin, created.id, { status: "active" });
  assert.equal(activated.status, "active");

  console.log("Academic years contract passed");
}

void main();
