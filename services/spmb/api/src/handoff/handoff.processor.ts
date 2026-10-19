import { Injectable, Logger } from "@nestjs/common";
import { Interval } from "@nestjs/schedule";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { HandoffService } from "./handoff.service";

const DISPATCH_INTERVAL_MS = 30_000;
const LEASE_DURATION_MS = 5 * 60_000;

type HandoffOutboxCandidate = {
  id: string;
  registrationId: string;
  attempts: number;
};

type DispatchResult = {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
};

@Injectable()
export class HandoffProcessor {
  private readonly logger = new Logger(HandoffProcessor.name);
  private readonly now = () => new Date();
  private readonly workerId = `spmb-handoff-${randomUUID()}`;
  private dispatchInProgress = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly handoffService: HandoffService,
  ) {}

  @Interval("spmb-handoff-dispatcher", DISPATCH_INTERVAL_MS)
  async dispatchScheduledOutbox(): Promise<DispatchResult> {
    if (this.dispatchInProgress) {
      return { processed: 0, succeeded: 0, failed: 0, skipped: 1 };
    }

    this.dispatchInProgress = true;
    try {
      const result = await this.processPendingOutbox();
      this.logger.log(
        JSON.stringify({
          event: "spmb.handoff.dispatch",
          workerId: this.workerId,
          ...result,
        }),
      );
      return result;
    } finally {
      this.dispatchInProgress = false;
    }
  }

  async processPendingOutbox(limit = 10): Promise<DispatchResult> {
    if (!this.prisma.handoffOutbox?.findMany) {
      return { processed: 0, succeeded: 0, failed: 0, skipped: 0 };
    }

    const now = this.now();
    const expiredLeaseAt = new Date(now.getTime() - LEASE_DURATION_MS);
    const pendingItems = await this.prisma.handoffOutbox.findMany({
      where: {
        OR: [
          {
            status: { in: ["pending", "failed"] },
            availableAt: { lte: now },
          },
          {
            status: "processing",
            leasedAt: { lt: expiredLeaseAt },
          },
        ],
      },
      take: limit,
      orderBy: { createdAt: "asc" },
    });

    let succeeded = 0;
    let failed = 0;
    let processed = 0;
    let skipped = 0;

    for (const item of pendingItems as HandoffOutboxCandidate[]) {
      const claim = await this.prisma.handoffOutbox.updateMany({
        where: {
          id: item.id,
          OR: [
            {
              status: { in: ["pending", "failed"] },
              availableAt: { lte: now },
            },
            {
              status: "processing",
              leasedAt: { lt: expiredLeaseAt },
            },
          ],
        },
        data: {
          status: "processing",
          leasedAt: now,
          leaseOwner: this.workerId,
        },
      });

      if (claim.count !== 1) {
        skipped++;
        continue;
      }

      processed++;
      try {
        const result = await this.handoffService.deliverOutbox(item.registrationId);
        if (result.success) {
          succeeded++;
        } else {
          failed++;
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Unknown handoff delivery error";
        const availableAt = this.nextAvailableAt(item.attempts + 1, now);
        await this.prisma.handoffOutbox.updateMany({
          where: { id: item.id, status: "processing", leaseOwner: this.workerId },
          data: {
            status: "failed",
            attempts: { increment: 1 },
            availableAt,
            leasedAt: null,
            leaseOwner: null,
            lastError: message,
          },
        });
        this.logger.error(`Error processing handoff outbox item ${item.id}: ${message}`);
        failed++;
      }
    }

    return {
      processed,
      succeeded,
      failed,
      skipped,
    };
  }

  private nextAvailableAt(attempts: number, from: Date): Date {
    const delayMs = Math.min(2 ** Math.max(0, attempts - 1) * 30_000, 30 * 60_000);
    return new Date(from.getTime() + delayMs);
  }
}
