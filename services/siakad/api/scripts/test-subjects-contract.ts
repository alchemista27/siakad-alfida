import assert from "node:assert/strict";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { SubjectsService } from "../src/subjects/subjects.service";

function makeMockPrisma(state: { subjects: any[]; assignments: any[]; schedules: any[]; lessonPlans: any[] }) {
  return {
    subject: {
      findMany: async (args?: any) => {
        let list = [...state.subjects];
        if (args?.where?.unitId?.in) list = list.filter((subject) => args.where.unitId.in.includes(subject.unitId));
        return list;
      },
      findUnique: async (args: any) => {
        if (args.where?.id) return state.subjects.find((subject) => subject.id === args.where.id) ?? null;
        if (args.where?.unitId_code) {
          const key = args.where.unitId_code;
          return state.subjects.find((subject) => subject.unitId === key.unitId && subject.code === key.code) ?? null;
        }
        return null;
      },
      create: async (args: any) => {
        const created = { id: `subject-${state.subjects.length + 1}`, ...args.data };
        state.subjects.push(created);
        return created;
      },
      update: async (args: any) => {
        const index = state.subjects.findIndex((subject) => subject.id === args.where.id);
        state.subjects[index] = { ...state.subjects[index], ...args.data };
        return state.subjects[index];
      },
      delete: async (args: any) => {
        const index = state.subjects.findIndex((subject) => subject.id === args.where.id);
        return state.subjects.splice(index, 1)[0];
      },
    },
    teacherAssignment: { count: async (args: any) => state.assignments.filter((item) => item.subjectId === args.where.subjectId).length },
    classSchedule: { count: async (args: any) => state.schedules.filter((item) => item.subjectId === args.where.subjectId).length },
    lessonPlan: { count: async (args: any) => state.lessonPlans.filter((item) => item.subjectId === args.where.subjectId).length },
  } as any;
}

async function main() {
  const state = {
    subjects: [
      { id: "subject-1", unitId: "unit-1", code: "MTK", name: "Matematika", kkm: 75, orderIndex: 1 },
      { id: "subject-delete", unitId: "unit-1", code: "SENI", name: "Seni", kkm: 70, orderIndex: 2 },
    ],
    assignments: [{ subjectId: "subject-1" }],
    schedules: [],
    lessonPlans: [],
  };
  const service = new SubjectsService(makeMockPrisma(state));
  const unit1Admin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };
  const unit2Admin: SiakadPrincipal = { id: "admin-2", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }] };

  assert.deepEqual((await service.list(unit1Admin)).map((subject) => subject.id), ["subject-1", "subject-delete"]);
  await assert.rejects(() => service.list(unit2Admin, "unit-1"), ForbiddenException);

  const created = await service.create(unit1Admin, {
    unitId: "unit-1", code: "ipa", name: "Ilmu Pengetahuan Alam", kkm: 76, orderIndex: 3,
  });
  assert.equal(created.code, "IPA");
  await assert.rejects(() => service.create(unit1Admin, {
    unitId: "unit-1", code: "IPA", name: "Duplicate",
  }), BadRequestException);

  const updated = await service.update(unit1Admin, created.id, {
    code: "ips", name: "Ilmu Pengetahuan Sosial", kkm: 80, orderIndex: 4,
  });
  assert.deepEqual({ code: updated.code, name: updated.name, kkm: updated.kkm, orderIndex: updated.orderIndex }, {
    code: "IPS", name: "Ilmu Pengetahuan Sosial", kkm: 80, orderIndex: 4,
  });
  await assert.rejects(() => service.update(unit2Admin, created.id, { name: "Tidak boleh" }), ForbiddenException);
  await assert.rejects(() => service.update(unit1Admin, created.id, { code: "MTK" }), BadRequestException);

  await assert.rejects(() => service.remove(unit1Admin, "subject-1"), BadRequestException);
  const removed = await service.remove(unit1Admin, "subject-delete");
  assert.equal(removed.id, "subject-delete");

  console.log("Subjects contract passed");
}

void main();
