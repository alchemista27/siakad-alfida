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
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";

@Controller("observations")
export class ObservationsController {
  constructor(private readonly observationsService: ObservationsService) {}

  @Get("schedules/:periodId")
  async listSchedules(@Param("periodId") periodId: string) {
    return this.observationsService.listSchedules(periodId);
  }

  @Post("schedules")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async createSchedule(@Body() dto: CreateScheduleDto) {
    return this.observationsService.createSchedule(dto);
  }

  @Delete("schedules/:id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async deleteSchedule(@Param("id") id: string) {
    return this.observationsService.deleteSchedule(id);
  }

  @Post("book")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async bookSchedule(@Req() req: any, @Body() dto: BookScheduleDto) {
    return this.observationsService.bookSchedule(req.user.id, dto);
  }

  @Post("submit-result")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("observer", "admin_unit", "tim_ppdb")
  async submitResult(@Req() req: any, @Body() dto: SubmitObservationResultDto) {
    return this.observationsService.submitResult(req.user.id, dto);
  }

  @Get("rankings/:periodId")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async getRankings(
    @Param("periodId") periodId: string,
    @Query("unitId") unitId?: string
  ) {
    return this.observationsService.getRankings(periodId, unitId);
  }
}
