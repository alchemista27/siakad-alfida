import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  allowedUnitIds,
  assertParentEnrollmentAccess,
  assertUnitAccess,
  isSuperAdmin,
  type SiakadPrincipal,
} from "../common/siakad-scope-policy";

export interface CreateExtracurricularDto { academicYearId: string; name: string; category?: string; coachUserId?: string }
export interface UpdateExtracurricularDto { name?: string; category?: string }
export interface ScheduleDto { dayOfWeek: number; startTime: string; endTime: string; location?: string }
export interface JournalDto { date: string | Date; activity: string; notes?: string }
export interface GradeDto { membershipId: string; semester: number; grade: string; notes?: string }

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") throw new BadRequestException(`${field} wajib diisi`);
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) throw new BadRequestException(`${field} tidak valid`);
  return normalized;
}

function optionalText(value: unknown, field: string, maxLength: number): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== "string") throw new BadRequestException(`${field} tidak valid`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new BadRequestException(`${field} terlalu panjang`);
  return normalized || null;
}

function parseDate(value: string | Date): Date {
  const raw = typeof value === "string" ? value : value.toISOString().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) throw new BadRequestException("Tanggal kegiatan harus menggunakan format YYYY-MM-DD");
  const parsed = new Date(`${raw}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== raw) throw new BadRequestException("Tanggal kegiatan tidak valid");
  return parsed;
}

function validTime(value: unknown): string {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new BadRequestException("Waktu harus menggunakan format HH:MM");
  return value;
}

function isRole(principal: SiakadPrincipal, roleName: string): boolean {
  return principal.roles.some((claim) => typeof claim === "string"
    ? claim === roleName
    : claim.role === roleName && (claim.app === "siakad" || claim.app === "*"));
}

function isCoachInUnit(user: { status?: string; roles?: unknown } | null, unitId: string): boolean {
  if (!user || user.status !== "active" || !Array.isArray(user.roles)) return false;
  return user.roles.some((claim) => typeof claim === "object" && claim !== null
    && (claim as { role?: unknown }).role === "guru"
    && (((claim as { app?: unknown }).app === "siakad") || (claim as { app?: unknown }).app === "*")
    && (claim as { unitId?: unknown }).unitId === unitId);
}

@Injectable()
export class ExtracurricularsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal, studentId?: string) {
    const activities = await this.prisma.extracurricular.findMany({ include: { academicYear: true, coaches: true }, orderBy: { name: "asc" } });
    const active = activities.filter((activity) => activity.academicYear.status === "active");
    if (isSuperAdmin(principal)) return active;
    if (isRole(principal, "admin_unit")) return active.filter((activity) => allowedUnitIds(principal, ["admin_unit"]).has(activity.unitId));
    if (isRole(principal, "guru")) return active.filter((activity) => activity.coaches.some((coach) => coach.coachUserId === principal.id) && allowedUnitIds(principal, ["guru"]).has(activity.unitId));
    if (!studentId) throw new BadRequestException("ID siswa wajib diisi untuk akses orang tua");
    const student = await this.getParentStudent(principal, studentId);
    return active.filter((activity) => activity.unitId === student.unitId);
  }

  async create(principal: SiakadPrincipal, dto: CreateExtracurricularDto) {
    const year = await this.getActiveYear(dto.academicYearId);
    assertUnitAccess(principal, year.unitId);
    const created = await this.prisma.extracurricular.create({
      data: { academicYearId: year.id, unitId: year.unitId, name: requiredText(dto.name, "Nama ekstrakurikuler", 100), category: optionalText(dto.category, "Kategori", 60) ?? "general" },
      include: { academicYear: true },
    });
    if (dto.coachUserId) await this.assignCoach(principal, created.id, dto.coachUserId);
    return created;
  }

  async update(principal: SiakadPrincipal, id: string, dto: UpdateExtracurricularDto) {
    const activity = await this.getAdminActivity(principal, id);
    const name = dto.name === undefined ? undefined : requiredText(dto.name, "Nama ekstrakurikuler", 100);
    const category = dto.category === undefined ? undefined : requiredText(dto.category, "Kategori", 60);
    if (name === undefined && category === undefined) throw new BadRequestException("Tidak ada perubahan ekstrakurikuler");
    return this.prisma.extracurricular.update({ where: { id: activity.id }, data: { name, category }, include: { academicYear: true } });
  }

  async remove(principal: SiakadPrincipal, id: string) {
    const activity = await this.getAdminActivity(principal, id);
    return this.prisma.extracurricular.delete({ where: { id: activity.id } });
  }

  async assignCoach(principal: SiakadPrincipal, extracurricularId: string, coachUserId: string) {
    const activity = await this.getAdminActivity(principal, extracurricularId);
    const coach = await this.prisma.userProjection.findUnique({ where: { id: coachUserId } });
    if (!isCoachInUnit(coach, activity.unitId)) throw new BadRequestException("Pelatih harus guru aktif dari unit kegiatan yang sama");
    return this.prisma.extracurricularCoach.upsert({
      where: { extracurricularId_coachUserId: { extracurricularId: activity.id, coachUserId } },
      create: { extracurricularId: activity.id, coachUserId },
      update: {},
    });
  }

  async listSchedules(principal: SiakadPrincipal, extracurricularId: string) {
    await this.getCoachActivity(principal, extracurricularId);
    return this.prisma.extracurricularSchedule.findMany({ where: { extracurricularId }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] });
  }

  async createSchedule(principal: SiakadPrincipal, extracurricularId: string, dto: ScheduleDto) {
    const activity = await this.getCoachActivity(principal, extracurricularId);
    return this.prisma.extracurricularSchedule.create({ data: { extracurricularId: activity.id, ...this.scheduleData(dto) } });
  }

  async updateSchedule(principal: SiakadPrincipal, extracurricularId: string, scheduleId: string, dto: Partial<ScheduleDto>) {
    await this.getCoachActivity(principal, extracurricularId);
    const schedule = await this.prisma.extracurricularSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule || schedule.extracurricularId !== extracurricularId) throw new NotFoundException("Jadwal ekstrakurikuler tidak ditemukan");
    return this.prisma.extracurricularSchedule.update({ where: { id: scheduleId }, data: this.scheduleData({ dayOfWeek: dto.dayOfWeek ?? schedule.dayOfWeek, startTime: dto.startTime ?? schedule.startTime, endTime: dto.endTime ?? schedule.endTime, location: dto.location === undefined ? schedule.location ?? undefined : dto.location }) });
  }

  async removeSchedule(principal: SiakadPrincipal, extracurricularId: string, scheduleId: string) {
    await this.getCoachActivity(principal, extracurricularId);
    const schedule = await this.prisma.extracurricularSchedule.findUnique({ where: { id: scheduleId } });
    if (!schedule || schedule.extracurricularId !== extracurricularId) throw new NotFoundException("Jadwal ekstrakurikuler tidak ditemukan");
    return this.prisma.extracurricularSchedule.delete({ where: { id: scheduleId } });
  }

  async listJournals(principal: SiakadPrincipal, extracurricularId: string) {
    await this.getCoachActivity(principal, extracurricularId);
    return this.prisma.extracurricularJournal.findMany({ where: { extracurricularId }, orderBy: { date: "desc" } });
  }

  async createJournal(principal: SiakadPrincipal, extracurricularId: string, dto: JournalDto) {
    const activity = await this.getCoachActivity(principal, extracurricularId);
    return this.prisma.extracurricularJournal.create({ data: { extracurricularId: activity.id, date: parseDate(dto.date), activity: requiredText(dto.activity, "Kegiatan jurnal", 200), notes: optionalText(dto.notes, "Catatan jurnal", 5000) ?? undefined } });
  }

  async updateJournal(principal: SiakadPrincipal, extracurricularId: string, journalId: string, dto: Partial<JournalDto>) {
    await this.getCoachActivity(principal, extracurricularId);
    const journal = await this.prisma.extracurricularJournal.findUnique({ where: { id: journalId } });
    if (!journal || journal.extracurricularId !== extracurricularId) throw new NotFoundException("Jurnal ekstrakurikuler tidak ditemukan");
    return this.prisma.extracurricularJournal.update({ where: { id: journalId }, data: { date: dto.date === undefined ? undefined : parseDate(dto.date), activity: dto.activity === undefined ? undefined : requiredText(dto.activity, "Kegiatan jurnal", 200), notes: optionalText(dto.notes, "Catatan jurnal", 5000) } });
  }

  async removeJournal(principal: SiakadPrincipal, extracurricularId: string, journalId: string) {
    await this.getCoachActivity(principal, extracurricularId);
    const journal = await this.prisma.extracurricularJournal.findUnique({ where: { id: journalId } });
    if (!journal || journal.extracurricularId !== extracurricularId) throw new NotFoundException("Jurnal ekstrakurikuler tidak ditemukan");
    return this.prisma.extracurricularJournal.delete({ where: { id: journalId } });
  }

  async upsertGrade(principal: SiakadPrincipal, extracurricularId: string, dto: GradeDto) {
    await this.getCoachActivity(principal, extracurricularId);
    if (!Number.isInteger(dto.semester) || dto.semester < 1 || dto.semester > 2) throw new BadRequestException("Semester harus 1 atau 2");
    const grade = requiredText(dto.grade, "Nilai ekstrakurikuler", 5).toUpperCase();
    if (!["A", "B", "C", "D"].includes(grade)) throw new BadRequestException("Nilai ekstrakurikuler harus A, B, C, atau D");
    const membership = await this.prisma.extracurricularMembership.findFirst({ where: { id: dto.membershipId, extracurricularId } });
    if (!membership) throw new NotFoundException("Keanggotaan ekstrakurikuler tidak ditemukan");
    return this.prisma.extracurricularGrade.upsert({ where: { membershipId_semester: { membershipId: membership.id, semester: dto.semester } }, create: { membershipId: membership.id, semester: dto.semester, grade, notes: optionalText(dto.notes, "Catatan nilai", 5000) ?? undefined }, update: { grade, notes: optionalText(dto.notes, "Catatan nilai", 5000) ?? undefined } });
  }

  async join(principal: SiakadPrincipal, extracurricularId: string, studentId: string) {
    const [activity, student] = await Promise.all([this.getActivity(extracurricularId), this.getParentStudent(principal, studentId)]);
    if (activity.academicYear.status !== "active") throw new BadRequestException("Ekstrakurikuler hanya tersedia pada tahun ajaran aktif");
    if (activity.unitId !== student.unitId) throw new ForbiddenException("Siswa tidak berada pada unit ekstrakurikuler ini");
    return this.prisma.extracurricularMembership.upsert({ where: { extracurricularId_studentId: { extracurricularId, studentId } }, create: { extracurricularId, studentId }, update: {} });
  }

  async leave(principal: SiakadPrincipal, extracurricularId: string, studentId: string) {
    await this.getParentStudent(principal, studentId);
    const membership = await this.prisma.extracurricularMembership.findUnique({ where: { extracurricularId_studentId: { extracurricularId, studentId } } });
    if (!membership) throw new NotFoundException("Keanggotaan ekstrakurikuler tidak ditemukan");
    return this.prisma.extracurricularMembership.delete({ where: { id: membership.id } });
  }

  private async getActivity(id: string) {
    const activity = await this.prisma.extracurricular.findUnique({ where: { id }, include: { academicYear: true } });
    if (!activity) throw new NotFoundException("Ekstrakurikuler tidak ditemukan");
    return activity;
  }

  private async getActiveYear(id: string) {
    const year = await this.prisma.academicYear.findUnique({ where: { id } });
    if (!year) throw new NotFoundException("Tahun ajaran tidak ditemukan");
    if (year.status !== "active") throw new BadRequestException("Ekstrakurikuler hanya dapat dibuat pada tahun ajaran aktif");
    return year;
  }

  private async getAdminActivity(principal: SiakadPrincipal, id: string) {
    const activity = await this.getActivity(id);
    assertUnitAccess(principal, activity.unitId);
    if (activity.academicYear.status !== "active") throw new BadRequestException("Ekstrakurikuler hanya dapat diubah pada tahun ajaran aktif");
    return activity;
  }

  private async getCoachActivity(principal: SiakadPrincipal, id: string) {
    const activity = await this.getActivity(id);
    if (!isSuperAdmin(principal)) {
      assertUnitAccess(principal, activity.unitId, ["guru"]);
      const coach = await this.prisma.extracurricularCoach.findFirst({ where: { extracurricularId: id, coachUserId: principal.id } });
      if (!coach) throw new ForbiddenException("Ekstrakurikuler bukan tanggung jawab pelatih ini");
    }
    if (activity.academicYear.status !== "active") throw new BadRequestException("Ekstrakurikuler tidak berada pada tahun ajaran aktif");
    return activity;
  }

  private async getParentStudent(principal: SiakadPrincipal, studentId: string) {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException("Siswa tidak ditemukan");
    assertParentEnrollmentAccess(principal, student);
    return student;
  }

  private scheduleData(dto: ScheduleDto) {
    if (!Number.isInteger(dto.dayOfWeek) || dto.dayOfWeek < 1 || dto.dayOfWeek > 7) throw new BadRequestException("Hari jadwal harus antara 1 dan 7");
    const startTime = validTime(dto.startTime);
    const endTime = validTime(dto.endTime);
    if (startTime >= endTime) throw new BadRequestException("Waktu selesai harus setelah waktu mulai");
    return { dayOfWeek: dto.dayOfWeek, startTime, endTime, location: optionalText(dto.location, "Lokasi", 150) ?? undefined };
  }
}
