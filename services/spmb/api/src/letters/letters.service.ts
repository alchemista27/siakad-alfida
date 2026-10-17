import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { allowedUnitIds, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";

@Injectable()
export class LettersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAcceptanceLetter(registrationId: string, principal: SpmbPrincipal) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        period: true,
        studentData: true,
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!reg) {
      throw new NotFoundException("Surat keterangan tidak ditemukan.");
    }

    const isOwner = Boolean(principal?.id && reg.parentId === principal.id);
    const isScopedStaff =
      isSuperAdmin(principal) ||
      allowedUnitIds(principal, ["admin_unit", "tim_ppdb"]).has(reg.period.unitId);

    if (!isOwner && !isScopedStaff) {
      throw new NotFoundException("Surat keterangan tidak ditemukan.");
    }

    if (reg.status !== "accepted" && reg.status !== "enrolled") {
      throw new BadRequestException("Surat keterangan diterima hanya tersedia bagi pendaftar yang dinyatakan lulus.");
    }

    const decisionEvent = [...(reg.events || [])]
      .reverse()
      .find((event) => event.toStatus === "accepted");

    return {
      registrationId: reg.id,
      registrationNumber: reg.registrationNumber,
      status: reg.status,
      unitId: reg.period.unitId,
      unitName: reg.period.unitName,
      academicYearLabel: reg.period.label,
      studentName: reg.studentData?.fullName || "Calon Santri",
      gender: reg.studentData?.gender || null,
      birthPlace: reg.studentData?.birthPlace || null,
      birthDate: reg.studentData?.birthDate ? new Date(reg.studentData.birthDate).toISOString() : null,
      decisionNote: decisionEvent?.note || "Dinyatakan LULUS seleksi penerimaan santri baru.",
      issuedAt: (decisionEvent?.createdAt ? new Date(decisionEvent.createdAt) : new Date()).toISOString(),
    };
  }
}
