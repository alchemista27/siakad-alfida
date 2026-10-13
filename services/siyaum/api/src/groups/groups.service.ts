import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertGroupDto, AddMemberDto } from "./groups.dto";

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.ymqGroup.findMany({
      include: {
        musyrif: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    return this.prisma.ymqGroup.findUnique({
      where: { id },
      include: {
        musyrif: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, email: true, unitName: true },
            },
          },
        },
      },
    });
  }

  async upsert(dto: UpsertGroupDto) {
    if (dto.id) {
      return this.prisma.ymqGroup.update({
        where: { id: dto.id },
        data: {
          name: dto.name,
          musyrifId: dto.musyrifId,
          description: dto.description || null,
          scheduleDay: dto.scheduleDay || null,
          scheduleTime: dto.scheduleTime || null,
          whatsappLink: dto.whatsappLink || null,
        },
      });
    }

    return this.prisma.ymqGroup.create({
      data: {
        name: dto.name,
        musyrifId: dto.musyrifId,
        description: dto.description || null,
        scheduleDay: dto.scheduleDay || null,
        scheduleTime: dto.scheduleTime || null,
        whatsappLink: dto.whatsappLink || null,
      },
    });
  }

  async addMember(dto: AddMemberDto) {
    const existing = await this.prisma.ymqMember.findFirst({
      where: { userId: dto.userId },
    });
    if (existing) {
      throw new BadRequestException("Pegawai ini sudah terdaftar di kelompok halaqah YMQ.");
    }

    return this.prisma.ymqMember.create({
      data: {
        groupId: dto.groupId,
        userId: dto.userId,
      },
    });
  }

  async removeMember(groupId: string, userId: string) {
    return this.prisma.ymqMember.deleteMany({
      where: { groupId, userId },
    });
  }
}
