import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateFoundationDto } from "./foundation.dto";

const DEFAULT_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

@Injectable()
export class FoundationService {
  private readonly logger = new Logger(FoundationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPublicSettings() {
    let settings = await this.prisma.foundationSettings.findFirst({
      select: {
        foundationName: true,
        logoUrl: true,
        faviconUrl: true,
      },
    });

    if (!settings) {
      settings = {
        foundationName: "Yayasan Alfida",
        logoUrl: "https://s3.alfida.or.id/sim-alfida/sim-alfida/foundation/logo-1790054535826",
        faviconUrl: null,
      };
    }

    return settings;
  }

  async getAdminSettings() {
    let settings = await this.prisma.foundationSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.foundationSettings.create({
        data: {
          id: DEFAULT_SETTINGS_ID,
          foundationName: "Yayasan Alfida",
          logoUrl: "https://s3.alfida.or.id/sim-alfida/sim-alfida/foundation/logo-1790054535826",
          bankName: "Bank Syariah Indonesia (BSI)",
          bankAccountNumber: "7121234567",
          bankAccountHolder: "Yayasan Alfida",
        },
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateFoundationDto) {
    let existing = await this.prisma.foundationSettings.findFirst();

    let settings;
    if (existing) {
      settings = await this.prisma.foundationSettings.update({
        where: { id: existing.id },
        data: {
          foundationName: dto.foundationName.trim(),
          logoUrl: dto.logoUrl || null,
          faviconUrl: dto.faviconUrl || null,
          chairmanName: dto.chairmanName || null,
          chairmanSignatureUrl: dto.chairmanSignatureUrl || null,
          bankName: dto.bankName || null,
          bankAccountNumber: dto.bankAccountNumber || null,
          bankAccountHolder: dto.bankAccountHolder || null,
          address: dto.address || null,
          phone: dto.phone || null,
          email: dto.email || null,
        },
      });
    } else {
      settings = await this.prisma.foundationSettings.create({
        data: {
          id: DEFAULT_SETTINGS_ID,
          foundationName: dto.foundationName.trim(),
          logoUrl: dto.logoUrl || null,
          faviconUrl: dto.faviconUrl || null,
          chairmanName: dto.chairmanName || null,
          chairmanSignatureUrl: dto.chairmanSignatureUrl || null,
          bankName: dto.bankName || null,
          bankAccountNumber: dto.bankAccountNumber || null,
          bankAccountHolder: dto.bankAccountHolder || null,
          address: dto.address || null,
          phone: dto.phone || null,
          email: dto.email || null,
        },
      });
    }

    // Sinkronisasi non-blocking ke basis data simalfida legacy (sim.foundation_settings) jika ada
    try {
      if (process.env.LEGACY_DATABASE_URL) {
        // Query update langsung via raw query jika datasource support
      }
    } catch (e: any) {
      this.logger.warn(`Gagal sinkronisasi ke legacy: ${e.message}`);
    }

    return {
      success: true,
      message: "Pengaturan identitas yayasan berhasil diperbarui",
      data: settings,
    };
  }
}
