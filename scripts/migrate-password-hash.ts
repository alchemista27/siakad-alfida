import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.$executeRaw`UPDATE "shared"."users" SET "password_hash" = 'managed_by_better_auth'`;
  console.log(`Updated ${result} rows`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
