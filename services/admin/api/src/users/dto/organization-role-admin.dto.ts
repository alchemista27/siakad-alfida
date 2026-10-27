import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export const DepartmentOrganizationRoleSchema = z.object({
  scope: z.literal("department"),
  departmentId: z.string().uuid(),
}).strict();

export const UnitOrganizationRoleSchema = z.object({
  scope: z.literal("unit"),
  unitId: z.string().uuid(),
  app: z.string().min(1),
  role: z.string().optional(),
}).strict();

export const OrganizationRoleAdminSchema = z.discriminatedUnion("scope", [
  DepartmentOrganizationRoleSchema,
  UnitOrganizationRoleSchema,
]);

export type OrganizationRoleAdminDto = z.infer<typeof OrganizationRoleAdminSchema>;

export function parseOrganizationRoleAdminDto(input: unknown): OrganizationRoleAdminDto {
  const parsed = OrganizationRoleAdminSchema.safeParse(input);
  if (!parsed.success) {
    throw new BadRequestException({
      message: "Payload peran organisasi tidak valid.",
      errors: parsed.error.flatten(),
    });
  }
  return parsed.data;
}
