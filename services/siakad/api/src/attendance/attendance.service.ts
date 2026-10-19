import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertTeacherAssignmentAccess, type SiakadPrincipal } from "../common/siakad-scope-policy";

export const ATTENDANCE_STATUSES = ["present", "sick", "excused", "absent"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface AttendanceItemDto {
  enrollmentId: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceBatchDto {
  date: string;
  items: AttendanceItemDto[];
}

function parseDate(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestException("Tanggal presensi harus menggunakan format YYYY-MM-DD");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new BadRequestException("Tanggal presensi tidak valid");
  }
  return date;
}

function normalizeItem(item: AttendanceItemDto): AttendanceItemDto {
  if (!item || typeof item.enrollmentId !== "string" || !item.enrollmentId) {
    throw new BadRequestException("Enrollment presensi wajib diisi");
  }
  if (!ATTENDANCE_STATUSES.includes(item.status)) {
    throw new BadRequestException("Status presensi tidak valid");
  }
  return { enrollmentId: item.enrollmentId, status: item.status, notes: item.notes?.trim() || undefined };
}

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  async listBySchedule(principal: SiakadPrincipal, scheduleId: string, dateValue: string) {
    const date = parseDate(dateValue);
    const { schedule, assignment } = await this.getAuthorizedScheduleAssignment(principal, scheduleId);
    const [roster, attendances] = await Promise.all([
      this.getRoster(schedule.classId, assignment.academicYearId),
      this.prisma.attendance.findMany({ where: { scheduleId, date } }),
    ]);
    const attendanceByEnrollment = new Map(attendances.map((attendance) => [attendance.enrollmentId, attendance]));
    return {
      schedule,
      date: dateValue,
      roster: roster.map((enrollment) => ({ enrollment, attendance: attendanceByEnrollment.get(enrollment.id) ?? null })),
    };
  }

  async batchUpsert(principal: SiakadPrincipal, scheduleId: string, dto: AttendanceBatchDto) {
    const date = parseDate(dto.date);
    if (!Array.isArray(dto.items)) throw new BadRequestException("Item presensi wajib berupa daftar");
    const { schedule, assignment } = await this.getAuthorizedScheduleAssignment(principal, scheduleId);
    const items = dto.items.map(normalizeItem);
    const enrollmentIds = new Set<string>();
    for (const item of items) {
      if (enrollmentIds.has(item.enrollmentId)) throw new BadRequestException("Enrollment presensi tidak boleh duplikat");
      enrollmentIds.add(item.enrollmentId);
    }

    const roster = await this.getRoster(schedule.classId, assignment.academicYearId);
    const rosterIds = new Set(roster.map((enrollment) => enrollment.id));
    if (items.some((item) => !rosterIds.has(item.enrollmentId))) {
      throw new BadRequestException("Enrollment presensi bukan anggota kelas pada penugasan ini");
    }

    return Promise.all(items.map((item) => this.prisma.attendance.upsert({
      where: { enrollmentId_scheduleId_date: { enrollmentId: item.enrollmentId, scheduleId, date } },
      create: { enrollmentId: item.enrollmentId, scheduleId, date, status: item.status, notes: item.notes },
      update: { status: item.status, notes: item.notes },
    })));
  }

  private async getAuthorizedScheduleAssignment(principal: SiakadPrincipal, scheduleId: string) {
    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id: scheduleId },
      include: { classroom: true, subject: true },
    });
    if (!schedule) throw new NotFoundException("Jadwal pelajaran tidak ditemukan");
    const assignment = await this.prisma.teacherAssignment.findFirst({
      where: { classId: schedule.classId, subjectId: schedule.subjectId, academicYearId: schedule.classroom.academicYearId },
    });
    if (!assignment) throw new NotFoundException("Penugasan guru untuk jadwal tidak ditemukan");
    assertTeacherAssignmentAccess(principal, { unitId: schedule.classroom.unitId, teacherUserId: assignment.teacherUserId });
    return { schedule, assignment };
  }

  private getRoster(classId: string, academicYearId: string) {
    return this.prisma.enrollment.findMany({
      where: { classId, academicYearId, status: "active" },
      include: { student: true },
      orderBy: { student: { fullName: "asc" } },
    });
  }
}
