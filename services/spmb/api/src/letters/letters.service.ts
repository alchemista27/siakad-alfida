import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional, ServiceUnavailableException } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { FoundationBrandingClient } from "./foundation-branding.client";
import { UnitLetterheadClient } from "./unit-letterhead.client";
import { PrismaService } from "../prisma/prisma.service";
import { allowedUnitIds, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";

@Injectable()
export class LettersService {
  constructor(
    private readonly prisma: PrismaService,
    @Optional() private readonly unitLetterheadClient?: UnitLetterheadClient,
    @Optional() private readonly foundationBrandingClient?: FoundationBrandingClient,
  ) {}

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
      allowedUnitIds(principal, ["admin_unit", "tim_spmb"]).has(reg.period.unitId);

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
      studentName: reg.studentData?.fullName || "Calon Murid",
      gender: reg.studentData?.gender || null,
      birthPlace: reg.studentData?.birthPlace || null,
      birthDate: reg.studentData?.birthDate ? new Date(reg.studentData.birthDate).toISOString() : null,
      decisionNote: decisionEvent?.note || "Dinyatakan LULUS seleksi penerimaan murid baru.",
      issuedAt: (decisionEvent?.createdAt ? new Date(decisionEvent.createdAt) : new Date()).toISOString(),
    };
  }

  async getMedicalReferralLetter(registrationId: string, principal: SpmbPrincipal) {
    const registration = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { period: true, studentData: true, medicalReferral: true },
    });
    if (!registration) throw new NotFoundException("Surat pengantar kesehatan tidak ditemukan.");

    const isOwner = registration.parentId === principal.id;
    const isScopedStaff = isSuperAdmin(principal) || allowedUnitIds(principal, ["admin_unit", "tim_spmb"]).has(registration.period.unitId);
    if (!isOwner && !isScopedStaff) throw new NotFoundException("Surat pengantar kesehatan tidak ditemukan.");
    if (registration.status !== "medical_pending" && registration.status !== "medical_uploaded") {
      throw new BadRequestException("Surat pengantar kesehatan tersedia pada tahap pemeriksaan kesehatan.");
    }
    if (!registration.studentData?.fullName || !registration.studentData.birthPlace || !registration.studentData.birthDate || !registration.studentData.gender) {
      throw new ConflictException("Biodata murid belum lengkap untuk surat pengantar kesehatan.");
    }
    if (!this.unitLetterheadClient || !this.foundationBrandingClient) {
      throw new ServiceUnavailableException("Layanan kop surat belum tersedia.");
    }

    const referral = registration.medicalReferral ?? await this.prisma.medicalReferral.upsert({
      where: { registrationId: registration.id },
      create: {
        registrationId: registration.id,
        referralNumber: `SPMB-MED-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
      },
      update: {},
    });
    const [letterhead, foundation] = await Promise.all([
      this.unitLetterheadClient.getLetterhead(registration.period.unitId),
      this.foundationBrandingClient.getBranding(),
    ]);
    if (letterhead.unitId !== registration.period.unitId || !letterhead.unitName.trim()) {
      throw new ConflictException("Profil kop surat unit tidak sesuai.");
    }
    const hasUnitLetterhead = Boolean(letterhead.logoUrl && letterhead.principalName?.trim() && letterhead.principalSignatureUrl);
    const hasFoundationFallback = Boolean(foundation.logoUrl && foundation.chairmanName?.trim() && foundation.chairmanSignatureUrl);
    if (!hasUnitLetterhead && !hasFoundationFallback) {
      throw new ConflictException("Profil kop surat unit belum lengkap dan identitas fallback yayasan belum tersedia.");
    }

    return {
      referralNumber: referral.referralNumber,
      issuedAt: new Date(referral.issuedAt).toISOString(),
      registrationNumber: registration.registrationNumber,
      unitName: letterhead.unitName,
      academicYearLabel: registration.period.label,
      studentName: registration.studentData.fullName,
      gender: registration.studentData.gender,
      birthPlace: registration.studentData.birthPlace,
      birthDate: new Date(registration.studentData.birthDate).toISOString(),
      unitLogoUrl: hasUnitLetterhead ? letterhead.logoUrl : null,
      signatoryName: hasUnitLetterhead ? letterhead.principalName! : foundation.chairmanName!,
      signatoryTitle: hasUnitLetterhead ? "Kepala Sekolah" : "Ketua Yayasan",
      signatorySignatureUrl: hasUnitLetterhead ? letterhead.principalSignatureUrl! : foundation.chairmanSignatureUrl!,
      letterheadMode: hasUnitLetterhead ? "unit" : "foundation_fallback" as const,
      foundationName: foundation.foundationName,
      foundationLogoUrl: foundation.logoUrl,
    };
  }
}
