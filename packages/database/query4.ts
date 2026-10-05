import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const activeYear = await prisma.academicYear.findFirst({
    orderBy: { startDate: 'desc' }
  });
  console.log("Active year from query:", activeYear);
}
main().catch(console.error).finally(() => prisma.$disconnect());
