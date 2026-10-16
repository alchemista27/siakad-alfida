
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { isAllowedEvidenceUrl } from './cloudinary-evidence.policy';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';

@Injectable()
export class ExecutionEvidenceService {
  constructor(private prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly access: StrategicAccessQueryService) {}

  async findAll(user: any) {
    return this.prisma.executionEvidence.findMany({
      where: (await this.access.forEvidence(user)).where as any,
      include: { task: true, owner: true, verifier: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, user: any) {
    await this.access.assertCanReadArtifact(user, "evidence", id);
    return this.prisma.executionEvidence.findUnique({
      where: { id },
      include: { task: true, owner: true, verifier: true }
    });
  }

  async create(data: any, user: any) {
    const program = await this.prisma.workProgram.findUnique({ where: { id: data.programId } });
    if (!program) throw new BadRequestException("Program kerja tidak ditemukan.");
    if (!data.digitalLink || !isAllowedEvidenceUrl(data.digitalLink)) throw new BadRequestException("Tautan bukti harus berasal dari Cloudinary Alfida.");
    if (data.taskId) {
      await this.authorization.assertPicOwnsTask(user, data.taskId);
      const task = await this.prisma.executionTask.findUnique({ where: { id: data.taskId } });
      if (!task || task.programId !== data.programId) throw new BadRequestException("Bukti harus terhubung ke tugas pada program yang sama.");
    }
    else await this.authorization.assertBiroCanManage(user, program.departmentId);
    const { ownerId, verifierId, ...safe } = data;
    return (this.prisma as any).executionEvidence.create({ data: { ...safe, ownerId: user.id, departmentId: program.departmentId, workflowStatus: "draft" } });
  }

  async update(id: string, data: any, user: any) {
    await this.access.assertCanReadArtifact(user, "evidence", id);
    const evidence = await (this.prisma as any).executionEvidence.findUnique({ where: { id } });
    if (!evidence || evidence.workflowStatus === "approved_by_bidang") throw new BadRequestException("Bukti tidak dapat diubah.");
    if (evidence.ownerId !== user.id) await this.authorization.assertBiroCanManage(user, evidence.departmentId);
    const { ownerId, departmentId, verifierId, ...safe } = data;
    return (this.prisma as any).executionEvidence.update({ where: { id }, data: safe });
  }

  async remove(id: string, user: any) {
    await this.access.assertCanReadArtifact(user, "evidence", id);
    const evidence = await (this.prisma as any).executionEvidence.findUnique({ where: { id } });
    if (!evidence || evidence.workflowStatus !== "draft") throw new BadRequestException("Hanya bukti draft yang dapat dihapus.");
    if (evidence.ownerId !== user.id) await this.authorization.assertBiroCanManage(user, evidence.departmentId);
    return this.prisma.executionEvidence.delete({ where: { id } });
  }
}
