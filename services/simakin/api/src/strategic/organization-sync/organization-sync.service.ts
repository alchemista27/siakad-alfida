import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type DepartmentSyncPayload = { id: string; name: string; code: string; description?: string | null; isActive: boolean; updatedAt: string };

@Injectable()
export class OrganizationSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteDepartment(id: string, payload: { id: string; deletedAt: string }) {
    if (id !== payload.id) throw new BadRequestException("ID path dan body harus sama.");
    const deletedAt = new Date(payload.deletedAt);
    if (Number.isNaN(deletedAt.getTime())) throw new BadRequestException("deletedAt harus berupa timestamp ISO yang valid.");
    return (this.prisma as any).department.upsert({
      where: { id },
      create: {
        id,
        name: `Deleted SIMPEG department ${id}`,
        isActive: false,
        archivedAt: deletedAt,
        source: "simpeg",
        sourceUpdatedAt: deletedAt,
      },
      update: { isActive: false, archivedAt: deletedAt, source: "simpeg", sourceUpdatedAt: deletedAt },
    });
  }

  async syncDepartment(id: string, payload: DepartmentSyncPayload) {
    if (id !== payload.id) throw new BadRequestException("ID path dan body harus sama.");
    const updatedAt = new Date(payload.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) throw new BadRequestException("updatedAt harus berupa timestamp ISO yang valid.");
    const db = this.prisma as any;
    const existing = await (this.prisma as any).department.findUnique({ where: { id } });
    if (existing?.sourceUpdatedAt && existing.sourceUpdatedAt >= updatedAt) return existing;
    return db.department.upsert({
      where: { id },
      create: { id, name: payload.name.trim(), code: payload.code.trim().toUpperCase(), description: payload.description?.trim() || null, isActive: payload.isActive, source: "simpeg", sourceUpdatedAt: updatedAt },
      update: { name: payload.name.trim(), code: payload.code.trim().toUpperCase(), description: payload.description?.trim() || null, isActive: payload.isActive, source: "simpeg", sourceUpdatedAt: updatedAt, archivedAt: payload.isActive ? null : new Date() },
    });
  }
}
