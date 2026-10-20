import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import { OrganizationSyncService } from "../src/organization-sync/organization-sync.service";

type JsonObject = Record<string, unknown>;
type Entity = "user" | "unit" | "department" | "department_member";

type ImportCandidate = {
  entity: Entity;
  sourceId: string;
  sourceVersion: Date;
  payloadHash: string;
  payload: JsonObject;
};

type ImportNote = { entity: string; sourceId: string | null; reason: string };

export type OrganizationImportPlan = {
  source: string;
  users: ImportCandidate[];
  units: ImportCandidate[];
  departments: ImportCandidate[];
  members: ImportCandidate[];
  quarantined: ImportNote[];
  ignored: ImportNote[];
};

export type ImportArguments = { inputPath: string; apply: boolean };

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_V5_DNS_NAMESPACE = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
const MEMBER_ROLE_MAP = new Map([
  ["anggota", "member"],
  ["member", "member"],
  ["koordinator", "coordinator"],
  ["coordinator", "coordinator"],
  ["sekretaris", "secretary"],
  ["secretary", "secretary"],
  ["bendahara", "treasurer"],
  ["treasurer", "treasurer"],
]);

function object(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  return value as JsonObject;
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalString(value: unknown, label: string): string | null {
  if (value === undefined || value === null || value === "") return null;
  return string(value, label);
}

function timestamp(value: unknown, label: string): Date {
  const raw = string(value, label);
  if (!/^\d{4}-\d{2}-\d{2}T/.test(raw)) {
    throw new Error(`${label} must be an ISO timestamp.`);
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${label} must be an ISO timestamp.`);
  }
  return parsed;
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  if (!value || typeof value !== "object") return JSON.stringify(value);
  const record = value as JsonObject;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`;
}

function hash(payload: JsonObject): string {
  return createHash("sha256").update(stableJson(payload)).digest("hex");
}

function uuidV5(name: string, namespace: string): string {
  const namespaceBytes = Buffer.from(namespace.replaceAll("-", ""), "hex");
  const digest = createHash("sha1")
    .update(namespaceBytes)
    .update(Buffer.from(name, "utf8"))
    .digest();
  digest[6] = (digest[6] & 0x0f) | 0x50;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = digest.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function deterministicDepartmentMemberId(
  source: string,
  departmentId: string,
  canonicalUserId: string
) {
  return uuidV5(
    `${source}:${departmentId}:${canonicalUserId}`,
    UUID_V5_DNS_NAMESPACE
  );
}

export function safeSlug(value: string): string {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    throw new Error(`Cannot derive a safe slug from ${JSON.stringify(value)}.`);
  }
  return slug;
}

function sourceDate(
  record: JsonObject,
  field: "createdAt" | "updatedAt"
): Date | null {
  const value = record[field];
  return value === undefined || value === null ? null : timestamp(value, field);
}

function addCandidate(
  plan: OrganizationImportPlan,
  collection: "users" | "units" | "departments" | "members",
  entity: Entity,
  sourceId: string,
  sourceVersion: Date,
  payload: JsonObject
) {
  plan[collection].push({
    entity,
    sourceId,
    sourceVersion,
    payloadHash: hash(payload),
    payload,
  });
}

function mappedUserId(
  mapping: Map<string, string>,
  email: string,
  entity: string,
  sourceId: string,
  plan: OrganizationImportPlan
): string | null {
  const userId = mapping.get(email.toLowerCase());
  if (!userId) {
    plan.quarantined.push({
      entity,
      sourceId,
      reason: `No canonical auth user ID mapping exists for ${email}.`,
    });
    return null;
  }
  return userId;
}

function resolveSourceUserId(
  sourceUserEmailById: Map<string, string>,
  mapping: Map<string, string>,
  sourceUserId: string,
  entity: string,
  sourceId: string,
  plan: OrganizationImportPlan
) {
  const email = sourceUserEmailById.get(sourceUserId);
  if (!email) {
    plan.quarantined.push({
      entity,
      sourceId,
      reason: `Source user ${sourceUserId} does not exist in the imported user catalog.`,
    });
    return null;
  }
  return mappedUserId(mapping, email, entity, sourceId, plan);
}

export function normalizeMemberRole(role: unknown): string | null | undefined {
  if (role === undefined || role === null || role === "") return null;
  if (typeof role !== "string") return undefined;
  return MEMBER_ROLE_MAP.get(role.trim().toLowerCase());
}

export function buildOrganizationImportPlan(
  input: unknown
): OrganizationImportPlan {
  const document = object(input, "Import input");
  const source =
    optionalString(document.source, "source") ?? "monolith-organization";
  const sourceVersion = timestamp(document.sourceVersion, "sourceVersion");
  const plan: OrganizationImportPlan = {
    source,
    users: [],
    units: [],
    departments: [],
    members: [],
    quarantined: [],
    ignored: [],
  };
  const mappingObject = object(
    document.canonicalAuthUserIdByEmail,
    "canonicalAuthUserIdByEmail"
  );
  const mapping = new Map<string, string>();
  const canonicalIds = new Set<string>();
  for (const [email, userId] of Object.entries(mappingObject)) {
    const normalizedEmail = string(
      email,
      "canonical auth user email"
    ).toLowerCase();
    const canonicalUserId = string(
      userId,
      `canonical auth user ID for ${email}`
    );
    if (!UUID_PATTERN.test(canonicalUserId)) {
      throw new Error(`canonical auth user ID for ${email} must be a UUID.`);
    }
    if (canonicalIds.has(canonicalUserId)) {
      throw new Error(
        `canonical auth user ID is mapped more than once: ${canonicalUserId}.`
      );
    }
    canonicalIds.add(canonicalUserId);
    mapping.set(normalizedEmail, canonicalUserId);
  }

  const rawUsers = Array.isArray(document.users)
    ? document.users.map((value) => object(value, "user"))
    : [];
  const sourceUserEmailById = new Map<string, string>();
  for (const user of rawUsers) {
    const sourceId = string(user.id, "user.id");
    const email = string(user.email, "user.email").toLowerCase();
    if (sourceUserEmailById.has(sourceId)) {
      throw new Error(`Duplicate user id: ${sourceId}`);
    }
    sourceUserEmailById.set(sourceId, email);
  }
  const sourceEmails = new Set<string>();
  for (const user of rawUsers) {
    const sourceId = string(user.id, "user.id");
    const email = string(user.email, "user.email").toLowerCase();
    if (sourceEmails.has(email))
      throw new Error(`Duplicate user email: ${email}`);
    sourceEmails.add(email);
    const userId = mappedUserId(mapping, email, "user", sourceId, plan);
    if (!userId) continue;
    if (Array.isArray(user.roles) && user.roles.length > 0) {
      plan.ignored.push({
        entity: "user_role",
        sourceId,
        reason: "Source roles are ignored and never grant SIMPEG permissions.",
      });
    }
    addCandidate(plan, "users", "user", sourceId, sourceVersion, {
      id: userId,
      fullName: string(user.fullName, "user.fullName"),
      email,
      username: optionalString(user.username, "user.username"),
      phone: optionalString(user.phone, "user.phone"),
      avatarUrl: null,
      isActive: user.isActive !== false,
      sourceUpdatedAt: sourceVersion.toISOString(),
    });
  }

  const units = Array.isArray(document.units) ? document.units : [];
  const departments = Array.isArray(document.departments)
    ? document.departments
    : [];
  const members = Array.isArray(document.departmentMembers)
    ? document.departmentMembers
    : [];
  const unitIds = new Set<string>();
  const departmentIds = new Set<string>();

  for (const value of units) {
    const unit = object(value, "unit");
    const id = string(unit.id, "unit.id");
    if (!UUID_PATTERN.test(id))
      throw new Error(`unit.id must be a UUID: ${id}`);
    if (unitIds.has(id)) throw new Error(`Duplicate unit id: ${id}`);
    unitIds.add(id);
    const level = optionalString(unit.level, "unit.level");
    const category = level
      ? level === "kantor_yayasan"
        ? "nondik"
        : "pendidikan"
      : unit.category === "nondik"
        ? "nondik"
        : "pendidikan";
    const slug = safeSlug(
      optionalString(unit.slug, "unit.slug") ?? string(unit.name, "unit.name")
    );
    addCandidate(plan, "units", "unit", id, sourceVersion, {
      id,
      name: string(unit.name, "unit.name"),
      code:
        optionalString(unit.code, "unit.code")?.toUpperCase() ??
        `${category}-${slug}`.toUpperCase(),
      category,
      address: optionalString(unit.address, "unit.address"),
      isActive: unit.isActive !== false,
      sourceCreatedAt: sourceDate(unit, "createdAt")?.toISOString() ?? null,
      sourceUpdatedAt: sourceVersion.toISOString(),
    });
  }

  const rawDepartments = departments.map((value) =>
    object(value, "department")
  );
  for (const department of rawDepartments) {
    const id = string(department.id, "department.id");
    if (!UUID_PATTERN.test(id)) {
      throw new Error(`department.id must be a UUID: ${id}`);
    }
    if (departmentIds.has(id))
      throw new Error(`Duplicate department id: ${id}`);
    departmentIds.add(id);
  }
  const parentByDepartmentId = new Map<string, string | null>();
  for (const department of rawDepartments) {
    const id = string(department.id, "department.id");
    const unitId = optionalString(department.unitId, "department.unitId");
    const parentId = optionalString(department.parentId, "department.parentId");
    if (unitId && !unitIds.has(unitId)) {
      throw new Error(`department ${id} references unknown unit ${unitId}.`);
    }
    if (parentId && (!departmentIds.has(parentId) || parentId === id)) {
      throw new Error(`department ${id} has an invalid parent reference.`);
    }
    parentByDepartmentId.set(id, parentId);
  }
  for (const departmentId of departmentIds) {
    const ancestors = new Set<string>();
    let currentId: string | null = departmentId;
    while (currentId) {
      if (ancestors.has(currentId)) {
        throw new Error(
          `department ${departmentId} has a cyclic parent reference.`
        );
      }
      ancestors.add(currentId);
      currentId = parentByDepartmentId.get(currentId) ?? null;
    }
  }
  const departmentCodes = new Set<string>();
  for (const department of rawDepartments) {
    const id = string(department.id, "department.id");
    const leaderEmail = optionalString(
      department.leaderEmail,
      "department.leaderEmail"
    )?.toLowerCase();
    const sourceLeaderId = optionalString(
      department.leaderId,
      "department.leaderId"
    );
    const leaderId = leaderEmail
      ? mappedUserId(mapping, leaderEmail, "department", id, plan)
      : sourceLeaderId
        ? resolveSourceUserId(
            sourceUserEmailById,
            mapping,
            sourceLeaderId,
            "department",
            id,
            plan
          )
        : null;
    if ((leaderEmail || sourceLeaderId) && !leaderId) continue;
    const code = (
      optionalString(department.code, "department.code") ??
      safeSlug(string(department.name, "department.name"))
    ).toUpperCase();
    if (departmentCodes.has(code)) {
      throw new Error(`Duplicate department code: ${code}`);
    }
    departmentCodes.add(code);
    addCandidate(plan, "departments", "department", id, sourceVersion, {
      id,
      unitId: optionalString(department.unitId, "department.unitId"),
      parentId: optionalString(department.parentId, "department.parentId"),
      leaderId,
      name: string(department.name, "department.name"),
      code,
      description: optionalString(
        department.description,
        "department.description"
      ),
      isActive: department.isActive !== false,
      sourceCreatedAt:
        sourceDate(department, "createdAt")?.toISOString() ?? null,
      sourceUpdatedAt: sourceVersion.toISOString(),
    });
  }

  const memberSources = new Set<string>();
  for (const value of members) {
    const member = object(value, "department member");
    const departmentId = string(
      member.departmentId,
      "departmentMember.departmentId"
    );
    if (!departmentIds.has(departmentId)) {
      throw new Error(
        `department member references unknown department ${departmentId}.`
      );
    }
    const email = optionalString(
      member.email,
      "departmentMember.email"
    )?.toLowerCase();
    const sourceUserId = optionalString(
      member.userId,
      "departmentMember.userId"
    );
    const userId = email
      ? mappedUserId(mapping, email, "department_member", departmentId, plan)
      : sourceUserId
        ? resolveSourceUserId(
            sourceUserEmailById,
            mapping,
            sourceUserId,
            "department_member",
            departmentId,
            plan
          )
        : (() => {
            throw new Error("departmentMember must include email or userId.");
          })();
    const memberId = userId
      ? deterministicDepartmentMemberId(source, departmentId, userId)
      : null;
    const role = normalizeMemberRole(member.role);
    if (role === undefined) {
      plan.quarantined.push({
        entity: "department_member",
        sourceId: memberId,
        reason: `Unmappable member role: ${String(member.role)}.`,
      });
      continue;
    }
    if (!userId || !memberId) continue;
    if (memberSources.has(memberId)) {
      throw new Error(`Duplicate department member: ${departmentId}:${userId}`);
    }
    memberSources.add(memberId);
    addCandidate(
      plan,
      "members",
      "department_member",
      memberId,
      sourceVersion,
      {
        id: memberId,
        departmentId,
        userId,
        role,
        sourceCreatedAt: sourceDate(member, "createdAt")?.toISOString() ?? null,
        sourceUpdatedAt: sourceVersion.toISOString(),
      }
    );
  }

  return plan;
}

export function parseImportArguments(args: string[]): ImportArguments {
  const inputFlag = args.indexOf("--input");
  const inputPath = inputFlag >= 0 ? args[inputFlag + 1] : undefined;
  if (!inputPath || inputPath.startsWith("--")) {
    throw new Error(
      "Usage: tsx scripts/import-monolith-organization.ts --input <sanitized-json> [--apply]"
    );
  }
  return { inputPath, apply: args.includes("--apply") };
}

async function localUserExists(
  prisma: any,
  userId: string,
  cache: Map<string, boolean>
) {
  if (!cache.has(userId)) {
    cache.set(
      userId,
      Boolean(
        await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true },
        })
      )
    );
  }
  return cache.get(userId) as boolean;
}

