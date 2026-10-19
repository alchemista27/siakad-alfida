import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { allowedUnitIds, assertUnitAccess, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface CreateClassScheduleDto {
  classId: string;
  subjectId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UpdateClassScheduleDto {
  classId?: string;
  subjectId?: string;
  dayOfWeek?: number;
  startTime?: string;
  endTime?: string;
}

export interface ScheduleListFilter {
  classId?: string;
  subjectId?: string;
  dayOfWeek?: number;
}

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function overlaps(startA: string, endA: string, startB: string, endB: string): boolean {
  return timeToMinutes(startA) < timeToMinutes(endB) && timeToMinutes(startB) < timeToMinutes(endA);
}

function validateTimeRange(dayOfWeek: number, startTime: string, endTime: string): void {
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    throw new BadRequestException("Hari jadwal harus antara 1 dan 7");
  }
  if (!TIME_PATTERN.test(startTime) || !TIME_PATTERN.test(endTime)) {
    throw new BadRequestException("Waktu jadwal harus menggunakan format HH:mm");
  }
  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    throw new BadRequestException("Waktu selesai harus setelah waktu mulai");
  }
}

@Injectable()
export class SchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal, filter: ScheduleListFilter) {
    if (filter.classId) {
      const classroom = await this.prisma.classroom.findUnique({ where: { id: filter.classId } });
      if (!classroom) throw new NotFoundException("Kelas tidak ditemukan");
      assertUnitAccess(principal, classroom.unitId);
    }
    const schedules = await this.prisma.classSchedule.findMany({ include: { classroom: true, subject: true } });
    const allowed = allowedUnitIds(principal);
    return schedules.filter((schedule) =>
      (isSuperAdmin(principal) || allowed.has(schedule.classroom.unitId))
      && (!filter.classId || schedule.classId === filter.classId)
      && (!filter.subjectId || schedule.subjectId === filter.subjectId)
      && (!filter.dayOfWeek || schedule.dayOfWeek === filter.dayOfWeek),
    );
  }

  async getById(principal: SiakadPrincipal, id: string) {
    const schedule = await this.prisma.classSchedule.findUnique({
      where: { id },
      include: { classroom: true, subject: true },
    });
    if (!schedule) throw new NotFoundException("Jadwal pelajaran tidak ditemukan");
    assertUnitAccess(principal, schedule.classroom.unitId);
    return schedule;
  }

  async create(principal: SiakadPrincipal, dto: CreateClassScheduleDto) {
    const input = await this.resolveInput(principal, dto);
    await this.assertNoConflict(input);
    return this.prisma.classSchedule.create({ data: input });
  }

  async update(principal: SiakadPrincipal, id: string, dto: UpdateClassScheduleDto) {
    const existing = await this.getById(principal, id);
    const input = await this.resolveInput(principal, {
      classId: dto.classId ?? existing.classId,
      subjectId: dto.subjectId ?? existing.subjectId,
      dayOfWeek: dto.dayOfWeek ?? existing.dayOfWeek,
      startTime: dto.startTime ?? existing.startTime,
      endTime: dto.endTime ?? existing.endTime,
    });
    await this.assertNoConflict(input, id);
    return this.prisma.classSchedule.update({ where: { id }, data: input });
  }

  async remove(principal: SiakadPrincipal, id: string) {
    await this.getById(principal, id);
    return this.prisma.classSchedule.delete({ where: { id } });
  }

  private async resolveInput(principal: SiakadPrincipal, dto: CreateClassScheduleDto): Promise<CreateClassScheduleDto> {
    validateTimeRange(dto.dayOfWeek, dto.startTime, dto.endTime);
    const [classroom, subject] = await Promise.all([
      this.prisma.classroom.findUnique({ where: { id: dto.classId } }),
      this.prisma.subject.findUnique({ where: { id: dto.subjectId } }),
    ]);
    if (!classroom) throw new NotFoundException("Kelas tidak ditemukan");
    if (!subject) throw new NotFoundException("Mata pelajaran tidak ditemukan");
    assertUnitAccess(principal, classroom.unitId);
    if (subject.unitId !== classroom.unitId) {
      throw new BadRequestException("Mata pelajaran harus berada pada unit yang sama dengan kelas");
    }

    const assignment = await this.prisma.teacherAssignment.findFirst({
      where: { classId: dto.classId, subjectId: dto.subjectId, academicYearId: classroom.academicYearId },
    });
    if (!assignment) {
      throw new BadRequestException("Jadwal hanya dapat dibuat untuk mata pelajaran yang sudah memiliki penugasan guru");
    }
    return dto;
  }

  private async assertNoConflict(input: CreateClassScheduleDto, excludeId?: string) {
    const [classroom, schedules, assignments] = await Promise.all([
      this.prisma.classroom.findUnique({ where: { id: input.classId } }),
      this.prisma.classSchedule.findMany({ include: { classroom: true, subject: true } }),
      this.prisma.teacherAssignment.findMany(),
    ]);
    if (!classroom) throw new NotFoundException("Kelas tidak ditemukan");
    const assignment = assignments.find((item) =>
      item.classId === input.classId
      && item.subjectId === input.subjectId
      && item.academicYearId === classroom.academicYearId,
    );
    if (!assignment) throw new BadRequestException("Penugasan guru tidak ditemukan untuk jadwal");

    const relevantSchedules = schedules.filter((schedule) => schedule.id !== excludeId && schedule.dayOfWeek === input.dayOfWeek);
    if (relevantSchedules.some((schedule) => schedule.classId === input.classId && overlaps(input.startTime, input.endTime, schedule.startTime, schedule.endTime))) {
      throw new BadRequestException("Jadwal kelas bertumpang tindih pada hari dan waktu yang sama");
    }

    const teacherClassIds = new Set(assignments
      .filter((item) => item.teacherUserId === assignment.teacherUserId && item.academicYearId === assignment.academicYearId)
      .map((item) => item.classId));
    if (relevantSchedules.some((schedule) => teacherClassIds.has(schedule.classId) && overlaps(input.startTime, input.endTime, schedule.startTime, schedule.endTime))) {
      throw new BadRequestException("Guru sudah memiliki jadwal mengajar yang bertumpang tindih");
    }
  }
}
