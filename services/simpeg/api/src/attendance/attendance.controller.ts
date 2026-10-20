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
import {
  GpsCheckInOutDto,
  UpsertGpsConfigDto,
  UpsertHolidayDto,
  UpsertSaturdayDutyAssignmentDto,
} from "./attendance.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";

const HR_ADMIN_ROLES = ["super_admin", "admin_kepegawaian", "admin_bidang", "admin_unit", "admin_unit_nondik"];
const HOLIDAY_AND_DUTY_MANAGER_ROLES = ["super_admin", "admin_kepegawaian", "admin_unit", "admin_unit_nondik"];
const strictValidation = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

@Controller("attendance")
@UseGuards(ServiceJwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("context")
  async getTodayContext(@Req() req: any) {
    return this.attendanceService.getTodayAttendanceContext(req.user.id);
  }

  @Post("check-in")
  async checkIn(@Req() req: any, @Body(strictValidation) dto: GpsCheckInOutDto) {
    return this.attendanceService.checkIn(req.user.id, dto);
  }

  @Post("check-out")
  async checkOut(@Req() req: any, @Body(strictValidation) dto: GpsCheckInOutDto) {
    return this.attendanceService.checkOut(req.user.id, dto);
  }

  @Get("my-history")
  async getMyHistory(
    @Req() req: any,
    @Query("month") month: string,
    @Query("year") year: string,
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
    @Query("unitId") unitId?: string,
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
  async upsertConfig(@Body(strictValidation) dto: UpsertGpsConfigDto, @Req() req: any) {
    return this.attendanceService.upsertGpsConfig(dto, req.user);
  }

  @Get("holidays")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HOLIDAY_AND_DUTY_MANAGER_ROLES)
  async getHolidays(@Query("unitId") unitId: string | undefined, @Req() req: any) {
    return this.attendanceService.getHolidays(unitId, req.user);
  }

  @Post("holidays")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HOLIDAY_AND_DUTY_MANAGER_ROLES)
  async upsertHoliday(@Body(strictValidation) dto: UpsertHolidayDto, @Req() req: any) {
    return this.attendanceService.upsertHoliday(dto, req.user);
  }

  @Delete("holidays/:id")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HOLIDAY_AND_DUTY_MANAGER_ROLES)
  async deleteHoliday(@Param("id") id: string, @Req() req: any) {
    return this.attendanceService.deleteHoliday(id, req.user);
  }

  @Get("saturday-duties")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HOLIDAY_AND_DUTY_MANAGER_ROLES)
  async getSaturdayDuties(@Query("unitId") unitId: string | undefined, @Req() req: any) {
    return this.attendanceService.getSaturdayDutyAssignments(unitId, req.user);
  }

  @Post("saturday-duties")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HOLIDAY_AND_DUTY_MANAGER_ROLES)
  async upsertSaturdayDuty(@Body(strictValidation) dto: UpsertSaturdayDutyAssignmentDto, @Req() req: any) {
    return this.attendanceService.upsertSaturdayDutyAssignment(dto, req.user);
  }

  @Delete("saturday-duties/:id")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HOLIDAY_AND_DUTY_MANAGER_ROLES)
  async deleteSaturdayDuty(@Param("id") id: string, @Req() req: any) {
    return this.attendanceService.deleteSaturdayDutyAssignment(id, req.user);
  }
}
