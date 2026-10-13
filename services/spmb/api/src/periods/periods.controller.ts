import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
  Req,
} from "@nestjs/common";
import { PeriodsService } from "./periods.service";
import { CreatePeriodDto, UpdatePeriodDto } from "./periods.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("periods")
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @Get("public")
  async getActivePublic() {
    return this.periodsService.findActivePublic();
  }

  @Get()
  @UseGuards(ServiceJwtAuthGuard)
  async findAll(@Query("unitId") unitId?: string) {
    return this.periodsService.findAll(unitId);
  }

  @Get(":id")
  @UseGuards(ServiceJwtAuthGuard)
  async findOne(@Param("id") id: string) {
    return this.periodsService.findOne(id);
  }

  @Post()
  @UseGuards(ServiceJwtAuthGuard)
  async create(@Req() req: any, @Body() dto: CreatePeriodDto) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_unit"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin unit atau super admin yang dapat membuat periode PPDB.");
    }
    return this.periodsService.create(dto);
  }

  @Put(":id")
  @UseGuards(ServiceJwtAuthGuard)
  async update(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: UpdatePeriodDto
  ) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_unit"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin unit atau super admin yang dapat mengubah periode PPDB.");
    }
    return this.periodsService.update(id, dto);
  }
}
