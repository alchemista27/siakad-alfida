import { Body, Controller, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { YmqRoles } from "../ymq/ymq-roles.decorator";
import { YmqRolesGuard } from "../ymq/ymq-roles.guard";
import { AttachEvidenceDto } from "./evidence.dto";
import { EvidenceService } from "./evidence.service";

@Controller("learning-progress")
@UseGuards(ServiceJwtAuthGuard, YmqRolesGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Post(":progressId/evidence")
  @YmqRoles("admin_ymq", "pembina_ymq", "admin_kelompok")
  attach(@Param("progressId") progressId: string, @Body() dto: AttachEvidenceDto, @Req() req: any) {
    return this.evidenceService.attach(progressId, dto, req.user);
  }
}
