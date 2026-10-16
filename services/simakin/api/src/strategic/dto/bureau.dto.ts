import { z } from "zod";

export const CreateBureauSchema = z.object({
  name: z.string().trim().min(3).max(100),
  code: z.string().trim().min(2).max(50),
  description: z.string().trim().max(2000).nullable().optional(),
  adminUserId: z.string().uuid(),
});
export type CreateBureauDto = z.infer<typeof CreateBureauSchema>;
