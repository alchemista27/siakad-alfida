import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { DecisionsService } from "./decisions.service";
import { SingleDecisionDto, BatchDecisionDto } from "./decisions.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";

@Controller("decisions")
@UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post("single")
  @SpmbRoles("admin_unit")
  async setSingleDecision(@Req() req: any, @Body() dto: SingleDecisionDto) {
    return this.decisionsService.setSingleDecision(req.user, dto);
  }

  @Post("batch")
  @SpmbRoles("admin_unit")
  async setBatchDecision(@Req() req: any, @Body() dto: BatchDecisionDto) {
    return this.decisionsService.setBatchDecision(req.user, dto);
  }

  @Get("statistics/:periodId")
  @SpmbRoles("admin_unit", "tim_ppdb")
  async getStatistics(@Param("periodId") periodId: string, @Req() req: any) {
    return this.decisionsService.getStatistics(periodId, req.user);
  }
}
