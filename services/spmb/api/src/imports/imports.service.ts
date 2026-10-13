import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BatchImportDto, ImportRowDto } from "./imports.dto";
import {
  RegistrationSource,
  RegistrationStatus,
  PaymentMethod,
  PaymentStatus,
  Gender,
} from "../generated/prisma";
import { randomUUID } from "crypto";

@Injectable()
export class ImportsService {
  constructor(private readonly prisma: PrismaService) {}

  async preview(dto: BatchImportDto) {
    const period = await this.prisma.admissionPeriod.findUnique({
      where: { id: dto.periodId },
    });
    if (!period) throw new BadRequestException("Periode pendaftaran tidak ditemukan.");

    const existingRefs = new Set(
      (
        await this.prisma.registration.findMany({
          where: { periodId: dto.periodId, externalRef: { not: null } },
          select: { externalRef: true },
        })
      )
        .map((r) => r.externalRef)
        .filter(Boolean)
    );

    const previewRows = dto.rows.map((row, index) => {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!row.studentName) errors.push("Nama siswa wajib diisi");
      if (!row.guardianName) errors.push("Nama orang tua/wali wajib diisi");
      if (!row.guardianPhone) errors.push("Nomor telepon/HP wali wajib diisi");

      if (row.externalRef && existingRefs.has(row.externalRef)) {
        warnings.push(`Nomor referensi ${row.externalRef} sudah terdaftar sebelumnya (akan dilewati jika diimpor)`);
      }

      return {
        rowNumber: index + 1,
        data: row,
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    });

    const totalValid = previewRows.filter((r) => r.isValid && r.warnings.length === 0).length;
    const totalWarnings = previewRows.filter((r) => r.warnings.length > 0).length;
    const totalErrors = previewRows.filter((r) => !r.isValid).length;

    return {
      period: { id: period.id, unitName: period.unitName, label: period.label },
      summary: { total: dto.rows.length, totalValid, totalWarnings, totalErrors },
      rows: previewRows,
    };
  }

  async commit(actorId: string, dto: BatchImportDto) {
    const period = await this.prisma.admissionPeriod.findUnique({
      where: { id: dto.periodId },
    });
    if (!period) throw new BadRequestException("Periode pendaftaran tidak ditemukan.");

    let successCount = 0;
    let skippedCount = 0;
    const errors: Array<{ rowNumber: number; reason: string }> = [];

    let currentTotal = await this.prisma.registration.count({
      where: { periodId: dto.periodId },
    });

    for (let i = 0; i < dto.rows.length; i++) {
      const row = dto.rows[i];
      const rowNum = i + 1;

      if (!row.studentName || !row.guardianName || !row.guardianPhone) {
        errors.push({ rowNumber: rowNum, reason: "Data wajib tidak lengkap" });
        continue;
      }

      if (row.externalRef) {
        const exists = await this.prisma.registration.findUnique({
          where: {
            periodId_externalRef: {
              periodId: dto.periodId,
              externalRef: row.externalRef,
            },
          },
        });
        if (exists) {
          skippedCount++;
          continue;
        }
      }

      try {
        currentTotal++;
        const seq = String(currentTotal).padStart(4, "0");
        const yearStr = period.label.split("/")[0] || String(new Date().getFullYear());
        const slugUpper = period.unitSlug.toUpperCase().substring(0, 8);
        const regNum = `PPDB-${slugUpper}-${yearStr}-${seq}`;

        const inviteToken = randomUUID().replace(/-/g, "");
        const inviteExpiresAt = new Date();
        inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30);

        let targetStatus: RegistrationStatus = RegistrationStatus.pending_payment;
        if (row.status && Object.values(RegistrationStatus).includes(row.status as any)) {
          targetStatus = row.status as RegistrationStatus;
        } else if (row.isPaid) {
          targetStatus = RegistrationStatus.payment_verified;
        }

        await this.prisma.$transaction(async (tx) => {
          const reg = await tx.registration.create({
            data: {
              periodId: period.id,
              registrationNumber: regNum,
              source: RegistrationSource.offline,
              externalRef: row.externalRef || null,
              status: targetStatus,
              guardianName: row.guardianName,
              guardianPhone: row.guardianPhone,
              guardianEmail: row.guardianEmail || null,
              inviteToken,
              inviteExpiresAt,
              createdById: actorId,
            },
          });

          await tx.studentData.create({
            data: {
              registrationId: reg.id,
              fullName: row.studentName,
              gender: (row.gender as Gender) || Gender.male,
              birthPlace: row.birthPlace || "Jakarta",
              birthDate: row.birthDate ? new Date(row.birthDate) : new Date("2018-01-01"),
              address: "Data luring",
            },
          });

          await tx.payment.create({
            data: {
              registrationId: reg.id,
              amount: row.paidAmount ?? period.fee,
              method: row.isPaid ? PaymentMethod.offline : PaymentMethod.transfer_proof,
              status: row.isPaid ? PaymentStatus.verified : PaymentStatus.pending,
              paidAt: row.isPaid ? new Date() : null,
              verifiedAt: row.isPaid ? new Date() : null,
              verifiedBy: row.isPaid ? actorId : null,
            },
          });

          if (row.observationScore !== undefined && row.observationScore !== null) {
            await tx.observationResult.create({
              data: {
                registrationId: reg.id,
                observerId: actorId,
                score: row.observationScore,
                notes: row.observationNotes || null,
              },
            });
          }

          await tx.registrationEvent.create({
            data: {
              registrationId: reg.id,
              actorId,
              toStatus: targetStatus,
              kind: "import",
              note: `Impor batch data pendaftar luring. Baris ke-${rowNum}`,
            },
          });
        });

        successCount++;
      } catch (err: any) {
        errors.push({ rowNumber: rowNum, reason: err?.message || "Kesalahan penyimpanan database" });
      }
    }

    return {
      success: true,
      totalProcessed: dto.rows.length,
      successCount,
      skippedCount,
      errorCount: errors.length,
      errors,
    };
  }
}
