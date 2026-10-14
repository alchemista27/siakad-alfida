import { PrismaClient as AuthPrisma } from "../src/generated/prisma";
import { PrismaClient as LegacyPrisma } from "../../../../packages/database/src";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";

const NEW_PASSWORD = "4dmin4lfid4";

interface TestingAccount {
  email: string;
  fullName: string;
  username: string;
  roles: Array<{ app: string; role: string; unitId?: string | null }>;
}

const TESTING_ACCOUNTS: TestingAccount[] = [
  {
    email: "admin@alfida.or.id",
    fullName: "Super Admin",
    username: "superadmin",
    roles: [
      { app: "*", role: "super_admin" },
      { app: "auth", role: "super_admin" },
      { app: "core", role: "super_admin" },
    ],
  },
  {
    email: "hr@alfida.or.id",
    fullName: "Admin Kepegawaian",
    username: "hradmin",
    roles: [
      { app: "simpeg", role: "admin_kepegawaian" },
    ],
  },
  {
    email: "bidang@alfida.or.id",
    fullName: "Admin Bidang & Biro",
    username: "bidangadmin",
    roles: [
      { app: "simakin", role: "admin_bidang" },
      { app: "simakin", role: "admin_biro" },
    ],
  },
  {
    email: "admin.sdit1@alfida.or.id",
    fullName: "Admin SDIT 1 Alfida",
    username: "adminsdit1",
    roles: [
      { app: "spmb", role: "admin_unit" },
      { app: "siakad", role: "admin_unit" },
      { app: "simpeg", role: "admin_unit" },
      { app: "core", role: "admin_unit" },
    ],
  },
  {
    email: "admin.smpit@alfida.or.id",
    fullName: "Admin SMPIT Alfida",
    username: "adminsmpit",
    roles: [
      { app: "spmb", role: "admin_unit" },
      { app: "siakad", role: "admin_unit" },
      { app: "simpeg", role: "admin_unit" },
      { app: "core", role: "admin_unit" },
    ],
  },
  {
    email: "guru.budi@alfida.or.id",
    fullName: "Budi Santoso, S.Pd",
    username: "gurubudi",
    roles: [
      { app: "simpeg", role: "pegawai" },
      { app: "siakad", role: "guru" },
      { app: "siyaum", role: "peserta" },
    ],
  },
  {
    email: "musyrif.ahmad@alfida.or.id",
    fullName: "Ustadz Ahmad Al-Hafidz",
    username: "musyrifahmad",
    roles: [
      { app: "siyaum", role: "musyrif" },
      { app: "simpeg", role: "murobbi" },
    ],
  },
  {
    email: "ortu.testing@gmail.com",
    fullName: "Orang Tua Testing",
    username: "ortutesting",
    roles: [
      { app: "spmb", role: "orang_tua" },
      { app: "siakad", role: "orang_tua" },
    ],
  },
];

