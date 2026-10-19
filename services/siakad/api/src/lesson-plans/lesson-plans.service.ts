import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  assertTeacherAssignmentAccess,
  isSuperAdmin,
  type SiakadPrincipal,
} from "../common/siakad-scope-policy";

const lessonPlanTypes = ["prota", "promes", "rpp"] as const;
export type LessonPlanType = (typeof lessonPlanTypes)[number];

export interface CreateLessonPlanDto {
  teacherAssignmentId: string;
  type: LessonPlanType;
  title: string;
  objectives?: string;
  materials?: string;
  fileUrl?: string;
}

export interface UpdateLessonPlanDto {
  type?: LessonPlanType;
  title?: string;
  objectives?: string | null;
  materials?: string | null;
  fileUrl?: string | null;
}

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

function planType(value: unknown): LessonPlanType {
  if (typeof value !== "string" || !lessonPlanTypes.includes(value as LessonPlanType)) {
    throw new BadRequestException("Tipe perangkat ajar harus prota, promes, atau rpp");
  }
  return value as LessonPlanType;
}

@Injectable()
export class LessonPlansService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal) {
    const plans = await this.prisma.lessonPlan.findMany({
      include: { teacherAssignment: { include: { classroom: true, academicYear: true, subject: true } } },
      orderBy: { updatedAt: "desc" },
    });
    return plans.filter((plan) => isSuperAdmin(principal) || plan.teacherAssignment.teacherUserId === principal.id);
  }

  async findOne(principal: SiakadPrincipal, id: string) {
    const plan = await this.prisma.lessonPlan.findUnique({
      where: { id },
      include: { teacherAssignment: { include: { classroom: true, academicYear: true, subject: true } } },
    });
    if (!plan) throw new NotFoundException("Perangkat ajar tidak ditemukan");
    this.assertAccess(principal, plan.teacherAssignment);
    return plan;
  }

  async create(principal: SiakadPrincipal, dto: CreateLessonPlanDto) {
    const assignment = await this.getAssignment(principal, dto.teacherAssignmentId);
    return this.prisma.lessonPlan.create({
      data: {
        teacherAssignmentId: assignment.id,
        subjectId: assignment.subjectId,
        academicYearId: assignment.academicYearId,
        type: planType(dto.type),
        title: requiredText(dto.title, "Judul perangkat ajar", 200),
        objectives: optionalText(dto.objectives, "Tujuan pembelajaran", 5000) ?? undefined,
        materials: optionalText(dto.materials, "Materi", 10000) ?? undefined,
        fileUrl: optionalText(dto.fileUrl, "URL berkas", 2000) ?? undefined,
      },
      include: { teacherAssignment: { include: { classroom: true, academicYear: true, subject: true } } },
    });
  }

  async update(principal: SiakadPrincipal, id: string, dto: UpdateLessonPlanDto) {
    const existing = await this.findOne(principal, id);
    const data = {
      type: dto.type === undefined ? undefined : planType(dto.type),
      title: dto.title === undefined ? undefined : requiredText(dto.title, "Judul perangkat ajar", 200),
      objectives: optionalText(dto.objectives, "Tujuan pembelajaran", 5000),
      materials: optionalText(dto.materials, "Materi", 10000),
      fileUrl: optionalText(dto.fileUrl, "URL berkas", 2000),
    };
    if (Object.values(data).every((value) => value === undefined)) throw new BadRequestException("Tidak ada perubahan perangkat ajar");
    return this.prisma.lessonPlan.update({
      where: { id: existing.id },
      data,
      include: { teacherAssignment: { include: { classroom: true, academicYear: true, subject: true } } },
    });
  }

  async remove(principal: SiakadPrincipal, id: string) {
    const existing = await this.findOne(principal, id);
    return this.prisma.lessonPlan.delete({ where: { id: existing.id } });
  }

  private async getAssignment(principal: SiakadPrincipal, id: string) {
    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: { id },
      include: { classroom: true, academicYear: true, subject: true },
    });
    if (!assignment) throw new NotFoundException("Penugasan guru tidak ditemukan");
    this.assertAccess(principal, assignment);
    if (assignment.classroom.academicYearId !== assignment.academicYearId || assignment.subject.unitId !== assignment.classroom.unitId) {
      throw new BadRequestException("Penugasan guru tidak selaras dengan mata pelajaran, kelas, dan tahun ajaran");
    }
    return assignment;
  }

  private assertAccess(principal: SiakadPrincipal, assignment: { teacherUserId: string; classroom: { unitId: string } }) {
    assertTeacherAssignmentAccess(principal, { teacherUserId: assignment.teacherUserId, unitId: assignment.classroom.unitId });
  }
}
