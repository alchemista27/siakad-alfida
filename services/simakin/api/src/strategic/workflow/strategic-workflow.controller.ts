import { BadRequestException, Body, Controller, Param, Post, Req, UseGuards, ValidationPipe } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimakinRoles, SimakinRolesGuard } from "../../common/guards";
import { TransitionStrategicWorkflowDto } from "./strategic-workflow.dto";
import { WorkflowResourceType } from "./strategic-workflow";
import { StrategicWorkflowService } from "./strategic-workflow.service";

@Controller("strategic/workflow")
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
export class StrategicWorkflowController {
  constructor(private readonly service: StrategicWorkflowService) {}

  @Post(":resourceType/:resourceId/transition")
  @SimakinRoles("admin_bidang", "admin_biro", "staff", "pic_program")
  transition(@Param("resourceType") resourceType: WorkflowResourceType, @Param("resourceId") resourceId: string, @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })) dto: TransitionStrategicWorkflowDto, @Req() req: any) {
    if (!(["work_program", "kpi", "realization_log", "evidence", "issue"] as string[]).includes(resourceType)) throw new BadRequestException("Jenis resource workflow tidak valid.");
    return this.service.transition(resourceType, resourceId, dto, req.user);
  }
}
