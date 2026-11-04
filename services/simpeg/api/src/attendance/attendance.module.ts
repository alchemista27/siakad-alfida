import { Module } from "@nestjs/common";
import { AttendanceController } from "./attendance.controller";
import { AttendanceService } from "./attendance.service";
import { SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { EmployeesModule } from "../employees/employees.module";
import { FingerprintDeviceClient } from "./fingerprint-device.client";
import { FingerprintAttendanceService } from "./fingerprint-attendance.service";
import { FingerprintSyncProcessor } from "./fingerprint-sync.processor";
import { FoundationBrandingClient, FOUNDATION_BRANDING_FETCH } from "./foundation-branding.client";
import { AttendanceReportPdfService } from "./attendance-report-pdf.service";
import { AttendanceReportPdfExportService } from "./attendance-report-pdf-export.service";

@Module({
  imports: [EmployeesModule],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    SimpegRolesGuard,
    { provide: FingerprintDeviceClient, useFactory: () => new FingerprintDeviceClient() },
    FingerprintAttendanceService,
    FingerprintSyncProcessor,
    { provide: FOUNDATION_BRANDING_FETCH, useValue: fetch },
    FoundationBrandingClient,
    AttendanceReportPdfService,
    AttendanceReportPdfExportService,
  ],
  exports: [AttendanceService, FingerprintAttendanceService],
})
export class AttendanceModule {}
