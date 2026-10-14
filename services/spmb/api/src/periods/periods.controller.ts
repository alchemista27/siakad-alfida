import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { PeriodsService } from "./periods.service";
import { CreatePeriodDto, UpdatePeriodDto } from "./periods.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";

@Controller("periods")
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get("public")
  async getActivePublic() {
    return this.periodsService.findActivePublic();
  }

  @Get()
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb", "orang_tua", "observer")
  async findAll(@Query("unitId") unitId?: string) {
    return this.periodsService.findAll(unitId);
  }

  @Get(":id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb", "orang_tua", "observer")
  async findOne(@Param("id") id: string) {
    return this.periodsService.findOne(id);
  }

  @Post()
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async create(@Body() dto: CreatePeriodDto) {
    return this.periodsService.create(dto);
  }

  @Put(":id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePeriodDto
  ) {
    return this.periodsService.update(id, dto);
  }
}
