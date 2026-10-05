import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const teachers = await prisma.user.findMany({ 
    where: { roles: { some: { role: 'guru' } } }
  });
  console.log("Teachers:", teachers.map(t => ({ id: t.id, name: t.name, email: t.email })));
}
main().catch(console.error).finally(() => prisma.$disconnect());
