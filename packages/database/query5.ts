import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const ay = await prisma.academicYear.findUnique({ where: { id: '721ca94b-6f55-41f7-afa5-94df88cf29eb' } });
  console.log("Teacher's assignment AY:", ay);
}
main().catch(console.error).finally(() => prisma.$disconnect());
