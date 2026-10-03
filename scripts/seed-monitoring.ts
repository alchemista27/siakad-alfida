import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding monitoring data...");

  const sdIqra1 = await prisma.unit.findFirst({ where: { name: { contains: "SD Islam Terpadu Iqra 1" } } });
  if (!sdIqra1) throw new Error("Unit SD Iqra 1 not found");

  const academicYear = await prisma.academicYear.findFirst({
    where: { unitId: sdIqra1.id },
    orderBy: { startDate: "desc" }
  });
  if (!academicYear) throw new Error("Academic Year not found");

  // Create Supervisor User
  const supervisorEmail = "supervisor.kesiswaan@alfida.or.id";
  const hashedPassword = await bcrypt.hash("4dmin4lfid4", 10);
  
  let supervisor = await prisma.user.findUnique({ where: { email: supervisorEmail } });
  if (!supervisor) {
    const supervisorId = crypto.randomUUID();
    supervisor = await prisma.user.create({
      data: {
        id: supervisorId,
        fullName: "Supervisor Kesiswaan",
        email: supervisorEmail,
        passwordHash: "managed_by_better_auth",
        phone: "081199990000",
        isActive: true,
        accounts: {
          create: {
            accountId: supervisorId,
            providerId: "credential",
            password: hashedPassword
          }
        },
        roles: {
          create: {
            role: "supervisor_kesiswaan"
          }
        }
      }
    });
    console.log("Supervisor created.");
  }

  // Create Teacher
  const teacherEmail = "guru.testing@alfida.or.id";
  let teacher = await prisma.user.findUnique({ where: { email: teacherEmail } });
  if (!teacher) {
    const teacherId = crypto.randomUUID();
    teacher = await prisma.user.create({
      data: {
        id: teacherId,
        fullName: "Guru Testing SD Iqra 1",
        email: teacherEmail,
        passwordHash: "managed_by_better_auth",
        phone: "081199990001",
        isActive: true,
        accounts: {
          create: {
            accountId: teacherId,
            providerId: "credential",
            password: hashedPassword
          }
        },
        roles: {
          create: {
            role: "guru",
            unitId: sdIqra1.id
          }
        }
      }
    });
    console.log("Teacher created.");
  }

  // Create Class
  let class1A = await prisma.class.findFirst({ where: { name: "Kelas 1-A (Testing)", unitId: sdIqra1.id } });
  if (!class1A) {
    class1A = await prisma.class.create({
      data: {
        name: "Kelas 1-A (Testing)",
        unitId: sdIqra1.id,
        academicYearId: academicYear.id,
        capacity: 30
      }
    });
    console.log("Class created.");
  }

  // Assign Homeroom
  let homeroom = await prisma.homeroomAssignment.findFirst({ where: { classId: class1A.id } });
  if (!homeroom) {
    await prisma.homeroomAssignment.create({
      data: {
        classId: class1A.id,
        teacherId: teacher.id,
        academicYearId: academicYear.id
      }
    });
    console.log("Homeroom assigned.");
  }

  // Create Character Indicators for SD Iqra 1
  const indicators = [
    { name: "Salat 5 Waktu", description: "Melaksanakan salat wajib 5 waktu" },
    { name: "Membaca Al-Qur'an", description: "Tilawah harian" },
    { name: "Infaq", description: "Bersedekah/Infaq" },
    { name: "Menjaga Kebersihan", description: "Menjaga kebersihan diri dan lingkungan" }
  ];

  for (const ind of indicators) {
    const existing = await prisma.characterIndicator.findFirst({ 
      where: { name: ind.name, unitId: sdIqra1.id }
    });
    if (!existing) {
      await prisma.characterIndicator.create({
        data: {
          name: ind.name,
          description: ind.description,
          unitId: sdIqra1.id
        }
      });
    }
  }

  // Seed 20 Students
  for (let i = 1; i <= 20; i++) {
    const nisn = `0012026${i.toString().padStart(3, '0')}`;
    let studentData = await prisma.studentData.findFirst({ where: { nisn } });
    
    if (!studentData) {
      const regId = crypto.randomUUID();
      const parentId = supervisor.id; // Just use supervisor as parent for mock
      const regNumber = `REG-${nisn}`;

      let registration = await prisma.registration.findFirst({ where: { registrationNumber: regNumber } });
      if (!registration) {
        registration = await prisma.registration.create({
          data: {
            id: regId,
            parentId: parentId,
            academicYearId: academicYear.id,
            registrationNumber: regNumber,
            status: "accepted"
          }
        });
      }
      
      studentData = await prisma.studentData.create({
        data: {
          registrationId: registration.id,
          fullName: `Siswa Testing ${i}`,
          nickname: `Siswa ${i}`,
          gender: i % 2 === 0 ? "female" : "male",
          birthPlace: "Bekasi",
          birthDate: new Date("2019-01-01"),
          nisn: nisn,
          address: "Jl. Testing No. " + i
        }
      });

      await prisma.studentEnrollment.create({
        data: {
          registrationId: registration.id,
          classId: class1A.id,
          academicYearId: academicYear.id,
          studentDataId: studentData.id,
          parentId: parentId,
          status: "active",
          enrollmentType: "new_ppdb"
        }
      });
      console.log(`Student ${i} created.`);
    }
  }

  console.log("Seeding complete!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
