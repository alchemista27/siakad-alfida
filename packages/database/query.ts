import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const teacher = await prisma.user.findFirst({ where: { name: { contains: "Guru Testing", mode: "insensitive" } } });
  console.log("Teacher:", teacher);
  if (teacher) {
    const homeroom = await prisma.homeroomAssignment.findMany({ where: { teacherId: teacher.id } });
    console.log("Homeroom:", homeroom);
    const teacherAssignment = await prisma.teacherAssignment.findMany({ where: { teacherId: teacher.id } });
    console.log("Teacher Assignment:", teacherAssignment);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
