import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

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
      studentName: reg.studentData?.fullName || "Calon Siswa",
      guardianName: reg.guardianName,
      status: reg.status,
    };
  }

  async claimInvite(token: string, parentId: string) {
    const reg = await this.prisma.registration.findUnique({
      where: { inviteToken: token },
    });

    if (!reg) {
      throw new NotFoundException("Tautan undangan tidak valid.");
    }

    if (reg.claimedAt) {
      throw new BadRequestException("Pendaftaran ini sudah diklaim sebelumnya.");
    }

    if (reg.inviteExpiresAt && reg.inviteExpiresAt < new Date()) {
      throw new BadRequestException("Tautan undangan telah kedaluwarsa.");
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.registration.update({
        where: { id: reg.id },
        data: {
          parentId,
          claimedAt: new Date(),
        },
      });

      await tx.registrationEvent.create({
        data: {
          registrationId: reg.id,
          actorId: parentId,
          toStatus: reg.status,
          kind: "claim",
          note: `Pendaftaran luring berhasil diklaim dan dihubungkan ke akun orang tua (User ID: ${parentId})`,
        },
      });

      return updated;
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
      `Alhamdulillah berkas pendaftaran SPMB ${unitName} untuk calon santri/siswa *${studentName}* telah tercatat di sistem kami.\n\n` +
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
