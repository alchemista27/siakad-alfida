
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionKPIDto, UpdateExecutionKPIDto } from '../dto/kpi.dto';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { StrategicAccessQueryService } from '../workflow/strategic-access-query.service';

import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExecutionKpiService {
  constructor(private prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly access: StrategicAccessQueryService) {}

  async findAll(user: any) {
    return this.prisma.executionKPI.findMany({
      where: { program: (await this.access.forPrograms(user)).where } as any,
      include: { program: true, pic: true, realizationLogs: true, evidences: true },
    });
  }

  async findByProgram(programId: string, user: any) {
    await this.access.assertCanReadProgram(user, programId);
    return this.prisma.executionKPI.findMany({
      where: { programId },
      include: { pic: true, realizationLogs: true, evidences: true },
    });
  }

  async findOne(id: string, user: any) {
    const kpi = await this.prisma.executionKPI.findUnique({ where: { id }, select: { programId: true } });
    if (!kpi) throw new BadRequestException("KPI tidak ditemukan.");
    await this.access.assertCanReadProgram(user, kpi.programId);
    return this.prisma.executionKPI.findUnique({
      where: { id },
      include: { program: true, pic: true, realizationLogs: true, evidences: true }
    });
  }

  async create(data: CreateExecutionKPIDto, user: any) {
    const program = await this.prisma.workProgram.findUnique({ where: { id: data.programId } });
    if (!program) throw new BadRequestException("Program kerja tidak ditemukan.");
    await this.authorization.assertBiroCanManage(user, program.departmentId);
    const { baselineStatus, workflowStatus, verificationStatus, verificationNotes, ...safe } = data as any;
    return (this.prisma as any).executionKPI.create({ data: { ...safe, baselineStatus: "draft", workflowStatus: "draft" } });
  }

  async update(id: string, data: UpdateExecutionKPIDto, user: any) {
    const kpi = await this.prisma.executionKPI.findUnique({ where: { id }, include: { program: true } });
    if (!kpi) throw new BadRequestException("KPI tidak ditemukan.");
    if ((kpi as any).workflowStatus === "approved_by_bidang") throw new BadRequestException("KPI yang disetujui tidak dapat diubah.");
    await this.authorization.assertBiroCanManage(user, kpi.program.departmentId);
    const { programId, realization, baselineStatus, ...allowed } = data as any;
    if (programId && programId !== kpi.programId) throw new BadRequestException("KPI tidak dapat dipindahkan ke program lain.");
    return this.prisma.executionKPI.update({ where: { id }, data: allowed });
  }

  async submitBaseline(id: string, evidenceId: string, user: any) {
    const kpi = await this.findKpiWithProgram(id);
    if (kpi.picId !== user.id) await this.authorization.assertBiroCanManage(user, kpi.program.departmentId);
    await this.access.assertCanReadArtifact(user, 'evidence', evidenceId);
    const evidence = await this.prisma.executionEvidence.findUnique({ where: { id: evidenceId } });
    if (!evidence || evidence.programId !== kpi.programId || (evidence.kpiId && evidence.kpiId !== id)) throw new BadRequestException('Bukti baseline harus berasal dari program KPI yang sama.');
    return this.prisma.$transaction(async (tx) => {
      const scopedKpi = await tx.executionKPI.findUnique({ where: { id }, select: { id: true, programId: true } });
      const scopedEvidence = await tx.executionEvidence.findUnique({ where: { id: evidenceId }, select: { id: true, programId: true, kpiId: true } });
      if (!scopedKpi || !scopedEvidence || scopedEvidence.programId !== scopedKpi.programId || (scopedEvidence.kpiId && scopedEvidence.kpiId !== id)) throw new BadRequestException('Bukti baseline tidak lagi sesuai dengan KPI.');
      const updated = await tx.executionKPI.update({ where: { id }, data: { baselineStatus: 'submitted' } });
      await tx.executionEvidence.update({ where: { id: evidenceId }, data: { kpiId: id, availabilityStatus: 'submitted' } });
      return updated;
    });
  }

  async verifyBaseline(id: string, user: any, status: any, notes: string | null = null) {
    const kpi = await this.findKpiWithProgram(id);
    await this.authorization.assertBidangCanReview(user, kpi.program.departmentId);
    if (status === 'approved') {
      const evidence = await (this.prisma as any).executionEvidence.findFirst({ where: { kpiId: id, programId: kpi.programId, departmentId: kpi.program.departmentId } });
      if (!evidence || evidence.kpiId !== id || evidence.programId !== kpi.programId || evidence.departmentId !== kpi.program.departmentId) throw new BadRequestException('Persetujuan baseline memerlukan bukti dari program dan Biro KPI yang sama.');
    }
    return this.prisma.executionKPI.update({ where: { id }, data: { baselineStatus: status, notes: notes || undefined } });
  }

  async remove(id: string, user: any) {
    const kpi = await this.findKpiWithProgram(id);
    await this.authorization.assertBidangCanReview(user, kpi.program.departmentId);
    return this.prisma.executionKPI.delete({ where: { id } });
  }

  async batchImport(items: any[], user: any) {
    if (!items?.length) throw new BadRequestException("Data KPI kosong.");
    const scope = await this.access.forPrograms(user);
    const programs = await this.prisma.workProgram.findMany({ where: scope.where as any, select: { id: true, title: true, departmentId: true } });
    const programMap = new Map(programs.map((program) => [program.title.toLowerCase().trim(), program]));
    const users = await this.prisma.user.findMany({ select: { id: true, email: true } });
    const userEmailMap = new Map(users.map((candidate) => [candidate.email.toLowerCase().trim(), candidate.id]));
    const freqMap: Record<string, any> = { mingguan: "weekly", bulanan: "monthly", kuartalan: "quarterly", semester: "semester", tahunan: "yearly" };
    const dirMap: Record<string, any> = { "lebih tinggi lebih baik": "higher_is_better", "lebih rendah lebih baik": "lower_is_better", tepat: "exact_match" };
    const typeMap: Record<string, any> = { input: "input", proses: "process", output: "output", outcome: "outcome" };
    const prepared = items.map((row, index) => {
      const programTitle = row.programTitle || row.program || row['Program Induk'];
      const name = row.name || row.indicator || row['Nama Indikator'] || row['Indikator KPI'];
      if (!programTitle || !name) throw new BadRequestException(`Baris ${index + 1}: Program dan indikator KPI wajib diisi.`);
      const program = programMap.get(String(programTitle).toLowerCase().trim());
      if (!program) throw new BadRequestException(`Baris ${index + 1}: Program '${programTitle}' tidak ditemukan atau di luar scope Anda.`);
      const picEmail = row.picEmail || row['Email Koordinator / PIC'] || row['Email PIC'];
      const picId = picEmail ? userEmailMap.get(String(picEmail).toLowerCase().trim()) : null;
      if (picEmail && !picId) throw new BadRequestException(`Baris ${index + 1}: PIC '${picEmail}' tidak ditemukan.`);
      const freqKey = String(row.updateFrequency || row['Frekuensi Update'] || 'Bulanan').toLowerCase().trim();
      const dirKey = String(row.direction || row['Arah Target'] || 'Lebih Tinggi Lebih Baik').toLowerCase().trim();
      const typeKey = String(row.indicatorType || row['Tipe Indikator'] || 'Output').toLowerCase().trim();
      return { program, data: { programId: program.id, name, indicatorType: typeMap[typeKey] || 'output', direction: dirMap[dirKey] || 'higher_is_better', target: Number.parseFloat(row.target || row['Target Angka'] || 0) || 0, unit: String(row.unit || row['Satuan'] || ''), weight: Number.parseFloat(row.weight || row['Bobot'] || 0) || 0, updateFrequency: freqMap[freqKey] || 'monthly', picId, baseline: 0 } };
    });
    for (const row of prepared) await this.authorization.assertBiroCanManage(user, row.program.departmentId);
    await this.prisma.$transaction(async (tx) => Promise.all(prepared.map((row) => tx.executionKPI.create({ data: row.data }))));
    return { success: true, count: prepared.length };
  }

  async exportExcelByDepartment(departmentId: string | undefined, user: any, res: Response) {
    const scope = await this.access.forPrograms(user);
    const programWhere = departmentId?.trim() ? { AND: [scope.where, { departmentId }] } : scope.where;

    const kpis = await this.prisma.executionKPI.findMany({
      where: { program: programWhere } as any,
      include: {
        program: { include: { department: true } },
        pic: true,
        evidences: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan KPI');

    // Meniru urutan kolom dari referensi gambar
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Sasaran Kinerja', key: 'sasaran', width: 35 },
      { header: 'Indikator', key: 'indikator', width: 35 },
      { header: 'Baseline', key: 'baseline', width: 10 },
      { header: 'Update Frekuensi', key: 'frekuensi', width: 18 },
      { header: 'Target Kinerja', key: 'target', width: 15 },
      { header: 'Realisasi Kinerja', key: 'realisasi', width: 18 },
      { header: 'Capaian (%)', key: 'capaian', width: 15 },
      { header: 'Status KPI', key: 'status', width: 15 },
      { header: 'Bukti / Link Drive', key: 'bukti', width: 35 },
      { header: 'PIC', key: 'pic', width: 25 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

    kpis.forEach((kpi, index) => {
      // Kalkulasi capaian (percent) untuk mewarnai Status KPI
      let percent: number;
      if (kpi.direction === 'higher_is_better') {
        percent = kpi.target > 0 ? (kpi.realization / kpi.target) * 100 : 0;
      } else if (kpi.direction === 'lower_is_better') {
        if (kpi.target === 0) {
           percent = kpi.realization === 0 ? 100 : 0;
        } else {
           percent = kpi.realization <= kpi.target ? 100 : Math.max(0, 100 - ((kpi.realization - kpi.target) / kpi.target * 100));
        }
      } else {
        percent = kpi.realization === kpi.target ? 100 : 0;
      }
      
      let statusColor = 'FFEB3B'; // default Yellow
      let statusText = 'Kuning';
      if (percent >= 85) { statusColor = '4CAF50'; statusText = 'Hijau'; }
      else if (percent < 60) { statusColor = 'F44336'; statusText = 'Merah'; }

      let frekuensiLabel = kpi.updateFrequency.replace('_', ' ');
      frekuensiLabel = frekuensiLabel.charAt(0).toUpperCase() + frekuensiLabel.slice(1);

      const linkDrive = kpi.evidences.length > 0 ? (kpi.evidences[0].digitalLink || 'Terlampir di Sistem') : '-';

      const row = worksheet.addRow({
        no: index + 1,
        sasaran: kpi.program.title || '-', // karena di tabel WorkProgram namanya title
        indikator: kpi.name,
        baseline: kpi.baseline,
        frekuensi: frekuensiLabel,
        target: `${kpi.target} ${kpi.unit}`,
        realisasi: `${kpi.realization} ${kpi.unit}`,
        capaian: `${percent.toFixed(2)}%`,
        bukti: linkDrive,
        pic: kpi.pic?.fullName || '-',
        status: statusText
      });

      // Mewarnai sel Status
      const statusCell = row.getCell('status');
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: statusColor }
      };
      statusCell.font = { color: { argb: statusColor === 'FFEB3B' ? 'FF000000' : 'FFFFFFFF' }, bold: true };
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=Laporan_KPI_Bidang.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  }

  private async findKpiWithProgram(id: string) {
    const kpi = await this.prisma.executionKPI.findUnique({ where: { id }, include: { program: true } });
    if (!kpi) throw new BadRequestException("KPI tidak ditemukan.");
    return kpi;
  }
}
