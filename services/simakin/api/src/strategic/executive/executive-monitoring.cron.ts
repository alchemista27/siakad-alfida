import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { PrismaService } from "../../prisma/prisma.service";
import { StrategicNotificationService } from "../notifications/strategic-notification.service";
import { ExecutiveMonitoringService } from "./executive-monitoring.service";
import { createNotificationHref } from "../notifications/notification-href.policy";

@Injectable()
export class ExecutiveMonitoringCron {
  constructor(private readonly monitoring: ExecutiveMonitoringService, private readonly notifications: StrategicNotificationService, private readonly prisma: PrismaService) {}

  @Cron("0 */15 * * * *")
  async notifyOverdue() {
    const queue = await this.monitoring.attentionQueue();
    await Promise.all(queue.overdue_pic_tasks.map((task: any) => this.notifyOnce(task.assigneeId, "overdue_pic_task", { resourceType: "execution_task", resourceId: task.id, taskId: task.id }, "Tugas melewati tenggat", "Tugas Anda telah melewati tenggat.")));
    await Promise.all(queue.overdue_biro_reviews.map((resource: any) => this.notifyOnce(resource.ownerId ?? resource.picId, "overdue_biro_review", { resourceType: resource.resourceType ?? "workflow", resourceId: resource.id }, "Review Biro terlambat", "Ada pengajuan yang melewati SLA review Biro.")));
    await Promise.all(queue.overdue_bidang_reviews.map((resource: any) => this.notifyOnce(resource.coordinatorId ?? resource.userId, "overdue_bidang_review", { resourceType: resource.resourceType ?? "workflow", resourceId: resource.id }, "Review Bidang terlambat", "Ada pengajuan yang melewati SLA review Bidang.")));
  }

  private async notifyOnce(userId: string | null | undefined, type: string, resource: { resourceType: string; resourceId: string; taskId?: string }, title: string, body: string) {
    if (!userId) return;
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const href = createNotificationHref(resource);
    const existing = await (this.prisma as any).strategicNotification.findFirst({ where: { userId, type, href, readAt: null, createdAt: { gte: since } } });
    if (!existing) await this.notifications.create(userId, type, title, body, href);
  }
}
