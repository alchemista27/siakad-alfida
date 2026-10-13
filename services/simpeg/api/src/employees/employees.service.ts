import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpsertEmployeeProfileDto, SyncUserDto } from "./employees.dto";

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query?: { search?: string; type?: string }) {
    const where: any = { isActive: true };

    if (query?.search) {
      where.OR = [
        { fullName: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { username: { contains: query.search, mode: "insensitive" } },
        { profile: { nip: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    if (query?.type) {
      where.profile = { ...where.profile, employeeType: query.type };
    }

    return this.prisma.user.findMany({
      where,
      include: {
        profile: true,
        unitAssignments: {
          orderBy: { isPrimary: "desc" },
        },
      },
      orderBy: { fullName: "asc" },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        unitAssignments: true,
        leaveRequests: {
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("Pegawai tidak ditemukan");
    }

    return user;
  }

  async upsertProfile(dto: UpsertEmployeeProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException("Data user tidak ditemukan");
    }

    return this.prisma.employeeProfile.upsert({
      where: { userId: dto.userId },
      create: {
        userId: dto.userId,
        nip: dto.nip || null,
        position: dto.position || null,
        employeeType: dto.employeeType || "tetap",
        joinDate: dto.joinDate ? new Date(dto.joinDate) : null,
        notes: dto.notes || null,
      },
      update: {
        nip: dto.nip !== undefined ? dto.nip : undefined,
        position: dto.position !== undefined ? dto.position : undefined,
        employeeType: dto.employeeType !== undefined ? dto.employeeType : undefined,
        joinDate: dto.joinDate !== undefined ? (dto.joinDate ? new Date(dto.joinDate) : null) : undefined,
        notes: dto.notes !== undefined ? dto.notes : undefined,
      },
    });
  }

  async syncUser(dto: SyncUserDto) {
    return this.prisma.user.upsert({
      where: { id: dto.id },
      create: {
        id: dto.id,
        fullName: dto.fullName,
        username: dto.username || null,
        email: dto.email,
        phone: dto.phone || null,
        avatarUrl: dto.avatarUrl || null,
        leaveQuota: dto.leaveQuota ?? 12,
        isActive: dto.isActive ?? true,
      },
      update: {
        fullName: dto.fullName,
        username: dto.username || null,
        email: dto.email,
        phone: dto.phone || null,
        avatarUrl: dto.avatarUrl || null,
        leaveQuota: dto.leaveQuota !== undefined ? dto.leaveQuota : undefined,
        isActive: dto.isActive !== undefined ? dto.isActive : undefined,
      },
    });
  }

  async getDemographics() {
    const totalUsers = await this.prisma.user.count({ where: { isActive: true } });
    const profiles = await this.prisma.employeeProfile.findMany({
      select: { employeeType: true },
    });

    const byType: Record<string, number> = {};
    for (const p of profiles) {
      const type = p.employeeType || "lainnya";
      byType[type] = (byType[type] || 0) + 1;
    }

    const totalAssignments = await this.prisma.employeeUnitAssignment.count();

    return {
      totalEmployees: totalUsers,
      byType,
      totalAssignments,
    };
  }
}
