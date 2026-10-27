import { BadRequestException } from "@nestjs/common";

export const YMQ_BROKER_MANAGED_ROLES = [
  "admin_ymq",
  "peserta",
  "pembina_ymq",
  "admin_kelompok",
  "pengawas",
  "pimpinan",
] as const;
export type YmqBrokerManagedRole = (typeof YMQ_BROKER_MANAGED_ROLES)[number];

export type YmqRoleBrokerAssignInput = {
  actorUserId: string;
  userId: string;
  role: YmqBrokerManagedRole;
};

export type YmqRoleBrokerRevokeInput = {
  actorUserId: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function assertRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new BadRequestException("Payload broker peran YMQ tidak valid.");
  }
  return value as Record<string, unknown>;
}

function assertOnlyKeys(input: Record<string, unknown>, keys: readonly string[]) {
  if (Object.keys(input).length !== keys.length || Object.keys(input).some((key) => !keys.includes(key))) {
    throw new BadRequestException("Payload broker peran YMQ tidak valid.");
  }
}

function assertUuid(value: unknown, field: string): asserts value is string {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    throw new BadRequestException(`${field} harus berupa UUID yang valid.`);
  }
}

export function validateYmqBrokerManagedRole(value: unknown): YmqBrokerManagedRole {
  if (typeof value !== "string" || !(YMQ_BROKER_MANAGED_ROLES as readonly string[]).includes(value)) {
    throw new BadRequestException("Peran YMQ tidak dapat dikelola oleh broker ini.");
  }
  return value as YmqBrokerManagedRole;
}

export function validateYmqRoleBrokerAssignInput(value: unknown): YmqRoleBrokerAssignInput {
  const input = assertRecord(value);
  assertOnlyKeys(input, ["actorUserId", "userId", "role"]);
  assertUuid(input.actorUserId, "actorUserId");
  assertUuid(input.userId, "userId");
  return {
    actorUserId: input.actorUserId,
    userId: input.userId,
    role: validateYmqBrokerManagedRole(input.role),
  };
}

export function validateYmqRoleBrokerRevokeInput(value: unknown): YmqRoleBrokerRevokeInput {
  const input = assertRecord(value);
  assertOnlyKeys(input, ["actorUserId"]);
  assertUuid(input.actorUserId, "actorUserId");
  return { actorUserId: input.actorUserId };
}

export function validateYmqRoleBrokerUserId(value: unknown): string {
  assertUuid(value, "userId");
  return value;
}
