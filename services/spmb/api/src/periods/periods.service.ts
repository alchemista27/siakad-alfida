import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePeriodDto, UpdatePeriodDto } from "./periods.dto";
import { allowedUnitIds, assertUnitAccess, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class PeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  private assertExistingPeriodAccess(
    period: { unitId: string },
    principal: SpmbPrincipal,
    roles: readonly string[] = ["admin_unit", "tim_spmb", "observer"],
  ) {
    if (isSuperAdmin(principal) || allowedUnitIds(principal, roles).has(period.unitId)) return;
    throw new NotFoundException("Periode pendaftaran tidak ditemukan");
  }

  private assertPeriodMutationRole(principal: SpmbPrincipal) {
    if (isSuperAdmin(principal)) return;
    if (allowedUnitIds(principal, ["admin_unit"]).size > 0) return;
    throw new ForbiddenException("Hanya admin unit yang berhak mengubah periode pendaftaran.");
  }

  private resolveTargetUnitId(dtoUnitId: string | undefined, principal: SpmbPrincipal): string {
    this.assertPeriodMutationRole(principal);
    if (isSuperAdmin(principal)) {
      const trimmed = dtoUnitId?.trim() || "";
      if (!UUID_REGEX.test(trimmed)) {
        throw new BadRequestException("unitId wajib berupa UUID unit yang valid.");
      }
      return trimmed;
    }
    const units = [...allowedUnitIds(principal, ["admin_unit"])];
    if (units.length === 1) {
      return units[0];
    }
    const requested = dtoUnitId?.trim() || "";
    assertUnitAccess(principal, requested, ["admin_unit"]);
    return requested;
  }

  private normalizeSourceAcademicYearId(value?: string | null): string | null {
    const sourceAcademicYearId = value?.trim() || "";
    if (!sourceAcademicYearId) return null;
    if (!UUID_REGEX.test(sourceAcademicYearId)) {
      throw new BadRequestException("ID Tahun Ajaran SIAKAD harus berupa UUID yang valid atau dikosongkan.");
    }
    return sourceAcademicYearId;
  }

  private validateDateRange(opensAt?: string | Date | null, closesAt?: string | Date | null) {
    if (!opensAt || !closesAt) return;
    const start = new Date(opensAt);
    const end = new Date(closesAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      throw new BadRequestException("Tanggal pembukaan harus sebelum atau sama dengan tanggal penutupan.");
    }
  }

  private async assertNoOpenConflict(unitId: string, exceptId?: string) {
    const conflicting = await this.prisma.admissionPeriod.findFirst({
      where: {
        unitId,
        isOpen: true,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    });
    if (conflicting) {
      throw new BadRequestException("Tutup periode aktif lainnya sebelum membuka periode ini.");
    }
  }

  private async assertNoLabelConflict(unitId: string, label: string, exceptId?: string) {
    const conflicting = await this.prisma.admissionPeriod.findFirst({
      where: {
        unitId,
        label,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
    });
    if (conflicting) {
      throw new BadRequestException("Label periode sudah digunakan pada unit ini.");
    }
  }

  async findAll(principal: SpmbPrincipal) {
    const where = isSuperAdmin(principal)
      ? {}
      : { unitId: { in: [...allowedUnitIds(principal, ["admin_unit", "tim_spmb", "observer"])] } };

    return this.prisma.admissionPeriod.findMany({
      where,
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActivePublic() {
    const periods = await this.prisma.admissionPeriod.findMany({
      where: { isOpen: true },
      select: {
        id: true,
        unitId: true,
        sourceAcademicYearId: true,
        unitName: true,
        unitSlug: true,
        label: true,
        quota: true,
        fee: true,
        bankName: true,
        bankNumber: true,
        bankHolder: true,
        opensAt: true,
        closesAt: true,
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { unitName: "asc" },
    });

    return periods.map(({ _count, ...period }) => {
      const registeredCount = _count.registrations;
      const availableSlots = Math.max(0, period.quota - registeredCount);
      return {
        ...period,
        registeredCount,
        availableSlots,
        isFull: period.quota > 0 && availableSlots === 0,
      };
    });
  }

  async findOne(id: string, principal: SpmbPrincipal) {
    const period = await this.prisma.admissionPeriod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true, schedules: true },
        },
      },
    });
    if (!period) throw new NotFoundException("Periode pendaftaran tidak ditemukan");
    this.assertExistingPeriodAccess(period, principal);
    return period;
  }

  async create(dto: CreatePeriodDto, principal: SpmbPrincipal) {
    const unitId = this.resolveTargetUnitId(dto.unitId, principal);
    const sourceAcademicYearId = this.normalizeSourceAcademicYearId(dto.sourceAcademicYearId);
    this.validateDateRange(dto.opensAt, dto.closesAt);
    const isOpen = dto.isOpen ?? true;

    await this.assertNoLabelConflict(unitId, dto.label);
    if (isOpen) await this.assertNoOpenConflict(unitId);

    return this.prisma.admissionPeriod.create({
      data: {
        unitId,
        sourceAcademicYearId,
        unitName: dto.unitName,
        unitSlug: dto.unitSlug,
        label: dto.label,
        isOpen,
        quota: dto.quota ?? 60,
        fee: dto.fee ?? 250000,
        bankName: dto.bankName || null,
        bankNumber: dto.bankNumber || null,
        bankHolder: dto.bankHolder || null,
        opensAt: dto.opensAt ? new Date(dto.opensAt) : null,
        closesAt: dto.closesAt ? new Date(dto.closesAt) : null,
      },
    });
  }

  async update(id: string, dto: UpdatePeriodDto, principal: SpmbPrincipal) {
    this.assertPeriodMutationRole(principal);
    const existing = await this.findOne(id, principal);
    this.assertExistingPeriodAccess(existing, principal, ["admin_unit"]);
    const sourceAcademicYearId = dto.sourceAcademicYearId === undefined
      ? undefined
      : this.normalizeSourceAcademicYearId(dto.sourceAcademicYearId);
    this.validateDateRange(dto.opensAt ?? existing.opensAt, dto.closesAt ?? existing.closesAt);
    if (dto.quota !== undefined && dto.quota < (existing._count?.registrations ?? 0)) {
      throw new BadRequestException("Kuota tidak boleh lebih kecil dari jumlah pendaftar yang sudah tercatat.");
    }
    if (dto.label !== undefined && dto.label.trim() !== existing.label) {
      await this.assertNoLabelConflict(existing.unitId, dto.label.trim(), id);
    }
    if (dto.isOpen === true && !existing.isOpen) {
      await this.assertNoOpenConflict(existing.unitId, id);
    }

    return this.prisma.admissionPeriod.update({
      where: { id },
      data: {
        sourceAcademicYearId,
        label: dto.label?.trim(),
        isOpen: dto.isOpen,
        quota: dto.quota,
        fee: dto.fee,
        bankName: dto.bankName,
        bankNumber: dto.bankNumber,
        bankHolder: dto.bankHolder,
        opensAt: dto.opensAt === undefined ? undefined : dto.opensAt ? new Date(dto.opensAt) : null,
        closesAt: dto.closesAt === undefined ? undefined : dto.closesAt ? new Date(dto.closesAt) : null,
      },
    });
  }

  async openPeriod(id: string, principal: SpmbPrincipal) {
    this.assertPeriodMutationRole(principal);
    const existing = await this.findOne(id, principal);
    this.assertExistingPeriodAccess(existing, principal, ["admin_unit"]);

    await this.assertNoOpenConflict(existing.unitId, id);

    return this.prisma.admissionPeriod.update({
      where: { id },
      data: { isOpen: true },
    });
  }

  async closePeriod(id: string, principal: SpmbPrincipal) {
    this.assertPeriodMutationRole(principal);
    const existing = await this.findOne(id, principal);
    this.assertExistingPeriodAccess(existing, principal, ["admin_unit"]);

    return this.prisma.admissionPeriod.update({
      where: { id },
      data: { isOpen: false },
    });
  }

  async remove(id: string, principal: SpmbPrincipal) {
    this.assertPeriodMutationRole(principal);
    const existing = await this.findOne(id, principal);
    this.assertExistingPeriodAccess(existing, principal, ["admin_unit"]);

    const registrations = existing._count?.registrations ?? 0;
    const schedules = existing._count?.schedules ?? 0;
    if (registrations > 0 || schedules > 0) {
      throw new BadRequestException(
        "Periode tidak dapat dihapus karena sudah memiliki pendaftar atau jadwal observasi.",
      );
    }

    return this.prisma.admissionPeriod.delete({ where: { id } });
  }
}
