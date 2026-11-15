import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SyncHandoffDto, BatchSyncHandoffDto, ConfirmEnrollmentDto } from "./handoff.dto";
import { HandoffStatus, RegistrationStatus, Prisma } from "../generated/prisma";
import { allowedUnitIds, isSuperAdmin, type SpmbPrincipal } from "../common/spmb-scope-policy";
import {
  SpmbHandoffPayloadSchema,
  SpmbHandoffReceiptSchema,
  SpmbEnrollmentConfirmationSchema,
  type SpmbHandoffReceipt,
} from "@alfida/contracts";
import { randomUUID } from "crypto";
import { buildSpmbHandoffPayload, hashSpmbHandoffPayload } from "./spmb-handoff-payload";

@Injectable()
export class HandoffService {
  private readonly logger = new Logger(HandoffService.name);

  constructor(private readonly prisma: PrismaService) {}

  private assertExistingPeriodAccess(period: { unitId: string }, principal: SpmbPrincipal) {
    if (isSuperAdmin(principal) || allowedUnitIds(principal, ["admin_unit", "tim_spmb"]).has(period.unitId)) return;
    throw new NotFoundException("Pendaftaran tidak ditemukan");
  }

  private async findScopedPeriod(periodId: string, principal: SpmbPrincipal) {
    const period = await this.prisma.admissionPeriod.findUnique({ where: { id: periodId } });
    if (!period) throw new NotFoundException("Periode pendaftaran tidak ditemukan");
    this.assertExistingPeriodAccess(period, principal);
    return period;
  }

