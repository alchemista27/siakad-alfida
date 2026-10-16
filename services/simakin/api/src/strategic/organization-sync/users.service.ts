import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

export type UserProjection = { id: string; fullName: string; email: string; username?: string | null; avatarUrl?: string | null; isActive: boolean };

@Injectable()
export class OrganizationUsersSyncService {
  constructor(private readonly prisma: PrismaService) {}
  async sync(id: string, user: UserProjection) {
    if (id !== user.id) throw new BadRequestException("ID path dan body harus sama.");
    return (this.prisma as any).user.upsert({ where: { id }, create: { ...user, syncedAt: new Date() }, update: { fullName: user.fullName, email: user.email, username: user.username ?? null, avatarUrl: user.avatarUrl ?? null, isActive: user.isActive, syncedAt: new Date() } });
  }
}
