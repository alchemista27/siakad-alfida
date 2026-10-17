import assert from "node:assert/strict";
import { ForbiddenException, NotFoundException, BadRequestException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { ClassroomsService } from "../src/classrooms/classrooms.service";

function makeMockPrisma(state: { classrooms: any[]; academicYears: any[] }) {
  return {
    classroom: {
      findMany: async (args?: any) => {
        let list = [...state.classrooms];
        if (args?.where?.unitId) {
          if (typeof args.where.unitId === "string") {
            list = list.filter((c) => c.unitId === args.where.unitId);
          } else if (args.where.unitId.in) {
            list = list.filter((c) => args.where.unitId.in.includes(c.unitId));
          }
        }
        if (args?.where?.academicYearId) {
          list = list.filter((c) => c.academicYearId === args.where.academicYearId);
        }
        return list;
      },
      findUnique: async (args: any) => {
        if (args.where?.id) {
          return state.classrooms.find((c) => c.id === args.where.id) ?? null;
        }
        if (args.where?.unitId_academicYearId_name) {
          const q = args.where.unitId_academicYearId_name;
          return (
            state.classrooms.find(
              (c) => c.unitId === q.unitId && c.academicYearId === q.academicYearId && c.name === q.name,
            ) ?? null
          );
        }
        return null;
      },
      create: async (args: any) => {
        const newItem = { id: `cls-${state.classrooms.length + 1}`, ...args.data };
        state.classrooms.push(newItem);
        return newItem;
      },
    },
    academicYear: {
      findUnique: async (args: any) => {
        return state.academicYears.find((y) => y.id === args.where.id) ?? null;
      },
    },
  } as any;
}

async function main() {
  const state = {
    academicYears: [
      { id: "ay-1", unitId: "unit-1", name: "2026/2027", status: "active" },
      { id: "ay-2", unitId: "unit-2", name: "2026/2027", status: "active" },
    ],
    classrooms: [
      {
        id: "cls-1",
        unitId: "unit-1",
        academicYearId: "ay-1",
        name: "1-A",
        gradeLevel: 1,
        capacity: 28,
      },
    ],
  };

  const prisma = makeMockPrisma(state);
  const service = new ClassroomsService(prisma);

  const unit1Admin: SiakadPrincipal = {
    id: "admin-1",
    roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }],
  };
  const unit2Admin: SiakadPrincipal = {
    id: "admin-2",
    roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }],
  };

  // 1. unit1Admin lists classes
  const list1 = await service.list(unit1Admin, { academicYearId: "ay-1" });
  assert.equal(list1.length, 1);
  assert.equal(list1[0].name, "1-A");

  // 2. unit2Admin cannot list unit-1 classes
  await assert.rejects(
    () => service.list(unit2Admin, { unitId: "unit-1" }),
    ForbiddenException,
  );

  // 3. Create classroom
  const created = await service.create(unit1Admin, {
    unitId: "unit-1",
    academicYearId: "ay-1",
    name: "1-B",
    gradeLevel: 1,
    capacity: 28,
  });
  assert.equal(created.name, "1-B");

  // 4. Duplicate name in unit and year rejected
  await assert.rejects(
    () =>
      service.create(unit1Admin, {
        unitId: "unit-1",
        academicYearId: "ay-1",
        name: "1-B",
        gradeLevel: 1,
        capacity: 28,
      }),
    BadRequestException,
  );

  // 5. Cross-unit classroom creation rejected
  await assert.rejects(
    () =>
      service.create(unit1Admin, {
        unitId: "unit-2",
        academicYearId: "ay-2",
        name: "1-A",
        gradeLevel: 1,
        capacity: 28,
      }),
    ForbiddenException,
  );

  console.log("Classrooms contract passed");
}

void main();
