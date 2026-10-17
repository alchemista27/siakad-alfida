import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ObservationsService } from "./observations.service";
import {
  CreateScheduleDto,
  UpdateScheduleDto,
  BookScheduleDto,
  SubmitObservationResultDto,
} from "./observations.dto";
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
  async createSchedule(@Req() req: any, @Body() dto: CreateScheduleDto) {
    return this.observationsService.createSchedule(dto, req.user);
  }

  @Put("schedules/:id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async updateSchedule(@Param("id") id: string, @Req() req: any, @Body() dto: UpdateScheduleDto) {
    return this.observationsService.updateSchedule(id, dto, req.user);
  }

  @Delete("schedules/:id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async deleteSchedule(@Param("id") id: string, @Req() req: any) {
    return this.observationsService.deleteSchedule(id, req.user);
  }

  @Post("book")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async bookSchedule(@Req() req: any, @Body() dto: BookScheduleDto) {
    return this.observationsService.bookSchedule(req.user.id, dto);
  }

  @Post("submit-result")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("observer")
  async submitResult(@Req() req: any, @Body() dto: SubmitObservationResultDto) {
    return this.observationsService.submitResult(req.user, dto);
  }

  @Get("rankings/:periodId")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("observer", "admin_unit", "tim_ppdb")
  async getRankings(@Param("periodId") periodId: string, @Req() req: any) {
    return this.observationsService.getRankings(periodId, req.user);
  }
}
