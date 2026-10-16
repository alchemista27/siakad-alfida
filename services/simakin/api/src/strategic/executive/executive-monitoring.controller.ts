import { Body, Controller, Get, Param, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimakinRoles, SimakinRolesGuard } from "../../common/guards";
import { CreateExecutiveInterventionDto } from "./executive-interventions.dto";
import { ExecutiveMonitoringService } from "./executive-monitoring.service";

@Controller("strategic/executive")
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
export class ExecutiveMonitoringController {
  constructor(private readonly service: ExecutiveMonitoringService) {}
  @Get("attention-queue") @SimakinRoles("pimpinan", "pengawas") queue() { return this.service.attentionQueue(); }
  @Post("interventions") @SimakinRoles("pimpinan", "super_admin") create(@Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: CreateExecutiveInterventionDto, @Req() req: any) { return this.service.createIntervention(dto, req.user); }
  @Post("interventions/:id/acknowledge") @SimakinRoles("pimpinan", "pengawas", "admin_bidang", "admin_biro", "staff", "pic_program") acknowledge(@Param("id") id: string, @Req() req: any) { return this.service.acknowledge(id, req.user); }
  @Post("interventions/:id/resolve") @SimakinRoles("pimpinan", "super_admin") resolve(@Param("id") id: string, @Req() req: any) { return this.service.resolve(id, req.user); }
}
