import { z } from "zod";

export const YmqEmployeeProjectionPayloadSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().trim().min(1).max(200),
  email: z.string().email().max(255),
  unitId: z.string().uuid(),
  unitName: z.string().trim().min(1).max(150),
  isActive: z.boolean(),
  sourceUpdatedAt: z.string().datetime(),
}).strict();

export const YmqEmployeeProjectionListSchema = z.object({
  employees: z.array(YmqEmployeeProjectionPayloadSchema),
}).strict();

export type YmqEmployeeProjectionPayload = z.infer<typeof YmqEmployeeProjectionPayloadSchema>;
export type YmqEmployeeProjectionList = z.infer<typeof YmqEmployeeProjectionListSchema>;
