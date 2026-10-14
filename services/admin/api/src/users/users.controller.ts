import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  CreateUserManualDto,
  AddRoleDto,
  ResetPasswordDto,
  BatchImportUsersDto,
} from "./dto/users.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { AdminRolesGuard, AdminRoles } from "../common/guards/admin-roles.guard";

@Controller("admin/users")
@UseGuards(ServiceJwtAuthGuard, AdminRolesGuard)
@AdminRoles("super_admin")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getUsers(
    @Query("search") search?: string,
    @Query("app") app?: string,
    @Query("role") role?: string,
    @Query("isActive") isActive?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string
  ) {
    const isActiveBool =
      isActive === "true" ? true : isActive === "false" ? false : undefined;

    return this.usersService.getUsers({
      search,
      app,
      role,
      isActive: isActiveBool,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get("pending")
  async getPendingApprovals() {
    return this.usersService.getPendingApprovals();
  }

  @Patch(":id/approve")
  async approveUser(@Param("id") id: string) {
    return this.usersService.approveUser(id);
  }

  @Delete(":id/reject")
  async rejectUser(@Param("id") id: string) {
    return this.usersService.rejectUser(id);
  }

  @Post("manual")
  @HttpCode(HttpStatus.CREATED)
  async createUserManual(@Body() body: CreateUserManualDto) {
    return this.usersService.createUserManual(body);
  }

  @Post("batch-import")
  @HttpCode(HttpStatus.OK)
  async batchImportUsers(@Body() body: BatchImportUsersDto) {
    return this.usersService.batchImportUsers(body);
  }

  @Patch(":id/status")
  async toggleStatus(
    @Param("id") id: string,
    @Body("isActive") isActive: boolean
  ) {
    return this.usersService.toggleUserStatus(id, isActive);
  }

  @Post(":id/roles")
  @HttpCode(HttpStatus.CREATED)
  async addRole(
    @Param("id") id: string,
    @Body() body: AddRoleDto
  ) {
    return this.usersService.addRole(id, body);
  }

  @Delete("roles/:roleAssignmentId")
  async removeRole(@Param("roleAssignmentId") roleAssignmentId: string) {
    return this.usersService.removeRole(roleAssignmentId);
  }

  @Put(":id/password")
  async resetPassword(
    @Param("id") id: string,
    @Body() body: ResetPasswordDto
  ) {
    return this.usersService.resetPassword(id, body);
  }

  @Delete(":id")
  async deleteUser(@Param("id") id: string) {
    return this.usersService.deleteUser(id);
  }
}
