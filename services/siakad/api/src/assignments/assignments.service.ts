import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { allowedUnitIds, assertUnitAccess, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface CreateTeacherAssignmentDto {
  academicYearId: string;
  classId: string;
  subjectId: string;
  teacherUserId: string;
}

export interface UpdateTeacherAssignmentDto {
  academicYearId?: string;
  classId?: string;
  subjectId?: string;
  teacherUserId?: string;
}

export interface CreateHomeroomAssignmentDto {
  academicYearId: string;
  classId: string;
  teacherUserId: string;
}

export interface UpdateHomeroomAssignmentDto {
  academicYearId?: string;
  classId?: string;
  teacherUserId?: string;
}

export interface AssignmentListFilter {
  academicYearId?: string;
  classId?: string;
  teacherUserId?: string;
}

function isTeacherProjection(user: { status?: string; roles?: unknown } | null): boolean {
  if (!user || user.status !== "active" || !Array.isArray(user.roles)) return false;
  return user.roles.some((role) => {
    if (typeof role === "string") return role === "guru";
    if (!role || typeof role !== "object") return false;
    const claim = role as { app?: unknown; role?: unknown };
    return claim.role === "guru" && (claim.app === "siakad" || claim.app === "*");
  });
}

@Injectable()
export class AssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async listTeacherAssignments(principal: SiakadPrincipal, filter: AssignmentListFilter) {
    await this.assertFilterScope(principal, filter);
    const assignments = await this.prisma.teacherAssignment.findMany({
      include: { classroom: true, academicYear: true, subject: true, teacher: true },
    });
    return assignments.filter((assignment) => this.matchesFilter(assignment, filter) && this.canAccess(principal, assignment.classroom.unitId));
  }

  async getTeacherAssignment(principal: SiakadPrincipal, id: string) {
    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: { id },
      include: { classroom: true, academicYear: true, subject: true, teacher: true },
    });
    if (!assignment) throw new NotFoundException("Penugasan guru tidak ditemukan");
    assertUnitAccess(principal, assignment.classroom.unitId);
    return assignment;
  }

  async createTeacherAssignment(principal: SiakadPrincipal, dto: CreateTeacherAssignmentDto) {
    const input = await this.resolveTeacherAssignmentInput(principal, dto);
    await this.assertTeacherAssignmentUnique(input);
    return this.prisma.teacherAssignment.create({ data: input });
  }

  async updateTeacherAssignment(principal: SiakadPrincipal, id: string, dto: UpdateTeacherAssignmentDto) {
    const existing = await this.getTeacherAssignment(principal, id);
    const input = await this.resolveTeacherAssignmentInput(principal, {
      academicYearId: dto.academicYearId ?? existing.academicYearId,
      classId: dto.classId ?? existing.classId,
      subjectId: dto.subjectId ?? existing.subjectId,
      teacherUserId: dto.teacherUserId ?? existing.teacherUserId,
    });
    await this.assertTeacherAssignmentUnique(input, id);
    return this.prisma.teacherAssignment.update({ where: { id }, data: input });
  }

  async removeTeacherAssignment(principal: SiakadPrincipal, id: string) {
    await this.getTeacherAssignment(principal, id);
    return this.prisma.teacherAssignment.delete({ where: { id } });
  }

  async listHomeroomAssignments(principal: SiakadPrincipal, filter: AssignmentListFilter) {
    await this.assertFilterScope(principal, filter);
    const assignments = await this.prisma.homeroomAssignment.findMany({
      include: { classroom: true, academicYear: true, teacher: true },
    });
    return assignments.filter((assignment) => this.matchesFilter(assignment, filter) && this.canAccess(principal, assignment.classroom.unitId));
  }

  async getHomeroomAssignment(principal: SiakadPrincipal, id: string) {
    const assignment = await this.prisma.homeroomAssignment.findUnique({
      where: { id },
      include: { classroom: true, academicYear: true, teacher: true },
    });
    if (!assignment) throw new NotFoundException("Penugasan wali kelas tidak ditemukan");
    assertUnitAccess(principal, assignment.classroom.unitId);
    return assignment;
  }

  async createHomeroomAssignment(principal: SiakadPrincipal, dto: CreateHomeroomAssignmentDto) {
    const input = await this.resolveHomeroomAssignmentInput(principal, dto);
    await this.assertHomeroomAssignmentUnique(input);
    return this.prisma.homeroomAssignment.create({ data: input });
  }

  async updateHomeroomAssignment(principal: SiakadPrincipal, id: string, dto: UpdateHomeroomAssignmentDto) {
    const existing = await this.getHomeroomAssignment(principal, id);
    const input = await this.resolveHomeroomAssignmentInput(principal, {
      academicYearId: dto.academicYearId ?? existing.academicYearId,
      classId: dto.classId ?? existing.classId,
      teacherUserId: dto.teacherUserId ?? existing.teacherUserId,
    });
    await this.assertHomeroomAssignmentUnique(input, id);
    return this.prisma.homeroomAssignment.update({ where: { id }, data: input });
  }

  async removeHomeroomAssignment(principal: SiakadPrincipal, id: string) {
    await this.getHomeroomAssignment(principal, id);
    return this.prisma.homeroomAssignment.delete({ where: { id } });
  }

  private async resolveTeacherAssignmentInput(principal: SiakadPrincipal, dto: CreateTeacherAssignmentDto): Promise<CreateTeacherAssignmentDto> {
    const [year, classroom, subject, teacher] = await Promise.all([
      this.prisma.academicYear.findUnique({ where: { id: dto.academicYearId } }),
      this.prisma.classroom.findUnique({ where: { id: dto.classId } }),
      this.prisma.subject.findUnique({ where: { id: dto.subjectId } }),
      this.prisma.userProjection.findUnique({ where: { id: dto.teacherUserId } }),
    ]);
    if (!year) throw new NotFoundException("Tahun ajaran tidak ditemukan");
    if (!classroom) throw new NotFoundException("Kelas tidak ditemukan");
    if (!subject) throw new NotFoundException("Mata pelajaran tidak ditemukan");
    if (!teacher) throw new NotFoundException("Proyeksi pengguna guru tidak ditemukan");
    assertUnitAccess(principal, classroom.unitId);
    if (year.unitId !== classroom.unitId || classroom.academicYearId !== year.id || subject.unitId !== classroom.unitId) {
      throw new BadRequestException("Tahun ajaran, kelas, dan mata pelajaran harus berada pada unit dan tahun yang sama");
    }
    if (!isTeacherProjection(teacher)) throw new BadRequestException("Pengguna yang ditugaskan harus merupakan guru aktif SIAKAD");
    return dto;
  }

  private async resolveHomeroomAssignmentInput(principal: SiakadPrincipal, dto: CreateHomeroomAssignmentDto): Promise<CreateHomeroomAssignmentDto> {
    const [year, classroom, teacher] = await Promise.all([
      this.prisma.academicYear.findUnique({ where: { id: dto.academicYearId } }),
      this.prisma.classroom.findUnique({ where: { id: dto.classId } }),
      this.prisma.userProjection.findUnique({ where: { id: dto.teacherUserId } }),
    ]);
    if (!year) throw new NotFoundException("Tahun ajaran tidak ditemukan");
    if (!classroom) throw new NotFoundException("Kelas tidak ditemukan");
    if (!teacher) throw new NotFoundException("Proyeksi pengguna guru tidak ditemukan");
    assertUnitAccess(principal, classroom.unitId);
    if (year.unitId !== classroom.unitId || classroom.academicYearId !== year.id) {
      throw new BadRequestException("Tahun ajaran dan kelas harus berada pada unit dan tahun yang sama");
    }
    if (!isTeacherProjection(teacher)) throw new BadRequestException("Pengguna yang ditugaskan harus merupakan guru aktif SIAKAD");
    return dto;
  }

  private async assertTeacherAssignmentUnique(input: CreateTeacherAssignmentDto, excludeId?: string) {
    const duplicate = await this.prisma.teacherAssignment.findFirst({
      where: { classId: input.classId, subjectId: input.subjectId, academicYearId: input.academicYearId },
    });
    if (duplicate && duplicate.id !== excludeId) throw new BadRequestException("Kelas sudah memiliki guru untuk mata pelajaran ini");
  }

  private async assertHomeroomAssignmentUnique(input: CreateHomeroomAssignmentDto, excludeId?: string) {
    const duplicate = await this.prisma.homeroomAssignment.findFirst({
      where: { classId: input.classId, academicYearId: input.academicYearId },
    });
    if (duplicate && duplicate.id !== excludeId) throw new BadRequestException("Kelas sudah memiliki wali kelas pada tahun ajaran ini");
  }

  private async assertFilterScope(principal: SiakadPrincipal, filter: AssignmentListFilter) {
    if (filter.classId) {
      const classroom = await this.prisma.classroom.findUnique({ where: { id: filter.classId } });
      if (!classroom) throw new NotFoundException("Kelas tidak ditemukan");
      assertUnitAccess(principal, classroom.unitId);
    }
    if (filter.academicYearId) {
      const year = await this.prisma.academicYear.findUnique({ where: { id: filter.academicYearId } });
      if (!year) throw new NotFoundException("Tahun ajaran tidak ditemukan");
      assertUnitAccess(principal, year.unitId);
    }
  }

  private matchesFilter(assignment: { academicYearId: string; classId: string; teacherUserId: string }, filter: AssignmentListFilter) {
    return (!filter.academicYearId || assignment.academicYearId === filter.academicYearId)
      && (!filter.classId || assignment.classId === filter.classId)
      && (!filter.teacherUserId || assignment.teacherUserId === filter.teacherUserId);
  }

  private canAccess(principal: SiakadPrincipal, unitId: string) {
    return isSuperAdmin(principal) || allowedUnitIds(principal).has(unitId);
  }
}
