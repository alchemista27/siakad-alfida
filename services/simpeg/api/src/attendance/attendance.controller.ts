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
import { AttendanceService } from "./attendance.service";
import { GpsCheckInOutDto, UpsertGpsConfigDto, UpsertHolidayDto } from "./attendance.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

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
  async getConfigs() {
    return this.attendanceService.getGpsConfigs();
  }

  @Post("configs")
  async upsertConfig(@Body() dto: UpsertGpsConfigDto) {
    return this.attendanceService.upsertGpsConfig(dto);
  }

  @Get("holidays")
  async getHolidays(@Query("unitId") unitId?: string) {
    return this.attendanceService.getHolidays(unitId);
  }

  @Post("holidays")
  async upsertHoliday(@Body() dto: UpsertHolidayDto) {
    return this.attendanceService.upsertHoliday(dto);
  }

  @Delete("holidays/:id")
  async deleteHoliday(@Param("id") id: string) {
    return this.attendanceService.deleteHoliday(id);
  }
}
