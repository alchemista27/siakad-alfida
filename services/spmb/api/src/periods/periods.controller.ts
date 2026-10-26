import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Param,
  Req,
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
  @SpmbRoles("admin_unit", "tim_ppdb", "observer")
  async findAll(@Req() req: any) {
    return this.periodsService.findAll(req.user);
  }

  @Get(":id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb", "observer")
  async findOne(@Param("id") id: string, @Req() req: any) {
    return this.periodsService.findOne(id, req.user);
  }

  @Post()
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  async create(@Body() dto: CreatePeriodDto, @Req() req: any) {
    return this.periodsService.create(dto, req.user);
  }

  @Put(":id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  async update(
    @Param("id") id: string,
    @Body() dto: UpdatePeriodDto,
    @Req() req: any,
  ) {
    return this.periodsService.update(id, dto, req.user);
  }

  @Post(":id/open")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  async open(@Param("id") id: string, @Req() req: any) {
    return this.periodsService.openPeriod(id, req.user);
  }

  @Post(":id/close")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  async close(@Param("id") id: string, @Req() req: any) {
    return this.periodsService.closePeriod(id, req.user);
  }

  @Delete(":id")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit")
  async remove(@Param("id") id: string, @Req() req: any) {
    return this.periodsService.remove(id, req.user);
  }
}
