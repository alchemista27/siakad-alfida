import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { CreateUnitDto, UpdateUnitDto, AssignUnitAdminDto } from "./units.dto";
import { UnitsService } from "./units.service";

const UNIT_READ_ROLES = ["super_admin", "admin_kepegawaian", "admin_unit", "admin_unit_nondik"];

@Controller("units")
@UseGuards(ServiceJwtAuthGuard, SimpegRolesGuard)
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @SimpegRoles(...UNIT_READ_ROLES)
  findAll(@Req() req: any) {
    return this.unitsService.findAll(req.user);
  }

  @Get(":id")
  @SimpegRoles(...UNIT_READ_ROLES)
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.unitsService.findOne(id, req.user);
  }

  @Get(":id/admins")
  @SimpegRoles(...UNIT_READ_ROLES)
  listAdmins(@Param("id") id: string, @Req() req: any) {
    return this.unitsService.listAdmins(id, req.user);
  }

  @Post(":id/admins")
  @SimpegRoles(...UNIT_READ_ROLES)
  assignAdmin(
    @Param("id") id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: AssignUnitAdminDto,
    @Req() req: any,
  ) {
    return this.unitsService.assignAdmin(id, dto, req.user);
  }

  @Delete(":id/admins/:userId/:app")
  @SimpegRoles(...UNIT_READ_ROLES)
  revokeAdmin(@Param("id") id: string, @Param("userId") userId: string, @Param("app") app: string, @Req() req: any) {
    return this.unitsService.revokeAdmin(id, userId, app, req.user);
  }

  @Post()
  @SimpegRoles("super_admin", "admin_kepegawaian")
  create(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: CreateUnitDto) {
    return this.unitsService.create(body);
  }

  @Patch(":id")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  update(@Param("id") id: string, @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) body: UpdateUnitDto) {
    return this.unitsService.update(id, body);
  }

  @Delete(":id")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.unitsService.remove(id, req.user);
  }
}
