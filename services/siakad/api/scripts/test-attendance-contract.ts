import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { AttendanceService } from "../src/attendance/attendance.service";

function makeMockPrisma(state: any) {
  const findSchedule = (id: string) => {
    const schedule = state.schedules.find((item: any) => item.id === id);
    return schedule && {
      ...schedule,
      classroom: state.classrooms.find((item: any) => item.id === schedule.classId),
      subject: state.subjects.find((item: any) => item.id === schedule.subjectId),
    };
  };

  return {
    classSchedule: { findUnique: async (args: any) => findSchedule(args.where.id) ?? null },
    teacherAssignment: {
      findFirst: async (args: any) => state.assignments.find((item: any) =>
        item.classId === args.where.classId
        && item.subjectId === args.where.subjectId
        && item.academicYearId === args.where.academicYearId,
      ) ?? null,
    },
    enrollment: {
      findMany: async (args: any) => state.enrollments
        .filter((item: any) => item.classId === args.where.classId && item.academicYearId === args.where.academicYearId && item.status === args.where.status)
        .map((item: any) => ({ ...item, student: state.students.find((student: any) => student.id === item.studentId) })),
    },
    attendance: {
      findMany: async (args: any) => state.attendances.filter((item: any) =>
        item.scheduleId === args.where.scheduleId && item.date.toISOString() === args.where.date.toISOString(),
      ),
      upsert: async (args: any) => {
        const key = args.where.enrollmentId_scheduleId_date;
        const index = state.attendances.findIndex((item: any) =>
          item.enrollmentId === key.enrollmentId
          && item.scheduleId === key.scheduleId
          && item.date.toISOString() === key.date.toISOString(),
        );
        if (index >= 0) {
          state.attendances[index] = { ...state.attendances[index], ...args.update };
          return state.attendances[index];
        }
        const created = { id: `att-${state.attendances.length + 1}`, ...args.create };
        state.attendances.push(created);
        return created;
      },
    },
  } as any;
}

async function main() {
  const state = {
    classrooms: [{ id: "class-1", unitId: "unit-1", academicYearId: "year-1" }],
    subjects: [{ id: "subject-1", unitId: "unit-1" }],
    schedules: [{ id: "schedule-1", classId: "class-1", subjectId: "subject-1" }],
    assignments: [{ id: "assignment-1", classId: "class-1", subjectId: "subject-1", academicYearId: "year-1", teacherUserId: "teacher-1" }],
    students: [{ id: "student-1", fullName: "Alya" }, { id: "student-2", fullName: "Bima" }],
    enrollments: [
      { id: "enrollment-1", studentId: "student-1", classId: "class-1", academicYearId: "year-1", status: "active" },
      { id: "enrollment-2", studentId: "student-2", classId: "class-1", academicYearId: "year-1", status: "active" },
      { id: "enrollment-foreign", studentId: "student-1", classId: "class-other", academicYearId: "year-1", status: "active" },
    ],
    attendances: [] as any[],
  };
  const service = new AttendanceService(makeMockPrisma(state));
  const teacher: SiakadPrincipal = { id: "teacher-1", roles: [{ app: "siakad", role: "guru", unitId: "unit-1" }] };
  const otherTeacher: SiakadPrincipal = { id: "teacher-2", roles: [{ app: "siakad", role: "guru", unitId: "unit-1" }] };

  const created = await service.batchUpsert(teacher, "schedule-1", {
    date: "2026-10-15",
    items: [
      { enrollmentId: "enrollment-1", status: "present" },
      { enrollmentId: "enrollment-2", status: "sick", notes: "Izin dokter" },
    ],
  });
  assert.equal(created.length, 2);
  assert.equal(state.attendances[1].notes, "Izin dokter");

  const listed = await service.listBySchedule(teacher, "schedule-1", "2026-10-15");
  assert.equal(listed.roster.length, 2);
  assert.equal(listed.roster.find((entry: any) => entry.enrollment.id === "enrollment-2")?.attendance.status, "sick");

  await service.batchUpsert(teacher, "schedule-1", {
    date: "2026-10-15",
    items: [{ enrollmentId: "enrollment-1", status: "absent" }],
  });
  assert.equal(state.attendances.filter((item: any) => item.enrollmentId === "enrollment-1").length, 1);
  assert.equal(state.attendances[0].status, "absent");

  await assert.rejects(() => service.batchUpsert(teacher, "schedule-1", { date: "2026-10-15", items: [{ enrollmentId: "enrollment-foreign", status: "present" }] }), BadRequestException);
  await assert.rejects(() => service.batchUpsert(teacher, "schedule-1", { date: "2026/10/15", items: [{ enrollmentId: "enrollment-1", status: "present" }] }), BadRequestException);
  await assert.rejects(() => service.batchUpsert(teacher, "schedule-1", { date: "2026-10-15", items: [{ enrollmentId: "enrollment-1", status: "late" }] }), BadRequestException);
  await assert.rejects(() => service.listBySchedule(otherTeacher, "schedule-1", "2026-10-15"), ForbiddenException);

  console.log("Attendance contract passed");
}

void main();
