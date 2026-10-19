import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, allowedUnitIds, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export type AcademicYearStatus = "draft" | "active" | "closed";

export interface CreateAcademicYearDto {
  unitId: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  status?: AcademicYearStatus;
}

export interface UpdateAcademicYearDto {
  name?: string;
  startDate?: string | Date;
  endDate?: string | Date;
  status?: AcademicYearStatus;
}

export interface UpdateAcademicYearStatusDto {
  status: AcademicYearStatus;
}

const ACADEMIC_YEAR_STATUSES: readonly AcademicYearStatus[] = ["draft", "active", "closed"];

function normalizeDate(value: string | Date, field: string): Date {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new BadRequestException(`${field} tidak valid`);
  return date;
}

function validateDates(startDate: Date, endDate: Date): void {
  if (endDate.getTime() <= startDate.getTime()) {
    throw new BadRequestException("Tanggal selesai tahun ajaran harus setelah tanggal mulai");
  }
}

function normalizeName(name: string): string {
  const normalized = name.trim();
  if (!normalized) throw new BadRequestException("Nama tahun ajaran wajib diisi");
  return normalized;
}

function validateStatus(status: AcademicYearStatus): void {
  if (!ACADEMIC_YEAR_STATUSES.includes(status)) {
    throw new BadRequestException("Status tahun ajaran tidak valid");
  }
}

@Injectable()
export class AcademicYearsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal) {
    if (isSuperAdmin(principal)) {
      return this.prisma.academicYear.findMany({ orderBy: { startDate: "desc" } });
    }

    return this.prisma.academicYear.findMany({
      where: { unitId: { in: Array.from(allowedUnitIds(principal)) } },
      orderBy: { startDate: "desc" },
    });
  }

  async getById(principal: SiakadPrincipal, id: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) throw new NotFoundException("Tahun ajaran tidak ditemukan");
    assertUnitAccess(principal, year.unitId);
    return year;
  }

  async create(principal: SiakadPrincipal, dto: CreateAcademicYearDto) {
    assertUnitAccess(principal, dto.unitId);
    const name = normalizeName(dto.name);
    const startDate = normalizeDate(dto.startDate, "Tanggal mulai");
    const endDate = normalizeDate(dto.endDate, "Tanggal selesai");
    validateDates(startDate, endDate);
    const status = dto.status ?? "draft";
    validateStatus(status);

    const existing = await this.prisma.academicYear.findUnique({
      where: { unitId_name: { unitId: dto.unitId, name } },
    });
    if (existing) throw new BadRequestException("Tahun ajaran dengan nama tersebut sudah ada di unit ini");

    return this.prisma.academicYear.create({
      data: { unitId: dto.unitId, name, startDate, endDate, status },
    });
  }

  async update(principal: SiakadPrincipal, id: string, dto: UpdateAcademicYearDto) {
    const year = await this.getById(principal, id);
    const name = dto.name === undefined ? year.name : normalizeName(dto.name);
    const startDate = dto.startDate === undefined ? year.startDate : normalizeDate(dto.startDate, "Tanggal mulai");
    const endDate = dto.endDate === undefined ? year.endDate : normalizeDate(dto.endDate, "Tanggal selesai");
    const status = dto.status ?? year.status as AcademicYearStatus;
    validateDates(startDate, endDate);
    validateStatus(status);

    if (name !== year.name) {
      const duplicate = await this.prisma.academicYear.findUnique({
        where: { unitId_name: { unitId: year.unitId, name } },
      });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException("Tahun ajaran dengan nama tersebut sudah ada di unit ini");
      }
    }

    return this.prisma.academicYear.update({
      where: { id },
      data: { name, startDate, endDate, status },
    });
  }

  async updateStatus(principal: SiakadPrincipal, id: string, dto: UpdateAcademicYearStatusDto) {
    return this.update(principal, id, dto);
  }

  async remove(principal: SiakadPrincipal, id: string) {
    await this.getById(principal, id);
    const [classroomCount, enrollmentCount] = await Promise.all([
      this.prisma.classroom.count({ where: { academicYearId: id } }),
      this.prisma.enrollment.count({ where: { academicYearId: id } }),
    ]);
    if (classroomCount > 0 || enrollmentCount > 0) {
      throw new BadRequestException("Tahun ajaran yang masih memiliki kelas atau enrollment tidak dapat dihapus");
    }
    return this.prisma.academicYear.delete({ where: { id } });
  }
}
