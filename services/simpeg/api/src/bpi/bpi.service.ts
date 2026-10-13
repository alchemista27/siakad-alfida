import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  UpsertLiqoGroupDto,
  AddLiqoMemberDto,
  CreateLiqoMeetingDto,
  SaveLiqoAttendanceDto,
  SaveMutabaahRecordDto,
} from "./bpi.dto";
import { AttendanceStatus, DayOfWeek } from "../generated/prisma";

@Injectable()
export class BpiService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= ADMIN BPI =================
  async getLiqoGroups() {
    return this.prisma.liqoGroup.findMany({
      include: {
        murobbi: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { members: true, meetings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async upsertLiqoGroup(dto: UpsertLiqoGroupDto) {
    if (dto.id) {
      return this.prisma.liqoGroup.update({
        where: { id: dto.id },
        data: {
          name: dto.name,
          murobbiId: dto.murobbiId,
          description: dto.description || null,
          scheduleDay: dto.scheduleDay as DayOfWeek,
          scheduleTime: dto.scheduleTime || null,
          scheduleLocation: dto.scheduleLocation || null,
          whatsappLink: dto.whatsappLink || null,
        },
      });
    }

    return this.prisma.liqoGroup.create({
      data: {
        name: dto.name,
        murobbiId: dto.murobbiId,
        description: dto.description || null,
        scheduleDay: dto.scheduleDay as DayOfWeek,
        scheduleTime: dto.scheduleTime || null,
        scheduleLocation: dto.scheduleLocation || null,
        whatsappLink: dto.whatsappLink || null,
      },
    });
  }

  async getLiqoMembers(groupId: string) {
    return this.prisma.liqoMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
  }

  async addLiqoMember(dto: AddLiqoMemberDto) {
    const existing = await this.prisma.liqoMember.findFirst({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException("Pegawai ini sudah menjadi anggota di kelompok Liqo lain.");
    }
    return this.prisma.liqoMember.create({
      data: {
        groupId: dto.groupId,
        userId: dto.userId,
      },
    });
  }

  async removeLiqoMember(groupId: string, userId: string) {
    return this.prisma.liqoMember.deleteMany({
      where: { groupId, userId },
    });
  }

  async getLiqoAttendanceStats() {
    const groups = await this.prisma.liqoGroup.findMany({
      include: {
        murobbi: { select: { fullName: true } },
        _count: { select: { members: true, meetings: true } },
        meetings: {
          include: { attendances: true },
        },
      },
    });

    return groups.map((group) => {
      let totalPresent = 0;
      let totalRecords = 0;
      group.meetings.forEach((meeting) => {
        meeting.attendances.forEach((att) => {
          totalRecords++;
          if (att.status === "present") totalPresent++;
        });
      });

      return {
        id: group.id,
        name: group.name,
        murobbiName: group.murobbi.fullName,
        memberCount: group._count.members,
        meetingCount: group._count.meetings,
        attendanceRate: totalRecords > 0 ? (totalPresent / totalRecords) * 100 : 0,
      };
    });
  }

  async getGlobalMutabaahStats(startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const records = await this.prisma.mutabaahRecord.findMany({
      where: {
        date: { gte: start, lte: end },
      },
    });

    const total = records.length;
    if (total === 0) {
      return {
        totalRecords: 0,
        avgSholatJamaah: 0,
        pctSholatDhuha: 0,
        pctTahajud: 0,
        avgTilawahPages: 0,
        pctPuasaSunnah: 0,
        pctInfaq: 0,
      };
    }

    const sumJamaah = records.reduce((acc, r) => acc + r.sholatJamaah, 0);
    const countDhuha = records.filter((r) => r.sholatDhuha).length;
    const countTahajud = records.filter((r) => r.sholatTahajud).length;
    const sumTilawah = records.reduce((acc, r) => acc + r.tilawahPages, 0);
    const countPuasa = records.filter((r) => r.puasaSunnah).length;
    const countInfaq = records.filter((r) => r.infaq).length;

    return {
      totalRecords: total,
      avgSholatJamaah: +(sumJamaah / total).toFixed(2),
      pctSholatDhuha: +((countDhuha / total) * 100).toFixed(1),
      pctTahajud: +((countTahajud / total) * 100).toFixed(1),
      avgTilawahPages: +(sumTilawah / total).toFixed(2),
      pctPuasaSunnah: +((countPuasa / total) * 100).toFixed(1),
      pctInfaq: +((countInfaq / total) * 100).toFixed(1),
    };
  }

  // ================= MUROBBI =================
  async getMyMurobbiGroups(murobbiId: string) {
    return this.prisma.liqoGroup.findMany({
      where: { murobbiId },
      include: {
        members: {
          include: {
            user: { select: { fullName: true, id: true, email: true } },
          },
        },
        meetings: {
          orderBy: { date: "desc" },
          take: 10,
          include: {
            _count: { select: { attendances: true } },
          },
        },
      },
    });
  }

  async createLiqoMeeting(murobbiId: string, groupId: string, dto: CreateLiqoMeetingDto) {
    const group = await this.prisma.liqoGroup.findUnique({ where: { id: groupId } });
    if (!group || group.murobbiId !== murobbiId) {
      throw new BadRequestException("Anda bukan murobbi kelompok ini.");
    }

    return this.prisma.liqoMeeting.create({
      data: {
        groupId,
        date: new Date(dto.date),
        materialTitle: dto.materialTitle,
        summary: dto.summary || null,
      },
    });
  }

  async saveLiqoAttendance(murobbiId: string, groupId: string, dto: SaveLiqoAttendanceDto) {
    const group = await this.prisma.liqoGroup.findUnique({ where: { id: groupId } });
    if (!group || group.murobbiId !== murobbiId) {
      throw new BadRequestException("Anda bukan murobbi kelompok ini.");
    }

    await this.prisma.$transaction(
      dto.attendances.map((att) =>
        this.prisma.liqoAttendance.upsert({
          where: {
            meetingId_userId: {
              meetingId: dto.meetingId,
              userId: att.userId,
            },
          },
          update: {
            status: att.status as AttendanceStatus,
            notes: att.notes || null,
          },
          create: {
            meetingId: dto.meetingId,
            userId: att.userId,
            status: att.status as AttendanceStatus,
            notes: att.notes || null,
          },
        })
      )
    );

    return { success: true };
  }

  // ================= MUTAROBBI (STAFF) =================
  async getMyLiqoGroup(userId: string) {
    const membership = await this.prisma.liqoMember.findFirst({
      where: { userId },
      include: {
        group: {
          include: {
            murobbi: { select: { fullName: true, email: true, phone: true } },
            meetings: {
              orderBy: { date: "desc" },
              take: 5,
              include: {
                attendances: { where: { userId } },
              },
            },
          },
        },
      },
    });

    return membership?.group || null;
  }

  async saveMutabaahRecord(userId: string, dto: SaveMutabaahRecordDto) {
    const dateStr = new Date(dto.date).toISOString().split("T")[0];
    const normalizedDate = new Date(`${dateStr}T00:00:00Z`);

    return this.prisma.mutabaahRecord.upsert({
      where: {
        userId_date: {
          userId,
          date: normalizedDate,
        },
      },
      update: {
        sholatJamaah: dto.sholatJamaah ?? 0,
        sholatRawatib: dto.sholatRawatib ?? 0,
        sholatDhuha: dto.sholatDhuha ?? false,
        sholatTahajud: dto.sholatTahajud ?? false,
        tilawahPages: dto.tilawahPages ?? 0,
        puasaSunnah: dto.puasaSunnah ?? false,
        infaq: dto.infaq ?? false,
      },
      create: {
        userId,
        date: normalizedDate,
        sholatJamaah: dto.sholatJamaah ?? 0,
        sholatRawatib: dto.sholatRawatib ?? 0,
        sholatDhuha: dto.sholatDhuha ?? false,
        sholatTahajud: dto.sholatTahajud ?? false,
        tilawahPages: dto.tilawahPages ?? 0,
        puasaSunnah: dto.puasaSunnah ?? false,
        infaq: dto.infaq ?? false,
      },
    });
  }

  async getMyMutabaah(userId: string, startDate?: string, endDate?: string) {
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return this.prisma.mutabaahRecord.findMany({
      where: {
        userId,
        date: { gte: start, lte: end },
      },
      orderBy: { date: "desc" },
    });
  }
}
