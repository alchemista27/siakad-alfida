import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertUnitAccess, allowedUnitIds, isSuperAdmin, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface PlaceStudentDto {
  enrollmentId: string;
  classId: string;
}

export interface ListUnplacedFilter {
  unitId?: string;
  academicYearId?: string;
}

@Injectable()
export class PlacementService {
  constructor(private readonly prisma: PrismaService) {}

  async listUnplaced(principal: SiakadPrincipal, filter: ListUnplacedFilter = {}) {
    if (filter.unitId) assertUnitAccess(principal, filter.unitId);
    if (filter.academicYearId) {
      const year = await this.prisma.academicYear.findUnique({ where: { id: filter.academicYearId } });
      if (!year) throw new NotFoundException("Tahun ajaran tidak ditemukan");
      assertUnitAccess(principal, year.unitId);
      if (filter.unitId && filter.unitId !== year.unitId) {
        throw new BadRequestException("Tahun ajaran tidak sesuai dengan unit");
      }
    }

    const targetUnits = filter.unitId
      ? [filter.unitId]
      : isSuperAdmin(principal)
        ? undefined
        : Array.from(allowedUnitIds(principal));
    return this.prisma.enrollment.findMany({
      where: {
        classId: null,
        status: "pending_placement",
        ...(filter.academicYearId ? { academicYearId: filter.academicYearId } : {}),
        ...(targetUnits ? { student: { unitId: { in: targetUnits } } } : {}),
      },
      include: { student: true, academicYear: true },
      orderBy: { enrolledAt: "asc" },
    });
  }

  async listRoster(principal: SiakadPrincipal, classId: string) {
    const classroom = await this.getClassroom(principal, classId);
    return this.prisma.enrollment.findMany({
      where: { classId: classroom.id, status: "active" },
      include: { student: true },
      orderBy: { student: { fullName: "asc" } },
    });
  }

  async placeStudent(principal: SiakadPrincipal, dto: PlaceStudentDto) {
    return this.prisma.$transaction((tx) => this.assignToClass(tx as any, principal, dto, false), {
      isolationLevel: "Serializable",
    });
  }

  async moveStudent(principal: SiakadPrincipal, dto: PlaceStudentDto) {
    return this.prisma.$transaction((tx) => this.assignToClass(tx as any, principal, dto, true), {
      isolationLevel: "Serializable",
    });
  }

  private async getClassroom(principal: SiakadPrincipal, classId: string) {
    const classroom = await this.prisma.classroom.findUnique({ where: { id: classId } });
    if (!classroom) throw new NotFoundException("Kelas tujuan tidak ditemukan");
    assertUnitAccess(principal, classroom.unitId);
    return classroom;
  }

  private async assignToClass(prisma: any, principal: SiakadPrincipal, dto: PlaceStudentDto, requireExistingClass: boolean) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: dto.enrollmentId },
      include: {
        student: {
          select: {
            id: true,
            unitId: true,
            admissionReceipt: { select: { spmbRegistrationId: true } },
          },
        },
      },
    });
    if (!enrollment) throw new NotFoundException("Data pendaftaran akademik (enrollment) tidak ditemukan");
    if (!enrollment.student?.unitId) throw new BadRequestException("Unit siswa enrollment tidak ditemukan");
    assertUnitAccess(principal, enrollment.student.unitId);

    if (requireExistingClass && (!enrollment.classId || enrollment.status !== "active")) {
      throw new BadRequestException("Enrollment belum berada pada kelas aktif untuk dipindahkan");
    }
    if (!requireExistingClass && enrollment.status !== "pending_placement") {
      throw new BadRequestException("Enrollment tidak menunggu penempatan kelas");
    }

    const classroom = await prisma.classroom.findUnique({ where: { id: dto.classId } });
    if (!classroom) throw new NotFoundException("Kelas tujuan tidak ditemukan");
    assertUnitAccess(principal, classroom.unitId);
    if (classroom.unitId !== enrollment.student.unitId) {
      throw new BadRequestException("Siswa dan kelas tujuan harus berada pada unit yang sama");
    }
    if (classroom.academicYearId !== enrollment.academicYearId) {
      throw new BadRequestException("Kelas tujuan berada pada tahun ajaran yang berbeda");
    }
    if (enrollment.classId === classroom.id) {
      throw new BadRequestException("Siswa sudah berada di kelas tujuan");
    }

    const currentCount = await prisma.enrollment.count({ where: { classId: classroom.id, status: "active" } });
    if (currentCount >= classroom.capacity) {
      throw new BadRequestException(`Kapasitas kelas (${classroom.capacity}) telah penuh`);
    }

    const placed = await prisma.enrollment.update({
      where: { id: dto.enrollmentId },
      data: { classId: dto.classId, status: "active" },
    });

    const sourceRegistrationId = enrollment.student.admissionReceipt?.spmbRegistrationId;
    if (sourceRegistrationId && (prisma as any).spmbConfirmationOutbox?.upsert) {
      await (prisma as any).spmbConfirmationOutbox.upsert({
        where: { enrollmentId: placed.id },
        create: {
          enrollmentId: placed.id,
          sourceRegistrationId,
          academicYearId: placed.academicYearId,
          classId: placed.classId,
          idempotencyKey: `spmb-confirmation:${placed.id}`,
          status: "pending",
          availableAt: new Date(),
        },
        update: {},
      });
    }

    return placed;
  }
}
