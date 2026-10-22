import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AttendanceStatus, LearningTrack, Prisma } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { canManageGroup, canReadGroup, hasAnyYmqRole, hasYmqRole, type YmqPrincipal } from "../ymq/ymq-access.policy";
import { UpsertLearningSessionDto } from "./sessions.dto";
import { validateLearningSessionPayload } from "./sessions.policy";

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(groupId: string, sessionDate: string, dto: UpsertLearningSessionDto, principal: YmqPrincipal) {
    const group = await this.prisma.ymqGroup.findUnique({
      where: { id: groupId },
      include: { groupAdmins: { where: { revokedAt: null }, select: { userId: true, revokedAt: true } } },
    });
    if (!group) throw new NotFoundException("Kelompok YMQ tidak ditemukan.");
    if (!canManageGroup(principal, group)) throw new ForbiddenException("Anda tidak ditugaskan pada kelompok ini.");
    if (!group.level) throw new BadRequestException("Level kelompok lama belum dipetakan.");

    const members = await this.prisma.ymqMember.findMany({ where: { groupId, leftAt: null }, select: { id: true } });
    const activeMemberIds = new Set(members.map((member) => member.id));
    const payload = { groupId, sessionDate, notes: dto.notes ?? null, attendance: dto.attendance, progress: dto.progress };
    const validated = validateLearningSessionPayload(payload, activeMemberIds, group.level);
    if (!validated.valid) throw new BadRequestException("reason" in validated ? validated.reason : "Payload sesi tidak valid.");

    const curriculumIds = dto.progress.flatMap((item) => item.iwrCurriculumUnitId ? [item.iwrCurriculumUnitId] : []);
    if (curriculumIds.length) {
      const curriculum = await this.prisma.ymqIwrCurriculumUnit.findMany({
        where: { id: { in: curriculumIds }, isActive: true },
        select: { id: true },
      });
      if (new Set(curriculum.map((item) => item.id)).size !== new Set(curriculumIds).size) {
        throw new BadRequestException("Unit IWR tidak aktif atau tidak ditemukan.");
      }
    }

    const date = parseDateOnly(sessionDate);
    const session = await this.prisma.$transaction(async (tx) => {
      const stored = await tx.ymqLearningSession.upsert({
        where: { groupId_sessionDate: { groupId, sessionDate: date } },
        create: { groupId, sessionDate: date, notes: dto.notes ?? null, createdById: principal.id },
        update: { notes: dto.notes ?? null },
      });
      await Promise.all(dto.attendance.map((attendance) => tx.ymqSessionAttendance.upsert({
        where: { sessionId_memberId: { sessionId: stored.id, memberId: attendance.memberId } },
        create: { sessionId: stored.id, memberId: attendance.memberId, status: attendance.status as AttendanceStatus, note: attendance.note ?? null },
        update: { status: attendance.status as AttendanceStatus, note: attendance.note ?? null },
      })));

      const incoming = new Set(dto.progress.map((progress) => `${progress.memberId}:${progress.track}:${progress.sequence}`));
      const existing = await tx.ymqLearningProgress.findMany({
        where: { sessionId: stored.id },
        select: { id: true, memberId: true, track: true, sequence: true },
      });
      const staleIds = existing
        .filter((progress) => !incoming.has(`${progress.memberId}:${progress.track}:${progress.sequence}`))
        .map((progress) => progress.id);
      if (staleIds.length) await tx.ymqLearningProgress.deleteMany({ where: { id: { in: staleIds } } });

      await Promise.all(dto.progress.map((progress) => tx.ymqLearningProgress.upsert({
        where: { sessionId_memberId_track_sequence: { sessionId: stored.id, memberId: progress.memberId, track: progress.track as LearningTrack, sequence: progress.sequence } },
        create: {
          sessionId: stored.id,
          memberId: progress.memberId,
          track: progress.track as LearningTrack,
          sequence: progress.sequence,
          iwrCurriculumUnitId: progress.iwrCurriculumUnitId,
          surahNumber: progress.surahNumber,
          ayahStart: progress.ayahStart,
          ayahEnd: progress.ayahEnd,
          note: progress.note ?? null,
        },
        update: {
          iwrCurriculumUnitId: progress.iwrCurriculumUnitId,
          surahNumber: progress.surahNumber,
          ayahStart: progress.ayahStart,
          ayahEnd: progress.ayahEnd,
          note: progress.note ?? null,
        },
      })));
      return stored;
    });
    return this.findOne(session.id, principal);
  }

  async list(query: { groupId?: string; from?: string; to?: string }, principal: YmqPrincipal) {
    const where: Prisma.YmqLearningSessionWhereInput = {};
    if (query.groupId) {
      const group = await this.loadGroupScope(query.groupId);
      this.assertReadGroup(principal, group);
      where.groupId = query.groupId;
    } else if (!hasAnyYmqRole(principal, ["admin_ymq", "pengawas", "pimpinan"])) {
      throw new ForbiddenException("groupId wajib untuk akses non-eksekutif.");
    }
    if (query.from || query.to) {
      where.sessionDate = {};
      if (query.from) where.sessionDate.gte = parseDateOnly(query.from);
      if (query.to) where.sessionDate.lte = parseDateOnly(query.to);
    }
    return this.prisma.ymqLearningSession.findMany({
      where,
      include: { group: { select: { id: true, name: true, level: true, unitId: true, unitName: true } } },
      orderBy: [{ sessionDate: "desc" }, { id: "desc" }],
    });
  }

  async findOne(id: string, principal: YmqPrincipal) {
    const session = await this.prisma.ymqLearningSession.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            groupAdmins: { where: { revokedAt: null }, select: { userId: true, revokedAt: true } },
            members: { where: { leftAt: null }, select: { userId: true } },
          },
        },
        attendance: { include: { member: { select: { userId: true, user: { select: { fullName: true } } } } }, orderBy: { memberId: "asc" } },
        progress: { include: { member: { select: { userId: true, user: { select: { fullName: true } } } }, iwrCurriculumUnit: true, evidence: true }, orderBy: [{ memberId: "asc" }, { track: "asc" }, { sequence: "asc" }] },
      },
    });
    if (!session) throw new NotFoundException("Sesi pembelajaran tidak ditemukan.");
    this.assertReadGroup(principal, session.group);
    if (hasYmqRole(principal, "peserta") && !hasAnyYmqRole(principal, ["admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan"])) {
      return {
        ...session,
        attendance: session.attendance.filter((item) => item.member.userId === principal.id),
        progress: session.progress.filter((item) => item.member.userId === principal.id),
      };
    }
    return session;
  }

  private async loadGroupScope(groupId: string) {
    const group = await this.prisma.ymqGroup.findUnique({
      where: { id: groupId },
      include: {
        groupAdmins: { where: { revokedAt: null }, select: { userId: true, revokedAt: true } },
        members: { where: { leftAt: null }, select: { userId: true } },
      },
    });
    if (!group) throw new NotFoundException("Kelompok YMQ tidak ditemukan.");
    return group;
  }

  private assertReadGroup(principal: YmqPrincipal, group: { id: string; pembinaUserId: string | null; groupAdmins: Array<{ userId: string; revokedAt: Date | null }>; members: Array<{ userId: string }> }) {
    if (canReadGroup(principal, group)) return;
    throw new ForbiddenException("Anda tidak berhak membaca kelompok ini.");
  }
}

function parseDateOnly(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new BadRequestException("Tanggal harus YYYY-MM-DD.");
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new BadRequestException("Tanggal tidak valid.");
  return date;
}
