import { Injectable, OnModuleInit, Optional } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthOrganizationRoleClient } from "./auth-organization-role.client";
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
    private readonly authOrganizationRoles?: AuthOrganizationRoleClient,
  ) {}

  onModuleInit() {
    this.timer = setInterval(() => void this.processBatch(), 30_000);
    this.timer.unref();
  }

  async processBatch() {
    const now = new Date();
    await this.recoverExpiredLeases(now);
    const rows = await (this.prisma as any).organizationSyncOutbox.findMany({
      where: {
        status: { in: ["pending", "failed"] },
        availableAt: { lte: now },
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    for (const row of [...rows].sort(
      (left, right) =>
        this.deliveryPriority(left) - this.deliveryPriority(right)
    )) {
      await this.deliver(row);
    }
    await this.processAuthRoleCompensations(now);
  }

  async retry(id: string) {
    await (this.prisma as any).organizationSyncOutbox.update({
      where: { id },
      data: { status: "pending", availableAt: new Date(), lastError: null },
    });
    await this.processBatch();
  }

  private deliveryPriority(row: { eventType?: string }) {
    switch (row.eventType) {
      case "user.projected":
        return 0;
      case "unit.upserted":
      case "unit.archived":
        return 1;
      case "department.upserted":
      case "department.archived":
      case "department.deleted":
        return 2;
      case "department-member.upserted":
        return 3;
      default:
        return 4;
    }
  }

  private async recoverExpiredLeases(now: Date) {
    await (this.prisma as any).organizationSyncOutbox.updateMany({
      where: { status: "processing", availableAt: { lte: now } },
      data: {
        status: "failed",
        availableAt: now,
        lastError: "Processing lease expired",
      },
    });
    const compensations = (this.prisma as any).authRoleCompensation;
    if (!compensations) return;
    await compensations.updateMany({
      where: { status: "processing", availableAt: { lte: now } },
      data: {
        status: "failed",
        availableAt: now,
        lastError: "Auth role compensation lease expired",
      },
    });
  }

  private async deliver(row: any) {
    const claimedAt = new Date();
    const leaseExpiresAt = new Date(claimedAt.getTime() + PROCESSING_LEASE_MS);
    const claimed = await (
      this.prisma as any
    ).organizationSyncOutbox.updateMany({
      where: {
        id: row.id,
        status: { in: ["pending", "failed"] },
        availableAt: { lte: claimedAt },
      },
      data: {
        status: "processing",
        attemptCount: { increment: 1 },
        availableAt: leaseExpiresAt,
      },
    });
    if (claimed.count !== 1) return;
    try {
      if (
        row.eventType === "unit.upserted" ||
        row.eventType === "unit.archived"
      ) {
        if (!this.siakadClient)
          throw new Error("SIAKAD synchronization client is unavailable.");
        await this.siakadClient.deliver(row);
      } else if (
        [
          "department.upserted",
          "department.archived",
          "department.deleted",
          "department-member.upserted",
          "user.projected",
        ].includes(row.eventType)
      ) {
        await this.client.deliver(row);
      } else {
        throw new Error(
          `Unsupported organization synchronization event: ${row.eventType}`
        );
      }
      await (this.prisma as any).organizationSyncOutbox.updateMany({
        where: {
          id: row.id,
          status: "processing",
          availableAt: leaseExpiresAt,
        },
        data: { status: "delivered", deliveredAt: new Date(), lastError: null },
      });
    } catch (error) {
      const attemptCount = row.attemptCount + 1;
      const delay = Math.min(
        3_600_000,
        30_000 * 2 ** Math.min(attemptCount, 7)
      );
      const message = this.errorMessage(error, "Sync delivery failed");
      await (this.prisma as any).organizationSyncOutbox.updateMany({
        where: {
          id: row.id,
          status: "processing",
          availableAt: leaseExpiresAt,
        },
        data: {
          status: "failed",
          lastError: message,
          availableAt: new Date(Date.now() + delay),
        },
      });
    }
  }

  private async processAuthRoleCompensations(now: Date) {
    const compensations = (this.prisma as any).authRoleCompensation;
    if (!compensations) return;
    const rows = await compensations.findMany({
      where: {
        status: { in: ["armed", "pending", "failed"] },
        availableAt: { lte: now },
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });
    await Promise.all(
      rows.map((row: any) => this.deliverAuthRoleCompensation(row))
    );
  }

  private async deliverAuthRoleCompensation(row: any) {
    const compensations = (this.prisma as any).authRoleCompensation;
    const claimedAt = new Date();
    const leaseExpiresAt = new Date(claimedAt.getTime() + PROCESSING_LEASE_MS);
    const claimed = await compensations.updateMany({
      where: {
        id: row.id,
        status: row.status,
        availableAt: { lte: claimedAt },
      },
      data: {
        status: "processing",
        attemptCount: { increment: 1 },
        availableAt: leaseExpiresAt,
      },
    });
    if (claimed.count !== 1) return;
    try {
      if (!this.authOrganizationRoles)
        throw new Error("Auth organization-role client is unavailable.");
      await this.authOrganizationRoles.revoke(this.compensationRoleInput(row));
      await (this.prisma as any).$transaction(async (tx: any) => {
        const assignmentStore =
          row.scope === "unit"
            ? tx.unitAdminAssignment
            : tx.departmentAdminAssignment;
        await assignmentStore.updateMany({
          where: { id: row.localAssignmentId, isActive: true },
          data: {
            isActive: false,
            revokedAt: new Date(),
            revokedById: row.requestedById ?? null,
          },
        });
        await tx.authRoleCompensation.update({
          where: { id: row.id },
          data: {
            status: "delivered",
            deliveredAt: new Date(),
            lastError: null,
          },
        });
      });
    } catch (error) {
      const attemptCount = row.attemptCount + 1;
      const delay = Math.min(
        3_600_000,
        30_000 * 2 ** Math.min(attemptCount, 7)
      );
      await compensations.updateMany({
        where: {
          id: row.id,
          status: "processing",
          availableAt: leaseExpiresAt,
        },
        data: {
          status: "failed",
          lastError: this.errorMessage(error, "Auth role compensation failed"),
          availableAt: new Date(Date.now() + delay),
        },
      });
    }
  }

  private compensationRoleInput(row: any) {
    if (
      row.scope === "unit" &&
      ["simpeg", "siakad", "spmb"].includes(row.app) &&
      ["admin_unit", "admin_unit_nondik"].includes(row.role)
    ) {
      return {
        scope: "unit" as const,
        userId: row.userId,
        unitId: row.scopeId,
        app: row.app as "simpeg" | "siakad" | "spmb",
        role: row.role as "admin_unit" | "admin_unit_nondik",
      };
    }
    if (
      row.scope === "department" &&
      row.app === "simakin" &&
      ["admin_bidang", "admin_biro"].includes(row.role)
    ) {
      return {
        scope: "department" as const,
        userId: row.userId,
        departmentId: row.scopeId,
        app: "simakin" as const,
        role: row.role as "admin_bidang" | "admin_biro",
      };
    }
    throw new Error("Unsupported Auth organization-role compensation payload.");
  }

  private errorMessage(error: unknown, fallback: string) {
    return error instanceof Error
      ? error.message
          .slice(0, 500)
          .replace(/(?:token|authorization|cookie)=?[^\s]*/gi, "[REDACTED]")
      : fallback;
  }
}
