import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { allowedUnitIds, assertUnitAccess, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";
import { isAllowedUnitCloudinaryUrl } from "./unit-identity-cloudinary.policy";

export type UpdateUnitIdentityDto = {
  logoUrl?: string | null;
  principalName?: string | null;
  principalSignatureUrl?: string | null;
};

type UnitIdentityRecord = {
  unitId: string;
  logoUrl: string | null;
  principalName: string | null;
  principalSignatureUrl: string | null;
};

@Injectable()
export class UnitIdentityService {
  private readonly cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "hb1ropwm";

  constructor(private readonly prisma: PrismaService) {}

  async getMe(principal: SiakadPrincipal) {
    return this.getByUnitId(principal, this.unitIdForPrincipal(principal));
  }

  async updateMe(principal: SiakadPrincipal, dto: UpdateUnitIdentityDto) {
    return this.updateByUnitId(principal, this.unitIdForPrincipal(principal), dto);
  }

  async getByUnitId(principal: SiakadPrincipal, unitId: string) {
    await this.assertEducationUnitAccess(principal, unitId);
    const identity = await (this.prisma as any).unitIdentity.findUnique({ where: { unitId } }) as UnitIdentityRecord | null;
    return identity ?? { unitId, logoUrl: null, principalName: null, principalSignatureUrl: null };
  }

  async updateByUnitId(principal: SiakadPrincipal, unitId: string, dto: UpdateUnitIdentityDto) {
    await this.assertEducationUnitAccess(principal, unitId);
    const existing = await (this.prisma as any).unitIdentity.findUnique({ where: { unitId } }) as UnitIdentityRecord | null;
    const logoUrl = this.assetUrl("logo", dto.logoUrl, existing?.logoUrl ?? null, unitId);
    const principalSignatureUrl = this.assetUrl("principal-signature", dto.principalSignatureUrl, existing?.principalSignatureUrl ?? null, unitId);
    const principalName = dto.principalName === undefined
      ? existing?.principalName ?? null
      : dto.principalName?.trim() || null;

    return (this.prisma as any).unitIdentity.upsert({
      where: { unitId },
      create: { unitId, logoUrl, principalName, principalSignatureUrl, updatedByUserId: principal.id },
      update: { logoUrl, principalName, principalSignatureUrl, updatedByUserId: principal.id },
    });
  }

  private unitIdForPrincipal(principal: SiakadPrincipal): string {
    if (isSuperAdmin(principal)) {
      throw new BadRequestException("Super admin harus menggunakan endpoint identitas dengan unitId.");
    }
    const unitIds = [...allowedUnitIds(principal, ["admin_unit"])];
    if (unitIds.length !== 1) {
      throw new ForbiddenException("Admin unit harus memiliki tepat satu scope unit SIAKAD untuk mengelola identitas.");
    }
    return unitIds[0];
  }

  private async assertEducationUnitAccess(principal: SiakadPrincipal, unitId: string) {
    assertUnitAccess(principal, unitId);
    const unit = await (this.prisma as any).unitProjection.findUnique({ where: { id: unitId } }) as { id: string; category?: string; status?: string } | null;
    if (!unit) throw new NotFoundException("Projection unit SIAKAD tidak ditemukan.");
    if (unit.status !== "active" || unit.category !== "pendidikan") {
      throw new ForbiddenException("Identitas unit hanya tersedia untuk unit pendidikan aktif.");
    }
  }

  private assetUrl(
    kind: "logo" | "principal-signature",
    incoming: string | null | undefined,
    existing: string | null,
    unitId: string,
  ): string | null {
    if (incoming === undefined) return existing;
    if (!incoming) return null;
    if (incoming === existing) return incoming;
    if (!isAllowedUnitCloudinaryUrl(incoming, this.cloudName, unitId, kind)) {
      throw new BadRequestException(`URL ${kind} harus berasal dari folder Cloudinary unit yang sesuai.`);
    }
    return incoming;
  }
}
