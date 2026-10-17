import assert from "node:assert/strict";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { TeachingWorkflowService } from "../src/teaching/teaching-workflow.service";

function makeMockPrisma(state: {
  assignments: any[];
  grades: any[];
  attendances: any[];
  journals: any[];
}) {
  return {
    teacherAssignment: {
      findUnique: async (args: any) => {
        return state.assignments.find((a) => a.id === args.where.id) ?? null;
      },
    },
    grade: {
      create: async (args: any) => {
        const item = { id: `grd-${state.grades.length + 1}`, ...args.data };
        state.grades.push(item);
        return item;
      },
    },
    attendance: {
      create: async (args: any) => {
        const item = { id: `att-${state.attendances.length + 1}`, ...args.data };
        state.attendances.push(item);
        return item;
      },
    },
    teachingJournal: {
      create: async (args: any) => {
        const item = { id: `jrn-${state.journals.length + 1}`, ...args.data };
        state.journals.push(item);
        return item;
      },
    },
  } as any;
}

async function main() {
  const state = {
    assignments: [
      {
        id: "asg-1",
        academicYearId: "ay-1",
        classId: "cls-1",
        subjectId: "subj-1",
        teacherUserId: "teacher-1",
      },
    ],
    grades: [] as any[],
    attendances: [] as any[],
    journals: [] as any[],
  };

  const prisma = makeMockPrisma(state);
  const service = new TeachingWorkflowService(prisma);

  const assignedTeacher: SiakadPrincipal = {
    id: "teacher-1",
    roles: [
      {
        app: "siakad",
        role: "guru",
        assignmentId: "asg-1",
      },
    ],
  };

  const unassignedTeacher: SiakadPrincipal = {
    id: "teacher-2",
    roles: [
      {
        app: "siakad",
        role: "guru",
        assignmentId: "asg-other",
      },
    ],
  };

  // 1. Assigned teacher records grade
  const grade = await service.recordGrade(assignedTeacher, {
    assignmentId: "asg-1",
    enrollmentId: "enr-1",
    category: "daily",
    score: 85,
  });
  assert.equal(grade.score, 85);

  // 2. Unassigned teacher cannot record grade for asg-1
  await assert.rejects(
    () =>
      service.recordGrade(unassignedTeacher, {
        assignmentId: "asg-1",
        enrollmentId: "enr-1",
        category: "daily",
        score: 80,
      }),
    ForbiddenException,
  );

  // 3. Assigned teacher records journal
  const journal = await service.recordJournal(assignedTeacher, {
    assignmentId: "asg-1",
    date: new Date("2026-10-15"),
    topic: "Persamaan Kuadrat",
    studentCountPresent: 28,
    studentCountAbsent: 0,
  });
  assert.equal(journal.topic, "Persamaan Kuadrat");

  console.log("Teaching workflow contract passed");
}

void main();
