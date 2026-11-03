import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { FingerprintAttendanceService } from "./fingerprint-attendance.service";
import { isOfficeWeekday } from "./fingerprint-attendance.utils";

@Injectable()
export class FingerprintSyncProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(FingerprintSyncProcessor.name);
  private timer?: NodeJS.Timeout;
  private running = false;

  constructor(private readonly fingerprintAttendance: FingerprintAttendanceService) {}

  onModuleInit() {
    if (process.env.SIMPEG_FINGERPRINT_ENABLED !== "true") return;
    const configured = Number(process.env.SIMPEG_FINGERPRINT_SYNC_INTERVAL_MS ?? "300000");
    const intervalMs = Number.isFinite(configured) ? Math.min(3_600_000, Math.max(60_000, configured)) : 300_000;
    this.timer = setInterval(() => void this.run(), intervalMs);
    this.timer.unref();
    setTimeout(() => void this.run(), 3_000).unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async run() {
    if (this.running || !isOfficeWeekday(new Date())) return;
    this.running = true;
    try {
      await this.fingerprintAttendance.sync();
    } catch (error) {
      this.logger.warn(error instanceof Error ? error.message : "Sinkronisasi fingerprint terjadwal gagal.");
    } finally {
      this.running = false;
    }
  }
}
