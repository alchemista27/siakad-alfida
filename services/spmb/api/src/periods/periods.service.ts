import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePeriodDto, UpdatePeriodDto } from "./periods.dto";

@Injectable()
export class PeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(unitId?: string) {
    const where: any = {};
    if (unitId) where.unitId = unitId;

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

  async findOne(id: string) {
    const period = await this.prisma.admissionPeriod.findUnique({
      where: { id },
      include: {
        _count: {
          select: { registrations: true, schedules: true },
        },
      },
    });
    if (!period) throw new NotFoundException("Periode pendaftaran tidak ditemukan");
    return period;
  }

  async create(dto: CreatePeriodDto) {
    return this.prisma.admissionPeriod.create({
      data: {
        unitId: dto.unitId,
        unitName: dto.unitName,
        unitSlug: dto.unitSlug,
        label: dto.label,
        isOpen: dto.isOpen ?? true,
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

  async update(id: string, dto: UpdatePeriodDto) {
    await this.findOne(id);
    return this.prisma.admissionPeriod.update({
      where: { id },
      data: {
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
}
