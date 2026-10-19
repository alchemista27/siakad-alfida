import assert from "node:assert/strict";
import { BadRequestException, ConflictException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { PromotionService } from "../src/promotion/promotion.service";

function makeMockPrisma(state: any) {
  const client: any = {
    enrollment: {
      findUnique: async ({ where }: any) => {
        if (where.id) {
          const enrollment = state.enrollments.find((item: any) => item.id === where.id);
          if (!enrollment) return null;
          return { ...enrollment, student: state.students.find((item: any) => item.id === enrollment.studentId), classroom: state.classrooms.find((item: any) => item.id === enrollment.classId) };
        }
        const key = where.studentId_academicYearId;
        return state.enrollments.find((item: any) => item.studentId === key.studentId && item.academicYearId === key.academicYearId) ?? null;
      },
      findMany: async ({ where }: any) => state.enrollments.filter((item: any) => item.classId === where.classId && item.academicYearId === where.academicYearId && item.status === where.status).map((item: any) => ({ ...item, student: state.students.find((student: any) => student.id === item.studentId) })),
      create: async ({ data }: any) => { const row = { id: `enrollment-${state.enrollments.length + 1}`, ...data }; state.enrollments.push(row); return row; },
      update: async ({ where, data }: any) => { const index = state.enrollments.findIndex((item: any) => item.id === where.id); state.enrollments[index] = { ...state.enrollments[index], ...data }; return state.enrollments[index]; },
    },
    academicYear: { findUnique: async ({ where }: any) => state.academicYears.find((item: any) => item.id === where.id) ?? null },
    classroom: { findUnique: async ({ where }: any) => state.classrooms.find((item: any) => item.id === where.id) ?? null },
    homeroomAssignment: { findFirst: async ({ where }: any) => state.homerooms.find((item: any) => item.classId === where.classId && item.academicYearId === where.academicYearId) ?? null },
    promotionDecision: {
      findUnique: async ({ where }: any) => state.decisions.find((item: any) => item.enrollmentId === where.enrollmentId) ?? null,
      create: async ({ data }: any) => { const row = { id: `decision-${state.decisions.length + 1}`, ...data }; state.decisions.push(row); return row; },
    },
    student: { update: async ({ where, data }: any) => { const index = state.students.findIndex((item: any) => item.id === where.id); state.students[index] = { ...state.students[index], ...data }; return state.students[index]; } },
  };
  client.$transaction = async (callback: any) => callback(client);
  return client;
}

async function main() {
  const state = {
    students: [{ id: "student-1", unitId: "unit-1", fullName: "Alya", status: "active" }, { id: "student-2", unitId: "unit-1", fullName: "Bima", status: "active" }, { id: "student-3", unitId: "unit-1", fullName: "Citra", status: "active" }],
    academicYears: [{ id: "year-1", unitId: "unit-1", status: "active" }, { id: "year-2", unitId: "unit-1", status: "draft" }, { id: "year-foreign", unitId: "unit-2", status: "active" }],
    classrooms: [
      { id: "class-7", unitId: "unit-1", academicYearId: "year-1", gradeLevel: 7 },
      { id: "class-8", unitId: "unit-1", academicYearId: "year-2", gradeLevel: 8 },
      { id: "class-7-repeat", unitId: "unit-1", academicYearId: "year-2", gradeLevel: 7 },
      { id: "class-foreign", unitId: "unit-2", academicYearId: "year-foreign", gradeLevel: 8 },
    ],
    homerooms: [{ id: "homeroom-1", classId: "class-7", academicYearId: "year-1", teacherUserId: "teacher-1" }],
    enrollments: [
      { id: "source-1", studentId: "student-1", academicYearId: "year-1", classId: "class-7", status: "active" },
      { id: "source-2", studentId: "student-2", academicYearId: "year-1", classId: "class-7", status: "active" },
      { id: "source-3", studentId: "student-3", academicYearId: "year-1", classId: "class-7", status: "active" },
    ],
    decisions: [] as any[],
  };
  const service = new PromotionService(makeMockPrisma(state));
  const wali: SiakadPrincipal = { id: "teacher-1", roles: [{ app: "siakad", role: "wali_kelas", unitId: "unit-1" }] };
  const other: SiakadPrincipal = { id: "teacher-2", roles: [{ app: "siakad", role: "wali_kelas", unitId: "unit-1" }] };

  assert.equal((await service.listRoster(wali, "class-7")).length, 3);
  await assert.rejects(() => service.decide(other, { enrollmentId: "source-1", decision: "promote", targetAcademicYearId: "year-2", targetClassId: "class-8" }), ForbiddenException);
  await assert.rejects(() => service.decide(wali, { enrollmentId: "source-1", decision: "promote" }), BadRequestException);

  const promoted = await service.decide(wali, { enrollmentId: "source-1", decision: "promote", targetAcademicYearId: "year-2", targetClassId: "class-8", notes: "Naik kelas" });
  assert.equal(promoted.decision.decision, "promote");
  assert.deepEqual({ year: promoted.targetEnrollment.academicYearId, classId: promoted.targetEnrollment.classId, status: promoted.targetEnrollment.status }, { year: "year-2", classId: "class-8", status: "active" });
  assert.equal(state.enrollments.find((item: any) => item.id === "source-1").status, "promoted");
  assert.equal(state.decisions.length, 1);
  assert.equal(state.enrollments.filter((item: any) => item.studentId === "student-1" && item.academicYearId === "year-2").length, 1);

  const repeated = await service.decide(wali, { enrollmentId: "source-1", decision: "promote", targetAcademicYearId: "year-2", targetClassId: "class-8", notes: "Naik kelas" });
  assert.equal(repeated.decision.id, promoted.decision.id, "the same command must be idempotent");
  await assert.rejects(() => service.decide(wali, { enrollmentId: "source-1", decision: "retain", targetAcademicYearId: "year-2", targetClassId: "class-7-repeat" }), ConflictException);
  await assert.rejects(() => service.decide(wali, { enrollmentId: "source-2", decision: "promote", targetAcademicYearId: "year-2", targetClassId: "class-7-repeat" }), BadRequestException);
  await assert.rejects(() => service.decide(wali, { enrollmentId: "source-2", decision: "promote", targetAcademicYearId: "year-foreign", targetClassId: "class-foreign" }), BadRequestException);

  const retained = await service.decide(wali, { enrollmentId: "source-2", decision: "retain", targetAcademicYearId: "year-2", targetClassId: "class-7-repeat" });
  assert.equal(retained.targetEnrollment.classId, "class-7-repeat");
  assert.equal(state.enrollments.find((item: any) => item.id === "source-2").status, "promoted");

  const graduated = await service.decide(wali, { enrollmentId: "source-3", decision: "graduate" });
  assert.equal(graduated.targetEnrollment, null);
  assert.equal(state.enrollments.find((item: any) => item.id === "source-3").status, "graduated");
  assert.equal(state.students.find((item: any) => item.id === "student-3").status, "graduated");

  console.log("Promotion lifecycle contract passed");
}

void main();
