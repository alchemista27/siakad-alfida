import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getMetrics() {
    const [totalGroups, totalMembers, totalSetoran, setoranStats] = await Promise.all([
      this.prisma.ymqGroup.count(),
      this.prisma.ymqMember.count(),
      this.prisma.ymqSetoran.count(),
      this.prisma.ymqSetoran.aggregate({
        _sum: { jumlahHalaman: true },
      }),
    ]);

    const verifiedCount = await this.prisma.ymqSetoran.count({
      where: { statusVerifikasi: "verified" },
    });

    const pendingCount = await this.prisma.ymqSetoran.count({
      where: { statusVerifikasi: "pending" },
    });

    return {
      totalGroups,
      totalMembers,
      totalSetoran,
      totalHalaman: setoranStats._sum.jumlahHalaman || 0,
      totalKhatamEstimasi: Math.floor((setoranStats._sum.jumlahHalaman || 0) / 604),
      verifiedCount,
      pendingCount,
    };
  }
}
