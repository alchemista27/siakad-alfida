import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { ExtracurricularsService } from "../src/extracurricular/extracurriculars.service";

function makeMockPrisma(state: any) {
  const extraWithRelations = (extra: any) => extra && ({ ...extra, academicYear: state.years.find((year: any) => year.id === extra.academicYearId) });
  return {
    academicYear: { findUnique: async (args: any) => state.years.find((year: any) => year.id === args.where.id) ?? null },
    extracurricular: {
      findMany: async () => state.extras.map(extraWithRelations),
      findUnique: async (args: any) => extraWithRelations(state.extras.find((item: any) => item.id === args.where.id)),
      create: async (args: any) => { const created = { id: `extra-${state.extras.length + 1}`, ...args.data }; state.extras.push(created); return extraWithRelations(created); },
      update: async (args: any) => { const index = state.extras.findIndex((item: any) => item.id === args.where.id); state.extras[index] = { ...state.extras[index], ...args.data }; return extraWithRelations(state.extras[index]); },
      delete: async (args: any) => extraWithRelations(state.extras.splice(state.extras.findIndex((item: any) => item.id === args.where.id), 1)[0]),
    },
    userProjection: { findUnique: async (args: any) => state.users.find((user: any) => user.id === args.where.id) ?? null },
    extracurricularCoach: {
      findFirst: async (args: any) => state.coaches.find((coach: any) => coach.extracurricularId === args.where.extracurricularId && coach.coachUserId === args.where.coachUserId) ?? null,
      upsert: async (args: any) => { const key = args.where.extracurricularId_coachUserId; const found = state.coaches.find((coach: any) => coach.extracurricularId === key.extracurricularId && coach.coachUserId === key.coachUserId); if (found) return found; const created = { id: `coach-${state.coaches.length + 1}`, ...args.create }; state.coaches.push(created); return created; },
      findMany: async () => state.coaches,
    },
    extracurricularSchedule: {
      findMany: async (args: any) => state.schedules.filter((item: any) => item.extracurricularId === args.where.extracurricularId),
      create: async (args: any) => { const created = { id: `schedule-${state.schedules.length + 1}`, ...args.data }; state.schedules.push(created); return created; },
      update: async (args: any) => { const index = state.schedules.findIndex((item: any) => item.id === args.where.id); state.schedules[index] = { ...state.schedules[index], ...args.data }; return state.schedules[index]; },
      delete: async (args: any) => state.schedules.splice(state.schedules.findIndex((item: any) => item.id === args.where.id), 1)[0],
      findUnique: async (args: any) => state.schedules.find((item: any) => item.id === args.where.id) ?? null,
    },
    extracurricularJournal: {
      findMany: async (args: any) => state.journals.filter((item: any) => item.extracurricularId === args.where.extracurricularId),
      create: async (args: any) => { const created = { id: `journal-${state.journals.length + 1}`, ...args.data }; state.journals.push(created); return created; },
    },
    student: { findUnique: async (args: any) => state.students.find((student: any) => student.id === args.where.id) ?? null },
    extracurricularMembership: {
      findUnique: async (args: any) => { const key = args.where.extracurricularId_studentId; return state.memberships.find((item: any) => item.extracurricularId === key.extracurricularId && item.studentId === key.studentId) ?? null; },
      upsert: async (args: any) => { const key = args.where.extracurricularId_studentId; const found = state.memberships.find((item: any) => item.extracurricularId === key.extracurricularId && item.studentId === key.studentId); if (found) return found; const created = { id: `membership-${state.memberships.length + 1}`, ...args.create }; state.memberships.push(created); return created; },
      delete: async (args: any) => state.memberships.splice(state.memberships.findIndex((item: any) => item.id === args.where.id), 1)[0],
      findFirst: async (args: any) => state.memberships.find((item: any) => item.id === args.where.id && item.extracurricularId === args.where.extracurricularId) ?? null,
    },
    extracurricularGrade: {
      upsert: async (args: any) => { const key = args.where.membershipId_semester; const found = state.grades.find((grade: any) => grade.membershipId === key.membershipId && grade.semester === key.semester); if (found) { Object.assign(found, args.update); return found; } const created = { id: `grade-${state.grades.length + 1}`, ...args.create }; state.grades.push(created); return created; },
    },
  } as any;
}

async function main() {
  const state = {
    years: [{ id: "year-active", unitId: "unit-1", status: "active" }, { id: "year-draft", unitId: "unit-1", status: "draft" }, { id: "year-other", unitId: "unit-2", status: "active" }],
    users: [{ id: "coach-1", status: "active", roles: [{ app: "siakad", role: "guru", unitId: "unit-1" }] }, { id: "coach-other-unit", status: "active", roles: [{ app: "siakad", role: "guru", unitId: "unit-2" }] }],
    extras: [] as any[], coaches: [] as any[], schedules: [] as any[], journals: [] as any[], grades: [] as any[], memberships: [] as any[],
    students: [{ id: "student-1", unitId: "unit-1", parentUserId: "parent-1" }, { id: "student-other", unitId: "unit-1", parentUserId: "parent-2" }],
  };
  const service = new ExtracurricularsService(makeMockPrisma(state));
  const admin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };
  const otherAdmin: SiakadPrincipal = { id: "admin-2", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }] };
  const coach: SiakadPrincipal = { id: "coach-1", roles: [{ app: "siakad", role: "guru", unitId: "unit-1" }] };
  const parent: SiakadPrincipal = { id: "parent-1", roles: [{ app: "siakad", role: "orang_tua", unitId: "unit-1" }] };

  const extracurricular = await service.create(admin, { academicYearId: "year-active", name: "Pramuka", category: "wajib", coachUserId: "coach-1" });
  assert.equal(extracurricular.unitId, "unit-1");
  await assert.rejects(() => service.create(admin, { academicYearId: "year-draft", name: "Tidak aktif", category: "umum" }), BadRequestException);
  await assert.rejects(() => service.update(otherAdmin, extracurricular.id, { name: "Diambil" }), ForbiddenException);
  await assert.rejects(() => service.assignCoach(admin, extracurricular.id, "coach-other-unit"), BadRequestException);

  const schedule = await service.createSchedule(coach, extracurricular.id, { dayOfWeek: 6, startTime: "08:00", endTime: "10:00", location: "Lapangan" });
  assert.equal(schedule.dayOfWeek, 6);
  await assert.rejects(() => service.createSchedule({ ...coach, id: "coach-2" }, extracurricular.id, { dayOfWeek: 6, startTime: "08:00", endTime: "10:00" }), ForbiddenException);
  assert.equal((await service.createJournal(coach, extracurricular.id, { date: "2026-10-18", activity: "Latihan baris" })).activity, "Latihan baris");

  const membership = await service.join(parent, extracurricular.id, "student-1");
  assert.equal(membership.studentId, "student-1");
  await assert.rejects(() => service.join(parent, extracurricular.id, "student-other"), ForbiddenException);
  assert.equal((await service.upsertGrade(coach, extracurricular.id, { membershipId: membership.id, semester: 1, grade: "A", notes: "Sangat aktif" })).grade, "A");
  await assert.rejects(() => service.upsertGrade(coach, extracurricular.id, { membershipId: membership.id, semester: 3, grade: "A" }), BadRequestException);
  assert.equal((await service.leave(parent, extracurricular.id, "student-1")).id, membership.id);

  console.log("Extracurricular contract passed");
}

void main();
