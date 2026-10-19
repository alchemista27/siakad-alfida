import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertTeacherAssignmentAccess, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface GradeItemDto {
  enrollmentId: string;
  category: string;
  label: string;
  score: number;
  feedback?: string;
}

export interface GradeBatchDto {
  items: GradeItemDto[];
}

export interface RecordGradeDto extends GradeItemDto {
  assignmentId: string;
}

export interface JournalDto {
  date: Date | string;
  scheduleId?: string | null;
  topic: string;
  notes?: string;
  studentCountPresent?: number;
  studentCountAbsent?: number;
}

export interface RecordJournalDto extends JournalDto {
  assignmentId: string;
}

function parseDate(value: Date | string): Date {
  const stringValue = typeof value === "string" ? value : value.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) throw new BadRequestException("Tanggal jurnal harus menggunakan format YYYY-MM-DD");
  const date = new Date(`${stringValue}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== stringValue) {
    throw new BadRequestException("Tanggal jurnal tidak valid");
  }
  return date;
}

function normalizeText(value: string, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new BadRequestException(`${field} wajib diisi`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BadRequestException(`${field} tidak valid`);
  return normalized;
}

function validateCount(value: number | undefined, field: string): number {
  const count = value ?? 0;
  if (!Number.isInteger(count) || count < 0) throw new BadRequestException(`${field} harus berupa bilangan bulat tidak negatif`);
  return count;
}

@Injectable()
export class TeachingWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async listGrades(principal: SiakadPrincipal, assignmentId: string) {
    const assignment = await this.getAuthorizedAssignment(principal, assignmentId);
    const [roster, grades] = await Promise.all([
      this.getRoster(assignment.classId, assignment.academicYearId),
      this.prisma.grade.findMany({ where: { teacherAssignmentId: assignment.id } }),
    ]);
    return { assignment, roster, grades };
  }

  async batchGrades(principal: SiakadPrincipal, assignmentId: string, dto: GradeBatchDto) {
    const assignment = await this.getAuthorizedAssignment(principal, assignmentId);
    if (!Array.isArray(dto.items)) throw new BadRequestException("Item nilai wajib berupa daftar");
    const items = dto.items.map((item) => this.normalizeGradeItem(item));
    const keys = new Set<string>();
    for (const item of items) {
      const key = `${item.enrollmentId}:${item.category}:${item.label}`;
      if (keys.has(key)) throw new BadRequestException("Nilai dengan kategori dan label yang sama tidak boleh duplikat");
      keys.add(key);
    }
    const rosterIds = new Set((await this.getRoster(assignment.classId, assignment.academicYearId)).map((enrollment) => enrollment.id));
    if (items.some((item) => !rosterIds.has(item.enrollmentId))) {
      throw new BadRequestException("Enrollment nilai bukan anggota kelas pada penugasan ini");
    }
    return Promise.all(items.map((item) => this.prisma.grade.upsert({
      where: {
        enrollmentId_teacherAssignmentId_category_label: {
          enrollmentId: item.enrollmentId,
          teacherAssignmentId: assignment.id,
          category: item.category,
          label: item.label,
        },
      },
      create: { ...item, teacherAssignmentId: assignment.id },
      update: { score: item.score, feedback: item.feedback },
    })));
  }

  async recordGrade(principal: SiakadPrincipal, dto: RecordGradeDto) {
    const [grade] = await this.batchGrades(principal, dto.assignmentId, { items: [dto] });
    return grade;
  }

  async listJournals(principal: SiakadPrincipal, assignmentId: string) {
    await this.getAuthorizedAssignment(principal, assignmentId);
    return this.prisma.teachingJournal.findMany({ where: { teacherAssignmentId: assignmentId }, orderBy: { date: "desc" } });
  }

  async createJournal(principal: SiakadPrincipal, assignmentId: string, dto: JournalDto) {
    const assignment = await this.getAuthorizedAssignment(principal, assignmentId);
    const data = await this.resolveJournalData(assignment, dto);
    return this.prisma.teachingJournal.create({ data: { teacherAssignmentId: assignment.id, ...data } });
  }

  async recordJournal(principal: SiakadPrincipal, dto: RecordJournalDto) {
    return this.createJournal(principal, dto.assignmentId, dto);
  }

  async updateJournal(principal: SiakadPrincipal, journalId: string, dto: Partial<JournalDto>) {
    const journal = await this.prisma.teachingJournal.findUnique({ where: { id: journalId } });
    if (!journal) throw new NotFoundException("Jurnal mengajar tidak ditemukan");
    const assignment = await this.getAuthorizedAssignment(principal, journal.teacherAssignmentId);
    const data = await this.resolveJournalData(assignment, {
      date: dto.date ?? journal.date,
      scheduleId: dto.scheduleId === undefined ? journal.scheduleId : dto.scheduleId,
      topic: dto.topic ?? journal.topic,
      notes: dto.notes === undefined ? journal.notes ?? undefined : dto.notes,
      studentCountPresent: dto.studentCountPresent ?? journal.studentCountPresent,
      studentCountAbsent: dto.studentCountAbsent ?? journal.studentCountAbsent,
    });
    return this.prisma.teachingJournal.update({ where: { id: journalId }, data });
  }

  async removeJournal(principal: SiakadPrincipal, journalId: string) {
    const journal = await this.prisma.teachingJournal.findUnique({ where: { id: journalId } });
    if (!journal) throw new NotFoundException("Jurnal mengajar tidak ditemukan");
    await this.getAuthorizedAssignment(principal, journal.teacherAssignmentId);
    return this.prisma.teachingJournal.delete({ where: { id: journalId } });
  }

  private async getAuthorizedAssignment(principal: SiakadPrincipal, assignmentId: string) {
    const assignment = await this.prisma.teacherAssignment.findUnique({ where: { id: assignmentId }, include: { classroom: true } });
    if (!assignment) throw new NotFoundException("Penugasan guru tidak ditemukan");
    assertTeacherAssignmentAccess(principal, { unitId: assignment.classroom.unitId, teacherUserId: assignment.teacherUserId });
    return assignment;
  }

  private getRoster(classId: string, academicYearId: string) {
    return this.prisma.enrollment.findMany({
      where: { classId, academicYearId, status: "active" },
      include: { student: true },
      orderBy: { student: { fullName: "asc" } },
    });
  }

  private normalizeGradeItem(item: GradeItemDto): GradeItemDto {
    if (!item || typeof item.enrollmentId !== "string" || !item.enrollmentId) throw new BadRequestException("Enrollment nilai wajib diisi");
    if (!Number.isFinite(item.score) || item.score < 0 || item.score > 100) throw new BadRequestException("Nilai harus berupa angka antara 0 dan 100");
    return {
      enrollmentId: item.enrollmentId,
      category: normalizeText(item.category, "Kategori nilai", 30),
      label: normalizeText(item.label, "Label nilai", 100),
      score: item.score,
      feedback: item.feedback?.trim() || undefined,
    };
  }

  private async resolveJournalData(assignment: { classId: string; subjectId: string }, dto: JournalDto) {
    const scheduleId = dto.scheduleId ?? null;
    if (scheduleId) {
      const schedule = await this.prisma.classSchedule.findUnique({ where: { id: scheduleId } });
      if (!schedule) throw new NotFoundException("Jadwal pelajaran tidak ditemukan");
      if (schedule.classId !== assignment.classId || schedule.subjectId !== assignment.subjectId) {
        throw new BadRequestException("Jadwal jurnal harus sesuai dengan kelas dan mata pelajaran penugasan");
      }
    }
    return {
      date: parseDate(dto.date),
      scheduleId,
      topic: normalizeText(dto.topic, "Topik jurnal", 200),
      notes: dto.notes?.trim() || undefined,
      studentCountPresent: validateCount(dto.studentCountPresent, "Jumlah siswa hadir"),
      studentCountAbsent: validateCount(dto.studentCountAbsent, "Jumlah siswa tidak hadir"),
    };
  }
}
