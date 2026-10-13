import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrationStatus, UserRole } from '@sim/database';

@Injectable()
export class InternalService {
  private readonly logger = new Logger(InternalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async handoffSpmb(payload: any) {
    this.logger.log(`Menerima handoff SPMB untuk registrasi ${payload.registrationNumber}`);

    return this.prisma.$transaction(async (tx) => {
      // 1. Cari atau buat User orang tua
      let parentUserId = payload.user?.id;
      if (payload.user?.email) {
        const existingUser = await tx.user.findUnique({
          where: { email: payload.user.email },
        });

        if (existingUser) {
          parentUserId = existingUser.id;
        } else {
          const newUser = await tx.user.create({
            data: {
              ...(parentUserId ? { id: parentUserId } : {}),
              fullName: payload.user.name || 'Orang Tua Santri',
              email: payload.user.email,
              phone: payload.user.phone || null,
              passwordHash: '$2b$10$temporaryHashForClaimedAccount1234567890123456789012',
              roles: {
                create: {
                  role: UserRole.orang_tua,
                },
              },
            },
          });
          parentUserId = newUser.id;
        }
      }

      if (!parentUserId) {
        // Fallback cari user admin atau user dummy jika tanpa email
        const adminUser = await tx.user.findFirst();
        if (!adminUser) throw new BadRequestException('Tidak ada user di sistem untuk mengaitkan pendaftaran.');
        parentUserId = adminUser.id;
      }

      // 2. Cari AcademicYear untuk unit ini
      let academicYear = await tx.academicYear.findFirst({
        where: {
          unitId: payload.unitId,
          ppdbActive: true,
        },
      });

      if (!academicYear) {
        academicYear = await tx.academicYear.findFirst({
          where: { unitId: payload.unitId },
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!academicYear) {
        academicYear = await tx.academicYear.findFirst({
          orderBy: { createdAt: 'desc' },
        });
      }

      if (!academicYear) {
        throw new NotFoundException('Tahun akademik belum dikonfigurasi di SIAKAD.');
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
      if (payload.student) {
        await tx.studentData.upsert({
          where: { registrationId: registration.id },
          create: {
            registrationId: registration.id,
            fullName: payload.student.fullName,
            nickname: payload.student.nickname || null,
            gender: payload.student.gender === 'female' ? 'female' : 'male',
            birthPlace: payload.student.birthPlace || 'Kota Asal',
            birthDate: new Date(payload.student.birthDate || '2018-01-01'),
            nisn: payload.student.nisn || null,
            address: payload.student.address || 'Alamat domisili',
          },
          update: {
            fullName: payload.student.fullName,
            nickname: payload.student.nickname || null,
            gender: payload.student.gender === 'female' ? 'female' : 'male',
            birthPlace: payload.student.birthPlace || 'Kota Asal',
            birthDate: new Date(payload.student.birthDate || '2018-01-01'),
            nisn: payload.student.nisn || null,
            address: payload.student.address || 'Alamat domisili',
          },
        });
      }

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
