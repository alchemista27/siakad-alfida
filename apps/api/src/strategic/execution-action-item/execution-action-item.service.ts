import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionActionItemDto, UpdateExecutionActionItemDto } from '../dto/action-item.dto';

@Injectable()
export class ExecutionActionItemService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateExecutionActionItemDto) {
    return this.prisma.executionActionItem.create({
      data: createDto
    });
  }

  async findAll() {
    return this.prisma.executionActionItem.findMany({
      include: {
        pic: { select: { id: true, fullName: true } },
        meeting: { select: { id: true, title: true } },
        issue: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findByPic(picId: string) {
    return this.prisma.executionActionItem.findMany({
      where: { picId },
      include: {
        meeting: { select: { id: true, title: true } },
        issue: { select: { id: true, title: true } }
      },
      orderBy: { deadline: 'asc' }
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.executionActionItem.findUnique({
      where: { id },
      include: {
        pic: { select: { id: true, fullName: true } },
        meeting: true,
        issue: true
      }
    });
    if (!item) throw new NotFoundException(`Action Item with ID ${id} not found`);
    return item;
  }

  async update(id: string, updateDto: UpdateExecutionActionItemDto) {
    await this.findOne(id);
    return this.prisma.executionActionItem.update({
      where: { id },
      data: updateDto
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.executionActionItem.delete({
      where: { id }
    });
  }
}