async function applyCandidate(
  prisma: any,
  plan: OrganizationImportPlan,
  candidate: ImportCandidate,
  sync: OrganizationSyncService,
  localUsers: Map<string, boolean>
) {
  const payload = candidate.payload;
  const referencedUserIds =
    candidate.entity === "department"
      ? [payload.leaderId]
      : candidate.entity === "department_member"
        ? [payload.userId]
        : [];
  for (const userId of referencedUserIds) {
    if (
      typeof userId === "string" &&
      !(await localUserExists(prisma, userId, localUsers))
    ) {
      plan.quarantined.push({
        entity: candidate.entity,
        sourceId: candidate.sourceId,
        reason: `Canonical user ${userId} is not a local SIMPEG user.`,
      });
      return "quarantined" as const;
    }
  }

  return prisma.$transaction(async (tx: any) => {
    const where = {
      source_entity_sourceId: {
        source: plan.source,
        entity: candidate.entity,
        sourceId: candidate.sourceId,
      },
    };
    const receipt = await tx.organizationImportReceipt.findUnique({ where });
    if (receipt) {
      const recordedVersion = new Date(receipt.sourceVersion);
      if (recordedVersion > candidate.sourceVersion) return "skipped" as const;
      if (recordedVersion.getTime() === candidate.sourceVersion.getTime()) {
        if (receipt.payloadHash !== candidate.payloadHash) {
          plan.quarantined.push({
            entity: candidate.entity,
            sourceId: candidate.sourceId,
            reason: "Payload changed without a newer source version.",
          });
          return "quarantined" as const;
        }
        return "skipped" as const;
      }
    }

    if (candidate.entity === "user") {
      const existingByEmail = await tx.user.findUnique({
        where: { email: payload.email },
        select: { id: true },
      });
      if (existingByEmail && existingByEmail.id !== payload.id) {
        plan.quarantined.push({
          entity: "user",
          sourceId: candidate.sourceId,
          reason: `Email ${payload.email as string} is already owned by a different local SIMPEG user.`,
        });
        return "quarantined" as const;
      }
      let username = payload.username as string | null;
      if (username) {
        const existingByUsername = await tx.user.findUnique({
          where: { username },
          select: { id: true },
        });
        if (existingByUsername && existingByUsername.id !== payload.id) {
          plan.ignored.push({
            entity: "user_username",
            sourceId: candidate.sourceId,
            reason: `Username ${username} is already owned by a different local SIMPEG user.`,
          });
          username = null;
        }
      }
      const user = await tx.user.upsert({
        where: { id: payload.id },
        create: {
          id: payload.id,
          fullName: payload.fullName,
          email: payload.email,
          username,
          phone: payload.phone,
          avatarUrl: null,
          isActive: payload.isActive,
          updatedAt: candidate.sourceVersion,
        },
        update: {
          fullName: payload.fullName,
          email: payload.email,
          username,
          phone: payload.phone,
          avatarUrl: null,
          isActive: payload.isActive,
          updatedAt: candidate.sourceVersion,
        },
      });
      localUsers.set(user.id, true);
      await sync.enqueueUser(tx, {
        ...user,
        updatedAt: candidate.sourceVersion,
      });
    } else if (candidate.entity === "unit") {
      const unit = await tx.unit.upsert({
        where: { id: candidate.sourceId },
        create: {
          id: payload.id,
          name: payload.name,
          code: payload.code,
          category: payload.category,
          address: payload.address,
          isActive: payload.isActive,
          createdAt: payload.sourceCreatedAt
            ? new Date(payload.sourceCreatedAt as string)
            : undefined,
          updatedAt: candidate.sourceVersion,
        },
        update: {
          name: payload.name,
          code: payload.code,
          category: payload.category,
          address: payload.address,
          isActive: payload.isActive,
          updatedAt: candidate.sourceVersion,
        },
      });
      await sync.enqueueUnit(tx, {
        ...unit,
        updatedAt: candidate.sourceVersion,
      });
    } else if (candidate.entity === "department") {
      const department = await tx.department.upsert({
        where: { id: candidate.sourceId },
        create: {
          id: payload.id,
          unitId: payload.unitId,
          parentId: payload.parentId,
          leaderId: payload.leaderId,
          name: payload.name,
          code: payload.code,
          description: payload.description,
          isActive: payload.isActive,
          createdAt: payload.sourceCreatedAt
            ? new Date(payload.sourceCreatedAt as string)
            : undefined,
          updatedAt: candidate.sourceVersion,
        },
        update: {
          unitId: payload.unitId,
          parentId: payload.parentId,
          leaderId: payload.leaderId,
          name: payload.name,
          code: payload.code,
          description: payload.description,
          isActive: payload.isActive,
          updatedAt: candidate.sourceVersion,
        },
      });
      await sync.enqueueDepartment(tx, {
        ...department,
        updatedAt: candidate.sourceVersion,
      });
    } else {
      const member = await tx.departmentMember.upsert({
        where: {
          departmentId_userId: {
            departmentId: payload.departmentId,
            userId: payload.userId,
          },
        },
        create: {
          id: payload.id,
          departmentId: payload.departmentId,
          userId: payload.userId,
          role: payload.role,
          sourceCreatedAt: payload.sourceCreatedAt
            ? new Date(payload.sourceCreatedAt as string)
            : null,
          sourceUpdatedAt: candidate.sourceVersion,
        },
        update: {
          role: payload.role,
          sourceCreatedAt: payload.sourceCreatedAt
            ? new Date(payload.sourceCreatedAt as string)
            : null,
          sourceUpdatedAt: candidate.sourceVersion,
        },
      });
      await sync.enqueueDepartmentMember(tx, {
        ...member,
        sourceUpdatedAt: candidate.sourceVersion,
      });
    }

    await tx.organizationImportReceipt.upsert({
      where,
      create: {
        source: plan.source,
        entity: candidate.entity,
        sourceId: candidate.sourceId,
        payloadHash: candidate.payloadHash,
        sourceVersion: candidate.sourceVersion,
      },
      update: {
        payloadHash: candidate.payloadHash,
        sourceVersion: candidate.sourceVersion,
      },
    });
    return "applied" as const;
  });
}

