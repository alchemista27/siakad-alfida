import { PrismaClient } from "@sim/database";

const prisma = new PrismaClient();

async function main() {
  console.log("Removing supervisor.kesiswaan user and role assignments...");

  const user = await prisma.user.findUnique({
    where: { email: "supervisor.kesiswaan@alfida.or.id" }
  });

  if (user) {
    // Delete user role assignments first (if cascade isn't configured for it)
    await prisma.userRoleAssignment.deleteMany({
      where: { userId: user.id }
    });

    // Delete related registrations (foreign key constraint)
    await prisma.studentEnrollment.deleteMany({
      where: { parentId: user.id }
    });
    
    await prisma.registration.deleteMany({
      where: { parentId: user.id }
    });

    // Delete accounts
    await prisma.account.deleteMany({
      where: { accountId: user.id }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: user.id }
    });
    console.log(`✓ Deleted user ${user.email} and all associated records.`);
  } else {
    console.log("User supervisor.kesiswaan@alfida.or.id not found. Moving on.");
  }

  console.log("Cleanup complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
