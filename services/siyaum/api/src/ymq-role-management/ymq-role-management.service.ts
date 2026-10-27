import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { hasYmqRole, type YmqPrincipal } from "../ymq/ymq-access.policy";
import { AuthYmqRoleBrokerClient } from "../group-staff/auth-ymq-role-broker.client";

@Injectable()
export class YmqRoleManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly roleBroker: AuthYmqRoleBrokerClient,
  ) {}

  async listParticipants(principal: YmqPrincipal) {
    this.requireAdmin(principal);
    const assignments = await this.roleBroker.list("peserta");
    const userIds = assignments.map((assignment) => assignment.userId);
    if (userIds.length === 0) return [];
    return this.prisma.user.findMany({
      where: { id: { in: userIds }, isActive: true, sourceUpdatedAt: { not: null } },
      select: { id: true, fullName: true, email: true, unitId: true, unitName: true },
      orderBy: [{ fullName: "asc" }, { id: "asc" }],
    });
  }

  async assignParticipant(userId: string, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    await this.requireProjectedEmployee(userId);
    return this.roleBroker.assign(principal.id, userId, "peserta");
  }

  async revokeParticipant(userId: string, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    return this.roleBroker.revoke(principal.id, userId, "peserta");
  }

  private requireAdmin(principal: YmqPrincipal) {
    if (!hasYmqRole(principal, "admin_ymq")) {
      throw new ForbiddenException("Hanya Admin YMQ yang dapat mengelola peserta.");
    }
  }

  private async requireProjectedEmployee(userId: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, isActive: true, sourceUpdatedAt: true },
    });
    if (!employee?.isActive || !employee.sourceUpdatedAt) {
      throw new BadRequestException("Target peserta harus pegawai aktif dari proyeksi SIMPEG.");
    }
  }
}
