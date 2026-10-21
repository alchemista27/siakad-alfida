import { readFile } from "node:fs/promises";

import { PrismaClient } from "../src/generated/prisma";

export type ScopedRole = {
  app: string;
  role: string;
  unitId: string | null;
  departmentId: string | null;
};

type SourceRole = {
  role: string;
  unitId: string | null;
};

type SourceUser = {
  id: string;
  email: string;
  roles: SourceRole[];
};

type MonolithOrganizationExport = {
  units: Array<{ id: string }>;
  users: SourceUser[];
  departments: Array<{ id: string; unitId: string }>;
  departmentAdmins: Array<{ departmentId: string; userId: string }>;
  departmentMembers: Array<{ departmentId: string; userId: string; role: string }>;
};

export type Quarantine = {
  sourceUserId: string;
  email: string;
  sourceRole: string;
  reason:
    | "admin_bidang_not_department_admin"
    | "role_requires_unit"
    | "admin_biro_requires_bureau_scope";
};

export type Report = {
  sourceUserId: string;
  email: string;
  sourceRole: string;
  reason: "unitless_guru" | "unsupported_role" | "auth_user_not_found";
};

export type DesiredRole = ScopedRole & {
  sourceUserId: string;
  email: string;
};

export type ReconciliationPlan = {
  desiredRoles: DesiredRole[];
  quarantines: Quarantine[];
  reports: Report[];
  sourceDuplicateRoles: number;
};

type AuthUser = { id: string; email: string };
type ExistingRole = ScopedRole & { id: string; userId: string };

