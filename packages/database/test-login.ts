import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = "merianahdunan@gmail.com"; // from earlier
  const user = await prisma.user.findUnique({
    where: { email },
    include: { accounts: true }
  });
  
  if (!user) return console.log("User not found");
  
  const account = user.accounts.find(a => a.providerId === 'credential');
  if (!account || !account.password) return console.log("Account not found");

  console.log("Hash in DB:", account.password);
  
  // What did they type? We don't know the password, but we can verify if compare crashes
  try {
    const isValid = await bcrypt.compare("Password123!", account.password);
    console.log("Is valid?", isValid);
  } catch (e) {
    console.error("Compare error:", e);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
