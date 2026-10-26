import type { LocationFix } from "./location-policy";

export type PrayerLocation = { latitude: number; longitude: number; accuracyMeters: number; capturedAt: number };

/** Separate, permissive quality gate for estimated prayer times; never used for attendance. */
export function validatePrayerLocation(fix: LocationFix | null, now = Date.now()): PrayerLocation {
  if (!fix) throw new Error("Lokasi tidak tersedia.");
  if (fix.mocked === true) throw new Error("Lokasi mock terdeteksi.");
  const { latitude, longitude, accuracy } = fix.coords;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error("Koordinat lokasi tidak valid.");
  }
  if (accuracy == null || !Number.isFinite(accuracy) || accuracy < 0 || accuracy > 5_000) {
    throw new Error("Akurasi lokasi tidak memadai.");
  }
  if (!Number.isFinite(fix.timestamp) || fix.timestamp < now - 300_000 || fix.timestamp > now + 5_000) {
    throw new Error("Fix lokasi terlalu lama atau waktunya tidak valid.");
  }
  return { latitude, longitude, accuracyMeters: accuracy, capturedAt: fix.timestamp };
}
