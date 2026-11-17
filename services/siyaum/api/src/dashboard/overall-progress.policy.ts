import { BadRequestException } from "@nestjs/common";

export type OverallProgressCategory = "iwr_1" | "iwr_2" | "tahsin";
export type OverallProgressQuery = { unitId?: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseOverallProgressQuery(input: OverallProgressQuery): OverallProgressQuery {
  if (!input.unitId) return {};
  if (!uuidPattern.test(input.unitId)) throw new BadRequestException("unitId harus UUID.");
  return { unitId: input.unitId };
}

export function classifyOverallProgress(value: { track: string; iwrLevel: string | null } | null): OverallProgressCategory | null {
  if (!value) return null;
  if (value.track === "pra_tahsin" && value.iwrLevel === "iwr_1") return "iwr_1";
  if (value.track === "pra_tahsin" && value.iwrLevel === "iwr_2") return "iwr_2";
  if (value.track === "tahsin") return "tahsin";
  return null;
}
