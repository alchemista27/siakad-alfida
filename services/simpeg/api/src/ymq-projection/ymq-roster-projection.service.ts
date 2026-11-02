import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const ROSTER_VERSION = "ymq-2026-2027";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^\S+@\S+\.\S+$/;
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;

export type YmqRosterProjectionAccount = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  sourceUpdatedAt: string;
  unitIds: string[];
};

export type YmqRosterProjectionInput = {
  rosterVersion: typeof ROSTER_VERSION;
  accounts: YmqRosterProjectionAccount[];
};

export function parseYmqRosterProjection(input: unknown): YmqRosterProjectionInput {
  const root = record(input);
  assertOnlyKeys(root, ["rosterVersion", "accounts"]);
  if (root.rosterVersion !== ROSTER_VERSION || !Array.isArray(root.accounts) || root.accounts.length > 50) invalid();
  return { rosterVersion: ROSTER_VERSION, accounts: root.accounts.map(parseAccount) };
}

@Injectable()
export class YmqRosterProjectionService {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(input: YmqRosterProjectionInput): Promise<{ users: number; assignments: number }> {
    const unitIds = [...new Set(input.accounts.flatMap((account) => account.unitIds))];
    const units = await this.prisma.unit.findMany({
      where: { id: { in: unitIds }, isActive: true },
      select: { id: true, name: true },
    });
    const unitsById = new Map(units.map((unit) => [unit.id, unit]));
    if (unitsById.size !== unitIds.length) throw new NotFoundException("Satu atau lebih unit roster YMQ tidak aktif atau tidak ditemukan.");

    let assignments = 0;
    await this.prisma.$transaction(async (tx) => {
      for (const account of input.accounts) {
        await tx.user.upsert({
          where: { id: account.id },
          create: {
            id: account.id,
            fullName: account.fullName,
            email: account.email,
            isActive: account.isActive,
          },
          update: {
            fullName: account.fullName,
            email: account.email,
            isActive: account.isActive,
          },
        });
        const manualPrimary = await tx.employeeUnitAssignment.findFirst({
          where: {
            userId: account.id,
            isPrimary: true,
            sourceKey: { not: { startsWith: `${ROSTER_VERSION}:` } },
            startDate: { lte: new Date() },
            OR: [{ endDate: null }, { endDate: { gte: new Date() } }],
          },
          select: { id: true },
        });
        for (const [index, unitId] of account.unitIds.entries()) {
          const unit = unitsById.get(unitId);
          if (!unit) throw new NotFoundException("Unit roster YMQ tidak ditemukan.");
          await tx.employeeUnitAssignment.upsert({
            where: { sourceKey: assignmentSourceKey(account.id, unitId) },
            create: {
              userId: account.id,
              unitId,
              unitName: unit.name,
              role: "karyawan",
              isPrimary: !manualPrimary && index === 0,
              startDate: new Date(),
              notes: "Proyeksi roster YMQ 2026-2027.",
              sourceKey: assignmentSourceKey(account.id, unitId),
            },
            update: {
              userId: account.id,
              unitId,
              unitName: unit.name,
              role: "karyawan",
              isPrimary: !manualPrimary && index === 0,
              endDate: null,
              notes: "Proyeksi roster YMQ 2026-2027.",
            },
          });
          assignments += 1;
        }
      }
    });
    return { users: input.accounts.length, assignments };
  }
}

function parseAccount(input: unknown): YmqRosterProjectionAccount {
  const value = record(input);
  assertOnlyKeys(value, ["id", "fullName", "email", "isActive", "sourceUpdatedAt", "unitIds"]);
  const id = readUuid(value.id);
  const fullName = readString(value.fullName, 200);
  const email = readString(value.email, 255).toLowerCase();
  if (!EMAIL.test(email) || typeof value.isActive !== "boolean" || typeof value.sourceUpdatedAt !== "string" || !ISO_TIMESTAMP.test(value.sourceUpdatedAt) || Number.isNaN(Date.parse(value.sourceUpdatedAt)) || !Array.isArray(value.unitIds)) invalid();
  const unitIds = [...new Set(value.unitIds.map(readUuid))].sort();
  return { id, fullName, email, isActive: value.isActive, sourceUpdatedAt: value.sourceUpdatedAt, unitIds };
}

function assignmentSourceKey(userId: string, unitId: string) {
  return `${ROSTER_VERSION}:${userId}:${unitId}`;
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}

function assertOnlyKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const keys = Object.keys(value);
  if (keys.length !== expected.length || keys.some((key) => !expected.includes(key))) invalid();
}

function readString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") invalid();
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) invalid();
  return normalized;
}

function readUuid(value: unknown): string {
  if (typeof value !== "string" || !UUID.test(value)) invalid();
  return value;
}

function invalid(): never {
  throw new BadRequestException("Payload proyeksi roster YMQ tidak valid.");
}
