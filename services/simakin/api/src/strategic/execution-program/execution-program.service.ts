
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionProgramDto, UpdateExecutionProgramDto } from '../dto/program.dto';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';

@Injectable()
export class ExecutionProgramService {
  constructor(private prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly access: StrategicAccessQueryService) {}

  async findAll(user: any) {
    return this.prisma.workProgram.findMany({
      where: (await this.access.forPrograms(user)).where as any,
      include: { department: true, user: true, coordinator: true, kpis: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string, user: any) {
    await this.access.assertCanReadProgram(user, id);
    return this.prisma.workProgram.findUnique({
      where: { id },
      include: { department: true, user: true, coordinator: true, kpis: true }
    });
  }

  async create(data: CreateExecutionProgramDto, user: any) {
    await this.authorization.assertBiroCanManage(user, data.departmentId);
    return (this.prisma as any).workProgram.create({ data: { ...data, workflowStatus: "draft" } });
  }

  async batchImport(items: any[], user: any) {
    if (!items || items.length === 0) throw new BadRequestException("Data program kerja kosong.");

    const departments = await this.prisma.department.findMany({ select: { id: true, name: true } });
    const deptMap = new Map(departments.map(d => [d.name.toLowerCase().trim(), d.id]));

    const users = await this.prisma.user.findMany({ select: { id: true, email: true, fullName: true } });
    const userEmailMap = new Map(users.map(u => [u.email.toLowerCase().trim(), u.id]));

    const validPrograms = [];
    for (const row of items) {
      // Handle various case permutations
      const title = row.title || row.Title || row['Nama Program'] || row['nama_program'];
      if (!title) throw new BadRequestException(`Baris ${items.indexOf(row) + 1}: nama program wajib diisi.`);

      const deptName = row.departmentName || row.department || row.Department || row['Nama Bidang / Biro'] || row['Bidang / Biro'] || row['bidang'] || row['biro'];
      let deptId = row.departmentId || row.department_id;
      if (!deptId && deptName) {
        deptId = deptMap.get(String(deptName).toLowerCase().trim());
      }
      if (!deptId) throw new BadRequestException(`Baris ${items.indexOf(row) + 1}: Biro tidak ditemukan.`);
      await this.authorization.assertBiroCanManage(user, deptId);

      const coordEmail = row.coordinatorEmail || row.coordinator_email || row['Email Koordinator / PIC'] || row['Email PIC'] || row['email_pic'];
      let coordId = row.coordinatorId || row.coordinator_id;
      if (!coordId && coordEmail) {
        coordId = userEmailMap.get(String(coordEmail).toLowerCase().trim());
      }

      const priority = (row.priority || row['Prioritas'] || 'medium').toLowerCase();
      const status = (row.status || row['Status'] || 'planned').toLowerCase();
      const description = row.description || row.Description || row['Deskripsi'] || row['Deskripsi Singkat'] || null;
      const objective = row.objective || row['Tujuan Program'] || row['Tujuan'] || null;
      const targetAudience = row.targetAudience || row.target_audience || row['Sasaran Target'] || row['Sasaran'] || null;
      const mainOutput = row.mainOutput || row.main_output || row['Output Utama'] || row['Output'] || null;
      const expectedOutcome = row.expectedOutcome || row.expected_outcome || row['Outcome yang Diharapkan'] || row['Outcome'] || null;

      validPrograms.push({
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        departmentId: deptId,
        coordinatorId: coordId || null,
        priority: ['critical', 'high', 'medium', 'low'].includes(priority) ? priority : 'medium',
        status: ['planned', 'ongoing', 'completed', 'delayed', 'cancelled'].includes(status) ? status : 'planned',
        objective: objective ? String(objective).trim() : null,
        targetAudience: targetAudience ? String(targetAudience).trim() : null,
        mainOutput: mainOutput ? String(mainOutput).trim() : null,
        expectedOutcome: expectedOutcome ? String(expectedOutcome).trim() : null,
      });
    }

    if (validPrograms.length === 0) {
      throw new BadRequestException("Tidak ada data program kerja valid yang dapat diimpor. Pastikan nama program dan bidang/biro sudah sesuai.");
    }

    const created = await this.prisma.$transaction((tx) => tx.workProgram.createMany({ data: validPrograms as any }));

    return { success: true, count: created.count };
  }

  async update(id: string, data: UpdateExecutionProgramDto, user: any) {
    const program = await this.prisma.workProgram.findUnique({ where: { id } });
    if (!program) throw new BadRequestException("Program kerja tidak ditemukan.");
    if ((program as any).workflowStatus === "approved_by_bidang") throw new BadRequestException("Program yang disetujui tidak dapat diubah.");
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    const { departmentId, ...allowed } = data;
    if (departmentId && departmentId !== program.departmentId) throw new BadRequestException("Biro program kerja tidak dapat dipindahkan.");
    return this.prisma.workProgram.update({ where: { id }, data: allowed as any });
  }

  async remove(id: string, user: any) {
    const program = await this.prisma.workProgram.findUnique({ where: { id } });
    if (!program) throw new BadRequestException("Program kerja tidak ditemukan.");
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    return this.prisma.workProgram.delete({ where: { id } });
  }
}
