import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { hasYmqRole, type YmqPrincipal } from "../ymq/ymq-access.policy";
import type {
  CreateExaminerAssignmentDto,
  ExaminerAssignmentGender,
  ExaminerAssignmentLevel,
  ExaminerAssignmentTarget,
} from "./examiner-assignments.dto";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const LEVELS: readonly ExaminerAssignmentLevel[] = ["pra_tahsin", "tahsin", "tahfiz"];
const TARGETS: readonly ExaminerAssignmentTarget[] = ["pembina", "peserta"];
const GENDERS: readonly ExaminerAssignmentGender[] = ["ikhwan", "akhwat"];

@Injectable()
export class ExaminerAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(academicYear: string | undefined, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    const normalizedAcademicYear = this.normalizeAcademicYear(academicYear);
    return this.prisma.ymqExaminerAssignment.findMany({
      where: { academicYear: normalizedAcademicYear, revokedAt: null },
      select: {
        id: true,
        academicYear: true,
        target: true,
        gender: true,
        unitId: true,
        unitName: true,
        levels: true,
        assignedAt: true,
        examiner: { select: { id: true, fullName: true, email: true, unitId: true, unitName: true } },
      },
      orderBy: [
        { target: "asc" },
        { gender: "asc" },
        { unitName: "asc" },
        { examiner: { fullName: "asc" } },
        { id: "asc" },
      ],
    });
  }

  async assign(dto: CreateExaminerAssignmentDto, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    const input = this.normalizeInput(dto);
    const examiner = await this.prisma.user.findUnique({
      where: { id: input.examinerUserId },
      select: { id: true, isActive: true, sourceUpdatedAt: true },
    });
    if (!examiner?.isActive || !examiner.sourceUpdatedAt) {
      throw new BadRequestException("Penguji harus pegawai aktif dari proyeksi SIMPEG.");
    }

    let unitName: string | null = null;
    if (input.target === "peserta") {
      const unit = await this.prisma.user.findFirst({
        where: { unitId: input.unitId!, isActive: true, sourceUpdatedAt: { not: null } },
        select: { unitName: true },
      });
      if (!unit?.unitName) throw new BadRequestException("unitId harus berasal dari proyeksi pegawai SIMPEG aktif.");
      unitName = unit.unitName;
    }

    const active = await this.prisma.ymqExaminerAssignment.findFirst({
      where: {
        academicYear: input.academicYear,
        target: input.target,
        gender: input.gender,
        unitId: input.unitId,
        revokedAt: null,
      },
      select: { id: true },
    });
    if (active) throw new BadRequestException("Penugasan penguji aktif untuk sasaran ini sudah ada.");

    try {
      return await this.prisma.ymqExaminerAssignment.create({
        data: {
          examinerUserId: input.examinerUserId,
          academicYear: input.academicYear,
          target: input.target,
          gender: input.gender,
          unitId: input.unitId,
          unitName,
          levels: input.levels,
          assignedById: principal.id,
        },
        select: {
          id: true,
          academicYear: true,
          target: true,
          gender: true,
          unitId: true,
          unitName: true,
          levels: true,
          assignedAt: true,
          examiner: { select: { id: true, fullName: true, email: true, unitId: true, unitName: true } },
        },
      });
    } catch (error: unknown) {
      if (this.isUniqueConstraint(error)) throw new BadRequestException("Penugasan penguji aktif untuk sasaran ini sudah ada.");
      throw error;
    }
  }

  async revoke(id: string, principal: YmqPrincipal) {
    this.requireAdmin(principal);
    if (!UUID_PATTERN.test(id)) throw new BadRequestException("id penugasan harus berupa UUID yang valid.");
    try {
      await this.prisma.ymqExaminerAssignment.findFirstOrThrow({ where: { id, revokedAt: null }, select: { id: true } });
    } catch {
      throw new NotFoundException("Penugasan penguji aktif tidak ditemukan.");
    }
    await this.prisma.ymqExaminerAssignment.update({ where: { id }, data: { revokedAt: new Date() } });
    return { id, revoked: true };
  }

  private requireAdmin(principal: YmqPrincipal) {
    if (!hasYmqRole(principal, "admin_ymq")) {
      throw new ForbiddenException("Hanya Admin YMQ yang dapat mengelola penugasan penguji.");
    }
  }

  private normalizeInput(dto: CreateExaminerAssignmentDto) {
    if (!dto || typeof dto !== "object") throw new BadRequestException("Payload penugasan penguji tidak valid.");
    const academicYear = this.normalizeAcademicYear(dto.academicYear);
    if (typeof dto.examinerUserId !== "string" || !UUID_PATTERN.test(dto.examinerUserId)) {
      throw new BadRequestException("examinerUserId harus berupa UUID yang valid.");
    }
    if (!(TARGETS as readonly string[]).includes(dto.target)) throw new BadRequestException("Sasaran penguji tidak valid.");
    if (!(GENDERS as readonly string[]).includes(dto.gender)) throw new BadRequestException("Gender penguji tidak valid.");
    if (!Array.isArray(dto.levels) || dto.levels.some((level) => !(LEVELS as readonly string[]).includes(level))) {
      throw new BadRequestException("Level penugasan penguji tidak valid.");
    }
    const levels = [...new Set(dto.levels)].sort((left, right) => LEVELS.indexOf(left) - LEVELS.indexOf(right));
    if (dto.target === "pembina") {
      if (dto.unitId !== null && dto.unitId !== undefined) throw new BadRequestException("Sasaran Pembina YMQ tidak memakai unit.");
      if (levels.length) throw new BadRequestException("Sasaran Pembina YMQ tidak memakai level pembelajaran.");
      return { academicYear, examinerUserId: dto.examinerUserId, target: dto.target, gender: dto.gender, unitId: null, levels };
    }
    if (typeof dto.unitId !== "string" || !UUID_PATTERN.test(dto.unitId)) {
      throw new BadRequestException("Sasaran peserta wajib memilih unit yang valid.");
    }
    if (!levels.length) throw new BadRequestException("Sasaran peserta wajib memilih sedikitnya satu level pembelajaran.");
    return { academicYear, examinerUserId: dto.examinerUserId, target: dto.target, gender: dto.gender, unitId: dto.unitId, levels };
  }

  private normalizeAcademicYear(value: unknown): string {
    if (typeof value !== "string" || !/^\d{4}\/\d{4}$/.test(value)) {
      throw new BadRequestException("Tahun akademik harus berformat YYYY/YYYY.");
    }
    const [start, end] = value.split("/").map(Number);
    if (end !== start + 1) throw new BadRequestException("Tahun akademik harus terdiri dari dua tahun berurutan.");
    return value;
  }

  private isUniqueConstraint(error: unknown): error is { code: string } {
    return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
  }
}
