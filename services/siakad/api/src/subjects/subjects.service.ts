import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, allowedUnitIds, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface CreateSubjectDto {
  unitId: string;
  code: string;
  name: string;
  kkm?: number;
  orderIndex?: number;
}

export interface UpdateSubjectDto {
  code?: string;
  name?: string;
  kkm?: number;
  orderIndex?: number;
}

function normalizeCode(code: string): string {
  const normalized = code.trim().toUpperCase();
  if (!normalized) throw new BadRequestException("Kode mata pelajaran wajib diisi");
  return normalized;
}

function normalizeName(name: string): string {
  const normalized = name.trim();
  if (!normalized) throw new BadRequestException("Nama mata pelajaran wajib diisi");
  return normalized;
}

function validateNumbers(kkm: number, orderIndex: number): void {
  if (!Number.isFinite(kkm) || kkm < 0 || kkm > 100) throw new BadRequestException("KKM harus berada antara 0 dan 100");
  if (!Number.isInteger(orderIndex) || orderIndex < 0) throw new BadRequestException("Urutan mata pelajaran tidak valid");
}

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal, unitId?: string) {
    if (unitId) assertUnitAccess(principal, unitId);
    const targetUnits = unitId ? [unitId] : isSuperAdmin(principal) ? undefined : Array.from(allowedUnitIds(principal));
    return this.prisma.subject.findMany({
      where: targetUnits ? { unitId: { in: targetUnits } } : {},
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
    });
  }

  async getById(principal: SiakadPrincipal, id: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new NotFoundException("Mata pelajaran tidak ditemukan");
    assertUnitAccess(principal, subject.unitId);
    return subject;
  }

  async create(principal: SiakadPrincipal, dto: CreateSubjectDto) {
    assertUnitAccess(principal, dto.unitId);
    const code = normalizeCode(dto.code);
    const name = normalizeName(dto.name);
    const kkm = dto.kkm ?? 75;
    const orderIndex = dto.orderIndex ?? 0;
    validateNumbers(kkm, orderIndex);

    const existing = await this.prisma.subject.findUnique({ where: { unitId_code: { unitId: dto.unitId, code } } });
    if (existing) throw new BadRequestException("Mata pelajaran dengan kode tersebut sudah ada di unit ini");

    return this.prisma.subject.create({ data: { unitId: dto.unitId, code, name, kkm, orderIndex } });
  }

  async update(principal: SiakadPrincipal, id: string, dto: UpdateSubjectDto) {
    const subject = await this.getById(principal, id);
    const code = dto.code === undefined ? subject.code : normalizeCode(dto.code);
    const name = dto.name === undefined ? subject.name : normalizeName(dto.name);
    const kkm = dto.kkm ?? subject.kkm;
    const orderIndex = dto.orderIndex ?? subject.orderIndex;
    validateNumbers(kkm, orderIndex);

    if (code !== subject.code) {
      const duplicate = await this.prisma.subject.findUnique({
        where: { unitId_code: { unitId: subject.unitId, code } },
      });
      if (duplicate && duplicate.id !== id) {
        throw new BadRequestException("Mata pelajaran dengan kode tersebut sudah ada di unit ini");
      }
    }

    return this.prisma.subject.update({ where: { id }, data: { code, name, kkm, orderIndex } });
  }

  async remove(principal: SiakadPrincipal, id: string) {
    await this.getById(principal, id);
    const [assignmentCount, scheduleCount, lessonPlanCount] = await Promise.all([
      this.prisma.teacherAssignment.count({ where: { subjectId: id } }),
      this.prisma.classSchedule.count({ where: { subjectId: id } }),
      this.prisma.lessonPlan.count({ where: { subjectId: id } }),
    ]);
    if (assignmentCount > 0 || scheduleCount > 0 || lessonPlanCount > 0) {
      throw new BadRequestException("Mata pelajaran yang masih digunakan tidak dapat dihapus");
    }
    return this.prisma.subject.delete({ where: { id } });
  }
}
