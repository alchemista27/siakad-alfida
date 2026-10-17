import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, allowedUnitIds, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface CreateAcademicYearDto {
  unitId: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  status?: "draft" | "active" | "closed";
}

export interface UpdateAcademicYearStatusDto {
  status: "draft" | "active" | "closed";
}

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal) {
    if (isSuperAdmin(principal)) {
      return this.prisma.academicYear.findMany({
        orderBy: { startDate: "desc" },
      });
    }

    const unitIds = Array.from(allowedUnitIds(principal));
    return this.prisma.academicYear.findMany({
      where: { unitId: { in: unitIds } },
      orderBy: { startDate: "desc" },
    });
  }

  async getById(principal: SiakadPrincipal, id: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) {
      throw new NotFoundException("Tahun ajaran tidak ditemukan");
    }
    assertUnitAccess(principal, year.unitId);
    return year;
  }

  async create(principal: SiakadPrincipal, dto: CreateAcademicYearDto) {
    assertUnitAccess(principal, dto.unitId);

    const existing = await this.prisma.academicYear.findUnique({
      where: {
        unitId_name: {
          unitId: dto.unitId,
          name: dto.name.trim(),
        },
      },
    });

    if (existing) {
      throw new BadRequestException("Tahun ajaran dengan nama tersebut sudah ada di unit ini");
    }

    return this.prisma.academicYear.create({
      data: {
        unitId: dto.unitId,
        name: dto.name.trim(),
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        status: dto.status ?? "draft",
      },
    });
  }

  async updateStatus(principal: SiakadPrincipal, id: string, dto: UpdateAcademicYearStatusDto) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) {
      throw new NotFoundException("Tahun ajaran tidak ditemukan");
    }
    assertUnitAccess(principal, year.unitId);

    return this.prisma.academicYear.update({
      where: { id },
      data: { status: dto.status },
    });
  }
}
