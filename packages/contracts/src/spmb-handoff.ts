import { z } from "zod";

export const SpmbHandoffPayloadSchema = z.object({
  idempotencyKey: z.string().uuid(),
  spmbRegistrationId: z.string().uuid(),
  registrationNumber: z.string().min(1),
  sourceAcademicYearId: z.string().uuid(),
  unitId: z.string().uuid(),
  parent: z.object({
    id: z.string().uuid(),
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().nullable(),
  }),
  student: z.object({
    fullName: z.string().min(1),
    gender: z.enum(["male", "female"]),
    birthPlace: z.string().min(1),
    birthDate: z.string().datetime(),
    nisn: z.string().nullable(),
    address: z.string().min(1),
  }),
});

export type SpmbHandoffPayload = z.infer<typeof SpmbHandoffPayloadSchema>;

export const SpmbHandoffReceiptSchema = z.object({
  receiptId: z.string().min(1),
  sourceRegistrationId: z.string().uuid(),
  destinationEnrollmentId: z.string().uuid(),
  status: z.enum(["accepted", "enrolled"]),
});

export type SpmbHandoffReceipt = z.infer<typeof SpmbHandoffReceiptSchema>;
