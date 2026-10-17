import assert from "node:assert/strict";
import { ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { PlacementService } from "../src/placement/placement.service";

function makeMockPrisma(state: {
  enrollments: any[];
  classrooms: any[];
  students: any[];
}) {
  return {
    enrollment: {
      findUnique: async (args: any) => {
        const item = state.enrollments.find((e) => e.id === args.where.id);
        if (!item) return null;
        const student = state.students.find((s) => s.id === item.studentId);
        return { ...item, student };
      },
      findMany: async (args: any) => {
        let list = [...state.enrollments];
        if (args?.where?.classId !== undefined) {
          list = list.filter((e) => e.classId === args.where.classId);
        }
        if (args?.where?.status) {
          list = list.filter((e) => e.status === args.where.status);
        }
        return list.map((e) => ({
          ...e,
          student: state.students.find((s) => s.id === e.studentId),
        }));
      },
      count: async (args: any) => {
        let list = [...state.enrollments];
        if (args?.where?.classId) {
          list = list.filter((e) => e.classId === args.where.classId);
        }
        if (args?.where?.status) {
          list = list.filter((e) => e.status === args.where.status);
        }
        return list.length;
      },
      update: async (args: any) => {
        const idx = state.enrollments.findIndex((e) => e.id === args.where.id);
        state.enrollments[idx] = { ...state.enrollments[idx], ...args.data };
        return state.enrollments[idx];
      },
    },
    classroom: {
      findUnique: async (args: any) => {
        return state.classrooms.find((c) => c.id === args.where.id) ?? null;
      },
    },
  } as any;
}

async function main() {
  const state = {
    students: [
      { id: "std-1", unitId: "unit-1", fullName: "Ahmad" },
      { id: "std-2", unitId: "unit-2", fullName: "Budi" },
    ],
    classrooms: [
      { id: "cls-1", unitId: "unit-1", academicYearId: "ay-1", capacity: 1 },
      { id: "cls-2", unitId: "unit-2", academicYearId: "ay-2", capacity: 30 },
    ],
    enrollments: [
      {
        id: "enr-1",
        studentId: "std-1",
        academicYearId: "ay-1",
        classId: null,
        status: "pending_placement",
      },
      {
        id: "enr-2",
        studentId: "std-2",
        academicYearId: "ay-2",
        classId: null,
        status: "pending_placement",
      },
    ],
  };

  const prisma = makeMockPrisma(state);
  const service = new PlacementService(prisma);

  const unit1Admin: SiakadPrincipal = {
    id: "admin-1",
    roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }],
  };

  // 1. unit1Admin places student into cls-1
  const placed = await service.placeStudent(unit1Admin, {
    enrollmentId: "enr-1",
    classId: "cls-1",
  });
  assert.equal(placed.status, "active");
  assert.equal(placed.classId, "cls-1");

  // 2. unit1Admin cannot place into unit-2 classroom
  await assert.rejects(
    () =>
      service.placeStudent(unit1Admin, {
        enrollmentId: "enr-1",
        classId: "cls-2",
      }),
    ForbiddenException,
  );

  // 3. Placing another student into cls-1 when capacity is reached throws BadRequestException
  state.enrollments.push({
    id: "enr-3",
    studentId: "std-1",
    academicYearId: "ay-1",
    classId: null,
    status: "pending_placement",
  });
  await assert.rejects(
    () =>
      service.placeStudent(unit1Admin, {
        enrollmentId: "enr-3",
        classId: "cls-1",
      }),
    BadRequestException,
  );

  console.log("Placement command contract passed");
}

void main();
