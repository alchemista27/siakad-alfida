import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SimpegYmqProjectionClient } from "./simpeg-ymq-projection.client";
import { shouldApplyEmployeeProjection } from "./ymq-employee-projection.policy";

@Injectable()
export class YmqEmployeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly simpegClient: SimpegYmqProjectionClient,
  ) {}

  async sync(query: { unitId?: string; updatedAfter?: string }) {
    if (query.unitId && !isUuid(query.unitId)) throw new BadRequestException("unitId harus UUID.");
    if (query.updatedAfter && Number.isNaN(Date.parse(query.updatedAfter))) {
      throw new BadRequestException("updatedAfter harus ISO datetime.");
    }

    const rows = await this.simpegClient.list(query);
    const counts = { received: rows.length, created: 0, updated: 0, ignoredOlder: 0, inactive: 0 };
    for (const projection of rows) {
      if (!projection.isActive) counts.inactive += 1;
      const existing = await this.prisma.user.findUnique({
        where: { id: projection.userId },
        select: { id: true, sourceUpdatedAt: true },
      });
      if (existing && !shouldApplyEmployeeProjection(existing.sourceUpdatedAt, projection.sourceUpdatedAt)) {
        counts.ignoredOlder += 1;
        continue;
      }

      const data = {
        fullName: projection.fullName,
        email: projection.email,
        unitId: projection.unitId,
        unitName: projection.unitName,
        isActive: projection.isActive,
        sourceUpdatedAt: new Date(projection.sourceUpdatedAt),
      };
      if (existing) {
        await this.prisma.user.update({ where: { id: projection.userId }, data });
        counts.updated += 1;
      } else {
        await this.prisma.user.create({ data: { id: projection.userId, ...data } });
        counts.created += 1;
      }
    }
    return counts;
  }

  async listAssignable(unitId?: string) {
    return this.prisma.user.findMany({
      where: { isActive: true, ...(unitId ? { unitId } : {}) },
      select: { id: true, fullName: true, email: true, unitId: true, unitName: true },
      orderBy: [{ fullName: "asc" }, { id: "asc" }],
    });
  }
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
