import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface PlaceStudentDto {
  enrollmentId: string;
  classId: string;
}

@Injectable()
export class PlacementService {
  constructor(private readonly prisma: PrismaService) {}

  async placeStudent(principal: SiakadPrincipal, dto: PlaceStudentDto) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
    });
    if (!enrollment) {
      throw new NotFoundException("Data pendaftaran akademik (enrollment) tidak ditemukan");
    }

    assertUnitAccess(principal, (enrollment as any).student?.unitId);

    const classroom = await this.prisma.classroom.findUnique({
      where: { id: dto.classId },
    });
    if (!classroom) {
      throw new NotFoundException("Kelas tujuan tidak ditemukan");
    }

    assertUnitAccess(principal, classroom.unitId);

    if (classroom.academicYearId !== enrollment.academicYearId) {
      throw new BadRequestException("Kelas tujuan berada pada tahun ajaran yang berbeda");
    }

    // Check capacity
    const currentCount = await this.prisma.enrollment.count({
      where: {
        classId: classroom.id,
        status: "active",
      },
    });

    if (currentCount >= classroom.capacity) {
      throw new BadRequestException(`Kapasitas kelas (${classroom.capacity}) telah penuh`);
    }

    return this.prisma.enrollment.update({
      where: { id: dto.enrollmentId },
      data: {
        classId: dto.classId,
        status: "active",
      },
    });
  }
}
