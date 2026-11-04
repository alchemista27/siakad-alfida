import { BadRequestException, Injectable } from "@nestjs/common";
import { execFile } from "node:child_process";

export type FingerprintDeviceEvent = {
  enrollmentId: string;
  occurredAt: string;
  punch: number | null;
  status: number | null;
};

export type FingerprintDeviceRead = {
  device: { id: string; serial: string | null; firmware: string | null; name: string | null };
  events: FingerprintDeviceEvent[];
};

export type FingerprintReadiness = {
  enabled: boolean;
  missingConfigurationKeys: string[];
};

export const FINGERPRINT_CONFIGURATION_KEYS = [
  "SIMPEG_FINGERPRINT_ENABLED",
  "SIMPEG_FINGERPRINT_DEVICE_ID",
  "SIMPEG_FINGERPRINT_HOST",
  "SIMPEG_FINGERPRINT_PORT",
  "SIMPEG_FINGERPRINT_COMM_KEY",
  "SIMPEG_FINGERPRINT_TIMEZONE",
  "SIMPEG_FINGERPRINT_SYNC_INTERVAL_MS",
] as const;

type RunnerOptions = { env: Record<string, string>; timeout: number; maxBuffer: number };
export type FingerprintProcessRunner = (command: string, args: string[], options: RunnerOptions) => Promise<{ stdout: string; stderr: string }>;
export const FINGERPRINT_PROCESS_RUNNER = Symbol("FINGERPRINT_PROCESS_RUNNER");

function defaultRunner(command: string, args: string[], options: RunnerOptions): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile(command, args, options, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve({ stdout, stderr });
    });
  });
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new BadRequestException(`${name} belum dikonfigurasi.`);
  return value;
}

function integer(name: string, minimum: number, maximum: number): string {
  const value = required(name);
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new BadRequestException(`${name} tidak valid.`);
  }
  return String(parsed);
}

function sanitize(message: string, secret?: string): string {
  const withoutSecret = secret ? message.split(secret).join("[REDACTED]") : message;
  return withoutSecret.replace(/(?:password|comm[_ -]?key|token)=?[^\s]*/gi, "[REDACTED]").slice(0, 300);
}

function nullableText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parsePayload(raw: string): FingerprintDeviceRead {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new BadRequestException("Respons perangkat fingerprint tidak valid.");
  }
  if (!value || typeof value !== "object") throw new BadRequestException("Respons perangkat fingerprint tidak valid.");
  const payload = value as { device?: unknown; events?: unknown };
  if (!payload.device || typeof payload.device !== "object" || !Array.isArray(payload.events)) {
    throw new BadRequestException("Respons perangkat fingerprint tidak lengkap.");
  }
  const device = payload.device as Record<string, unknown>;
  if (typeof device.id !== "string" || !device.id.trim()) throw new BadRequestException("ID perangkat fingerprint tidak valid.");
  const events = payload.events.map((event): FingerprintDeviceEvent => {
    if (!event || typeof event !== "object") throw new BadRequestException("Event fingerprint tidak valid.");
    const row = event as Record<string, unknown>;
    if (typeof row.enrollmentId !== "string" || !row.enrollmentId.trim() || typeof row.occurredAt !== "string" || Number.isNaN(new Date(row.occurredAt).getTime())) {
      throw new BadRequestException("Event fingerprint tidak valid.");
    }
    const code = (name: "punch" | "status") => row[name] === null || row[name] === undefined
      ? null
      : Number.isInteger(row[name]) ? row[name] as number : (() => { throw new BadRequestException("Kode event fingerprint tidak valid."); })();
    return { enrollmentId: row.enrollmentId.trim(), occurredAt: new Date(row.occurredAt).toISOString(), punch: code("punch"), status: code("status") };
  });
  return { device: { id: device.id.trim(), serial: nullableText(device.serial), firmware: nullableText(device.firmware), name: nullableText(device.name) }, events };
}

@Injectable()
export class FingerprintDeviceClient {
  constructor(private readonly runner: FingerprintProcessRunner = defaultRunner) {}

  isEnabled(): boolean {
    return process.env.SIMPEG_FINGERPRINT_ENABLED === "true";
  }

  getReadiness(): FingerprintReadiness {
    return {
      enabled: this.isEnabled(),
      missingConfigurationKeys: FINGERPRINT_CONFIGURATION_KEYS.filter((key) => !process.env[key]?.trim()),
    };
  }

  async readAttendance(): Promise<FingerprintDeviceRead> {
    if (!this.isEnabled()) {
      throw new BadRequestException("SIMPEG_FINGERPRINT_ENABLED harus bernilai true untuk menjalankan sinkronisasi.");
    }
    const commKey = integer("SIMPEG_FINGERPRINT_COMM_KEY", 0, 2_147_483_647);
    const env = {
      SIMPEG_FINGERPRINT_HOST: required("SIMPEG_FINGERPRINT_HOST"),
      SIMPEG_FINGERPRINT_DEVICE_ID: required("SIMPEG_FINGERPRINT_DEVICE_ID"),
      SIMPEG_FINGERPRINT_PORT: integer("SIMPEG_FINGERPRINT_PORT", 1, 65_535),
      SIMPEG_FINGERPRINT_COMM_KEY: commKey,
      SIMPEG_FINGERPRINT_TIMEZONE: process.env.SIMPEG_FINGERPRINT_TIMEZONE?.trim() || "Asia/Jakarta",
    };
    try {
      const result = await this.runner("python3", ["services/simpeg/fingerprint/zk_read_attendance.py"], { env, timeout: 60_000, maxBuffer: 10 * 1024 * 1024 });
      return parsePayload(result.stdout);
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      const message = error instanceof Error ? error.message : "Koneksi fingerprint gagal.";
      throw new BadRequestException(`Koneksi fingerprint gagal: ${sanitize(message, commKey)}`);
    }
  }
}
