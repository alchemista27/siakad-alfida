import { PrismaClient } from "../../src/generated/prisma";

export type SimpegYmqProjection = {
  userId: string;
  fullName: string;
  email: string;
  unitId: string | null;
  unitName: string | null;
  isActive: boolean;
  sourceUpdatedAt: string;
};

export async function fetchSimpegYmqProjections(fetchImplementation: typeof fetch = fetch): Promise<SimpegYmqProjection[]> {
  const baseUrl = process.env.SIMPEG_INTERNAL_API_URL?.trim();
  const secret = process.env.INTERNAL_SERVICE_SECRET?.trim();
  if (!baseUrl || !secret) throw new Error("SIMPEG_INTERNAL_API_URL dan INTERNAL_SERVICE_SECRET wajib tersedia untuk membaca proyeksi pegawai YMQ.");
  const response = await fetchImplementation(new URL("/api/internal/ymq/employee-projections", baseUrl), {
    headers: { Accept: "application/json", "x-internal-service-key": secret },
    signal: AbortSignal.timeout(10_000),
  });
  const payload = await response.json().catch(() => null) as unknown;
  const rows = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { employees?: unknown }).employees)
      ? (payload as { employees: unknown[] }).employees
      : payload && typeof payload === "object" && Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : null;
  if (!response.ok || !rows || rows.some((row) => !isProjection(row))) {
    throw new Error("Proyeksi pegawai YMQ dari SIMPEG tidak valid.");
  }
  return rows as SimpegYmqProjection[];
}

export async function syncYmqProjectionUsers(prisma: PrismaClient, projections: SimpegYmqProjection[]) {
  const counts = { received: projections.length, created: 0, updated: 0, ignoredOlder: 0 };
  for (const projection of projections) {
    const existing = await prisma.user.findUnique({ where: { id: projection.userId }, select: { id: true, sourceUpdatedAt: true } });
    const sourceUpdatedAt = new Date(projection.sourceUpdatedAt);
    if (existing?.sourceUpdatedAt && sourceUpdatedAt.getTime() <= existing.sourceUpdatedAt.getTime()) {
      counts.ignoredOlder += 1;
      continue;
    }
    const data = {
      fullName: projection.fullName,
      email: projection.email,
      unitId: projection.unitId,
      unitName: projection.unitName,
      isActive: projection.isActive,
      sourceUpdatedAt,
    };
    if (existing) {
      await prisma.user.update({ where: { id: projection.userId }, data });
      counts.updated += 1;
    } else {
      await prisma.user.create({ data: { id: projection.userId, ...data } });
      counts.created += 1;
    }
  }
  return counts;
}

function isProjection(value: unknown): value is SimpegYmqProjection {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return typeof row.userId === "string"
    && typeof row.fullName === "string"
    && typeof row.email === "string"
    && (typeof row.unitId === "string" || row.unitId === null)
    && (typeof row.unitName === "string" || row.unitName === null)
    && typeof row.isActive === "boolean"
    && typeof row.sourceUpdatedAt === "string"
    && !Number.isNaN(Date.parse(row.sourceUpdatedAt));
}
