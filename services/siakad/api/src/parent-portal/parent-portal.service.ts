import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

function rate(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : Number((numerator / denominator).toFixed(4));
}

@Injectable()
export class ParentPortalService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(principal: SiakadPrincipal) {
    const students = await this.prisma.student.findMany({
      where: { parentUserId: principal.id },
      orderBy: { fullName: "asc" },
      include: {
        enrollments: {
          where: { status: "active" },
          orderBy: { academicYear: { name: "desc" } },
          include: {
            academicYear: true,
            classroom: { include: { schedules: { include: { subject: true }, orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] } } },
            attendances: true,
            grades: true,
            lhbsReports: { where: { status: "published" }, orderBy: { semester: "asc" } },
          },
        },
        extraMemberships: {
          include: { extracurricular: true, grades: { orderBy: { semester: "desc" } } },
        },
      },
    });

    const enrollments = students.flatMap((student) => student.enrollments);
    const classIds = [...new Set(enrollments.map((enrollment) => enrollment.classId).filter((id): id is string => Boolean(id)))];
    const academicYearIds = [...new Set(enrollments.map((enrollment) => enrollment.academicYearId))];
    const assignments = enrollments.length
      ? await this.prisma.teacherAssignment.findMany({
        where: { classId: { in: classIds }, academicYearId: { in: academicYearIds } },
        select: { id: true, classId: true, academicYearId: true },
      })
      : [];

    return {
      children: students.map((student) => this.childSummary(student, assignments)),
    };
  }

  private childSummary(student: any, assignments: { id: string; classId: string; academicYearId: string }[]) {
    const enrollment = student.enrollments[0] ?? null;
    const schedule = (enrollment?.classroom?.schedules ?? []).map((entry: any) => ({
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      subjectName: entry.subject.name,
    }));
    const attendanceRows = enrollment?.attendances ?? [];
    const presentCount = attendanceRows.filter((entry: any) => entry.status === "present").length;
    const expectedAssignments = enrollment?.classId
      ? assignments.filter((assignment) => assignment.classId === enrollment.classId && assignment.academicYearId === enrollment.academicYearId)
      : [];
    const gradedAssignments = new Set((enrollment?.grades ?? []).map((grade: any) => grade.teacherAssignmentId));
    const completedSubjectCount = expectedAssignments.filter((assignment) => gradedAssignments.has(assignment.id)).length;
    type ExtracurricularSummary = { name: string; semester: number; grade: string; notes: string | null };
    const membershipSummaries: ExtracurricularSummary[] = (student.extraMemberships as any[])
      .filter((membership: any) => enrollment && membership.extracurricular.academicYearId === enrollment.academicYearId)
      .map((membership: any): ExtracurricularSummary | null => {
        const latestGrade = membership.grades[0] ?? null;
        return latestGrade ? { name: membership.extracurricular.name, semester: latestGrade.semester, grade: latestGrade.grade, notes: latestGrade.notes ?? null } : null;
      })
      .filter((item): item is ExtracurricularSummary => item !== null)
      .sort((a, b) => a.name.localeCompare(b.name));
    const publishedLhbs = (enrollment?.lhbsReports ?? []).map((report: any) => ({
      id: report.id,
      semester: report.semester,
      publishedAt: report.publishedAt,
      summary: report.summary,
    }));

    return {
      student: { id: student.id, fullName: student.fullName, nis: student.nis ?? null },
      academicYear: enrollment?.academicYear ? { id: enrollment.academicYearId, name: enrollment.academicYear.name } : null,
      classroom: enrollment?.classroom ? { id: enrollment.classroom.id, name: enrollment.classroom.name } : null,
      schedule,
      attendance: { recordedCount: attendanceRows.length, presentCount, presentRate: rate(presentCount, attendanceRows.length) },
      gradeCompleteness: {
        assignedSubjectCount: expectedAssignments.length,
        gradedSubjectCount: completedSubjectCount,
        completionRate: rate(completedSubjectCount, expectedAssignments.length),
      },
      extracurricular: membershipSummaries,
      publishedLhbs,
    };
  }
}
