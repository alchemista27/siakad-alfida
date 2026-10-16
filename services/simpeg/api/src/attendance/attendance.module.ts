import { Module } from "@nestjs/common";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";

@Module({
  controllers: [AttendanceController],
  providers: [AttendanceService, SimpegRolesGuard],
  exports: [AttendanceService],
})
export class AttendanceModule {}
