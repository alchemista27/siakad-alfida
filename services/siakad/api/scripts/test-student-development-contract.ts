import assert from "node:assert/strict";
import { ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { StudentDevelopmentService } from "../src/student-development/student-development.service";

function makePrisma(state: any) {
  return {
    enrollment: {
      findUnique: async (args: any) => state.enrollments.find((item: any) => item.id === args.where.id) ?? null,
    },
    homeroomAssignment: {
      findFirst: async (args: any) => state.homerooms.find((item: any) => item.classId === args.where.classId && item.academicYearId === args.where.academicYearId) ?? null,
      findMany: async (args: any) => state.homerooms.filter((item: any) => item.teacherUserId === args.where.teacherUserId),
    },
    studentDevelopmentRecord: {
      create: async (args: any) => {
        const created = { id: `record-${state.records.length + 1}`, status: "draft", approvedAt: null, approvedByUserId: null, ...args.data };
        state.records.push(created);
        return created;
      },
      findUnique: async (args: any) => {
        const record = state.records.find((item: any) => item.id === args.where.id);
        return record && { ...record, enrollment: state.enrollments.find((item: any) => item.id === record.enrollmentId), homeroomAssignment: state.homerooms.find((item: any) => item.id === record.homeroomAssignmentId) };
      },
      findMany: async (args: any) => {
        const records = args.where?.status === "approved"
          ? state.records.filter((record: any) => record.status === "approved" && state.enrollments.find((item: any) => item.id === record.enrollmentId)?.student.parentUserId === args.where.enrollment.student.parentUserId)
          : state.records;
        return records.map((record: any) => ({ ...record, enrollment: state.enrollments.find((item: any) => item.id === record.enrollmentId) }));
      },
      update: async (args: any) => {
        const record = state.records.find((item: any) => item.id === args.where.id);
        Object.assign(record, args.data);
        return record;
      },
    },
  } as any;
}

async function main() {
  const state = {
    enrollments: [{
      id: "enrollment-1", studentId: "student-1", academicYearId: "year-1", classId: "class-1", status: "active",
      student: { id: "student-1", parentUserId: "parent-1", fullName: "Anak Satu" },
      classroom: { unitId: "unit-1" },
    }],
    homerooms: [{ id: "homeroom-1", classId: "class-1", academicYearId: "year-1", teacherUserId: "homeroom-1", classroom: { unitId: "unit-1" } }],
    records: [] as any[],
  };
  const service = new StudentDevelopmentService(makePrisma(state));
  const homeroom: SiakadPrincipal = { id: "homeroom-1", roles: [{ app: "siakad", role: "wali_kelas", unitId: "unit-1" }] };
  const otherHomeroom: SiakadPrincipal = { id: "homeroom-2", roles: [{ app: "siakad", role: "wali_kelas", unitId: "unit-1" }] };
  const parent: SiakadPrincipal = { id: "parent-1", roles: [{ app: "siakad", role: "orang_tua", unitId: "unit-1" }] };

  const created = await service.create(homeroom, {
    enrollmentId: "enrollment-1", kind: "violation", occurredAt: "2026-10-18", summary: "Terlambat datang", details: "Datang setelah bel pertama",
  });
  assert.equal(created.homeroomAssignmentId, "homeroom-1");
  assert.equal(created.academicYearId, "year-1");
  assert.equal(created.recordedByUserId, "homeroom-1");
  await assert.rejects(
    () => service.create(otherHomeroom, { enrollmentId: "enrollment-1", kind: "character", occurredAt: "2026-10-18", summary: "Mandiri" }),
    ForbiddenException,
  );

  const beforeApproval = await service.listApprovedForParent(parent);
  assert.equal(beforeApproval.length, 0, "draft records must never be returned to a parent");
  const approved = await service.approve(homeroom, created.id);
  assert.equal(approved.status, "approved");
  assert.equal(approved.approvedByUserId, "homeroom-1");

  const parentRecords = await service.listApprovedForParent(parent);
  assert.deepEqual(parentRecords, [{ id: created.id, studentId: "student-1", studentName: "Anak Satu", kind: "violation", occurredAt: approved.occurredAt, summary: "Terlambat datang" }]);
  assert.equal("details" in parentRecords[0], false, "parent summary must not leak internal record details");
  console.log("Student development contract passed");
}

void main();
