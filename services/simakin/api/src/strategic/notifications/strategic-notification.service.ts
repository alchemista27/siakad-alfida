import { Injectable } from "@nestjs/common";
import { Subject } from "rxjs";
import { PrismaService } from "../../prisma/prisma.service";

export type NotificationEvent = { userId: string; notification: Record<string, unknown> };

@Injectable()
export class StrategicNotificationService {
  private readonly events = new Subject<NotificationEvent>();

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, type: string, title: string, body: string, href?: string | null) {
    const notification = await (this.prisma as any).strategicNotification.create({ data: { userId, type, title, body, href: href ?? null } });
    this.events.next({ userId, notification });
    return notification;
  }

  unread(userId: string, unreadOnly = false) {
    return (this.prisma as any).strategicNotification.findMany({ where: { userId, ...(unreadOnly ? { readAt: null } : {}) }, orderBy: { createdAt: "desc" }, take: 100 });
  }

  async markRead(id: string, userId: string) {
    return (this.prisma as any).strategicNotification.updateMany({ where: { id, userId }, data: { readAt: new Date() } });
  }

  streamFor(userId: string) {
    return this.events.asObservable();
  }
}
