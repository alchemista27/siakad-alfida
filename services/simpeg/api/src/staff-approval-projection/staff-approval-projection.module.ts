import { Module } from "@nestjs/common";
import { InternalStaffApprovalGuard } from "./internal-staff-approval.guard";
import { StaffApprovalProjectionController } from "./staff-approval-projection.controller";
import { StaffApprovalProjectionService } from "./staff-approval-projection.service";

@Module({
  controllers: [StaffApprovalProjectionController],
  providers: [InternalStaffApprovalGuard, StaffApprovalProjectionService],
})
export class StaffApprovalProjectionModule {}
