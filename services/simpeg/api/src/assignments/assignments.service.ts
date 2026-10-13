import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAssignmentDto, UpdateAssignmentDto } from "./assignments.dto";

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters?: { unitId?: string; userId?: string; role?: string }) {
    const where: any = {};
    if (filters?.unitId) where.unitId = filters.unitId;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.role) where.role = filters.role;

    return this.prisma.employeeUnitAssignment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
            profile: true,
          },
        },
      },
      orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.employeeUnitAssignment.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { startDate: "desc" }],
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.employeeUnitAssignment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profile: true,
          },
        },
      },
    });
    if (!assignment) {
      throw new NotFoundException("Penugasan unit tidak ditemukan");
    }
    return assignment;
  }

  async create(dto: CreateAssignmentDto) {
    // If set as primary, unset other primary assignments for this user
    if (dto.isPrimary) {
      await this.prisma.employeeUnitAssignment.updateMany({
        where: { userId: dto.userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.employeeUnitAssignment.create({
      data: {
        userId: dto.userId,
        unitId: dto.unitId,
        unitName: dto.unitName,
        role: dto.role,
        isPrimary: dto.isPrimary ?? false,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        skNumber: dto.skNumber || null,
        notes: dto.notes || null,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    const existing = await this.prisma.employeeUnitAssignment.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException("Penugasan unit tidak ditemukan");
    }

    if (dto.isPrimary && !existing.isPrimary) {
      await this.prisma.employeeUnitAssignment.updateMany({
        where: { userId: existing.userId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    return this.prisma.employeeUnitAssignment.update({
      where: { id },
      data: {
        unitId: dto.unitId,
        unitName: dto.unitName,
        role: dto.role,
        isPrimary: dto.isPrimary,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate !== undefined ? (dto.endDate ? new Date(dto.endDate) : null) : undefined,
        skNumber: dto.skNumber,
        notes: dto.notes,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.employeeUnitAssignment.delete({
      where: { id },
    });
  }

  async getUnitSummary() {
    const assignments = await this.prisma.employeeUnitAssignment.findMany({
      select: {
        unitId: true,
        unitName: true,
        role: true,
        userId: true,
      },
    });

    const summaryMap = new Map<string, { unitId: string; unitName: string; totalStaff: number; roles: Record<string, number> }>();

    for (const a of assignments) {
      if (!summaryMap.has(a.unitId)) {
        summaryMap.set(a.unitId, {
          unitId: a.unitId,
          unitName: a.unitName,
          totalStaff: 0,
          roles: {},
        });
      }
      const item = summaryMap.get(a.unitId)!;
      item.totalStaff += 1;
      item.roles[a.role] = (item.roles[a.role] || 0) + 1;
    }

    return Array.from(summaryMap.values());
  }
}
