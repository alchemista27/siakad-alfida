import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { hasScopedRole, StrategicUser } from "../workflow/strategic-permissions";
import { StrategicNotificationService } from "../notifications/strategic-notification.service";
import { CreateExecutiveInterventionDto } from "./executive-interventions.dto";

@Injectable()
export class ExecutiveMonitoringService {
  constructor(private readonly prisma: PrismaService, private readonly notifications: StrategicNotificationService) {}

  async attentionQueue() {
    const now = new Date();
    const db = this.prisma as any;
    const [overduePicTasks, logs, evidence, issues, programs, kpis, interventions] = await Promise.all([
      this.prisma.executionTask.findMany({ where: { deadline: { lt: now }, status: { notIn: ["completed", "cancelled"] } }, select: { id: true, programId: true, assigneeId: true, deadline: true } }),
      db.executionRealizationLog.findMany({ where: { workflowStatus: "submitted_to_biro", reviewDueAt: { lt: now } } }),
      db.executionEvidence.findMany({ where: { workflowStatus: "submitted_to_biro", reviewDueAt: { lt: now } } }),
      db.executionIssue.findMany({ where: { workflowStatus: "submitted_to_biro", reviewDueAt: { lt: now } } }),
      db.workProgram.findMany({ where: { workflowStatus: "submitted_to_bidang", reviewDueAt: { lt: now } } }),
      db.executionKPI.findMany({ where: { workflowStatus: "submitted_to_bidang", reviewDueAt: { lt: now } } }),
      db.executiveIntervention.findMany({ where: { status: { not: "resolved" } }, orderBy: { createdAt: "desc" } }),
    ]);
    return {
      overdue_pic_tasks: overduePicTasks,
      overdue_biro_reviews: [
        ...logs.map((resource: any) => ({ ...resource, resourceType: "realization_log" })),
        ...evidence.map((resource: any) => ({ ...resource, resourceType: "evidence" })),
        ...issues.map((resource: any) => ({ ...resource, resourceType: "issue" })),
      ],
      overdue_bidang_reviews: [
        ...programs.map((resource: any) => ({ ...resource, resourceType: "work_program" })),
        ...kpis.map((resource: any) => ({ ...resource, resourceType: "kpi" })),
      ],
      open_interventions: interventions,
    };
  }

  async createIntervention(dto: CreateExecutiveInterventionDto, user: StrategicUser) {
    if (!hasScopedRole(user, "pimpinan") && !hasScopedRole(user, "super_admin")) throw new ForbiddenException("Hanya pimpinan yang dapat membuat teguran.");
    if (dto.resourceType && dto.resourceId && !(await this.isOverdue(dto.resourceType, dto.resourceId))) throw new BadRequestException("Resource belum overdue atau tidak dalam review.");
    const intervention = await (this.prisma as any).executiveIntervention.create({ data: { ...dto, issuedById: user.id } });
    await this.notifications.create(dto.recipientId, "executive_intervention", "Teguran pimpinan", dto.message, "/executive");
    return intervention;
  }

  async acknowledge(id: string, user: StrategicUser) {
    const db = this.prisma as any;
    const intervention = await db.executiveIntervention.findUnique({ where: { id } });
    if (!intervention) throw new NotFoundException("Teguran tidak ditemukan.");
    if (intervention.recipientId !== user.id && !hasScopedRole(user, "super_admin")) throw new ForbiddenException("Teguran hanya dapat diakui penerimanya.");
    return db.executiveIntervention.update({ where: { id }, data: { status: "acknowledged", acknowledgedAt: new Date() } });
  }

  async resolve(id: string, user: StrategicUser) {
    if (!hasScopedRole(user, "pimpinan") && !hasScopedRole(user, "super_admin")) throw new ForbiddenException("Hanya pimpinan yang dapat menyelesaikan teguran.");
    return (this.prisma as any).executiveIntervention.update({ where: { id }, data: { status: "resolved", resolvedAt: new Date() } });
  }

  private async isOverdue(type: string, id: string) {
    const model = { work_program: "workProgram", kpi: "executionKPI", realization_log: "executionRealizationLog", evidence: "executionEvidence", issue: "executionIssue" }[type];
    if (!model) return false;
    const record = await (this.prisma as any)[model].findUnique({ where: { id } });
    return Boolean(record?.reviewDueAt && record.reviewDueAt < new Date() && ["submitted_to_biro", "submitted_to_bidang"].includes(record.workflowStatus));
  }
}
