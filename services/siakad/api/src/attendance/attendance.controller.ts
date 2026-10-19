import { Body, Controller, Get, Param, Put, Query, UseGuards } from "@nestjs/common";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import { AttendanceService, type AttendanceBatchDto } from "./attendance.service";

@Controller("attendance")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("guru")
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get("schedules/:scheduleId")
  listBySchedule(@CurrentPrincipal() principal: SiakadPrincipal, @Param("scheduleId") scheduleId: string, @Query("date") date: string) {
    return this.attendanceService.listBySchedule(principal, scheduleId, date);
  }

  @Put("schedules/:scheduleId/batch")
  batchUpsert(@CurrentPrincipal() principal: SiakadPrincipal, @Param("scheduleId") scheduleId: string, @Body() dto: AttendanceBatchDto) {
    return this.attendanceService.batchUpsert(principal, scheduleId, dto);
  }
}
