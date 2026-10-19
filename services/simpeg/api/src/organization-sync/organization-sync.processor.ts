import { Injectable, OnModuleInit, Optional } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthRoleCompensationClient } from "./auth-role-compensation.client";
import { SimakinSyncClient } from "./simakin-sync.client";
import { SiakadSyncClient } from "./siakad-sync.client";

const PROCESSING_LEASE_MS = 5 * 60_000;

@Injectable()
export class OrganizationSyncProcessor implements OnModuleInit {
  private timer?: NodeJS.Timeout;
  constructor(
    private readonly prisma: PrismaService,
    private readonly client: SimakinSyncClient,
    @Optional() private readonly siakadClient?: SiakadSyncClient,
    @Optional() private readonly compensationClient?: AuthRoleCompensationClient,
  ) {}

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
    await this.processAuthRoleCompensations(now);
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
    const compensations = (this.prisma as any).authRoleCompensation;
    if (!compensations) return;
    await compensations.updateMany({
      where: { status: "processing", availableAt: { lte: now } },
      data: { status: "failed", availableAt: now, lastError: "Auth role compensation lease expired" },
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
      if (row.eventType === "unit.upserted" || row.eventType === "unit.archived") {
        if (!this.siakadClient) throw new Error("SIAKAD synchronization client is unavailable.");
        await this.siakadClient.deliver(row);
      } else {
        await this.client.deliver(row);
      }
      await (this.prisma as any).organizationSyncOutbox.updateMany({
        where: { id: row.id, status: "processing", availableAt: leaseExpiresAt },
        data: { status: "delivered", deliveredAt: new Date(), lastError: null },
      });
    } catch (error) {
      const attemptCount = row.attemptCount + 1;
      const delay = Math.min(3_600_000, 30_000 * 2 ** Math.min(attemptCount, 7));
      const message = this.errorMessage(error, "Sync delivery failed");
      await (this.prisma as any).organizationSyncOutbox.updateMany({
        where: { id: row.id, status: "processing", availableAt: leaseExpiresAt },
        data: { status: "failed", lastError: message, availableAt: new Date(Date.now() + delay) },
      });
    }
  }

  private async processAuthRoleCompensations(now: Date) {
    const compensations = (this.prisma as any).authRoleCompensation;
    if (!compensations) return;
    const rows = await compensations.findMany({
      where: { status: { in: ["armed", "pending", "failed"] }, availableAt: { lte: now } },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    await Promise.all(rows.map((row: any) => this.deliverAuthRoleCompensation(row)));
  }

  private async deliverAuthRoleCompensation(row: any) {
    const compensations = (this.prisma as any).authRoleCompensation;
    const claimedAt = new Date();
    const leaseExpiresAt = new Date(claimedAt.getTime() + PROCESSING_LEASE_MS);
    const claimed = await compensations.updateMany({
      where: { id: row.id, status: row.status, availableAt: { lte: claimedAt } },
      data: { status: "processing", attemptCount: { increment: 1 }, availableAt: leaseExpiresAt },
    });
    if (claimed.count !== 1) return;
    try {
      if (!this.compensationClient) throw new Error("Auth role compensation client is unavailable.");
      await this.compensationClient.revoke(row);
      await (this.prisma as any).$transaction(async (tx: any) => {
        const assignmentStore = row.scope === "unit" ? tx.unitAdminAssignment : tx.departmentAdminAssignment;
        await assignmentStore.updateMany({
          where: { id: row.localAssignmentId, isActive: true },
          data: { isActive: false, revokedAt: new Date(), revokedById: row.requestedById ?? null },
        });
        await tx.authRoleCompensation.update({
          where: { id: row.id },
          data: { status: "delivered", deliveredAt: new Date(), lastError: null },
        });
      });
    } catch (error) {
      const attemptCount = row.attemptCount + 1;
      const delay = Math.min(3_600_000, 30_000 * 2 ** Math.min(attemptCount, 7));
      await compensations.updateMany({
        where: { id: row.id, status: "processing", availableAt: leaseExpiresAt },
        data: { status: "failed", lastError: this.errorMessage(error, "Auth role compensation failed"), availableAt: new Date(Date.now() + delay) },
      });
    }
  }

  private errorMessage(error: unknown, fallback: string) {
    return error instanceof Error
      ? error.message.slice(0, 500).replace(/(?:token|authorization|cookie)=?[^\s]*/gi, "[REDACTED]")
      : fallback;
  }
}
