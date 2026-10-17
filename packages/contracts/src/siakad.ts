import { z } from "zod";

export const SIAKAD_ROLES = [
  "admin_unit",
  "guru",
  "wali_kelas",
  "supervisor_kesiswaan",
  "orang_tua",
] as const;

export type SiakadRole = (typeof SIAKAD_ROLES)[number];

export const AcademicYearStatusSchema = z.enum(["draft", "active", "closed"]);
export type AcademicYearStatus = z.infer<typeof AcademicYearStatusSchema>;

export const AcademicYearDtoSchema = z.object({
  name: z.string().min(1),
  unitId: z.string().uuid(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: AcademicYearStatusSchema.default("draft"),
});
export type AcademicYearDto = z.infer<typeof AcademicYearDtoSchema>;

export const EnrollmentStatusSchema = z.enum([
  "pending_placement",
  "active",
  "promoted",
  "graduated",
  "withdrawn",
]);
export type EnrollmentStatus = z.infer<typeof EnrollmentStatusSchema>;

export const SiakadAdmissionHandoffPayloadSchema = z.object({
  spmbRegistrationId: z.string().uuid(),
  registrationNumber: z.string().min(1),
  unitId: z.string().uuid(),
  academicYearId: z.string().uuid(),
  student: z.object({
    fullName: z.string().min(1),
    gender: z.enum(["male", "female"]),
    birthPlace: z.string().min(1),
    birthDate: z.string(),
    address: z.string().min(1),
  }),
  parent: z.object({
    userId: z.string().uuid(),
    fullName: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }),
  idempotencyKey: z.string().min(1),
});
export type SiakadAdmissionHandoffPayload = z.infer<typeof SiakadAdmissionHandoffPayloadSchema>;
