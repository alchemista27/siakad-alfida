import type { ActiveUnit } from "./reconcile";

export async function fetchActiveSimpegUnits(fetchImplementation: typeof fetch = fetch): Promise<ActiveUnit[]> {
  const baseUrl = process.env.SIMPEG_INTERNAL_API_URL?.trim();
  const secret = process.env.INTERNAL_SERVICE_SECRET?.trim();
  if (!baseUrl || !secret) throw new Error("SIMPEG_INTERNAL_API_URL dan INTERNAL_SERVICE_SECRET wajib tersedia untuk membaca katalog unit.");

  const response = await fetchImplementation(new URL("/api/internal/units/active", baseUrl), {
    headers: { Accept: "application/json", "x-internal-service-key": secret },
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(payload) || payload.some((unit) => !unit || typeof unit.id !== "string" || typeof unit.name !== "string")) {
    throw new Error("Katalog unit aktif SIMPEG tidak dapat dibaca.");
  }
  return payload as ActiveUnit[];
}
