import assert from "node:assert/strict";
import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { LhbsPdfService } from "../src/lhbs/lhbs-pdf.service";
import { LhbsService } from "../src/lhbs/lhbs.service";

function makeMockPrisma(state: any) {
  const client: any = {
    enrollment: {
      findUnique: async ({ where }: any) => {
        const enrollment = state.enrollments.find((item: any) => item.id === where.id);
        if (!enrollment) return null;
        return {
          ...enrollment,
          student: state.students.find((item: any) => item.id === enrollment.studentId),
          classroom: state.classrooms.find((item: any) => item.id === enrollment.classId),
        };
      },
    },
    homeroomAssignment: {
      findFirst: async ({ where }: any) => state.homeroomAssignments.find((item: any) => item.classId === where.classId && item.academicYearId === where.academicYearId) ?? null,
      findUnique: async ({ where }: any) => state.homeroomAssignments.find((item: any) => item.id === where.id) ?? null,
    },
    attendance: { findMany: async ({ where }: any) => state.attendances.filter((item: any) => item.enrollmentId === where.enrollmentId) },
    grade: {
      findMany: async ({ where }: any) => state.grades.filter((item: any) => item.enrollmentId === where.enrollmentId).map((grade: any) => ({
        ...grade,
        teacherAssignment: {
          ...state.assignments.find((item: any) => item.id === grade.teacherAssignmentId),
          subject: state.subjects.find((item: any) => item.id === state.assignments.find((item: any) => item.id === grade.teacherAssignmentId)?.subjectId),
        },
      })),
    },
    extracurricularMembership: {
      findMany: async ({ where }: any) => state.memberships.filter((item: any) => item.studentId === where.studentId).map((membership: any) => ({
        ...membership,
        extracurricular: state.extracurriculars.find((item: any) => item.id === membership.extracurricularId),
        grades: state.extraGrades.filter((item: any) => item.membershipId === membership.id && item.semester === where.grades.some.semester),
      })),
    },
    lhbsReport: {
      findUnique: async ({ where }: any) => {
        const report = where.id
          ? state.reports.find((item: any) => item.id === where.id)
          : state.reports.find((item: any) => item.enrollmentId === where.enrollmentId_academicYearId_semester.enrollmentId && item.academicYearId === where.enrollmentId_academicYearId_semester.academicYearId && item.semester === where.enrollmentId_academicYearId_semester.semester);
        if (!report) return null;
        const enrollment = state.enrollments.find((item: any) => item.id === report.enrollmentId);
        return {
          ...report,
          enrollment: enrollment && { ...enrollment, student: state.students.find((item: any) => item.id === enrollment.studentId), classroom: state.classrooms.find((item: any) => item.id === enrollment.classId) },
          homeroomAssignment: state.homeroomAssignments.find((item: any) => item.id === report.homeroomAssignmentId),
        };
      },
      create: async ({ data }: any) => {
        const report = { id: `report-${state.reports.length + 1}`, ...data };
        state.reports.push(report);
        return report;
      },
      update: async ({ where, data }: any) => {
        const index = state.reports.findIndex((item: any) => item.id === where.id);
        state.reports[index] = { ...state.reports[index], ...data };
        return state.reports[index];
      },
    },
  };
  return client;
}