async function main() {
  console.log(`=== Memperbarui Password Semua Akun ke "${NEW_PASSWORD}" ===\n`);

  const envPath = path.resolve(__dirname, "../../../../.env.production.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  
  const authMatch = envContent.match(/DATABASE_URL=postgresql:\/\/[^@]+@bkoopidoln9uolhwy3zillrd:5432\/alfida_auth\?schema=public/);
  if (!authMatch) {
    throw new Error("Could not find auth DATABASE_URL in .env.production.local");
  }
  const authUrl = authMatch[0].replace("DATABASE_URL=", "").replace("bkoopidoln9uolhwy3zillrd", "localhost");
  const legacyUrl = authUrl.replace("/alfida_auth", "/simalfida");

  const authPrisma = new AuthPrisma({ datasources: { db: { url: authUrl } } });
  const legacyPrisma = new LegacyPrisma({ datasources: { db: { url: legacyUrl } } });

  const passwordHash = await bcrypt.hash(NEW_PASSWORD, 10);
  console.log(`Generated bcrypt hash for "${NEW_PASSWORD}": ${passwordHash}\n`);

  // 1. UPDATE DI DATABASE alfida_auth
  console.log("--- 1. Memperbarui Database alfida_auth ---");
  const authUpdatedUsers = await authPrisma.user.updateMany({
    data: { passwordHash },
  });
  console.log(`✓ Updated User.passwordHash for ${authUpdatedUsers.count} users in alfida_auth.`);

  const authUpdatedAccounts = await authPrisma.account.updateMany({
    where: { providerId: "credential" },
    data: { password: passwordHash },
  });
  console.log(`✓ Updated Account.password for ${authUpdatedAccounts.count} credential accounts in alfida_auth.`);

  // Pastikan akun testing dari docs/accounts.md ada di alfida_auth
  for (const acc of TESTING_ACCOUNTS) {
    const existing = await authPrisma.user.findFirst({
      where: {
        OR: [
          { email: acc.email.toLowerCase() },
          { username: acc.username },
        ],
      },
      include: { accounts: true },
    });

    let userId = existing?.id;

    if (!existing) {
      userId = randomUUID();
      await authPrisma.user.create({
        data: {
          id: userId,
          email: acc.email.toLowerCase(),
          username: acc.username,
          fullName: acc.fullName,
          passwordHash,
          isActive: true,
          accounts: {
            create: {
              id: randomUUID(),
              providerId: "credential",
              accountId: userId,
              password: passwordHash,
            },
          },
        },
      });
      console.log(`+ Created testing user in alfida_auth: ${acc.email} (${acc.fullName})`);
    } else {
      // Pastikan ada account credential
      const hasCred = existing.accounts.some((a) => a.providerId === "credential");
      if (!hasCred) {
        await authPrisma.account.create({
          data: {
            id: randomUUID(),
            userId: existing.id,
            providerId: "credential",
            accountId: existing.id,
            password: passwordHash,
          },
        });
        console.log(`+ Created credential account for ${acc.email}`);
      }
    }

    // Pastikan roles terpasang
    for (const r of acc.roles) {
      const existingRole = await authPrisma.roleAssignment.findFirst({
        where: {
          userId,
          app: r.app,
          role: r.role,
        },
      });
      if (!existingRole) {
        await authPrisma.roleAssignment.create({
          data: {
            id: randomUUID(),
            userId: userId!,
            app: r.app,
            role: r.role,
            unitId: r.unitId || null,
          },
        });
      }
    }
  }

  // 2. UPDATE DI DATABASE simalfida (LEGACY MONOLITH)
  console.log("\n--- 2. Memperbarui Database simalfida (Legacy) ---");
  const legacyUpdatedUsers = await legacyPrisma.user.updateMany({
    data: { passwordHash },
  });
  console.log(`✓ Updated User.passwordHash for ${legacyUpdatedUsers.count} users in simalfida.`);

  const legacyUpdatedAccounts = await legacyPrisma.account.updateMany({
    where: { providerId: "credential" },
    data: { password: passwordHash },
  });
  console.log(`✓ Updated Account.password for ${legacyUpdatedAccounts.count} credential accounts in simalfida.`);

  // Pastikan akun testing dari docs/accounts.md ada di simalfida
  for (const acc of TESTING_ACCOUNTS) {
    const existing = await legacyPrisma.user.findFirst({
      where: {
        OR: [
          { email: acc.email.toLowerCase() },
          { username: acc.username },
        ],
      },
      include: { accounts: true },
    });

    let userId = existing?.id;

    if (!existing) {
      userId = randomUUID();
      await legacyPrisma.user.create({
        data: {
          id: userId,
          email: acc.email.toLowerCase(),
          username: acc.username,
          fullName: acc.fullName,
          name: acc.fullName,
          passwordHash,
          emailVerified: true,
          isActive: true,
          accounts: {
            create: {
              id: randomUUID(),
              providerId: "credential",
              accountId: userId,
              password: passwordHash,
            },
          },
        },
      });
      console.log(`+ Created testing user in simalfida: ${acc.email} (${acc.fullName})`);
    } else {
      const hasCred = existing.accounts.some((a) => a.providerId === "credential");
      if (!hasCred) {
        await legacyPrisma.account.create({
          data: {
            id: randomUUID(),
            userId: existing.id,
            providerId: "credential",
            accountId: existing.id,
            password: passwordHash,
          },
        });
        console.log(`+ Created credential account in simalfida for ${acc.email}`);
      }
    }
  }

  // 3. VERIFIKASI LOGIN CHECK
  console.log("\n--- 3. Verifikasi Keberhasilan Login ---");
  for (const acc of TESTING_ACCOUNTS) {
    const user = await authPrisma.user.findFirst({
      where: { email: acc.email.toLowerCase() },
      include: { accounts: true },
    });
    if (!user) {
      console.log(`✗ Gagal menemukan user ${acc.email}`);
      continue;
    }
    const cred = user.accounts.find((a) => a.providerId === "credential");
    const hashToTest = cred?.password || user.passwordHash;
    const isValid = await bcrypt.compare(NEW_PASSWORD, hashToTest);
    console.log(`✓ ${acc.email} -> Password "${NEW_PASSWORD}" Valid? ${isValid ? "YA (BERHASIL)" : "TIDAK"}`);
  }

  await authPrisma.$disconnect();
  await legacyPrisma.$disconnect();
  console.log("\n=== Selesai Memperbarui Seluruh Password Database Auth ===");
}

main().catch(console.error);
