import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { SchedulesService } from "../src/schedules/schedules.service";

function makeMockPrisma(state: any) {
  const withRelations = (schedule: any) => schedule && ({
    ...schedule,
    classroom: state.classrooms.find((item: any) => item.id === schedule.classId),
    subject: state.subjects.find((item: any) => item.id === schedule.subjectId),
  });
  return {
    classroom: { findUnique: async (args: any) => state.classrooms.find((item: any) => item.id === args.where.id) ?? null },
    subject: { findUnique: async (args: any) => state.subjects.find((item: any) => item.id === args.where.id) ?? null },
    teacherAssignment: {
      findFirst: async (args: any) => state.assignments.find((item: any) => item.classId === args.where.classId && item.subjectId === args.where.subjectId && item.academicYearId === args.where.academicYearId) ?? null,
      findMany: async () => state.assignments,
    },
    classSchedule: {
      findMany: async () => state.schedules.map(withRelations),
      findUnique: async (args: any) => withRelations(state.schedules.find((item: any) => item.id === args.where.id)),
      create: async (args: any) => {
        const created = { id: `schedule-${state.schedules.length + 1}`, ...args.data };
        state.schedules.push(created);
        return withRelations(created);
      },
      update: async (args: any) => {
        const index = state.schedules.findIndex((item: any) => item.id === args.where.id);
        state.schedules[index] = { ...state.schedules[index], ...args.data };
        return withRelations(state.schedules[index]);
      },
      delete: async (args: any) => {
        const index = state.schedules.findIndex((item: any) => item.id === args.where.id);
        return withRelations(state.schedules.splice(index, 1)[0]);
      },
    },
  } as any;
}

async function main() {
  const state = {
    classrooms: [
      { id: "class-1", unitId: "unit-1", academicYearId: "ay-1" },
      { id: "class-2", unitId: "unit-1", academicYearId: "ay-1" },
      { id: "class-foreign", unitId: "unit-2", academicYearId: "ay-2" },
    ],
    subjects: [{ id: "subject-1", unitId: "unit-1" }, { id: "subject-2", unitId: "unit-1" }, { id: "subject-foreign", unitId: "unit-2" }],
    assignments: [
      { id: "assignment-1", classId: "class-1", subjectId: "subject-1", academicYearId: "ay-1", teacherUserId: "teacher-1" },
      { id: "assignment-2", classId: "class-2", subjectId: "subject-1", academicYearId: "ay-1", teacherUserId: "teacher-1" },
      { id: "assignment-3", classId: "class-1", subjectId: "subject-2", academicYearId: "ay-1", teacherUserId: "teacher-2" },
    ],
    schedules: [{ id: "schedule-1", classId: "class-1", subjectId: "subject-1", dayOfWeek: 1, startTime: "08:00", endTime: "09:00" }],
  };
  const service = new SchedulesService(makeMockPrisma(state));
  const unitAdmin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };

  assert.deepEqual((await service.list(unitAdmin, {})).map((item) => item.id), ["schedule-1"]);
  await assert.rejects(() => service.create(unitAdmin, { classId: "class-1", subjectId: "subject-2", dayOfWeek: 1, startTime: "08:30", endTime: "09:30" }), BadRequestException);
  await assert.rejects(() => service.create(unitAdmin, { classId: "class-2", subjectId: "subject-1", dayOfWeek: 1, startTime: "08:15", endTime: "09:15" }), BadRequestException);
  await assert.rejects(() => service.create(unitAdmin, { classId: "class-1", subjectId: "subject-2", dayOfWeek: 1, startTime: "10:00", endTime: "10:00" }), BadRequestException);
  await assert.rejects(() => service.create(unitAdmin, { classId: "class-foreign", subjectId: "subject-foreign", dayOfWeek: 1, startTime: "10:00", endTime: "11:00" }), ForbiddenException);

  const created = await service.create(unitAdmin, { classId: "class-2", subjectId: "subject-1", dayOfWeek: 1, startTime: "09:00", endTime: "10:00" });
  assert.equal(created.id, "schedule-2");
  const updated = await service.update(unitAdmin, created.id, { startTime: "10:00", endTime: "11:00" });
  assert.equal(updated.startTime, "10:00");
  assert.equal((await service.remove(unitAdmin, created.id)).id, created.id);

  console.log("Schedules contract passed");
}

void main();
