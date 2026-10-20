import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Headers,
  Param,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from "@nestjs/common";
import { InternalService } from "./internal.service";
import { SpmbHandoffPayloadSchema, UnitProjectionPayloadSchema, UserProjectionPayloadSchema, type SpmbHandoffReceipt } from "@alfida/contracts";

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

  @Put("organization/units/:unitId")
  async putUnitProjection(
    @Headers("x-internal-service-token") token: string | undefined,
    @Param("unitId") unitId: string,
    @Body() rawPayload: unknown,
  ) {
    this.verifySecret(token);
    const parsed = UnitProjectionPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Payload proyeksi unit tidak valid.",
        errors: parsed.error.issues,
      });
    }
    if (parsed.data.id !== unitId) {
      throw new BadRequestException("Unit pada path harus sama dengan payload.");
    }
    return this.internalService.receiveUnitProjection(parsed.data);
  }

  @Put("organization/users/:userId")
  async putUserProjection(
    @Headers("x-internal-service-token") token: string | undefined,
    @Param("userId") userId: string,
    @Body() rawPayload: unknown,
  ) {
    this.verifySecret(token);
    const parsed = UserProjectionPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      throw new BadRequestException({
        message: "Payload proyeksi pengguna tidak valid.",
        errors: parsed.error.issues,
      });
    }
    if (parsed.data.id !== userId) {
      throw new BadRequestException("Pengguna pada path harus sama dengan payload.");
    }
    return this.internalService.receiveUserProjection(parsed.data);
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
