import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  ForbiddenException,
} from "@nestjs/common";
import { SetoranService } from "./setoran.service";
import { CreateSetoranDto, VerifySetoranDto } from "./setoran.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("setoran")
@UseGuards(ServiceJwtAuthGuard)
export class SetoranController {
  constructor(private readonly setoranService: SetoranService) {}

  @Post("my")
  async createMySetoran(@Req() req: any, @Body() dto: CreateSetoranDto) {
    return this.setoranService.create(req.user.id, dto);
  }

  @Get("my")
  async getMySetoran(@Req() req: any) {
    return this.setoranService.findMySetoran(req.user.id);
  }

  @Get("pending")
  async getPendingVerification(@Req() req: any) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_ymq" || r.role === "musyrif"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya musyrif atau admin YMQ yang dapat melihat antrean verifikasi.");
    }
    return this.setoranService.findPendingVerification(req.user.id);
  }

  @Post(":id/verify")
  async verifySetoran(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: VerifySetoranDto
  ) {
    const roles = req.user?.roles || [];
    const isAuthorized = roles.some((r: any) =>
      r.role === "super_admin" || r.role === "admin_ymq" || r.role === "musyrif"
    );
    if (!isAuthorized) {
      throw new ForbiddenException("Hanya musyrif atau admin YMQ yang berhak memverifikasi setoran.");
    }
    return this.setoranService.verify(id, req.user.id, dto);
  }
}

