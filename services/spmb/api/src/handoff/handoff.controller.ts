import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  UseGuards,
  Req,
} from "@nestjs/common";
import { HandoffService } from "./handoff.service";
import { SyncHandoffDto, BatchSyncHandoffDto, ConfirmEnrollmentDto } from "./handoff.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";

@Controller("handoff")
export class HandoffController {
  constructor(private readonly handoffService: HandoffService) {}

  @Post("sync")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  async syncSingle(@Req() req: any, @Body() dto: SyncHandoffDto) {
    return this.handoffService.syncSingle(req.user, dto);
  }

  @Post("sync-batch")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  async syncBatch(@Req() req: any, @Body() dto: BatchSyncHandoffDto) {
    return this.handoffService.syncBatch(req.user, dto);
  }

  @Get("status/:periodId")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async listStatus(@Param("periodId") periodId: string, @Req() req: any) {
    return this.handoffService.listHandoffStatus(periodId, req.user);
  }

  @Post("confirm-enrollment")
  async confirmEnrollment(
    @Headers("x-internal-service-key") secretKey: string,
    @Body() dto: ConfirmEnrollmentDto,
  ) {
    return this.handoffService.confirmEnrollment(dto, secretKey);
  }
}
