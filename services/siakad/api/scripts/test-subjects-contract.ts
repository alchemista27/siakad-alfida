import assert from "node:assert/strict";
import { ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { SubjectsService } from "../src/subjects/subjects.service";

function makeMockPrisma(state: { subjects: any[] }) {
  return {
    subject: {
      findMany: async (args?: any) => {
        let list = [...state.subjects];
        if (args?.where?.unitId) {
          if (typeof args.where.unitId === "string") {
            list = list.filter((s) => s.unitId === args.where.unitId);
          } else if (args.where.unitId.in) {
            list = list.filter((s) => args.where.unitId.in.includes(s.unitId));
          }
        }
        return list;
      },
      findUnique: async (args: any) => {
        if (args.where?.id) {
          return state.subjects.find((s) => s.id === args.where.id) ?? null;
        }
        if (args.where?.unitId_code) {
          return (
            state.subjects.find(
              (s) => s.unitId === args.where.unitId_code.unitId && s.code === args.where.unitId_code.code,
            ) ?? null
          );
        }
        return null;
      },
      create: async (args: any) => {
        const newItem = { id: `subj-${state.subjects.length + 1}`, ...args.data };
        state.subjects.push(newItem);
        return newItem;
      },
    },
  } as any;
}

async function main() {
  const state = {
    subjects: [
      {
        id: "subj-1",
        unitId: "unit-1",
        code: "MTK",
        name: "Matematika",
        kkm: 75,
        orderIndex: 1,
      },
    ],
  };

  const prisma = makeMockPrisma(state);
  const service = new SubjectsService(prisma);

  const unit1Admin: SiakadPrincipal = {
    id: "admin-1",
    roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }],
  };
  const unit2Admin: SiakadPrincipal = {
    id: "admin-2",
    roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }],
  };

  // 1. unit1Admin lists subjects
  const list = await service.list(unit1Admin);
  assert.equal(list.length, 1);
  assert.equal(list[0].code, "MTK");

  // 2. unit2Admin cannot list unit-1 subjects explicitly
  await assert.rejects(
    () => service.list(unit2Admin, "unit-1"),
    ForbiddenException,
  );

  // 3. Create subject in unit-1
  const created = await service.create(unit1Admin, {
    unitId: "unit-1",
    code: "IPA",
    name: "Ilmu Pengetahuan Alam",
    kkm: 75,
  });
  assert.equal(created.code, "IPA");

  // 4. Duplicate code in same unit rejected
  await assert.rejects(
    () =>
      service.create(unit1Admin, {
        unitId: "unit-1",
        code: "IPA",
        name: "Ilmu Pengetahuan Alam 2",
      }),
    BadRequestException,
  );

  console.log("Subjects contract passed");
}

void main();
