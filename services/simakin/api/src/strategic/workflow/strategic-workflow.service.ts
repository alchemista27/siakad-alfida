import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { StrategicNotificationService } from "../notifications/strategic-notification.service";
import { StrategicAuthorizationService } from "./strategic-authorization.service";
import { reviewDueAt } from "./strategic-workflow.constants";
import { allowedTransitions, WorkflowResourceType, WorkflowStatus } from "./strategic-workflow";
import { createNotificationHref } from "../notifications/notification-href.policy";
import { StrategicUser } from "./strategic-permissions";

const modelFor: Record<WorkflowResourceType, string> = { work_program: "workProgram", kpi: "executionKPI", realization_log: "executionRealizationLog", evidence: "executionEvidence", issue: "executionIssue" };

@Injectable()
export class StrategicWorkflowService {
  constructor(private readonly prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly notifications: StrategicNotificationService) {}

  async transition(resourceType: WorkflowResourceType, resourceId: string, dto: { toStatus: WorkflowStatus; notes?: string }, user: StrategicUser) {
    const record = await this.load(resourceType, resourceId);
    const fromStatus = record.workflowStatus as WorkflowStatus;
    if (!allowedTransitions[fromStatus]?.includes(dto.toStatus as never)) throw new BadRequestException("Transisi workflow tidak valid.");
    if (dto.toStatus.startsWith("revision_requested") && !dto.notes?.trim()) throw new BadRequestException("Catatan revisi wajib diisi.");
    await this.assertTransitionScope(user, record.departmentId, dto.toStatus, record.taskId);

    const now = new Date();
    const reviewStage = dto.toStatus === "submitted_to_biro" ? "biro" : dto.toStatus === "submitted_to_bidang" ? "bidang" : undefined;
    const update = {
      workflowStatus: dto.toStatus,
      submittedAt: reviewStage ? now : undefined,
      reviewDueAt: reviewStage ? reviewDueAt(reviewStage, now) : null,
      lastReviewedAt: reviewStage ? undefined : now,
    };
    const action = dto.toStatus === "approved_by_bidang" ? "approved" : dto.toStatus === "accepted_by_biro" ? "accepted" : dto.toStatus.startsWith("revision") ? "revision_requested" : fromStatus === "draft" ? "submitted" : "resubmitted";
    const result = await this.prisma.$transaction(async (tx) => {
      const db = tx as any;
      const resource = await db[modelFor[resourceType]].update({ where: { id: resourceId }, data: update });
      await db.strategicWorkflowEvent.create({ data: { resourceType, resourceId, departmentId: record.departmentId, action, fromStatus, toStatus: dto.toStatus, notes: dto.notes?.trim() || null, actorId: user.id } });
      return resource;
    });

    const recipientId = record.ownerId ?? record.assigneeId ?? record.coordinatorId ?? record.userId;
    if (recipientId && recipientId !== user.id) await this.notifications.create(recipientId, "workflow_transition", "Status pengajuan diperbarui", dto.notes?.trim() || `Status menjadi ${dto.toStatus}.`, createNotificationHref({ resourceType, resourceId, taskId: record.taskId ?? undefined }));
    return result;
  }

  private async load(resourceType: WorkflowResourceType, id: string) {
    const db = this.prisma as any;
    const record = await db[modelFor[resourceType]].findUnique({ where: { id }, include: resourceType === "kpi" ? { program: true } : resourceType === "work_program" ? {} : { program: true } });
    if (!record) throw new NotFoundException("Resource workflow tidak ditemukan.");
    const departmentId = record.departmentId ?? record.program?.departmentId;
    if (!departmentId) throw new BadRequestException("Resource belum memiliki scope Bidang/Biro.");
    return { ...record, departmentId };
  }

  private async assertTransitionScope(user: StrategicUser, departmentId: string, target: WorkflowStatus, taskId?: string | null) {
    if (target === "submitted_to_biro") {
      if (taskId) return this.authorization.assertPicOwnsTask(user, taskId);
      return this.authorization.assertBiroCanManage(user, departmentId);
    }
    if (target === "accepted_by_biro" || target === "revision_requested_by_biro") return this.authorization.assertBiroCanManage(user, departmentId);
    if (target === "submitted_to_bidang") return this.authorization.assertBiroCanManage(user, departmentId);
    return this.authorization.assertBidangCanReview(user, departmentId);
  }
}
