import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSetoranDto, VerifySetoranDto } from "./setoran.dto";
import { SetoranType, VerificationStatus } from "../generated/prisma";

@Injectable()
export class SetoranService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateSetoranDto) {
    const setoranDate = new Date(dto.date);

    return this.prisma.ymqSetoran.create({
      data: {
        userId,
        date: setoranDate,
        jenis: dto.jenis as SetoranType,
        surahMulai: dto.surahMulai,
        ayatMulai: Number(dto.ayatMulai),
        surahSelesai: dto.surahSelesai,
        ayatSelesai: Number(dto.ayatSelesai),
        jumlahHalaman: Number(dto.jumlahHalaman) || 1,
        catatan: dto.catatan || null,
        statusVerifikasi: VerificationStatus.pending,
      },
      include: {
        user: {
          select: { fullName: true, unitName: true },
        },
      },
    });
  }

  async findMySetoran(userId: string, limit = 20) {
    return this.prisma.ymqSetoran.findMany({
      where: { userId },
      include: {
        verifiedBy: {
          select: { fullName: true },
        },
      },
      orderBy: { date: "desc" },
      take: limit,
    });
  }

  async findPendingVerification(musyrifId: string) {
    // Ambil kelompok halaqah yang diampu oleh musyrif ini
    const groups = await this.prisma.ymqGroup.findMany({
      where: { musyrifId },
      include: {
        members: { select: { userId: true } },
      },
    });

    const memberIds = groups.flatMap((g) => g.members.map((m) => m.userId));

    if (memberIds.length === 0) {
      return [];
    }

    return this.prisma.ymqSetoran.findMany({
      where: {
        userId: { in: memberIds },
        statusVerifikasi: VerificationStatus.pending,
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, unitName: true },
        },
      },
      orderBy: { date: "desc" },
    });
  }

  async verify(id: string, musyrifId: string, dto: VerifySetoranDto) {
    const setoran = await this.prisma.ymqSetoran.findUnique({ where: { id } });
    if (!setoran) {
      throw new NotFoundException("Data setoran tidak ditemukan.");
    }

    return this.prisma.ymqSetoran.update({
      where: { id },
      data: {
        statusVerifikasi: dto.status as VerificationStatus,
        catatanMusyrif: dto.catatanMusyrif || null,
        verifiedById: musyrifId,
        verifiedAt: new Date(),
      },
      include: {
        user: {
          select: { fullName: true },
        },
      },
    });
  }
}