export async function applyOrganizationImport(
  prisma: any,
  plan: OrganizationImportPlan
) {
  const sync = new OrganizationSyncService();
  const localUsers = new Map<string, boolean>();
  const summary = {
    applied: 0,
    skipped: 0,
    quarantined: plan.quarantined.length,
  };
  for (const candidate of [
    ...plan.users,
    ...plan.units,
    ...plan.departments,
    ...plan.members,
  ]) {
    const result = await applyCandidate(
      prisma,
      plan,
      candidate,
      sync,
      localUsers
    );
    summary[result] += 1;
  }
  summary.quarantined = plan.quarantined.length;
  return summary;
}

function report(
  plan: OrganizationImportPlan,
  mode: "dry-run" | "apply",
  summary?: { applied: number; skipped: number; quarantined: number }
) {
  return {
    mode,
    source: plan.source,
    candidates: {
      users: plan.users.length,
      units: plan.units.length,
      departments: plan.departments.length,
      departmentMembers: plan.members.length,
    },
    summary: summary ?? {
      applied: 0,
      skipped: 0,
      quarantined: plan.quarantined.length,
    },
    quarantined: plan.quarantined,
    ignored: plan.ignored,
  };
}

async function main() {
  const args = parseImportArguments(process.argv.slice(2));
  const input = JSON.parse(await readFile(args.inputPath, "utf8")) as unknown;
  const plan = buildOrganizationImportPlan(input);
  if (!args.apply) {
    console.log(JSON.stringify(report(plan, "dry-run"), null, 2));
    return;
  }
  const { PrismaClient } = await import("../src/generated/prisma");
  const prisma = new PrismaClient();
  try {
    console.log(
      JSON.stringify(
        report(plan, "apply", await applyOrganizationImport(prisma, plan)),
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
