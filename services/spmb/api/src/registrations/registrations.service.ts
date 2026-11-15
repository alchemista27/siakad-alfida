import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AdmissionCapacityService } from "./admission-capacity.service";
import {
  CreateOnlineRegistrationDto,
  SubmitStudentDataDto,
  SubmitParentDataDto,
  UploadPaymentDto,
  VerifyPaymentDto,
} from "./registrations.dto";
import {
  RegistrationStatus,
  RegistrationSource,
  PaymentMethod,
  PaymentStatus,
  Gender,
  ParentType,
  DossierReviewStatus,
  DocumentType,
} from "../generated/prisma";

import {
  CreateSpmbDraftSchema,
  assertGuardianRequiredForResidence,
  assertLevelSpecificStudentFields,
  isStudentRegistrationComplete,
  ParentRegistrationFormSchema,
  StudentRegistrationFormSchema,
  requiredDocumentTypesForLevel,
} from "@alfida/contracts";
import { canTransition } from "../common/spmb-workflow";
import { ACTIVE_REGISTRATION_POLICY } from "../common/registration-policy";
import { allowedUnitIds, assertUnitAccess, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";

@Injectable()
export class RegistrationsService {
  private readonly capacityService: AdmissionCapacityService;

  constructor(
    private readonly prisma: PrismaService,
    capacityService?: AdmissionCapacityService,
  ) {
    this.capacityService = capacityService || new AdmissionCapacityService(prisma);
  }

  private parseOrThrow(schema: { safeParse(input: unknown): any }, input: unknown): any {
    const parsed = schema.safeParse(input);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.issues[0]?.message || "Payload tidak valid.");
    }
    return parsed.data;
  }

  private formatStructuredAddress(payload: {
    streetAddress: string;
    rt: string;
    rw: string;
    hamlet?: string;
    village: string;
    subdistrict: string;
    city: string;
    province: string;
    postalCode: string;
  }) {
    return [
      payload.streetAddress,
      `RT ${payload.rt.padStart(3, "0")}/RW ${payload.rw.padStart(3, "0")}`,
      payload.hamlet || null,
      payload.village,
      payload.subdistrict,
      payload.city,
      payload.province,
      payload.postalCode,
    ].filter(Boolean).join(", ");
  }

  private sanitizeForParent(registration: any) {
    if (!registration) return null;
    const { handoffError, ...rest } = registration;
    const sanitized: any = {
      ...rest,
      studentDataComplete: isStudentRegistrationComplete(
        registration.studentData,
        registration.period?.educationLevel,
      ),
    };
    if (Array.isArray(registration.documents)) {
      sanitized.documents = registration.documents.map(({ fileUrl, ...doc }: any) => doc);
    }
    if (registration.payment) {
      const { proofUrl, proofObjectKey, ...payment } = registration.payment;
      sanitized.payment = payment;
    }
    if (registration.observationResult) {
      sanitized.observationResult = { recorded: true };
    }
    return sanitized;
  }

  // ================= ALUR ONLINE (ORANG TUA) =================
  async getActiveRegistrationForParent(parentOrId: string | { id: string }) {
    const parentId = typeof parentOrId === "string" ? parentOrId : parentOrId.id;
    const registration = await this.prisma.registration.findFirst({
      where: {
        parentId,
        status: { notIn: [RegistrationStatus.rejected] },
      },
      include: {
        period: true,
        studentData: true,
        parentData: true,
        payment: true,
        documents: true,
        medicalReferral: true,
        observationBooking: {
          include: { schedule: true },
        },
        observationResult: true,
        events: { orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    return this.sanitizeForParent(registration);
  }

  async listForParent(parentOrId: string | { id: string }) {
    const parentId = typeof parentOrId === "string" ? parentOrId : parentOrId.id;
    const registrations = await this.prisma.registration.findMany({
      where: { parentId },
      include: {
        period: true,
        studentData: true,
        payment: true,
        observationBooking: { include: { schedule: true } },
        observationResult: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return registrations.map((registration) => this.sanitizeForParent(registration));
  }

  async findForParent(principalOrId: string | { id: string }, registrationId: string) {
    const parentId = typeof principalOrId === "string" ? principalOrId : principalOrId.id;
    return this.getForParent(registrationId, parentId);
  }

  async getForParent(registrationId: string, parentOrId: string | { id: string }) {
    const parentId = typeof parentOrId === "string" ? parentOrId : parentOrId.id;
    const registration = await this.prisma.registration.findFirst({
      where: { id: registrationId, parentId },
      include: {
        period: true,
        studentData: true,
        parentData: true,
        payment: true,
        documents: true,
        medicalReferral: true,
        observationBooking: { include: { schedule: true } },
        observationResult: true,
        events: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    return this.sanitizeForParent(registration);
  }

  async createOnline(parent: { id: string; email: string; fullName: string }, dto: CreateOnlineRegistrationDto) {
    const payload = this.parseOrThrow(CreateSpmbDraftSchema, dto);
    const parentId = parent.id;
    return this.prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: parentId },
        create: {
          id: parentId,
          email: parent.email,
          fullName: parent.fullName || parent.email,
        },
        update: {
          email: parent.email,
          fullName: parent.fullName || parent.email,
        },
      });
      const period = await tx.admissionPeriod.findUnique({
        where: { id: payload.periodId },
      });
      if (!period || !period.isOpen) {
        throw new BadRequestException("Periode pendaftaran tidak aktif atau telah ditutup.");
      }

      if (ACTIVE_REGISTRATION_POLICY === "multiple_child_applications") {
        const anonymousDraft = await tx.registration.findFirst({
          where: {
            parentId,
            periodId: period.id,
            status: RegistrationStatus.pending_payment,
            studentData: { is: null },
          },
          select: { id: true },
        });
        if (anonymousDraft) {
          throw new BadRequestException("Selesaikan atau batalkan draft pendaftaran yang sedang menunggu pembayaran sebelum membuat draft baru pada periode ini.");
        }
      } else {
        const existing = await tx.registration.findFirst({
          where: {
            parentId,
            periodId: period.id,
            status: { notIn: [RegistrationStatus.rejected] },
          },
        });
        if (existing) {
          throw new BadRequestException("Anda sudah memiliki berkas pendaftaran aktif pada periode ini.");
        }
      }

      // Cek kuota dan alokasi nomor pendaftaran secara concurrency-safe.
      const { registrationNumber: regNum } = await this.capacityService.allocateRegistrationNumber(tx, period.id);

      const reg = await tx.registration.create({
        data: {
          periodId: period.id,
          registrationNumber: regNum,
          parentId,
          source: RegistrationSource.online,
          status: RegistrationStatus.pending_payment,
        },
      });

      await tx.payment.create({
        data: {
          registrationId: reg.id,
          amount: period.fee,
          method: PaymentMethod.transfer_proof,
          status: PaymentStatus.pending,
        },
      });

      await tx.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId: parentId,
          toStatus: RegistrationStatus.pending_payment,
          kind: "transition",
          note: "Pendaftaran online mandiri dimulai oleh orang tua",
        },
      });

      return reg;
    });
  }


  // ================= FORM SUBMISSIONS =================
  async submitStudentData(registrationId: string, userId: string, dto: SubmitStudentDataDto) {
    const payload = this.parseOrThrow(StudentRegistrationFormSchema, dto);

    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({ where: { id: registrationId }, include: { period: true } });
      if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
      if (reg.parentId !== userId) {
        throw new ForbiddenException("Anda tidak berhak mengisi data pendaftaran ini.");
      }
      if (!([RegistrationStatus.payment_verified, RegistrationStatus.form_filling] as RegistrationStatus[]).includes(reg.status)) {
        throw new BadRequestException("Tahap pendaftaran saat ini tidak dapat mengisi biodata murid.");
      }
      if (!reg.period.educationLevel) {
        throw new BadRequestException("Jenjang periode belum dikonfigurasi. Hubungi panitia SPMB.");
      }
      try {
        assertLevelSpecificStudentFields(reg.period.educationLevel, payload);
      } catch (error) {
        throw new BadRequestException(error instanceof Error ? error.message : "Data Dapodik murid tidak lengkap.");
      }

      if (ACTIVE_REGISTRATION_POLICY === "multiple_child_applications") {
        const duplicate = await tx.registration.findFirst({
          where: {
            id: { not: registrationId },
            parentId: userId,
            periodId: reg.periodId,
            status: { notIn: [RegistrationStatus.rejected] },
            studentData: {
              is: { fullName: { equals: payload.fullName, mode: "insensitive" } },
            },
          },
          select: { id: true },
        });
        if (duplicate) {
          throw new BadRequestException("Calon murid tersebut sudah memiliki pendaftaran aktif pada periode ini.");
        }
      }

      const studentData = {
        fullName: payload.fullName,
        nickname: payload.nickname,
        gender: payload.gender as Gender,
        religion: payload.religion,
        birthPlace: payload.birthPlace,
        birthDate: new Date(payload.birthDate),
        nisn: payload.nisn || null,
        nik: payload.nik,
        birthCertificateNumber: payload.birthCertificateNumber,
        familyCardNumber: payload.familyCardNumber,
        streetAddress: payload.streetAddress,
        rt: payload.rt,
        rw: payload.rw,
        hamlet: payload.hamlet || null,
        village: payload.village,
        subdistrict: payload.subdistrict,
        city: payload.city,
        province: payload.province,
        postalCode: payload.postalCode,
        residenceStatus: payload.residenceStatus,
        specialNeeds: payload.specialNeeds || null,
        pipEligible: payload.pipEligible,
        kipNumber: payload.kipNumber || null,
        previousSchoolName: payload.previousSchoolName || null,
        previousSchoolNpsn: payload.previousSchoolNpsn || null,
        graduationDocumentNumber: payload.graduationDocumentNumber || null,
        graduationYear: payload.graduationYear ?? null,
        tkGroup: reg.period.educationLevel === "tk" ? payload.tkGroup : null,
        siblingsCount: payload.siblingsCount,
        address: this.formatStructuredAddress(payload),
        transportation: payload.transportation,
      };

      await tx.studentData.upsert({
        where: { registrationId },
        update: studentData,
        create: {
          registrationId,
          ...studentData,
        },
      });

      if (reg.status === RegistrationStatus.payment_verified && canTransition(reg.status, "form_filling")) {
        await tx.registration.update({
          where: { id: registrationId },
          data: { status: RegistrationStatus.form_filling },
        });
        await tx.registrationEvent.create({
          data: {
            registrationId,
            actorId: userId,
            fromStatus: reg.status,
            toStatus: RegistrationStatus.form_filling,
            kind: "transition",
            note: "Pengisian formulir data murid selesai",
          },
        });
      }

      return {
        success: true as const,
        status: RegistrationStatus.form_filling,
        nextStep: "parent_form" as const,
        studentDataComplete: true as const,
      };
    });
  }

  async submitParentData(registrationId: string, userId: string, dto: SubmitParentDataDto) {
    const payload = this.parseOrThrow(ParentRegistrationFormSchema, dto);
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        studentData: true,
        period: { select: { educationLevel: true } },
      },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId !== userId) {
      throw new ForbiddenException("Anda tidak berhak mengisi data pendaftaran ini.");
    }
    if (reg.status !== RegistrationStatus.form_filling || !canTransition(reg.status, "documents_uploaded")) {
      throw new BadRequestException("Data orang tua hanya dapat diisi setelah biodata murid selesai.");
    }
    if (!isStudentRegistrationComplete(reg.studentData, reg.period.educationLevel)) {
      throw new BadRequestException("Lengkapi seluruh formulir data murid sebelum mengisi data orang tua.");
    }
    try {
      assertGuardianRequiredForResidence(reg.studentData.residenceStatus, payload);
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : "Data wali tidak lengkap.");
    }

    const parentsToUpsert = [
      [ParentType.father, payload.father],
      [ParentType.mother, payload.mother],
      ...(payload.guardian ? [[ParentType.guardian, payload.guardian] as const] : []),
    ].map(([type, parentData]) => ({
      registrationId,
      type,
      fullName: parentData.fullName,
      nik: parentData.nik,
      birthPlace: parentData.birthPlace,
      birthDate: new Date(parentData.birthDate),
      education: parentData.education,
      occupation: parentData.occupation,
      phone: parentData.phone,
      incomeRange: parentData.incomeRange,
      address: parentData.address,
    }));

    await this.prisma.$transaction(async (tx) => {
      for (const parentData of parentsToUpsert) {
        const { registrationId: parentRegistrationId, type, ...data } = parentData;
        await tx.parentData.upsert({
          where: { registrationId_type: { registrationId: parentRegistrationId, type } },
          create: parentData,
          update: data,
        });
      }
      await tx.registration.update({
        where: { id: registrationId },
        data: { status: RegistrationStatus.documents_uploaded },
      });
      await tx.registrationEvent.create({
        data: {
          registrationId,
          actorId: userId,
          fromStatus: reg.status,
          toStatus: RegistrationStatus.documents_uploaded,
          kind: "transition",
          note: "Formulir orang tua tersimpan, menuju unggah berkas",
        },
      });
    });

    return { success: true };
  }

  // ================= PEMBAYARAN =================
  async uploadPayment(registrationId: string, userId: string, dto: UploadPaymentDto) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { period: true },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId !== userId) {
      throw new ForbiddenException("Akses ditolak.");
    }
    if (!canTransition(reg.status, "payment_uploaded")) {
      throw new BadRequestException("Tahap pendaftaran saat ini tidak dapat mengunggah pembayaran.");
    }

    await this.prisma.$transaction([
      this.prisma.payment.upsert({
        where: { registrationId },
        update: {
          proofUrl: dto.proofUrl,
          amount: dto.amount ?? reg.period.fee,
          method: PaymentMethod.transfer_proof,
          status: PaymentStatus.uploaded,
          uploadedAt: new Date(),
        },
        create: {
          registrationId,
          proofUrl: dto.proofUrl,
          amount: dto.amount ?? reg.period.fee,
          method: PaymentMethod.transfer_proof,
          status: PaymentStatus.uploaded,
          uploadedAt: new Date(),
        },
      }),
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: RegistrationStatus.payment_uploaded },
      }),
      this.prisma.registrationEvent.create({
        data: {
          registrationId,
          actorId: userId,
          fromStatus: reg.status,
          toStatus: RegistrationStatus.payment_uploaded,
          kind: "transition",
          note: "Bukti transfer diunggah oleh pendaftar",
        },
      }),
    ]);

    return { success: true };
  }

  async verifyPayment(registrationId: string, principal: SpmbPrincipal, dto: VerifyPaymentDto) {
    const actorId = principal.id;
    const reg = await this.prisma.registration.findUnique({ where: { id: registrationId }, include: { period: true } });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    assertUnitAccess(principal, reg.period.unitId, ["admin_unit", "tim_spmb"]);
    if (typeof dto.isApproved !== "boolean") {
      throw new BadRequestException("isApproved harus bernilai boolean.");
    }

    const newStatus = dto.isApproved
      ? RegistrationStatus.payment_verified
      : RegistrationStatus.pending_payment;
    if (!canTransition(reg.status, newStatus)) {
      throw new BadRequestException("Tahap pendaftaran saat ini tidak dapat diverifikasi pembayarannya.");
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { registrationId },
        data: {
          status: dto.isApproved ? PaymentStatus.verified : PaymentStatus.rejected,
          verifiedAt: dto.isApproved ? new Date() : null,
          verifiedBy: actorId,
          rejectionNote: dto.rejectionNote || null,
        },
      }),
      this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: newStatus },
      }),
      this.prisma.registrationEvent.create({
        data: {
          registrationId,
          actorId,
          fromStatus: reg.status,
          toStatus: newStatus,
          kind: "transition",
          note: dto.isApproved
            ? "Pembayaran dikonfirmasi lunas oleh admin unit"
            : `Pembayaran ditolak: ${dto.rejectionNote || "Bukti tidak valid"}`,
        },
      }),
    ]);

    return { success: true };
  }

  async verifyDocuments(registrationId: string, principal: SpmbPrincipal, isApproved: boolean, rejectionNote?: string) {
    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.registration.findUnique({
        where: { id: registrationId },
        include: { documents: true, period: true },
      });
      if (!registration) throw new NotFoundException("Pendaftaran tidak ditemukan.");
      assertUnitAccess(principal, registration.period.unitId, ["admin_unit", "tim_spmb"]);
      if (typeof isApproved !== "boolean") {
        throw new BadRequestException("isApproved harus bernilai boolean.");
      }
      if (registration.status !== RegistrationStatus.verification) {
        throw new BadRequestException("Berkas hanya dapat diverifikasi saat berada dalam antrean verifikasi panitia.");
      }

      const uploadedTypes = new Set(registration.documents.map((document) => document.type));
      const hasMedicalResult = uploadedTypes.has(DocumentType.medical_result);

      if (!isApproved) {
        const note = rejectionNote?.trim();
        if (!note || note.length < 3) {
          throw new BadRequestException("Catatan revisi minimal 3 karakter.");
        }
        const nextStatus = hasMedicalResult
          ? RegistrationStatus.medical_pending
          : RegistrationStatus.documents_uploaded;
        if (!canTransition(registration.status, nextStatus)) {
          throw new BadRequestException("Tahap pendaftaran saat ini tidak dapat dikembalikan untuk perbaikan berkas.");
        }
        const updated = await tx.registration.update({
          where: { id: registrationId },
          data: {
            status: nextStatus,
            dossierReviewStatus: DossierReviewStatus.revision_required,
            rejectionReason: note,
          },
        });
        await tx.registrationEvent.create({
          data: {
            registrationId,
            actorId: principal.id,
            fromStatus: registration.status,
            toStatus: nextStatus,
            kind: "verification_rejected",
            note: hasMedicalResult ? `Hasil kesehatan perlu diperbaiki: ${note}` : note,
          },
        });
        return {
          success: true,
          verified: false,
          dossierReviewStatus: updated.dossierReviewStatus,
          nextStage: nextStatus,
        };
      }

      if (!registration.period.educationLevel) {
        throw new BadRequestException("Jenjang periode belum dikonfigurasi. Hubungi panitia SPMB.");
      }
      const requiredTypes = requiredDocumentTypesForLevel(registration.period.educationLevel) as readonly DocumentType[];
      const missingTypes = [...requiredTypes, ...(hasMedicalResult ? [DocumentType.medical_result] : [])].filter((type) => !uploadedTypes.has(type));
      if (missingTypes.length > 0) {
        throw new BadRequestException(`Dokumen wajib belum lengkap: ${missingTypes.join(", ")}.`);
      }

      const nextStatus = hasMedicalResult
        ? RegistrationStatus.verification
        : RegistrationStatus.medical_pending;
      if (nextStatus !== registration.status && !canTransition(registration.status, nextStatus)) {
        throw new BadRequestException("Tahap pendaftaran saat ini tidak dapat dilanjutkan setelah verifikasi berkas.");
      }

      const updated = await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: nextStatus,
          dossierReviewStatus: DossierReviewStatus.approved,
          rejectionReason: null,
        },
      });
      await tx.registrationEvent.create({
        data: {
          registrationId,
          actorId: principal.id,
          fromStatus: registration.status,
          toStatus: nextStatus,
          kind: "verification_approved",
          note: hasMedicalResult
            ? "Hasil kesehatan telah diverifikasi panitia. Orang tua dapat memilih jadwal observasi."
            : "Berkas persyaratan telah diverifikasi panitia. Orang tua dapat melanjutkan pemeriksaan kesehatan.",
        },
      });
      return {
        success: true,
        verified: true,
        dossierReviewStatus: updated.dossierReviewStatus,
        nextStage: nextStatus,
      };
    });
  }

  // ================= ADMIN LIST & DETAIL =================
  async findAll(
    query: { periodId?: string; status?: RegistrationStatus; source?: RegistrationSource; search?: string },
    principal: SpmbPrincipal,
  ) {
    const where: any = {};
    if (!isSuperAdmin(principal)) {
      const unitIds = [...allowedUnitIds(principal, ["admin_unit", "tim_spmb"])];
      if (unitIds.length === 0) return [];
      where.period = { unitId: { in: unitIds } };
    }
    if (query.periodId) where.periodId = query.periodId;
    if (query.status) where.status = query.status;
    if (query.source) where.source = query.source;
    if (query.search) {
      where.OR = [
        { registrationNumber: { contains: query.search, mode: "insensitive" } },
        { externalRef: { contains: query.search, mode: "insensitive" } },
        { guardianName: { contains: query.search, mode: "insensitive" } },
        { guardianPhone: { contains: query.search, mode: "insensitive" } },
        { studentData: { fullName: { contains: query.search, mode: "insensitive" } } },
      ];
    }

    return this.prisma.registration.findMany({
      where,
      include: {
        period: true,
        studentData: true,
        parent: { select: { fullName: true, email: true, phone: true } },
        payment: true,
        documents: { select: { id: true, type: true, fileName: true } },
        observationResult: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, principal: SpmbPrincipal) {
    const reg = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        period: true,
        studentData: true,
        parentData: true,
        parent: true,
        payment: true,
        documents: true,
        medicalReferral: true,
        observationBooking: { include: { schedule: true } },
        observationResult: { include: { observer: true } },
        events: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    assertUnitAccess(principal, reg.period.unitId, ["admin_unit", "tim_spmb"]);
    return reg;
  }

  async trackByNumber(regNum: string, parentId: string) {
    if (!parentId) {
      throw new ForbiddenException("Akses ditolak.");
    }

    const reg = await this.prisma.registration.findFirst({
      where: {
        registrationNumber: regNum.trim().toUpperCase(),
        parentId,
      },
      include: {
        period: true,
        studentData: true,
        payment: true,
        observationBooking: { include: { schedule: true } },
        observationResult: true,
        events: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!reg) throw new NotFoundException("Nomor pendaftaran tidak ditemukan.");

    return {
      registrationId: reg.id,
      registrationNumber: reg.registrationNumber,
      unitName: reg.period.unitName,
      unitSlug: reg.period.unitSlug,
      periodLabel: reg.period.label,
      studentName: reg.studentData?.fullName || "Calon Murid",
      status: reg.status,
      source: reg.source,
      fee: Number(reg.period.fee),
      bankName: reg.period.bankName,
      bankNumber: reg.period.bankNumber,
      bankHolder: reg.period.bankHolder,
      payment: reg.payment
        ? {
            status: reg.payment.status,
            amount: Number(reg.payment.amount),
            proofFileName: reg.payment.proofFileName,
          }
        : null,
      observationSchedule: reg.observationBooking?.schedule
        ? {
            date: reg.observationBooking.schedule.date.toISOString().slice(0, 10),
            startTime: reg.observationBooking.schedule.startTime,
            endTime: reg.observationBooking.schedule.endTime,
          }
        : null,
      observationResult: reg.observationResult
        ? {
            score: Number(reg.observationResult.score),
            rank: reg.observationResult.rank,
          }
        : null,
      handoffStatus: reg.handoffStatus,
      events: reg.events.map((e) => ({
        toStatus: e.toStatus,
        kind: e.kind,
        note: e.note,
        createdAt: e.createdAt,
      })),
    };
  }
}

