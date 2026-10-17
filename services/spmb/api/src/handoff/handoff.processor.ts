import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { HandoffService } from "./handoff.service";

@Injectable()
export class HandoffProcessor {
  private readonly logger = new Logger(HandoffProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly handoffService: HandoffService,
  ) {}

  async processPendingOutbox(limit = 10): Promise<{ processed: number; succeeded: number; failed: number }> {
    if (!this.prisma.handoffOutbox?.findMany) {
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    const pendingItems = await this.prisma.handoffOutbox.findMany({
      where: { status: { in: ["pending", "failed"] } },
      take: limit,
      orderBy: { createdAt: "asc" },
    });

    let succeeded = 0;
    let failed = 0;

    for (const item of pendingItems) {
      try {
        const result = await this.handoffService.deliverOutbox(item.registrationId);
        if (result.success) {
          succeeded++;
        } else {
          failed++;
        }
      } catch (err: any) {
        this.logger.error(`Error processing outbox item ${item.id}: ${err.message}`);
        failed++;
      }
    }

    return {
      processed: pendingItems.length,
      succeeded,
      failed,
    };
  }
}
