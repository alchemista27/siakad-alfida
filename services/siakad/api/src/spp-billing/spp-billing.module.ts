import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SppBillingController } from "./spp-billing.controller";
import { SppBillingService } from "./spp-billing.service";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [SppBillingController],
  providers: [SppBillingService],
})
export class SppBillingModule {}
