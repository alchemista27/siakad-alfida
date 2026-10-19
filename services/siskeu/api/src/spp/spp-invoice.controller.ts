import { Body, Controller, Param, Post, UseGuards } from "@nestjs/common";
import { SiskeuAuthGuard } from "../auth/siskeu-auth.guard";
import { SiskeuFinanceRoles, SiskeuRolesGuard } from "../auth/siskeu-roles.guard";
import { ProviderWebhookGuard } from "./provider-webhook.guard";
import { SppInvoiceService } from "./spp-invoice.service";

@Controller("spp/invoices")
export class SppInvoiceController {
  constructor(private readonly invoices: SppInvoiceService) {}

  @Post("generate")
  @UseGuards(SiskeuAuthGuard, SiskeuRolesGuard)
  @SiskeuFinanceRoles()
  generate(@Body() body: unknown) {
    return this.invoices.generate(body);
  }

  @Post(":id/provider-payment")
  @UseGuards(ProviderWebhookGuard)
  markPaidFromProvider(@Param("id") id: string, @Body() body: unknown) {
    return this.invoices.markPaidFromProvider(id, body);
  }
}
