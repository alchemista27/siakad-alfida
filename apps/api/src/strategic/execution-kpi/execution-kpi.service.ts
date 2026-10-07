
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExecutionKPIDto, UpdateExecutionKPIDto } from '../dto/kpi.dto';

import * as ExcelJS from 'exceljs';
import { Response } from 'express';

@Injectable()
export class ExecutionKpiService {
  constructor(private prisma: PrismaService) {}

  async findAll(user?: any) {
    let whereClause = {};
    if (user && !user.roles?.some((r: any) => r.role === 'super_admin')) {
      const myDepts = await this.prisma.departmentAdmin.findMany({
        where: { userId: user.id },
        select: { departmentId: true }
      });
      const deptIds = myDepts.map(d => d.departmentId);
      whereClause = { program: { departmentId: { in: deptIds } } };
    }

    return this.prisma.executionKPI.findMany({
      where: whereClause,
      include: { program: true, pic: true, realizationLogs: true, evidences: true },
    });
  }

  async findByProgram(programId: string) {
    return this.prisma.executionKPI.findMany({
      where: { programId },
      include: { pic: true, realizationLogs: true, evidences: true },
    });
  }

  async findOne(id: string) {
    return this.prisma.executionKPI.findUnique({
      where: { id },
      include: { program: true, pic: true, realizationLogs: true, evidences: true }
    });
  }

  async create(data: CreateExecutionKPIDto) {
    return this.prisma.executionKPI.create({ data: data as any });
  }

  async update(id: string, data: UpdateExecutionKPIDto) {
    return this.prisma.executionKPI.update({ where: { id }, data: data as any });
  }

  async submitBaseline(id: string, evidenceId: string) {
    return this.prisma.$transaction(async (tx) => {
      const kpi = await tx.executionKPI.update({
        where: { id },
        data: { baselineStatus: 'submitted' }
      });
      await tx.executionEvidence.update({
        where: { id: evidenceId },
        data: { kpiId: id, availabilityStatus: 'submitted' }
      });
      return kpi;
    });
  }

  async verifyBaseline(id: string, verifierId: string, status: any, notes: string | null = null) {
    return this.prisma.executionKPI.update({
      where: { id },
      data: { baselineStatus: status, notes: notes || undefined }
    });
  }

  async remove(id: string) {
    return this.prisma.executionKPI.delete({ where: { id } });
  }

  async exportExcelByDepartment(departmentId: string, res: Response) {
    let whereClause = {};
    if (departmentId && departmentId.trim() !== '') {
      whereClause = { program: { departmentId } };
    }

    const kpis = await this.prisma.executionKPI.findMany({
      where: whereClause,
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
      { header: 'Update Frekuensi', key: 'frekuensi', width: 18 },
      { header: 'Target Kinerja', key: 'target', width: 15 },
      { header: 'Realisasi Kinerja', key: 'realisasi', width: 18 },
      { header: 'Bukti / Link Drive', key: 'bukti', width: 35 },
      { header: 'PIC', key: 'pic', width: 25 },
      { header: 'Status KPI', key: 'status', width: 15 }
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };

    kpis.forEach((kpi, index) => {
      // Kalkulasi capaian (percent) untuk mewarnai Status KPI
      let percent = 0;
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
        frekuensi: frekuensiLabel,
        target: `${kpi.target} ${kpi.unit}`,
        realisasi: `${kpi.realization} ${kpi.unit}`,
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
}
