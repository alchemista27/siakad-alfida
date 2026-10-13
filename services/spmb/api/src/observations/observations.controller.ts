import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ObservationsService } from "./observations.service";
import { CreateScheduleDto, BookScheduleDto, SubmitObservationResultDto } from "./observations.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("observations")
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService) {}

  @Get("schedules/:periodId")
  async listSchedules(@Param("periodId") periodId: string) {
    return this.observationsService.listSchedules(periodId);
  }

  @Post("schedules")
  @UseGuards(ServiceJwtAuthGuard)
  async createSchedule(@Body() dto: CreateScheduleDto) {
    return this.observationsService.createSchedule(dto);
  }

  @Delete("schedules/:id")
  @UseGuards(ServiceJwtAuthGuard)
  async deleteSchedule(@Param("id") id: string) {
    return this.observationsService.deleteSchedule(id);
  }

  @Post("book")
  @UseGuards(ServiceJwtAuthGuard)
  async bookSchedule(@Req() req: any, @Body() dto: BookScheduleDto) {
    return this.observationsService.bookSchedule(req.user.id, dto);
  }

  @Post("submit-result")
  @UseGuards(ServiceJwtAuthGuard)
  async submitResult(@Req() req: any, @Body() dto: SubmitObservationResultDto) {
    return this.observationsService.submitResult(req.user.id, dto);
  }

  @Get("rankings/:periodId")
  @UseGuards(ServiceJwtAuthGuard)
  async getRankings(
    @Param("periodId") periodId: string,
    @Query("unitId") unitId?: string
  ) {
    return this.observationsService.getRankings(periodId, unitId);
  }
}
