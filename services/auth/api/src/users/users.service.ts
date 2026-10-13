import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

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
}
