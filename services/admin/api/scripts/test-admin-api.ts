import { PrismaClient as AdminPrisma } from "../src/generated/prisma";
import { FoundationService } from "../src/foundation/foundation.service";
import { UsersService } from "../src/users/users.service";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== Memulai Uji Otomatis Service Admin (API) ===\n");

  const envPath = path.resolve(__dirname, "../../../../.env.production.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const authMatch = envContent.match(/DATABASE_URL=postgresql:\/\/[^@]+@bkoopidoln9uolhwy3zillrd:5432\/alfida_auth\?schema=public/);
  if (!authMatch) {
    throw new Error("Could not find auth DATABASE_URL in .env.production.local");
  }
  const authUrl = authMatch[0].replace("DATABASE_URL=", "").replace("bkoopidoln9uolhwy3zillrd", "localhost");

  const prisma = new AdminPrisma({ datasources: { db: { url: authUrl } } });
  const foundationService = new FoundationService(prisma as any);
  const usersService = new UsersService(prisma as any);

  let passed = 0;
  let failed = 0;

  try {
    // Test 1: getPublicSettings
    const pub = await foundationService.getPublicSettings();
    if (pub && pub.foundationName === "Yayasan Alfida" && pub.logoUrl) {
      console.log(`[PASS] getPublicSettings() mengembalikan data identitas yayasan: ${pub.foundationName}`);
      passed++;
    } else {
      throw new Error("getPublicSettings() data tidak sesuai");
    }

    // Test 2: getAdminSettings
    const adminSet = await foundationService.getAdminSettings();
    if (adminSet && adminSet.bankName && adminSet.bankAccountNumber) {
      console.log(`[PASS] getAdminSettings() mengembalikan detail rekening bank: ${adminSet.bankName} - ${adminSet.bankAccountNumber}`);
      passed++;
    } else {
      throw new Error("getAdminSettings() gagal mengembalikan detail rekening");
    }

    // Test 3: getUsers
    const usersRes = await usersService.getUsers({ limit: 5 });
    if (usersRes && Array.isArray(usersRes.data) && usersRes.meta.total > 0) {
      console.log(`[PASS] getUsers() mengembalikan ${usersRes.data.length} pengguna (total: ${usersRes.meta.total})`);
      passed++;
    } else {
      throw new Error("getUsers() gagal mengambil data");
    }

    // Test 4: getPendingApprovals
    const pending = await usersService.getPendingApprovals();
    if (Array.isArray(pending)) {
      console.log(`[PASS] getPendingApprovals() mengembalikan ${pending.length} akun antrean persetujuan`);
      passed++;
    } else {
      throw new Error("getPendingApprovals() gagal mengembalikan array");
    }
  } catch (err: any) {
    console.error("[FAIL] Error saat pengujian:", err.message);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\n=== Hasil Akhir Admin API: ${passed} LULUS, ${failed} GAGAL ===`);
  if (failed > 0) process.exit(1);
}

main().catch(console.error);
