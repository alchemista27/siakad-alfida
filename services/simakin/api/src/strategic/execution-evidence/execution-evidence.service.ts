
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExecutionEvidenceService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.executionEvidence.findMany({
      include: { task: true, owner: true, verifier: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.executionEvidence.findUnique({
      where: { id },
      include: { task: true, owner: true, verifier: true }
    });
  }

  async create(data: any, user: any) {
    return this.prisma.executionEvidence.create({ data: { ...data, ownerId: user.id } });
  }

  async update(id: string, data: any) {
    return this.prisma.executionEvidence.update({ where: { id }, data });
  }

  async remove(id: string) {
    return this.prisma.executionEvidence.delete({ where: { id } });
  }
}
