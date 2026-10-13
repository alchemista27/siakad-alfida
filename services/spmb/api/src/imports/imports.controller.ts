import {
  Controller,
  Post,
  Body,
  UseGuards,
  ForbiddenException,
  Req,
} from "@nestjs/common";
import { ImportsService } from "./imports.service";
import { BatchImportDto } from "./imports.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("imports")
@UseGuards(ServiceJwtAuthGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post("preview")
  async preview(@Req() req: any, @Body() dto: BatchImportDto) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_unit" || r.role === "tim_ppdb"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin unit yang dapat mengimpor data pendaftar.");
    }
    return this.importsService.preview(dto);
  }

  @Post("commit")
  async commit(@Req() req: any, @Body() dto: BatchImportDto) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_unit" || r.role === "tim_ppdb"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya admin unit yang dapat mengimpor data pendaftar.");
    }
    return this.importsService.commit(req.user.id, dto);
  }
}
