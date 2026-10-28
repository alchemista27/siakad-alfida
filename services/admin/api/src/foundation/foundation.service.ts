import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { UpdateFoundationDto } from "./foundation.dto";
import { isAllowedFoundationCloudinaryUrl } from "./foundation-cloudinary-asset.policy";

const DEFAULT_SETTINGS_ID = "00000000-0000-0000-0000-000000000001";

@Injectable()
export class FoundationService {
  private readonly logger = new Logger(FoundationService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getPublicSettings() {
    const settings = await this.prisma.foundationSettings.findFirst({
      select: {
        foundationName: true,
        logoUrl: true,
        faviconUrl: true,
      },
    });

    return settings || {
      foundationName: "Yayasan Alfida",
      logoUrl: null,
      faviconUrl: null,
    };
  }

  async getAdminSettings() {
    let settings = await this.prisma.foundationSettings.findFirst();

    if (!settings) {
      settings = await this.prisma.foundationSettings.create({
        data: {
          id: DEFAULT_SETTINGS_ID,
          foundationName: "Yayasan Alfida",
          bankName: "Bank Syariah Indonesia (BSI)",
          bankAccountNumber: "7121234567",
          bankAccountHolder: "Yayasan Alfida",
        },
      });
    }

    return settings;
  }

  async updateSettings(dto: UpdateFoundationDto) {
    const existing = await this.prisma.foundationSettings.findFirst();
    this.assertAllowedAssetUrls(dto, existing);
    const data = {
      foundationName: dto.foundationName.trim(),
      logoUrl: dto.logoUrl || null,
      faviconUrl: dto.faviconUrl || null,
      chairmanName: dto.chairmanName || null,
      bankName: dto.bankName || null,
      bankAccountNumber: dto.bankAccountNumber || null,
      bankAccountHolder: dto.bankAccountHolder || null,
      address: dto.address || null,
      phone: dto.phone || null,
      email: dto.email || null,
    };
    const settings = existing
      ? await this.prisma.foundationSettings.update({ where: { id: existing.id }, data })
      : await this.prisma.foundationSettings.create({ data: { id: DEFAULT_SETTINGS_ID, ...data } });

    try {
      if (process.env.LEGACY_DATABASE_URL) {
        // Legacy synchronization is intentionally non-blocking.
      }
    } catch (error: unknown) {
      this.logger.warn(`Gagal sinkronisasi ke legacy: ${error instanceof Error ? error.message : "unknown error"}`);
    }

    return {
      success: true,
      message: "Pengaturan identitas yayasan berhasil diperbarui",
      data: settings,
    };
  }

  private assertAllowedAssetUrls(
    dto: UpdateFoundationDto,
    existing?: { logoUrl?: string | null; faviconUrl?: string | null } | null
  ) {
    const cloudName =
      process.env.CLOUDINARY_CLOUD_NAME ||
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      "hb1ropwm";
    const assets = [
      ["logo", dto.logoUrl, existing?.logoUrl],
      ["favicon", dto.faviconUrl, existing?.faviconUrl],
    ] as const;

    for (const [label, url, existingUrl] of assets) {
      if (!url) continue;
      // Izinkan jika URL tidak berubah dari data yang sudah ada sebelumnya (legacy/grandfathered)
      if (existingUrl && url === existingUrl) continue;
      if (!isAllowedFoundationCloudinaryUrl(url, cloudName)) {
        throw new BadRequestException(`URL ${label} harus berasal dari folder Cloudinary foundation yang sesuai.`);
      }
    }
  }
}
