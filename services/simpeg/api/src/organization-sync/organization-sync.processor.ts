import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SimakinSyncClient } from "./simakin-sync.client";

const PROCESSING_LEASE_MS = 5 * 60_000;

@Injectable()
export class OrganizationSyncProcessor implements OnModuleInit {
  private timer?: NodeJS.Timeout;
  constructor(private readonly prisma: PrismaService, private readonly client: SimakinSyncClient) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.processBatch(), 30_000);
    this.timer.unref();
  }

  async processBatch() {
    const now = new Date();
    await this.recoverExpiredLeases(now);
    const rows = await (this.prisma as any).organizationSyncOutbox.findMany({
      where: { status: { in: ["pending", "failed"] }, availableAt: { lte: now } },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    await Promise.all(rows.map((row: any) => this.deliver(row)));
  }

  async retry(id: string) {
    await (this.prisma as any).organizationSyncOutbox.update({ where: { id }, data: { status: "pending", availableAt: new Date(), lastError: null } });
    await this.processBatch();
  }

  private async recoverExpiredLeases(now: Date) {
    await (this.prisma as any).organizationSyncOutbox.updateMany({
      where: { status: "processing", availableAt: { lte: now } },
      data: { status: "failed", availableAt: now, lastError: "Processing lease expired" },
    });
  }

  private async deliver(row: any) {
    const claimedAt = new Date();
    const leaseExpiresAt = new Date(claimedAt.getTime() + PROCESSING_LEASE_MS);
    const claimed = await (this.prisma as any).organizationSyncOutbox.updateMany({
      where: { id: row.id, status: { in: ["pending", "failed"] }, availableAt: { lte: claimedAt } },
      data: { status: "processing", attemptCount: { increment: 1 }, availableAt: leaseExpiresAt },
    });
    if (claimed.count !== 1) return;
    try {
      await this.client.deliver(row);
      await (this.prisma as any).organizationSyncOutbox.updateMany({
        where: { id: row.id, status: "processing", availableAt: leaseExpiresAt },
        data: { status: "delivered", deliveredAt: new Date(), lastError: null },
      });
    } catch (error) {
      const attemptCount = row.attemptCount + 1;
      const delay = Math.min(3_600_000, 30_000 * 2 ** Math.min(attemptCount, 7));
      const message = error instanceof Error ? error.message.slice(0, 500).replace(/(?:token|authorization|cookie)=?[^\s]*/gi, "[REDACTED]") : "Sync delivery failed";
      await (this.prisma as any).organizationSyncOutbox.updateMany({
        where: { id: row.id, status: "processing", availableAt: leaseExpiresAt },
        data: { status: "failed", lastError: message, availableAt: new Date(Date.now() + delay) },
      });
    }
  }
}