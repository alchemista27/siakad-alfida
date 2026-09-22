import { PrismaClient, UnitLevel, UserRole } from "@/generated/client";
import * as xlsx from "xlsx";
const prisma = new PrismaClient();

const roleMapping: Record<string, UserRole> = {
  superadmin: UserRole.super_admin,
  staf_tu: UserRole.karyawan,
  guru_mapel: UserRole.guru,
  kepala_sekolah: UserRole.admin_unit,
  satpam: UserRole.karyawan,
  wali_kelas: UserRole.guru,
  cleaning_service: UserRole.karyawan,
};

const unitMapping: Record<string, string> = {
  "Kantor Yayasan": "kantor-yayasan",
  "PQA dan Asrama": "pesantren-alfida",
  "Lazis": "lazis",
  "Paud Sawah Lebar": "tk-auladuna-1",
  "Paud Sukarami": "tk-auladuna-2",
  "sdit 3": "sd-iqra-3",
  "sdit 1": "sd-iqra-1",
  "sdit 2": "sd-iqra-2",
  "smpit": "smp-iqra",
  "smait": "sma-iqra",
  "Asrama Yatim": "asrama-yatim",
};

async function main() {
  console.log("Importing from sistem-data/data-sso-pegawai.xlsx...");

  const workbook = xlsx.readFile("sistem-data/data-sso-pegawai.xlsx");
  const data = xlsx.utils.sheet_to_json<any>(workbook.Sheets[workbook.SheetNames[0]]);

  const units = await prisma.unit.findMany();
  const unitBySlug = new Map(units.map(u => [u.slug, u.id]));

  // Create missing units
  for (const [groupName, slug] of Object.entries(unitMapping)) {
    if (!unitBySlug.has(slug)) {
      console.log(`Creating missing unit: ${groupName} (${slug})`);
      const newUnit = await prisma.unit.create({
        data: {
          name: groupName,
          slug: slug,
          level: UnitLevel.kantor_yayasan,
          isActive: true,
        }
      });
      unitBySlug.set(slug, newUnit.id);
    }
  }

  console.log(`Found ${data.length} records to import.`);
  let successCount = 0;

  for (const row of data) {
    if (!row.email) continue;
    
    const fullName = `${row.first_name || ""} ${row.last_name || ""}`.trim() || row.username;
    
    let accId = require('crypto').randomUUID();
    const bcrypt = require('bcryptjs');
    const hashedUserPassword = await bcrypt.hash(row.password, 10);

    // Create or update User
    const userRecord = await prisma.user.upsert({
      where: { email: row.email },
      update: { id: accId, fullName },
      create: {
        id: accId,
        fullName,
        email: row.email,
        passwordHash: "managed_by_better_auth",
        phone: "08110000" + Math.floor(Math.random() * 9999),
        isActive: true,
        accounts: {
          create: {
            accountId: accId,
            providerId: "credential",
            password: hashedUserPassword
          }
        }
      },
    });

    // Assign roles & groups
    const rawRoles = row.roles ? row.roles.split(";") : [];
    const rawGroups = row.groups ? row.groups.split(";") : [];

    const parsedRoles = new Set(rawRoles.map((r: string) => roleMapping[r.trim()]).filter(Boolean));
    const parsedUnitIds = new Set(rawGroups.map((g: string) => unitBySlug.get(unitMapping[g.trim()])).filter(Boolean));

    // If they have no role mapped but are in excel, default to karyawan
    if (parsedRoles.size === 0) parsedRoles.add(UserRole.karyawan);
    
    for (const role of Array.from(parsedRoles)) {
      if (parsedUnitIds.size > 0) {
        for (const unitId of Array.from(parsedUnitIds)) {
          await prisma.userRoleAssignment.upsert({
            where: {
              userId_role_unitId: {
                userId: userRecord.id,
                role: role as UserRole,
                unitId: unitId as string,
              }
            },
            update: {},
            create: {
              userId: userRecord.id,
              role: role as UserRole,
              unitId: unitId as string,
            }
          });
        }
      } else {
        // Global
        await prisma.userRoleAssignment.create({
          data: {
            userId: userRecord.id,
            role: role as UserRole,
            unitId: null,
          }
        }).catch(() => {}); // ignore uniqueness error
      }
    }
    
    successCount++;
  }

  console.log(`Successfully imported ${successCount} users.`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
