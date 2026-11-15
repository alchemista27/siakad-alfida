import { Injectable, ConflictException, BadRequestException, Logger } from "@nestjs/common";
import { createHash } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import type { SpmbHandoffPayload, SpmbHandoffReceipt, UnitProjectionPayload, UserProjectionPayload } from "@alfida/contracts";

@Injectable()
export class InternalService {
  private readonly logger = new Logger(InternalService.name);

  constructor(private readonly prisma: PrismaService) {}

  private payloadHash(payload: SpmbHandoffPayload) {
    return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
  }

  private async receiptForExisting(existingReceipt: any, payload: SpmbHandoffPayload): Promise<SpmbHandoffReceipt> {
    if (existingReceipt.payloadHash && existingReceipt.payloadHash !== this.payloadHash(payload)) {
      throw new ConflictException("Kunci idempotensi handoff sudah digunakan untuk payload berbeda.");
    }

    let destinationEnrollmentId = existingReceipt.enrollmentId;
    if (!destinationEnrollmentId) {
      const student = await this.prisma.student.findUnique({
        where: { admissionReceiptId: existingReceipt.id },
        select: { id: true },
      });
      if (student) {
        const enrollment = await this.prisma.enrollment.findFirst({
          where: { studentId: student.id, academicYearId: existingReceipt.academicYearId },
          select: { id: true },
        });
        destinationEnrollmentId = enrollment?.id;
      }
    }
    if (!destinationEnrollmentId) {
      throw new ConflictException("Tanda terima handoff tidak memiliki enrollment tujuan yang dapat diverifikasi.");
    }

    return {
      receiptId: existingReceipt.id,
      sourceRegistrationId: payload.spmbRegistrationId,
      destinationEnrollmentId,
      status: "accepted",
    };
  }

