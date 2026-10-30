import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { OrganizationRoleInput, validateOrganizationRoleInput } from "./organization-roles.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    app?: string;
    role?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.search) {
      where.OR = [
        { fullName: { contains: params.search, mode: "insensitive" } },
        { email: { contains: params.search, mode: "insensitive" } },
        { username: { contains: params.search, mode: "insensitive" } },
      ];
    }

    if (params.app || params.role) {
      where.roles = {
        some: {
          ...(params.app ? { app: params.app } : {}),
          ...(params.role ? { role: params.role } : {}),
        },
      };
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          roles: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map((u) => ({
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        username: u.username,
        phone: u.phone,
        isActive: u.isActive,
        createdAt: u.createdAt,
        roles: u.roles,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findObserverCandidates(
    principal: { roles?: Array<{ app?: string; role?: string; unitId?: string | null }> },
    unitId: string,
    search: string,
  ) {
    const normalizedUnitId = unitId.trim();
    const normalizedSearch = search.trim().slice(0, 100);

    if (!normalizedUnitId) {
      throw new BadRequestException("Unit penugasan wajib dipilih");
    }

    if (!this.canManageSpmbObservers(principal, normalizedUnitId)) {
      throw new ForbiddenException("Anda tidak memiliki akses untuk mengelola observer unit ini");
    }

    if (normalizedSearch.length < 2) {
      return [];
    }

    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
        OR: [
          { fullName: { contains: normalizedSearch, mode: "insensitive" } },
          { email: { contains: normalizedSearch, mode: "insensitive" } },
          { username: { contains: normalizedSearch, mode: "insensitive" } },
        ],
        roles: {
          some: {
            app: "spmb",
            role: "observer",
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
      },
      orderBy: { fullName: "asc" },
      take: 10,
    });

    return users;
  }

  private canManageSpmbObservers(
    principal: { roles?: Array<{ app?: string; role?: string; unitId?: string | null }> },
    unitId: string,
  ) {
    return (principal.roles ?? []).some((assignment) =>
      (assignment.role === "super_admin" && ["*", "auth", "core"].includes(assignment.app || "")) ||
      (assignment.role === "admin_unit" && ["*", "spmb"].includes(assignment.app || "") && assignment.unitId === unitId),
    );
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { roles: true },
    });
    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      username: user.username,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      roles: user.roles,
    };
  }

  async createUser(data: {
    email: string;
    fullName: string;
    password: string;
    username?: string;
    phone?: string;
    role?: string;
    app?: string;
    unitId?: string;
  }) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email.toLowerCase().trim() },
          ...(data.username ? [{ username: data.username.trim() }] : []),
        ],
      },
    });

    if (existing) {
      throw new BadRequestException("Email atau username sudah digunakan");
    }

    const passwordHash = await bcrypt.hash(data.password, 10);
    const userId = randomUUID();

    const user = await this.prisma.user.create({
      data: {
        id: userId,
        email: data.email.toLowerCase().trim(),
        fullName: data.fullName.trim(),
        username: data.username?.trim() || null,
        phone: data.phone?.trim() || null,
        passwordHash,
        accounts: {
          create: {
            id: randomUUID(),
            providerId: "credential",
            accountId: data.email.toLowerCase().trim(),
            password: passwordHash,
          },
        },
        roles: data.role
          ? {
              create: {
                id: randomUUID(),
                app: data.app || "*",
                role: data.role,
                unitId: data.unitId || null,
              },
            }
          : undefined,
      },
      include: { roles: true },
    });

    return user;
  }

  async assignRole(userId: string, data: {
    app: string;
    role: string;
    unitId?: string | null;
    departmentId?: string | null;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Pengguna tidak ditemukan");

    return this.prisma.roleAssignment.create({
      data: {
        id: randomUUID(),
        userId,
        app: data.app,
        role: data.role,
        unitId: data.unitId || null,
        departmentId: data.departmentId || null,
      },
    });
  }

  async revokeRole(roleAssignmentId: string) {
    return this.prisma.roleAssignment.delete({
      where: { id: roleAssignmentId },
    });
  }

  async toggleActive(userId: string, isActive: boolean) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });
  }

  async upsertOrganizationRole(input: OrganizationRoleInput): Promise<any>;
  async upsertOrganizationRole(data: { userId: string; departmentId: string; role: "admin_bidang" | "admin_biro" }): Promise<any>;
  async upsertOrganizationRole(data: OrganizationRoleInput | { userId: string; departmentId: string; role: "admin_bidang" | "admin_biro" }) {
    const input = this.normalizeOrganizationRoleInput(data);
    const user = await this.prisma.user.findUnique({ where: { id: input.userId } });
    if (!user?.isActive) throw new NotFoundException("Pengguna aktif tidak ditemukan");

    const where = this.organizationRoleWhere(input);
    const existing = await this.prisma.roleAssignment.findFirst({ where });
    if (existing) return existing;

    try {
      const assignment = await this.prisma.roleAssignment.create({
        data: { id: randomUUID(), ...where },
      });
      await this.prisma.session.deleteMany({ where: { userId: input.userId } });
      return assignment;
    } catch (error: any) {
      if (error?.code === "P2002") {
        const concurrentAssignment = await this.prisma.roleAssignment.findFirst({ where });
        if (concurrentAssignment) return concurrentAssignment;
      }
      throw error;
    }
  }

  async removeOrganizationRole(input: OrganizationRoleInput, options?: { idempotent?: boolean }): Promise<any>;
  async removeOrganizationRole(userId: string, departmentId: string, role: "admin_bidang" | "admin_biro", options?: { idempotent?: boolean }): Promise<any>;
  async removeOrganizationRole(
    inputOrUserId: OrganizationRoleInput | string,
    departmentIdOrOptions?: string | { idempotent?: boolean },
    role?: "admin_bidang" | "admin_biro",
    legacyOptions: { idempotent?: boolean } = { idempotent: true },
  ) {
    const input = typeof inputOrUserId === "string"
      ? this.normalizeOrganizationRoleInput({
          userId: inputOrUserId,
          departmentId: departmentIdOrOptions as string,
          role: role as "admin_bidang" | "admin_biro",
        })
      : inputOrUserId;
    const options = typeof inputOrUserId === "string"
      ? legacyOptions
      : (departmentIdOrOptions as { idempotent?: boolean } | undefined) ?? { idempotent: true };
    const where = this.organizationRoleWhere(input);
    const assignment = await this.prisma.roleAssignment.findFirst({ where });
    if (!assignment && options.idempotent) return { deleted: false };
    if (!assignment) throw new NotFoundException("Penugasan organisasi tidak ditemukan");

    const deleted = await this.prisma.roleAssignment.delete({ where: { id: assignment.id } });
    await this.prisma.session.deleteMany({ where: { userId: input.userId } });
    return deleted;
  }

  private normalizeOrganizationRoleInput(data: OrganizationRoleInput | { userId: string; departmentId: string; role: "admin_bidang" | "admin_biro" }): OrganizationRoleInput {
    if ("scope" in data) return data;
    return validateOrganizationRoleInput({
      userId: data.userId,
      scope: "department",
      departmentId: data.departmentId,
      app: "simakin",
      role: data.role,
    });
  }

  private organizationRoleWhere(input: OrganizationRoleInput) {
    return {
      userId: input.userId,
      app: input.app,
      role: input.role,
      unitId: input.scope === "unit" ? input.unitId : null,
      departmentId: input.scope === "department" ? input.departmentId : null,
    };
  }
}
