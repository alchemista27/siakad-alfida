import { randomBytes } from 'crypto';
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus, UserRole } from '@sim/database';

@Injectable()
export class InternalService {
  private readonly logger = new Logger(InternalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handoffSpmb(payload: any) {
    if (
      typeof payload?.user?.id !== 'string' ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.user.id)
    ) {
      throw new BadRequestException('Identitas orang tua harus menyertakan id yang stabil.');
    }

    if (
      typeof payload.user.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.user.email)
    ) {
      throw new BadRequestException('Identitas orang tua harus menyertakan email yang valid.');
    }

    const student = payload.student;
    if (!student || typeof student !== 'object' || Array.isArray(student)) {
      throw new BadRequestException('Data santri wajib disertakan.');
    }

    if (
      typeof student.fullName !== 'string' ||
      !student.fullName.trim() ||
      typeof student.birthPlace !== 'string' ||
      !student.birthPlace.trim() ||
      typeof student.address !== 'string' ||
      !student.address.trim() ||
      !['male', 'female'].includes(student.gender) ||
      typeof student.birthDate !== 'string' ||
      Number.isNaN(Date.parse(student.birthDate))
    ) {
      throw new BadRequestException('Data santri wajib lengkap dan valid.');
    }

    this.logger.log(`Menerima handoff SPMB untuk registrasi ${payload.registrationNumber}`);

    return this.prisma.$transaction(async (tx) => {
      // 1. Cari atau buat User orang tua dari identitas handoff tervalidasi
      let parentUserId = payload.user.id;
      const existingUser = await tx.user.findUnique({
        where: { email: payload.user.email },
      });

      if (existingUser) {
        parentUserId = existingUser.id;
      } else {
        const newUser = await tx.user.create({
          data: {
            id: parentUserId,
            fullName: payload.user.name || 'Orang Tua Santri',
            email: payload.user.email,
            phone: payload.user.phone || null,
            passwordHash: await bcrypt.hash(randomBytes(32).toString('base64url'), 10),
            roles: {
              create: {
                role: UserRole.orang_tua,
              },
            },
          },
        });
        parentUserId = newUser.id;
      }

      // 2. Cari AcademicYear PPDB aktif untuk unit tujuan
      const academicYear = await tx.academicYear.findFirst({
        where: {
          unitId: payload.unitId,
          ppdbActive: true,
        },
      });

      if (!academicYear) {
        throw new NotFoundException('Tahun akademik PPDB aktif belum dikonfigurasi untuk unit tujuan di SIAKAD.');
      }

      // 3. Upsert Registration
      const registration = await tx.registration.upsert({
        where: { registrationNumber: payload.registrationNumber },
        create: {
          registrationNumber: payload.registrationNumber,
          parentId: parentUserId,
          academicYearId: academicYear.id,
          status: RegistrationStatus.accepted,
        },
        update: {
          status: RegistrationStatus.accepted,
          parentId: parentUserId,
          academicYearId: academicYear.id,
        },
      });

      // 4. Upsert StudentData
      await tx.studentData.upsert({
        where: { registrationId: registration.id },
        create: {
          registrationId: registration.id,
          fullName: student.fullName,
          nickname: student.nickname || null,
          gender: student.gender,
          birthPlace: student.birthPlace,
          birthDate: new Date(student.birthDate),
          nisn: student.nisn || null,
          address: student.address,
        },
        update: {
          fullName: student.fullName,
          nickname: student.nickname || null,
          gender: student.gender,
          birthPlace: student.birthPlace,
          birthDate: new Date(student.birthDate),
          nisn: student.nisn || null,
          address: student.address,
        },
      });

      // 5. Upsert ParentData jika ada
      if (Array.isArray(payload.parents)) {
        for (const p of payload.parents) {
          if (!p.type || !p.fullName) continue;
          await tx.parentData.upsert({
            where: {
              registrationId_type: {
                registrationId: registration.id,
                type: p.type,
              },
            },
            create: {
              registrationId: registration.id,
              type: p.type,
              fullName: p.fullName,
              nik: p.nik || null,
              phone: p.phone || null,
              education: p.education || null,
              occupation: p.occupation || null,
              incomeRange: p.incomeRange || null,
            },
            update: {
              fullName: p.fullName,
              nik: p.nik || null,
              phone: p.phone || null,
              education: p.education || null,
              occupation: p.occupation || null,
              incomeRange: p.incomeRange || null,
            },
          });
        }
      }

      return {
        success: true,
        destinationRegistrationId: registration.id,
        registrationId: registration.id,
        registrationNumber: registration.registrationNumber,
        message: 'Data pendaftar berhasil disinkronkan ke SIAKAD dan siap diplacement di kelas.',
      };
    });
  }

  async getUnits() {
    return this.prisma.unit.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        level: true,
      },
      orderBy: { name: 'asc' },
    });
  }
}
