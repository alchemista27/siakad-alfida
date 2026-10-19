import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { PlacementService } from "../src/placement/placement.service";

function makeMockPrisma(state: { enrollments: any[]; classrooms: any[]; students: any[]; academicYears: any[] }) {
  const client: any = {
    enrollment: {
      findUnique: async (args: any) => {
        const item = state.enrollments.find((enrollment) => enrollment.id === args.where.id);
        return item ? { ...item, student: state.students.find((student) => student.id === item.studentId) } : null;
      },
      findMany: async (args: any) => {
        let list = [...state.enrollments];
        if (args?.where?.classId !== undefined) list = list.filter((item) => item.classId === args.where.classId);
        if (args?.where?.status) list = list.filter((item) => item.status === args.where.status);
        if (args?.where?.academicYearId) list = list.filter((item) => item.academicYearId === args.where.academicYearId);
        if (args?.where?.student?.unitId?.in) list = list.filter((item) => args.where.student.unitId.in.includes(state.students.find((student) => student.id === item.studentId)?.unitId));
        return list.map((item) => ({ ...item, student: state.students.find((student) => student.id === item.studentId) }));
      },
      count: async (args: any) => state.enrollments.filter((item) => item.classId === args.where.classId && item.status === args.where.status).length,
      update: async (args: any) => {
        const index = state.enrollments.findIndex((item) => item.id === args.where.id);
        state.enrollments[index] = { ...state.enrollments[index], ...args.data };
        return state.enrollments[index];
      },
    },
    classroom: { findUnique: async (args: any) => state.classrooms.find((item) => item.id === args.where.id) ?? null },
    academicYear: { findUnique: async (args: any) => state.academicYears.find((item) => item.id === args.where.id) ?? null },
  };
  client.$transaction = async (callback: (tx: any) => unknown) => callback(client);
  return client;
}

async function main() {
  const state = {
    students: [
      { id: "student-pending", unitId: "unit-1", fullName: "Ahmad" },
      { id: "student-active", unitId: "unit-1", fullName: "Budi" },
      { id: "student-other", unitId: "unit-2", fullName: "Cici" },
    ],
    academicYears: [{ id: "ay-1", unitId: "unit-1" }, { id: "ay-2", unitId: "unit-2" }],
    classrooms: [
      { id: "class-a", unitId: "unit-1", academicYearId: "ay-1", capacity: 1 },
      { id: "class-b", unitId: "unit-1", academicYearId: "ay-1", capacity: 2 },
      { id: "class-other", unitId: "unit-2", academicYearId: "ay-2", capacity: 30 },
    ],
    enrollments: [
      { id: "enrollment-pending", studentId: "student-pending", academicYearId: "ay-1", classId: null, status: "pending_placement" },
      { id: "enrollment-active", studentId: "student-active", academicYearId: "ay-1", classId: "class-a", status: "active" },
      { id: "enrollment-other", studentId: "student-other", academicYearId: "ay-2", classId: null, status: "pending_placement" },
    ],
  };
  const service = new PlacementService(makeMockPrisma(state));
  const unit1Admin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };

  assert.deepEqual((await service.listUnplaced(unit1Admin, { academicYearId: "ay-1" })).map((item) => item.id), ["enrollment-pending"]);
  assert.deepEqual((await service.listRoster(unit1Admin, "class-a")).map((item) => item.id), ["enrollment-active"]);

  const placed = await service.placeStudent(unit1Admin, { enrollmentId: "enrollment-pending", classId: "class-b" });
  assert.deepEqual({ classId: placed.classId, status: placed.status }, { classId: "class-b", status: "active" });
  const moved = await service.moveStudent(unit1Admin, { enrollmentId: "enrollment-active", classId: "class-b" });
  assert.equal(moved.classId, "class-b");

  state.enrollments.push({ id: "enrollment-full", studentId: "student-pending", academicYearId: "ay-1", classId: null, status: "pending_placement" });
  await assert.rejects(() => service.placeStudent(unit1Admin, { enrollmentId: "enrollment-full", classId: "class-b" }), BadRequestException);
  await assert.rejects(() => service.moveStudent(unit1Admin, { enrollmentId: "enrollment-active", classId: "class-b" }), BadRequestException);
  await assert.rejects(() => service.placeStudent(unit1Admin, { enrollmentId: "enrollment-full", classId: "class-other" }), ForbiddenException);

  console.log("Placement command contract passed");
}

void main();
