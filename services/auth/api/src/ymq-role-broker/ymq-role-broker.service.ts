import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { type YmqBrokerAssignableRole, type YmqRoleBrokerAssignInput } from "./ymq-role-broker.policy";

export type YmqRoleBrokerRevokeRequest = {
  actorUserId: string;
  userId: string;
  role: YmqBrokerAssignableRole;
};

@Injectable()
export class YmqRoleBrokerService {
  constructor(private readonly prisma: PrismaService) {}

  async assign(input: YmqRoleBrokerAssignInput) {
    if (input.actorUserId === input.userId) {
      throw new BadRequestException("Aktor tidak dapat memberikan peran YMQ kepada dirinya sendiri.");
    }

    await this.assertAuthorizedActor(input.actorUserId);
    await this.assertActiveTarget(input.userId);

    const where = this.roleWhere(input.userId, input.role);
    const existing = await this.prisma.roleAssignment.findFirst({ where });
    if (existing) return { ...existing, changed: false };

    try {
      const assignment = await this.prisma.roleAssignment.create({
        data: { id: randomUUID(), ...where },
      });
      await this.prisma.session.deleteMany({ where: { userId: input.userId } });
      return { ...assignment, changed: true };
    } catch (error: unknown) {
      if (this.isUniqueConstraint(error)) {
        const concurrentAssignment = await this.prisma.roleAssignment.findFirst({ where });
        if (concurrentAssignment) return { ...concurrentAssignment, changed: false };
      }
      throw error;
    }
  }

  async revoke(input: YmqRoleBrokerRevokeRequest) {
    await this.assertAuthorizedActor(input.actorUserId);

    const assignment = await this.prisma.roleAssignment.findFirst({
      where: this.roleWhere(input.userId, input.role),
    });
    if (!assignment) return { deleted: false };

    const deleted = await this.prisma.roleAssignment.delete({ where: { id: assignment.id } });
    await this.prisma.session.deleteMany({ where: { userId: input.userId } });
    return deleted;
  }

  private async assertAuthorizedActor(actorUserId: string) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      include: { roles: true },
    });
    const authorized = actor?.isActive && actor.roles.some((assignment) => (
      (assignment.app === "siyaum" && assignment.role === "admin_ymq")
      || ((assignment.app === "*" || assignment.app === "auth") && assignment.role === "super_admin")
    ));
    if (!authorized) {
      throw new ForbiddenException("Aktor tidak berwenang mengelola peran YMQ.");
    }
  }

  private async assertActiveTarget(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isActive) {
      throw new NotFoundException("Pengguna aktif tidak ditemukan.");
    }
  }

  private roleWhere(userId: string, role: YmqBrokerAssignableRole) {
    return { userId, app: "siyaum", role, unitId: null, departmentId: null };
  }

  private isUniqueConstraint(error: unknown): error is { code: string } {
    return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
  }
}
