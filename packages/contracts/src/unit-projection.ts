import { z } from "zod";

export const UnitProjectionPayloadSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  slug: z.string().regex(/^unit-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
  status: z.enum(["active", "archived"]),
  category: z.enum(["pendidikan", "nondik"]),
  sourceUpdatedAt: z.string().datetime(),
}).strict();

export type UnitProjectionPayload = z.infer<typeof UnitProjectionPayloadSchema>;
