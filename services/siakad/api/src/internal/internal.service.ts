import { Injectable, ConflictException, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { SpmbHandoffPayload, SpmbHandoffReceipt } from "@alfida/contracts";

@Injectable()
export class InternalService {
  private readonly logger = new Logger(InternalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async receiveSpmbHandoff(payload: SpmbHandoffPayload): Promise<SpmbHandoffReceipt> {
    this.logger.log(`Menerima SPMB handoff untuk pendaftaran ${payload.registrationNumber} (${payload.spmbRegistrationId})`);

    // 1. Cek idempotensi berdasarkan idempotencyKey
    const existingReceiptByIdempotency = await this.prisma.admissionReceipt.findUnique({
      where: { idempotencyKey: payload.idempotencyKey },
    });

    if (existingReceiptByIdempotency) {
      this.logger.log(`Handoff sudah diproses sebelumnya dengan kunci idempotensi ${payload.idempotencyKey}`);
      let destinationEnrollmentId: string = existingReceiptByIdempotency.id;

      if (this.prisma.student?.findFirst) {
        const student = await this.prisma.student.findFirst({
          where: { admissionReceiptId: existingReceiptByIdempotency.id },
        });

        if (student && this.prisma.enrollment?.findFirst) {
          const enrollment = await this.prisma.enrollment.findFirst({
            where: { studentId: student.id },
          });
          if (enrollment) {
            destinationEnrollmentId = enrollment.id;
          }
        }
      }

      return {
        receiptId: existingReceiptByIdempotency.id,
        sourceRegistrationId: payload.spmbRegistrationId,
        destinationEnrollmentId,
        status: "accepted",
      };
    }

    // 2. Cek apakah registration ID sudah pernah diterima dengan kunci berbeda
    const existingByRegistration = await this.prisma.admissionReceipt.findUnique({
      where: { spmbRegistrationId: payload.spmbRegistrationId },
    });

    if (existingByRegistration) {
      throw new ConflictException(
        "Pendaftaran SPMB ini telah diterima sebelumnya dengan kunci idempotensi berbeda",
      );
    }

    // 3. Resolusi Tahun Akademik target di SIAKAD
    let targetAcademicYearId = payload.sourceAcademicYearId;
    if (this.prisma.academicYear?.findFirst) {
      const matchedAy = await this.prisma.academicYear.findFirst({
        where: {
          id: payload.sourceAcademicYearId,
          unitId: payload.unitId,
        },
      });

      if (matchedAy) {
        targetAcademicYearId = matchedAy.id;
      } else {
        const activeAy = await this.prisma.academicYear.findFirst({
          where: {
            unitId: payload.unitId,
            status: "active",
          },
        });
        if (activeAy) {
          targetAcademicYearId = activeAy.id;
        } else {
          const anyAy = await this.prisma.academicYear.findFirst({
            where: { unitId: payload.unitId },
          });
          if (anyAy) {
            targetAcademicYearId = anyAy.id;
          }
        }
      }
    }

    // 4. Eksekusi penyimpanan dalam transaksi atomik
    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.admissionReceipt.create({
        data: {
          spmbRegistrationId: payload.spmbRegistrationId,
          registrationNumber: payload.registrationNumber,
          unitId: payload.unitId,
          academicYearId: targetAcademicYearId,
          idempotencyKey: payload.idempotencyKey,
          status: "processed",
          payload: payload as any,
          processedAt: new Date(),
        },
      });

      const student = await tx.student.create({
        data: {
          admissionReceiptId: receipt.id,
          unitId: payload.unitId,
          nisn: payload.student.nisn || null,
          fullName: payload.student.fullName,
          gender: payload.student.gender,
          birthPlace: payload.student.birthPlace,
          birthDate: payload.student.birthDate ? new Date(payload.student.birthDate) : null,
          parentUserId: payload.parent.id,
          parentName: payload.parent.fullName,
          parentPhone: payload.parent.phone || null,
          status: "active",
        },
      });

      const enrollment = await tx.enrollment.create({
        data: {
          studentId: student.id,
          academicYearId: targetAcademicYearId,
          classId: null,
          status: "pending_placement",
        },
      });

      return {
        receiptId: receipt.id,
        sourceRegistrationId: payload.spmbRegistrationId,
        destinationEnrollmentId: enrollment.id,
        status: "accepted" as const,
      };
    });
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
