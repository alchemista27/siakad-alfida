import { Body, Controller, Delete, Param, Post, Put, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { AssignGroupStaffDto } from "./group-staff.dto";
import { GroupStaffService } from "./group-staff.service";

@Controller("groups")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
@YmqRoles("admin_ymq")
export class GroupStaffController {
  constructor(private readonly groupStaffService: GroupStaffService) {}

  @Put(":groupId/pembina")
  assignPembina(@Param("groupId") groupId: string, @Body() dto: AssignGroupStaffDto, @Req() req: any) {
    return this.groupStaffService.assignPembina(groupId, dto.userId, req.user);
  }

  @Delete(":groupId/pembina")
  revokePembina(@Param("groupId") groupId: string, @Req() req: any) {
    return this.groupStaffService.revokePembina(groupId, req.user);
  }

  @Post(":groupId/admins")
  assignGroupAdmin(@Param("groupId") groupId: string, @Body() dto: AssignGroupStaffDto, @Req() req: any) {
    return this.groupStaffService.assignGroupAdmin(groupId, dto.userId, req.user);
  }

  @Delete(":groupId/admins/:userId")
  revokeGroupAdmin(@Param("groupId") groupId: string, @Param("userId") userId: string, @Req() req: any) {
    return this.groupStaffService.revokeGroupAdmin(groupId, userId, req.user);
  }
}
