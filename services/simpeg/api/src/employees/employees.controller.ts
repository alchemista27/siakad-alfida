import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { EmployeesService } from "./employees.service";
import { UpsertEmployeeProfileDto, SyncUserDto } from "./employees.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("employees")
@UseGuards(ServiceJwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Get("suggestions")
  @UseGuards(SimpegRolesGuard)
  @SimpegRoles("super_admin", "admin_kepegawaian", "admin_unit", "admin_unit_nondik")
  async suggestions(@Query("search") search: string | undefined, @Query("unitId") unitId: string | undefined, @Req() req: any) {
    return this.employeesService.suggestions(search, unitId, req.user);
  }

  @Get()
  async findAll(
    @Query("search") search?: string,
    @Query("type") type?: string
  ) {
    return this.employeesService.findAll({ search, type });
  }

  @Get("demographics")
  async getDemographics() {
    return this.employeesService.getDemographics();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.employeesService.findOne(id);
  }

  @Post("profile")
  async upsertProfile(@Body() dto: UpsertEmployeeProfileDto) {
    return this.employeesService.upsertProfile(dto);
  }

  @Post("sync-user")
  async syncUser(@Body() dto: SyncUserDto) {
    return this.employeesService.syncUser(dto);
  }
}
