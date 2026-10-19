import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ProviderWebhookGuard } from "./provider-webhook.guard";
import { PrismaSppInvoiceRepository } from "./prisma-spp-invoice.repository";
import { SppInvoiceController } from "./spp-invoice.controller";
import { SppInvoiceService } from "./spp-invoice.service";

@Module({
  imports: [AuthModule],
  controllers: [SppInvoiceController],
  providers: [
    ProviderWebhookGuard,
    PrismaSppInvoiceRepository,
    {
      provide: SppInvoiceService,
      useFactory: (repository: PrismaSppInvoiceRepository) => new SppInvoiceService(repository),
      inject: [PrismaSppInvoiceRepository],
    },
  ],
})
export class SppModule {}
