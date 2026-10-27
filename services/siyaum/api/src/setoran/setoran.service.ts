import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSetoranDto, VerifySetoranDto } from "./setoran.dto";
import { SetoranType, VerificationStatus } from "../generated/prisma";
import { hasYmqRole, type YmqPrincipal } from "../ymq/ymq-access.policy";

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
      include: { user: { select: { fullName: true, unitName: true } } },
    });
  }

  async findMySetoran(userId: string, limit = 20) {
    return this.prisma.ymqSetoran.findMany({
      where: { userId },
      include: { verifiedBy: { select: { fullName: true } } },
      orderBy: { date: "desc" },
      take: limit,
    });
  }

  async findPendingVerification(principal: YmqPrincipal) {
    if (hasYmqRole(principal, "admin_ymq")) return this.findPending();
    this.requirePembina(principal);
    const memberIds = (await this.prisma.ymqGroup.findMany({
      where: { pembinaUserId: principal.id },
      include: { members: { where: { leftAt: null }, select: { userId: true } } },
    })).flatMap((group) => group.members.map((member) => member.userId));
    if (memberIds.length === 0) return [];
    return this.findPending(memberIds);
  }

  async verify(id: string, principal: YmqPrincipal, dto: VerifySetoranDto) {
    const setoran = await this.prisma.ymqSetoran.findUnique({ where: { id } });
    if (!setoran) throw new NotFoundException("Data setoran tidak ditemukan.");
    await this.assertCanVerifySetoran(principal, setoran.userId);
    return this.prisma.ymqSetoran.update({
      where: { id },
      data: {
        statusVerifikasi: dto.status as VerificationStatus,
        catatanPembina: dto.catatanPembina || null,
        verifiedById: principal.id,
        verifiedAt: new Date(),
      },
      include: { user: { select: { fullName: true } } },
    });
  }

  private async findPending(memberIds?: string[]) {
    return this.prisma.ymqSetoran.findMany({
      where: { ...(memberIds ? { userId: { in: memberIds } } : {}), statusVerifikasi: VerificationStatus.pending },
      include: { user: { select: { id: true, fullName: true, email: true, unitName: true } } },
      orderBy: { date: "desc" },
    });
  }

  private async assertCanVerifySetoran(principal: YmqPrincipal, participantUserId: string) {
    if (hasYmqRole(principal, "admin_ymq")) return;
    this.requirePembina(principal);
    const assignedGroup = await this.prisma.ymqGroup.findFirst({
      where: {
        pembinaUserId: principal.id,
        members: { some: { userId: participantUserId, leftAt: null } },
      },
      select: { id: true },
    });
    if (!assignedGroup) throw new ForbiddenException("Anda tidak berwenang memverifikasi setoran peserta ini.");
  }

  private requirePembina(principal: YmqPrincipal) {
    if (!hasYmqRole(principal, "pembina_ymq")) {
      throw new ForbiddenException("Hanya Pembina YMQ yang dapat memverifikasi setoran kelompok.");
    }
  }
}
