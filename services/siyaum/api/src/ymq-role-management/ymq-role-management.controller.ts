import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { YmqRoleManagementService } from "./ymq-role-management.service";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function userIdFrom(body: unknown): string {
  const userId = typeof body === "object" && body !== null && "userId" in body ? (body as { userId?: unknown }).userId : undefined;
  if (typeof userId !== "string" || !UUID_PATTERN.test(userId)) throw new BadRequestException("userId harus berupa UUID yang valid.");
  return userId;
}

@Controller("ymq/roles")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
@YmqRoles("admin_ymq")
export class YmqRoleManagementController {
  constructor(private readonly roleManagementService: YmqRoleManagementService) {}

  @Get("participants")
  listParticipants(@Req() req: any) {
    return this.roleManagementService.listParticipants(req.user);
  }

  @Post("participants")
  assignParticipant(@Body() body: unknown, @Req() req: any) {
    return this.roleManagementService.assignParticipant(userIdFrom(body), req.user);
  }

  @Delete("participants/:userId")
  revokeParticipant(@Param("userId") userId: string, @Req() req: any) {
    if (!UUID_PATTERN.test(userId)) throw new BadRequestException("userId harus berupa UUID yang valid.");
    return this.roleManagementService.revokeParticipant(userId, req.user);
  }
}
