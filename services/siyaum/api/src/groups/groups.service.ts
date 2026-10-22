import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { YmqGroupLevel } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { canReadGroup, hasAnyYmqRole, hasYmqRole, type YmqPrincipal } from "../ymq/ymq-access.policy";
import { AddMemberDto, UpsertGroupDto } from "./groups.dto";

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(principal: YmqPrincipal) {
    const groups = await this.prisma.ymqGroup.findMany({
      include: {
        pembina: { select: { id: true, fullName: true, email: true } },
        groupAdmins: { where: { revokedAt: null }, select: { userId: true, revokedAt: true } },
        _count: { select: { members: true } },
        members: { where: { leftAt: null }, select: { userId: true } },
      },
      orderBy: [{ name: "asc" }, { id: "asc" }],
    });
    if (hasAnyYmqRole(principal, ["admin_ymq", "pengawas", "pimpinan"])) return groups;
    return groups.filter((group) => canReadGroup(principal, group));
  }

  async findOne(id: string, principal: YmqPrincipal) {
    const group = await this.prisma.ymqGroup.findUnique({
      where: { id },
      include: {
        pembina: { select: { id: true, fullName: true, email: true, phone: true } },
        groupAdmins: { where: { revokedAt: null }, select: { userId: true, revokedAt: true } },
        members: { where: { leftAt: null }, include: { user: { select: { id: true, fullName: true, email: true, unitId: true, unitName: true } } } },
      },
    });
    if (!group) throw new NotFoundException("Kelompok YMQ tidak ditemukan.");
    if (canReadGroup(principal, group)) {
      if (hasYmqRole(principal, "peserta") && !hasAnyYmqRole(principal, ["admin_ymq", "pembina_ymq", "admin_kelompok", "pengawas", "pimpinan"])) {
        return { ...group, members: group.members.filter((member) => member.userId === principal.id) };
      }
      return group;
    }
    throw new ForbiddenException("Anda tidak dapat melihat roster kelompok ini.");
  }

  async upsert(dto: UpsertGroupDto, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    const unit = await this.prisma.user.findFirst({ where: { unitId: dto.unitId, isActive: true }, select: { unitName: true } });
    if (!unit?.unitName) throw new BadRequestException("unitId harus berasal dari proyeksi pegawai SIMPEG aktif.");
    const data = {
      name: dto.name,
      level: dto.level as YmqGroupLevel,
      unitId: dto.unitId,
      unitName: unit.unitName,
      description: dto.description || null,
      scheduleDay: dto.scheduleDay || null,
      scheduleTime: dto.scheduleTime || null,
      whatsappLink: dto.whatsappLink || null,
    };
    if (dto.id) return this.prisma.ymqGroup.update({ where: { id: dto.id }, data });
    return this.prisma.ymqGroup.create({ data });
  }

  async addMember(dto: AddMemberDto, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    const employee = await this.prisma.user.findUnique({ where: { id: dto.userId }, select: { id: true, isActive: true, sourceUpdatedAt: true } });
    if (!employee?.isActive || !employee.sourceUpdatedAt) throw new BadRequestException("Anggota harus pegawai aktif dari proyeksi SIMPEG.");
    const existingActive = await this.prisma.ymqMember.findFirst({ where: { userId: dto.userId, leftAt: null } });
    if (existingActive && existingActive.groupId !== dto.groupId) {
      await this.prisma.ymqMember.update({ where: { id: existingActive.id }, data: { leftAt: new Date() } });
    }
    const existing = await this.prisma.ymqMember.findUnique({ where: { groupId_userId: { groupId: dto.groupId, userId: dto.userId } } });
    return existing
      ? this.prisma.ymqMember.update({ where: { id: existing.id }, data: { leftAt: null } })
      : this.prisma.ymqMember.create({ data: { groupId: dto.groupId, userId: dto.userId } });
  }

  async removeMember(groupId: string, userId: string, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    const result = await this.prisma.ymqMember.updateMany({ where: { groupId, userId, leftAt: null }, data: { leftAt: new Date() } });
    if (!result.count) throw new NotFoundException("Anggota aktif tidak ditemukan.");
    return { groupId, userId, removed: true };
  }

  private requireAdmin(principal: YmqPrincipal) {
    if (!hasYmqRole(principal, "admin_ymq")) {
      throw new ForbiddenException("Hanya admin YMQ yang dapat mengelola kelompok dan roster.");
    }
  }
}
