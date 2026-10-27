import { PrismaClient } from "../src/generated/prisma";
import { renameSpmbTeamRole } from "../src/users/rename-spmb-team-role";

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await renameSpmbTeamRole(prisma, process.argv.includes("--apply"));
    console.log(JSON.stringify(result));
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
