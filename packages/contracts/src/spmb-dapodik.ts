import { z } from "zod";

export const EducationLevelSchema = z.enum(["tk", "sd", "smp", "sma"]);
export type EducationLevel = z.infer<typeof EducationLevelSchema>;

export const TkGroupSchema = z.enum(["a", "b"]);
export type TkGroup = z.infer<typeof TkGroupSchema>;

export const ResidenceStatusSchema = z.enum([
  "with_parents",
  "with_guardian",
  "boarding",
  "rented",
  "other",
]);
export type ResidenceStatus = z.infer<typeof ResidenceStatusSchema>;

export const ImmunizationStatusSchema = z.enum(["complete", "incomplete", "unknown"]);
export type ImmunizationStatus = z.infer<typeof ImmunizationStatusSchema>;

const OptionalString = z.string().trim().max(200).optional().or(z.literal(""));

export const DapodikAddressSchema = z.object({
  streetAddress: z.string().trim().min(5, "Alamat jalan wajib diisi").max(500),
  rt: z.string().trim().regex(/^\d{1,3}$/, "RT harus 1-3 digit"),
  rw: z.string().trim().regex(/^\d{1,3}$/, "RW harus 1-3 digit"),
  hamlet: z.string().trim().max(100).optional().or(z.literal("")),
  village: z.string().trim().min(2, "Kelurahan/desa wajib diisi").max(100),
  subdistrict: z.string().trim().min(2, "Kecamatan wajib diisi").max(100),
  city: z.string().trim().min(2, "Kabupaten/kota wajib diisi").max(100),
  province: z.string().trim().min(2, "Provinsi wajib diisi").max(100),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Kode pos harus 5 digit"),
  residenceStatus: ResidenceStatusSchema,
});

export const DapodikStudentFieldsSchema = DapodikAddressSchema.extend({
  nik: z.string().regex(/^\d{16}$/, "NIK murid harus 16 digit"),
  birthCertificateNumber: z.string().trim().min(3, "Nomor akta kelahiran wajib diisi").max(100),
  familyCardNumber: z.string().regex(/^\d{16}$/, "Nomor KK harus 16 digit"),
  specialNeeds: OptionalString,
  pipEligible: z.boolean().default(false),
  kipNumber: z.string().trim().max(100).optional().or(z.literal("")),
  previousSchoolName: OptionalString,
  previousSchoolNpsn: z.string().trim().regex(/^\d{8}$/, "NPSN harus 8 digit").optional().or(z.literal("")),
  graduationDocumentNumber: OptionalString,
  graduationYear: z.coerce.number().int().min(1900).max(2100).optional(),
  tkGroup: TkGroupSchema.optional(),
});

export type DapodikStudentFields = z.infer<typeof DapodikStudentFieldsSchema>;

export const TkHealthFieldsSchema = z.object({
  heightCm: z.coerce.number().positive("Tinggi badan harus lebih dari 0").max(250),
  weightKg: z.coerce.number().positive("Berat badan harus lebih dari 0").max(300),
  headCircumferenceCm: z.coerce.number().positive("Lingkar kepala harus lebih dari 0").max(100),
  immunizationStatus: ImmunizationStatusSchema,
});

export type TkHealthFields = z.infer<typeof TkHealthFieldsSchema>;

export const REQUIRED_DOCUMENT_TYPES_BY_LEVEL: Record<EducationLevel, readonly string[]> = {
  tk: ["photo", "birth_certificate", "family_card", "father_id", "mother_id"],
  sd: ["photo", "birth_certificate", "family_card", "father_id", "mother_id"],
  smp: ["photo", "birth_certificate", "family_card", "father_id", "mother_id", "school_certificate"],
  sma: ["photo", "birth_certificate", "family_card", "father_id", "mother_id", "school_certificate"],
};

export function requiredDocumentTypesForLevel(level: EducationLevel): readonly string[] {
  return REQUIRED_DOCUMENT_TYPES_BY_LEVEL[level];
}

export function requiresPriorSchool(level: EducationLevel) {
  return level === "smp" || level === "sma";
}

export function requiresTkHealth(level: EducationLevel) {
  return level === "tk";
}

export function requiresGuardian(residenceStatus: ResidenceStatus | null | undefined) {
  return residenceStatus === "with_guardian";
}

export function assertLevelSpecificStudentFields(level: EducationLevel, input: DapodikStudentFields) {
  if (level === "tk" && !input.tkGroup) {
    throw new Error("Kelompok TK A atau B wajib dipilih oleh orang tua.");
  }
  if (level !== "tk" && input.tkGroup) {
    throw new Error("Kelompok TK hanya boleh diisi untuk pendaftaran TK.");
  }
  if (requiresPriorSchool(level) && (!input.previousSchoolName || !input.previousSchoolNpsn || !input.graduationDocumentNumber || !input.graduationYear)) {
    throw new Error("Data sekolah asal dan dokumen kelulusan wajib untuk SMP/SMA.");
  }
  if (input.pipEligible && !input.kipNumber) {
    throw new Error("Nomor KIP wajib diisi bila murid dinyatakan layak PIP.");
  }
}
