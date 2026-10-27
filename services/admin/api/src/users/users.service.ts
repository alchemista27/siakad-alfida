import {
  Injectable,
  BadRequestException,
  BadGatewayException,
  NotFoundException,
  Optional,
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
import { StaffApprovalProjectionClient } from "./staff-approval-projection.client";

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly staffProjection?: StaffApprovalProjectionClient,
  ) {}

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
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }

    const placement = this.staffPlacement(user.roles);
    if (placement) {
      if (!this.staffProjection) {
        throw new BadGatewayException("Integrasi persetujuan penugasan SIMPEG tidak tersedia.");
      }
      this.staffProjection.assertConfigured();
      const activated = await this.prisma.user.update({
        where: { id: userId },
        data: { isActive: true },
      });
      try {
        await this.staffProjection.provision({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          username: user.username ?? null,
          phone: user.phone ?? null,
          avatarUrl: user.avatarUrl ?? null,
          unitId: placement.unitId,
          employmentRole: placement.employmentRole,
        });
      } catch {
        await this.prisma.user.update({ where: { id: userId }, data: { isActive: false } });
        await this.prisma.session.deleteMany({ where: { userId } });
        throw new BadGatewayException(
          "Penugasan awal di SIMPEG gagal. Akun tetap menunggu persetujuan.",
        );
      }
      return {
        success: true,
        message: `Akun ${user.fullName} (${user.email}) berhasil disetujui, diaktifkan, dan ditugaskan ke unit pilihan di SIMPEG.`,
        user: { id: activated.id, email: activated.email, isActive: activated.isActive },
      };
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

  private staffPlacement(roles: Array<{ app: string; role: string; unitId: string | null; departmentId?: string | null }>) {
    const employeeRoles = roles.filter((role) => role.app === "simpeg" && role.role === "pegawai");
    if (employeeRoles.length === 0) return null;
    if (employeeRoles.length !== 1 || !employeeRoles[0].unitId) {
      throw new BadRequestException("Akun staf harus memiliki tepat satu unit penugasan dari formulir registrasi.");
    }
    const unitId = employeeRoles[0].unitId;
    const isTeacher = roles.some((role) => role.app === "siakad" && role.role === "guru" && role.unitId === unitId);
    return { unitId, employmentRole: isTeacher ? "guru" as const : "karyawan" as const };
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
      include: { roles: true },
    });

    if (!user) {
      throw new NotFoundException("Pengguna tidak ditemukan");
    }
    if (isActive && !user.isActive && this.staffPlacement(user.roles)) {
      return this.approveUser(userId);
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

  async getUnits() {
    try {
      const units = await (this.prisma as any).$queryRaw`
        SELECT id, name, slug, category FROM sim.units WHERE is_active = true OR is_active IS NULL ORDER BY name ASC
      `;
      if (Array.isArray(units) && units.length > 0) {
        return units;
      }
    } catch {
      // Fallback ke unit kanonikal jika query sim.units gagal
    }
    return [
      { id: "0f3505db-ba0b-48e3-a500-2de9790bdd63", name: "TK Islam Terpadu Auladuna 1", slug: "tk-auladuna-1", category: "pendidikan" },
      { id: "9fe99902-40e0-48dd-9275-d73531584365", name: "TK Islam Terpadu Auladuna 2", slug: "tk-auladuna-2", category: "pendidikan" },
      { id: "dcaa14b2-b20c-416a-ba90-9367016ce295", name: "SD Islam Terpadu Iqra 1", slug: "sd-iqra-1", category: "pendidikan" },
      { id: "c09fb430-b5d3-4ae2-a6cc-2220430da453", name: "SD Islam Terpadu Iqra 2", slug: "sd-iqra-2", category: "pendidikan" },
      { id: "5edd8be0-86ac-406b-b23c-418b3e387528", name: "SD Islam Terpadu Iqra 3", slug: "sd-iqra-3", category: "pendidikan" },
      { id: "a09edaf4-c656-4632-abf1-4c0a25150c98", name: "SMP Islam Terpadu Iqra", slug: "smp-iqra", category: "pendidikan" },
      { id: "28225003-d1d3-4276-901c-f9a42a7cac69", name: "SMA Islam Terpadu Iqra", slug: "sma-iqra", category: "pendidikan" },
      { id: "18d0d36c-aea5-4ba6-a89b-320f9a4f240d", name: "Pesantren Quran Alfida", slug: "pesantren-alfida", category: "pendidikan" },
      { id: "fed6e093-3fe7-46f7-b5c4-7b33e95ea8bb", name: "Kantor Pusat Yayasan", slug: "kantor-yayasan", category: "nondik" },
    ];
  }

  async getDepartments() {
    try {
      const depts = await (this.prisma as any).$queryRaw`
        SELECT id, name, parent_id as "parentId", is_active as "isActive"
        FROM sim.departments
        WHERE is_active = true
        ORDER BY name ASC
      `;
      if (Array.isArray(depts) && depts.length > 0) {
        return depts;
      }
    } catch {
      // Fallback ke bidang kanonikal jika query sim.departments gagal
    }
    return [
      { id: "3ac9abae-27ec-40e2-9032-e17724fc5b5e", name: "Bidang Kepegawaian", parentId: null, isActive: true },
      { id: "0946afff-c8c2-4b6c-bccf-b6802b034938", name: "Bidang Pendidikan", parentId: null, isActive: true },
      { id: "43984cd1-77be-422f-aac3-eebda167d65d", name: "Departemen Keuangan", parentId: null, isActive: true },
    ];
  }
}
