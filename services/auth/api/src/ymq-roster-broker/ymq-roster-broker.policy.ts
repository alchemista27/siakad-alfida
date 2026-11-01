import { BadRequestException } from "@nestjs/common";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROSTER_VERSION = "ymq-2026-2027";
const MAX_ACCOUNTS = 500;

export type YmqRosterAssignment =
  | { app: "simpeg"; role: "pegawai"; unitId: string }
  | { app: "simpeg"; role: "pimpinan"; unitId: null }
  | { app: "siyaum"; role: "peserta" | "pembina_ymq" | "admin_ymq"; unitId: null };

export type YmqRosterAccountInput = {
  sourceKey: string;
  fullName: string;
  email: string;
  assignments: YmqRosterAssignment[];
};

export type YmqRosterPreviewInput = {
  actorUserId: string;
  rosterVersion: typeof ROSTER_VERSION;
  accounts: YmqRosterAccountInput[];
};

export type YmqRosterProvisionInput = YmqRosterPreviewInput & {
  initialPassword: string;
};

function invalidPayload(): never {
  throw new BadRequestException("Payload roster YMQ tidak valid.");
}

function assertRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalidPayload();
  return value as Record<string, unknown>;
}

function assertOnlyKeys(value: Record<string, unknown>, expected: readonly string[]) {
  const keys = Object.keys(value);
  if (keys.length !== expected.length || keys.some((key) => !expected.includes(key))) invalidPayload();
}

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new BadRequestException(`${field} harus berupa UUID yang valid.`);
  }
}

function readNonEmptyString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string") invalidPayload();
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) {
    throw new BadRequestException(`${field} tidak valid.`);
  }
  return normalized;
}

function validateAssignment(value: unknown): YmqRosterAssignment {
  const assignment = assertRecord(value);
  assertOnlyKeys(assignment, ["app", "role", "unitId"]);

  if (assignment.app === "simpeg" && assignment.role === "pegawai") {
    assertUuid(assignment.unitId, "unitId");
    return { app: "simpeg", role: "pegawai", unitId: assignment.unitId };
  }
  if (assignment.app === "simpeg" && assignment.role === "pimpinan" && assignment.unitId === null) {
    return { app: "simpeg", role: "pimpinan", unitId: null };
  }
  if (assignment.app === "siyaum"
    && ["peserta", "pembina_ymq", "admin_ymq"].includes(assignment.role as string)
    && assignment.unitId === null) {
    return {
      app: "siyaum",
      role: assignment.role as "peserta" | "pembina_ymq" | "admin_ymq",
      unitId: null,
    };
  }
  invalidPayload();
}

function validateAccount(value: unknown): YmqRosterAccountInput {
  const account = assertRecord(value);
  assertOnlyKeys(account, ["sourceKey", "fullName", "email", "assignments"]);
  const email = readNonEmptyString(account.email, "email", 255).toLowerCase();
  if (!EMAIL_PATTERN.test(email)) throw new BadRequestException("email tidak valid.");
  if (!Array.isArray(account.assignments) || account.assignments.length === 0) invalidPayload();
  return {
    sourceKey: readNonEmptyString(account.sourceKey, "sourceKey", 200),
    fullName: readNonEmptyString(account.fullName, "fullName", 200),
    email,
    assignments: account.assignments.map(validateAssignment),
  };
}

function validateBase(value: unknown): YmqRosterPreviewInput {
  const input = assertRecord(value);
  assertOnlyKeys(input, ["actorUserId", "rosterVersion", "accounts"]);
  assertUuid(input.actorUserId, "actorUserId");
  if (input.rosterVersion !== ROSTER_VERSION) invalidPayload();
  if (!Array.isArray(input.accounts) || input.accounts.length > MAX_ACCOUNTS) invalidPayload();
  return {
    actorUserId: input.actorUserId,
    rosterVersion: ROSTER_VERSION,
    accounts: input.accounts.map(validateAccount),
  };
}

export function validateYmqRosterPreviewInput(value: unknown): YmqRosterPreviewInput {
  return validateBase(value);
}

export function validateYmqRosterProvisionInput(value: unknown): YmqRosterProvisionInput {
  const input = assertRecord(value);
  assertOnlyKeys(input, ["actorUserId", "rosterVersion", "accounts", "initialPassword"]);
  const { initialPassword } = input;
  const preview = validateBase({
    actorUserId: input.actorUserId,
    rosterVersion: input.rosterVersion,
    accounts: input.accounts,
  });
  return {
    ...preview,
    initialPassword: readNonEmptyString(initialPassword, "initialPassword", 1024),
  };
}
