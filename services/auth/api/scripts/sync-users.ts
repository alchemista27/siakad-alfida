import { PrismaClient as AuthPrisma } from "../src/generated/prisma";
import * as bcrypt from "bcryptjs";

const authPrisma = new AuthPrisma({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/alfida_auth?schema=public",
    },
  },
});

async function main() {
  console.log("Memeriksa status akun dan konsistensi otentikasi...");

  // 1. Pastikan semua user memiliki status is_active = true untuk dev/testing
  const updatedActive = await authPrisma.user.updateMany({
    where: { isActive: false },
    data: { isActive: true },
  });
  console.log(`Akun diaktifkan: ${updatedActive.count}`);

  // 2. Ambil semua akun
  const users = await authPrisma.user.findMany({
    include: { accounts: true, roles: true },
  });
  console.log(`Total akun terdaftar di auth: ${users.length}`);

  // 3. Pastikan setiap user memiliki akun kredensial
  for (const user of users) {
    const credAccount = user.accounts.find((a) => a.providerId === "credential");
    if (!credAccount && user.passwordHash) {
      await authPrisma.account.create({
        data: {
          userId: user.id,
          providerId: "credential",
          accountId: user.id,
          password: user.passwordHash,
        },
      });
      console.log(`Membuat akun credential untuk ${user.email}`);
    }
  }

  console.log("Sinkronisasi dan verifikasi akun selesai 100%!");
}

main()
  .catch((e) => {
    console.error("Gagal sinkronisasi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await authPrisma.$disconnect();
  });
