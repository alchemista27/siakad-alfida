import { Controller, Delete, Get, Param, Patch, Post, Body, UseGuards, Req, ValidationPipe } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { DepartmentsService } from "./departments.service";
import { AssignDepartmentAdminDto } from "./departments.dto";

const ADMIN_ROLES = ["super_admin", "admin_kepegawaian", "admin_bidang", "admin_unit", "admin_unit_nondik"];

@Controller("departments")
@UseGuards(ServiceJwtAuthGuard, SimpegRolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @SimpegRoles(...ADMIN_ROLES)
  findAll() { return this.departmentsService.findAll(); }

  @Post()
  @SimpegRoles("super_admin", "admin_kepegawaian")
  create(@Body() body: { name: string; code: string; description?: string; isActive?: boolean }) {
    return this.departmentsService.create(body);
  }

  @Patch(":id")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  update(@Param("id") id: string, @Body() body: { name?: string; code?: string; description?: string | null; isActive?: boolean }) {
    return this.departmentsService.update(id, body);
  }

  @Delete(":id")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.departmentsService.remove(id, req.user.id, req.headers.authorization);
  }

  @Get(":id/admins")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  listAdmins(@Param("id") id: string) { return this.departmentsService.listAdmins(id); }

  @Post(":id/admins")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  assignAdmin(@Param("id") id: string, @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: AssignDepartmentAdminDto, @Req() req: any) {
    return this.departmentsService.assignAdmin(id, dto.userId, req.user.id, req.headers.authorization);
  }

  @Delete(":id/admins/:userId")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  revokeAdmin(@Param("id") id: string, @Param("userId") userId: string, @Req() req: any) {
    return this.departmentsService.revokeAdmin(id, userId, req.user.id, req.headers.authorization);
  }
}
