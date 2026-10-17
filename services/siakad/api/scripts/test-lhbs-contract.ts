import assert from "node:assert/strict";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { LhbsService } from "../src/lhbs/lhbs.service";

function makeMockPrisma(state: {
  lhbsReports: any[];
  enrollments: any[];
  homeroomAssignments: any[];
}) {
  return {
    lhbsReport: {
      findUnique: async (args: any) => {
        const item = state.lhbsReports.find((r) => r.id === args.where.id);
        if (!item) return null;
        const enrollment = state.enrollments.find((e) => e.id === item.enrollmentId);
        return { ...item, enrollment };
      },
      create: async (args: any) => {
        const item = { id: `lhbs-${state.lhbsReports.length + 1}`, ...args.data };
        state.lhbsReports.push(item);
        return item;
      },
      update: async (args: any) => {
        const idx = state.lhbsReports.findIndex((r) => r.id === args.where.id);
        state.lhbsReports[idx] = { ...state.lhbsReports[idx], ...args.data };
        return state.lhbsReports[idx];
      },
    },
    homeroomAssignment: {
      findUnique: async (args: any) => {
        return state.homeroomAssignments.find((h) => h.id === args.where.id) ?? null;
      },
    },
  } as any;
}

async function main() {
  const state = {
    homeroomAssignments: [
      { id: "hr-1", classId: "cls-1", academicYearId: "ay-1", teacherUserId: "teacher-wali" },
    ],
    enrollments: [
      { id: "enr-1", studentId: "std-1", academicYearId: "ay-1", classId: "cls-1", parentUserId: "parent-1" },
    ],
    lhbsReports: [
      {
        id: "lhbs-1",
        enrollmentId: "enr-1",
        academicYearId: "ay-1",
        homeroomAssignmentId: "hr-1",
        semester: 1,
        status: "draft",
        teacherNotes: "Perlu ditingkatkan presensinya.",
      },
    ],
  };

  const prisma = makeMockPrisma(state);
  const service = new LhbsService(prisma);

  const assignedWali: SiakadPrincipal = {
    id: "teacher-wali",
    roles: [
      {
        app: "siakad",
        role: "wali_kelas",
        assignmentId: "hr-1",
      },
    ],
  };

  const otherTeacher: SiakadPrincipal = {
    id: "teacher-other",
    roles: [
      {
        app: "siakad",
        role: "guru",
        assignmentId: "other",
      },
    ],
  };

  const parent: SiakadPrincipal = {
    id: "parent-1",
    roles: [
      {
        app: "siakad",
        role: "orang_tua",
      },
    ],
  };

  // 1. Assigned wali kelas publishes LHBS
  const published = await service.publishLhbs(assignedWali, "lhbs-1");
  assert.equal(published.status, "published");

  // 2. Other teacher cannot publish LHBS
  await assert.rejects(
    () => service.publishLhbs(otherTeacher, "lhbs-1"),
    ForbiddenException,
  );

  // 3. Parent can view published LHBS for their child
  const parentView = await service.getReportForParent(parent, "lhbs-1");
  assert.equal(parentView.id, "lhbs-1");

  console.log("LHBS workflow contract passed");
}

void main();
