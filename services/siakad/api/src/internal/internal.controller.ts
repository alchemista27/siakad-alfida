import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InternalService } from "./internal.service";
import { SpmbHandoffPayloadSchema, type SpmbHandoffReceipt } from "@alfida/contracts";

@Controller("internal")
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  private verifySecret(secretKey?: string) {
    const expectedKey = process.env.INTERNAL_SERVICE_SECRET || process.env.INTERNAL_SERVICE_TOKEN;
    if (!expectedKey || !expectedKey.trim()) {
      throw new InternalServerErrorException("Layanan internal belum dikonfigurasi.");
    }

    if (!secretKey || secretKey.trim() !== expectedKey.trim()) {
      throw new UnauthorizedException("Kunci layanan internal tidak valid.");
    }
  }

  @Post("spmb-handoff")
  async handleSpmbHandoff(
    @Headers("x-internal-service-key") secretKey: string | undefined,
    @Headers("x-internal-service-token") tokenKey: string | undefined,
    @Body() rawPayload: unknown,
  ): Promise<SpmbHandoffReceipt> {
    this.verifySecret(secretKey || tokenKey);

    const parsed = SpmbHandoffPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Payload handoff SPMB tidak valid.",
        errors: parsed.error.issues,
      });
    }

    return this.internalService.receiveSpmbHandoff(parsed.data);
  }

  @Get("units")
  async getUnits(
    @Headers("x-internal-service-key") secretKey: string | undefined,
    @Headers("x-internal-service-token") tokenKey: string | undefined,
  ) {
    this.verifySecret(secretKey || tokenKey);
    return this.internalService.getUnits();
  }
}
