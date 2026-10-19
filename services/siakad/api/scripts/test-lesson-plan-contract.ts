import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { LessonPlansService } from "../src/lesson-plans/lesson-plans.service";

function makeMockPrisma(state: any) {
  const assignmentWithRelations = (assignment: any) => assignment && ({
    ...assignment,
    classroom: state.classrooms.find((item: any) => item.id === assignment.classId),
    academicYear: state.years.find((item: any) => item.id === assignment.academicYearId),
    subject: state.subjects.find((item: any) => item.id === assignment.subjectId),
  });
  const planWithRelations = (plan: any) => plan && ({ ...plan, teacherAssignment: assignmentWithRelations(state.assignments.find((item: any) => item.id === plan.teacherAssignmentId)) });
  return {
    teacherAssignment: {
      findUnique: async (args: any) => assignmentWithRelations(state.assignments.find((item: any) => item.id === args.where.id)),
      findMany: async () => state.assignments.map(assignmentWithRelations),
    },
    lessonPlan: {
      findMany: async () => state.plans.map(planWithRelations),
      findUnique: async (args: any) => planWithRelations(state.plans.find((item: any) => item.id === args.where.id)),
      create: async (args: any) => {
        const created = { id: `plan-${state.plans.length + 1}`, ...args.data };
        state.plans.push(created);
        return planWithRelations(created);
      },
      update: async (args: any) => {
        const index = state.plans.findIndex((item: any) => item.id === args.where.id);
        state.plans[index] = { ...state.plans[index], ...args.data };
        return planWithRelations(state.plans[index]);
      },
      delete: async (args: any) => planWithRelations(state.plans.splice(state.plans.findIndex((item: any) => item.id === args.where.id), 1)[0]),
    },
  } as any;
}

async function main() {
  const state = {
    years: [{ id: "year-1", unitId: "unit-1" }],
    classrooms: [{ id: "class-1", unitId: "unit-1", academicYearId: "year-1" }],
    subjects: [{ id: "subject-1", unitId: "unit-1" }],
    assignments: [{ id: "assignment-1", teacherUserId: "teacher-1", classId: "class-1", subjectId: "subject-1", academicYearId: "year-1" }],
    plans: [] as any[],
  };
  const service = new LessonPlansService(makeMockPrisma(state));
  const teacher: SiakadPrincipal = { id: "teacher-1", roles: [{ app: "siakad", role: "guru", unitId: "unit-1" }] };
  const otherTeacher: SiakadPrincipal = { id: "teacher-2", roles: [{ app: "siakad", role: "guru", unitId: "unit-1" }] };
  const superAdmin: SiakadPrincipal = { id: "root", roles: [{ app: "core", role: "super_admin" }] };

  const created = await service.create(teacher, { teacherAssignmentId: "assignment-1", type: "rpp", title: "RPP Aljabar", objectives: "Memahami aljabar" });
  assert.equal(created.teacherAssignmentId, "assignment-1");
  assert.equal(created.type, "rpp");
  assert.deepEqual((await service.list(teacher)).map((plan: any) => plan.id), [created.id]);
  await assert.rejects(() => service.create(teacher, { teacherAssignmentId: "assignment-1", type: "silabus" as any, title: "Tidak sah" }), BadRequestException);
  await assert.rejects(() => service.create(otherTeacher, { teacherAssignmentId: "assignment-1", type: "prota", title: "Milik orang lain" }), ForbiddenException);
  await assert.rejects(() => service.update(otherTeacher, created.id, { title: "Diambil alih" }), ForbiddenException);
  assert.equal((await service.update(teacher, created.id, { type: "promes", title: "Program semester" })).type, "promes");
  assert.equal((await service.remove(superAdmin, created.id)).id, created.id);

  console.log("Lesson plan contract passed");
}

void main();
