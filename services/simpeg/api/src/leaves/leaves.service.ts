import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateLeaveDto, ProcessLeaveDto } from "./leaves.dto";
import { LeaveStatus, LeaveType } from "../generated/prisma";

@Injectable()
export class LeavesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(status?: LeaveStatus, year?: number) {
    const where: any = {};
    if (status) where.status = status;
    if (year) {
      const startOfYear = new Date(year, 0, 1);
      const endOfYear = new Date(year, 11, 31, 23, 59, 59);
      where.startDate = { gte: startOfYear, lte: endOfYear };
    }

    return this.prisma.leaveRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            leaveQuota: true,
            unitAssignments: {
              where: { isPrimary: true },
              select: { unitName: true, role: true },
            },
          },
        },
        approvedBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findMyLeaves(userId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { userId },
      include: {
        approvedBy: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async create(userId: string, dto: CreateLeaveDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (end < start) {
      throw new BadRequestException("Tanggal selesai tidak boleh sebelum tanggal mulai.");
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    if (dto.type === LeaveType.cuti) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException("User tidak ditemukan.");
      }

      if (user.leaveQuota < days) {
        throw new BadRequestException(
          `Sisa kuota cuti Anda (${user.leaveQuota} hari) tidak mencukupi untuk permohonan ${days} hari.`
        );
      }
    }

    return this.prisma.leaveRequest.create({
      data: {
        userId,
        type: dto.type as LeaveType,
        startDate: start,
        endDate: end,
        reason: dto.reason,
        attachmentUrl: dto.attachmentUrl || null,
        status: LeaveStatus.pending,
      },
    });
  }

  async approve(id: string, approverId: string, _dto?: ProcessLeaveDto) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException("Pengajuan cuti/izin tidak ditemukan.");
    }

    if (leave.status !== LeaveStatus.pending) {
      throw new BadRequestException("Pengajuan ini sudah diproses sebelumnya.");
    }

    const days = Math.ceil((leave.endDate.getTime() - leave.startDate.getTime()) / (1000 * 3600 * 24)) + 1;

    if (leave.type === LeaveType.cuti) {
      return this.prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: leave.userId },
          data: {
            leaveQuota: { decrement: days },
          },
        });

        return tx.leaveRequest.update({
          where: { id },
          data: {
            status: LeaveStatus.approved,
            approvedById: approverId,
          },
        });
      });
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.approved,
        approvedById: approverId,
      },
    });
  }

  async reject(id: string, approverId: string, _dto?: ProcessLeaveDto) {
    const leave = await this.prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leave) {
      throw new NotFoundException("Pengajuan cuti/izin tidak ditemukan.");
    }

    if (leave.status !== LeaveStatus.pending) {
      throw new BadRequestException("Pengajuan ini sudah diproses sebelumnya.");
    }

    return this.prisma.leaveRequest.update({
      where: { id },
      data: {
        status: LeaveStatus.rejected,
        approvedById: approverId,
      },
    });
  }
}
