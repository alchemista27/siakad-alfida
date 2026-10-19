import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { ClassroomsService } from "../src/classrooms/classrooms.service";

function makeMockPrisma(state: { classrooms: any[]; academicYears: any[]; enrollments: any[]; assignments: any[]; homerooms: any[]; schedules: any[] }) {
  return {
    classroom: {
      findMany: async (args?: any) => {
        let list = [...state.classrooms];
        if (args?.where?.unitId?.in) list = list.filter((item) => args.where.unitId.in.includes(item.unitId));
        if (args?.where?.academicYearId) list = list.filter((item) => item.academicYearId === args.where.academicYearId);
        return list;
      },
      findUnique: async (args: any) => {
        if (args.where?.id) return state.classrooms.find((item) => item.id === args.where.id) ?? null;
        if (args.where?.unitId_academicYearId_name) {
          const key = args.where.unitId_academicYearId_name;
          return state.classrooms.find((item) => item.unitId === key.unitId && item.academicYearId === key.academicYearId && item.name === key.name) ?? null;
        }
        return null;
      },
      create: async (args: any) => {
        const created = { id: `class-${state.classrooms.length + 1}`, ...args.data };
        state.classrooms.push(created);
        return created;
      },
      update: async (args: any) => {
        const index = state.classrooms.findIndex((item) => item.id === args.where.id);
        state.classrooms[index] = { ...state.classrooms[index], ...args.data };
        return state.classrooms[index];
      },
      delete: async (args: any) => {
        const index = state.classrooms.findIndex((item) => item.id === args.where.id);
        return state.classrooms.splice(index, 1)[0];
      },
    },
    academicYear: { findUnique: async (args: any) => state.academicYears.find((item) => item.id === args.where.id) ?? null },
    enrollment: { count: async (args: any) => state.enrollments.filter((item) => item.classId === args.where.classId && item.status === args.where.status).length },
    teacherAssignment: { count: async (args: any) => state.assignments.filter((item) => item.classId === args.where.classId).length },
    homeroomAssignment: { count: async (args: any) => state.homerooms.filter((item) => item.classId === args.where.classId).length },
    classSchedule: { count: async (args: any) => state.schedules.filter((item) => item.classId === args.where.classId).length },
  } as any;
}

async function main() {
  const state = {
    academicYears: [{ id: "ay-1", unitId: "unit-1" }, { id: "ay-2", unitId: "unit-2" }],
    classrooms: [
      { id: "class-1", unitId: "unit-1", academicYearId: "ay-1", name: "1-A", gradeLevel: 1, capacity: 28 },
      { id: "class-delete", unitId: "unit-1", academicYearId: "ay-1", name: "1-C", gradeLevel: 1, capacity: 28 },
    ],
    enrollments: [{ id: "enrollment-1", classId: "class-1", status: "active" }],
    assignments: [], homerooms: [], schedules: [],
  };
  const service = new ClassroomsService(makeMockPrisma(state));
  const unit1Admin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };
  const unit2Admin: SiakadPrincipal = { id: "admin-2", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }] };

  assert.equal((await service.list(unit1Admin, { academicYearId: "ay-1" })).length, 2);
  await assert.rejects(() => service.list(unit2Admin, { unitId: "unit-1" }), ForbiddenException);

  const created = await service.create(unit1Admin, { unitId: "unit-1", academicYearId: "ay-1", name: "1-B", gradeLevel: 1, capacity: 28 });
  assert.equal(created.name, "1-B");
  await assert.rejects(() => service.create(unit1Admin, { unitId: "unit-1", academicYearId: "ay-1", name: "1-B", gradeLevel: 1, capacity: 28 }), BadRequestException);
  await assert.rejects(() => service.create(unit1Admin, { unitId: "unit-2", academicYearId: "ay-2", name: "1-A", gradeLevel: 1, capacity: 28 }), ForbiddenException);

  const updated = await service.update(unit1Admin, created.id, { name: "1-B Unggulan", gradeLevel: 1, capacity: 30 });
  assert.equal(updated.name, "1-B Unggulan");
  await assert.rejects(() => service.update(unit1Admin, "class-1", { capacity: 0 }), BadRequestException);
  await assert.rejects(() => service.update(unit1Admin, "class-1", { capacity: 0 + 0 }), BadRequestException);
  await assert.rejects(() => service.update(unit2Admin, created.id, { name: "Forbidden" }), ForbiddenException);

  await assert.rejects(() => service.remove(unit1Admin, "class-1"), BadRequestException);
  const removed = await service.remove(unit1Admin, "class-delete");
  assert.equal(removed.id, "class-delete");

  console.log("Classrooms contract passed");
}

void main();
