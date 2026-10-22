export interface RankingInput {
  userId: string;
  fullName: string;
  attendanceRate: number;
  activeWeekRate: number;
  curriculumCoverageRate: number;
}

export interface RankedYmqParticipant extends RankingInput {
  rankingScore: number;
}

export function rankYmqParticipants(input: RankingInput[]): RankedYmqParticipant[] {
  return input
    .map((participant) => ({
      ...participant,
      rankingScore: round(
        (0.45 * clampRate(participant.attendanceRate))
        + (0.35 * clampRate(participant.activeWeekRate))
        + (0.2 * clampRate(participant.curriculumCoverageRate)),
      ),
    }))
    .sort((a, b) => b.rankingScore - a.rankingScore
      || b.curriculumCoverageRate - a.curriculumCoverageRate
      || b.attendanceRate - a.attendanceRate
      || a.fullName.localeCompare(b.fullName)
      || a.userId.localeCompare(b.userId))
    .slice(0, 20);
}

function clampRate(value: number): number {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
