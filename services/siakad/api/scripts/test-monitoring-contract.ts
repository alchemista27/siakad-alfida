import assert from "node:assert/strict";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { MonitoringService } from "../src/monitoring/monitoring.service";

function makePrisma(state: any) {
  const list = (key: string) => ({ findMany: async () => state[key] });
  return {
    unitProjection: { findMany: async (args: any) => state.units.filter((unit: any) => !args.where?.id?.in || args.where.id.in.includes(unit.id)) },
    academicYear: { findUnique: async () => null },
    attendance: list("attendance"),
    grade: list("grades"),
    enrollment: list("enrollments"),
    teacherAssignment: list("assignments"),
    teachingJournal: list("journals"),
    classSchedule: list("schedules"),
    lhbsReport: list("lhbsReports"),
    extracurricular: list("extracurriculars"),
  } as any;
}

async function main() {
  const state = {
    units: [{ id: "unit-1", name: "Unit Satu" }, { id: "unit-2", name: "Unit Dua" }],
    attendance: [
      { status: "present", enrollment: { academicYear: { unitId: "unit-1" } } },
      { status: "absent", enrollment: { academicYear: { unitId: "unit-1" } } },
      { status: "present", enrollment: { academicYear: { unitId: "unit-2" } } },
    ],
    grades: [{ enrollmentId: "enrollment-1", teacherAssignmentId: "assignment-1", enrollment: { academicYear: { unitId: "unit-1" } } }],
    enrollments: [{ id: "enrollment-1", classId: "class-1", academicYearId: "year-1", academicYear: { unitId: "unit-1" } }],
    assignments: [{ id: "assignment-1", classId: "class-1", academicYearId: "year-1", classroom: { unitId: "unit-1" } }],
    journals: [{ scheduleId: "schedule-1", teacherAssignment: { academicYearId: "year-1", classroom: { unitId: "unit-1" } } }],
    schedules: [{ id: "schedule-1", classroom: { academicYearId: "year-1", unitId: "unit-1" } }],
    lhbsReports: [{ status: "published", academicYear: { unitId: "unit-1" } }, { status: "draft", academicYear: { unitId: "unit-1" } }],
    extracurriculars: [{ academicYear: { unitId: "unit-1" }, memberships: [{ grades: [{ id: "extra-grade-1" }] }, { grades: [] }] }],
  };
  const service = new MonitoringService(makePrisma(state));
  const admin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };
  const report = await service.academicOverview(admin);

  assert.deepEqual(report.units.map((unit: any) => unit.unitId), ["unit-1"], "aggregate must exclude units outside the caller scope");
  const unit = report.units[0];
  assert.deepEqual(unit.attendance, { recordedCount: 2, presentCount: 1, presentRate: 0.5 });
  assert.deepEqual(unit.grades, { recordedCount: 1, expectedEntryCount: 1, completionRate: 1 });
  assert.deepEqual(unit.journals, { recordedCount: 1, scheduledCount: 1, completionRate: 1 });
  assert.deepEqual(unit.lhbs, { reportCount: 2, publishedCount: 1, publishRate: 0.5 });
  assert.deepEqual(unit.extracurricular, { activityCount: 1, membershipCount: 2, gradedMembershipCount: 1, gradeCompletionRate: 0.5 });
  console.log("Academic monitoring contract passed");
}

void main();
