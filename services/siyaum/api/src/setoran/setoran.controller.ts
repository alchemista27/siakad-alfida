import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { CreateSetoranDto, VerifySetoranDto } from "./setoran.dto";
import { SetoranService } from "./setoran.service";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";

@Controller("setoran")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
export class SetoranController {
  constructor(private readonly setoranService: SetoranService) {}

  @Post("my")
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok", "peserta")
  createMySetoran(@Req() req: any, @Body() dto: CreateSetoranDto) {
    return this.setoranService.create(req.user.id, dto);
  }

  @Get("my")
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok", "peserta")
  getMySetoran(@Req() req: any) {
    return this.setoranService.findMySetoran(req.user.id);
  }

  @Get("pending")
  @YmqRoles("admin_ymq", "pembina_ymq")
  getPendingVerification(@Req() req: any) {
    return this.setoranService.findPendingVerification(req.user);
  }

  @Post(":id/verify")
  @YmqRoles("admin_ymq", "pembina_ymq")
  verifySetoran(@Param("id") id: string, @Req() req: any, @Body() dto: VerifySetoranDto) {
    return this.setoranService.verify(id, req.user, dto);
  }
}
