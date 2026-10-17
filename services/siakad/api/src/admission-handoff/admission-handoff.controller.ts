import { Controller, Post, Body, Headers, UnauthorizedException } from "@nestjs/common";
import { AdmissionHandoffService } from "./admission-handoff.service";
import { SiakadAdmissionHandoffPayloadSchema, type SiakadAdmissionHandoffPayload } from "@alfida/contracts";

@Controller("admission-handoff")
export class AdmissionHandoffController {
  constructor(private readonly admissionHandoffService: AdmissionHandoffService) {}

  @Post()
  async receiveHandoff(
    @Headers("x-internal-service-token") serviceToken: string,
    @Body() rawPayload: unknown,
  ) {
    const expectedToken = process.env.INTERNAL_SERVICE_TOKEN;
    if (!expectedToken || serviceToken !== expectedToken) {
      throw new UnauthorizedException("Token internal service tidak valid");
    }

    const parsed = SiakadAdmissionHandoffPayloadSchema.parse(rawPayload);
    return this.admissionHandoffService.receiveAdmissionHandoff(parsed);
  }
}
