import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

type ClaimPrincipal = {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string | null;
};

@Injectable()
export class InvitesService {
  constructor(private readonly prisma: PrismaService) {}

  async getInviteDetails(token: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { inviteToken: token },
      include: {
        period: true,
        studentData: true,
      },
    });

    if (!reg) {
      throw new NotFoundException("Tautan undangan klaim tidak valid.");
    }

    if (reg.claimedAt) {
      throw new BadRequestException("Pendaftaran ini sudah diklaim oleh akun orang tua.");
    }

    if (reg.inviteExpiresAt && reg.inviteExpiresAt < new Date()) {
      throw new BadRequestException("Tautan undangan ini telah kedaluwarsa. Silakan hubungi admin panitia SPMB.");
    }

    return {
      registrationId: reg.id,
      registrationNumber: reg.registrationNumber,
      unitName: reg.period.unitName,
      studentName: reg.studentData?.fullName || "Calon Murid",
      guardianName: reg.guardianName,
      status: reg.status,
    };
  }

  async claimInvite(token: string, principal: ClaimPrincipal) {
    const normalizedToken = token.trim();
    if (!principal.id || !principal.email) {
      throw new ForbiddenException("Identitas akun orang tua tidak lengkap.");
    }

    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.registration.findUnique({
        where: { inviteToken: normalizedToken },
      });
      if (!registration) {
        throw new NotFoundException("Tautan undangan tidak valid.");
      }

      const now = new Date();
      if (registration.inviteExpiresAt && registration.inviteExpiresAt <= now) {
        throw new BadRequestException("Tautan undangan telah kedaluwarsa.");
      }

      await tx.user.upsert({
        where: { id: principal.id },
        create: {
          id: principal.id,
          email: principal.email,
          fullName: principal.fullName?.trim() || principal.email,
          phone: principal.phone?.trim() || null,
        },
        update: {
          email: principal.email,
          fullName: principal.fullName?.trim() || principal.email,
          phone: principal.phone?.trim() || null,
        },
      });

      const claimed = await tx.registration.updateMany({
        where: {
          id: registration.id,
          parentId: null,
          claimedAt: null,
          inviteToken: normalizedToken,
          inviteExpiresAt: { gt: now },
        },
        data: {
          parentId: principal.id,
          claimedAt: now,
        },
      });
      if (claimed.count !== 1) {
        throw new ConflictException("Tautan klaim sudah digunakan atau tidak lagi valid.");
      }

      await tx.registrationEvent.create({
        data: {
          registrationId: registration.id,
          actorId: principal.id,
          toStatus: registration.status,
          kind: "claim",
          note: "Pendaftaran luring berhasil diklaim dan dihubungkan ke akun orang tua.",
        },
      });

      return tx.registration.findUnique({ where: { id: registration.id } });
    });
  }

  async getWhatsAppShareLink(registrationId: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { id: registrationId },
      include: {
        period: true,
        studentData: true,
      },
    });

    if (!reg) throw new NotFoundException("Pendaftaran tidak ditemukan.");

    const phone = (reg.guardianPhone || "").replace(/[^0-9]/g, "");
    let cleanPhone = phone;
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "62" + cleanPhone.slice(1);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://spmb.alfida.or.id";
    const claimUrl = `${appUrl}/claim/${reg.inviteToken}`;
    const studentName = reg.studentData?.fullName || "Putra/Putri Anda";
    const unitName = reg.period.unitName;

    const message =
      `Assalamu'alaikum Wr. Wb. Bapak/Ibu ${reg.guardianName},\n\n` +
      `Alhamdulillah berkas pendaftaran SPMB ${unitName} untuk calon murid *${studentName}* telah tercatat di sistem kami.\n\n` +
      `Nomor Pendaftaran: *${reg.registrationNumber}*\n\n` +
      `Silakan klik tautan resmi berikut untuk mengaktifkan akun dan memantau status seleksi secara online:\n` +
      `${claimUrl}\n\n` +
      `Terima kasih.\nPanitia SPMB Yayasan Alfida`;

    const encodedMessage = encodeURIComponent(message);
    const waLink = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    return {
      claimUrl,
      waLink,
      message,
    };
  }
}
