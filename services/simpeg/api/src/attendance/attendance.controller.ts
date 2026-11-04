import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Res,
  ValidationPipe,
} from "@nestjs/common";
import { AttendanceService } from "./attendance.service";
import {
  GpsCheckInOutDto,
  UpsertGpsConfigDto,
  UpsertHolidayDto,
  UpsertSaturdayDutyAssignmentDto,
  UpsertUnitWorkScheduleDto,
  SyncFingerprintDto,
  UpdateFingerprintEnrollmentDto,
} from "./attendance.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { FingerprintAttendanceService } from "./fingerprint-attendance.service";
import { AttendanceReportPdfExportService } from "./attendance-report-pdf-export.service";
import type { Response } from "express";

const HR_ADMIN_ROLES = ["super_admin", "admin_kepegawaian", "admin_bidang", "admin_unit", "admin_unit_nondik"];
const REPORT_MANAGER_ROLES = ["super_admin", "admin_kepegawaian", "admin_unit", "admin_unit_nondik"];
const HOLIDAY_AND_DUTY_MANAGER_ROLES = ["super_admin", "admin_kepegawaian", "admin_unit", "admin_unit_nondik"];
const FINGERPRINT_OPERATOR_ROLES = ["super_admin", "admin_kepegawaian"];
const FINGERPRINT_MAPPING_ROLES = [...FINGERPRINT_OPERATOR_ROLES, "admin_unit", "admin_unit_nondik"];
const strictValidation = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

@Controller("attendance")
@UseGuards(ServiceJwtAuthGuard)
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly fingerprintAttendance: FingerprintAttendanceService,
    private readonly attendanceReportPdfExport: AttendanceReportPdfExportService,
  ) {}

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

  @Get("fingerprint/status")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...FINGERPRINT_OPERATOR_ROLES)
  async getFingerprintStatus() {
    return this.fingerprintAttendance.getStatus();
  }

  @Post("fingerprint/sync")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...FINGERPRINT_OPERATOR_ROLES)
  async syncFingerprint(@Body(strictValidation) dto: SyncFingerprintDto) {
    return this.fingerprintAttendance.sync(dto);
  }

  @Get("fingerprint/unmatched")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...FINGERPRINT_OPERATOR_ROLES)
  async getUnmatchedFingerprintEvents() {
    return this.fingerprintAttendance.unmatched();
  }

  @Put("fingerprint/mappings/:userId")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...FINGERPRINT_MAPPING_ROLES)
  async updateFingerprintMapping(
    @Param("userId") userId: string,
    @Body(strictValidation) dto: UpdateFingerprintEnrollmentDto,
    @Req() req: any,
  ) {
    return this.fingerprintAttendance.updateEnrollment(userId, dto.fingerprintEnrollmentId, req.user);
  }

  @Get("dashboard")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...REPORT_MANAGER_ROLES)
  async getAttendanceDashboard(
    @Query("month") month: string | undefined,
    @Query("unitId") unitId: string | undefined,
    @Query("source") source: string | undefined,
    @Req() req: any,
  ) {
    return this.attendanceService.getAttendanceDashboardReport(month, unitId, req.user, undefined, source);
  }

  @Get("report.pdf")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...REPORT_MANAGER_ROLES)
  async downloadAttendanceReportPdf(
    @Query("month") month: string | undefined,
    @Query("unitId") unitId: string | undefined,
    @Query("source") source: string | undefined,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const { buffer, filename } = await this.attendanceReportPdfExport.generate(month, unitId, source, req.user);
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.send(buffer);
  }

  @Get("recap")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HR_ADMIN_ROLES)
  async getRecap(
    @Query("start") start: string,
    @Query("end") end: string,
    @Query("unitId") unitId: string | undefined,
    @Query("source") source: string | undefined,
    @Req() req: any,
  ) {
    const startDate = start || new Date().toISOString().slice(0, 10);
    const endDate = end || new Date().toISOString().slice(0, 10);
    return this.attendanceService.getAttendanceRecap(startDate, endDate, unitId, req.user, source);
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

  @Get("work-schedules")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HOLIDAY_AND_DUTY_MANAGER_ROLES)
  async getWorkSchedules(@Query("unitId") unitId: string, @Req() req: any) {
    return this.attendanceService.getWorkSchedules(unitId, req.user);
  }

  @Put("work-schedules/:unitId/:weekday")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles(...HOLIDAY_AND_DUTY_MANAGER_ROLES)
  async upsertWorkSchedule(@Param("unitId") unitId: string, @Param("weekday") weekday: string,
    @Body(strictValidation) dto: UpsertUnitWorkScheduleDto, @Req() req: any) {
    return this.attendanceService.upsertWorkSchedule(unitId, Number(weekday), dto, req.user);
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
