import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
} from "@nestjs/common";
import { ImportsService } from "./imports.service";
import { BatchImportDto } from "./imports.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";

@Controller("imports")
@UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post("preview")
  @SpmbRoles("admin_unit", "tim_ppdb")
  async preview(@Req() req: any, @Body() dto: BatchImportDto) {
    return this.importsService.preview(req.user, dto);
  }

  @Post("commit")
  @SpmbRoles("admin_unit", "tim_ppdb")
  async commit(@Req() req: any, @Body() dto: BatchImportDto) {
    return this.importsService.commit(req.user, dto);
  }
}
