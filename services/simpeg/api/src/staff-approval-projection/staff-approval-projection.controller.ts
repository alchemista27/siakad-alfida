import { Body, Controller, Param, Put, UseGuards } from "@nestjs/common";
import { InternalStaffApprovalGuard } from "./internal-staff-approval.guard";
import {
  parseStaffApprovalProjection,
  StaffApprovalProjectionService,
} from "./staff-approval-projection.service";

@Controller("internal/staff-approvals")
@UseGuards(InternalStaffApprovalGuard)
export class StaffApprovalProjectionController {
  constructor(private readonly staffApprovals: StaffApprovalProjectionService) {}

  @Put("users/:id")
  upsert(@Param("id") id: string, @Body() body: unknown) {
    return this.staffApprovals.upsert(id, parseStaffApprovalProjection(body));
  }
}
