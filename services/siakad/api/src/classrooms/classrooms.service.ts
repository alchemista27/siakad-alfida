import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, allowedUnitIds, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface CreateClassroomDto {
  unitId: string;
  academicYearId: string;
  name: string;
  gradeLevel: number;
  capacity?: number;
}

export interface ListClassroomsFilter {
  unitId?: string;
  academicYearId?: string;
}

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal, filter?: ListClassroomsFilter) {
    if (filter?.unitId) {
      assertUnitAccess(principal, filter.unitId);
    }

    const allowedUnits = isSuperAdmin(principal) ? undefined : Array.from(allowedUnitIds(principal));
    const targetUnits = filter?.unitId ? [filter.unitId] : allowedUnits;

    return this.prisma.classroom.findMany({
      where: {
        ...(targetUnits ? { unitId: { in: targetUnits } } : {}),
        ...(filter?.academicYearId ? { academicYearId: filter.academicYearId } : {}),
      },
      orderBy: [{ gradeLevel: "asc" }, { name: "asc" }],
    });
  }

  async getById(principal: SiakadPrincipal, id: string) {
    const classroom = await this.prisma.classroom.findUnique({ where: { id } });
    if (!classroom) {
      throw new NotFoundException("Kelas tidak ditemukan");
    }
    assertUnitAccess(principal, classroom.unitId);
    return classroom;
  }

  async create(principal: SiakadPrincipal, dto: CreateClassroomDto) {
    assertUnitAccess(principal, dto.unitId);

    const year = await this.prisma.academicYear.findUnique({
      where: { id: dto.academicYearId },
    });
    if (!year) {
      throw new NotFoundException("Tahun ajaran tidak ditemukan");
    }
    if (year.unitId !== dto.unitId) {
      throw new BadRequestException("Tahun ajaran tidak sesuai dengan unit kelas");
    }

    const existing = await this.prisma.classroom.findUnique({
      where: {
        unitId_academicYearId_name: {
          unitId: dto.unitId,
          academicYearId: dto.academicYearId,
          name: dto.name.trim(),
        },
      },
    });
    if (existing) {
      throw new BadRequestException("Kelas dengan nama tersebut sudah ada di tahun ajaran ini");
    }

    return this.prisma.classroom.create({
      data: {
        unitId: dto.unitId,
        academicYearId: dto.academicYearId,
        name: dto.name.trim(),
        gradeLevel: dto.gradeLevel,
        capacity: dto.capacity ?? 30,
      },
    });
  }
}
