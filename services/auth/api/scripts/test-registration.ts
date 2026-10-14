import { PrismaClient as AuthPrisma } from "../src/generated/prisma";
import { AuthService, ALFIDA_UNITS } from "../src/auth/auth.service";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== Memulai Uji Otomatis Registrasi (Auth Service) ===\n");

  const envPath = path.resolve(__dirname, "../../../../.env.production.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const authMatch = envContent.match(/DATABASE_URL=postgresql:\/\/[^@]+@bkoopidoln9uolhwy3zillrd:5432\/alfida_auth\?schema=public/);
  if (!authMatch) {
    throw new Error("Could not find auth DATABASE_URL in .env.production.local");
  }
  const authUrl = authMatch[0].replace("DATABASE_URL=", "").replace("bkoopidoln9uolhwy3zillrd", "localhost");

  const prisma = new AuthPrisma({ datasources: { db: { url: authUrl } } });
  const authService = new AuthService(prisma as any);

  let passed = 0;
  let failed = 0;

  const testEmailParent = "test.ortu.dummy@alfida.or.id";
  const testEmailStaff = "test.guru.dummy@alfida.or.id";

  // Cleanup before test
  await prisma.user.deleteMany({
    where: { email: { in: [testEmailParent, testEmailStaff] } },
  });

  try {
    // Test 1: getUnits
    const units = await authService.getUnits();
    if (Array.isArray(units) && units.length >= 8) {
      console.log(`[PASS] getUnits() mengembalikan ${units.length} unit yayasan resmi`);
      passed++;
    } else {
      throw new Error("getUnits() tidak mengembalikan unit yang valid");
    }

    // Test 2: registerParent
    const regParentRes = await authService.registerParent({
      fullName: "Bapak Wali Santri Dummy",
      email: testEmailParent,
      phone: "081299998888",
      password: "Password123!",
    });

    const createdParent = await prisma.user.findUnique({
      where: { id: regParentRes.userId },
      include: { roles: true, accounts: true },
    });

    if (
      createdParent &&
      createdParent.isActive === true &&
      createdParent.roles.some((r) => r.app === "spmb" && r.role === "orang_tua") &&
      createdParent.roles.some((r) => r.app === "siakad" && r.role === "orang_tua") &&
      createdParent.accounts.some((a) => a.providerId === "credential")
    ) {
      console.log("[PASS] registerParent() berhasil membuat user aktif dengan peran spmb & siakad orang_tua");
      passed++;
    } else {
      throw new Error("registerParent() gagal memverifikasi user atau roles");
    }

    // Test 3: duplicate parent registration
    try {
      await authService.registerParent({
        fullName: "Bapak Duplikat",
        email: testEmailParent,
        phone: "081299998888",
        password: "Password123!",
      });
      throw new Error("Harusnya melempar error email duplikat");
    } catch (err: any) {
      if (err.message.includes("Email sudah terdaftar")) {
        console.log("[PASS] registerParent() menolak email duplikat dengan benar");
        passed++;
      } else {
        throw err;
      }
    }

    // Test 4: registerStaff (Guru)
    const unitId = units[0].id;
    const regStaffRes = await authService.registerStaff({
      fullName: "Ustadzah Guru Baru Dummy",
      email: testEmailStaff,
      phone: "081377776666",
      password: "Password123!",
      role: "guru",
      unitId,
    });

    const createdStaff = await prisma.user.findUnique({
      where: { id: regStaffRes.userId },
      include: { roles: true, accounts: true },
    });

    if (
      createdStaff &&
      createdStaff.isActive === false && // Wajib nonaktif menunggu approval admin
      createdStaff.roles.some((r) => r.app === "simpeg" && r.role === "pegawai" && r.unitId === unitId) &&
      createdStaff.roles.some((r) => r.app === "siakad" && r.role === "guru" && r.unitId === unitId) &&
      createdStaff.roles.some((r) => r.app === "siyaum" && r.role === "peserta")
    ) {
      console.log("[PASS] registerStaff() berhasil membuat staf nonaktif (menunggu approval) dengan penugasan unit");
      passed++;
    } else {
      throw new Error("registerStaff() gagal memverifikasi status nonaktif atau roles staf");
    }
  } catch (err: any) {
    console.error("[FAIL] Error saat pengujian:", err.message);
    failed++;
  } finally {
    // Cleanup test data
    await prisma.user.deleteMany({
      where: { email: { in: [testEmailParent, testEmailStaff] } },
    });
    await prisma.$disconnect();
  }

  console.log(`\n=== Hasil Akhir: ${passed} LULUS, ${failed} GAGAL ===`);
  if (failed > 0) process.exit(1);
}

main().catch(console.error);