  async receiveSpmbHandoff(payload: SpmbHandoffPayload): Promise<SpmbHandoffReceipt> {
    this.logger.log(`Menerima SPMB handoff untuk pendaftaran ${payload.registrationNumber} (${payload.spmbRegistrationId})`);
    const payloadHash = this.payloadHash(payload);

    const existingReceiptByIdempotency = await this.prisma.admissionReceipt.findUnique({
      where: { idempotencyKey: payload.idempotencyKey },
    });
    if (existingReceiptByIdempotency) {
      this.logger.log(`Handoff sudah diproses sebelumnya dengan kunci idempotensi ${payload.idempotencyKey}`);
      return this.receiptForExisting(existingReceiptByIdempotency, payload);
    }

    const existingByRegistration = await this.prisma.admissionReceipt.findUnique({
      where: { spmbRegistrationId: payload.spmbRegistrationId },
    });

    if (existingByRegistration) {
      throw new ConflictException(
        "Pendaftaran SPMB ini telah diterima sebelumnya dengan kunci idempotensi berbeda",
      );
    }

    const unit = await this.prisma.unitProjection.findUnique({
      where: { id: payload.unitId },
      select: { id: true, status: true, category: true },
    });
    if (!unit || unit.status !== "active" || unit.category !== "pendidikan") {
      throw new BadRequestException("Unit tujuan SIAKAD tidak aktif atau bukan unit pendidikan.");
    }

    const targetAcademicYear = await this.prisma.academicYear.findFirst({
      where: {
        id: payload.sourceAcademicYearId,
        unitId: payload.unitId,
      },
      select: { id: true },
    });
    if (!targetAcademicYear) {
      throw new BadRequestException("Tahun akademik sumber belum diproyeksikan untuk unit tujuan SIAKAD.");
    }
    const targetAcademicYearId = targetAcademicYear.id;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const receipt = await tx.admissionReceipt.create({
          data: {
            spmbRegistrationId: payload.spmbRegistrationId,
            registrationNumber: payload.registrationNumber,
            unitId: payload.unitId,
            academicYearId: targetAcademicYearId,
            idempotencyKey: payload.idempotencyKey,
            status: "processed",
            payload: payload as any,
            payloadHash,
            processedAt: new Date(),
          },
        });

        const dapodik = payload.student.dapodik;
        const student = await tx.student.create({
          data: {
            admissionReceiptId: receipt.id,
            unitId: payload.unitId,
            nisn: payload.student.nisn || null,
            fullName: payload.student.fullName,
            gender: payload.student.gender,
            birthPlace: payload.student.birthPlace,
            birthDate: new Date(payload.student.birthDate),
            parentUserId: payload.portalParent.id,
            parentName: payload.portalParent.fullName,
            parentPhone: payload.portalParent.phone || null,
            nickname: payload.student.nickname,
            religion: payload.student.religion,
            address: payload.student.address,
            siblingsCount: payload.student.siblingsCount,
            transportation: payload.student.transportation,
            hobby: payload.student.hobby,
            ambition: payload.student.ambition,
            ...dapodik,
            status: "active",
          },
        });

        if (payload.guardians.length > 0) {
          await tx.studentGuardian.createMany({
            data: payload.guardians.map((guardian) => ({
              studentId: student.id,
              type: guardian.type,
              fullName: guardian.fullName,
              nik: guardian.nik,
              birthPlace: guardian.birthPlace,
              birthDate: guardian.birthDate ? new Date(guardian.birthDate) : null,
              education: guardian.education,
              occupation: guardian.occupation,
              phone: guardian.phone,
              incomeRange: guardian.incomeRange,
              address: guardian.address,
            })),
          });
        }

        const enrollment = await tx.enrollment.create({
          data: {
            studentId: student.id,
            academicYearId: targetAcademicYearId,
            classId: null,
            status: "pending_placement",
          },
        });
        await tx.admissionReceipt.update({
          where: { id: receipt.id },
          data: { enrollmentId: enrollment.id },
        });

        return {
          receiptId: receipt.id,
          sourceRegistrationId: payload.spmbRegistrationId,
          destinationEnrollmentId: enrollment.id,
          status: "accepted" as const,
        };
      });
    } catch (error: any) {
      if (error?.code === "P2002") {
        const concurrentReceipt = await this.prisma.admissionReceipt.findUnique({
          where: { idempotencyKey: payload.idempotencyKey },
        });
        if (concurrentReceipt) return this.receiptForExisting(concurrentReceipt, payload);
      }
      throw error;
    }
  }

  async receiveUnitProjection(payload: UnitProjectionPayload) {
    const incomingUpdatedAt = new Date(payload.sourceUpdatedAt);
    const existing = await this.prisma.unitProjection.findUnique({ where: { id: payload.id } });
    if (existing?.sourceUpdatedAt && existing.sourceUpdatedAt >= incomingUpdatedAt) {
      return { status: "stale" as const, unit: existing };
    }

    const unit = await this.prisma.unitProjection.upsert({
      where: { id: payload.id },
      create: {
        id: payload.id,
        name: payload.name,
        slug: payload.slug,
        status: payload.status,
        category: payload.category,
        sourceUpdatedAt: incomingUpdatedAt,
      },
      update: {
        name: payload.name,
        slug: payload.slug,
        status: payload.status,
        category: payload.category,
        sourceUpdatedAt: incomingUpdatedAt,
      },
    });
    return { status: "applied" as const, unit };
  }

  async receiveUserProjection(payload: UserProjectionPayload) {
    const incomingUpdatedAt = new Date(payload.sourceUpdatedAt);
    const existing = await this.prisma.userProjection.findUnique({ where: { id: payload.id } });
    if (existing?.sourceUpdatedAt && existing.sourceUpdatedAt >= incomingUpdatedAt) {
      return { status: "stale" as const, user: existing };
    }

    const user = await this.prisma.userProjection.upsert({
      where: { id: payload.id },
      create: {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        roles: payload.roles,
        status: payload.status,
        sourceUpdatedAt: incomingUpdatedAt,
      },
      update: {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        roles: payload.roles,
        status: payload.status,
        sourceUpdatedAt: incomingUpdatedAt,
      },
    });
    return { status: "applied" as const, user };
  }

  async getUnits() {
    if (this.prisma.unitProjection?.findMany) {
      return this.prisma.unitProjection.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
        },
        orderBy: { name: "asc" },
      });
    }
    return [];
  }
}
