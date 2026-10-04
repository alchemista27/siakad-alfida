
import { z } from 'zod';
import { KPIIndicatorType, KPIDirection, KPIUpdateFrequency, BaselineStatus } from '@sim/database';

export const CreateExecutionKPISchema = z.object({
  programId: z.string().uuid(),
  name: z.string().min(1),
  indicatorType: z.nativeEnum(KPIIndicatorType),
  direction: z.nativeEnum(KPIDirection).optional(),
  baseline: z.number().optional(),
  baselineStatus: z.nativeEnum(BaselineStatus).optional(),
  target: z.number().optional(),
  realization: z.number().optional(),
  unit: z.string().min(1),
  weight: z.number().min(0).max(100).optional(),
  dataSource: z.string().optional().nullable(),
  updateFrequency: z.nativeEnum(KPIUpdateFrequency).optional(),
  picId: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export const UpdateExecutionKPISchema = CreateExecutionKPISchema.partial();

export const SubmitBaselineSchema = z.object({
  evidenceId: z.string().uuid(),
});

export const VerifyBaselineSchema = z.object({
  status: z.nativeEnum(BaselineStatus),
  notes: z.string().optional().nullable(),
});

export type CreateExecutionKPIDto = z.infer<typeof CreateExecutionKPISchema>;
export type UpdateExecutionKPIDto = z.infer<typeof UpdateExecutionKPISchema>;
export type SubmitBaselineDto = z.infer<typeof SubmitBaselineSchema>;
export type VerifyBaselineDto = z.infer<typeof VerifyBaselineSchema>;
