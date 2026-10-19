import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type UserProjection = {
  id: string;
  fullName: string;
  email: string;
  username?: string | null;
  avatarUrl?: string | null;
  isActive: boolean;
  sourceUpdatedAt: string;
};

@Injectable()
export class OrganizationUsersSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async sync(id: string, user: UserProjection) {
    if (id !== user.id) throw new BadRequestException("ID path dan body harus sama.");
    const sourceUpdatedAt = new Date(user.sourceUpdatedAt);
    if (Number.isNaN(sourceUpdatedAt.getTime())) throw new BadRequestException("Versi sumber pengguna tidak valid.");
    const data = {
      fullName: user.fullName,
      email: user.email,
      username: user.username ?? null,
      avatarUrl: user.avatarUrl ?? null,
      isActive: user.isActive,
      syncedAt: new Date(),
      sourceUpdatedAt,
    };
    const where = { id, OR: [{ sourceUpdatedAt: null }, { sourceUpdatedAt: { lt: sourceUpdatedAt } }] };

    const updated = await (this.prisma as any).user.updateMany({ where, data });
    if (updated.count === 1) return (this.prisma as any).user.findUnique({ where: { id } });

    try {
      return await (this.prisma as any).user.create({ data: { id, ...data } });
    } catch (error: any) {
      if (error?.code !== "P2002") throw error;
      const retried = await (this.prisma as any).user.updateMany({ where, data });
      if (retried.count === 1) return (this.prisma as any).user.findUnique({ where: { id } });
      return (this.prisma as any).user.findUnique({ where: { id } });
    }
  }
}
