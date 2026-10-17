import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, allowedUnitIds, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface CreateSubjectDto {
  unitId: string;
  code: string;
  name: string;
  kkm?: number;
  orderIndex?: number;
}

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(principal: SiakadPrincipal, unitId?: string) {
    if (unitId) {
      assertUnitAccess(principal, unitId);
    }

    const allowedUnits = isSuperAdmin(principal) ? undefined : Array.from(allowedUnitIds(principal));
    const targetUnits = unitId ? [unitId] : allowedUnits;

    return this.prisma.subject.findMany({
      where: targetUnits ? { unitId: { in: targetUnits } } : {},
      orderBy: [{ orderIndex: "asc" }, { name: "asc" }],
    });
  }

  async getById(principal: SiakadPrincipal, id: string) {
    const subject = await this.prisma.subject.findUnique({ where: { id } });
    if (!subject) {
      throw new NotFoundException("Mata pelajaran tidak ditemukan");
    }
    assertUnitAccess(principal, subject.unitId);
    return subject;
  }

  async create(principal: SiakadPrincipal, dto: CreateSubjectDto) {
    assertUnitAccess(principal, dto.unitId);

    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.subject.findUnique({
      where: {
        unitId_code: {
          unitId: dto.unitId,
          code,
        },
      },
    });
    if (existing) {
      throw new BadRequestException("Mata pelajaran dengan kode tersebut sudah ada di unit ini");
    }

    return this.prisma.subject.create({
      data: {
        unitId: dto.unitId,
        code,
        name: dto.name.trim(),
        kkm: dto.kkm ?? 75,
        orderIndex: dto.orderIndex ?? 0,
      },
    });
  }
}
