import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../prisma/prisma.module";
import { SppBillingController } from "./spp-billing.controller";
import { SISKEU_BILLING_FETCH, SppBillingService } from "./spp-billing.service";

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [SppBillingController],
  providers: [
    { provide: SISKEU_BILLING_FETCH, useValue: fetch },
    SppBillingService,
  ],
})
export class SppBillingModule {}
