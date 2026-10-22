import { BadRequestException, Injectable } from "@nestjs/common";
import { IwrLevel } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import { validateCurriculumUnitInput } from "../ymq/ymq-domain";
import { CreateIwrCurriculumDto, UpdateIwrCurriculumDto } from "./curriculum.dto";

@Injectable()
export class CurriculumService {
  constructor(private readonly prisma: PrismaService) {}

  list(level?: IwrLevel) {
    return this.prisma.ymqIwrCurriculumUnit.findMany({
      where: level ? { iwrLevel: level } : undefined,
      orderBy: [{ iwrLevel: "asc" }, { topicCode: "asc" }],
    });
  }

  async create(dto: CreateIwrCurriculumDto) {
    this.assertValid(dto.topicCode, dto.pageStart, dto.pageEnd);
    return this.prisma.ymqIwrCurriculumUnit.create({
      data: { ...dto, iwrLevel: dto.iwrLevel as IwrLevel },
    });
  }

  async update(id: string, dto: UpdateIwrCurriculumDto) {
    const existing = await this.prisma.ymqIwrCurriculumUnit.findUniqueOrThrow({ where: { id } });
    const topicCode = dto.topicCode ?? existing.topicCode;
    const pageStart = dto.pageStart ?? existing.pageStart;
    const pageEnd = dto.pageEnd ?? existing.pageEnd;
    this.assertValid(topicCode, pageStart, pageEnd);
    return this.prisma.ymqIwrCurriculumUnit.update({ where: { id }, data: dto });
  }

  archive(id: string) {
    return this.prisma.ymqIwrCurriculumUnit.update({ where: { id }, data: { isActive: false } });
  }

  private assertValid(topicCode: string, pageStart: number, pageEnd: number) {
    const result = validateCurriculumUnitInput({ topicCode, pageStart, pageEnd });
    if (!result.valid) throw new BadRequestException("reason" in result ? result.reason : "Unit kurikulum tidak valid.");
  }
}
