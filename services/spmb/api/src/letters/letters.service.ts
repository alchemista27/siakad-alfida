import { BadRequestException, ConflictException, Injectable, NotFoundException, Optional } from "@nestjs/common";
import { randomBytes, randomUUID } from "node:crypto";
import { FoundationBrandingClient } from "./foundation-branding.client";
import { UnitLetterheadClient, type UnitLetterhead } from "./unit-letterhead.client";
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
        events: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!reg) throw new NotFoundException("Surat keterangan tidak ditemukan.");

    const isOwner = Boolean(principal?.id && reg.parentId === principal.id);
    const isScopedStaff = isSuperAdmin(principal) || allowedUnitIds(principal, ["admin_unit", "tim_spmb"]).has(reg.period.unitId);
    if (!isOwner && !isScopedStaff) throw new NotFoundException("Surat keterangan tidak ditemukan.");
    if (reg.status !== "accepted" && reg.status !== "enrolled") {
      throw new BadRequestException("Surat keterangan diterima hanya tersedia bagi pendaftar yang dinyatakan lulus.");
    }

    const decisionEvent = [...(reg.events || [])].reverse().find((event) => event.toStatus === "accepted");
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

    const [letterhead, foundation] = await Promise.all([
      this.getUnitLetterhead(registration.period.unitId, registration.period.unitName),
      this.getFoundationBranding(),
    ]);
    if (letterhead.unitId !== registration.period.unitId || !letterhead.unitName.trim()) {
      throw new ConflictException("Profil kop surat unit tidak sesuai.");
    }

    const verificationToken = randomBytes(32).toString("hex");
    let referral = registration.medicalReferral ?? await this.prisma.medicalReferral.upsert({
      where: { registrationId: registration.id },
      create: {
        registrationId: registration.id,
        referralNumber: `SPMB-MED-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        verificationToken,
      },
      update: {},
    });
    if (!referral.verificationToken) {
      referral = await this.prisma.medicalReferral.update({
        where: { id: referral.id },
        data: { verificationToken },
      });
    }

    return {
      referralNumber: referral.referralNumber,
      verificationToken: referral.verificationToken,
      issuedAt: new Date(referral.issuedAt).toISOString(),
      registrationNumber: registration.registrationNumber,
      unitName: letterhead.unitName,
      academicYearLabel: registration.period.label,
      studentName: registration.studentData.fullName,
      gender: registration.studentData.gender,
      birthPlace: registration.studentData.birthPlace,
      birthDate: new Date(registration.studentData.birthDate).toISOString(),
      unitAddress: letterhead.address,
      unitPhone: letterhead.phone,
      unitEmail: letterhead.email,
      unitLogoUrl: letterhead.logoUrl,
      foundationName: foundation.foundationName,
      foundationLogoUrl: foundation.logoUrl,
    };
  }

  async verifyMedicalReferral(verificationToken: string) {
    if (!/^[a-f0-9]{64}$/i.test(verificationToken)) return { valid: false };

    const referral = await this.prisma.medicalReferral.findUnique({
      where: { verificationToken },
      include: { registration: { include: { period: true, studentData: true } } },
    });
    if (!referral || referral.registration.status === "rejected" || !referral.registration.studentData?.fullName) return { valid: false };

    return {
      valid: true,
      studentName: referral.registration.studentData.fullName,
      unitName: referral.registration.period.unitName,
      academicYearLabel: referral.registration.period.label,
      referralNumber: referral.referralNumber,
      issuedAt: new Date(referral.issuedAt).toISOString(),
    };
  }

  private async getUnitLetterhead(unitId: string, fallbackName: string): Promise<UnitLetterhead> {
    const fallback: UnitLetterhead = {
      unitId,
      unitName: fallbackName.trim() || "Unit Pendidikan Al Fida",
      address: null,
      phone: null,
      email: null,
      logoUrl: null,
    };
    if (!this.unitLetterheadClient) return fallback;
    try {
      return await this.unitLetterheadClient.getLetterhead(unitId);
    } catch {
      return fallback;
    }
  }

  private async getFoundationBranding() {
    const fallback = { foundationName: "Yayasan Alfida", logoUrl: null as string | null };
    if (!this.foundationBrandingClient) return fallback;
    try {
      return await this.foundationBrandingClient.getBranding();
    } catch {
      return fallback;
    }
  }
}
