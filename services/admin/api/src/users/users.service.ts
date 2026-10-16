import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import {
  CreateUserManualDto,
  AddRoleDto,
  ResetPasswordDto,
  BatchImportUsersDto,
} from "./dto/users.dto";
import { assertDirectRoleAssignment } from "./role-catalog";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers(params: {
    search?: string;
    app?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { username: { contains: q, mode: "insensitive" } },
      ];
    }

    if (typeof params.isActive === "boolean") {
      where.isActive = params.isActive;
    }

    if (params.app || params.role) {
      where.roles = {
        some: {
          ...(params.app ? { app: params.app } : {}),
          ...(params.role ? { role: params.role } : {}),
        },
      };
    }

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          roles: true,
        },
      }),
    ]);

    return {
      data: users.map((u) => ({
        id: u.id,
        email: u.email,
        username: u.username,
        fullName: u.fullName,
        phone: u.phone,
        isActive: u.isActive,
        createdAt: u.createdAt,
        roles: u.roles,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPendingApprovals() {
    const pendingUsers = await this.prisma.user.findMany({
      where: { isActive: false },
      orderBy: { createdAt: "desc" },
      include: {
        roles: true,
      },
    });

    return pendingUsers.map((u) => ({
      id: u.id,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      createdAt: u.createdAt,
      roles: u.roles,
    }));
  }

  async approveUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
    });

    return {
      success: true,
      message: `Akun ${user.fullName} (${user.email}) berhasil disetujui dan diaktifkan.`,
      user: {
        id: updated.id,
        email: updated.email,
        isActive: updated.isActive,
      },
    };
  }

  async rejectUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: `Pendaftaran ${user.fullName} (${user.email}) ditolak dan data dihapus.`,
    };
  }

  async createUserManual(dto: CreateUserManualDto) {
    const roles = dto.roles.map(assertDirectRoleAssignment);
    const email = dto.email.toLowerCase().trim();
    const existing = await this.prisma.user.findFirst({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException("Email sudah terdaftar di sistem");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const userId = randomUUID();

    const user = await this.prisma.user.create({
      data: {
        id: userId,
        email,
        fullName: dto.fullName.trim(),
        phone: dto.phone?.trim() || null,
        passwordHash,
        isActive: true,
        accounts: {
          create: {
            id: randomUUID(),
            providerId: "credential",
            accountId: userId,
            password: passwordHash,
          },
        },
        roles: {
          create: roles.map((r) => ({
            id: randomUUID(),
            app: r.app,
            role: r.role,
            unitId: r.unitId || null,
            departmentId: r.departmentId || null,
          })),
        },
      },
      include: {
        roles: true,
      },
    });

    return {
      success: true,
      message: "Pengguna berhasil ditambahkan secara manual",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isActive: user.isActive,
        roles: user.roles,
      },
    };
  }

  async batchImportUsers(dto: BatchImportUsersDto) {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    const defaultPassword = "Password123!";

    for (const item of dto.users) {
      try {
        const role = assertDirectRoleAssignment({
          app: item.app || "simpeg",
          role: item.role,
          unitId: item.unitId,
        });
        const email = item.email.toLowerCase().trim();
        const existing = await this.prisma.user.findFirst({
          where: { email },
        });

        if (existing) {
          failedCount++;
          errors.push(`Email ${email} sudah terdaftar`);
          continue;
        }

        const passToHash = item.password || defaultPassword;
        const passwordHash = await bcrypt.hash(passToHash, 10);
        const userId = randomUUID();

        await this.prisma.user.create({
          data: {
            id: userId,
            email,
            fullName: item.fullName.trim(),
            phone: item.phone?.trim() || null,
            passwordHash,
            isActive: true,
            accounts: {
              create: {
                id: randomUUID(),
                providerId: "credential",
                accountId: userId,
                password: passwordHash,
              },
            },
            roles: {
              create: [
                {
                  id: randomUUID(),
                  app: role.app,
                  role: role.role,
                  unitId: role.unitId || null,
                },
              ],
            },
          },
        });

        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Gagal mengimpor ${item.email}: ${err.message}`);
      }
    }

    return {
      success: true,
      message: `Impor massal selesai: ${successCount} berhasil, ${failedCount} gagal`,
      successCount,
      failedCount,
      errors: errors.slice(0, 10),
    };
  }

  async toggleUserStatus(userId: string, isActive: boolean) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive },
    });

    return {
      success: true,
      message: `Status akun ${user.fullName} diubah menjadi ${isActive ? "Aktif" : "Nonaktif"}`,
      isActive: updated.isActive,
    };
  }

  async addRole(userId: string, dto: AddRoleDto) {
    const input = assertDirectRoleAssignment(dto);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    const where = {
      userId,
      app: input.app,
      role: input.role,
      unitId: null,
      departmentId: null,
    };
    const existing = await this.prisma.roleAssignment.findFirst({ where });
    if (existing) {
      return {
        success: true,
        message: `Peran [${input.app}:${input.role}] sudah dimiliki pengguna`,
        role: existing,
      };
    }

    const role = await this.prisma.roleAssignment.create({
      data: { id: randomUUID(), ...where },
    });
    await this.prisma.session.deleteMany({ where: { userId } });

    return {
      success: true,
      message: `Peran [${input.app}:${input.role}] berhasil disematkan`,
      role,
    };
  }

  async removeRole(roleAssignmentId: string) {
    const assignment = await this.prisma.roleAssignment.findUnique({
      where: { id: roleAssignmentId },
    });
    if (!assignment) {
      throw new NotFoundException("Peran pengguna tidak ditemukan");
    }

    assertDirectRoleAssignment(assignment);
    if (assignment.app === "auth" && assignment.role === "super_admin") {
      const activeSuperAdminCount = await this.prisma.roleAssignment.count({
        where: { app: "auth", role: "super_admin" },
      });
      if (activeSuperAdminCount <= 1) {
        throw new BadRequestException("Tidak dapat mencabut super_admin terakhir.");
      }
    }

    await this.prisma.roleAssignment.delete({
      where: { id: roleAssignmentId },
    });
    await this.prisma.session.deleteMany({ where: { userId: assignment.userId } });

    return {
      success: true,
      message: "Peran berhasil dicabut dari pengguna",
    };
  }

  async resetPassword(userId: string, dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      }),
      this.prisma.account.updateMany({
        where: { userId, providerId: "credential" },
        data: { password: passwordHash },
      }),
    ]);

    return {
      success: true,
      message: `Password akun ${user.fullName} berhasil diperbarui`,
    };
  }

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    await this.prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: `Pengguna ${user.fullName} (${user.email}) telah dihapus permanen`,
    };
  }
}
