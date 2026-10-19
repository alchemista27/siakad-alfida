import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { InternalServiceAuthGuard } from "./internal-service-auth.guard";
import { InternalSppService } from "./internal-spp.service";

@Controller("internal")
@UseGuards(InternalServiceAuthGuard)
export class InternalSppController {
  constructor(private readonly invoices: InternalSppService) {}

  @Get("spp/invoices")
  list(@Query("enrollmentIds") enrollmentIds: string | string[] | undefined) {
    return this.invoices.list(enrollmentIds);
  }

  @Post("spp/invoices/:id/payment-session")
  createPaymentSession(@Param("id") id: string, @Body() body: { enrollmentId?: unknown }) {
    return this.invoices.createPaymentSession(id, body?.enrollmentId);
  }
}
