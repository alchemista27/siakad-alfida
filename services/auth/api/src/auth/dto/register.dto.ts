import { z } from "zod";

export const RegisterParentSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon/WA minimal 8 digit"),
  password: z.string().min(8, "Password minimal 8 karakter"),
});

export type RegisterParentDto = z.infer<typeof RegisterParentSchema>;

export const RegisterStaffSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Format email tidak valid"),
  phone: z.string().min(8, "Nomor telepon/WA minimal 8 digit"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["guru", "karyawan"]),
  unitId: z.string().uuid("Unit kerja tidak valid"),
});

export type RegisterStaffDto = z.infer<typeof RegisterStaffSchema>;
