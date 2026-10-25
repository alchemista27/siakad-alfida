import { z } from "zod";

export const GenderSchema = z.enum(["male", "female"]);

export const StudentRegistrationFormSchema = z.object({
  fullName: z.string().trim().min(3, "Nama lengkap minimal 3 karakter"),
  nickname: z.string().trim().min(2, "Nama panggilan minimal 2 karakter"),
  gender: GenderSchema,
  religion: z.string().trim().min(1, "Agama wajib diisi"),
  birthPlace: z.string().trim().min(3, "Tempat lahir wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  nisn: z.string().trim().max(20).optional().or(z.literal("")),
  siblingsCount: z.coerce.number().int().min(0, "Jumlah saudara tidak boleh negatif"),
  address: z.string().trim().min(10, "Alamat lengkap wajib diisi"),
  transportation: z.string().trim().min(1, "Transportasi wajib diisi"),
});

export const ParentIdentityFormSchema = z.object({
  fullName: z.string().trim().min(3, "Nama wajib diisi"),
  nik: z.string().regex(/^\d{16}$/, "NIK harus 16 digit angka"),
  birthPlace: z.string().trim().min(3, "Tempat lahir wajib diisi"),
  birthDate: z.string().min(1, "Tanggal lahir wajib diisi"),
  education: z.string().trim().min(2, "Pendidikan terakhir wajib diisi"),
  occupation: z.string().trim().min(2, "Pekerjaan wajib diisi"),
  incomeRange: z.string().trim().min(1, "Rentang penghasilan wajib diisi"),
  phone: z.string().trim().min(10, "Nomor HP tidak valid"),
  address: z.string().trim().min(10, "Alamat wajib diisi"),
});

export const ParentRegistrationFormSchema = z.object({
  father: ParentIdentityFormSchema,
  mother: ParentIdentityFormSchema,
});

export const CreateSpmbDraftSchema = z.object({
  periodId: z.string().uuid("periodId wajib UUID"),
});

export type StudentRegistrationForm = z.infer<typeof StudentRegistrationFormSchema>;
export type ParentIdentityForm = z.infer<typeof ParentIdentityFormSchema>;
export type ParentRegistrationForm = z.infer<typeof ParentRegistrationFormSchema>;

export function isStudentRegistrationComplete(value: unknown): value is StudentRegistrationForm {
  if (!value || typeof value !== "object") return false;
  const student = value as Record<string, unknown>;
  const birthDate = student.birthDate;
  return StudentRegistrationFormSchema.safeParse({
    ...student,
    birthDate: birthDate instanceof Date ? birthDate.toISOString().slice(0, 10) : birthDate,
  }).success;
}
