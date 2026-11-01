import { BadRequestException, ForbiddenException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { Prisma, type RoleAssignment, type User } from "../generated/prisma";
import { PrismaService } from "../prisma/prisma.service";
import {
  type YmqRosterAccountInput,
  type YmqRosterAssignment,
  type YmqRosterPreviewInput,
  type YmqRosterProvisionInput,
} from "./ymq-roster-broker.policy";

type ExistingUser = User & { roles: RoleAssignment[] };
type PreparedAccount = {
  input: YmqRosterAccountInput;
  existing: ExistingUser | null;
  status: "created" | "existing" | "existing-email-conflict";
};
type DirectoryRecord = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  sourceUpdatedAt: Date;
};

@Injectable()
export class YmqRosterBrokerService {
  constructor(private readonly prisma: PrismaService) {}

  async preview(input: YmqRosterPreviewInput) {
    await this.requireGlobalSuperAdmin(input.actorUserId);
    const accounts = await this.prepareAccounts(input.accounts);
    return {
      accounts: accounts.map((account) => ({
        sourceKey: account.input.sourceKey,
        status: account.status,
        desiredRoles: account.input.assignments.map((assignment) => ({ ...assignment })),
        conflicts: account.status === "existing-email-conflict" ? ["existing-email-conflict"] : [],
      })),
    };
  }

  async provision(input: YmqRosterProvisionInput) {
    await this.requireGlobalSuperAdmin(input.actorUserId);
    const accounts = await this.prepareAccounts(input.accounts);
    if (accounts.some((account) => account.status === "existing-email-conflict")) {
      throw new BadRequestException("Nama pengguna yang ada tidak cocok dengan email roster.");
    }

    return this.prisma.$transaction(async (tx) => {
      const directory: DirectoryRecord[] = [];
      for (const account of accounts) {
        const user = account.existing ?? await this.createUser(tx, account.input, input.initialPassword);
        let rolesChanged = false;
        for (const assignment of this.orderAssignments(account.input.assignments)) {
          rolesChanged = (await this.ensureRole(tx, user.id, assignment)) || rolesChanged;
        }
        if (account.existing && rolesChanged) {
          await tx.session.deleteMany({ where: { userId: user.id } });
        }
        directory.push(this.toDirectoryRecord(user));
      }
      return { accounts: directory };
    });
  }

  private async requireGlobalSuperAdmin(actorUserId: string) {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorUserId },
      include: { roles: true },
    });
    if (!actor?.isActive || !actor.roles.some((role) => role.role === "super_admin" && ["*", "auth", "core"].includes(role.app))) {
      throw new ForbiddenException("Aktor tidak berwenang mengelola roster YMQ.");
    }
    return actor;
  }

  private async prepareAccounts(inputs: YmqRosterAccountInput[]): Promise<PreparedAccount[]> {
    this.assertUniqueBatchValues(inputs);
    const accounts: PreparedAccount[] = [];
    for (const input of inputs) {
      const existing = await this.prisma.user.findUnique({
        where: { email: input.email },
        include: { roles: true },
      });
      const status = existing
        ? (this.normalizeName(existing.fullName) === this.normalizeName(input.fullName) ? "existing" : "existing-email-conflict")
        : "created";
      accounts.push({ input, existing, status });
    }
    for (const account of accounts) {
      if (account.status !== "existing-email-conflict") {
        this.assertValidRolePlan(account.input.assignments, account.existing?.roles ?? []);
      }
    }
    return accounts;
  }

  private assertUniqueBatchValues(accounts: YmqRosterAccountInput[]) {
    const sourceKeys = new Set<string>();
    const emails = new Set<string>();
    for (const account of accounts) {
      const sourceKey = account.sourceKey.trim();
      const email = account.email.trim().toLowerCase();
      if (!sourceKey || sourceKeys.has(sourceKey) || emails.has(email)) {
        throw new BadRequestException("sourceKey dan email roster harus unik.");
      }
      sourceKeys.add(sourceKey);
      emails.add(email);
      const roles = new Set<string>();
      for (const assignment of account.assignments) {
        const roleKey = `${assignment.app}:${assignment.role}:${assignment.unitId ?? "global"}`;
        if (roles.has(roleKey)) throw new BadRequestException("Peran roster tidak boleh berulang.");
        roles.add(roleKey);
      }
    }
  }

  private assertValidRolePlan(assignments: YmqRosterAssignment[], existingRoles: RoleAssignment[]) {
    const hasRole = (app: string, role: string) => (
      assignments.some((entry) => entry.app === app && entry.role === role)
      || existingRoles.some((entry) => entry.app === app && entry.role === role)
    );
    const hasYmqEligibility = hasRole("simpeg", "pegawai") || hasRole("simpeg", "pimpinan");
    if (hasRole("siyaum", "peserta") && !hasYmqEligibility) {
      throw new BadRequestException("Peserta YMQ harus memiliki peran pegawai atau pimpinan SIMPEG.");
    }
    if (hasRole("siyaum", "pembina_ymq") && !hasRole("siyaum", "peserta")) {
      throw new BadRequestException("Pembina YMQ wajib sudah menjadi peserta YMQ.");
    }
  }

  private async createUser(tx: Prisma.TransactionClient, account: YmqRosterAccountInput, initialPassword: string) {
    const passwordHash = await bcrypt.hash(initialPassword, 10);
    return tx.user.create({
      data: {
        id: randomUUID(),
        email: account.email,
        fullName: account.fullName,
        passwordHash,
        accounts: {
          create: {
            id: randomUUID(),
            providerId: "credential",
            accountId: account.email,
            password: passwordHash,
          },
        },
      },
      include: { roles: true },
    });
  }

  private async ensureRole(tx: Prisma.TransactionClient, userId: string, assignment: YmqRosterAssignment): Promise<boolean> {
    const where = {
      userId,
      app: assignment.app,
      role: assignment.role,
      unitId: assignment.unitId,
      departmentId: null,
    };
    const existing = await tx.roleAssignment.findFirst({ where });
    if (existing) return false;
    try {
      await tx.roleAssignment.create({ data: { id: randomUUID(), ...where } });
      return true;
    } catch (error: unknown) {
      if (this.isUniqueConstraint(error)) {
        const concurrent = await tx.roleAssignment.findFirst({ where });
        if (concurrent) return false;
      }
      throw error;
    }
  }

  private orderAssignments(assignments: YmqRosterAssignment[]) {
    const order = (assignment: YmqRosterAssignment) => {
      if (assignment.app === "simpeg" && assignment.role === "pegawai") return 1;
      if (assignment.app === "simpeg" && assignment.role === "pimpinan") return 2;
      if (assignment.app === "siyaum" && assignment.role === "peserta") return 3;
      if (assignment.app === "siyaum" && assignment.role === "pembina_ymq") return 4;
      return 5;
    };
    return [...assignments].sort((left, right) => order(left) - order(right));
  }

  private toDirectoryRecord(user: Pick<User, "id" | "fullName" | "email" | "isActive" | "createdAt" | "updatedAt">): DirectoryRecord {
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      isActive: user.isActive,
      sourceUpdatedAt: user.updatedAt ?? user.createdAt,
    };
  }

  private normalizeName(value: string) {
    return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
  }

  private isUniqueConstraint(error: unknown): error is { code: string } {
    return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
  }
}
