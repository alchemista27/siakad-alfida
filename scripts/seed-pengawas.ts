import { PrismaClient, UserRole } from "@sim/database";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("4dmin4lfid4", 10);
  
  const user = await prisma.user.upsert({
    where: { email: "pengawas@alfida.or.id" },
    update: { passwordHash: hash },
    create: {
      id: crypto.randomUUID(),
      email: "pengawas@alfida.or.id",
      passwordHash: hash,
      name: "Pengawas Yayasan",
      fullName: "Bapak Pengawas Yayasan",
      isActive: true,
      emailVerified: true
    }
  });

  const existingRole = await prisma.userRoleAssignment.findFirst({
    where: { userId: user.id, role: UserRole.pengawas_yayasan }
  });

  if (!existingRole) {
    await prisma.userRoleAssignment.create({
      data: {
        userId: user.id,
        role: UserRole.pengawas_yayasan
      }
    });
  }

  const existingAccount = await prisma.account.findFirst({
    where: { userId: user.id, providerId: "credential" }
  });

  if (!existingAccount) {
    await prisma.account.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        accessToken: "",
        refreshToken: "",
        password: hash
      }
    });
  } else {
    await prisma.account.update({
      where: { id: existingAccount.id },
      data: { password: hash }
    });
  }

  console.log("✅ Akun Pengawas Yayasan berhasil dibuat:");
  console.log("Email: pengawas@alfida.or.id");
  console.log("Password: 4dmin4lfid4");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
