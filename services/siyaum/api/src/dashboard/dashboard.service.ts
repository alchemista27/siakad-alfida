import { ForbiddenException, Injectable } from "@nestjs/common";
import { Prisma, VerificationStatus } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { canManageGroup, canReadExecutiveDashboard, hasAnyYmqRole, type YmqPrincipal } from "../ymq/ymq-access.policy";
import { rankYmqParticipants } from "./dashboard-ranking.policy";
import { classifyLatestProgress, parseDashboardQuery, type YmqDashboardQuery } from "./dashboard.policy";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [totalGroups, totalMembers, totalSetoran, setoranStats, verifiedCount, pendingCount] = await Promise.all([
      this.prisma.ymqGroup.count(),
      this.prisma.ymqMember.count(),
      this.prisma.ymqSetoran.count(),
      this.prisma.ymqSetoran.aggregate({ _sum: { jumlahHalaman: true } }),
      this.prisma.ymqSetoran.count({ where: { statusVerifikasi: VerificationStatus.verified } }),
      this.prisma.ymqSetoran.count({ where: { statusVerifikasi: VerificationStatus.pending } }),
    ]);
    const totalHalaman = setoranStats._sum.jumlahHalaman || 0;
    return { totalGroups, totalMembers, totalSetoran, totalHalaman, totalKhatamEstimasi: Math.floor(totalHalaman / 604), verifiedCount, pendingCount };
  }

  async general(rawQuery: Partial<YmqDashboardQuery>, principal: YmqPrincipal) {
    const query = parseDashboardQuery(rawQuery);
    const groups = await this.loadGroups(query, principal, false);
    return { appliedFilters: query, groups: this.summarizeGroups(groups, query) };
  }

  async executiveOverview(rawQuery: Partial<YmqDashboardQuery>, principal: YmqPrincipal) {
    if (!canReadExecutiveDashboard(principal)) throw new ForbiddenException("Dashboard eksekutif hanya untuk admin YMQ, pengawas, atau pimpinan.");
    const query = parseDashboardQuery(rawQuery);
    const groups = await this.loadGroups(query, principal, true);
    const summaries = this.summarizeGroups(groups, query);
    const roster = this.filteredRoster(groups, query);
    const latest = await this.latestProgressByMember(groups.map((group) => group.id), roster.map((member) => member.id), query.to);
    const pieCounts = { iwr_1: 0, iwr_2: 0, quran: 0 };
    for (const member of roster) {
      const category = classifyLatestProgress(latest.get(member.id) ?? null);
      if (category) pieCounts[category] += 1;
    }
    const classified = pieCounts.iwr_1 + pieCounts.iwr_2 + pieCounts.quran;
    const denominator = classified || 0;
    const dateTo = parseDate(query.to);
    const weeklyStart = new Date(dateTo);
    weeklyStart.setUTCDate(weeklyStart.getUTCDate() - 6);
    const attendance = attendanceRates(groups, query, weeklyStart);
    return {
      appliedFilters: query,
      roster: { activeParticipants: roster.length, unclassifiedParticipantCount: roster.length - classified },
      attendance,
      progressPie: [
        { key: "iwr_1", label: "IWR 1", participants: pieCounts.iwr_1, percentage: percentage(pieCounts.iwr_1, denominator) },
        { key: "iwr_2", label: "IWR 2", participants: pieCounts.iwr_2, percentage: percentage(pieCounts.iwr_2, denominator) },
        { key: "quran", label: "Qur'an", participants: pieCounts.quran, percentage: percentage(pieCounts.quran, denominator) },
      ],
      groups: summaries,
    };
  }

  async executiveGroups(rawQuery: Partial<YmqDashboardQuery>, principal: YmqPrincipal) {
    return (await this.executiveOverview(rawQuery, principal)).groups;
  }

  async executiveRankings(rawQuery: Partial<YmqDashboardQuery>, principal: YmqPrincipal) {
    if (!canReadExecutiveDashboard(principal)) throw new ForbiddenException("Dashboard eksekutif hanya untuk admin YMQ, pengawas, atau pimpinan.");
    const query = parseDashboardQuery(rawQuery);
    const groups = await this.loadGroups(query, principal, true);
    const roster = this.filteredRoster(groups, query);
    const dateTo = parseDate(query.to);
    const activeWeekStart = new Date(dateTo);
    activeWeekStart.setUTCDate(activeWeekStart.getUTCDate() - 6);
    const records = roster.map((member) => {
      const group = groups.find((candidate) => candidate.id === member.groupId)!;
      const relevantAttendance = group.learningSessions.flatMap((session) => session.attendance)
        .filter((item) => item.memberId === member.id && memberMatchesUnit(item.member.user.unitId, query.unitId));
      const relevantProgress = group.learningSessions.flatMap((session) => session.progress)
        .filter((item) => item.memberId === member.id && memberMatchesUnit(item.member.user.unitId, query.unitId));
      const attendanceRate = percentage(relevantAttendance.filter((item) => item.status === "hadir").length, relevantAttendance.length);
      const activeWeekRate = group.learningSessions.some((session) => session.sessionDate >= activeWeekStart
        && session.progress.some((item) => item.memberId === member.id && memberMatchesUnit(item.member.user.unitId, query.unitId))) ? 100 : 0;
      const sessionsHeld = group.learningSessions.length;
      const curriculumCoverageRate = percentage(new Set(relevantProgress.map((item) => `${item.track}:${item.iwrCurriculumUnitId ?? item.surahNumber ?? ""}:${item.sequence}`)).size, sessionsHeld || 1);
      return {
        userId: member.user.id,
        fullName: member.user.fullName,
        attendanceRate,
        activeWeekRate,
        curriculumCoverageRate,
        unitId: member.user.unitId,
        unitName: member.user.unitName,
        groupId: group.id,
        groupName: group.name,
        level: group.level,
      };
    });
    const deduplicated = new Map<string, typeof records[number]>();
    for (const record of records) {
      const existing = deduplicated.get(record.userId);
      if (!existing || record.attendanceRate > existing.attendanceRate) deduplicated.set(record.userId, record);
    }
    const ranked = rankYmqParticipants([...deduplicated.values()]);
    return {
      appliedFilters: query,
      rankingPolicy: {
        formula: "0.45*attendanceRate + 0.35*activeWeekRate + 0.20*curriculumCoverageRate",
        tieBreakers: ["rankingScore DESC", "curriculumCoverageRate DESC", "attendanceRate DESC", "fullName ASC", "userId ASC"],
      },
      rankings: ranked,
    };
  }

  private async loadGroups(query: YmqDashboardQuery, principal: YmqPrincipal, executive: boolean) {
    const groupWhere: Prisma.YmqGroupWhereInput = {
      ...(query.level ? { level: query.level } : {}),
      ...(query.pembinaUserId ? { pembinaUserId: query.pembinaUserId } : {}),
      ...(query.groupId ? { id: query.groupId } : {}),
    };
    const from = parseDate(query.from);
    const to = parseDate(query.to);
    const groups = await this.prisma.ymqGroup.findMany({
      where: groupWhere,
      include: {
        pembina: { select: { id: true, fullName: true, email: true } },
        groupAdmins: { where: { revokedAt: null }, select: { userId: true, revokedAt: true } },
        members: { where: { leftAt: null }, include: { user: { select: { id: true, fullName: true, unitId: true, unitName: true, isActive: true } } } },
        learningSessions: {
          where: { sessionDate: { gte: from, lte: to } },
          include: {
            attendance: { include: { member: { include: { user: { select: { id: true, fullName: true, unitId: true, unitName: true } } } } } },
            progress: { include: { member: { include: { user: { select: { id: true, fullName: true, unitId: true, unitName: true } } } }, iwrCurriculumUnit: { select: { iwrLevel: true } }, evidence: false } },
          },
          orderBy: { sessionDate: "asc" },
        },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
    const unitFiltered = query.unitId
      ? groups.filter((group) => group.members.some((member) => member.user.unitId === query.unitId))
      : groups;
    if (executive || hasAnyYmqRole(principal, ["admin_ymq", "pengawas", "pimpinan"])) return unitFiltered;
    return unitFiltered.filter((group) => canManageGroup(principal, group));
  }

  private summarizeGroups(groups: Awaited<ReturnType<DashboardService["loadGroups"]>>, query: YmqDashboardQuery) {
    return groups.map((group) => {
      const members = group.members.filter((member) => member.user.isActive && memberMatchesUnit(member.user.unitId, query.unitId));
      const memberIds = new Set(members.map((member) => member.id));
      const sessions = group.learningSessions;
      const attendance = sessions.flatMap((session) => session.attendance).filter((item) => memberIds.has(item.memberId));
      const progress = sessions.flatMap((session) => session.progress).filter((item) => memberIds.has(item.memberId));
      const latestSession = sessions.at(-1)?.sessionDate ?? null;
      return {
        group: { id: group.id, name: group.name, unitId: group.unitId, unitName: group.unitName, level: group.level },
        pembina: group.pembina,
        activeMembers: members.length,
        sessionsHeld: sessions.length,
        attendanceRate: rateOrNull(attendance.filter((item) => item.status === "hadir").length, attendance.length),
        latestSessionDate: latestSession,
        progressTotals: {
          praTahsin: progress.filter((item) => item.track === "pra_tahsin").length,
          tahsin: progress.filter((item) => item.track === "tahsin").length,
          ziyadah: progress.filter((item) => item.track === "ziyadah").length,
        },
        noData: { noActiveMembers: members.length === 0, noSessions: sessions.length === 0, noProgress: progress.length === 0 },
      };
    });
  }

  private filteredRoster(groups: Awaited<ReturnType<DashboardService["loadGroups"]>>, query: YmqDashboardQuery) {
    return groups.flatMap((group) => group.members
      .filter((member) => member.user.isActive && memberMatchesUnit(member.user.unitId, query.unitId))
      .map((member) => ({ ...member, groupId: group.id })));
  }

  private async latestProgressByMember(groupIds: string[], memberIds: string[], to: string) {
    const latest = new Map<string, { track: string; iwrLevel: string | null }>();
    if (!groupIds.length || !memberIds.length) return latest;
    const progress = await this.prisma.ymqLearningProgress.findMany({
      where: { memberId: { in: memberIds }, session: { groupId: { in: groupIds }, sessionDate: { lte: parseDate(to) } } },
      include: { iwrCurriculumUnit: { select: { iwrLevel: true } }, session: { select: { sessionDate: true, createdAt: true } } },
      orderBy: [{ session: { sessionDate: "desc" } }, { createdAt: "desc" }, { id: "desc" }],
    });
    for (const item of progress) {
      if (!latest.has(item.memberId)) latest.set(item.memberId, { track: item.track, iwrLevel: item.iwrCurriculumUnit?.iwrLevel ?? null });
    }
    return latest;
  }
}

function attendanceRates(groups: any[], query: YmqDashboardQuery, weeklyStart: Date) {
  const records = groups.flatMap((group) => group.learningSessions.flatMap((session: any) => session.attendance
    .filter((item: any) => memberMatchesUnit(item.member.user.unitId, query.unitId))
    .map((item: any) => ({ status: item.status, sessionDate: session.sessionDate }))));
  const weekly = records.filter((item) => item.sessionDate >= weeklyStart);
  return {
    weeklyRate: rateOrNull(weekly.filter((item) => item.status === "hadir").length, weekly.length),
    monthlyRate: rateOrNull(records.filter((item) => item.status === "hadir").length, records.length),
  };
}

function memberMatchesUnit(unitId: string | null, filterUnitId?: string) {
  return !filterUnitId || unitId === filterUnitId;
}

function rateOrNull(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : percentage(numerator, denominator);
}

function percentage(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Math.round((numerator / denominator) * 10_000) / 100;
}

function parseDate(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}
