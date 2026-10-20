import { Inject, Injectable, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

type FetchImplementation = (input: string, init?: RequestInit) => Promise<Response>;

export const SPMB_CONFIRMATION_FETCH = Symbol("SPMB_CONFIRMATION_FETCH");

function requiredEnvironment(name: "SPMB_CONFIRMATION_URL" | "SPMB_CONFIRMATION_SECRET"): string {
  const value = process.env[name]?.trim();
  if (!value) throw new ServiceUnavailableException(`Konfigurasi ${name} belum tersedia; konfirmasi SPMB tidak dijalankan`);
  return value;
}

function timeoutMs(): number {
  const configured = Number(process.env.SPMB_CONFIRMATION_TIMEOUT_MS ?? "5000");
  return Number.isInteger(configured) && configured >= 100 && configured <= 60_000 ? configured : 5_000;
}

function retryAt(now: Date, attempts: number): Date {
  return new Date(now.getTime() + Math.min(3_600_000, 60_000 * (2 ** Math.max(0, attempts - 1))));
}

@Injectable()
export class SpmbConfirmationService implements OnModuleInit, OnModuleDestroy {
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SPMB_CONFIRMATION_FETCH) private readonly fetchImplementation: FetchImplementation = fetch,
  ) {}

  onModuleInit() {
    if (!this.isConfigured()) return;
    this.timer = setInterval(() => {
      void this.deliverNext().catch(() => undefined);
    }, 30_000);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  private isConfigured(): boolean {
    return Boolean(process.env.SPMB_CONFIRMATION_URL?.trim() && process.env.SPMB_CONFIRMATION_SECRET?.trim());
  }

  async deliverNext(now = new Date()): Promise<any | null> {
    const url = requiredEnvironment("SPMB_CONFIRMATION_URL");
    const secret = requiredEnvironment("SPMB_CONFIRMATION_SECRET");
    const candidate = await (this.prisma as any).spmbConfirmationOutbox.findFirst({
      where: { OR: [{ status: "pending", availableAt: { lte: now } }, { status: "delivering", leasedUntil: { lte: now } }] },
      orderBy: { availableAt: "asc" },
    });
    if (!candidate) return null;
    const leaseToken = randomUUID();
    const leasedUntil = new Date(now.getTime() + timeoutMs() + 5_000);
    const claim = await (this.prisma as any).spmbConfirmationOutbox.updateMany({
      where: { id: candidate.id, OR: [{ status: "pending", availableAt: { lte: now } }, { status: "delivering", leasedUntil: { lte: now } }] },
      data: { status: "delivering", leaseToken, leasedUntil },
    });
    if (claim.count !== 1) return null;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs());
    try {
      const response = await this.fetchImplementation(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-internal-service-key": secret,
          "Idempotency-Key": candidate.idempotencyKey,
        },
        body: JSON.stringify({
          sourceRegistrationId: candidate.sourceRegistrationId,
          destinationEnrollmentId: candidate.enrollmentId,
        }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`SPMB confirmation returned HTTP ${response.status}`);
      await (this.prisma as any).spmbConfirmationOutbox.updateMany({
        where: { id: candidate.id, status: "delivering", leaseToken },
        data: { status: "delivered", deliveredAt: now, leasedUntil: null, leaseToken: null, lastError: null },
      });
      return { ...candidate, status: "delivered", deliveredAt: now };
    } catch (error) {
      const attempts = Number(candidate.attempts ?? 0) + 1;
      const message = error instanceof Error ? error.message.slice(0, 1000) : "SPMB confirmation failed";
      await (this.prisma as any).spmbConfirmationOutbox.updateMany({
        where: { id: candidate.id, status: "delivering", leaseToken },
        data: { status: "pending", attempts: { increment: 1 }, availableAt: retryAt(now, attempts), leasedUntil: null, leaseToken: null, lastError: message },
      });
      return { ...candidate, status: "pending", attempts, availableAt: retryAt(now, attempts), lastError: message };
    } finally {
      clearTimeout(timer);
    }
  }
}
