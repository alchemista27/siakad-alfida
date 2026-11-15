import { z } from "zod";

export const SPMB_HANDOFF_CONTRACT_VERSION = 2 as const;

const NullableStringSchema = z.string().nullable();

export const SpmbGuardianPayloadSchema = z.object({
  type: z.enum(["father", "mother", "guardian"]),
  fullName: z.string().min(1),
  nik: NullableStringSchema,
  birthPlace: NullableStringSchema,
  birthDate: z.string().datetime().nullable(),
  education: NullableStringSchema,
  occupation: NullableStringSchema,
  phone: NullableStringSchema,
  incomeRange: NullableStringSchema,
  address: NullableStringSchema,
});

export const SpmbDapodikProfileSchema = z.object({
  nik: NullableStringSchema,
  birthCertificateNumber: NullableStringSchema,
  familyCardNumber: NullableStringSchema,
  streetAddress: NullableStringSchema,
  rt: NullableStringSchema,
  rw: NullableStringSchema,
  hamlet: NullableStringSchema,
  village: NullableStringSchema,
  subdistrict: NullableStringSchema,
  city: NullableStringSchema,
  province: NullableStringSchema,
  postalCode: NullableStringSchema,
  residenceStatus: z.enum(["with_parents", "with_guardian", "boarding", "rented", "other"]).nullable(),
  specialNeeds: NullableStringSchema,
  pipEligible: z.boolean().nullable(),
  kipNumber: NullableStringSchema,
  previousSchoolName: NullableStringSchema,
  previousSchoolNpsn: NullableStringSchema,
  graduationDocumentNumber: NullableStringSchema,
  graduationYear: z.number().int().nullable(),
  heightCm: z.number().positive().nullable(),
  weightKg: z.number().positive().nullable(),
  headCircumferenceCm: z.number().positive().nullable(),
  immunizationStatus: z.enum(["complete", "incomplete", "unknown"]).nullable(),
});

export const SpmbHandoffPayloadSchema = z.object({
  contractVersion: z.literal(SPMB_HANDOFF_CONTRACT_VERSION),
  idempotencyKey: z.string().uuid(),
  spmbRegistrationId: z.string().uuid(),
  registrationNumber: z.string().min(1),
  sourceAcademicYearId: z.string().uuid(),
  unitId: z.string().uuid(),
  portalParent: z.object({
    id: z.string().uuid(),
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().nullable(),
  }),
  guardians: z.array(SpmbGuardianPayloadSchema),
  student: z.object({
    fullName: z.string().min(1),
    nickname: z.string().nullable(),
    gender: z.enum(["male", "female"]),
    religion: z.string().nullable(),
    birthPlace: z.string().min(1),
    birthDate: z.string().datetime(),
    nisn: z.string().nullable(),
    address: z.string().min(1),
    siblingsCount: z.number().int().nonnegative().nullable(),
    transportation: z.string().nullable(),
    hobby: z.string().nullable(),
    ambition: z.string().nullable(),
    dapodik: SpmbDapodikProfileSchema.nullable(),
  }),
});

export type SpmbHandoffPayload = z.infer<typeof SpmbHandoffPayloadSchema>;
export type SpmbGuardianPayload = z.infer<typeof SpmbGuardianPayloadSchema>;
export type SpmbDapodikProfile = z.infer<typeof SpmbDapodikProfileSchema>;

export const SpmbHandoffReceiptSchema = z.object({
  receiptId: z.string().uuid(),
  sourceRegistrationId: z.string().uuid(),
  destinationEnrollmentId: z.string().uuid(),
  status: z.literal("accepted"),
});

export type SpmbHandoffReceipt = z.infer<typeof SpmbHandoffReceiptSchema>;

export const SpmbEnrollmentConfirmationSchema = z.object({
  confirmationId: z.string().min(1),
  receiptId: z.string().uuid(),
  sourceRegistrationId: z.string().uuid(),
  destinationEnrollmentId: z.string().uuid(),
  status: z.literal("enrolled"),
});

export type SpmbEnrollmentConfirmation = z.infer<typeof SpmbEnrollmentConfirmationSchema>;