  private async findScopedRegistration(registrationId: string, principal: SpmbPrincipal) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        parent: true,
        studentData: true,
        parentData: true,
        period: true,
      },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");
    this.assertExistingPeriodAccess(reg.period, principal);
    return reg;
  }


  async deliverOutbox(registrationId: string, options?: { principal?: SpmbPrincipal }) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        parent: true,
        studentData: true,
        parentData: true,
        period: true,
      },
    });
    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan");
    if (options?.principal) {
      this.assertExistingPeriodAccess(reg.period, options.principal);
    }

    if (reg.status !== "accepted") {
      throw new BadRequestException("Hanya pendaftar berstatus 'accepted' yang dapat diserahkan ke SIAKAD");
    }
    if (!reg.parent || !reg.studentData) {
      throw new BadRequestException("Pendaftaran harus memiliki identitas orang tua dan biodata murid sebelum handoff.");
    }

    const siakadApiUrl = process.env.INTERNAL_SIAKAD_API_URL?.trim();
    const secretKey = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!siakadApiUrl || !secretKey) {
      throw new BadRequestException("Konfigurasi handoff SIAKAD belum lengkap.");
    }

    // New accepted decisions snapshot the payload atomically. This fallback only
    // upgrades pre-v2 rows that were created before the snapshot migration.
    let outbox: any = null;
    if (this.prisma.handoffOutbox?.findUnique) {
      outbox = await this.prisma.handoffOutbox.findUnique({
        where: { registrationId: reg.id },
      });
      if (!outbox && this.prisma.handoffOutbox.create) {
        const idempotencyKey = randomUUID();
        const payload = buildSpmbHandoffPayload(reg, idempotencyKey);
        outbox = await this.prisma.handoffOutbox.create({
          data: {
            registrationId: reg.id,
            idempotencyKey,
            contractVersion: payload.contractVersion,
            payload,
            payloadHash: hashSpmbHandoffPayload(payload),
            status: "pending",
            attempts: 0,
          },
        });
      }
    }

    if (outbox?.status === "delivered") {
      return {
        success: true,
        registrationId: reg.id,
        registrationNumber: reg.registrationNumber,
        message: "Data pendaftar sudah tersinkronisasi ke SIAKAD",
      };
    }

    let payload = SpmbHandoffPayloadSchema.safeParse(outbox?.payload);
    if (!payload.success) {
      const idempotencyKey = outbox?.idempotencyKey || randomUUID();
      const rebuiltPayload = buildSpmbHandoffPayload(reg, idempotencyKey);
      if (outbox && this.prisma.handoffOutbox?.update) {
        outbox = await this.prisma.handoffOutbox.update({
          where: { id: outbox.id },
          data: {
            contractVersion: rebuiltPayload.contractVersion,
            payload: rebuiltPayload,
            payloadHash: hashSpmbHandoffPayload(rebuiltPayload),
          },
        });
      }
      payload = SpmbHandoffPayloadSchema.safeParse(rebuiltPayload);
    }
    if (!payload.success) {
      throw new BadRequestException("Snapshot handoff SPMB tidak valid.");
    }

    const targetUrl = `${siakadApiUrl.replace(/\/$/, "")}/api/internal/spmb-handoff`;

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-service-key": secretKey,
        },
        body: JSON.stringify(payload.data),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        const errorText = `HTTP ${response.status}: ${errorBody}`;
        this.logger.error(`Handoff failed for ${reg.registrationNumber}: ${errorText}`);

        if (outbox && this.prisma.handoffOutbox?.update) {
          await this.prisma.handoffOutbox.update({
            where: { id: outbox.id },
            data: {
              ...this.failedOutboxUpdate(outbox, errorText),
            },
          });
        }

        await this.prisma.registration.update({
          where: { id: reg.id },
          data: { handoffStatus: HandoffStatus.failed, handoffError: errorText },
        });

        return {
          success: false,
          registrationId: reg.id,
          message: `Gagal mengirim data ke SIAKAD (${response.status}): ${errorText}`,
        };
      }

      const responseJson = await response.json().catch(() => null);

      const parsedReceipt = SpmbHandoffReceiptSchema.safeParse(responseJson);
      const validatedReceipt: SpmbHandoffReceipt | null = parsedReceipt.success && parsedReceipt.data.sourceRegistrationId === reg.id
        ? parsedReceipt.data
        : null;

      if (!validatedReceipt) {
        const errorMessage = "SIAKAD tidak mengonfirmasi penerimaan pendaftaran dengan tanda terima valid.";
        if (outbox && this.prisma.handoffOutbox?.update) {
          await this.prisma.handoffOutbox.update({
            where: { id: outbox.id },
            data: {
              ...this.failedOutboxUpdate(outbox, errorMessage),
            },
          });
        }
        await this.prisma.registration.update({
          where: { id: reg.id },
          data: { handoffStatus: HandoffStatus.failed, handoffError: errorMessage },
        });
        return { success: false, registrationId: reg.id, message: errorMessage };
      }

      if (outbox && this.prisma.handoffOutbox?.update) {
        await this.prisma.handoffOutbox.update({
          where: { id: outbox.id },
          data: {
            status: "delivered",
            deliveredAt: new Date(),
            destinationReceiptId: validatedReceipt.receiptId,
            destinationEnrollmentId: validatedReceipt.destinationEnrollmentId,
            lastError: null,
            leasedAt: null,
            leaseOwner: null,
          },
        });
      }

      await this.prisma.registration.update({
        where: { id: reg.id },
        data: {
          handoffStatus: HandoffStatus.done,
          handoffAt: new Date(),
          handoffError: null,
        },
      });

      await this.prisma.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId: options?.principal?.id || "spmb-outbox-worker",
          fromStatus: reg.status,
          toStatus: reg.status,
          kind: "handoff",
          note: `Data pendaftar berhasil disinkronisasi ke SIAKAD (${reg.period.label})`,
        },
      });

      return {
        success: true,
        registrationId: reg.id,
        registrationNumber: reg.registrationNumber,
        message: "Data pendaftar berhasil disinkronkan ke SIAKAD",
      };
    } catch (err: any) {
      this.logger.error(`Network error during handoff for ${reg.registrationNumber}`, err);

      if (outbox && this.prisma.handoffOutbox?.update) {
        await this.prisma.handoffOutbox.update({
          where: { id: outbox.id },
          data: {
            ...this.failedOutboxUpdate(outbox, err.message),
          },
        });
      }

      await this.prisma.registration.update({
        where: { id: reg.id },
        data: { handoffStatus: HandoffStatus.failed, handoffError: err.message },
      });

      return {
        success: false,
        registrationId: reg.id,
        message: `Koneksi ke endpoint SIAKAD gagal: ${err.message}`,
      };
    }
  }

  private failedOutboxUpdate(outbox: { attempts?: number }, lastError: string) {
    const attempts = (outbox.attempts || 0) + 1;
    const delayMs = Math.min(2 ** Math.max(0, attempts - 1) * 30_000, 30 * 60_000);

    return {
      attempts,
      lastError,
      status: "failed",
      availableAt: new Date(Date.now() + delayMs),
      leasedAt: null,
      leaseOwner: null,
    };
  }

  async syncSingle(principal: SpmbPrincipal, dto: SyncHandoffDto) {
    return this.deliverOutbox(dto.registrationId, { principal });
  }

  async syncBatch(principal: SpmbPrincipal, dto: BatchSyncHandoffDto) {
    await Promise.all(
      dto.registrationIds.map((registrationId) => this.findScopedRegistration(registrationId, principal)),
    );
    const results = [];
    for (const regId of dto.registrationIds) {
      const res = await this.syncSingle(principal, { registrationId: regId });
      results.push(res);
    }
    const successCount = results.filter((r) => r.success).length;
    return {
      total: dto.registrationIds.length,
      successCount,
      failedCount: dto.registrationIds.length - successCount,
      details: results,
    };
  }

  async confirmEnrollment(receiptDto: ConfirmEnrollmentDto, secretKey?: string) {
    const expectedSecret = process.env.INTERNAL_SERVICE_SECRET?.trim();
    if (!expectedSecret) {
      throw new InternalServerErrorException("Layanan internal belum dikonfigurasi.");
    }

    if (!secretKey || secretKey !== expectedSecret) {
      throw new UnauthorizedException("Kunci layanan internal tidak valid.");
    }

    const confirmation = SpmbEnrollmentConfirmationSchema.parse(receiptDto);

    return this.prisma.$transaction(async (tx) => {
      const reg = await tx.registration.findUnique({
        where: { id: confirmation.sourceRegistrationId },
        include: { handoffOutbox: true },
      });
      if (!reg) {
        throw new NotFoundException("Pendaftaran tidak ditemukan.");
      }

      if (reg.status !== "accepted") {
        throw new BadRequestException("Hanya pendaftaran berstatus 'accepted' yang dapat dikonfirmasi enrolled.");
      }
      if (
        !reg.handoffOutbox
        || reg.handoffOutbox.status !== "delivered"
        || reg.handoffOutbox.destinationReceiptId !== confirmation.receiptId
        || reg.handoffOutbox.destinationEnrollmentId !== confirmation.destinationEnrollmentId
      ) {
        throw new BadRequestException("Konfirmasi enrolled tidak cocok dengan tanda terima handoff SIAKAD.");
      }

      const updated = await tx.registration.update({
        where: { id: reg.id },
        data: {
          status: RegistrationStatus.enrolled,
        },
      });

      await tx.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId: "siakad-internal",
          fromStatus: "accepted",
          toStatus: "enrolled",
          kind: "enrollment",
          note: `Konfirmasi pendaftaran resmi menjadi murid (enrolled) di SIAKAD. ID Enrollment: ${confirmation.destinationEnrollmentId}`,
        },
      });

      return {
        success: true,
        registrationId: reg.id,
        status: RegistrationStatus.enrolled,
        message: "Status pendaftaran berhasil diperbarui menjadi enrolled",
      };
    });
  }

  async listHandoffStatus(periodId: string, principal: SpmbPrincipal) {
    await this.findScopedPeriod(periodId, principal);
    const where: Prisma.RegistrationWhereInput = {
      periodId,
      status: "accepted",
    };

    return this.prisma.registration.findMany({
      where,
      select: {
        id: true,
        registrationNumber: true,
        handoffStatus: true,
        handoffError: true,
        handoffAt: true,
        source: true,
        period: {
          select: {
            unitId: true,
            label: true,
          },
        },
        studentData: {
          select: {
            fullName: true,
            gender: true,
            nisn: true,
          },
        },
        parent: {
          select: {
            fullName: true,
            email: true,
            phone: true,
          },
        },
        guardianName: true,
        guardianPhone: true,
      },
      orderBy: { registrationNumber: "asc" },
    });
  }
}
