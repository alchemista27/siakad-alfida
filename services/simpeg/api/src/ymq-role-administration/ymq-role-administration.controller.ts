import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { YmqRoleAdministrationService } from "./ymq-role-administration.service";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function userIdFrom(input: unknown): string {
  const value = typeof input === "object" && input !== null && "userId" in input ? (input as { userId?: unknown }).userId : undefined;
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) throw new BadRequestException("userId harus berupa UUID yang valid.");
  return value;
}

function assertUserId(value: string): string {
  if (!UUID_PATTERN.test(value)) throw new BadRequestException("userId harus berupa UUID yang valid.");
  return value;
}

@Controller("ymq/roles")
@UseGuards(ServiceJwtAuthGuard, SimpegRolesGuard)
@SimpegRoles("super_admin")
export class YmqRoleAdministrationController {
  constructor(private readonly ymqRoleAdministrationService: YmqRoleAdministrationService) {}

  @Get("admins")
  listAdmins() {
    return this.ymqRoleAdministrationService.listAdmins();
  }

  @Post("admins")
  assignAdminYmq(@Req() req: { user: { id: string } }, @Body() body: unknown) {
    return this.ymqRoleAdministrationService.assignAdminYmq(req.user.id, userIdFrom(body));
  }

  @Delete("admins/:userId")
  revokeAdminYmq(@Req() req: { user: { id: string } }, @Param("userId") userId: string) {
    return this.ymqRoleAdministrationService.revokeAdminYmq(req.user.id, assertUserId(userId));
  }
}
