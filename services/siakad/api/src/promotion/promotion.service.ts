import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertHomeroomAccess, type SiakadPrincipal } from "../common/siakad-scope-policy";

const DECISIONS = ["promote", "retain", "graduate"] as const;
type PromotionDecisionType = (typeof DECISIONS)[number];

export interface PromotionDecisionDto {
  enrollmentId: string;
  decision: PromotionDecisionType;
  targetAcademicYearId?: string;
  targetClassId?: string;
  notes?: string;
}

function normalizedNotes(notes?: string): string | null {
  const value = notes?.trim() ?? "";
  if (value.length > 5000) throw new BadRequestException("Catatan keputusan terlalu panjang");
  return value || null;
}

@Injectable()
export class PromotionService {
  constructor(private readonly prisma: PrismaService) {}

  async listRoster(principal: SiakadPrincipal, classId: string) {
    const classroom = await this.prisma.classroom.findUnique({ where: { id: classId } });
    if (!classroom) throw new NotFoundException("Kelas tidak ditemukan");
    const homeroom = await this.getAuthorizedHomeroom(principal, classroom.id, classroom.academicYearId, classroom.unitId);
    return this.prisma.enrollment.findMany({
      where: { classId: classroom.id, academicYearId: homeroom.academicYearId, status: "active" },
      include: { student: true },
      orderBy: { student: { fullName: "asc" } },
    });
  }

  async decide(principal: SiakadPrincipal, dto: PromotionDecisionDto) {
    if (!dto?.enrollmentId || !DECISIONS.includes(dto.decision)) throw new BadRequestException("Keputusan kenaikan wajib valid");
    return this.prisma.$transaction((tx) => this.decideInTransaction(tx as any, principal, dto), { isolationLevel: "Serializable" });
  }

  private async decideInTransaction(prisma: any, principal: SiakadPrincipal, dto: PromotionDecisionDto) {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: dto.enrollmentId }, include: { student: true, classroom: true } });
    if (!enrollment?.classroom || !enrollment.classId) throw new BadRequestException("Enrollment harus berada di kelas sebelum diputuskan");
    const homeroom = await this.getAuthorizedHomeroom(principal, enrollment.classId, enrollment.academicYearId, enrollment.classroom.unitId, prisma);
    const notes = normalizedNotes(dto.notes);
    const existing = await prisma.promotionDecision.findUnique({ where: { enrollmentId: enrollment.id } });
    if (existing) {
      if (existing.decision !== dto.decision || existing.targetAcademicYearId !== (dto.targetAcademicYearId ?? null) || existing.targetClassId !== (dto.targetClassId ?? null) || (existing.notes ?? null) !== notes) {
        throw new ConflictException("Enrollment sudah memiliki keputusan promosi yang berbeda");
      }
      const targetEnrollment = existing.targetAcademicYearId
        ? await prisma.enrollment.findUnique({ where: { studentId_academicYearId: { studentId: enrollment.studentId, academicYearId: existing.targetAcademicYearId } } })
        : null;
      return { decision: existing, targetEnrollment };
    }
    if (enrollment.status !== "active") throw new ConflictException("Enrollment tidak lagi aktif untuk diputuskan");

    if (dto.decision === "graduate") {
      if (dto.targetAcademicYearId || dto.targetClassId) throw new BadRequestException("Kelulusan tidak boleh membuat enrollment tahun berikutnya");
      const decision = await prisma.promotionDecision.create({
        data: { enrollmentId: enrollment.id, academicYearId: enrollment.academicYearId, homeroomAssignmentId: homeroom.id, decision: "graduate", notes },
      });
      await prisma.enrollment.update({ where: { id: enrollment.id }, data: { status: "graduated" } });
      await prisma.student.update({ where: { id: enrollment.studentId }, data: { status: "graduated" } });
      return { decision, targetEnrollment: null };
    }

    if (!dto.targetAcademicYearId || !dto.targetClassId) throw new BadRequestException("Tahun ajaran dan kelas tujuan wajib dipilih secara eksplisit");
    const [targetYear, targetClass] = await Promise.all([
      prisma.academicYear.findUnique({ where: { id: dto.targetAcademicYearId } }),
      prisma.classroom.findUnique({ where: { id: dto.targetClassId } }),
    ]);
    if (!targetYear || !targetClass) throw new NotFoundException("Tahun ajaran atau kelas tujuan tidak ditemukan");
    if (targetYear.id === enrollment.academicYearId || targetYear.unitId !== enrollment.classroom.unitId || targetClass.unitId !== enrollment.classroom.unitId || targetClass.academicYearId !== targetYear.id) {
      throw new BadRequestException("Tahun ajaran dan kelas tujuan harus eksplisit serta berada pada unit yang sama");
    }
    const expectedLevel = dto.decision === "promote" ? enrollment.classroom.gradeLevel + 1 : enrollment.classroom.gradeLevel;
    if (targetClass.gradeLevel !== expectedLevel) throw new BadRequestException("Tingkat kelas tujuan tidak sesuai dengan keputusan promosi");
    const previousTarget = await prisma.enrollment.findUnique({ where: { studentId_academicYearId: { studentId: enrollment.studentId, academicYearId: targetYear.id } } });
    if (previousTarget) throw new ConflictException("Siswa sudah memiliki enrollment pada tahun ajaran tujuan");

    const decision = await prisma.promotionDecision.create({
      data: {
        enrollmentId: enrollment.id,
        academicYearId: enrollment.academicYearId,
        homeroomAssignmentId: homeroom.id,
        decision: dto.decision,
        targetAcademicYearId: targetYear.id,
        targetClassId: targetClass.id,
        targetClassLevel: targetClass.gradeLevel,
        notes,
      },
    });
    await prisma.enrollment.update({ where: { id: enrollment.id }, data: { status: "promoted" } });
    const targetEnrollment = await prisma.enrollment.create({ data: { studentId: enrollment.studentId, academicYearId: targetYear.id, classId: targetClass.id, status: "active" } });
    return { decision, targetEnrollment };
  }

  private async getAuthorizedHomeroom(principal: SiakadPrincipal, classId: string, academicYearId: string, unitId: string, prisma: any = this.prisma) {
    const homeroom = await prisma.homeroomAssignment.findFirst({ where: { classId, academicYearId } });
    if (!homeroom) throw new NotFoundException("Penugasan wali kelas tidak ditemukan");
    assertHomeroomAccess(principal, { unitId, homeroomTeacherUserId: homeroom.teacherUserId });
    return homeroom;
  }
}
