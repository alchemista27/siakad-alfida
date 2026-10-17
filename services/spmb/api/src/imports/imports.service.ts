import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BatchImportDto } from "./imports.dto";
import {
  RegistrationSource,
  RegistrationStatus,
  PaymentMethod,
  PaymentStatus,
  Gender,
} from "../generated/prisma";
import { randomUUID } from "crypto";
import { allowedUnitIds, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";
import { AdmissionCapacityService } from "../registrations/admission-capacity.service";
import {
  BackfillManifest,
  deriveStatusFromManifest,
  buildManifestEventTrail,
} from "./backfill-manifest.policy";

@Injectable()
export class ImportsService {
  private readonly capacityService: AdmissionCapacityService;

  constructor(
    private readonly prisma: PrismaService,
    capacityService?: AdmissionCapacityService,
  ) {
    this.capacityService = capacityService || new AdmissionCapacityService(prisma);
  }

  private assertExistingPeriodAccess(period: { unitId: string }, principal: SpmbPrincipal) {
    if (isSuperAdmin(principal) || allowedUnitIds(principal, ["admin_unit", "tim_ppdb"]).has(period.unitId)) return;
    throw new NotFoundException("Periode pendaftaran tidak ditemukan.");
  }

  private async findScopedPeriod(periodId: string, principal: SpmbPrincipal) {
    const period = await this.prisma.admissionPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new BadRequestException("Periode pendaftaran tidak ditemukan.");
    this.assertExistingPeriodAccess(period, principal);
    return period;
  }

  async preview(principal: SpmbPrincipal, dto: BatchImportDto) {
    const period = await this.findScopedPeriod(dto.periodId, principal);

    const existingRefs = new Set(
      (
        await this.prisma.registration.findMany({
          where: { periodId: dto.periodId, externalRef: { not: null } },
          select: { externalRef: true },
        })
      )
        .map((r) => r.externalRef)
        .filter(Boolean),
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

  async commit(principal: SpmbPrincipal, dto: BatchImportDto) {
    const period = await this.findScopedPeriod(dto.periodId, principal);
    const actorId = principal.id;

    let successCount = 0;
    let skippedCount = 0;
    const errors: Array<{ rowNumber: number; reason: string }> = [];
    const seenBatchRefs = new Set<string>();

    for (let i = 0; i < dto.rows.length; i++) {
      const row = dto.rows[i];
      const rowNum = i + 1;

      if (!row.studentName || !row.guardianName || !row.guardianPhone) {
        errors.push({ rowNumber: rowNum, reason: "Data wajib tidak lengkap" });
        continue;
      }

      if (row.externalRef) {
        if (seenBatchRefs.has(row.externalRef)) {
          errors.push({ rowNumber: rowNum, reason: `Nomor referensi ${row.externalRef} duplikat dalam berkas impor.` });
          continue;
        }
        const exists = await this.prisma.registration.findUnique({
          where: { periodId_externalRef: { periodId: dto.periodId, externalRef: row.externalRef } },
        });
        if (exists) {
          skippedCount++;
          continue;
        }
        seenBatchRefs.add(row.externalRef);
      }

      try {
        const manifest: BackfillManifest = row.manifest || {
          payment: row.isPaid ? { verified: true, paidAt: new Date().toISOString(), amount: row.paidAmount } : undefined,
          student: {
            fullName: row.studentName,
            gender: (row.gender as any) || "male",
            birthPlace: row.birthPlace || "Jakarta",
            birthDate: row.birthDate || "2018-01-01",
            address: "Data luring",
          },
          observation: row.observationScore !== undefined && row.observationScore !== null ? {
            scheduleId: "import-offline",
            score: row.observationScore,
            notes: row.observationNotes,
            observerId: actorId,
          } : undefined,
        };

        const targetStatus = deriveStatusFromManifest(manifest);

        const inviteToken = randomUUID().replace(/-/g, "");
        const inviteExpiresAt = new Date();
        inviteExpiresAt.setDate(inviteExpiresAt.getDate() + 30);

        await this.prisma.$transaction(async (tx) => {
          const { registrationNumber: regNum } = await this.capacityService.allocateRegistrationNumber(tx, dto.periodId);

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

          const isPaid = Boolean(manifest.payment?.verified || row.isPaid);
          await tx.payment.create({
            data: {
              registrationId: reg.id,
              amount: manifest.payment?.amount ?? row.paidAmount ?? period.fee,
              method: isPaid ? PaymentMethod.offline : PaymentMethod.transfer_proof,
              status: isPaid ? PaymentStatus.verified : PaymentStatus.pending,
              paidAt: isPaid ? new Date() : null,
              verifiedAt: isPaid ? new Date() : null,
              verifiedBy: isPaid ? actorId : null,
            },
          });

          if (manifest.documents && manifest.documents.length > 0) {
            for (const doc of manifest.documents) {
              await tx.document.create({
                data: {
                  registrationId: reg.id,
                  type: doc.type as any,
                  objectKey: doc.objectKey,
                  fileName: doc.fileName || doc.objectKey,
                  mimeType: doc.mimeType || "application/octet-stream",
                  fileSize: doc.fileSize || 0,
                },
              });
            }
          }

          const obs = manifest.observation || (row.observationScore !== undefined && row.observationScore !== null ? {
            score: row.observationScore,
            notes: row.observationNotes,
            observerId: actorId,
          } : null);
          if (obs) {
            await tx.observationResult.create({
              data: {
                registrationId: reg.id,
                observerId: obs.observerId || actorId,
                score: obs.score,
                notes: obs.notes || null,
              },
            });
          }

          const eventTrail = buildManifestEventTrail(
            manifest,
            `Impor batch data pendaftar luring. Baris ke-${rowNum}`,
          );
          for (const ev of eventTrail) {
            await tx.registrationEvent.create({
              data: {
                registrationId: reg.id,
                actorId,
                toStatus: ev.toStatus,
                kind: ev.kind,
                note: ev.note,
              },
            });
          }
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
