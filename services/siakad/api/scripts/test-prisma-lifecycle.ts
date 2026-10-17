import { PrismaService } from "../src/prisma/prisma.service";

async function run() {
  let connects = 0;
  let disconnects = 0;
  const service = Object.create(PrismaService.prototype) as PrismaService & {
    $connect: () => Promise<void>;
    $disconnect: () => Promise<void>;
  };
  service.$connect = async () => {
    connects += 1;
  };
  service.$disconnect = async () => {
    disconnects += 1;
  };

  await service.onModuleInit();
  await service.onModuleDestroy();

  if (connects !== 1 || disconnects !== 1) {
    throw new Error("Prisma lifecycle must connect once on startup and disconnect once on shutdown");
  }

  console.log("SIAKAD Prisma lifecycle contract passed");
}

void run();
