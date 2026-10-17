import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { assertTeacherAssignmentAccess, type SiakadPrincipal } from "../common/siakad-scope-policy";

export interface RecordGradeDto {
  assignmentId: string;
  enrollmentId: string;
  category: string;
  score: number;
  feedback?: string;
}

export interface RecordJournalDto {
  assignmentId: string;
  date: Date | string;
  topic: string;
  notes?: string;
  studentCountPresent?: number;
  studentCountAbsent?: number;
}

@Injectable()
export class TeachingWorkflowService {
  constructor(private readonly prisma: PrismaService) {}

  async recordGrade(principal: SiakadPrincipal, dto: RecordGradeDto) {
    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: { id: dto.assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException("Penugasan guru tidak ditemukan");
    }

    assertTeacherAssignmentAccess(principal, {
      unitId: (assignment as any).unitId ?? "",
      teacherUserId: assignment.teacherUserId,
    });

    return this.prisma.grade.create({
      data: {
        teacherAssignmentId: dto.assignmentId,
        enrollmentId: dto.enrollmentId,
        category: dto.category,
        score: dto.score,
        feedback: dto.feedback,
      },
    });
  }

  async recordJournal(principal: SiakadPrincipal, dto: RecordJournalDto) {
    const assignment = await this.prisma.teacherAssignment.findUnique({
      where: { id: dto.assignmentId },
    });
    if (!assignment) {
      throw new NotFoundException("Penugasan guru tidak ditemukan");
    }

    assertTeacherAssignmentAccess(principal, {
      unitId: (assignment as any).unitId ?? "",
      teacherUserId: assignment.teacherUserId,
    });

    return this.prisma.teachingJournal.create({
      data: {
        teacherAssignmentId: dto.assignmentId,
        date: new Date(dto.date),
        topic: dto.topic,
        notes: dto.notes,
        studentCountPresent: dto.studentCountPresent ?? 0,
        studentCountAbsent: dto.studentCountAbsent ?? 0,
      },
    });
  }
}
