import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertHomeroomAccess, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

const DEVELOPMENT_KINDS = ["character", "violation", "bpi"] as const;
type DevelopmentKind = (typeof DEVELOPMENT_KINDS)[number];

export interface CreateStudentDevelopmentDto {
  enrollmentId: string;
  kind: DevelopmentKind;
  occurredAt: string;
  summary: string;
  details?: string;
}

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new BadRequestException(`${field} wajib diisi`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BadRequestException(`${field} tidak valid`);
  return normalized;
}

function optionalText(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new BadRequestException(`${field} tidak valid`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new BadRequestException(`${field} terlalu panjang`);
  return normalized || undefined;
}

function parseDate(value: unknown): Date {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException("Tanggal catatan harus menggunakan format YYYY-MM-DD");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new BadRequestException("Tanggal catatan tidak valid");
  }
  return date;
}

@Injectable()
export class StudentDevelopmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(principal: SiakadPrincipal, dto: CreateStudentDevelopmentDto) {
    const kind = this.kind(dto.kind);
    const enrollment = await this.loadEnrollment(dto.enrollmentId);
    const homeroom = await this.getHomeroomForEnrollment(principal, enrollment);
    return this.prisma.studentDevelopmentRecord.create({
      data: {
        enrollmentId: enrollment.id,
        academicYearId: enrollment.academicYearId,
        homeroomAssignmentId: homeroom.id,
        kind,
        occurredAt: parseDate(dto.occurredAt),
        summary: requiredText(dto.summary, "Ringkasan catatan", 300),
        details: optionalText(dto.details, "Rincian catatan", 5000),
        recordedByUserId: principal.id,
      },
    });
  }

  async listForHomeroom(principal: SiakadPrincipal, academicYearId?: string) {
    const assignments = await this.prisma.homeroomAssignment.findMany({
      where: {
        ...(isSuperAdmin(principal) ? {} : { teacherUserId: principal.id }),
        ...(academicYearId ? { academicYearId } : {}),
      },
      include: { classroom: true },
    });
    for (const assignment of assignments) {
      assertHomeroomAccess(principal, { unitId: assignment.classroom.unitId, homeroomTeacherUserId: assignment.teacherUserId });
    }
    if (!assignments.length) return [];
    return this.prisma.studentDevelopmentRecord.findMany({
      where: { homeroomAssignmentId: { in: assignments.map((assignment) => assignment.id) } },
      include: { enrollment: { include: { student: true, classroom: true } } },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    });
  }

  async approve(principal: SiakadPrincipal, recordId: string) {
    const record = await this.prisma.studentDevelopmentRecord.findUnique({
      where: { id: recordId },
      include: { enrollment: { include: { classroom: true } }, homeroomAssignment: true },
    });
    if (!record) throw new NotFoundException("Catatan perkembangan siswa tidak ditemukan");
    if (!record.enrollment.classId || !record.enrollment.classroom || record.enrollment.academicYearId !== record.academicYearId) {
      throw new BadRequestException("Catatan perkembangan tidak memiliki kelas dan tahun ajaran yang valid");
    }
    if (record.homeroomAssignment.classId !== record.enrollment.classId || record.homeroomAssignment.academicYearId !== record.academicYearId) {
      throw new BadRequestException("Penugasan wali kelas catatan tidak sesuai dengan enrollment");
    }
    assertHomeroomAccess(principal, { unitId: record.enrollment.classroom.unitId, homeroomTeacherUserId: record.homeroomAssignment.teacherUserId });
    if (record.status === "approved") throw new ConflictException("Catatan perkembangan sudah disetujui");
    return this.prisma.studentDevelopmentRecord.update({
      where: { id: record.id },
      data: { status: "approved", approvedByUserId: principal.id, approvedAt: new Date() },
    });
  }

  async listApprovedForParent(principal: SiakadPrincipal) {
    const records = await this.prisma.studentDevelopmentRecord.findMany({
      where: { status: "approved", enrollment: { student: { parentUserId: principal.id } } },
      include: { enrollment: { include: { student: true } } },
      orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
    });
    return records.map((record) => ({
      id: record.id,
      studentId: record.enrollment.studentId,
      studentName: record.enrollment.student.fullName,
      kind: record.kind,
      occurredAt: record.occurredAt,
      summary: record.summary,
    }));
  }

  private kind(value: unknown): DevelopmentKind {
    if (typeof value !== "string" || !DEVELOPMENT_KINDS.includes(value as DevelopmentKind)) {
      throw new BadRequestException("Jenis catatan perkembangan tidak valid");
    }
    return value as DevelopmentKind;
  }

  private async loadEnrollment(enrollmentId: string): Promise<any> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { student: true, classroom: true },
    });
    if (!enrollment) throw new NotFoundException("Enrollment siswa tidak ditemukan");
    if (!enrollment.classId || !enrollment.classroom || enrollment.status !== "active") {
      throw new BadRequestException("Catatan perkembangan hanya dapat dibuat untuk enrollment aktif yang sudah masuk kelas");
    }
    return enrollment;
  }

  private async getHomeroomForEnrollment(principal: SiakadPrincipal, enrollment: any): Promise<any> {
    const homeroom = await this.prisma.homeroomAssignment.findFirst({
      where: { classId: enrollment.classId, academicYearId: enrollment.academicYearId },
    });
    if (!homeroom) throw new NotFoundException("Penugasan wali kelas untuk kelas dan tahun ajaran ini tidak ditemukan");
    assertHomeroomAccess(principal, { unitId: enrollment.classroom.unitId, homeroomTeacherUserId: homeroom.teacherUserId });
    return homeroom;
  }
}
