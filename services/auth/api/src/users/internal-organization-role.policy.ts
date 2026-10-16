import { BadRequestException } from "@nestjs/common";
import { OrganizationRoleInput, validateOrganizationRoleInput } from "./organization-roles.dto";

export type InternalOrganizationRoleInput = Extract<OrganizationRoleInput, { scope: "department" }>;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateInternalOrganizationRoleInput(value: unknown): InternalOrganizationRoleInput {
  if (!value || typeof value !== "object") throw new BadRequestException("Payload peran organisasi tidak valid.");
  const input = value as Record<string, unknown>;
  if (
    typeof input.userId !== "string"
    || !UUID.test(input.userId)
    || typeof input.departmentId !== "string"
    || !UUID.test(input.departmentId)
    || input.role !== "admin_biro"
  ) {
    throw new BadRequestException("Hanya scope UUID dan peran admin_biro yang diizinkan.");
  }
  return validateOrganizationRoleInput({
    userId: input.userId,
    scope: "department",
    departmentId: input.departmentId,
    app: "simakin",
    role: "admin_biro",
  }) as InternalOrganizationRoleInput;
}
