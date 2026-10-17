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
    roles: readonly string[] = ["admin_unit", "tim_ppdb", "observer"],
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

  private validateDateRange(opensAt?: string | Date | null, closesAt?: string | Date | null) {
    if (!opensAt || !closesAt) return;
    const start = new Date(opensAt);
    const end = new Date(closesAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
      throw new BadRequestException("Tanggal pembukaan harus sebelum atau sama dengan tanggal penutupan.");
    }
  }

  async findAll(principal: SpmbPrincipal) {
    const where = isSuperAdmin(principal)
      ? {}
      : { unitId: { in: [...allowedUnitIds(principal, ["admin_unit", "tim_ppdb", "observer"])] } };

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
    return this.prisma.admissionPeriod.findMany({
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
    this.validateDateRange(dto.opensAt, dto.closesAt);
    const isOpen = dto.isOpen ?? true;

    if (isOpen && this.prisma.admissionPeriod.findFirst) {
      const existingOpen = await this.prisma.admissionPeriod.findFirst({
        where: {
          unitId,
          isOpen: true,
          ...(dto.sourceAcademicYearId ? { sourceAcademicYearId: dto.sourceAcademicYearId } : {}),
        },
      });
      if (existingOpen) {
        throw new BadRequestException("Unit sudah memiliki periode pendaftaran aktif pada tahun ajaran tersebut.");
      }
    }

    return this.prisma.admissionPeriod.create({
      data: {
        unitId,
        sourceAcademicYearId: dto.sourceAcademicYearId || null,
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
    this.validateDateRange(dto.opensAt ?? existing.opensAt, dto.closesAt ?? existing.closesAt);

    return this.prisma.admissionPeriod.update({
      where: { id },
      data: {
        sourceAcademicYearId: dto.sourceAcademicYearId,
        label: dto.label,
        isOpen: dto.isOpen,
        quota: dto.quota,
        fee: dto.fee,
        bankName: dto.bankName,
        bankNumber: dto.bankNumber,
        bankHolder: dto.bankHolder,
        opensAt: dto.opensAt ? new Date(dto.opensAt) : undefined,
        closesAt: dto.closesAt ? new Date(dto.closesAt) : undefined,
      },
    });
  }

  async openPeriod(id: string, principal: SpmbPrincipal) {
    this.assertPeriodMutationRole(principal);
    const existing = await this.findOne(id, principal);
    this.assertExistingPeriodAccess(existing, principal, ["admin_unit"]);

    if (this.prisma.admissionPeriod.findFirst) {
      const conflicting = await this.prisma.admissionPeriod.findFirst({
        where: {
          unitId: existing.unitId,
          isOpen: true,
          id: { not: id },
        },
      });
      if (conflicting) {
        throw new BadRequestException("Tutup periode aktif lainnya sebelum membuka periode ini.");
      }
    }

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
}
