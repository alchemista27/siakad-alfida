import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export const OrganizationRoleAdminSchema = z.object({
  scope: z.literal("department"),
  departmentId: z.string().uuid(),
}).strict();

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
