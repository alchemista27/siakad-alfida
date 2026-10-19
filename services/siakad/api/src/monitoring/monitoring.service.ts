import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { allowedUnitIds, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(4));
}

type UnitSummary = {
  unitId: string;
  unitName: string;
  attendance?: { recordedCount: number; presentCount: number; presentRate: number };
  grades?: { recordedCount: number; expectedEntryCount: number; completionRate: number };
  journals?: { recordedCount: number; scheduledCount: number; completionRate: number };
  lhbs?: { reportCount: number; publishedCount: number; publishRate: number };
  extracurricular?: { activityCount: number; membershipCount: number; gradedMembershipCount: number; gradeCompletionRate: number };
};

@Injectable()
export class MonitoringService {
  constructor(private readonly prisma: PrismaService) {}

  async academicOverview(principal: SiakadPrincipal, academicYearId?: string) {
    const superAdmin = isSuperAdmin(principal);
    const permittedUnitIds = superAdmin ? [] : [...allowedUnitIds(principal, ["admin_unit"])];
    if (!superAdmin && permittedUnitIds.length === 0) throw new ForbiddenException("Akses unit SIAKAD ditolak.");
    if (academicYearId) {
      const year = await this.prisma.academicYear.findUnique({ where: { id: academicYearId } });
      if (!year) throw new NotFoundException("Tahun ajaran tidak ditemukan");
      if (!superAdmin && !permittedUnitIds.includes(year.unitId)) throw new ForbiddenException("Akses unit SIAKAD ditolak.");
    }

    const units = await this.prisma.unitProjection.findMany({
      where: superAdmin ? {} : { id: { in: permittedUnitIds } },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    const unitIds = units.map((unit) => unit.id);
    if (!unitIds.length) return { academicYearId: academicYearId ?? null, units: [] };
    const academicYearScope = { unitId: { in: unitIds }, ...(academicYearId ? { id: academicYearId } : {}) };

    const [attendanceRows, gradeRows, enrollments, assignments, journals, schedules, lhbsReports, extracurriculars] = await Promise.all([
      this.prisma.attendance.findMany({ where: { enrollment: { academicYear: academicYearScope } }, include: { enrollment: { include: { academicYear: true } } } }),
      this.prisma.grade.findMany({ where: { enrollment: { academicYear: academicYearScope } }, include: { enrollment: { include: { academicYear: true } } } }),
      this.prisma.enrollment.findMany({ where: { status: "active", academicYear: academicYearScope }, include: { academicYear: true } }),
      this.prisma.teacherAssignment.findMany({ where: { academicYear: academicYearScope }, include: { classroom: true } }),
      this.prisma.teachingJournal.findMany({ where: { teacherAssignment: { academicYear: academicYearScope } }, include: { teacherAssignment: { include: { classroom: true } } } }),
      this.prisma.classSchedule.findMany({ where: { classroom: { academicYear: academicYearScope } }, include: { classroom: true } }),
      this.prisma.lhbsReport.findMany({ where: { academicYear: academicYearScope }, include: { academicYear: true } }),
      this.prisma.extracurricular.findMany({ where: { academicYear: academicYearScope }, include: { academicYear: true, memberships: { include: { grades: true } } } }),
    ]);

    const summaries = new Map<string, UnitSummary>(units.map((unit) => [unit.id, { unitId: unit.id, unitName: unit.name }]));
    const summaryFor = (unitId: string) => summaries.get(unitId);

    for (const unit of units) {
      const unitAttendance = attendanceRows.filter((row) => row.enrollment.academicYear.unitId === unit.id);
      if (unitAttendance.length) {
        const presentCount = unitAttendance.filter((row) => row.status === "present").length;
        summaryFor(unit.id)!.attendance = { recordedCount: unitAttendance.length, presentCount, presentRate: rate(presentCount, unitAttendance.length) };
      }

      const unitGradeRows = gradeRows.filter((row) => row.enrollment.academicYear.unitId === unit.id);
      if (unitGradeRows.length) {
        const unitEnrollments = enrollments.filter((enrollment) => enrollment.academicYear.unitId === unit.id && enrollment.classId);
        const unitAssignments = assignments.filter((assignment) => assignment.classroom.unitId === unit.id);
        const expectedPairs = new Set<string>();
        for (const enrollment of unitEnrollments) {
          for (const assignment of unitAssignments) {
            if (assignment.classId === enrollment.classId && assignment.academicYearId === enrollment.academicYearId) {
              expectedPairs.add(`${enrollment.id}:${assignment.id}`);
            }
          }
        }
        const recordedPairs = new Set(unitGradeRows.map((grade) => `${grade.enrollmentId}:${grade.teacherAssignmentId}`));
        const recordedCount = [...recordedPairs].filter((key) => expectedPairs.has(key)).length;
        summaryFor(unit.id)!.grades = { recordedCount, expectedEntryCount: expectedPairs.size, completionRate: rate(recordedCount, expectedPairs.size) };
      }

      const unitJournals = journals.filter((journal) => journal.teacherAssignment.classroom.unitId === unit.id);
      if (unitJournals.length) {
        const scheduledCount = schedules.filter((schedule) => schedule.classroom.unitId === unit.id).length;
        const recordedScheduleCount = new Set(unitJournals.map((journal) => journal.scheduleId).filter((id): id is string => Boolean(id))).size;
        summaryFor(unit.id)!.journals = { recordedCount: unitJournals.length, scheduledCount, completionRate: rate(recordedScheduleCount, scheduledCount) };
      }

      const unitLhbs = lhbsReports.filter((report) => report.academicYear.unitId === unit.id);
      if (unitLhbs.length) {
        const publishedCount = unitLhbs.filter((report) => report.status === "published").length;
        summaryFor(unit.id)!.lhbs = { reportCount: unitLhbs.length, publishedCount, publishRate: rate(publishedCount, unitLhbs.length) };
      }

      const unitExtras = extracurriculars.filter((activity) => activity.academicYear.unitId === unit.id);
      if (unitExtras.length) {
        const memberships = unitExtras.flatMap((activity) => activity.memberships);
        const gradedMembershipCount = memberships.filter((membership) => membership.grades.length > 0).length;
        summaryFor(unit.id)!.extracurricular = {
          activityCount: unitExtras.length,
          membershipCount: memberships.length,
          gradedMembershipCount,
          gradeCompletionRate: rate(gradedMembershipCount, memberships.length),
        };
      }
    }

    return { academicYearId: academicYearId ?? null, units: [...summaries.values()] };
  }
}
