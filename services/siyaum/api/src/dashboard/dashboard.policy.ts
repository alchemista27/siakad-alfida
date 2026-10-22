import { BadRequestException } from "@nestjs/common";

export interface YmqDashboardQuery {
  from: string;
  to: string;
  unitId?: string;
  groupId?: string;
  pembinaUserId?: string;
  level?: "pra_tahsin" | "tahsin" | "tahfiz";
}

export function parseDashboardQuery(input: Partial<YmqDashboardQuery>): YmqDashboardQuery {
  if (!input.from || !input.to || !isDateOnly(input.from) || !isDateOnly(input.to)) {
    throw new BadRequestException("from dan to wajib berupa tanggal ISO YYYY-MM-DD.");
  }
  if (input.from > input.to) throw new BadRequestException("from tidak boleh setelah to.");
  for (const value of [input.unitId, input.groupId, input.pembinaUserId]) {
    if (value && !isUuid(value)) throw new BadRequestException("Filter ID harus UUID.");
  }
  if (input.level && !["pra_tahsin", "tahsin", "tahfiz"].includes(input.level)) {
    throw new BadRequestException("Level kelompok tidak valid.");
  }
  return {
    from: input.from,
    to: input.to,
    ...(input.unitId ? { unitId: input.unitId } : {}),
    ...(input.groupId ? { groupId: input.groupId } : {}),
    ...(input.pembinaUserId ? { pembinaUserId: input.pembinaUserId } : {}),
    ...(input.level ? { level: input.level } : {}),
  };
}

export function classifyLatestProgress(progress: { track: string; iwrLevel: string | null } | null): "iwr_1" | "iwr_2" | "quran" | null {
  if (!progress) return null;
  if (progress.track === "pra_tahsin" && progress.iwrLevel === "iwr_1") return "iwr_1";
  if (progress.track === "pra_tahsin" && progress.iwrLevel === "iwr_2") return "iwr_2";
  if (progress.track === "tahsin" || progress.track === "ziyadah") return "quran";
  return null;
}

function isDateOnly(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime());
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
