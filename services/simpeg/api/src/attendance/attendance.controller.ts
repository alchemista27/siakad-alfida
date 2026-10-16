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
  ValidationPipe,
} from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import { GpsCheckInOutDto, UpsertGpsConfigDto, UpsertHolidayDto } from "./attendance.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";

const HR_ADMIN_ROLES = ["super_admin", "admin_kepegawaian", "admin_bidang", "admin_unit", "admin_unit_nondik"];

@Controller("attendance")
@UseGuards(ServiceJwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("context")
  async getTodayContext(@Req() req: any) {
    return this.attendanceService.getTodayAttendanceContext(req.user.id);
  }

  @Post("check-in")
  async checkIn(@Req() req: any, @Body() dto: GpsCheckInOutDto) {
    return this.attendanceService.checkIn(req.user.id, dto);
  }

  @Post("check-out")
  async checkOut(@Req() req: any, @Body() dto: GpsCheckInOutDto) {
    return this.attendanceService.checkOut(req.user.id, dto);
  }

  @Get("my-history")
  async getMyHistory(
    @Req() req: any,
    @Query("month") month: string,
    @Query("year") year: string
  ) {
    const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
    const y = year ? parseInt(year, 10) : new Date().getFullYear();
    return this.attendanceService.getMyAttendanceHistory(req.user.id, m, y);
  }

  @Get("recap")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HR_ADMIN_ROLES)
  async getRecap(
    @Query("start") start: string,
    @Query("end") end: string,
    @Query("unitId") unitId?: string
  ) {
    const startDate = start || new Date().toISOString().slice(0, 10);
    const endDate = end || new Date().toISOString().slice(0, 10);
    return this.attendanceService.getAttendanceRecap(startDate, endDate, unitId);
  }

  @Get("configs")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HR_ADMIN_ROLES)
  async getConfigs(@Req() req: any) {
    return this.attendanceService.getGpsConfigs(req.user);
  }

  @Post("configs")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles("super_admin", "admin_kepegawaian", "admin_unit", "admin_unit_nondik")
  async upsertConfig(
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: UpsertGpsConfigDto,
    @Req() req: any,
  ) {
    return this.attendanceService.upsertGpsConfig(dto, req.user);
  }

  @Get("holidays")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HR_ADMIN_ROLES)
  async getHolidays(@Query("unitId") unitId?: string) {
    return this.attendanceService.getHolidays(unitId);
  }

  @Post("holidays")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles("super_admin", "admin_kepegawaian", "admin_bidang")
  async upsertHoliday(@Body() dto: UpsertHolidayDto) {
    return this.attendanceService.upsertHoliday(dto);
  }

  @Delete("holidays/:id")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles("super_admin", "admin_kepegawaian", "admin_bidang")
  async deleteHoliday(@Param("id") id: string) {
    return this.attendanceService.deleteHoliday(id);
  }
}
