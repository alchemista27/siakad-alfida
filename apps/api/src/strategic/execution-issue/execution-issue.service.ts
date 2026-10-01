import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionIssueDto, UpdateExecutionIssueDto } from '../dto/issue.dto';

@Injectable()
export class ExecutionIssueService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateExecutionIssueDto) {
    return this.prisma.executionIssue.create({ data: createDto });
  }

  async findAll() {
    return this.prisma.executionIssue.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { id: true, fullName: true } },
        assignee: { select: { id: true, fullName: true } },
      }
    });
  }

  async findOne(id: string) {
    const issue = await this.prisma.executionIssue.findUnique({
      where: { id },
      include: {
        reporter: { select: { id: true, fullName: true } },
        assignee: { select: { id: true, fullName: true } },
        actionItems: true,
      }
    });
    if (!issue) throw new NotFoundException(`Issue with ID ${id} not found`);
    return issue;
  }

  async update(id: string, updateDto: UpdateExecutionIssueDto) {
    await this.findOne(id);
    return this.prisma.executionIssue.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.executionIssue.delete({ where: { id } });
  }
}
