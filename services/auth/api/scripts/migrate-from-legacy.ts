import { PrismaClient as AuthPrisma } from "../src/generated/prisma";
import { PrismaClient as LegacyPrisma } from "../../../../packages/database/src";
import { randomUUID } from "crypto";

async function runMigration() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`=== Memulai Migrasi Identitas Legacy ke Auth Service ${isDryRun ? "(DRY RUN)" : ""} ===`);

  const authDbUrl = process.env.AUTH_DATABASE_URL || process.env.DATABASE_URL;
  const legacyDbUrl = process.env.LEGACY_DATABASE_URL;

  const authPrisma = new AuthPrisma(
    authDbUrl ? { datasources: { db: { url: authDbUrl } } } : undefined
  );
  const legacyPrisma = new LegacyPrisma(
    legacyDbUrl ? { datasources: { db: { url: legacyDbUrl } } } : undefined
  );

  try {
    const legacyUsers = await legacyPrisma.user.findMany({
      include: {
        accounts: true,
        roles: true,
      },
    });

    console.log(`Ditemukan ${legacyUsers.length} pengguna pada database legacy.`);

    let migratedUsersCount = 0;
    let migratedRolesCount = 0;

    for (const u of legacyUsers) {
      if (isDryRun) {
        console.log(`[DRY-RUN] Migrasi user: ${u.email} (${u.fullName}) - Roles: ${u.roles.map((r) => r.role).join(", ")}`);
        migratedUsersCount++;
        continue;
      }

      // Upsert User
      await authPrisma.user.upsert({
        where: { id: u.id },
        update: {
          email: u.email.toLowerCase().trim(),
          fullName: u.fullName,
          username: u.username,
          phone: u.phone,
          passwordHash: u.passwordHash,
          isActive: u.isActive,
        },
        create: {
          id: u.id,
          email: u.email.toLowerCase().trim(),
          fullName: u.fullName,
          username: u.username,
          phone: u.phone,
          passwordHash: u.passwordHash,
          isActive: u.isActive,
          createdAt: u.createdAt,
        },
      });

      // Upsert Accounts
      for (const acc of u.accounts) {
        await authPrisma.account.upsert({
          where: {
            providerId_accountId: {
              providerId: acc.providerId,
              accountId: acc.accountId,
            },
          },
          update: {
            password: acc.password,
          },
          create: {
            id: acc.id || randomUUID(),
            userId: u.id,
            providerId: acc.providerId,
            accountId: acc.accountId,
            password: acc.password,
          },
        });
      }

      // Petakan Roles ke App-scoped Roles
      for (const r of u.roles) {
        const targetRoles: Array<{ app: string; role: string; unitId?: string | null }> = [];

        switch (r.role) {
          case "super_admin":
            targetRoles.push({ app: "*", role: "super_admin" });
            break;
          case "pimpinan_yayasan":
            targetRoles.push({ app: "*", role: "pimpinan" });
            targetRoles.push({ app: "simakin", role: "pimpinan" });
            break;
          case "pengawas_yayasan":
            targetRoles.push({ app: "simakin", role: "pengawas" });
            break;
          case "admin_unit":
          case "admin_unit_nondik":
            targetRoles.push({ app: "core", role: "admin_unit", unitId: r.unitId });
            targetRoles.push({ app: "simpeg", role: "admin_unit", unitId: r.unitId });
            targetRoles.push({ app: "siakad", role: "admin_unit", unitId: r.unitId });
            targetRoles.push({ app: "spmb", role: "admin_unit", unitId: r.unitId });
            break;
          case "admin_bidang":
          case "admin_biro":
            targetRoles.push({ app: "simakin", role: "admin_bidang" });
            break;
          case "guru":
            targetRoles.push({ app: "simpeg", role: "pegawai", unitId: r.unitId });
            targetRoles.push({ app: "siakad", role: "guru", unitId: r.unitId });
            break;
          case "karyawan":
            targetRoles.push({ app: "simpeg", role: "pegawai", unitId: r.unitId });
            break;
          case "murobbi":
            targetRoles.push({ app: "simpeg", role: "murobbi" });
            break;
          case "supervisor_kesiswaan":
            targetRoles.push({ app: "siakad", role: "supervisor_kesiswaan", unitId: r.unitId });
            break;
          case "tim_ppdb":
            targetRoles.push({ app: "spmb", role: "tim_ppdb", unitId: r.unitId });
            break;
          case "observer":
            targetRoles.push({ app: "spmb", role: "observer", unitId: r.unitId });
            break;
          case "orang_tua":
            targetRoles.push({ app: "spmb", role: "orang_tua" });
            targetRoles.push({ app: "siakad", role: "orang_tua" });
            break;
        }

        for (const target of targetRoles) {
          const existing = await authPrisma.roleAssignment.findFirst({
            where: {
              userId: u.id,
              app: target.app,
              role: target.role,
              unitId: target.unitId || null,
              departmentId: null,
            },
          });

          if (!existing) {
            await authPrisma.roleAssignment.create({
              data: {
                id: randomUUID(),
                userId: u.id,
                app: target.app,
                role: target.role,
                unitId: target.unitId || null,
                departmentId: null,
              },
            });
            migratedRolesCount++;
          }
        }
      }

      migratedUsersCount++;
    }

    console.log(`Selesai! Berhasil memigrasi ${migratedUsersCount} pengguna dan ${migratedRolesCount} peran.`);
  } catch (err) {
    console.error("Gagal melakukan migrasi identitas:", err);
    process.exit(1);
  } finally {
    await authPrisma.$disconnect();
    await legacyPrisma.$disconnect();
  }
}

runMigration();
