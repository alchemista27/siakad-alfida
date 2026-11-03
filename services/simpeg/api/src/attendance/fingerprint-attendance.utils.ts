import { createHash } from "node:crypto";
import { utcDate } from "./workday-policy";
import { jakartaDateKey } from "./jakarta-worktime";

export type FingerprintEventInput = {
  enrollmentId: string;
  occurredAt: string;
  punch: number | null;
  status: number | null;
};

export type NormalizedFingerprintEvent = {
  enrollmentId: string;
  occurredAt: Date;
  localDate: Date;
  punch: number | null;
  status: number | null;
  sourceKey: string;
};

function normalizedCode(value: number | null, name: string): number | null {
  if (value === null) return null;
  if (!Number.isInteger(value)) throw new Error(`${name} fingerprint tidak valid.`);
  return value;
}

export function isOfficeWeekday(value: string | Date): boolean {
  const day = utcDate(typeof value === "string" ? value : jakartaDateKey(value));
  return day.getUTCDay() >= 1 && day.getUTCDay() <= 5;
}

export function normalizeFingerprintEvent(
  deviceId: string,
  deviceSerial: string | null,
  input: FingerprintEventInput,
): NormalizedFingerprintEvent {
  const normalizedDeviceId = deviceId.trim();
  const enrollmentId = input.enrollmentId.trim();
  if (!normalizedDeviceId) throw new Error("ID perangkat fingerprint wajib diisi.");
  if (!enrollmentId) throw new Error("Nomor enroll fingerprint wajib diisi.");
  if (enrollmentId.length > 50) throw new Error("Nomor enroll fingerprint terlalu panjang.");

  const occurredAt = new Date(input.occurredAt);
  if (Number.isNaN(occurredAt.getTime())) throw new Error("Waktu log fingerprint tidak valid.");

  const punch = normalizedCode(input.punch, "Kode punch");
  const status = normalizedCode(input.status, "Kode status");
  const sourceKey = createHash("sha256")
    .update([
      normalizedDeviceId,
      deviceSerial?.trim() || "",
      enrollmentId,
      occurredAt.toISOString(),
      String(punch ?? ""),
      String(status ?? ""),
    ].join("\u001f"))
    .digest("hex");

  return {
    enrollmentId,
    occurredAt,
    localDate: utcDate(jakartaDateKey(occurredAt)),
    punch,
    status,
    sourceKey,
  };
}

export function selectDailyFingerprintWindow(events: NormalizedFingerprintEvent[]): {
  checkInTime: Date;
  checkOutTime: Date | null;
} {
  if (!events.length) throw new Error("Log fingerprint harian tidak tersedia.");
  const sorted = [...events].sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
  const checkInTime = sorted[0].occurredAt;
  const last = sorted.at(-1)!.occurredAt;
  return { checkInTime, checkOutTime: last > checkInTime ? last : null };
}
