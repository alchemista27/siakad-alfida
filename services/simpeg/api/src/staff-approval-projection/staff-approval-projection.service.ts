import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type EmploymentRole = "guru" | "karyawan";

export type StaffApprovalProjectionInput = {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
  unitId: string;
  employmentRole: EmploymentRole;
};

export function parseStaffApprovalProjection(input: unknown): StaffApprovalProjectionInput {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new BadRequestException("Payload persetujuan staf tidak valid.");
  }
  const value = input as Record<string, unknown>;
  const validOptionalString = (item: unknown, limit: number): item is string | null =>
    item === null || (typeof item === "string" && item.trim().length > 0 && item.length <= limit);
  const fullName = typeof value.fullName === "string" ? value.fullName.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim().toLowerCase() : "";
  if (
    typeof value.id !== "string" || !UUID.test(value.id) ||
    fullName.length < 1 || fullName.length > 200 ||
    !/^\S+@\S+\.\S+$/.test(email) || email.length > 255 ||
    !validOptionalString(value.username, 100) ||
    !validOptionalString(value.phone, 30) ||
    !validOptionalString(value.avatarUrl, 2_000) ||
    typeof value.unitId !== "string" || !UUID.test(value.unitId) ||
    (value.employmentRole !== "guru" && value.employmentRole !== "karyawan")
  ) {
    throw new BadRequestException("Payload persetujuan staf tidak valid.");
  }
  const username = typeof value.username === "string" ? value.username.trim() : null;
  const phone = typeof value.phone === "string" ? value.phone.trim() : null;
  const avatarUrl = typeof value.avatarUrl === "string" ? value.avatarUrl.trim() : null;
  return {
    id: value.id as string,
    fullName,
    email,
    username,
    phone,
    avatarUrl,
    unitId: value.unitId as string,
    employmentRole: value.employmentRole as EmploymentRole,
  };
}

@Injectable()
export class StaffApprovalProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(userId: string, input: StaffApprovalProjectionInput) {
    if (userId !== input.id) {
      throw new BadRequestException("ID path dan payload persetujuan staf harus sama.");
    }
    const unit = await this.prisma.unit.findUnique({ where: { id: input.unitId } });
    if (!unit) throw new NotFoundException("Unit penugasan tidak ditemukan.");
    if (!unit.isActive) throw new BadRequestException("Unit penugasan sudah tidak aktif.");

    const sourceKey = `auth-staff-approval:${input.id}`;
    return this.prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id: input.id },
        create: {
          id: input.id,
          fullName: input.fullName,
          email: input.email,
          username: input.username,
          phone: input.phone,
          avatarUrl: input.avatarUrl,
          isActive: true,
        },
        update: {
          fullName: input.fullName,
          email: input.email,
          username: input.username,
          phone: input.phone,
          avatarUrl: input.avatarUrl,
          isActive: true,
        },
      });
      await tx.employeeUnitAssignment.updateMany({
        where: { userId: input.id, isPrimary: true },
        data: { isPrimary: false },
      });
      return tx.employeeUnitAssignment.upsert({
        where: { sourceKey },
        create: {
          userId: input.id,
          unitId: unit.id,
          unitName: unit.name,
          role: input.employmentRole,
          isPrimary: true,
          startDate: new Date(),
          notes: "Penugasan awal dari persetujuan Super Admin.",
          sourceKey,
        },
        update: {
          userId: input.id,
          unitId: unit.id,
          unitName: unit.name,
          role: input.employmentRole,
          isPrimary: true,
          endDate: null,
          notes: "Penugasan awal dari persetujuan Super Admin.",
        },
      });
    });
  }
}