type AuthPrisma = {
  user: {
    findMany(args: {
      where: { OR: Array<{ email: { equals: string; mode: "insensitive" } }> };
      select: { id: true; email: true };
    }): Promise<AuthUser[]>;
  };
  roleAssignment: {
    findMany(args: {
      where: { userId: { in: string[] } };
      select: {
        id: true;
        userId: true;
        app: true;
        role: true;
        unitId: true;
        departmentId: true;
      };
    }): Promise<ExistingRole[]>;
    create(args: { data: ScopedRole & { userId: string } }): Promise<unknown>;
  };
  session: {
    deleteMany(args: { where: { userId: string } }): Promise<unknown>;
  };
  $transaction<T>(callback: (transaction: Omit<AuthPrisma, "$transaction">) => Promise<T>): Promise<T>;
  $disconnect(): Promise<void>;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function expectArray(value: unknown, name: string): unknown[] {
  if (!Array.isArray(value)) throw new Error(`Invalid export: ${name} must be an array`);
  return value;
}

function expectNonEmptyString(value: unknown, name: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Invalid export: ${name} must be a non-empty string`);
  }
  return value;
}

function expectNullableString(value: unknown, name: string): string | null {
  if (value === null) return null;
  return expectNonEmptyString(value, name);
}

function expectString(value: unknown, name: string): string {
  if (typeof value !== "string") throw new Error(`Invalid export: ${name} must be a string`);
  return value;
}

function expectRecord(value: unknown, name: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`Invalid export: ${name} must be an object`);
  return value;
}

function uniqueIds(values: Array<{ id: string }>, name: string): Set<string> {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) throw new Error(`Invalid export: duplicate ${name} id ${value.id}`);
    ids.add(value.id);
  }
  return ids;
}

export function validateMonolithOrganizationExport(raw: unknown): MonolithOrganizationExport {
  const input = expectRecord(raw, "root");
  const units = expectArray(input.units, "units").map((value, index) => {
    const unit = expectRecord(value, `units[${index}]`);
    return { id: expectNonEmptyString(unit.id, `units[${index}].id`) };
  });
  const users = expectArray(input.users, "users").map((value, index) => {
    const user = expectRecord(value, `users[${index}]`);
    return {
      id: expectNonEmptyString(user.id, `users[${index}].id`),
      email: expectNonEmptyString(user.email, `users[${index}].email`),
      roles: expectArray(user.roles, `users[${index}].roles`).map((roleValue, roleIndex) => {
        const role = expectRecord(roleValue, `users[${index}].roles[${roleIndex}]`);
        return {
          role: expectNonEmptyString(role.role, `users[${index}].roles[${roleIndex}].role`),
          unitId: expectNullableString(role.unitId, `users[${index}].roles[${roleIndex}].unitId`),
        };
      }),
    };
  });
  const departments = expectArray(input.departments, "departments").map((value, index) => {
    const department = expectRecord(value, `departments[${index}]`);
    return {
      id: expectNonEmptyString(department.id, `departments[${index}].id`),
      unitId: expectNonEmptyString(department.unitId, `departments[${index}].unitId`),
    };
  });
  const departmentAdmins = expectArray(input.departmentAdmins, "departmentAdmins").map((value, index) => {
    const admin = expectRecord(value, `departmentAdmins[${index}]`);
    return {
      departmentId: expectNonEmptyString(admin.departmentId, `departmentAdmins[${index}].departmentId`),
      userId: expectNonEmptyString(admin.userId, `departmentAdmins[${index}].userId`),
    };
  });
  const departmentMembers = expectArray(input.departmentMembers, "departmentMembers").map((value, index) => {
    const member = expectRecord(value, `departmentMembers[${index}]`);
    return {
      departmentId: expectNonEmptyString(member.departmentId, `departmentMembers[${index}].departmentId`),
      userId: expectNonEmptyString(member.userId, `departmentMembers[${index}].userId`),
      role: expectString(member.role, `departmentMembers[${index}].role`),
    };
  });

  const unitIds = uniqueIds(units, "unit");
  const userIds = uniqueIds(users, "user");
  const departmentIds = uniqueIds(departments, "department");
  const normalizedEmails = new Set<string>();
  for (const user of users) {
    const email = normalizeEmail(user.email);
    if (normalizedEmails.has(email)) throw new Error(`Invalid export: duplicate normalized email ${email}`);
    normalizedEmails.add(email);
    for (const role of user.roles) {
      if (role.unitId !== null && !unitIds.has(role.unitId)) {
        throw new Error(`Invalid export: role ${role.role} for ${user.id} references unknown unit ${role.unitId}`);
      }
    }
  }
  for (const department of departments) {
    if (!unitIds.has(department.unitId)) {
      throw new Error(`Invalid export: department ${department.id} references unknown unit ${department.unitId}`);
    }
  }
  for (const { departmentId, userId } of [...departmentAdmins, ...departmentMembers]) {
    if (!departmentIds.has(departmentId)) throw new Error(`Invalid export: unknown department ${departmentId}`);
    if (!userIds.has(userId)) throw new Error(`Invalid export: unknown user ${userId}`);
  }

  return { units, users, departments, departmentAdmins, departmentMembers };
}

function roleKey(role: ScopedRole & { userId?: string }): string {
  return [role.userId ?? "", role.app, role.role, role.unitId ?? "", role.departmentId ?? ""].join("\u001f");
}

export function buildReconciliationPlan(raw: unknown): ReconciliationPlan {
  const source = validateMonolithOrganizationExport(raw);
  const departmentIdsByAdmin = new Map<string, string[]>();
  for (const admin of source.departmentAdmins) {
    const existing = departmentIdsByAdmin.get(admin.userId) ?? [];
    existing.push(admin.departmentId);
    departmentIdsByAdmin.set(admin.userId, existing);
  }

  const desiredByKey = new Map<string, DesiredRole>();
  const quarantines: Quarantine[] = [];
  const quarantineKeys = new Set<string>();
  const reports: Report[] = [];
  const sourceRoleKeys = new Set<string>();
  let sourceDuplicateRoles = 0;
  const quarantine = (user: SourceUser, sourceRole: string, reason: Quarantine["reason"]): void => {
    const key = `${user.id}\u001f${sourceRole}\u001f${reason}`;
    if (quarantineKeys.has(key)) return;
    quarantineKeys.add(key);
    quarantines.push({
      sourceUserId: user.id,
      email: normalizeEmail(user.email),
      sourceRole,
      reason,
    });
  };
  const add = (user: SourceUser, role: ScopedRole): void => {
    const desired = { ...role, sourceUserId: user.id, email: normalizeEmail(user.email) };
    desiredByKey.set(roleKey({ ...role, userId: user.id }), desired);
  };
  const requireUnit = (user: SourceUser, sourceRole: SourceRole): string | null => {
    if (sourceRole.unitId !== null) return sourceRole.unitId;
    quarantine(user, sourceRole.role, "role_requires_unit");
    return null;
  };

  for (const user of source.users) {
    for (const sourceRole of user.roles) {
      const sourceRoleKey = `${user.id}\u001f${sourceRole.role}\u001f${sourceRole.unitId ?? ""}`;
      if (sourceRoleKeys.has(sourceRoleKey)) sourceDuplicateRoles += 1;
      sourceRoleKeys.add(sourceRoleKey);
      switch (sourceRole.role) {
        case "admin_unit": {
          const unitId = requireUnit(user, sourceRole);
          if (unitId !== null) {
            for (const app of ["core", "simpeg", "siakad", "spmb"]) {
              add(user, { app, role: "admin_unit", unitId, departmentId: null });
            }
          }
          break;
        }
        case "super_admin":
          add(user, { app: "*", role: "super_admin", unitId: null, departmentId: null });
          break;
        case "guru": {
          if (sourceRole.unitId === null) {
            reports.push({
              sourceUserId: user.id,
              email: normalizeEmail(user.email),
              sourceRole: sourceRole.role,
              reason: "unitless_guru",
            });
          } else {
            add(user, { app: "simpeg", role: "pegawai", unitId: sourceRole.unitId, departmentId: null });
            add(user, { app: "siakad", role: "guru", unitId: sourceRole.unitId, departmentId: null });
          }
          break;
        }
        case "karyawan": {
          const unitId = requireUnit(user, sourceRole);
          if (unitId !== null) add(user, { app: "simpeg", role: "pegawai", unitId, departmentId: null });
          break;
        }
        case "orang_tua":
          add(user, { app: "spmb", role: "orang_tua", unitId: null, departmentId: null });
          add(user, { app: "siakad", role: "orang_tua", unitId: null, departmentId: null });
          break;
        case "pengawas_yayasan":
          add(user, { app: "simakin", role: "pengawas", unitId: null, departmentId: null });
          break;
        case "admin_biro":
          quarantine(user, sourceRole.role, "admin_biro_requires_bureau_scope");
          break;
        case "admin_bidang": {
          const departmentIds = departmentIdsByAdmin.get(user.id) ?? [];
          if (departmentIds.length === 0) {
            quarantine(user, sourceRole.role, "admin_bidang_not_department_admin");
          } else {
            for (const departmentId of departmentIds) {
              add(user, { app: "simakin", role: "admin_bidang", unitId: null, departmentId });
            }
          }
          break;
        }
        default:
          reports.push({
            sourceUserId: user.id,
            email: normalizeEmail(user.email),
            sourceRole: sourceRole.role,
            reason: "unsupported_role",
          });
      }
    }
  }

  return {
    desiredRoles: [...desiredByKey.values()],
    quarantines,
    reports,
    sourceDuplicateRoles,
  };
}

export type ReconciliationResult = ReconciliationPlan & {
  missingRoles: number;
  createdRoles: number;
  invalidatedSessions: number;
};

export async function reconcileMonolithOrganizationRoles(
  prisma: AuthPrisma,
  raw: unknown,
  apply: boolean,
): Promise<ReconciliationResult> {
  const plan = buildReconciliationPlan(raw);
  const emails = [...new Set(plan.desiredRoles.map((role) => role.email))];
  const authUsers = emails.length === 0
    ? []
    : await prisma.user.findMany({
      where: { OR: emails.map((email) => ({ email: { equals: email, mode: "insensitive" } })) },
      select: { id: true, email: true },
    });
  const authUsersByEmail = new Map<string, AuthUser>();
  for (const authUser of authUsers) {
    const email = normalizeEmail(authUser.email);
    if (authUsersByEmail.has(email)) throw new Error(`Ambiguous Auth users for normalized email ${email}`);
    authUsersByEmail.set(email, authUser);
  }

  const reports = [...plan.reports];
  const desiredByAuthKey = new Map<string, ScopedRole & { userId: string }>();
  for (const desired of plan.desiredRoles) {
    const authUser = authUsersByEmail.get(desired.email);
    if (!authUser) {
      reports.push({
        sourceUserId: desired.sourceUserId,
        email: desired.email,
        sourceRole: desired.role,
        reason: "auth_user_not_found",
      });
      continue;
    }
    const role = { userId: authUser.id, app: desired.app, role: desired.role, unitId: desired.unitId, departmentId: desired.departmentId };
    desiredByAuthKey.set(roleKey(role), role);
  }
  const authUserIds = [...new Set([...desiredByAuthKey.values()].map((role) => role.userId))];
  const existingRoles = authUserIds.length === 0
    ? []
    : await prisma.roleAssignment.findMany({
      where: { userId: { in: authUserIds } },
      select: { id: true, userId: true, app: true, role: true, unitId: true, departmentId: true },
    });
  const existingRoleKeys = new Set(existingRoles.map((role) => roleKey(role)));
  const missingRoles = [...desiredByAuthKey.values()].filter((role) => !existingRoleKeys.has(roleKey(role)));

  let createdRoles = 0;
  let invalidatedSessions = 0;
  if (apply) {
    const missingByUser = new Map<string, Array<ScopedRole & { userId: string }>>();
    for (const role of missingRoles) {
      const roles = missingByUser.get(role.userId) ?? [];
      roles.push(role);
      missingByUser.set(role.userId, roles);
    }
    for (const [userId, roles] of missingByUser) {
      await prisma.$transaction(async (transaction) => {
        for (const role of roles) {
          await transaction.roleAssignment.create({ data: role });
          createdRoles += 1;
        }
        await transaction.session.deleteMany({ where: { userId } });
        invalidatedSessions += 1;
      });
    }
  }

  return {
    ...plan,
    reports,
    missingRoles: missingRoles.length,
    createdRoles,
    invalidatedSessions,
  };
}

function parseArguments(argv: string[]): { input: string; apply: boolean } {
  let input: string | undefined;
  let apply = false;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") {
      apply = true;
    } else if (argument === "--input") {
      input = argv[index + 1];
      index += 1;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }
  if (!input) throw new Error("Usage: tsx scripts/reconcile-monolith-organization-roles.ts --input <file> [--apply]");
  return { input, apply };
}

async function main(): Promise<void> {
  const { input, apply } = parseArguments(process.argv.slice(2));
  const raw = JSON.parse(await readFile(input, "utf8")) as unknown;
  const authPrisma = new PrismaClient();
  try {
    const result = await reconcileMonolithOrganizationRoles(authPrisma as unknown as AuthPrisma, raw, apply);
    console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", ...result }, null, 2));
  } finally {
    await authPrisma.$disconnect();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
