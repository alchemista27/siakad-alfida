import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { AssignmentsService } from "../src/assignments/assignments.service";

function makeMockPrisma(state: any) {
  const withRelations = (assignment: any) => assignment && ({
    ...assignment,
    classroom: state.classrooms.find((item: any) => item.id === assignment.classId),
    academicYear: state.academicYears.find((item: any) => item.id === assignment.academicYearId),
    subject: state.subjects.find((item: any) => item.id === assignment.subjectId),
    teacher: state.users.find((item: any) => item.id === assignment.teacherUserId),
  });
  const client: any = {
    academicYear: { findUnique: async (args: any) => state.academicYears.find((item: any) => item.id === args.where.id) ?? null },
    classroom: { findUnique: async (args: any) => state.classrooms.find((item: any) => item.id === args.where.id) ?? null },
    subject: { findUnique: async (args: any) => state.subjects.find((item: any) => item.id === args.where.id) ?? null },
    userProjection: { findUnique: async (args: any) => state.users.find((item: any) => item.id === args.where.id) ?? null },
    teacherAssignment: {
      findMany: async () => state.teacherAssignments.map(withRelations),
      findUnique: async (args: any) => withRelations(state.teacherAssignments.find((item: any) => item.id === args.where.id)),
      findFirst: async (args: any) => withRelations(state.teacherAssignments.find((item: any) =>
        item.classId === args.where.classId && item.subjectId === args.where.subjectId && item.academicYearId === args.where.academicYearId,
      )),
      create: async (args: any) => {
        const created = { id: `teacher-assignment-${state.teacherAssignments.length + 1}`, ...args.data };
        state.teacherAssignments.push(created);
        return withRelations(created);
      },
      update: async (args: any) => {
        const index = state.teacherAssignments.findIndex((item: any) => item.id === args.where.id);
        state.teacherAssignments[index] = { ...state.teacherAssignments[index], ...args.data };
        return withRelations(state.teacherAssignments[index]);
      },
      delete: async (args: any) => {
        const index = state.teacherAssignments.findIndex((item: any) => item.id === args.where.id);
        return withRelations(state.teacherAssignments.splice(index, 1)[0]);
      },
    },
    homeroomAssignment: {
      findMany: async () => state.homeroomAssignments.map(withRelations),
      findUnique: async (args: any) => withRelations(state.homeroomAssignments.find((item: any) => item.id === args.where.id)),
      findFirst: async (args: any) => withRelations(state.homeroomAssignments.find((item: any) => item.classId === args.where.classId && item.academicYearId === args.where.academicYearId)),
      create: async (args: any) => {
        const created = { id: `homeroom-assignment-${state.homeroomAssignments.length + 1}`, ...args.data };
        state.homeroomAssignments.push(created);
        return withRelations(created);
      },
      update: async (args: any) => {
        const index = state.homeroomAssignments.findIndex((item: any) => item.id === args.where.id);
        state.homeroomAssignments[index] = { ...state.homeroomAssignments[index], ...args.data };
        return withRelations(state.homeroomAssignments[index]);
      },
      delete: async (args: any) => {
        const index = state.homeroomAssignments.findIndex((item: any) => item.id === args.where.id);
        return withRelations(state.homeroomAssignments.splice(index, 1)[0]);
      },
    },
  };
  return client;
}

async function main() {
  const state = {
    academicYears: [{ id: "ay-1", unitId: "unit-1" }, { id: "ay-2", unitId: "unit-2" }],
    classrooms: [
      { id: "class-1", unitId: "unit-1", academicYearId: "ay-1" },
      { id: "class-2", unitId: "unit-1", academicYearId: "ay-1" },
      { id: "class-foreign", unitId: "unit-2", academicYearId: "ay-2" },
    ],
    subjects: [{ id: "subject-1", unitId: "unit-1" }, { id: "subject-2", unitId: "unit-1" }, { id: "subject-foreign", unitId: "unit-2" }],
    users: [
      { id: "teacher-1", status: "active", roles: [{ app: "siakad", role: "guru" }] },
      { id: "teacher-2", status: "active", roles: [{ app: "siakad", role: "guru" }] },
      { id: "not-a-teacher", status: "active", roles: [{ app: "siakad", role: "orang_tua" }] },
    ],
    teacherAssignments: [{ id: "teacher-assignment-1", academicYearId: "ay-1", classId: "class-1", subjectId: "subject-1", teacherUserId: "teacher-1" }],
    homeroomAssignments: [{ id: "homeroom-assignment-1", academicYearId: "ay-1", classId: "class-1", teacherUserId: "teacher-1" }],
  };
  const service = new AssignmentsService(makeMockPrisma(state));
  const unitAdmin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };
  const foreignAdmin: SiakadPrincipal = { id: "admin-2", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }] };

  assert.deepEqual((await service.listTeacherAssignments(unitAdmin, {})).map((item) => item.id), ["teacher-assignment-1"]);
  await assert.rejects(() => service.createTeacherAssignment(unitAdmin, { academicYearId: "ay-1", classId: "class-1", subjectId: "subject-1", teacherUserId: "teacher-2" }), BadRequestException);
  await assert.rejects(() => service.createTeacherAssignment(unitAdmin, { academicYearId: "ay-1", classId: "class-1", subjectId: "subject-2", teacherUserId: "not-a-teacher" }), BadRequestException);
  await assert.rejects(() => service.createTeacherAssignment(unitAdmin, { academicYearId: "ay-2", classId: "class-foreign", subjectId: "subject-foreign", teacherUserId: "teacher-1" }), ForbiddenException);

  const teacherAssignment = await service.createTeacherAssignment(unitAdmin, { academicYearId: "ay-1", classId: "class-1", subjectId: "subject-2", teacherUserId: "teacher-1" });
  assert.equal(teacherAssignment.teacherUserId, "teacher-1");
  const reassignedTeacher = await service.updateTeacherAssignment(unitAdmin, teacherAssignment.id, { teacherUserId: "teacher-2" });
  assert.equal(reassignedTeacher.teacherUserId, "teacher-2");
  assert.equal((await service.removeTeacherAssignment(unitAdmin, teacherAssignment.id)).id, teacherAssignment.id);
  await assert.rejects(() => service.removeTeacherAssignment(foreignAdmin, "teacher-assignment-1"), ForbiddenException);

  assert.deepEqual((await service.listHomeroomAssignments(unitAdmin, {})).map((item) => item.id), ["homeroom-assignment-1"]);
  await assert.rejects(() => service.createHomeroomAssignment(unitAdmin, { academicYearId: "ay-1", classId: "class-1", teacherUserId: "teacher-2" }), BadRequestException);
  const homeroom = await service.createHomeroomAssignment(unitAdmin, { academicYearId: "ay-1", classId: "class-2", teacherUserId: "teacher-1" });
  const reassignedHomeroom = await service.updateHomeroomAssignment(unitAdmin, homeroom.id, { teacherUserId: "teacher-2" });
  assert.equal(reassignedHomeroom.teacherUserId, "teacher-2");
  assert.equal((await service.removeHomeroomAssignment(unitAdmin, homeroom.id)).id, homeroom.id);

  console.log("Assignments contract passed");
}

void main();
