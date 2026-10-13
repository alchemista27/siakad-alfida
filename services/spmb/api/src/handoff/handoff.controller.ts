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

@Controller("handoff")
@UseGuards(ServiceJwtAuthGuard)
export class HandoffController {
  constructor(private readonly handoffService: HandoffService) {}

  @Post("sync")
  async syncSingle(@Req() req: any, @Body() dto: SyncHandoffDto) {
    return this.handoffService.syncSingle(req.user.id, dto);
  }

  @Post("sync-batch")
  async syncBatch(@Req() req: any, @Body() dto: BatchSyncHandoffDto) {
    return this.handoffService.syncBatch(req.user.id, dto);
  }

  @Get("status/:periodId")
  async listStatus(
    @Param("periodId") periodId: string,
    @Query("unitId") unitId?: string
  ) {
    return this.handoffService.listHandoffStatus(periodId, unitId);
  }
}
