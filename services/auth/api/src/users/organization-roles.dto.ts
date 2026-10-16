import { BadRequestException } from "@nestjs/common";
import { IsIn, IsUUID } from "class-validator";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type DepartmentOrganizationRoleInput = {
  userId: string;
  scope: "department";
  departmentId: string;
  app: "simakin";
  role: "admin_bidang" | "admin_biro";
};

type UnitOrganizationRoleInput =
  | {
      userId: string;
      scope: "unit";
      unitId: string;
      app: "simpeg";
      role: "admin_unit" | "admin_unit_nondik";
    }
  | {
      userId: string;
      scope: "unit";
      unitId: string;
      app: "siakad" | "spmb";
      role: "admin_unit";
    };

export type OrganizationRoleInput = DepartmentOrganizationRoleInput | UnitOrganizationRoleInput;

function hasOnlyKeys(input: Record<string, unknown>, keys: string[]) {
  return Object.keys(input).every((key) => keys.includes(key));
}

export function validateOrganizationRoleInput(value: unknown): OrganizationRoleInput {
  if (!value || typeof value !== "object") {
    throw new BadRequestException("Payload peran organisasi tidak valid.");
  }

  const input = value as Record<string, unknown>;
  if (typeof input.userId !== "string" || !UUID.test(input.userId) || typeof input.scope !== "string") {
    throw new BadRequestException("Pengguna dan scope peran organisasi harus berupa UUID yang valid.");
  }

  if (input.scope === "department") {
    if (
      !hasOnlyKeys(input, ["userId", "scope", "departmentId", "app", "role"])
      || typeof input.departmentId !== "string"
      || !UUID.test(input.departmentId)
      || input.app !== "simakin"
      || (input.role !== "admin_bidang" && input.role !== "admin_biro")
    ) {
      throw new BadRequestException("Peran department tidak didukung.");
    }
    return {
      userId: input.userId,
      scope: "department",
      departmentId: input.departmentId,
      app: "simakin",
      role: input.role,
    };
  }

  if (input.scope === "unit") {
    if (
      !hasOnlyKeys(input, ["userId", "scope", "unitId", "app", "role"])
      || typeof input.unitId !== "string"
      || !UUID.test(input.unitId)
      || (input.app !== "simpeg" && input.app !== "siakad" && input.app !== "spmb")
      || (input.role !== "admin_unit" && input.role !== "admin_unit_nondik")
      || ((input.app === "siakad" || input.app === "spmb") && input.role !== "admin_unit")
    ) {
      throw new BadRequestException("Peran unit tidak didukung.");
    }
    return input.app === "simpeg"
      ? {
          userId: input.userId,
          scope: "unit",
          unitId: input.unitId,
          app: input.app,
          role: input.role,
        }
      : {
          userId: input.userId,
          scope: "unit",
          unitId: input.unitId,
          app: input.app,
          role: "admin_unit",
        };
  }

  throw new BadRequestException("Scope peran organisasi tidak didukung.");
}

/**
 * Legacy browser payload retained for the current SIMAKIN department-admin flow.
 */
export class UpsertOrganizationRoleDto {
  @IsUUID()
  userId!: string;

  @IsUUID()
  departmentId!: string;

  @IsIn(["admin_bidang"])
  role!: "admin_bidang";
}

export function validatePublicOrganizationRoleInput(value: unknown): OrganizationRoleInput {
  if (
    value
    && typeof value === "object"
    && !("scope" in value)
  ) {
    const legacy = value as Record<string, unknown>;
    return validateOrganizationRoleInput({
      userId: legacy.userId,
      scope: "department",
      departmentId: legacy.departmentId,
      app: "simakin",
      role: legacy.role,
    });
  }

  const input = validateOrganizationRoleInput(value);
  if (input.scope === "department" && input.role !== "admin_bidang") {
    throw new BadRequestException("Peran admin_biro hanya tersedia untuk layanan internal.");
  }
  return input;
}
