import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, allowedUnitIds, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface CreateClassroomDto {
  unitId: string;
  academicYearId: string;
  name: string;
  gradeLevel: number;
  capacity?: number;
}

export interface UpdateClassroomDto {
  name?: string;
  gradeLevel?: number;
  capacity?: number;
}

export interface ListClassroomsFilter {
  unitId?: string;
  academicYearId?: string;
}

function normalizeName(name: string): string {
  const normalized = name.trim();
  if (!normalized) throw new BadRequestException("Nama kelas wajib diisi");
  return normalized;
}

function validateClassroomNumbers(gradeLevel: number, capacity: number): void {
  if (!Number.isInteger(gradeLevel) || gradeLevel < 1 || gradeLevel > 12) {
    throw new BadRequestException("Tingkat kelas harus antara 1 dan 12");
  }
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 200) {
    throw new BadRequestException("Kapasitas kelas harus antara 1 dan 200");
  }
}

@Injectable()
export class ClassroomsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal, filter?: ListClassroomsFilter) {
    if (filter?.unitId) assertUnitAccess(principal, filter.unitId);
    const targetUnits = filter?.unitId
      ? [filter.unitId]
      : isSuperAdmin(principal)
        ? undefined
        : Array.from(allowedUnitIds(principal));

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
    if (!classroom) throw new NotFoundException("Kelas tidak ditemukan");
    assertUnitAccess(principal, classroom.unitId);
    return classroom;
  }

  async create(principal: SiakadPrincipal, dto: CreateClassroomDto) {
    assertUnitAccess(principal, dto.unitId);
    const year = await this.prisma.academicYear.findUnique({ where: { id: dto.academicYearId } });
    if (!year) throw new NotFoundException("Tahun ajaran tidak ditemukan");
    if (year.unitId !== dto.unitId) throw new BadRequestException("Tahun ajaran tidak sesuai dengan unit kelas");

    const name = normalizeName(dto.name);
    const gradeLevel = dto.gradeLevel;
    const capacity = dto.capacity ?? 30;
    validateClassroomNumbers(gradeLevel, capacity);
    const existing = await this.prisma.classroom.findUnique({
      where: { unitId_academicYearId_name: { unitId: dto.unitId, academicYearId: dto.academicYearId, name } },
    });
    if (existing) throw new BadRequestException("Kelas dengan nama tersebut sudah ada di tahun ajaran ini");

    return this.prisma.classroom.create({
      data: { unitId: dto.unitId, academicYearId: dto.academicYearId, name, gradeLevel, capacity },
    });
  }

  async update(principal: SiakadPrincipal, id: string, dto: UpdateClassroomDto) {
    const classroom = await this.getById(principal, id);
    const name = dto.name === undefined ? classroom.name : normalizeName(dto.name);
    const gradeLevel = dto.gradeLevel ?? classroom.gradeLevel;
    const capacity = dto.capacity ?? classroom.capacity;
    validateClassroomNumbers(gradeLevel, capacity);

    if (capacity < classroom.capacity) {
      const activeEnrollmentCount = await this.prisma.enrollment.count({
        where: { classId: id, status: "active" },
      });
      if (capacity < activeEnrollmentCount) {
        throw new BadRequestException("Kapasitas kelas tidak boleh lebih kecil dari jumlah siswa aktif");
      }
    }

    if (name !== classroom.name) {
      const duplicate = await this.prisma.classroom.findUnique({
        where: { unitId_academicYearId_name: { unitId: classroom.unitId, academicYearId: classroom.academicYearId, name } },
      });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException("Kelas dengan nama tersebut sudah ada di tahun ajaran ini");
      }
    }

    return this.prisma.classroom.update({ where: { id }, data: { name, gradeLevel, capacity } });
  }

  async remove(principal: SiakadPrincipal, id: string) {
    await this.getById(principal, id);
    const [activeEnrollmentCount, assignmentCount, homeroomCount, scheduleCount] = await Promise.all([
      this.prisma.enrollment.count({ where: { classId: id, status: "active" } }),
      this.prisma.teacherAssignment.count({ where: { classId: id } }),
      this.prisma.homeroomAssignment.count({ where: { classId: id } }),
      this.prisma.classSchedule.count({ where: { classId: id } }),
    ]);
    if (activeEnrollmentCount > 0 || assignmentCount > 0 || homeroomCount > 0 || scheduleCount > 0) {
      throw new BadRequestException("Kelas yang masih memiliki siswa atau konfigurasi akademik tidak dapat dihapus");
    }
    return this.prisma.classroom.delete({ where: { id } });
  }
}
