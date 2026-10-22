import { Injectable } from "@nestjs/common";
import {
  YmqEmployeeProjectionListSchema,
  type YmqEmployeeProjectionList,
} from "@alfida/contracts";
import { PrismaService } from "../prisma/prisma.service";
import { parseUnitId, parseUpdatedAfter } from "./internal-service-auth.guard";

export type YmqEmployeeProjectionFilters = {
  unitId?: string | string[];
  updatedAfter?: string | string[];
};

@Injectable()
export class YmqEmployeeProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filters: YmqEmployeeProjectionFilters): Promise<YmqEmployeeProjectionList> {
    const unitId = parseUnitId(filters.unitId);
    const updatedAfter = parseUpdatedAfter(filters.updatedAfter);
    const assignmentWhere = {
      isPrimary: true,
      ...(unitId ? { unitId } : {}),
    };
    const users = await this.prisma.user.findMany({
      where: {
        ...(updatedAfter ? { updatedAt: { gt: updatedAfter } } : {}),
        unitAssignments: { some: assignmentWhere },
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        unitAssignments: {
          where: assignmentWhere,
          select: { unitId: true, unitName: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { id: "asc" },
    });

    return YmqEmployeeProjectionListSchema.parse({
      employees: users.flatMap((user) => user.unitAssignments.map((assignment) => ({
        userId: user.id,
        fullName: user.fullName,
        email: user.email,
        unitId: assignment.unitId,
        unitName: assignment.unitName,
        isActive: user.isActive,
        sourceUpdatedAt: (user.updatedAt ?? user.createdAt).toISOString(),
      }))),
    });
  }
}
