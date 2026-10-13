import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { UpsertEmployeeProfileDto, SyncUserDto } from "./employees.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("employees")
@UseGuards(ServiceJwtAuthGuard)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

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
