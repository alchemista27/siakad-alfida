import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertHomeroomAccess, assertParentEnrollmentAccess, type SiakadPrincipal } from "../common/siakad-scope-policy";
import { LhbsPdfService } from "./lhbs-pdf.service";

export interface CompileLhbsDto { enrollmentId: string; semester: number }

const ATTENDANCE_STATUSES = ["present", "sick", "excused", "absent"] as const;

function validSemester(semester: number): boolean {
  return Number.isInteger(semester) && semester >= 1 && semester <= 2;
}

function completeSnapshot(summary: unknown): boolean {
  if (!summary || typeof summary !== "object") return false;
  const candidate = summary as { attendance?: unknown; subjectGrades?: unknown; extracurricularGrades?: unknown };
  return !!candidate.attendance && Array.isArray(candidate.subjectGrades) && Array.isArray(candidate.extracurricularGrades);
}

@Injectable()
export class LhbsService {
  constructor(private readonly prisma: PrismaService, private readonly pdf: LhbsPdfService) {}

  async compileDraft(principal: SiakadPrincipal, dto: CompileLhbsDto) {
    if (!dto?.enrollmentId || !validSemester(dto.semester)) throw new BadRequestException("Enrollment dan semester LHBS wajib valid");
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: { student: true, classroom: true },
    });
    if (!enrollment?.classId || !enrollment.classroom || enrollment.status !== "active") {
      throw new BadRequestException("LHBS hanya dapat dikompilasi untuk enrollment aktif yang sudah berada di kelas");
    }
    const homeroom = await this.prisma.homeroomAssignment.findFirst({
      where: { classId: enrollment.classId, academicYearId: enrollment.academicYearId },
    });
    if (!homeroom) throw new NotFoundException("Penugasan wali kelas untuk kelas dan tahun ajaran ini tidak ditemukan");
    assertHomeroomAccess(principal, { unitId: enrollment.classroom.unitId, homeroomTeacherUserId: homeroom.teacherUserId });

    const existing = await this.prisma.lhbsReport.findUnique({
      where: { enrollmentId_academicYearId_semester: { enrollmentId: enrollment.id, academicYearId: enrollment.academicYearId, semester: dto.semester } },
    });
    if (existing?.status === "published") throw new ConflictException("Snapshot LHBS yang sudah dipublikasikan tidak dapat dikompilasi ulang");

    const [attendances, grades, memberships] = await Promise.all([
      this.prisma.attendance.findMany({ where: { enrollmentId: enrollment.id } }),
      this.prisma.grade.findMany({ where: { enrollmentId: enrollment.id }, include: { teacherAssignment: { include: { subject: true } } } }),
      this.prisma.extracurricularMembership.findMany({
        where: { studentId: enrollment.studentId, extracurricular: { academicYearId: enrollment.academicYearId }, grades: { some: { semester: dto.semester } } },
        include: { extracurricular: true, grades: { where: { semester: dto.semester } } },
      }),
    ]);

    const attendance = Object.fromEntries(ATTENDANCE_STATUSES.map((status) => [status, 0])) as Record<(typeof ATTENDANCE_STATUSES)[number], number>;
    for (const item of attendances) if (ATTENDANCE_STATUSES.includes(item.status as any)) attendance[item.status as (typeof ATTENDANCE_STATUSES)[number]] += 1;

    const bySubject = new Map<string, { subjectId: string; subjectName: string; labels: { category: string; label: string; score: number }[] }>();
    for (const grade of grades) {
      const subject = (grade as any).teacherAssignment?.subject;
      if (!subject) continue;
      const row: { subjectId: string; subjectName: string; labels: { category: string; label: string; score: number }[] } =
        bySubject.get(subject.id) ?? { subjectId: subject.id, subjectName: subject.name, labels: [] };
      row.labels.push({ category: grade.category, label: grade.label, score: grade.score });
      bySubject.set(subject.id, row);
    }
    const subjectGrades = [...bySubject.values()].map((row) => {
      const totals = new Map<string, { sum: number; count: number }>();
      for (const label of row.labels) {
        const total = totals.get(label.category) ?? { sum: 0, count: 0 };
        total.sum += label.score;
        total.count += 1;
        totals.set(label.category, total);
      }
      return {
        subjectId: row.subjectId,
        subjectName: row.subjectName,
        categories: Object.fromEntries([...totals.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([category, total]) => [category, Number((total.sum / total.count).toFixed(2))])),
        labels: row.labels.sort((a, b) => a.category.localeCompare(b.category) || a.label.localeCompare(b.label)),
      };
    }).sort((a, b) => a.subjectName.localeCompare(b.subjectName));
    const extracurricularGrades = memberships.flatMap((membership: any) => membership.grades.map((grade: any) => ({
      extracurricularId: membership.extracurricularId,
      extracurricularName: membership.extracurricular?.name ?? "Ekstrakurikuler",
      grade: grade.grade,
      notes: grade.notes ?? null,
    }))).sort((a, b) => a.extracurricularName.localeCompare(b.extracurricularName));
    const summary = { version: 1, compiledAt: new Date().toISOString(), attendance, subjectGrades, extracurricularGrades };
    const data = { enrollmentId: enrollment.id, academicYearId: enrollment.academicYearId, homeroomAssignmentId: homeroom.id, semester: dto.semester, status: "draft", summary };
    return existing
      ? this.prisma.lhbsReport.update({ where: { id: existing.id }, data: { summary, homeroomAssignmentId: homeroom.id, status: "draft" } })
      : this.prisma.lhbsReport.create({ data });
  }

  async publishLhbs(principal: SiakadPrincipal, reportId: string) {
    const report = await this.loadReport(reportId);
    this.assertHomeroomOwnsReport(principal, report);
    if (report.status === "published") throw new ConflictException("Snapshot LHBS sudah dipublikasikan dan tidak dapat diubah");
    if (report.status !== "draft" || !completeSnapshot(report.summary)) throw new BadRequestException("LHBS harus memiliki snapshot lengkap sebelum dipublikasikan");
    return this.prisma.lhbsReport.update({ where: { id: reportId }, data: { status: "published", publishedAt: new Date() } });
  }

  async getReportForParent(principal: SiakadPrincipal, reportId: string) {
    const report = await this.loadReport(reportId);
    if (report.status !== "published") throw new ForbiddenException("Rapor LHBS belum dipublikasikan");
    assertParentEnrollmentAccess(principal, { parentUserId: report.enrollment?.student?.parentUserId });
    return report;
  }

  async getPdfForParent(principal: SiakadPrincipal, reportId: string): Promise<Buffer> {
    return this.pdf.render(await this.getReportForParent(principal, reportId));
  }

  private async loadReport(reportId: string): Promise<any> {
    const report = await this.prisma.lhbsReport.findUnique({
      where: { id: reportId },
      include: { enrollment: { include: { student: true, classroom: true } }, homeroomAssignment: true },
    });
    if (!report) throw new NotFoundException("Rapor LHBS tidak ditemukan");
    return report;
  }

  private assertHomeroomOwnsReport(principal: SiakadPrincipal, report: any) {
    if (!report.homeroomAssignment || !report.enrollment?.classroom) throw new NotFoundException("Penugasan wali kelas atau kelas LHBS tidak ditemukan");
    if (report.homeroomAssignment.classId !== report.enrollment.classId || report.homeroomAssignment.academicYearId !== report.academicYearId) {
      throw new BadRequestException("Penugasan wali kelas tidak sesuai dengan kelas dan tahun LHBS");
    }
    assertHomeroomAccess(principal, { unitId: report.enrollment.classroom.unitId, homeroomTeacherUserId: report.homeroomAssignment.teacherUserId });
  }
}
