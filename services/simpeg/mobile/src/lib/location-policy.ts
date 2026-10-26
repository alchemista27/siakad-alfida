export type LocationFix = {
  coords: { latitude: number; longitude: number; accuracy: number | null };
  timestamp: number;
  mocked?: boolean;
};

export type ValidatedLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  capturedAt: string;
  mocked?: boolean;
  mockStatus: "not-mocked-reported" | "tidak dapat diverifikasi";
};

/** Client-side quality gate, not proof against spoofing or rooted devices. */
export function validateLocationFix(position: LocationFix | null, now = Date.now(), radiusMeters?: number): ValidatedLocation {
  if (!position) throw new Error("Lokasi tidak tersedia. Aktifkan izin lokasi lalu coba lagi.");
  if (position.mocked === true) throw new Error("Lokasi mock/palsu terdeteksi. Absensi tidak dikirim.");
  const { latitude, longitude, accuracy } = position.coords;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error("Koordinat lokasi tidak valid.");
  }
  const maximumAccuracy = Number.isFinite(radiusMeters) && radiusMeters! > 0 ? Math.min(50, radiusMeters!) : 50;
  if (accuracy === null || !Number.isFinite(accuracy) || accuracy < 0 || accuracy > maximumAccuracy) {
    throw new Error(`Akurasi lokasi harus ${maximumAccuracy} meter atau lebih baik. Coba di area terbuka.`);
  }
  if (!Number.isFinite(position.timestamp) || position.timestamp < now - 15_000) {
    throw new Error("Fix lokasi terlalu lama. Coba ambil lokasi baru.");
  }
  if (position.timestamp > now + 5_000) throw new Error("Waktu fix lokasi berada di masa depan.");
  return {
    latitude, longitude, accuracyMeters: accuracy,
    capturedAt: new Date(position.timestamp).toISOString(),
    ...(typeof position.mocked === "boolean" ? { mocked: position.mocked } : {}),
    mockStatus: position.mocked === undefined ? "tidak dapat diverifikasi" : "not-mocked-reported",
  };
}