async function main() {
  const state = {
    students: [{ id: "student-1", unitId: "unit-1", fullName: "<img src=x onerror=alert(1)>", parentUserId: "parent-1" }],
    classrooms: [{ id: "class-1", unitId: "unit-1", academicYearId: "year-1", name: "VII A", gradeLevel: 7 }],
    enrollments: [{ id: "enrollment-1", studentId: "student-1", academicYearId: "year-1", classId: "class-1", status: "active" }],
    homeroomAssignments: [{ id: "homeroom-1", classId: "class-1", academicYearId: "year-1", teacherUserId: "teacher-1" }],
    attendances: [{ enrollmentId: "enrollment-1", status: "present" }, { enrollmentId: "enrollment-1", status: "sick" }, { enrollmentId: "enrollment-1", status: "absent" }],
    assignments: [{ id: "assignment-math", subjectId: "subject-math" }],
    subjects: [{ id: "subject-math", name: "Matematika" }],
    grades: [
      { enrollmentId: "enrollment-1", teacherAssignmentId: "assignment-math", category: "daily", label: "Kuis 1", score: 80 },
      { enrollmentId: "enrollment-1", teacherAssignmentId: "assignment-math", category: "daily", label: "Kuis 2", score: 90 },
      { enrollmentId: "enrollment-1", teacherAssignmentId: "assignment-math", category: "final", label: "PAS", score: 88 },
    ],
    extracurriculars: [{ id: "extra-1", academicYearId: "year-1", name: "Pramuka" }],
    memberships: [{ id: "membership-1", studentId: "student-1", extracurricularId: "extra-1" }],
    extraGrades: [{ membershipId: "membership-1", semester: 1, grade: "A", notes: "Aktif" }],
    reports: [] as any[],
  };
  const service = new LhbsService(makeMockPrisma(state), new LhbsPdfService());
  const wali: SiakadPrincipal = { id: "teacher-1", roles: [{ app: "siakad", role: "wali_kelas", unitId: "unit-1" }] };
  const otherTeacher: SiakadPrincipal = { id: "teacher-2", roles: [{ app: "siakad", role: "wali_kelas", unitId: "unit-1" }] };
  const parent: SiakadPrincipal = { id: "parent-1", roles: [{ app: "siakad", role: "orang_tua" }] };
  const stranger: SiakadPrincipal = { id: "parent-2", roles: [{ app: "siakad", role: "orang_tua" }] };

  await assert.rejects(() => service.compileDraft(otherTeacher, { enrollmentId: "enrollment-1", semester: 1 }), ForbiddenException);
  const draft = await service.compileDraft(wali, { enrollmentId: "enrollment-1", semester: 1 });
  assert.equal(draft.status, "draft");
  assert.deepEqual(draft.summary.attendance, { present: 1, sick: 1, excused: 0, absent: 1 });
  assert.deepEqual(draft.summary.subjectGrades[0], {
    subjectId: "subject-math",
    subjectName: "Matematika",
    categories: { daily: 85, final: 88 },
    labels: [
      { category: "daily", label: "Kuis 1", score: 80 },
      { category: "daily", label: "Kuis 2", score: 90 },
      { category: "final", label: "PAS", score: 88 },
    ],
  });
  assert.deepEqual(draft.summary.extracurricularGrades, [{ extracurricularId: "extra-1", extracurricularName: "Pramuka", grade: "A", notes: "Aktif" }]);

  state.grades[0].score = 95;
  const recompiled = await service.compileDraft(wali, { enrollmentId: "enrollment-1", semester: 1 });
  assert.equal(state.reports.length, 1, "a draft recompilation must update one snapshot");
  assert.equal(recompiled.summary.subjectGrades[0].labels[0].score, 95);

  state.reports.push({ id: "incomplete", enrollmentId: "enrollment-1", academicYearId: "year-1", homeroomAssignmentId: "homeroom-1", semester: 2, status: "draft", summary: null });
  await assert.rejects(() => service.publishLhbs(wali, "incomplete"), BadRequestException);

  const published = await service.publishLhbs(wali, draft.id);
  assert.equal(published.status, "published");
  await assert.rejects(() => service.compileDraft(wali, { enrollmentId: "enrollment-1", semester: 1 }), ConflictException);
  await assert.rejects(() => service.publishLhbs(otherTeacher, draft.id), ForbiddenException);

  const parentReport = await service.getReportForParent(parent, draft.id);
  assert.equal(parentReport.enrollment.student.parentUserId, "parent-1");
  await assert.rejects(() => service.getReportForParent(stranger, draft.id), ForbiddenException);

  const pdf = await service.getPdfForParent(parent, draft.id);
  assert.ok(Buffer.isBuffer(pdf));
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.doesNotMatch(pdf.toString("utf8"), /<img|onerror|<script/i, "hostile fields must not become raw markup in a PDF response");
  await assert.rejects(() => service.getPdfForParent(stranger, draft.id), ForbiddenException);

  console.log("LHBS lifecycle contract passed");
}

void main();
