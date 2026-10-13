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
import { DecisionsService } from "./decisions.service";
import { SingleDecisionDto, BatchDecisionDto } from "./decisions.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("decisions")
@UseGuards(ServiceJwtAuthGuard)
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post("single")
  async setSingleDecision(@Req() req: any, @Body() dto: SingleDecisionDto) {
    return this.decisionsService.setSingleDecision(req.user.id, dto);
  }

  @Post("batch")
  async setBatchDecision(@Req() req: any, @Body() dto: BatchDecisionDto) {
    return this.decisionsService.setBatchDecision(req.user.id, dto);
  }

  @Get("statistics/:periodId")
  async getStatistics(
    @Param("periodId") periodId: string,
    @Query("unitId") unitId?: string
  ) {
    return this.decisionsService.getStatistics(periodId, unitId);
  }
}
