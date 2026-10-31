import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { canManageUnit } from "../common/organization-access.policy";
import { PrismaService } from "../prisma/prisma.service";
import { AuthStaffCandidateClient } from "../employees/auth-staff-candidate.client";
import {
  CreateAssignmentDto,
  MutateAssignmentDto,
  UpdateAssignmentDto,
} from "./assignments.dto";

type AssignmentFilters = { unitId?: string; userId?: string; role?: string };
type Principal = { roles?: unknown };

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authStaffCandidates: AuthStaffCandidateClient,
  ) {}

  private hasGlobalAccess(principal?: Principal): boolean {
    if (!Array.isArray(principal?.roles)) return false;
    return principal.roles.some((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const { app, role } = entry as { app?: string; role?: string };
      return (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app || ""))
        || (role === "admin_kepegawaian" && ["*", "simpeg"].includes(app || ""));
    });
  }

  private managedUnitIds(principal?: Principal): string[] {
    if (!Array.isArray(principal?.roles)) return [];
    return [...new Set(principal.roles.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const { app, role, unitId } = entry as { app?: string; role?: string; unitId?: string | null };
      return app === "simpeg"
        && (role === "admin_unit" || role === "admin_unit_nondik")
        && typeof unitId === "string"
        ? [unitId]
        : [];
    }))];
  }

  private assertReadable(principal: Principal | undefined, unitId: string): void {
    if (this.hasGlobalAccess(principal) || canManageUnit(principal?.roles, unitId)) return;
    throw new ForbiddenException("Anda tidak berwenang mengakses penugasan unit ini.");
  }

  private assertWritable(principal?: Principal): void {
    if (this.hasGlobalAccess(principal)) return;
    throw new ForbiddenException("Hanya HR atau super admin yang dapat mengubah penugasan.");
  }

  private dateOnly(value: string, label: string): Date {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new BadRequestException(`${label} harus berupa tanggal YYYY-MM-DD.`);
    }
    const date = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${label} tidak valid.`);
    }
    return date;
  }

  private previousDay(day: Date): Date {
    const previous = new Date(day);
    previous.setUTCDate(previous.getUTCDate() - 1);
    return previous;
  }

  private activeOn(day: Date) {
    return {
      startDate: { lte: day },
      OR: [{ endDate: null }, { endDate: { gte: day } }],
    };
  }

  private async requireActiveUnit(unitId: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id: unitId } });
    if (!unit) throw new NotFoundException("Unit penugasan tidak ditemukan.");
    if (!unit.isActive) throw new BadRequestException("Unit tujuan harus aktif.");
    return unit;
  }

  private async requireActiveEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException("Pegawai tidak ditemukan.");
    if (!user.isActive) throw new BadRequestException("Pegawai tidak aktif.");
    return user;
  }

  async findAll(filters: AssignmentFilters = {}, principal?: Principal) {
    const where: any = {};
    if (filters.unitId) where.unitId = filters.unitId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.role) where.role = filters.role;

    if (!this.hasGlobalAccess(principal)) {
      const unitIds = this.managedUnitIds(principal);
      if (!unitIds.length) throw new ForbiddenException("Anda tidak berwenang mengakses penugasan.");
      if (filters.unitId && !unitIds.includes(filters.unitId)) {
        throw new ForbiddenException("Anda tidak berwenang mengakses penugasan unit ini.");
      }
      where.unitId = filters.unitId ?? { in: unitIds };
    }

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
      orderBy: [{ isPrimary: "desc" }, { startDate: "desc" }, { createdAt: "desc" }],
    });
  }

  async findByUserId(userId: string, principal?: Principal) {
    const assignments = await this.prisma.employeeUnitAssignment.findMany({
      where: { userId },
      orderBy: [{ isPrimary: "desc" }, { startDate: "desc" }],
    });
    assignments.forEach((assignment) => this.assertReadable(principal, assignment.unitId));
    return assignments;
  }

  async findOne(id: string, principal?: Principal) {
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
    if (!assignment) throw new NotFoundException("Penugasan unit tidak ditemukan.");
    this.assertReadable(principal, assignment.unitId);
    return assignment;
  }

  async create(dto: CreateAssignmentDto, principal?: Principal) {
    this.assertWritable(principal);
    if (!await this.authStaffCandidates.isEligible(dto.userId)) {
      throw new BadRequestException("Hanya akun pegawai/guru/karyawan aktif yang dapat ditugaskan.");
    }
    const [unit] = await Promise.all([
      this.requireActiveUnit(dto.unitId),
      this.requireActiveEmployee(dto.userId),
    ]);
    const startDate = this.dateOnly(dto.startDate, "Tanggal mulai");
    const endDate = dto.endDate ? this.dateOnly(dto.endDate, "Tanggal selesai") : null;
    if (endDate && endDate < startDate) {
      throw new BadRequestException("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
    }

    if (dto.isPrimary === true) {
      const primary = await this.prisma.employeeUnitAssignment.findFirst({
        where: { userId: dto.userId, isPrimary: true, ...this.activeOn(startDate) },
      });
      if (primary) {
        throw new BadRequestException(
          "Pegawai sudah memiliki penugasan utama aktif. Gunakan mutasi untuk berpindah unit atau tambah sebagai tugas tambahan.",
        );
      }
    }

    return this.prisma.employeeUnitAssignment.create({
      data: {
        userId: dto.userId,
        unitId: unit.id,
        unitName: unit.name,
        role: dto.role.trim(),
        isPrimary: dto.isPrimary ?? false,
        startDate,
        endDate,
        skNumber: dto.skNumber?.trim() || null,
        notes: dto.notes?.trim() || null,
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async update(id: string, dto: UpdateAssignmentDto, principal?: Principal) {
    this.assertWritable(principal);
    const existing = await this.findOne(id, principal);
    const unit = dto.unitId ? await this.requireActiveUnit(dto.unitId) : null;
    const startDate = dto.startDate ? this.dateOnly(dto.startDate, "Tanggal mulai") : existing.startDate;
    const endDate = dto.endDate === undefined
      ? existing.endDate
      : dto.endDate
        ? this.dateOnly(dto.endDate, "Tanggal selesai")
        : null;
    if (endDate && endDate < startDate) {
      throw new BadRequestException("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.");
    }

    if (dto.isPrimary === true && !existing.isPrimary) {
      const primary = await this.prisma.employeeUnitAssignment.findFirst({
        where: {
          userId: existing.userId,
          id: { not: id },
          isPrimary: true,
          ...this.activeOn(startDate),
        },
      });
      if (primary) {
        throw new BadRequestException("Pegawai sudah memiliki penugasan utama aktif. Gunakan mutasi untuk berpindah unit.");
      }
    }

    return this.prisma.employeeUnitAssignment.update({
      where: { id },
      data: {
        ...(unit ? { unitId: unit.id, unitName: unit.name } : {}),
        ...(dto.role === undefined ? {} : { role: dto.role.trim() }),
        ...(dto.isPrimary === undefined ? {} : { isPrimary: dto.isPrimary }),
        ...(dto.startDate === undefined ? {} : { startDate }),
        ...(dto.endDate === undefined ? {} : { endDate }),
        ...(dto.skNumber === undefined ? {} : { skNumber: dto.skNumber?.trim() || null }),
        ...(dto.notes === undefined ? {} : { notes: dto.notes?.trim() || null }),
      },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async mutate(id: string, dto: MutateAssignmentDto, principal?: Principal) {
    this.assertWritable(principal);
    const existing = await this.findOne(id, principal);
    if (!existing.isPrimary) {
      throw new BadRequestException("Hanya penugasan utama yang dapat dimutasi antar unit.");
    }

    const effectiveDate = this.dateOnly(dto.effectiveDate, "Tanggal efektif mutasi");
    if (effectiveDate < existing.startDate) {
      throw new BadRequestException("Tanggal efektif mutasi tidak boleh lebih awal dari penugasan asal.");
    }
    if (existing.endDate && effectiveDate > existing.endDate) {
      throw new BadRequestException("Penugasan asal sudah berakhir sebelum tanggal efektif mutasi.");
    }

    const destination = await this.requireActiveUnit(dto.unitId);
    if (destination.id === existing.unitId) {
      throw new BadRequestException("Unit tujuan mutasi harus berbeda dari unit asal.");
    }

    if (effectiveDate.getTime() === existing.startDate.getTime()) {
      const corrected = await this.update(id, {
        unitId: destination.id,
        role: dto.role,
        skNumber: dto.skNumber,
        notes: dto.notes,
      }, principal);
      return {
        message: "Penugasan dikoreksi pada tanggal mulai yang sama.",
        endedAssignment: null,
        newAssignment: corrected,
      };
    }

    return this.prisma.$transaction(async (tx: any) => {
      const endedAssignment = await tx.employeeUnitAssignment.update({
        where: { id: existing.id },
        data: { endDate: this.previousDay(effectiveDate) },
      });
      const newAssignment = await tx.employeeUnitAssignment.create({
        data: {
          userId: existing.userId,
          unitId: destination.id,
          unitName: destination.name,
          role: dto.role.trim(),
          isPrimary: true,
          startDate: effectiveDate,
          endDate: null,
          skNumber: dto.skNumber?.trim() || null,
          notes: dto.notes?.trim() || null,
          sourceKey: null,
        },
      });
      return {
        message: "Mutasi penugasan berhasil disimpan.",
        endedAssignment,
        newAssignment,
      };
    });
  }

  async remove(id: string, principal?: Principal) {
    this.assertWritable(principal);
    const assignment = await this.findOne(id, principal);
    await this.prisma.employeeUnitAssignment.delete({ where: { id } });
    return {
      message: assignment.isPrimary
        ? "Penugasan utama dihapus. Pegawai tidak memiliki unit kerja aktif sampai penugasan lain dibuat."
        : "Penugasan tambahan berhasil dihapus.",
      assignment,
    };
  }

  async getUnitSummary(principal?: Principal) {
    const assignments = await this.findAll({}, principal);
    const summaryMap = new Map<string, { unitId: string; unitName: string; totalStaff: number; roles: Record<string, number> }>();
    for (const assignment of assignments) {
      if (!summaryMap.has(assignment.unitId)) {
        summaryMap.set(assignment.unitId, {
          unitId: assignment.unitId,
          unitName: assignment.unitName,
          totalStaff: 0,
          roles: {},
        });
      }
      const item = summaryMap.get(assignment.unitId)!;
      item.totalStaff += 1;
      item.roles[assignment.role] = (item.roles[assignment.role] || 0) + 1;
    }
    return Array.from(summaryMap.values());
  }
}
