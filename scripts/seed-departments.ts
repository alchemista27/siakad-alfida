import * as bcrypt from 'bcryptjs';
import { PrismaClient, UnitLevel, UserRole } from "@sim/database";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding new departments...");

  const kantorYayasan = await prisma.unit.findFirst({
    where: { level: UnitLevel.kantor_yayasan },
  });

  if (!kantorYayasan) {
    throw new Error("Unit Kantor Yayasan not found!");
  }

  const departments = [
    { name: "Bidang Kepegawaian", email: "kepegawaian@alfida.or.id" },
    { name: "Bidang Pendidikan", email: "pendidikan@alfida.or.id" },
    { name: "Biro Sarana Prasarana dan Kerumahtanggaan", email: "sarpras@alfida.or.id" },
    { name: "Departemen Keuangan", email: "keuangan@alfida.or.id" },
  ];

  const defaultPassword = process.env.SEED_DEFAULT_PASSWORD;
  if (!defaultPassword) {
    throw new Error("SEED_DEFAULT_PASSWORD is not set in environment variables!");
  }
  const hashedAdminPassword = await bcrypt.hash(defaultPassword, 10);

  for (const deptData of departments) {
    let dept = await prisma.department.findFirst({
      where: { name: deptData.name, unitId: kantorYayasan.id },
    });

    if (!dept) {
      dept = await prisma.department.create({
        data: {
          unitId: kantorYayasan.id,
          name: deptData.name,
          description: deptData.name,
        },
      });
      console.log(`Created department: ${deptData.name}`);
    }

    let accId = require('crypto').randomUUID();
    const userRecord = await prisma.user.upsert({
      where: { email: deptData.email },
      update: {},
      create: {
        id: accId,
        fullName: `Admin ${deptData.name}`,
        name: `Admin ${deptData.name}`,
        email: deptData.email,
        phone: "0812" + Math.floor(10000000 + Math.random() * 90000000),
        passwordHash: "managed_by_better_auth",
        emailVerified: true,
        isActive: true,
        accounts: {
          create: {
            accountId: accId,
            providerId: "credential",
            password: hashedAdminPassword,
          },
        },
      },
    });

    const existingAccRole = await prisma.userRoleAssignment.findFirst({
      where: { userId: userRecord.id, role: UserRole.admin_bidang },
    });

    if (!existingAccRole) {
      await prisma.userRoleAssignment.create({
        data: {
          userId: userRecord.id,
          role: UserRole.admin_bidang,
          unitId: kantorYayasan.id,
        },
      });
    }

    const existingDeptAdmin = await prisma.departmentAdmin.findFirst({
      where: { departmentId: dept.id, userId: userRecord.id },
    });

    if (!existingDeptAdmin) {
      await prisma.departmentAdmin.create({
        data: {
          departmentId: dept.id,
          userId: userRecord.id,
        },
      });
    }
    
    console.log(`Created admin for ${deptData.name}: ${deptData.email}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
