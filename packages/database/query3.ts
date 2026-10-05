import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const teacherId = '7cee1452-8d91-4155-aa56-a1eb7f57d891';
  const homeroom = await prisma.homeroomAssignment.findMany({ where: { teacherId } });
  console.log("Homeroom:", homeroom);
  const teacherAssignment = await prisma.teacherAssignment.findMany({ where: { teacherId }, include: { subject: true } });
  console.log("Teacher Assignment:", teacherAssignment);
}
main().catch(console.error).finally(() => prisma.$disconnect());
