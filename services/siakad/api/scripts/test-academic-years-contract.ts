import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { AcademicYearsService } from "../src/academic-years/academic-years.service";

function makeMockPrisma(state: { academicYears: any[]; classrooms: any[]; enrollments: any[] }) {
  return {
    academicYear: {
      findMany: async (args?: any) => {
        let list = [...state.academicYears];
        if (args?.where?.unitId?.in) list = list.filter((year) => args.where.unitId.in.includes(year.unitId));
        return list;
      },
      findUnique: async (args: any) => {
        if (args.where?.id) return state.academicYears.find((year) => year.id === args.where.id) ?? null;
        if (args.where?.unitId_name) {
          const key = args.where.unitId_name;
          return state.academicYears.find((year) => year.unitId === key.unitId && year.name === key.name) ?? null;
        }
        return null;
      },
      create: async (args: any) => {
        const created = { id: `ay-${state.academicYears.length + 1}`, ...args.data };
        state.academicYears.push(created);
        return created;
      },
      update: async (args: any) => {
        const index = state.academicYears.findIndex((year) => year.id === args.where.id);
        if (index < 0) throw new Error("not found");
        state.academicYears[index] = { ...state.academicYears[index], ...args.data };
        return state.academicYears[index];
      },
      delete: async (args: any) => {
        const index = state.academicYears.findIndex((year) => year.id === args.where.id);
        if (index < 0) throw new Error("not found");
        return state.academicYears.splice(index, 1)[0];
      },
    },
    classroom: {
      count: async (args: any) => state.classrooms.filter((item) => item.academicYearId === args.where.academicYearId).length,
    },
    enrollment: {
      count: async (args: any) => state.enrollments.filter((item) => item.academicYearId === args.where.academicYearId).length,
    },
  } as any;
}

async function main() {
  const state = {
    academicYears: [
      { id: "ay-1", unitId: "unit-1", name: "2026/2027", startDate: new Date("2026-07-01"), endDate: new Date("2027-06-30"), status: "draft" },
      { id: "ay-2", unitId: "unit-2", name: "2026/2027", startDate: new Date("2026-07-01"), endDate: new Date("2027-06-30"), status: "active" },
      { id: "ay-empty", unitId: "unit-1", name: "2025/2026", startDate: new Date("2025-07-01"), endDate: new Date("2026-06-30"), status: "closed" },
    ],
    classrooms: [{ id: "class-1", academicYearId: "ay-1" }],
    enrollments: [{ id: "enrollment-1", academicYearId: "ay-1" }],
  };
  const service = new AcademicYearsService(makeMockPrisma(state));
  const unit1Admin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };
  const unit2Admin: SiakadPrincipal = { id: "admin-2", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }] };
  const superAdmin: SiakadPrincipal = { id: "super-1", roles: [{ app: "auth", role: "super_admin" }] };

  assert.deepEqual((await service.list(unit1Admin)).map((year) => year.id), ["ay-1", "ay-empty"]);
  assert.equal((await service.list(superAdmin)).length, 3);

  await assert.rejects(() => service.create(unit1Admin, {
    unitId: "unit-1", name: "invalid", startDate: "2027-07-01", endDate: "2027-07-01",
  }), BadRequestException);

  const created = await service.create(unit1Admin, {
    unitId: "unit-1", name: "2027/2028", startDate: "2027-07-01", endDate: "2028-06-30", status: "draft",
  });
  assert.equal(created.name, "2027/2028");
  await assert.rejects(() => service.create(unit1Admin, {
    unitId: "unit-1", name: "2027/2028", startDate: "2027-07-01", endDate: "2028-06-30",
  }), BadRequestException);
  await assert.rejects(() => service.create(unit1Admin, {
    unitId: "unit-2", name: "2027/2028", startDate: "2027-07-01", endDate: "2028-06-30",
  }), ForbiddenException);

  const updated = await service.update(unit1Admin, created.id, {
    name: "2027/2028 Revised", startDate: "2027-07-02", endDate: "2028-06-30", status: "active",
  });
  assert.equal(updated.name, "2027/2028 Revised");
  assert.equal(updated.status, "active");
  await assert.rejects(() => service.update(unit2Admin, created.id, { status: "closed" }), ForbiddenException);
  await assert.rejects(() => service.update(unit1Admin, created.id, { startDate: "2028-06-30", endDate: "2028-06-30" }), BadRequestException);

  await assert.rejects(() => service.remove(unit1Admin, "ay-1"), BadRequestException);
  const removed = await service.remove(unit1Admin, "ay-empty");
  assert.equal(removed.id, "ay-empty");
  assert.equal(state.academicYears.some((year) => year.id === "ay-empty"), false);

  console.log("Academic years contract passed");
}

void main();
