import { Module } from "@nestjs/common";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { EmployeesModule } from "../employees/employees.module";
import { FingerprintDeviceClient } from "./fingerprint-device.client";
import { FingerprintAttendanceService } from "./fingerprint-attendance.service";
import { FingerprintSyncProcessor } from "./fingerprint-sync.processor";

@Module({
  imports: [EmployeesModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    SimpegRolesGuard,
    { provide: FingerprintDeviceClient, useFactory: () => new FingerprintDeviceClient() },
    FingerprintAttendanceService,
    FingerprintSyncProcessor,
  ],
  exports: [AttendanceService, FingerprintAttendanceService],
})
export class AttendanceModule {}
