import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import {
  ServiceJwtAuthGuard,
  ServiceRolesGuard,
  RequireRole,
} from "@alfida/auth-sdk";

@Controller("admin/users")
@UseGuards(ServiceJwtAuthGuard, ServiceRolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequireRole("super_admin", { app: "*" })
  async listUsers(
    @Query("page") page?: number,
    @Query("limit") limit?: number,
    @Query("search") search?: string,
    @Query("app") app?: string,
    @Query("role") role?: string
  ) {
    return this.usersService.findAll({ page, limit, search, app, role });
  }

  @Get(":id")
  @RequireRole("super_admin", { app: "*" })
  async getUser(@Param("id") id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @RequireRole("super_admin", { app: "*" })
  async createUser(
    @Body()
    body: {
      email: string;
      fullName: string;
      password: string;
      username?: string;
      phone?: string;
      role?: string;
      app?: string;
      unitId?: string;
    }
  ) {
    return this.usersService.createUser(body);
  }

  @Post(":id/roles")
  @RequireRole("super_admin", { app: "*" })
  async assignRole(
    @Param("id") userId: string,
    @Body()
    body: {
      app: string;
      role: string;
      unitId?: string | null;
      departmentId?: string | null;
    }
  ) {
    return this.usersService.assignRole(userId, body);
  }

  @Delete("roles/:roleAssignmentId")
  @RequireRole("super_admin", { app: "*" })
  async revokeRole(@Param("roleAssignmentId") roleAssignmentId: string) {
    return this.usersService.revokeRole(roleAssignmentId);
  }

  @Patch(":id/status")
  @RequireRole("super_admin", { app: "*" })
  async toggleStatus(
    @Param("id") userId: string,
    @Body("isActive") isActive: boolean
  ) {
    return this.usersService.toggleActive(userId, isActive);
  }
}
