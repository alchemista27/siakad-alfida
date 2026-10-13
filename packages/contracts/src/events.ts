import { z } from "zod";

export const EventEnvelopeSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  version: z.number().int().positive(),
  source: z.string(),
  occurredAt: z.string().datetime(),
  actorId: z.string().uuid().nullable().optional(),
  payload: z.record(z.unknown()),
});

export type EventEnvelope = z.infer<typeof EventEnvelopeSchema>;

export const IdentityUserCreatedPayloadSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email(),
  fullName: z.string(),
  username: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean(),
});

export type IdentityUserCreatedPayload = z.infer<typeof IdentityUserCreatedPayloadSchema>;

export const IdentityRoleAssignedPayloadSchema = z.object({
  userId: z.string().uuid(),
  app: z.string(),
  role: z.string(),
  unitId: z.string().uuid().nullable().optional(),
  departmentId: z.string().uuid().nullable().optional(),
});

export type IdentityRoleAssignedPayload = z.infer<typeof IdentityRoleAssignedPayloadSchema>;
