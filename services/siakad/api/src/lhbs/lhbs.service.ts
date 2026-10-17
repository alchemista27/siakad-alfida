import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertHomeroomAccess, assertParentEnrollmentAccess, type SiakadPrincipal } from "../common/siakad-scope-policy";

@Injectable()
export class LhbsService {
  constructor(private readonly prisma: PrismaService) {}

  async publishLhbs(principal: SiakadPrincipal, reportId: string) {
    const report = await this.prisma.lhbsReport.findUnique({
      where: { id: reportId },
    });
    if (!report) {
      throw new NotFoundException("Rapor LHBS tidak ditemukan");
    }

    if (!report.homeroomAssignmentId) {
      throw new NotFoundException("Penugasan wali kelas tidak ditemukan");
    }

    const homeroom = await this.prisma.homeroomAssignment.findUnique({
      where: { id: report.homeroomAssignmentId },
    });
    if (!homeroom) {
      throw new NotFoundException("Penugasan wali kelas tidak ditemukan");
    }

    assertHomeroomAccess(principal, {
      unitId: (homeroom as any).unitId ?? "",
      homeroomTeacherUserId: homeroom.teacherUserId,
    });

    return this.prisma.lhbsReport.update({
      where: { id: reportId },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
    });
  }

  async getReportForParent(principal: SiakadPrincipal, reportId: string) {
    const report = await this.prisma.lhbsReport.findUnique({
      where: { id: reportId },
    });
    if (!report) {
      throw new NotFoundException("Rapor LHBS tidak ditemukan");
    }

    if (report.status !== "published") {
      throw new ForbiddenException("Rapor LHBS belum dipublikasikan");
    }

    assertParentEnrollmentAccess(principal, {
      parentUserId: (report as any).enrollment?.parentUserId,
    });

    return report;
  }
}
