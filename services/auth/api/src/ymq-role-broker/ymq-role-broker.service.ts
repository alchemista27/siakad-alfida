import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { type YmqBrokerManagedRole, type YmqRoleBrokerAssignInput } from "./ymq-role-broker.policy";

export type YmqRoleBrokerRevokeRequest = {
  actorUserId: string;
  userId: string;
  role: YmqBrokerManagedRole;
};

type RoleScope = { app: string; role: string };

@Injectable()
export class YmqRoleBrokerService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(input: YmqRoleBrokerAssignInput) {
    if (input.actorUserId === input.userId) {
      throw new BadRequestException("Aktor tidak dapat memberikan peran YMQ kepada dirinya sendiri.");
    }

    const actor = await this.requireAuthorizedActor(input.actorUserId, input.role);
    const target = await this.requireActiveTarget(input.userId);
    this.assertTargetEligible(target.roles, input.role);

    const where = this.roleWhere(input.userId, input.role);
    const existing = await this.prisma.roleAssignment.findFirst({ where });
    if (existing) return { ...existing, changed: false };

    try {
      const assignment = await this.prisma.roleAssignment.create({ data: { id: randomUUID(), ...where } });
      await this.prisma.session.deleteMany({ where: { userId: input.userId } });
      return { ...assignment, changed: true, grantedBy: actor.id };
    } catch (error: unknown) {
      if (this.isUniqueConstraint(error)) {
        const concurrentAssignment = await this.prisma.roleAssignment.findFirst({ where });
        if (concurrentAssignment) return { ...concurrentAssignment, changed: false };
      }
      throw error;
    }
  }

  async revoke(input: YmqRoleBrokerRevokeRequest) {
    await this.requireAuthorizedActor(input.actorUserId, input.role);
    const assignment = await this.prisma.roleAssignment.findFirst({ where: this.roleWhere(input.userId, input.role) });
    if (!assignment) return { deleted: false };
    const deleted = await this.prisma.roleAssignment.delete({ where: { id: assignment.id } });
    await this.prisma.session.deleteMany({ where: { userId: input.userId } });
    return { ...deleted, deleted: true };
  }

  async list(role: YmqBrokerManagedRole) {
    return this.prisma.roleAssignment.findMany({
      where: { app: "siyaum", role, unitId: null, departmentId: null },
      select: { userId: true, role: true },
      orderBy: { userId: "asc" },
    });
  }

  private async requireAuthorizedActor(actorUserId: string, requestedRole: YmqBrokerManagedRole) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      include: { roles: true },
    });
    if (!actor?.isActive) throw new ForbiddenException("Aktor tidak berwenang mengelola peran YMQ.");

    const roles = actor.roles as RoleScope[];
    const globalSuperAdmin = this.isGlobalSuperAdmin(roles);
    const adminYmq = this.isAdminYmq(roles);
    const adminOnlyRoles: readonly YmqBrokerManagedRole[] = ["peserta", "pembina_ymq", "admin_kelompok"];
    const superAdminOnlyRoles: readonly YmqBrokerManagedRole[] = ["admin_ymq", "pengawas", "pimpinan"];

    if (superAdminOnlyRoles.includes(requestedRole) && !globalSuperAdmin) {
      throw new ForbiddenException("Hanya Super Admin yang dapat mengelola peran YMQ ini.");
    }
    if (adminOnlyRoles.includes(requestedRole) && !globalSuperAdmin && !adminYmq) {
      throw new ForbiddenException("Aktor tidak berwenang mengelola peran YMQ.");
    }
    return actor;
  }

  private async requireActiveTarget(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { roles: true },
    });
    if (!user?.isActive) throw new NotFoundException("Pengguna aktif tidak ditemukan.");
    return user;
  }

  private assertTargetEligible(targetRoles: RoleScope[], requestedRole: YmqBrokerManagedRole) {
    if (requestedRole === "peserta" && !targetRoles.some((entry) => entry.app === "simpeg" && entry.role === "pegawai")) {
      throw new BadRequestException("Target peserta harus memiliki peran pegawai SIMPEG aktif.");
    }
    if (["pembina_ymq", "admin_kelompok"].includes(requestedRole)
      && !targetRoles.some((entry) => entry.app === "siyaum" && entry.role === "peserta")) {
      throw new BadRequestException("Target pembina atau admin kelompok wajib sudah menjadi peserta YMQ.");
    }
  }

  private isGlobalSuperAdmin(roles: RoleScope[]) {
    return roles.some((assignment) => assignment.role === "super_admin" && ["*", "auth", "core"].includes(assignment.app));
  }

  private isAdminYmq(roles: RoleScope[]) {
    return roles.some((assignment) => assignment.app === "siyaum" && assignment.role === "admin_ymq");
  }

  private roleWhere(userId: string, role: YmqBrokerManagedRole) {
    return { userId, app: "siyaum", role, unitId: null, departmentId: null };
  }

  private isUniqueConstraint(error: unknown): error is { code: string } {
    return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
  }
}
