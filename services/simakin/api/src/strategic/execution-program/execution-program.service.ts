
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionProgramDto, UpdateExecutionProgramDto } from '../dto/program.dto';

@Injectable()
export class ExecutionProgramService {
  constructor(private prisma: PrismaService) {}

  async findAll(user?: any) {
    let whereClause = {};
    if (user && !user.roles?.some((r: any) => r.role === 'super_admin')) {
      const myDepts = await this.prisma.departmentAdmin.findMany({
        where: { userId: user.id },
        select: { departmentId: true }
      });
      const deptIds = myDepts.map(d => d.departmentId);

      // Ambil juga anak-anak biro di bawah departemen ini
      const childDepts = await this.prisma.department.findMany({
        where: { parentId: { in: deptIds } },
        select: { id: true }
      });
      const allAccessibleDeptIds = [...new Set([...deptIds, ...childDepts.map(c => c.id)])];

      whereClause = {
        OR: [
          { departmentId: { in: allAccessibleDeptIds } },
          { coordinatorId: user.id },
          { userId: user.id }
        ]
      };
    }

    return this.prisma.workProgram.findMany({
      where: whereClause,
      include: { department: true, user: true, coordinator: true, kpis: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.workProgram.findUnique({
      where: { id },
      include: { department: true, user: true, coordinator: true, kpis: true }
    });
  }

  async create(data: CreateExecutionProgramDto) {
    return this.prisma.workProgram.create({ data: data as any });
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
      if (!title) continue;

      const deptName = row.departmentName || row.department || row.Department || row['Nama Bidang / Biro'] || row['Bidang / Biro'] || row['bidang'] || row['biro'];
      let deptId = row.departmentId || row.department_id;
      if (!deptId && deptName) {
        deptId = deptMap.get(String(deptName).toLowerCase().trim());
      }
      if (!deptId) continue;

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

    const created = await this.prisma.workProgram.createMany({
      data: validPrograms as any,
    });

    return { success: true, count: created.count };
  }

  async update(id: string, data: UpdateExecutionProgramDto) {
    return this.prisma.workProgram.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.workProgram.delete({ where: { id } });
  }
}
