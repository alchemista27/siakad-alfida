import assert from "node:assert/strict";
import { AuthService } from "../src/auth/auth.service";

const lksa = { id: "b4c8f5c5-0000-4000-8000-000000000001", name: "LKSA Asrama Yatim Alfida" };
let createdData: any;
const prisma = {
  user: {
    findFirst: async () => null,
    create: async ({ data }: any) => {
      createdData = data;
      return { id: data.id };
    },
  },
};
const simpegUnits = {
  async listActive() {
    return [lksa];
  },
};

delete process.env.AUTO_APPROVE_STAFF;
const service = new AuthService(prisma as any, simpegUnits as any);
async function run() {
  assert.deepEqual(await service.getUnits(), [lksa], "the public staff-registration catalog must come from SIMPEG");
  await service.registerStaff({
    fullName: "Guru Kontrak",
    email: "guru.kontrak@example.test",
    phone: "081234567890",
    password: "Password123!",
    role: "guru",
    unitId: lksa.id,
  });

  assert.equal(createdData.isActive, false, "staff registration must remain inactive until administrator approval");
  assert.equal(createdData.roles.create.some((role: any) => role.app === "siakad" && role.role === "guru"), true);
  assert.equal(createdData.roles.create.some((role: any) => role.unitId === lksa.id), true, "new SIMPEG units must become valid staff placement scopes");
  await assert.rejects(
    () => service.registerStaff({
      fullName: "Unit Palsu",
      email: "unit.palsu@example.test",
      phone: "081234567890",
      password: "Password123!",
      role: "karyawan",
      unitId: "00000000-0000-4000-8000-000000000099",
    }),
    /Unit kerja/i,
    "staff registration must reject a unit outside the active SIMPEG catalog",
  );
  console.log("Auth staff registration approval contract passed");
}

void run();
