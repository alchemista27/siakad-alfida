import assert from "node:assert/strict";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { ParentPortalService } from "../src/parent-portal/parent-portal.service";

function makePrisma(state: any) {
  return {
    student: {
      findMany: async (args: any) => {
        assert.deepEqual(args.where, { parentUserId: "parent-1" }, "children must be derived from the authenticated parent user id");
        return state.students.filter((student: any) => student.parentUserId === args.where.parentUserId);
      },
    },
    teacherAssignment: {
      findMany: async () => state.assignments,
    },
  } as any;
}

async function main() {
  const state = {
    students: [
      {
        id: "student-1", fullName: "Anak Satu", nis: "001", parentUserId: "parent-1",
        enrollments: [{
          id: "enrollment-1", academicYearId: "year-1", classId: "class-1", status: "active",
          academicYear: { name: "2026/2027" },
          classroom: { id: "class-1", name: "VII A", schedules: [{ id: "schedule-1", dayOfWeek: 1, startTime: "07:00", endTime: "08:00", subject: { name: "Matematika" } }] },
          attendances: [{ status: "present" }, { status: "absent" }],
          grades: [{ teacherAssignmentId: "assignment-1" }],
          lhbsReports: [{ id: "lhbs-1", semester: 1, status: "published", publishedAt: new Date("2026-10-18T00:00:00Z"), summary: { attendance: { present: 12 } } }],
        }],
        extraMemberships: [{ extracurricular: { academicYearId: "year-1", name: "Pramuka" }, grades: [{ semester: 1, grade: "A", notes: "Aktif" }] }],
      },
      { id: "student-other", fullName: "Bukan Anak", parentUserId: "parent-2", enrollments: [], extraMemberships: [] },
    ],
    assignments: [{ id: "assignment-1", classId: "class-1", academicYearId: "year-1" }, { id: "assignment-2", classId: "class-1", academicYearId: "year-1" }],
  };
  const service = new ParentPortalService(makePrisma(state));
  const parent: SiakadPrincipal = { id: "parent-1", roles: [{ app: "siakad", role: "orang_tua" }] };
  const overview = await service.overview(parent);

  assert.equal(overview.children.length, 1, "the portal must never return another parent’s child");
  const [child] = overview.children;
  assert.equal(child.student.id, "student-1");
  assert.deepEqual(child.schedule, [{ dayOfWeek: 1, startTime: "07:00", endTime: "08:00", subjectName: "Matematika" }]);
  assert.deepEqual(child.attendance, { recordedCount: 2, presentCount: 1, presentRate: 0.5 });
  assert.deepEqual(child.gradeCompleteness, { assignedSubjectCount: 2, gradedSubjectCount: 1, completionRate: 0.5 });
  assert.deepEqual(child.extracurricular, [{ name: "Pramuka", semester: 1, grade: "A", notes: "Aktif" }]);
  assert.deepEqual(child.publishedLhbs, [{ id: "lhbs-1", semester: 1, publishedAt: new Date("2026-10-18T00:00:00Z"), summary: { attendance: { present: 12 } } }]);
  console.log("Parent portal contract passed");
}

void main();
