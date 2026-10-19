import { Module } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InternalServiceAuthGuard } from "./internal-service-auth.guard";
import { InternalSppController } from "./internal-spp.controller";
import { InternalSppService } from "./internal-spp.service";

@Module({
  controllers: [InternalSppController],
  providers: [
    InternalServiceAuthGuard,
    {
      provide: InternalSppService,
      useFactory: (prisma: PrismaService) => new InternalSppService({
        findByEnrollmentIds: (enrollmentIds) => prisma.sppInvoice.findMany({
          where: { enrollmentId: { in: enrollmentIds } },
          orderBy: [{ dueDate: "asc" }, { createdAt: "asc" }],
        }),
        findById: (id) => prisma.sppInvoice.findUnique({ where: { id } }),
      }),
      inject: [PrismaService],
    },
  ],
})
export class InternalModule {}
