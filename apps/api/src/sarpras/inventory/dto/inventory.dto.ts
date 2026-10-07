import { z } from 'zod';

export const CreateInventorySchema = z.object({
  code: z.string().optional().nullable(),
  name: z.string().min(1, 'Nama inventaris wajib diisi'),
  category: z.string().min(1, 'Kategori wajib diisi'),
  quantity: z.number().int().min(1).default(1),
  unitOfMeasure: z.string().default('unit'),
  condition: z.enum(['baik', 'rusak_ringan', 'rusak_berat']).default('baik'),
  location: z.string().optional().nullable(),
  departmentId: z.string().uuid().optional().nullable(),
  unitId: z.string().uuid().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  purchasePrice: z.number().optional().nullable(),
  sourceOfFund: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const UpdateInventorySchema = CreateInventorySchema.partial();

export type CreateInventoryDto = z.infer<typeof CreateInventorySchema>;
export type UpdateInventoryDto = z.infer<typeof UpdateInventorySchema>;
