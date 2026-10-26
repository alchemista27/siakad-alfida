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
} from "../generated/prisma";

import {
  CreateSpmbDraftSchema,
  isStudentRegistrationComplete,
  ParentRegistrationFormSchema,
  StudentRegistrationFormSchema,
} from "@alfida/contracts";
import { canTransition, requiredDocumentTypes } from "../common/ppdb-workflow";
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

  private sanitizeForParent(registration: any) {
    if (!registration) return null;
    const { handoffError, ...rest } = registration;
    const sanitized: any = { ...rest };
    if (Array.isArray(registration.documents)) {
      sanitized.documents = registration.documents.map(({ objectKey, ...doc }: any) => doc);
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
    return registrations.map((reg) => (reg && ("handoffError" in reg || "observationResult" in reg || "documents" in reg) ? this.sanitizeForParent(reg) : reg));
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
    const reg = await this.prisma.registration.findUnique({ where: { id: registrationId } });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId !== userId) {
      throw new ForbiddenException("Anda tidak berhak mengisi data pendaftaran ini.");
    }
    if (!([RegistrationStatus.payment_verified, RegistrationStatus.form_filling] as RegistrationStatus[]).includes(reg.status)) {
      throw new BadRequestException("Tahap pendaftaran saat ini tidak dapat mengisi biodata siswa.");
    }

    if (ACTIVE_REGISTRATION_POLICY === "multiple_child_applications") {
      const duplicate = await this.prisma.registration.findFirst({
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
        throw new BadRequestException("Calon siswa tersebut sudah memiliki pendaftaran aktif pada periode ini.");
      }
    }

    await this.prisma.studentData.upsert({
      where: { registrationId },
      update: {
        fullName: payload.fullName,
        nickname: payload.nickname,
        gender: payload.gender as Gender,
        religion: payload.religion,
        birthPlace: payload.birthPlace,
        birthDate: new Date(payload.birthDate),
        nisn: payload.nisn || null,
        siblingsCount: payload.siblingsCount,
        address: payload.address,
        transportation: payload.transportation,
      },
      create: {
        registrationId,
        fullName: payload.fullName,
        nickname: payload.nickname,
        gender: payload.gender as Gender,
        religion: payload.religion,
        birthPlace: payload.birthPlace,
        birthDate: new Date(payload.birthDate),
        nisn: payload.nisn || null,
        siblingsCount: payload.siblingsCount,
        address: payload.address,
        transportation: payload.transportation,
      },
    });

    if (reg.status === RegistrationStatus.payment_verified && canTransition(reg.status, "form_filling")) {
      await this.prisma.registration.update({
        where: { id: registrationId },
        data: { status: RegistrationStatus.form_filling },
      });
      await this.prisma.registrationEvent.create({
        data: {
          registrationId,
          actorId: userId,
          fromStatus: reg.status,
          toStatus: RegistrationStatus.form_filling,
          kind: "transition",
          note: "Pengisian formulir data siswa selesai",
        },
      });
    }

    return { success: true };
  }

  async submitParentData(registrationId: string, userId: string, dto: SubmitParentDataDto) {
    const payload = this.parseOrThrow(ParentRegistrationFormSchema, dto);
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { studentData: true },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId !== userId) {
      throw new ForbiddenException("Anda tidak berhak mengisi data pendaftaran ini.");
    }
    if (reg.status !== RegistrationStatus.form_filling || !canTransition(reg.status, "documents_uploaded")) {
      throw new BadRequestException("Data orang tua hanya dapat diisi setelah biodata siswa selesai.");
    }
    if (!isStudentRegistrationComplete(reg.studentData)) {
      throw new BadRequestException("Lengkapi seluruh formulir data siswa sebelum mengisi data orang tua.");
    }

    const parentsToUpsert = [
      {
        registrationId,
        type: ParentType.father,
        fullName: payload.father.fullName,
        nik: payload.father.nik,
        birthPlace: payload.father.birthPlace,
        birthDate: new Date(payload.father.birthDate),
        education: payload.father.education,
        occupation: payload.father.occupation,
        phone: payload.father.phone,
        incomeRange: payload.father.incomeRange,
        address: payload.father.address,
      },
      {
        registrationId,
        type: ParentType.mother,
        fullName: payload.mother.fullName,
        nik: payload.mother.nik,
        birthPlace: payload.mother.birthPlace,
        birthDate: new Date(payload.mother.birthDate),
        education: payload.mother.education,
        occupation: payload.mother.occupation,
        phone: payload.mother.phone,
        incomeRange: payload.mother.incomeRange,
        address: payload.mother.address,
      },
    ];

    await this.prisma.$transaction(async (tx) => {
      await tx.parentData.deleteMany({ where: { registrationId } });
      for (const parentData of parentsToUpsert) {
        await tx.parentData.create({ data: parentData });
      }
    });

    await this.prisma.registration.update({
      where: { id: registrationId },
      data: { status: RegistrationStatus.documents_uploaded },
    });
    await this.prisma.registrationEvent.create({
      data: {
        registrationId,
        actorId: userId,
        fromStatus: reg.status,
        toStatus: RegistrationStatus.documents_uploaded,
        kind: "transition",
        note: "Formulir orang tua tersimpan, menuju unggah berkas",
      },
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
    assertUnitAccess(principal, reg.period.unitId, ["admin_unit", "tim_ppdb"]);
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
      assertUnitAccess(principal, registration.period.unitId, ["admin_unit", "tim_ppdb"]);
      if (typeof isApproved !== "boolean") {
        throw new BadRequestException("isApproved harus bernilai boolean.");
      }
      if (registration.status !== RegistrationStatus.verification) {
        throw new BadRequestException("Berkas hanya dapat diverifikasi setelah pemeriksaan kesehatan selesai.");
      }

      if (!isApproved) {
        const note = rejectionNote?.trim();
        if (!note || note.length < 3) {
          throw new BadRequestException("Catatan revisi minimal 3 karakter.");
        }
        if (!canTransition(registration.status, "documents_uploaded")) {
          throw new BadRequestException("Tahap pendaftaran saat ini tidak dapat dikembalikan untuk perbaikan berkas.");
        }
        const updated = await tx.registration.update({
          where: { id: registrationId },
          data: {
            status: RegistrationStatus.documents_uploaded,
            dossierReviewStatus: DossierReviewStatus.revision_required,
            rejectionReason: note,
          },
        });
        await tx.registrationEvent.create({
          data: {
            registrationId,
            actorId: principal.id,
            fromStatus: registration.status,
            toStatus: RegistrationStatus.documents_uploaded,
            kind: "verification_rejected",
            note,
          },
        });
        return {
          success: true,
          verified: false,
          dossierReviewStatus: updated.dossierReviewStatus,
          nextStage: RegistrationStatus.documents_uploaded,
        };
      }

      const uploadedTypes = new Set(registration.documents.map((document) => document.type));
      const missingTypes = requiredDocumentTypes.filter((type) => !uploadedTypes.has(type));
      if (missingTypes.length > 0) {
        throw new BadRequestException(`Dokumen wajib belum lengkap: ${missingTypes.join(", ")}.`);
      }

      const updated = await tx.registration.update({
        where: { id: registrationId },
        data: {
          status: RegistrationStatus.verification,
          dossierReviewStatus: DossierReviewStatus.approved,
          rejectionReason: null,
        },
      });
      await tx.registrationEvent.create({
        data: {
          registrationId,
          actorId: principal.id,
          fromStatus: registration.status,
          toStatus: registration.status,
          kind: "verification_approved",
          note: "Berkas dan hasil kesehatan telah diverifikasi panitia. Orang tua dapat memilih jadwal observasi.",
        },
      });
      return {
        success: true,
        verified: true,
        dossierReviewStatus: updated.dossierReviewStatus,
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
      const unitIds = [...allowedUnitIds(principal, ["admin_unit", "tim_ppdb"])];
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
    assertUnitAccess(principal, reg.period.unitId, ["admin_unit", "tim_ppdb"]);
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
      studentName: reg.studentData?.fullName || "Calon Siswa",
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

