import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import {
  CreateOnlineRegistrationDto,
  CreateOfflineRegistrationDto,
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
} from "../generated/prisma";
import { randomUUID } from "crypto";

@Injectable()
export class RegistrationsService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= ALUR ONLINE (ORANG TUA) =================
  async getActiveRegistrationForParent(parentId: string) {
    return this.prisma.registration.findFirst({
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
        observationBooking: {
          include: { schedule: true },
        },
        observationResult: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createOnline(parentId: string, dto: CreateOnlineRegistrationDto) {
    return this.prisma.$transaction(async (tx) => {
      const period = await tx.admissionPeriod.findUnique({
        where: { id: dto.periodId },
      });
      if (!period || !period.isOpen) {
        throw new BadRequestException("Periode pendaftaran tidak aktif atau telah ditutup.");
      }

      // Pastikan orang tua belum memiliki pendaftaran aktif di periode ini
      const existing = await tx.registration.findFirst({
        where: {
          parentId,
          periodId: dto.periodId,
          status: { notIn: [RegistrationStatus.rejected] },
        },
      });
      if (existing) {
        throw new BadRequestException("Anda sudah memiliki berkas pendaftaran aktif pada periode ini.");
      }

      // Cek kuota
      const totalRegistered = await tx.registration.count({
        where: { periodId: dto.periodId },
      });
      if (totalRegistered >= period.quota) {
        throw new BadRequestException("Mohon maaf, kuota pendaftaran pada unit ini telah penuh.");
      }

      const seq = String(totalRegistered + 1).padStart(4, "0");
      const yearStr = period.label.split("/")[0] || String(new Date().getFullYear());
      const slugUpper = period.unitSlug.toUpperCase().substring(0, 8);
      const regNum = `PPDB-${slugUpper}-${yearStr}-${seq}`;

      const reg = await tx.registration.create({
        data: {
          periodId: period.id,
          registrationNumber: regNum,
          parentId,
          source: RegistrationSource.online,
          status: RegistrationStatus.pending_payment,
        },
      });

      // Buat tagihan pembayaran
      await tx.payment.create({
        data: {
          registrationId: reg.id,
          amount: period.fee,
          method: PaymentMethod.transfer_proof,
          status: PaymentStatus.pending,
        },
      });

      // Audit log event
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

  // ================= ALUR OFFLINE / MANUAL ENTRY (ADMIN UNIT) =================
  async createOffline(actorId: string, dto: CreateOfflineRegistrationDto) {
    return this.prisma.$transaction(async (tx) => {
      const period = await tx.admissionPeriod.findUnique({
        where: { id: dto.periodId },
      });
      if (!period) {
        throw new BadRequestException("Periode pendaftaran tidak ditemukan.");
      }

      const totalRegistered = await tx.registration.count({
        where: { periodId: dto.periodId },
      });
      const seq = String(totalRegistered + 1).padStart(4, "0");
      const yearStr = period.label.split("/")[0] || String(new Date().getFullYear());
      const slugUpper = period.unitSlug.toUpperCase().substring(0, 8);
      const regNum = `PPDB-${slugUpper}-${yearStr}-${seq}`;

      const inviteToken = randomUUID().replace(/-/g, "");
      const inviteExpiresAt = new Date();
      inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30); // 30 hari

      const targetStatus = dto.initialStatus || RegistrationStatus.pending_payment;

      const reg = await tx.registration.create({
        data: {
          periodId: period.id,
          registrationNumber: regNum,
          source: RegistrationSource.offline,
          externalRef: dto.externalRef || null,
          status: targetStatus,
          guardianName: dto.guardianName,
          guardianPhone: dto.guardianPhone,
          guardianEmail: dto.guardianEmail || null,
          inviteToken,
          inviteExpiresAt,
          createdById: actorId,
        },
      });

      // Jika data siswa disertakan
      if (dto.student) {
        await tx.studentData.create({
          data: {
            registrationId: reg.id,
            fullName: dto.student.fullName,
            nickname: dto.student.nickname || null,
            gender: dto.student.gender as Gender,
            birthPlace: dto.student.birthPlace,
            birthDate: new Date(dto.student.birthDate),
            nisn: dto.student.nisn || null,
            address: dto.student.address,
          },
        });
      }

      // Pembayaran offline jika ada
      await tx.payment.create({
        data: {
          registrationId: reg.id,
          amount: dto.paidAmount ?? period.fee,
          method: dto.isPaid ? PaymentMethod.offline : PaymentMethod.transfer_proof,
          status: dto.isPaid ? PaymentStatus.verified : PaymentStatus.pending,
          paidAt: dto.isPaid ? (dto.paidDate ? new Date(dto.paidDate) : new Date()) : null,
          verifiedAt: dto.isPaid ? new Date() : null,
          verifiedBy: dto.isPaid ? actorId : null,
        },
      });

      // Hasil observasi luring jika ada
      if (dto.observationScore !== undefined && dto.observationScore !== null) {
        await tx.observationResult.create({
          data: {
            registrationId: reg.id,
            observerId: actorId,
            score: dto.observationScore,
            notes: dto.observationNotes || null,
          },
        });
      }

      // Audit log event
      await tx.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId,
          toStatus: targetStatus,
          kind: "backfill",
          note: `Entri data pendaftar luring oleh admin unit. Ref: ${dto.externalRef || "-"}`,
        },
      });

      return reg;
    });
  }

  // ================= FORM SUBMISSIONS =================
  async submitStudentData(registrationId: string, userId: string, dto: SubmitStudentDataDto) {
    const reg = await this.prisma.registration.findUnique({ where: { id: registrationId } });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId && reg.parentId !== userId) {
      throw new ForbiddenException("Anda tidak berhak mengisi data pendaftaran ini.");
    }

    await this.prisma.studentData.upsert({
      where: { registrationId },
      update: {
        fullName: dto.fullName,
        nickname: dto.nickname || null,
        gender: dto.gender as Gender,
        birthPlace: dto.birthPlace,
        birthDate: new Date(dto.birthDate),
        nisn: dto.nisn || null,
        siblingsCount: dto.siblingsCount ?? 0,
        address: dto.address,
        transportation: dto.transportation || null,
        hobby: dto.hobby || null,
        ambition: dto.ambition || null,
      },
      create: {
        registrationId,
        fullName: dto.fullName,
        nickname: dto.nickname || null,
        gender: dto.gender as Gender,
        birthPlace: dto.birthPlace,
        birthDate: new Date(dto.birthDate),
        nisn: dto.nisn || null,
        siblingsCount: dto.siblingsCount ?? 0,
        address: dto.address,
        transportation: dto.transportation || null,
        hobby: dto.hobby || null,
        ambition: dto.ambition || null,
      },
    });

    if (reg.status === RegistrationStatus.payment_verified) {
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
    const reg = await this.prisma.registration.findUnique({ where: { id: registrationId } });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId && reg.parentId !== userId) {
      throw new ForbiddenException("Anda tidak berhak mengisi data pendaftaran ini.");
    }

    const parentsToUpsert: any[] = [];
    if (dto.father) {
      parentsToUpsert.push({
        registrationId,
        type: ParentType.father,
        fullName: dto.father.fullName,
        nik: dto.father.nik || null,
        birthPlace: dto.father.birthPlace || null,
        birthDate: dto.father.birthDate ? new Date(dto.father.birthDate) : null,
        education: dto.father.education || null,
        occupation: dto.father.occupation || null,
        phone: dto.father.phone || null,
        incomeRange: dto.father.incomeRange || null,
        address: dto.father.address || null,
      });
    }
    if (dto.mother) {
      parentsToUpsert.push({
        registrationId,
        type: ParentType.mother,
        fullName: dto.mother.fullName,
        nik: dto.mother.nik || null,
        birthPlace: dto.mother.birthPlace || null,
        birthDate: dto.mother.birthDate ? new Date(dto.mother.birthDate) : null,
        education: dto.mother.education || null,
        occupation: dto.mother.occupation || null,
        phone: dto.mother.phone || null,
        incomeRange: dto.mother.incomeRange || null,
        address: dto.mother.address || null,
      });
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.parentData.deleteMany({ where: { registrationId } });
      for (const p of parentsToUpsert) {
        await tx.parentData.create({ data: p });
      }
    });

    const hasStudent = await this.prisma.studentData.findUnique({ where: { registrationId } });
    if (hasStudent && (reg.status === RegistrationStatus.form_filling || reg.status === RegistrationStatus.payment_verified)) {
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
    }

    return { success: true };
  }

  // ================= PEMBAYARAN =================
  async uploadPayment(registrationId: string, userId: string, dto: UploadPaymentDto) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: { period: true },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");
    if (reg.parentId && reg.parentId !== userId) {
      throw new ForbiddenException("Akses ditolak.");
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

  async verifyPayment(registrationId: string, actorId: string, dto: VerifyPaymentDto) {
    const reg = await this.prisma.registration.findUnique({ where: { id: registrationId } });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");

    const newStatus = dto.isApproved
      ? RegistrationStatus.payment_verified
      : RegistrationStatus.pending_payment;

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

  // ================= ADMIN LIST & DETAIL =================
  async findAll(query: { periodId?: string; status?: RegistrationStatus; source?: RegistrationSource; search?: string }) {
    const where: any = {};
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

  async findOne(id: string) {
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
    return reg;
  }

  async trackByNumber(regNum: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { registrationNumber: regNum.trim().toUpperCase() },
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
            proofUrl: reg.payment.proofUrl,
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

