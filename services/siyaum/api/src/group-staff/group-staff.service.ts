import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { hasYmqRole, type YmqPrincipal } from "../ymq/ymq-access.policy";
import { AuthYmqRoleBrokerClient, type YmqOperationalRole } from "./auth-ymq-role-broker.client";

@Injectable()
export class GroupStaffService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleBroker: AuthYmqRoleBrokerClient,
  ) {}

  async assignPembina(groupId: string, userId: string, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    await this.requireGroupAndActiveEmployee(groupId, userId);
    const roleGrant = await this.roleBroker.assign(principal.id, userId, "pembina_ymq");
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.ymqGroup.update({ where: { id: groupId }, data: { pembinaUserId: userId } });
      });
    } catch (error) {
      if (roleGrant.changed) await this.compensateRevoke(principal.id, userId, "pembina_ymq");
      throw new InternalServerErrorException("Penugasan pembina tidak dapat disimpan.");
    }
    return this.readPembina(groupId);
  }

  async revokePembina(groupId: string, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    const group = await this.prisma.ymqGroup.findUnique({ where: { id: groupId }, select: { id: true, pembinaUserId: true } });
    if (!group) throw new NotFoundException("Kelompok YMQ tidak ditemukan.");
    if (!group.pembinaUserId) return this.readPembina(groupId);
    const formerPembinaId = group.pembinaUserId;
    await this.prisma.ymqGroup.update({ where: { id: groupId }, data: { pembinaUserId: null } });
    const otherAssignments = await this.prisma.ymqGroup.count({ where: { pembinaUserId: formerPembinaId } });
    if (otherAssignments === 0) await this.roleBroker.revoke(principal.id, formerPembinaId, "pembina_ymq");
    return this.readPembina(groupId);
  }

  async assignGroupAdmin(groupId: string, userId: string, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    await this.requireGroupAndActiveEmployee(groupId, userId);
    const roleGrant = await this.roleBroker.assign(principal.id, userId, "admin_kelompok");
    try {
      await this.prisma.$transaction(async (tx) => {
        const existing = await tx.ymqGroupAdminAssignment.findFirst({
          where: { groupId, userId, revokedAt: null },
          select: { id: true },
        });
        if (!existing) {
          await tx.ymqGroupAdminAssignment.create({
            data: { groupId, userId, assignedById: principal.id },
          });
        }
      });
    } catch (error) {
      if (roleGrant.changed) await this.compensateRevoke(principal.id, userId, "admin_kelompok");
      throw new InternalServerErrorException("Penugasan admin kelompok tidak dapat disimpan.");
    }
    return this.readGroupAdmin(groupId, userId);
  }

  async revokeGroupAdmin(groupId: string, userId: string, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    const active = await this.prisma.ymqGroupAdminAssignment.findFirst({
      where: { groupId, userId, revokedAt: null },
      select: { id: true },
    });
    if (!active) throw new NotFoundException("Penugasan admin kelompok aktif tidak ditemukan.");
    await this.prisma.ymqGroupAdminAssignment.update({ where: { id: active.id }, data: { revokedAt: new Date() } });
    const otherAssignments = await this.prisma.ymqGroupAdminAssignment.count({ where: { userId, revokedAt: null } });
    if (otherAssignments === 0) await this.roleBroker.revoke(principal.id, userId, "admin_kelompok");
    return { groupId, userId, revoked: true };
  }

  private requireAdmin(principal: YmqPrincipal) {
    if (!hasYmqRole(principal, "admin_ymq")) throw new ForbiddenException("Hanya admin YMQ yang dapat mengelola staf kelompok.");
  }

  private async requireGroupAndActiveEmployee(groupId: string, userId: string) {
    const [group, employee] = await Promise.all([
      this.prisma.ymqGroup.findUnique({ where: { id: groupId }, select: { id: true } }),
      this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, isActive: true, sourceUpdatedAt: true } }),
    ]);
    if (!group) throw new NotFoundException("Kelompok YMQ tidak ditemukan.");
    if (!employee?.isActive || !employee.sourceUpdatedAt) {
      throw new BadRequestException("Target harus pegawai aktif dari proyeksi SIMPEG.");
    }
  }

  private async compensateRevoke(actorId: string, targetUserId: string, role: YmqOperationalRole) {
    try {
      await this.roleBroker.revoke(actorId, targetUserId, role);
    } catch {
      // Never expose internal credentials or broker transport details.
    }
  }

  private readPembina(groupId: string) {
    return this.prisma.ymqGroup.findUniqueOrThrow({
      where: { id: groupId },
      select: { id: true, pembinaUserId: true, pembina: { select: { id: true, fullName: true, email: true, unitId: true, unitName: true } } },
    });
  }

  private readGroupAdmin(groupId: string, userId: string) {
    return this.prisma.ymqGroupAdminAssignment.findFirstOrThrow({
      where: { groupId, userId, revokedAt: null },
      include: { user: { select: { id: true, fullName: true, email: true, unitId: true, unitName: true } } },
    });
  }
}
