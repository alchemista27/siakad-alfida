import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type DepartmentSyncPayload = {
  id: string;
  unitId?: string | null;
  parentId?: string | null;
  leaderId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  updatedAt: string;
};

type SourceVersionWhere = {
  id: string;
  OR: Array<{ sourceUpdatedAt: null } | { sourceUpdatedAt: { lt: Date } }>;
};

type DepartmentData = {
  unitId: string | null;
  parentId: string | null;
  leaderId: string | null;
  name: string;
  code: string | null;
  description: string | null;
  isActive: boolean;
  source: "simpeg";
  sourceUpdatedAt: Date;
  archivedAt: Date | null;
};

type DepartmentStore = {
  findUnique(input: { where: { id: string } }): Promise<unknown>;
  updateMany(input: { where: SourceVersionWhere; data: DepartmentData | Pick<DepartmentData, "isActive" | "source" | "sourceUpdatedAt" | "archivedAt"> }): Promise<{ count: number }>;
  create(input: { data: DepartmentData & { id: string } }): Promise<unknown>;
};

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

@Injectable()
export class OrganizationSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async deleteDepartment(id: string, payload: { id: string; deletedAt: string }) {
    if (id !== payload.id) throw new BadRequestException("ID path dan body harus sama.");
    const deletedAt = new Date(payload.deletedAt);
    if (Number.isNaN(deletedAt.getTime())) throw new BadRequestException("deletedAt harus berupa timestamp ISO yang valid.");
    const db = this.prisma as unknown as { department: DepartmentStore };
    const data = { isActive: false, archivedAt: deletedAt, source: "simpeg" as const, sourceUpdatedAt: deletedAt };
    const where = this.sourceVersionWhere(id, deletedAt);
    const updated = await db.department.updateMany({ where, data });
    if (updated.count === 1) return db.department.findUnique({ where: { id } });

    try {
      return await db.department.create({
        data: {
          id,
          unitId: null,
          parentId: null,
          leaderId: null,
          name: `Deleted SIMPEG department ${id}`,
          code: null,
          description: null,
          ...data,
        },
      });
    } catch (error: unknown) {
      if (!isUniqueViolation(error) || !(await db.department.findUnique({ where: { id } }))) throw error;
      const retried = await db.department.updateMany({ where, data });
      if (retried.count === 1) return db.department.findUnique({ where: { id } });
      return db.department.findUnique({ where: { id } });
    }
  }

  async syncDepartment(id: string, payload: DepartmentSyncPayload) {
    if (id !== payload.id) throw new BadRequestException("ID path dan body harus sama.");
    const updatedAt = new Date(payload.updatedAt);
    if (Number.isNaN(updatedAt.getTime())) throw new BadRequestException("updatedAt harus berupa timestamp ISO yang valid.");
    const db = this.prisma as unknown as { department: DepartmentStore };
    const data: DepartmentData = {
      unitId: payload.unitId ?? null,
      parentId: payload.parentId ?? null,
      leaderId: payload.leaderId ?? null,
      name: payload.name.trim(),
      code: payload.code.trim().toUpperCase(),
      description: payload.description?.trim() || null,
      isActive: payload.isActive,
      source: "simpeg",
      sourceUpdatedAt: updatedAt,
      archivedAt: payload.isActive ? null : new Date(),
    };
    const where = this.sourceVersionWhere(id, updatedAt);
    const updated = await db.department.updateMany({ where, data });
    if (updated.count === 1) return db.department.findUnique({ where: { id } });

    try {
      return await db.department.create({ data: { id, ...data } });
    } catch (error: unknown) {
      if (!isUniqueViolation(error) || !(await db.department.findUnique({ where: { id } }))) throw error;
      const retried = await db.department.updateMany({ where, data });
      if (retried.count === 1) return db.department.findUnique({ where: { id } });
      return db.department.findUnique({ where: { id } });
    }
  }

  private sourceVersionWhere(id: string, sourceUpdatedAt: Date): SourceVersionWhere {
    return { id, OR: [{ sourceUpdatedAt: null }, { sourceUpdatedAt: { lt: sourceUpdatedAt } }] };
  }
}
