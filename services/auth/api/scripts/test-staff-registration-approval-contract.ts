import assert from "node:assert/strict";
import { AuthService, ALFIDA_UNITS } from "../src/auth/auth.service";

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

delete process.env.AUTO_APPROVE_STAFF;
const service = new AuthService(prisma as any);
async function run() {
  await service.registerStaff({
    fullName: "Guru Kontrak",
    email: "guru.kontrak@example.test",
    phone: "081234567890",
    password: "Password123!",
    role: "guru",
    unitId: ALFIDA_UNITS[0].id,
  });

  assert.equal(createdData.isActive, false, "staff registration must remain inactive until administrator approval");
  assert.equal(createdData.roles.create.some((role: any) => role.app === "siakad" && role.role === "guru"), true);
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
    "staff registration must reject a unit outside the canonical SIMPEG catalog",
  );
  console.log("Auth staff registration approval contract passed");
}

void run();
