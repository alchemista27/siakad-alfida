import { z } from "zod";

/** Mirrors the strict shared YmqEmployeeProjectionSchema at the service boundary. */
export const LocalYmqEmployeeProjectionSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  unitId: z.string().uuid().nullable(),
  unitName: z.string().min(1).max(150).nullable(),
  isActive: z.boolean(),
  sourceUpdatedAt: z.string().datetime(),
}).strict();

export type YmqEmployeeProjection = z.infer<typeof LocalYmqEmployeeProjectionSchema>;

export function mapYmqEmployeeProjection(input: unknown): YmqEmployeeProjection {
  return LocalYmqEmployeeProjectionSchema.parse(input);
}

export function shouldApplyEmployeeProjection(
  existingSourceUpdatedAt: Date | null | undefined,
  incomingSourceUpdatedAt: string,
): boolean {
  return !existingSourceUpdatedAt || new Date(incomingSourceUpdatedAt).getTime() > existingSourceUpdatedAt.getTime();
}
