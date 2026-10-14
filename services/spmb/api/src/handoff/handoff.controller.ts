import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { HandoffService } from "./handoff.service";
import { SyncHandoffDto, BatchSyncHandoffDto } from "./handoff.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";

@Controller("handoff")
@UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
export class HandoffController {
  constructor(private readonly handoffService: HandoffService) {}

  @Post("sync")
  @SpmbRoles("admin_unit")
  async syncSingle(@Req() req: any, @Body() dto: SyncHandoffDto) {
    return this.handoffService.syncSingle(req.user.id, dto);
  }

  @Post("sync-batch")
  @SpmbRoles("admin_unit")
  async syncBatch(@Req() req: any, @Body() dto: BatchSyncHandoffDto) {
    return this.handoffService.syncBatch(req.user.id, dto);
  }

  @Get("status/:periodId")
  @SpmbRoles("admin_unit", "tim_ppdb")
  async listStatus(
    @Param("periodId") periodId: string,
    @Query("unitId") unitId?: string
  ) {
    return this.handoffService.listHandoffStatus(periodId, unitId);
  }
}
