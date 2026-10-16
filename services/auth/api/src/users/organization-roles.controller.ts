import { Body, Controller, Delete, Param, Post, UseGuards } from "@nestjs/common";
import { RequireRole, ServiceJwtAuthGuard, ServiceRolesGuard } from "@alfida/auth-sdk";
import { validatePublicOrganizationRoleInput } from "./organization-roles.dto";
import { UsersService } from "./users.service";
import { InternalOrganizationRolesGuard } from "./internal-organization-roles.guard";
import { validateInternalOrganizationRoleInput } from "./internal-organization-role.policy";

@Controller("users/organization-roles")
@UseGuards(ServiceJwtAuthGuard, ServiceRolesGuard)
export class OrganizationRolesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequireRole("admin_kepegawaian", { app: "simpeg" })
  upsert(@Body() body: unknown) {
    return this.usersService.upsertOrganizationRole(validatePublicOrganizationRoleInput(body));
  }

  @Delete()
  @RequireRole("admin_kepegawaian", { app: "simpeg" })
  removeScoped(@Body() body: unknown) {
    return this.usersService.removeOrganizationRole(validatePublicOrganizationRoleInput(body));
  }

  /** Compatibility endpoint for existing department-admin callers. */
  @Delete(":userId/:departmentId")
  @RequireRole("admin_kepegawaian", { app: "simpeg" })
  remove(@Param("userId") userId: string, @Param("departmentId") departmentId: string) {
    return this.usersService.removeOrganizationRole(userId, departmentId, "admin_bidang");
  }
}

@Controller("users/internal-organization-roles")
@UseGuards(InternalOrganizationRolesGuard)
export class InternalOrganizationRolesController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  upsert(@Body() body: unknown) {
    return this.usersService.upsertOrganizationRole(validateInternalOrganizationRoleInput(body));
  }

  @Delete(":userId/:departmentId/admin_biro")
  remove(@Param("userId") userId: string, @Param("departmentId") departmentId: string) {
    return this.usersService.removeOrganizationRole(userId, departmentId, "admin_biro", { idempotent: true });
  }
}
