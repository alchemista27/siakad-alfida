import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { TeachingWorkflowService } from "../src/teaching/teaching-workflow.service";

function makeMockPrisma(state: any) {
  const findAssignment = (id: string) => {
    const assignment = state.assignments.find((item: any) => item.id === id);
    return assignment && { ...assignment, classroom: state.classrooms.find((item: any) => item.id === assignment.classId) };
  };
  return {
    teacherAssignment: { findUnique: async (args: any) => findAssignment(args.where.id) ?? null },
    classSchedule: {
      findUnique: async (args: any) => {
        const schedule = state.schedules.find((item: any) => item.id === args.where.id);
        return schedule && { ...schedule, classroom: state.classrooms.find((item: any) => item.id === schedule.classId) };
      },
    },
    enrollment: {
      findMany: async (args: any) => state.enrollments
        .filter((item: any) => item.classId === args.where.classId && item.academicYearId === args.where.academicYearId && item.status === args.where.status)
        .map((item: any) => ({ ...item, student: state.students.find((student: any) => student.id === item.studentId) })),
    },
    grade: {
      findMany: async (args: any) => state.grades.filter((item: any) => item.teacherAssignmentId === args.where.teacherAssignmentId),
      upsert: async (args: any) => {
        const key = args.where.enrollmentId_teacherAssignmentId_category_label;
        const index = state.grades.findIndex((item: any) => item.enrollmentId === key.enrollmentId && item.teacherAssignmentId === key.teacherAssignmentId && item.category === key.category && item.label === key.label);
        if (index >= 0) {
          state.grades[index] = { ...state.grades[index], ...args.update };
          return state.grades[index];
        }
        const created = { id: `grade-${state.grades.length + 1}`, ...args.create };
        state.grades.push(created);
        return created;
      },
    },
    teachingJournal: {
      findMany: async (args: any) => state.journals.filter((item: any) => item.teacherAssignmentId === args.where.teacherAssignmentId),
      findUnique: async (args: any) => state.journals.find((item: any) => item.id === args.where.id) ?? null,
      create: async (args: any) => {
        const created = { id: `journal-${state.journals.length + 1}`, ...args.data };
        state.journals.push(created);
        return created;
      },
      update: async (args: any) => {
        const index = state.journals.findIndex((item: any) => item.id === args.where.id);
        state.journals[index] = { ...state.journals[index], ...args.data };
        return state.journals[index];
      },
      delete: async (args: any) => state.journals.splice(state.journals.findIndex((item: any) => item.id === args.where.id), 1)[0],
    },
  } as any;
}

async function main() {
  const state = {
    classrooms: [{ id: "class-1", unitId: "unit-1", academicYearId: "year-1" }, { id: "class-other", unitId: "unit-1", academicYearId: "year-1" }],
    assignments: [{ id: "assignment-1", classId: "class-1", subjectId: "subject-1", academicYearId: "year-1", teacherUserId: "teacher-1" }],
    schedules: [{ id: "schedule-1", classId: "class-1", subjectId: "subject-1" }, { id: "schedule-wrong", classId: "class-other", subjectId: "subject-1" }],
    students: [{ id: "student-1", fullName: "Alya" }, { id: "student-2", fullName: "Bima" }],
    enrollments: [
      { id: "enrollment-1", studentId: "student-1", classId: "class-1", academicYearId: "year-1", status: "active" },
      { id: "enrollment-2", studentId: "student-2", classId: "class-1", academicYearId: "year-1", status: "active" },
      { id: "enrollment-foreign", studentId: "student-1", classId: "class-other", academicYearId: "year-1", status: "active" },
    ],
    grades: [] as any[],
    journals: [] as any[],
  };
  const service = new TeachingWorkflowService(makeMockPrisma(state));
  const teacher: SiakadPrincipal = { id: "teacher-1", roles: [{ app: "siakad", role: "guru", unitId: "unit-1" }] };
  const otherTeacher: SiakadPrincipal = { id: "teacher-2", roles: [{ app: "siakad", role: "guru", unitId: "unit-1" }] };

  const savedGrades = await service.batchGrades(teacher, "assignment-1", {
    items: [
      { enrollmentId: "enrollment-1", category: "daily", label: "Kuis 1", score: 85 },
      { enrollmentId: "enrollment-2", category: "daily", label: "Kuis 1", score: 92, feedback: "Bagus" },
    ],
  });
  assert.equal(savedGrades.length, 2);
  await service.batchGrades(teacher, "assignment-1", { items: [{ enrollmentId: "enrollment-1", category: "daily", label: "Kuis 1", score: 90 }] });
  assert.equal(state.grades.length, 2);
  assert.equal(state.grades[0].score, 90);

  const gradeGrid = await service.listGrades(teacher, "assignment-1");
  assert.equal(gradeGrid.roster.length, 2);
  assert.equal(gradeGrid.grades.length, 2);
  await assert.rejects(() => service.batchGrades(teacher, "assignment-1", { items: [{ enrollmentId: "enrollment-foreign", category: "daily", label: "Kuis 1", score: 80 }] }), BadRequestException);
  await assert.rejects(() => service.batchGrades(teacher, "assignment-1", { items: [{ enrollmentId: "enrollment-1", category: "daily", label: "", score: 80 }] }), BadRequestException);
  await assert.rejects(() => service.batchGrades(teacher, "assignment-1", { items: [{ enrollmentId: "enrollment-1", category: "daily", label: "Kuis 2", score: 101 }] }), BadRequestException);
  await assert.rejects(() => service.listGrades(otherTeacher, "assignment-1"), ForbiddenException);

  const journal = await service.createJournal(teacher, "assignment-1", {
    date: "2026-10-15",
    scheduleId: "schedule-1",
    topic: "Persamaan kuadrat",
    studentCountPresent: 28,
    studentCountAbsent: 0,
  });
  assert.equal(journal.topic, "Persamaan kuadrat");
  assert.deepEqual((await service.listJournals(teacher, "assignment-1")).map((item: any) => item.id), [journal.id]);
  await assert.rejects(() => service.createJournal(teacher, "assignment-1", { date: "2026-10-15", scheduleId: "schedule-wrong", topic: "Tidak sah" }), BadRequestException);
  assert.equal((await service.updateJournal(teacher, journal.id, { topic: "Persamaan kuadrat lanjutan" })).topic, "Persamaan kuadrat lanjutan");
  assert.equal((await service.removeJournal(teacher, journal.id)).id, journal.id);

  console.log("Teaching workflow contract passed");
}

void main();
