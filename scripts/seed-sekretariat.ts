import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Sekretariat data...");

  // 1. Create Department "Departemen Kesekretariatan"
  let dept = await prisma.department.findFirst({
    where: { name: "Departemen Kesekretariatan" }
  });

  if (!dept) {
    dept = await prisma.department.create({
      data: {
        name: "Departemen Kesekretariatan",
        description: "Departemen yang mengelola buku tamu, persuratan, dan ruang rapat."
      }
    });
    console.log("Departemen Kesekretariatan created.");
  } else {
    console.log("Departemen Kesekretariatan already exists.");
  }

  // 2. Create Admin Sekretariat User
  const adminEmail = "admin.sekretariat@alfida.or.id";
  let admin = await prisma.user.findFirst({
    where: { email: adminEmail }
  });

  if (!admin) {
    const passwordHash = await bcrypt.hash("4dmin4lfid4", 10);
    admin = await prisma.user.create({
      data: {
        name: "Admin Sekretariat",
        fullName: "Admin Kesekretariatan Yayasan",
        email: adminEmail,
        username: "adminsekre",
        passwordHash,
        emailVerified: true,
        isActive: true,
        roles: {
          create: {
            role: "admin_bidang"
          }
        }
      }
    });

    // Link user to Better-Auth Account to ensure login works (if using Better Auth via Prisma Adapter)
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: admin.id,
        accountId: admin.id,
        providerId: "credential",
        accessToken: "",
        refreshToken: ""
      }
    });

    console.log("Admin Sekretariat created.");
  } else {
    console.log("Admin Sekretariat already exists.");
  }

  // 3. Link Admin to Department
  const existingLink = await prisma.departmentAdmin.findFirst({
    where: {
      userId: admin.id,
      departmentId: dept.id
    }
  });

  if (!existingLink) {
    await prisma.departmentAdmin.create({
      data: {
        userId: admin.id,
        departmentId: dept.id
      }
    });
    console.log("Admin linked to Department.");
  }

  // 4. Create sample Rooms
  const sampleRooms = ["Ruang Rapat Utama", "Ruang Rapat Kecil", "Aula Diklat"];
  for (const r of sampleRooms) {
    const room = await prisma.facilityRoom.findFirst({ where: { name: r } });
    if (!room) {
      await prisma.facilityRoom.create({
        data: {
          name: r,
          capacity: r.includes("Utama") ? 20 : r.includes("Kecil") ? 8 : 100,
          location: "Gedung Yayasan Alfida"
        }
      });
      console.log(`Room ${r} created.`);
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
