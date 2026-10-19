import { Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import { SppBillingService } from "./spp-billing.service";

@Controller("billing")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("orang_tua")
export class SppBillingController {
  constructor(private readonly sppBillingService: SppBillingService) {}

  @Get("spp")
  list(@CurrentPrincipal() principal: SiakadPrincipal) {
    return this.sppBillingService.listForParent(principal);
  }

  @Post("spp/:invoiceId/payment-session")
  createPaymentSession(@CurrentPrincipal() principal: SiakadPrincipal, @Param("invoiceId") invoiceId: string) {
    return this.sppBillingService.createPaymentSession(principal, invoiceId);
  }
}
