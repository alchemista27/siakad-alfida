import { Injectable, ConflictException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { SiakadAdmissionHandoffPayload } from "@alfida/contracts";

@Injectable()
export class AdmissionHandoffService {
  constructor(private readonly prisma: PrismaService) {}

  async receiveAdmissionHandoff(payload: SiakadAdmissionHandoffPayload) {
    // Check idempotency
    const existingReceiptByIdempotency = await this.prisma.admissionReceipt.findUnique({
      where: { idempotencyKey: payload.idempotencyKey },
    });

    if (existingReceiptByIdempotency) {
      return existingReceiptByIdempotency;
    }

    const existingByRegistration = await this.prisma.admissionReceipt.findUnique({
      where: { spmbRegistrationId: payload.spmbRegistrationId },
    });

    if (existingByRegistration) {
      throw new ConflictException("Pendaftaran SPMB ini telah diterima sebelumnya dengan kunci idempotensi berbeda");
    }

    return this.prisma.$transaction(async (tx) => {
      const receipt = await tx.admissionReceipt.create({
        data: {
          spmbRegistrationId: payload.spmbRegistrationId,
          registrationNumber: payload.registrationNumber,
          unitId: payload.unitId,
          academicYearId: payload.academicYearId,
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
          fullName: payload.student.fullName,
          gender: payload.student.gender,
          birthPlace: payload.student.birthPlace,
          birthDate: payload.student.birthDate ? new Date(payload.student.birthDate) : null,
          parentUserId: payload.parent.userId,
          parentName: payload.parent.fullName,
          parentPhone: payload.parent.phone,
          status: "active",
        },
      });

      await tx.enrollment.create({
        data: {
          studentId: student.id,
          academicYearId: payload.academicYearId,
          classId: null,
          status: "pending_placement",
        },
      });

      return receipt;
    });
  }
}
