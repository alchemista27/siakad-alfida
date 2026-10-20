import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type DepartmentMemberProjection = {
  id: string;
  departmentId: string;
  userId: string;
  role: string | null;
  sourceUpdatedAt: string;
};

type SourceVersionWhere = {
  id: string;
  OR: Array<{ sourceUpdatedAt: null } | { sourceUpdatedAt: { lt: Date } }>;
};

type DepartmentMemberData = {
  departmentId: string;
  userId: string;
  role: string | null;
  sourceUpdatedAt: Date;
};

type DepartmentMemberStore = {
  findUnique(input: { where: { id: string } }): Promise<unknown>;
  updateMany(input: { where: SourceVersionWhere; data: DepartmentMemberData }): Promise<{ count: number }>;
  create(input: { data: DepartmentMemberData & { id: string } }): Promise<unknown>;
};

function isUniqueViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

@Injectable()
export class DepartmentMembersSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async sync(id: string, member: DepartmentMemberProjection) {
    if (id !== member.id) throw new BadRequestException("ID path dan body harus sama.");
    const sourceUpdatedAt = new Date(member.sourceUpdatedAt);
    if (Number.isNaN(sourceUpdatedAt.getTime())) throw new BadRequestException("Versi sumber anggota departemen tidak valid.");

    const db = this.prisma as unknown as { departmentMember: DepartmentMemberStore };
    const data: DepartmentMemberData = {
      departmentId: member.departmentId,
      userId: member.userId,
      role: member.role?.trim() || null,
      sourceUpdatedAt,
    };
    const where: SourceVersionWhere = {
      id,
      OR: [{ sourceUpdatedAt: null }, { sourceUpdatedAt: { lt: sourceUpdatedAt } }],
    };
    const updated = await db.departmentMember.updateMany({ where, data });
    if (updated.count === 1) return db.departmentMember.findUnique({ where: { id } });

    try {
      return await db.departmentMember.create({ data: { id, ...data } });
    } catch (error: unknown) {
      if (!isUniqueViolation(error) || !(await db.departmentMember.findUnique({ where: { id } }))) throw error;
      const retried = await db.departmentMember.updateMany({ where, data });
      if (retried.count === 1) return db.departmentMember.findUnique({ where: { id } });
      return db.departmentMember.findUnique({ where: { id } });
    }
  }
}
