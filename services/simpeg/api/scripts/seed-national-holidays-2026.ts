import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { seedNationalHolidays2026 } from "../src/attendance/national-holidays-2026";

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Refusing to seed national holidays with NODE_ENV=production.");
  }

  const prisma = new PrismaClient();
  try {
    const result = await seedNationalHolidays2026(prisma);
    console.log(`National holidays 2026 seeded: ${result.created} created, ${result.updated} updated, ${result.total} total.`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
