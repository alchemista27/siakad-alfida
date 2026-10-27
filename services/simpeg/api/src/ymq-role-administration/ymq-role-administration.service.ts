import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuthYmqRoleBrokerClient } from "./auth-ymq-role-broker.client";

@Injectable()
export class YmqRoleAdministrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authRoleBroker: AuthYmqRoleBrokerClient,
  ) {}

  async listAdmins() {
    const assignments = await this.authRoleBroker.list("admin_ymq");
    const userIds = assignments.map((assignment) => assignment.userId);
    if (userIds.length === 0) return [];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds }, isActive: true },
      select: { id: true, fullName: true, email: true, isActive: true },
    });
    return users.sort((left, right) => left.fullName.localeCompare(right.fullName, "id"));
  }

  assignAdminYmq(actorUserId: string, userId: string) {
    return this.authRoleBroker.assign(actorUserId, userId, "admin_ymq");
  }

  revokeAdminYmq(actorUserId: string, userId: string) {
    return this.authRoleBroker.revoke(actorUserId, userId, "admin_ymq");
  }
}
